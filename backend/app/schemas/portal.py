from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class PortalTokenResponse(BaseModel):
    token: str


class PortalTaskItem(BaseModel):
    id: str
    title: str
    status: str


class PortalProjectResponse(BaseModel):
    name: str
    description: Optional[str] = None
    state: str
    progress_percentage: int
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    client_name: Optional[str] = None
    tasks: List[PortalTaskItem] = []

    class Config:
        from_attributes = True