import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "./../../utils";

// Get details of a specific project by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value

    const response = await fetch(`${process.env.API_URL}/projects/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Proyecto no encontrado") }, { status: response.status });

    return NextResponse.json(data);

  } catch (err) {
    console.error("GET /api/projects/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// Update project details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value
    const { user_id, ...projectData } = await req.json();

    const response = await fetch(`${process.env.API_URL}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(projectData),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al actualizar el proyecto") }, { status: response.status });

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("PUT /api/projects/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}