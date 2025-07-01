import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all registrations
export async function GET() {
  try {
    const data = await prisma.pendaftaran.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

// DELETE a registration by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await prisma.pendaftaran.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Registration ${id} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
  }
}
