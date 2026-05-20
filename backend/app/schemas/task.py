from pydantic import BaseModel, Field

from app.models import TaskStatus

class TaskBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: str
    priority: str
    project_id: str
    target_date: str

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: str
    user_id: str
    status: TaskStatus
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class TaskUpdateStatus(BaseModel):
    status: TaskStatus
