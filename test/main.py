import os, re, math, secrets
from typing import Tuple, List, Optional
import fitz
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
try:
    import win32print  # type: ignore
    import win32api  # type: ignore
except Exception:
    win32print = None  # Windows-only; endpoints will guard if unavailable
    win32api = None
from models import PrinterInfo, PrinterCaps

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
PREVIEW_DIR = os.path.join(BASE_DIR, 'previews')
EXPORT_DIR = os.path.join(BASE_DIR, 'exports')
for d in (UPLOAD_DIR, PREVIEW_DIR, EXPORT_DIR): os.makedirs(d, exist_ok=True)
SPOOL_DIR = os.path.join(BASE_DIR, 'spool'); os.makedirs(SPOOL_DIR, exist_ok=True)
ALLOWED_EXT = {'.pdf'}

def sanitize_filename(name: str) -> str:
    name = os.path.basename(name or ''); name = re.sub(r"[^A-Za-z0-9_.-]", "_", name); name = name.strip("._") or "file"; return name

def _ensure_pdf(upload: UploadFile) -> str:
    fn = sanitize_filename(upload.filename or '')
    if not fn: raise HTTPException(400, 'No file name')
    if os.path.splitext(fn)[1].lower() not in ALLOWED_EXT: raise HTTPException(400, 'Only PDF files are allowed')
    token = secrets.token_hex(8); stored = f"{os.path.splitext(fn)[0]}_{token}.pdf"; path = os.path.join(UPLOAD_DIR, stored)
    with open(path, 'wb') as fp: fp.write(upload.file.read())
    return stored

def _auto_orientation(n_up: int, requested: str | None = None) -> str:
    if n_up == 2: return 'landscape'
    if n_up in (4, 9): return 'portrait'
    return requested or 'portrait'

LAYOUTS = {1:(1,1),2:(1,2),4:(2,2),6:(2,3),9:(3,3)}

def page_size_from_name(name: str) -> Tuple[float, float]:
    n = name.lower()
    if n=='a4': return (595.0,842.0)
    if n=='letter': return (612.0,792.0)
    raise ValueError('Unknown page size')

def build_nup_rects(sw: float, sh: float, rows: int, cols: int, margin: float, gap: float, fit: str) -> List[fitz.Rect]:
    aw, ah = sw-2*margin, sh-2*margin
    tw, th = gap*(cols-1), gap*(rows-1)
    cw, ch = (aw-tw)/cols, (ah-th)/rows
    rects=[]
    for r in range(rows):
        for c in range(cols):
            x0=margin+c*(cw+gap); y0=margin+r*(ch+gap); rects.append(fitz.Rect(x0,y0,x0+cw,y0+ch))
    return rects

def compose_nup_pdf(inp: str, outp: str, n_up: int=2, page_size: str='A4', orientation: str='portrait', margin: float=18.0, gap: float=6.0) -> None:
    if n_up not in LAYOUTS: raise ValueError('Unsupported n_up; choose 1, 2, 4, 6, or 9')
    rows, cols = LAYOUTS[n_up]
    sw, sh = page_size_from_name(page_size)
    if orientation=='landscape': sw, sh = sh, sw
    rects = build_nup_rects(sw, sh, rows, cols, margin, gap, fit='shrink')
    src = None
    dst = None
    try:
        src = fitz.open(inp)
        dst = fitz.open()
        pack=len(rects)
        i=0
        total=len(src)
        while i<total:
            page = dst.new_page(width=sw, height=sh)
            for k in range(pack):
                if i+k>=total: break
                page.show_pdf_page(rects[k], src, i+k)
            i += pack
        dst.save(outp, deflate=True, garbage=4, clean=True)
    finally:
        if dst: dst.close()
        if src: src.close()

