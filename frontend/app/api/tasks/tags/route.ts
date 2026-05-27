import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../utils";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");
    const response = await fetch(`${process.env.API_URL}/tags`, {
      headers: { Authorization: token || "" },
      cache: "no-store",
    });
    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al obtener etiquetas") },
        { status: response.status }
      );
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/tasks/tags error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");
    const body = await req.json();
    const response = await fetch(`${process.env.API_URL}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token || "" },
      body: JSON.stringify(body),
    });
    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al crear etiqueta") },
        { status: response.status }
      );
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks/tags error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}