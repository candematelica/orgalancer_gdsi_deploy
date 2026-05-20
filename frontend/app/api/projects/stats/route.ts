import { NextRequest, NextResponse } from "next/server";

// GET /api/projects/stats
export async function GET(req: NextRequest) {
  const backendUrl = `${process.env.API_URL}/projects/stats`;
  const token = req.headers.get("Authorization");

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || "",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.detail || "Error al obtener estadísticas" },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: 200 });
}