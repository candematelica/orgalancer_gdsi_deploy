import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../utils";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/tariff/rate-adjustment`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al obtener la sugerencia de tarifa") },
        { status: response.status }
      );

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/tariff/rate-adjustment error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
