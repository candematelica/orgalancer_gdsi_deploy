import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../../utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/tasks/${id}/priority`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": token || "" },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al actualizar la prioridad de la tarea") },
        { status: response.status }
      );

    return NextResponse.json(data);

  } catch (err) {
    console.error("PATCH /api/tasks/[id]/priority error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}