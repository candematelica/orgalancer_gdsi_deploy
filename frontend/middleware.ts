import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/projects", "/clients", "/tasks", "/finances", "/assistant", "/settings"];

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value || "";
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
