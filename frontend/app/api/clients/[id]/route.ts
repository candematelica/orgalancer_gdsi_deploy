import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.headers.get("Authorization");

  const response = await fetch(`${process.env.API_URL}/clients/${id}`, {
    headers: {
      "Authorization": token || "",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const body = await req.json();
  const token = req.headers.get("Authorization");

  const response = await fetch(`${process.env.API_URL}/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token || "",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = Array.isArray(data.detail)
      ? data.detail[0].msg
      : data.detail || "Error al actualizar el cliente";

    return NextResponse.json(
      { error: errorMsg },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}