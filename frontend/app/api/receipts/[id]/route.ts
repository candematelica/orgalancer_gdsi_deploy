import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token   = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/receipts/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Recibo no encontrado") },
        { status: response.status }
      );

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/receipts/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token   = req.cookies.get("token")?.value;
    const body    = await req.json();

    const response = await fetch(`${process.env.API_URL}/receipts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al actualizar el recibo") },
        { status: response.status }
      );

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/receipts/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token   = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/receipts/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    if (response.status === 204)
      return new NextResponse(null, { status: 204 });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al eliminar el recibo") },
        { status: response.status }
      );

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/receipts/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}