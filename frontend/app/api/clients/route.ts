import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(`${process.env.API_URL}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = Array.isArray(data.detail)
      ? data.detail[0].msg
      : data.detail || "Error al crear el cliente";

    return NextResponse.json(
      { error: errorMsg },
      { status: response.status }
    );
  }

  return NextResponse.json(data, { status: 201 });
}