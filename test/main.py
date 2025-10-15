import os, re, math, secrets
from typing import Tuple, List
import fitz
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
PREVIEW_DIR = os.path.join(BASE_DIR, 'previews')
EXPORT_DIR = os.path.join(BASE_DIR, 'exports')
for d in (UPLOAD_DIR, PREVIEW_DIR, EXPORT_DIR): os.makedirs(d, exist_ok=True)
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
    src, dst = fitz.open(inp), fitz.open(); pack=len(rects); i=0; total=len(src)
    while i<total:
        page = dst.new_page(width=sw, height=sh)
        for k in range(pack):
            if i+k>=total: break
            page.show_pdf_page(rects[k], src, i+k)
        i += pack
    dst.save(outp, deflate=True, garbage=4, clean=True); dst.close(); src.close()

def render_preview_png(inp: str, n_up: int, page_size: str='A4', orientation: str='portrait', margin: float=18.0, gap: float=6.0, dpi: int=110, sheet_index: int=0) -> bytes:
    rows, cols = LAYOUTS[n_up]; sw, sh = page_size_from_name(page_size)
    if orientation=='landscape': sw, sh = sh, sw
    rects = build_nup_rects(sw, sh, rows, cols, margin, gap, fit='shrink')
    src, dst = fitz.open(inp), fitz.open(); pack=n_up; start=sheet_index*pack
    if start>=len(src): start=max(0,(len(src)-1)//pack)*pack
    page = dst.new_page(width=sw, height=sh)
    for k in range(pack):
        idx=start+k
        if idx>=len(src): break
        page.show_pdf_page(rects[k], src, idx)
    zoom=dpi/72.0; pix=page.get_pixmap(matrix=fitz.Matrix(zoom,zoom), alpha=False); png=pix.tobytes('png'); dst.close(); src.close(); return png

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

