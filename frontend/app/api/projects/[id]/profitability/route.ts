import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "./../../../utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/projects/${id}/profitability`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al obtener rentabilidad") },
        { status: response.status }
      );

    return NextResponse.json(data);

  } catch (err) {
    console.error("GET /api/projects/[id]/profitability error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}