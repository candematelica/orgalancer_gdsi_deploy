import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("token")?.value;

    const res = await fetch(`${process.env.API_URL}/budget/${params.id}/send`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.detail || "Error al enviar" }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
