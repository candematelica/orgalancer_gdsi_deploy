import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = (await cookies()).get("token")?.value;

    const res = await fetch(`${process.env.API_URL}/portal/${params.id}/generate-token`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json({ error: data.detail }, { status: res.status });
    }

    return NextResponse.json(data);
}