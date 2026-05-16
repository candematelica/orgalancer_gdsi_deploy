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