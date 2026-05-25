import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "./../../utils";

// Get aggregated statistics about projects
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    const response = await fetch(`${process.env.API_URL}/projects/stats`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al obtener estadísticas") }, { status: response.status });

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("GET /api/projects/stats error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
