import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const registerRes = await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const registerData = await registerRes.json();

  if (!registerRes.ok) {
    return NextResponse.json(
      { error: registerData.detail || "Error al registrar" },
      { status: registerRes.status }
    );
  }

  const loginRes = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    return NextResponse.json(registerData, { status: 201 });
  }

  const nextResponse = NextResponse.json(loginData, { status: 201 });

  if (loginData.token) {
    nextResponse.cookies.set({
      name: "token",
      value: loginData.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  return nextResponse;
}
