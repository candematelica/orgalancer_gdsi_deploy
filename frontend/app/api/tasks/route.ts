import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = req.headers.get("Authorization");

  const response = await fetch(`${process.env.API_URL}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || "",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = Array.isArray(data.detail)
      ? data.detail[0].msg
      : data.detail || "Error al crear la tarea";

    return NextResponse.json(
      { error: errorMsg },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization");

  const response = await fetch(`${process.env.API_URL}/tasks/`, {
    headers: {
      "Authorization": token || "",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: "Error al obtener las tareas" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
