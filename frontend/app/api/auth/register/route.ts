import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const registerRes = await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const registerText = await registerRes.text();
  let registerData: any = {};
  try { registerData = JSON.parse(registerText); } catch { /* plain text error */ }

  if (!registerRes.ok) {
    return NextResponse.json(
      { error: registerData.detail || registerText || "Error al registrar" },
      { status: registerRes.status }
    );
  }

  const loginRes = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const loginText = await loginRes.text();
  let loginData: any = {};
  try { loginData = JSON.parse(loginText); } catch { /* plain text error */ }

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
