import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL;

export async function GET(req: NextRequest) {
  //const token = req.headers.get("Authorization");
  const token = req.cookies.get("token")?.value

  const res = await fetch(`${API}/users/me`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.detail ?? "Error al obtener el perfil" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const body = await req.json();

  const res = await fetch(`${API}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const clean = (s: string) => s.replace(/^value error,\s*/i, "");
    const msg = Array.isArray(data.detail)
      ? data.detail.map((d: { msg: string }) => clean(d.msg)).join(", ")
      : clean(data.detail ?? "No se pudieron guardar los cambios.");
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  return NextResponse.json(data);
}