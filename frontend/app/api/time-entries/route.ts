import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../utils";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/time-entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al guardar el tiempo") }, { status: response.status });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/time-entries error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const { searchParams } = new URL(req.url);
    const params = searchParams.toString();

    const response = await fetch(`${process.env.API_URL}/time-entries${params ? `?${params}` : ""}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al obtener los tiempos") }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/time-entries error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}