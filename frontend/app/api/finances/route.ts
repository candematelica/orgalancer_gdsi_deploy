import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../utils";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/finances/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al guardar configuración financiera") }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/finances error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/finances/me`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return NextResponse.json({ coin_type: "USD", hourly_rate: 0, profit_margin: 0 });
    }

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al obtener configuración financiera") }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/finances error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}