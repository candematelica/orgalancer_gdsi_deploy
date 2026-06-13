import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/tariff/rate-adjustment/insight/${projectId}`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: "No se pudo conectar con el asistente." },
        { status: response.status || 500 }
      );
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("POST /api/tariff/rate-adjustment/insight/[projectId] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
