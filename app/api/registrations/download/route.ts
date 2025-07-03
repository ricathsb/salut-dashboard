import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cloudinary } from "@/lib/cloudinary"
import ExcelJS from "exceljs"
import AdmZip from "adm-zip"
import axios from "axios"

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

    const zip = new AdmZip()
    const slugName = slugify(registration.namaLengkap)

    // 📷 Tambahkan pasFoto (JPG)
    try {
      const pasFotoUrl = registration.pasFoto

      console.log("📷 Downloading pasFoto:", pasFotoUrl)

      const pasFotoRes = await axios.get(pasFotoUrl, {
        responseType: "arraybuffer",
      })

      const filename = `${slugName}_pasfoto.jpg`
      zip.addFile(filename, Buffer.from(pasFotoRes.data))
    } catch (err: any) {
      console.warn("⚠️ Gagal download pasFoto:", err?.message || err)
    }

    // 📄 Tambahkan file PDF (ktp, ijazah, formulir)
    const pdfFiles = [
  { id: registration.ktp, label: "ktp" },
  { id: registration.ijazah, label: "ijazah" },
  { id: registration.formulir, label: "formulir" },
  { id: registration.ijazahSMA, label: "ijazahSMA" },
  { id: registration.screenshotPDDIKTI, label: "screenshotPDDIKTI" },
  { id: registration.skPengangkatan, label: "skPengangkatan" },
  { id: registration.skMengajar, label: "skMengajar" },
];

for (const { id, label } of pdfFiles) {
  if (!id) continue;

  try {
    const pdfUrl = id; // ✅ langsung pakai URL dari database

    console.log(`📄 Downloading ${label}: ${pdfUrl}`);

    const pdfRes = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
    });

    const filename = `${slugName}_${label}.pdf`;
    zip.addFile(filename, Buffer.from(pdfRes.data));
  } catch (err: any) {
    console.warn(`⚠️ Gagal download file ${label}:`, err?.message || err);
  }
}


    // 📊 Tambahkan Excel ringkasan
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Pendaftaran")

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

    worksheet.addRow([
      registration.id,
      registration.namaLengkap,
      registration.nik,
      registration.nisn,
      registration.noHp,
      registration.email,
      formatDate(registration.tanggalLahir),
      registration.alamat,
      registration.fakultas,
      registration.programStudi,
      formatDate(registration.createdAt),
    ])

    const excelBuffer = await workbook.xlsx.writeBuffer()
    zip.addFile("data-pendaftaran.xlsx", excelBuffer)

    const zipBuffer = zip.toBuffer()

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="registrasi-${slugName}.zip"`,
      },
    })
  } catch (error: any) {
    console.error("❌ Gagal generate ZIP:", error?.message || error)
    console.error("📦 Stack trace:", error?.stack)
    return NextResponse.json({ error: "Failed to generate ZIP file" }, { status: 500 })
  }
}

function formatDate(date: Date | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "_")
    .replace(/__+/g, "_")
    .replace(/^_+|_+$/g, "")
}
