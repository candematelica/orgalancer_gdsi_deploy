import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const backendUrl = new URL(`${process.env.API_URL}/revenue`);

    // Forward all filter params: client_id, project_id, from, to
    for (const [key, value] of searchParams.entries()) {
      backendUrl.searchParams.set(key, value);
    }

    const token = req.headers.get("Authorization");
    const response = await fetch(backendUrl.toString(), {
      headers: { "Content-Type": "application/json", Authorization: token || "" },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al obtener los ingresos") },
        { status: response.status }
      );

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/revenue error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/revenue`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token || "" },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al registrar el ingreso") },
        { status: response.status }
      );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/revenue error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