def render_preview_png(inp: str, n_up: int, page_size: str='A4', orientation: str='portrait', margin: float=18.0, gap: float=6.0, dpi: int=110, sheet_index: int=0) -> bytes:
    rows, cols = LAYOUTS[n_up]; sw, sh = page_size_from_name(page_size)
    if orientation=='landscape': sw, sh = sh, sw
    rects = build_nup_rects(sw, sh, rows, cols, margin, gap, fit='shrink')
    src = None
    dst = None
    try:
        src = fitz.open(inp)
        dst = fitz.open()
        pack=n_up; start=sheet_index*pack
        if start>=len(src): start=max(0,(len(src)-1)//pack)*pack
        page = dst.new_page(width=sw, height=sh)
        for k in range(pack):
            idx=start+k
            if idx>=len(src): break
            page.show_pdf_page(rects[k], src, idx)
        zoom=dpi/72.0
        pix=page.get_pixmap(matrix=fitz.Matrix(zoom,zoom), alpha=False)
        png=pix.tobytes('png')
        return png
    finally:
        if dst: dst.close()
        if src: src.close()

def render_preview_bmp(inp: str, n_up: int, page_size: str='A4', orientation: str='portrait', margin: float=18.0, gap: float=6.0, dpi: int=110, sheet_index: int=0) -> bytes:
    rows, cols = LAYOUTS[n_up]; sw, sh = page_size_from_name(page_size)
    if orientation=='landscape': sw, sh = sh, sw
    rects = build_nup_rects(sw, sh, rows, cols, margin, gap, fit='shrink')
    src = None
    dst = None
    try:
        src = fitz.open(inp)
        dst = fitz.open()
        pack=n_up; start=sheet_index*pack
        if start>=len(src): start=max(0,(len(src)-1)//pack)*pack
        page = dst.new_page(width=sw, height=sh)
        for k in range(pack):
            idx=start+k
            if idx>=len(src): break
            page.show_pdf_page(rects[k], src, idx)
        zoom=dpi/72.0
        pix=page.get_pixmap(matrix=fitz.Matrix(zoom,zoom), alpha=False)
        bmp=pix.tobytes('bmp')
        return bmp
    finally:
        if dst: dst.close()
        if src: src.close()

def _dm_duplex_value(mode: str) -> int:
    return {"simplex": 1, "long": 2, "short": 3}.get((mode or '').lower(), 1)

def _dm_color_value(mode: str) -> int:
    return {"mono": 1, "color": 2}.get((mode or '').lower(), 2)

def list_printers() -> List[PrinterInfo]:
    if not win32print: raise HTTPException(501, 'Printing not available on this platform')
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    printers = win32print.EnumPrinters(flags)
    try:
        default_name = win32print.GetDefaultPrinter()
    except Exception:
        default_name = None
    out: List[PrinterInfo] = []
    for p in printers:
        name = p[2]
        out.append(PrinterInfo(name=name, is_default=(name == default_name)))
    return out

def device_capabilities(printer_name: str) -> PrinterCaps:
    if not win32print: raise HTTPException(501, 'Printing not available on this platform')
    try:
        duplex = win32print.DeviceCapabilities(printer_name, None, win32print.DC_DUPLEX)
        color  = win32print.DeviceCapabilities(printer_name, None, win32print.DC_COLOR)
        papernames = win32print.DeviceCapabilities(printer_name, None, win32print.DC_PAPERNAMES) or []
        paperids   = win32print.DeviceCapabilities(printer_name, None, win32print.DC_PAPERS) or []
        try:
            px = win32print.DeviceCapabilities(printer_name, None, win32print.DC_PHYSICALOFFSETX)
            py = win32print.DeviceCapabilities(printer_name, None, win32print.DC_PHYSICALOFFSETY)
        except Exception:
            px = py = None
        return PrinterCaps(
            duplex_supported=bool(duplex),
            color_supported=bool(color),
            paper_names=[(n or '').strip() for n in papernames],
            paper_ids=paperids,
            phys_offset_x=px, phys_offset_y=py
        )
    except Exception:
        return PrinterCaps(duplex_supported=False, color_supported=False)

def print_pdf_to_printer_raw(printer_name: str, pdf_path: str, copies: int = 1,
                             dm_duplex: int = 1, dm_color: int = 2) -> Tuple[Optional[int], str]:
    if not win32print: return (None, 'printing not available')
    try:
        handle = win32print.OpenPrinter(printer_name)
        try:
            level2 = win32print.GetPrinter(handle, 2)
            devmode = level2.get("pDevMode")
            if devmode is not None:
                devmode.Duplex = dm_duplex
                devmode.Color  = dm_color
        except Exception:
            devmode = None
        with open(pdf_path, 'rb') as f:
            data = f.read()
        job_id = win32print.StartDocPrinter(handle, 1, ("NUpPDFJob", None, "RAW"))
        try:
            for _ in range(max(1, int(copies) if copies else 1)):
                win32print.WritePrinter(handle, data)
        finally:
            win32print.EndDocPrinter(handle)
            win32print.ClosePrinter(handle)
        return (job_id, "queued")
    except Exception as e:
        return (None, f"error: {e}")

def print_pdf_via_shell(printer_name: str, pdf_path: str) -> Tuple[Optional[int], str]:
    # Uses default PDF handler to print; job id not available
    try:
        if win32api:
            win32api.ShellExecute(0, 'printto', pdf_path, f'"{printer_name}"', '.', 0)
            return (None, 'sent')
        else:
            os.startfile(pdf_path, 'print')  # type: ignore[attr-defined]
            return (None, 'sent')
    except Exception as e:
        return (None, f'error: {e}')

app = FastAPI()
app.mount('/static', StaticFiles(directory=os.path.join(BASE_DIR, 'static')), name='static')
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, 'templates'))

