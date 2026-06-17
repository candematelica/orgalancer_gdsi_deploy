import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const res = await fetch(`${process.env.API_URL}/static/${path.join("/")}`, {
    cache: "no-store",
  });

  if (!res.ok) return new NextResponse(null, { status: res.status });

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(buffer, {
    headers: { "Content-Type": contentType },
  });
}