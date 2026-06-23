import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../utils";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const { searchParams } = new URL(req.url);

    const upstream = new URL(`${process.env.API_URL}/receipts/`);
    const projectId = searchParams.get("project_id");
    const clientId  = searchParams.get("client_id");
    if (projectId) upstream.searchParams.set("project_id", projectId);
    if (clientId)  upstream.searchParams.set("client_id",  clientId);

    const response = await fetch(upstream.toString(), {
      headers: {Authorization: token ? `Bearer ${token}` : ""},
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al obtener los recibos") },
        { status: response.status }
      );

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/receipts error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const body  = await req.json();

    const response = await fetch(`${process.env.API_URL}/receipts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al crear el recibo") },
        { status: response.status }
      );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/receipts error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}