import { NextResponse } from "next/server"
import { SignJWT } from "jose"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret-key")
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body
        // Validasi credentials dari environment variables
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
        }

        // Buat JWT token menggunakan jose
        const token = await new SignJWT({ username })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(SECRET)

        // Simpan ke cookie
        const response = NextResponse.json({ success: true, message: "Login berhasil" })
        response.cookies.set("token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60, // 1 jam
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        })

        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
    }
}
