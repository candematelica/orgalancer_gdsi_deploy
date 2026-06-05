import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../utils";


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token  = req.cookies.get("token")?.value;
    const body   = await req.json();

    const res  = await fetch(`${process.env.API_URL}/expenses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization:  token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await parseBody(res);
    if (!res.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al actualizar el gasto") },
        { status: res.status }
      );

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/expenses/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token  = req.cookies.get("token")?.value;

    const res = await fetch(`${process.env.API_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al eliminar el gasto") },
        { status: res.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/expenses/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}