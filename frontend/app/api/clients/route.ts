import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../utils";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    const response = await fetch(`${process.env.API_URL}/clients`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al obtener los clientes") }, { status: response.status });

    return NextResponse.json(data);

  } catch (err) {
    console.error("GET /api/clients error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al crear el cliente") }, { status: response.status });

    return NextResponse.json(data, { status: 201 });

  } catch (err) {
    console.error("POST /api/clients error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}