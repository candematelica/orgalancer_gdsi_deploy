import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const res = await fetch(`${process.env.API_URL}/budget`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.detail || "Error al guardar" }, { status: res.status });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const projectId = new URL(req.url).searchParams.get("project_id");
    const url = projectId
      ? `${process.env.API_URL}/budget?project_id=${projectId}`
      : `${process.env.API_URL}/budget`;

    const res = await fetch(url, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.detail || "Error al obtener" }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
