import { NextRequest, NextResponse } from "next/server";
import { parseBody, extractErrorMsg } from "./../../../../utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id, noteId } = await params;
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/projects/${id}/notes/${noteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al actualizar nota") }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT /api/projects/[id]/notes/[noteId] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id, noteId } = await params;
    const token = req.cookies.get("token")?.value;

    const response = await fetch(`${process.env.API_URL}/projects/${id}/notes/${noteId}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    if (response.status === 204) return new NextResponse(null, { status: 204 });

    const data = await parseBody(response);
    if (!response.ok)
      return NextResponse.json({ error: extractErrorMsg(data, "Error al eliminar nota") }, { status: response.status });

    return NextResponse.json(data);
  } catch (err) {
    console.error("DELETE /api/projects/[id]/notes/[noteId] error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
