from pydantic import BaseModel, Field
from typing import List, Optional

from app.models import TaskStatus

class TagBase(BaseModel):
    name: str = Field(..., max_length=50)

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: str
    priority: str
    project_id: str
    target_date: str

class TaskCreate(TaskBase):
    tag_ids: Optional[List[str]] = []

class TaskResponse(TaskBase):
    id: str
    user_id: str
    status: TaskStatus
    tags: List[TagResponse] = []
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class TaskUpdateStatus(BaseModel):
    status: TaskStatus
