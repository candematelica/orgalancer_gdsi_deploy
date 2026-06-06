import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../utils";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    const { searchParams } = new URL(req.url);
    const backendUrl = new URL(`${process.env.API_URL}/reports/cash-flow`);

    for (const [key, value] of searchParams.entries()) {
      backendUrl.searchParams.set(key, value);
    }

    const response = await fetch(backendUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al obtener el flujo de caja") },
        { status: response.status }
      );

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET /api/reports/cash-flow error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
