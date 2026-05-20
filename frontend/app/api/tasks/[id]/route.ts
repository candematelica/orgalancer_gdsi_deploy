import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await req.json();
  const token = req.headers.get("Authorization");

  const response = await fetch(`${process.env.API_URL}/tasks/${params.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || "",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.detail || "Error al actualizar el estado de la tarea" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const token = req.headers.get("Authorization");

  const response = await fetch(`${process.env.API_URL}/tasks/${params.id}`, {
    method: "DELETE",
    headers: {
      "Authorization": token || "",
    },
  });

  if (!response.ok) {
    let errorMessage = "Error al eliminar la tarea";

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) { }

    return NextResponse.json({ error: errorMessage }, { status: response.status });
  }

  return new NextResponse(null, { status: 204 });
}
