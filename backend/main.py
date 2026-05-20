from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from app.routers import auth, user_profile, financial_profile, clients, tasks, projects
from app.routers.tariff_suggestion import router as tariff_router
from app.database import engine, Base
import app.models
import os

Base.metadata.create_all(bind=engine)

def _migrate_tariff_columns():
    with engine.connect() as conn:
        rows = conn.execute(text("PRAGMA table_info(financial_configurations)")).fetchall()
        existing = {r[1] for r in rows}
        additions = [
            ("desired_salary", "FLOAT DEFAULT 0.0"),
            ("monthly_hours",  "FLOAT DEFAULT 160.0"),
            ("fixed_expenses", "FLOAT DEFAULT 0.0"),
        ]
        for col, definition in additions:
            if col not in existing:
                conn.execute(text(f"ALTER TABLE financial_configurations ADD COLUMN {col} {definition}"))
        conn.commit()

_migrate_tariff_columns()

if not os.path.exists("static/avatars"):
    os.makedirs("static/avatars", exist_ok=True)

app = FastAPI(title="Orgalancer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(user_profile.router)
app.include_router(financial_profile.router)
app.include_router(clients.router)
app.include_router(tariff_router)
app.include_router(projects.router)
app.include_router(tasks.router)

@app.get("/health")
def health():
    return {"status": "ok"}
