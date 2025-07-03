import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import ExcelJS from "exceljs"
import AdmZip from "adm-zip"
import axios from "axios"

export async function GET() {
  try {
    const registrations = await prisma.pendaftaran.findMany()

    const zip = new AdmZip()
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Pendaftaran")

    // Header kolom Excel
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

    for (const reg of registrations) {
      worksheet.addRow([
        reg.id,
        reg.namaLengkap,
        reg.nik,
        reg.nisn,
        reg.noHp,
        reg.email,
        formatDate(reg.tanggalLahir),
        reg.alamat,
        reg.fakultas,
        reg.programStudi,
        formatDate(reg.createdAt),
      ])

      const slugName = slugify(reg.namaLengkap)
      const folderPrefix = `${slugName}/`

      // 📷 Tambahkan pasFoto (langsung dari URL)
      try {
        const pasFotoUrl = reg.pasFoto
        if (pasFotoUrl) {
          const res = await axios.get(pasFotoUrl, { responseType: "arraybuffer" })
          zip.addFile(`${folderPrefix}${slugName}_pasfoto.jpg`, Buffer.from(res.data))
        }
      } catch (err: any) {
        console.warn(`⚠️ Gagal download pasFoto untuk ${slugName}:`, err?.message || err)
      }

      // 📄 Tambahkan PDF files
      const pdfFiles = [
        { id: reg.ktp, label: "ktp" },
        { id: reg.ijazah, label: "ijazah" },
        { id: reg.formulir, label: "formulir" },
        { id: reg.ijazahSMA, label: "ijazahSMA" },
        { id: reg.screenshotPDDIKTI, label: "screenshotPDDIKTI" },
        { id: reg.skPengangkatan, label: "skPengangkatan" },
        { id: reg.skMengajar, label: "skMengajar" },
      ]

      for (const { id, label } of pdfFiles) {
        if (!id) continue

        try {
          const pdfRes = await axios.get(id, {
            responseType: "arraybuffer",
            headers: {
              Accept: "application/pdf",
            },
          })

          zip.addFile(`${folderPrefix}${slugName}_${label}.pdf`, Buffer.from(pdfRes.data))
        } catch (err: any) {
          console.warn(`⚠️ Gagal download file ${label} untuk ${slugName}:`, err?.message || err)
        }
      }
    }

    const excelBuffer = await workbook.xlsx.writeBuffer()
    zip.addFile("data-pendaftaran.xlsx", excelBuffer)

    const zipBuffer = zip.toBuffer()

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="registrasi.zip"`,
      },
    })
  } catch (error: any) {
    console.error("❌ Gagal generate ZIP:", error?.message || error)
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
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
}
