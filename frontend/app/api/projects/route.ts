import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "./../utils";

// Get all projects, optionally filtered by state (active, completed, archived)
export async function GET(req: NextRequest) {
  try {
    const state = new URL(req.url).searchParams.get("state");
const clientId = new URL(req.url).searchParams.get("client_id"); 
const backendUrl = new URL(`${process.env.API_URL}/projects/`);
if (state) backendUrl.searchParams.set("state", state);
if (clientId) backendUrl.searchParams.set("client_id", clientId);

    const token = req.cookies.get("token")?.value
    const response = await fetch(backendUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al obtener los proyectos") }, { status: response.status });

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// Create a new project
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const { user_id, ...projectData } = await req.json();

    const response = await fetch(`${process.env.API_URL}/projects/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(projectData),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al crear el proyecto") }, { status: response.status });

    return NextResponse.json(data, { status: 201 });

  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
