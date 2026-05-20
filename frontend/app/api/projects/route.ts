import { NextRequest, NextResponse } from "next/server";


async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

// GET /api/projects?state=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");
    const backendUrl = new URL(`${process.env.API_URL}/projects/`);
    if (state) backendUrl.searchParams.set("state", state);

    const token = req.headers.get("Authorization");
    const response = await fetch(backendUrl.toString(), {
      headers: { "Content-Type": "application/json", "Authorization": token || "" },
      cache: "no-store",
    });

    const data = await parseBody(response);

    if (!response.ok) {
      const errorMsg = Array.isArray(data?.detail)
        ? data.detail.map((e: any) => e.msg.replace("Value error, ", "")).join(", ")
        : data?.detail || "Error al obtener los proyectos";
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");
    const body = await req.json();
    const { user_id, ...projectData } = body;

    const response = await fetch(`${process.env.API_URL}/projects/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": token || "" },
      body: JSON.stringify(projectData),
    });

    const data = await parseBody(response);

    if (!response.ok) {
      const errorMsg = Array.isArray(data?.detail)
        ? data.detail.map((e: any) => e.msg.replace("Value error, ", "")).join(", ")
        : data?.detail || "Error al crear el proyecto";
      console.error("FastAPI error:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }

}

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");
    const body = await req.json();
    const { id, user_id, ...projectData } = body;

    const response = await fetch(`${process.env.API_URL}/projects/?project_id=${id}`, {  // 👈
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token || "" },
      body: JSON.stringify(projectData),
    });

    const data = await parseBody(response);

    if (!response.ok) {
      const errorMsg = Array.isArray(data?.detail)
        ? data.detail.map((e: any) => e.msg.replace("Value error, ", "")).join(", ")
        : data?.detail || "Error al actualizar el proyecto";
      console.error("FastAPI error:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("PUT /api/projects error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

