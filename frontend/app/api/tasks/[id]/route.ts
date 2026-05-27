import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "../../utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al actualizar el estado de la tarea") }, { status: response.status });

    return NextResponse.json(data);

  } catch (err) {
    console.error("PATCH /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: { "Authorization": token || "" },
    });

    if (!response.ok) {
      const data = await parseBody(response);
      return NextResponse.json({ error: extractErrorMsg(data, "Error al eliminar la tarea") }, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });

  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization");
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);

    if (!response.ok) {
      return NextResponse.json(
        { error: extractErrorMsg(data, "Error al actualizar la tarea") },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error("PUT /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