@app.get('/', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse('index.html', {"request": request})

@app.post('/upload')
async def upload(file: UploadFile = File(...)):
    try:
        stored = _ensure_pdf(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))
    return JSONResponse({'ok': True, 'file_id': stored})

@app.post('/preview')
async def preview(payload: dict):
    fid = payload.get('file_id'); src = os.path.join(UPLOAD_DIR, fid or '')
    if not os.path.exists(src): raise HTTPException(404, 'File not found')
    try: n_up = int(payload.get('n_up', 2))
    except: raise HTTPException(400, 'Invalid n_up')
    page_size = payload.get('page_size', 'A4'); orientation = _auto_orientation(n_up, payload.get('orientation'))
    try: margin = float(payload.get('margin', 18)); gap = float(payload.get('gap', 6))
    except: raise HTTPException(400, 'Invalid margin/gap')
    try:
        with fitz.open(src) as d: total_pages = len(d)
    except: raise HTTPException(400, 'Unable to read PDF')
    if n_up<=0: raise HTTPException(400, 'Invalid n_up')
    total_sheets = int(math.ceil(total_pages/float(n_up)))
    urls=[]
    for si in range(total_sheets):
        png = render_preview_png(src, n_up, page_size, orientation, margin, gap, 130, si)
        name = f"preview_{secrets.token_hex(6)}.png"; pth = os.path.join(PREVIEW_DIR, name)
        with open(pth,'wb') as fp: fp.write(png)
        urls.append(f'/static-preview/{name}')
    return JSONResponse({'ok': True, 'urls': urls, 'total_sheets': total_sheets})

@app.get('/static-preview/{name}')
async def static_preview(name: str):
    safe = sanitize_filename(name); p = os.path.join(PREVIEW_DIR, safe)
    if not os.path.exists(p): raise HTTPException(404, 'Not found')
    return FileResponse(p, media_type='image/png', filename=safe)

