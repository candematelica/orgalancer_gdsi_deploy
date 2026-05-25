import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL;

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const formData = await req.formData();

  const res = await fetch(`${API}/users/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    },
    // Next.js infiere el Content-Type multipart/form-data con boundary automáticamente
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.detail ?? "Error al subir el avatar" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}