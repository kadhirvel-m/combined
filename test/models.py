from typing import List, Optional
from pydantic import BaseModel


class PrinterInfo(BaseModel):
    name: str
    is_default: bool


class PrinterCaps(BaseModel):
    duplex_supported: bool
    color_supported: bool
    paper_names: List[str] = []
    paper_ids: List[int] = []
    phys_offset_x: Optional[int] = None
    phys_offset_y: Optional[int] = None

