/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server"
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
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID in query" }, { status: 400 });
  }

  try {
    const deleted = await prisma.pendaftaran.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: `Registration with ID ${id} deleted successfully.` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Failed to delete:", error);

    return NextResponse.json(
      { error: "Failed to delete registration. It may not exist." },
      { status: 500 }
    );
  }
}

