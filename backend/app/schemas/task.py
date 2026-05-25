from pydantic import BaseModel, Field
from typing import List, Optional

from app.models import TaskStatus
from app.models import TaskPriority

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
    priority: TaskPriority
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
    project_name: str | None = None

    class Config:
        from_attributes = True


class TaskUpdateStatus(BaseModel):
    status: TaskStatus


class TaskUpdate(BaseModel):
    title: str = Field(..., max_length=100)
    description: str
    priority: TaskPriority
    status: TaskStatus
    tag_ids: List[str] = []
    target_date: str
    project_id: str

class TaskUpdatePriority(BaseModel):
    priority: TaskPriority
