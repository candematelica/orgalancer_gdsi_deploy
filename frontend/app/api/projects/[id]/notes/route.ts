import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "./../../../utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/projects/${id}/notes`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al obtener notas") }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/projects/[id]/notes error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/projects/${id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al crear nota") }, { status: response.status });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects/[id]/notes error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