@app.post('/export')
async def export(payload: dict):
    fid = payload.get('file_id'); src = os.path.join(UPLOAD_DIR, fid or '')
    if not os.path.exists(src): raise HTTPException(404, 'File not found')
    try: n_up = int(payload.get('n_up', 2))
    except: raise HTTPException(400, 'Invalid n_up')
    page_size = payload.get('page_size', 'A4'); orientation = _auto_orientation(n_up, payload.get('orientation'))
    try: margin = float(payload.get('margin', 18)); gap = float(payload.get('gap', 6))
    except: raise HTTPException(400, 'Invalid margin/gap')
    out_name = f"nup_{n_up}_{secrets.token_hex(8)}.pdf"; out_path = os.path.join(EXPORT_DIR, out_name)
    compose_nup_pdf(src, out_path, n_up, page_size, orientation, margin, gap)
    return JSONResponse({'ok': True, 'url': f'/download/{out_name}'})

@app.get('/download/{name}')
async def download(name: str):
    safe = sanitize_filename(name); p = os.path.join(EXPORT_DIR, safe)
    if not os.path.exists(p): raise HTTPException(404, 'Not found')
    return FileResponse(p, media_type='application/pdf', filename=safe)

@app.get('/download-temp/{name}')
async def download_temp(name: str):
    safe = sanitize_filename(name); p = os.path.join(SPOOL_DIR, safe)
    if not os.path.exists(p): raise HTTPException(404, 'Not found')
    return FileResponse(p, media_type='application/pdf', filename=safe)

@app.get('/printers')
async def get_printers():
    if not win32print:
        return JSONResponse({'ok': False, 'reason': 'Printing not available on this platform or pywin32 missing'})
    infos = [pi.model_dump() for pi in list_printers()]
    return JSONResponse({'ok': True, 'printers': infos})

@app.get('/printers/{printer_name}/caps')
async def get_printer_caps(printer_name: str):
    if not win32print:
        return JSONResponse({'ok': False, 'reason': 'Printing not available on this platform or pywin32 missing'})
    caps = device_capabilities(printer_name)
    return JSONResponse({'ok': True, 'caps': caps.model_dump()})

@app.post('/print')
async def print_job(payload: dict):
    if not win32print: raise HTTPException(501, 'Printing not available on this platform')
    fid = payload.get('file_id'); fid = os.path.basename(fid or '')
    src = os.path.join(UPLOAD_DIR, fid)
    if not os.path.exists(src): raise HTTPException(404, 'File not found')
    try: n_up = int(payload.get('n_up', 2))
    except: raise HTTPException(400, 'Invalid n_up')
    page_size = payload.get('page_size', 'A4'); orientation = _auto_orientation(n_up, payload.get('orientation'))
    try: margin = float(payload.get('margin', 18)); gap = float(payload.get('gap', 6))
    except: raise HTTPException(400, 'Invalid margin/gap')
    printer_name = payload.get('printer_name')
    if not printer_name: raise HTTPException(400, 'printer_name is required')
    copies = int(payload.get('copies', 1) or 1)
    dm_duplex = _dm_duplex_value(payload.get('duplex_mode', 'simplex'))
    dm_color  = _dm_color_value(payload.get('color_mode', 'color'))
    # Compose a temporary n-up PDF for printing
    out_name = f"print_{n_up}_{secrets.token_hex(6)}.pdf"
    out_path = os.path.join(SPOOL_DIR, out_name)
    try:
        compose_nup_pdf(src, out_path, n_up, page_size, orientation, margin, gap)
    except ValueError as ve:
        raise HTTPException(400, str(ve))
    # Try RAW direct PDF printing first (applies duplex/color on capable printers)
    job_id, status = print_pdf_to_printer_raw(printer_name, out_path, copies=copies, dm_duplex=dm_duplex, dm_color=dm_color)
    if job_id is None and status.startswith('error'):
        # Fallback to shell printing via default handler
        _, status2 = print_pdf_via_shell(printer_name, out_path)
        status = status2
    ok = not status.startswith('error')
    return JSONResponse({'ok': ok, 'job_id': job_id, 'status': status, 'url': f'/download-temp/{out_name}'})
