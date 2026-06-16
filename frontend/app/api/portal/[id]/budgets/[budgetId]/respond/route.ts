import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { id: string; budgetId: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id, budgetId } = params;
  const body = await req.json();

  const res = await fetch(
    `${process.env.API_URL}/portal/${id}/budgets/${budgetId}/respond`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}