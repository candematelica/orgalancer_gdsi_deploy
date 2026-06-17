from datetime import datetime
import uuid
from sqlalchemy import Column, String, Float, ForeignKey, Date, Numeric, Boolean, Table, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    profession = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    years_of_experience = Column(String, nullable=True)

    financial_config = relationship("FinancialConfiguration", back_populates="user", uselist=False)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")

    time_entries = relationship("TimeEntry", back_populates="user", cascade="all, delete-orphan")

class FinancialConfiguration(Base):
    __tablename__ = "financial_configurations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    coin_type = Column(String, nullable=False)
    hourly_rate = Column(Float, nullable=False, default=0.0)
    profit_margin = Column(Float, nullable=False, default=0.0)
    desired_salary = Column(Float, nullable=True, default=0.0)
    monthly_hours = Column(Float, nullable=True, default=160.0)
    fixed_expenses = Column(Float, nullable=True, default=0.0)

    user = relationship("User", back_populates="financial_config")


class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    client_type = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    website = Column(String, nullable=True)
    extra_info = Column(String, nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)

    projects = relationship("Project", back_populates="client")


class ContractType(enum.Enum):
    hourly = "hourly"
    fixed_price = "fixed_price"
    retainer = "retainer"


class ProjectState(enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    client_id = Column(String, ForeignKey("clients.id"), nullable=True, index=True)

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    contract_type = Column(SQLEnum(ContractType), nullable=False)
    estimated_budget = Column(Numeric(10, 2), nullable=False, default=0.00)
    earned = Column(Numeric(10, 2), nullable=False, default=0.00)
    start_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)
    state = Column(SQLEnum(ProjectState), nullable=False, default=ProjectState.active)

    user = relationship("User", back_populates="projects")
    client = relationship("Client", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    time_entries = relationship("TimeEntry", back_populates="project", cascade="all, delete-orphan")
    portal_token = relationship("ProjectPortalToken", back_populates="project", uselist=False)


class TaskStatus(str, enum.Enum):
    pending = "Pendiente"
    in_progress = "En Progreso"
    completed = "Completada"
    blocked = "Bloqueada"

class TaskPriority(str, enum.Enum):
    low = "Baja"
    medium = "Media"
    high = "Alta"
    urgent = "Urgente"


task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", String, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(50), nullable=False)

    tasks = relationship("Task", secondary=task_tags, back_populates="tags")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String, nullable=False)
    priority = Column(SQLEnum(TaskPriority), default = TaskPriority.medium, nullable=False)
    target_date = Column(String, nullable=False)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.pending, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")
    user = relationship("User")
    project = relationship("Project", back_populates="tasks")
    time_entries = relationship("TimeEntry", back_populates="task", cascade="all, delete-orphan")

    @property
    def project_name(self) -> str | None:
        return self.project.name if self.project else None

class TimeSource(enum.Enum):
    manual = "manual"
    timer = "timer"

class TimeEntry(Base):
    __tablename__ = "time_entries"
    id               = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id          = Column(String, ForeignKey("users.id"), nullable=False)
    project_id       = Column(String, ForeignKey("projects.id"), nullable=False)
    task_id          = Column(String, ForeignKey("tasks.id"), nullable=True)
    entry_date       = Column(Date, nullable=False)
    duration_minutes = Column(Numeric(10, 2), nullable=False)
    description      = Column(String, nullable=True)
    source           = Column(SQLEnum(TimeSource), default=TimeSource.manual)
    created_at       = Column(DateTime, nullable=False)

    user    = relationship("User", back_populates="time_entries")
    project = relationship("Project", back_populates="time_entries")
    task    = relationship("Task", back_populates="time_entries", foreign_keys=[task_id])
      
class Revenue(Base):
    __tablename__ = "revenue_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True, index=True)
    client_id = Column(String, ForeignKey("clients.id"), nullable=True, index=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    payment_type = Column(String, nullable=False)    
    payment_method = Column(String, nullable=True)  
    description = Column(String, nullable=True)
    receipt_id = Column(String, ForeignKey("receipts.id"), nullable=True, index=True)

    user = relationship("User")
    project = relationship("Project")
    client = relationship("Client")
    receipt = relationship("Receipt", back_populates="revenue_entries")


class ReceiptStatus(str, enum.Enum):
    pending   = "pending"
    paid      = "paid"
    cancelled = "cancelled"


class Receipt(Base):
    __tablename__ = "receipts"

    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id      = Column(String, ForeignKey("users.id"),    nullable=False, index=True)
    project_id   = Column(String, ForeignKey("projects.id"), nullable=True,  index=True)
    client_id    = Column(String, ForeignKey("clients.id"),  nullable=True,  index=True)
    amount       = Column(Numeric(10, 2), nullable=False)
    concept      = Column(String, nullable=False)
    date_emitted = Column(Date, nullable=False)
    status       = Column(SQLEnum(ReceiptStatus), nullable=False, default=ReceiptStatus.pending)

    user            = relationship("User")
    project         = relationship("Project")
    client          = relationship("Client")
    revenue_entries = relationship("Revenue", back_populates="receipt")


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id      = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name    = Column(String(100), nullable=False)
    color   = Column(String(7), nullable=True)

    user     = relationship("User")
    expenses = relationship("Expense", back_populates="category")


class Expense(Base):
    __tablename__ = "expenses"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id     = Column(String, ForeignKey("users.id"),             nullable=False, index=True)
    category_id = Column(String, ForeignKey("expense_categories.id"), nullable=True, index=True)
    project_id  = Column(String, ForeignKey("projects.id"),          nullable=True,  index=True)

    amount      = Column(Numeric(10, 2), nullable=False)
    currency    = Column(String,         nullable=False)
    date        = Column(Date,           nullable=False)
    description = Column(String,         nullable=True)

    user     = relationship("User")
    category = relationship("ExpenseCategory", back_populates="expenses")
    project  = relationship("Project")


class BudgetStatus(str, enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = {"extend_existing": True}

    id           = Column(String,         primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id      = Column(String,         ForeignKey("users.id"),    nullable=False, index=True)
    project_id   = Column(String,         ForeignKey("projects.id"), nullable=True,  index=True)
    client_id    = Column(String,         ForeignKey("clients.id"),  nullable=True,  index=True)

    name         = Column(String,         nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency     = Column(String,         nullable=False)
    description  = Column(String,         nullable=True)
    status       = Column(SQLEnum(BudgetStatus), nullable=False, default=BudgetStatus.pending)
    responded_at = Column(DateTime,       nullable=True)

    created_at   = Column(DateTime,       nullable=False)

    user    = relationship("User")
    project = relationship("Project")
    client  = relationship("Client")
 
class ProjectPortalToken(Base):
    __tablename__ = "project_portal_tokens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="portal_token")
