import { NextRequest, NextResponse } from "next/server";

// GET /api/projects?state=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");

  const backendUrl = new URL(`${process.env.API_URL}/projects/`);

  if (state) {
    backendUrl.searchParams.set("state", state);
  }

  const token = req.headers.get("Authorization");

  const response = await fetch(backendUrl.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || "",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = Array.isArray(data.detail)
      ? data.detail[0].msg
      : data.detail || "Error al obtener los proyectos";

    return NextResponse.json(
      { error: errorMsg },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: 200 });
}


// POST

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization");
  const body = await req.json();
  
  const { user_id, ...projectData } = body;

  const response = await fetch(`${process.env.API_URL}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || "",
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();

  if (!response.ok) {
    console.log("ERROR 422 FROM THE BACKEND:", JSON.stringify(data, null, 2));
    return NextResponse.json(
      { error: data.detail || "Error al crear el proyecto" },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: 201 });
}