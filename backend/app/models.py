import uuid
from sqlalchemy import Column, String, Float, ForeignKey, Date, Numeric
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
    contract_type = Column( SQLEnum(ContractType), nullable=False)
    estimated_budget = Column(Numeric(10, 2), nullable=False, default=0.00)
    earned = Column(Numeric(10, 2), nullable=False, default=0.00)
    start_date = Column(Date,  nullable=True)
    deadline = Column(Date, nullable=True)
    state = Column( SQLEnum(ProjectState), nullable=False, default=ProjectState.active)

    user = relationship("User", back_populates="projects")
    client = relationship("Client", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class TaskStatus(str, enum.Enum):
    pending = "Pendiente"
    in_progress = "En Progreso"
    completed = "Completada"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    target_date = Column(String, nullable=False)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.pending, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

    user = relationship("User")
    project = relationship("Project", back_populates="tasks")
