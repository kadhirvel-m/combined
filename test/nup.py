from __future__ import annotations
import math
import os
import fitz  # PyMuPDF
from typing import Tuple, List

# Supported layouts: 1,2,4,6,9 (grid arrangements)
# You can extend this table for 8, 16, etc.
LAYOUTS = {
    1: (1, 1),      # 1x1
    2: (1, 2),      # 1x2 (two per sheet, vertical stacking)
    4: (2, 2),      # 2x2
    6: (2, 3),      # 2x3
    9: (3, 3),      # 3x3
}

def page_size_from_name(name: str) -> Tuple[float, float]:
    name = name.lower()
    if name == "a4":
        # points (1 pt = 1/72 inch); A4 portrait 595x842
        return (595.0, 842.0)
    if name == "letter":
        return (612.0, 792.0)
    raise ValueError("Unknown page size")


def build_nup_rects(sheet_w: float, sheet_h: float, rows: int, cols: int, margin: float, gap: float, fit: str) -> List[fitz.Rect]:
    """Compute rectangles (cells) where source pages will be placed.
    fit: 'shrink' (keep margins) or 'fill' (use max cell area with tiny padding)
    """
    # Available area inside margins
    avail_w = sheet_w - 2 * margin
    avail_h = sheet_h - 2 * margin

    # Total gaps between cells
    total_gap_w = gap * (cols - 1)
    total_gap_h = gap * (rows - 1)

    cell_w = (avail_w - total_gap_w) / cols
    cell_h = (avail_h - total_gap_h) / rows

    rects = []
    for r in range(rows):
        for c in range(cols):
            x0 = margin + c * (cell_w + gap)
            y0 = margin + r * (cell_h + gap)
            x1 = x0 + cell_w
            y1 = y0 + cell_h
            rects.append(fitz.Rect(x0, y0, x1, y1))
    return rects


def compose_nup_pdf(input_pdf_path: str, output_pdf_path: str, n_up: int = 2, page_size: str = "A4", orientation: str = "portrait", margin: float = 18.0, gap: float = 6.0) -> None:
    """Compose a full N‑up PDF using vector placement.

    - n_up: one of {1,2,4,6,9}
    - page_size: 'A4' or 'Letter'
    - orientation: 'portrait'|'landscape'
    - margin/gap in points
    """
    if n_up not in LAYOUTS:
        raise ValueError("Unsupported n_up; choose 1, 2, 4, 6, or 9")

    cols, rows = LAYOUTS[n_up][1], LAYOUTS[n_up][0]  # swap to keep row-major order
    # We want row x col; LAYOUTS defines (rows, cols)
    rows, cols = LAYOUTS[n_up]

    sheet_w, sheet_h = page_size_from_name(page_size)
    if orientation == "landscape":
        sheet_w, sheet_h = sheet_h, sheet_w

    rects = build_nup_rects(sheet_w, sheet_h, rows, cols, margin, gap, fit="shrink")

    src = fitz.open(input_pdf_path)
    dst = fitz.open()

    # Iterate source pages in order, packing into grid
    pack = n_up
    total_pages = len(src)
    i = 0
    while i < total_pages:
        page = dst.new_page(width=sheet_w, height=sheet_h)
        for k in range(pack):
            if i + k >= total_pages:
                break
            cell = rects[k]
            # place vector content of page (i+k) inside 'cell'
            # show_pdf_page(target_rect, src_doc, src_page_number)
            page.show_pdf_page(cell, src, i + k)
        i += pack

    # Save with compression and xref cleanup to reduce file size
    dst.save(
        output_pdf_path,
        deflate=True,   # compress streams
        garbage=4,      # maximum garbage collection / deduplication
        clean=True,     # rewrite content streams where possible
        linear=True     # optimize for web (fast first page)
    )
    dst.close()
    src.close()


def render_preview_png(input_pdf_path: str, n_up: int, page_size: str = "A4", orientation: str = "portrait", margin: float = 18.0, gap: float = 6.0, dpi: int = 110, sheet_index: int = 0) -> bytes:
    """Render ONE N‑up sheet as PNG bytes for quick preview.

    - sheet_index: which composed sheet to preview (0-based)
    """
    # LAYOUTS is defined as (rows, cols)
    rows, cols = LAYOUTS[n_up]

    sheet_w, sheet_h = page_size_from_name(page_size)
    if orientation == "landscape":
        sheet_w, sheet_h = sheet_h, sheet_w

    rects = build_nup_rects(sheet_w, sheet_h, rows, cols, margin, gap, fit="shrink")

    src = fitz.open(input_pdf_path)
    dst = fitz.open()

    pack = n_up
    start = sheet_index * pack
    if start >= len(src):
        start = max(0, (len(src) - 1) // pack) * pack

    page = dst.new_page(width=sheet_w, height=sheet_h)
    for k in range(pack):
        idx = start + k
        if idx >= len(src):
            break
        page.show_pdf_page(rects[k], src, idx)

    # Rasterize preview page
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    png_bytes = pix.tobytes("png")

    dst.close()
    src.close()
    return png_bytes
