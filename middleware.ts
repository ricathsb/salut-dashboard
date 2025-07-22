import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret-key")

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for login page, API routes, and static files
    if (
        pathname === "/login" ||
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next()
    }

    const token = request.cookies.get("token")?.value

    if (!token) {
        console.log("No token found, redirecting to login")
        return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
        await jwtVerify(token, SECRET)
        console.log("Token verified successfully")
        return NextResponse.next()
    } catch (error) {
        console.log("Invalid token, redirecting to login:", error)
        return NextResponse.redirect(new URL("/login", request.url))
    }
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|login|logo.ico).*)",
    ],
}
