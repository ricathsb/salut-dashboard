import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import ExcelJS from "exceljs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const registration = await prisma.pendaftaran.findUnique({ where: { id } })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Pendaftaran")

    // Header
    worksheet.addRow([
      "ID",
      "Nama Lengkap",
      "NIK",
      "NISN",
      "No HP",
      "Email",
      "Tanggal Lahir",
      "Alamat",
      "Fakultas",
      "Program Studi",
      "Tanggal Daftar",
    ])

    // Data
    worksheet.addRow([
      registration.id,
      registration.namaLengkap,
      registration.nik,
      registration.nisn,
      registration.noHp,
      registration.email,
      registration.tanggalLahir,
      registration.alamat,
      registration.fakultas,
      registration.programStudi,
      registration.status,
      registration.createdAt,
    ])

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="registrasi-${registration.namaLengkap.replace(/\s+/g, "-")}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error generating Excel:", error)
    return NextResponse.json({ error: "Failed to generate Excel file" }, { status: 500 })
  }
}
