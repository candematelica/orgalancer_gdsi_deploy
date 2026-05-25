import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization");
    const body  = await req.json();

    const res = await fetch(`${process.env.API_URL}/revenue/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: token || "" },
      body: JSON.stringify(body),
    });

    const data = await parseBody(res);
    if (!res.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al actualizar el ingreso") }, { status: res.status });

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/revenue/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("Authorization");

    const res = await fetch(`${process.env.API_URL}/revenue/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: token || "" },
    });

    if (!res.ok) {
      const data = await parseBody(res);
      return NextResponse.json({ error: extractErrorMsg(data, "Error al eliminar el ingreso") }, { status: res.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/revenue/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
