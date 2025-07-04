import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cloudinary } from "@/lib/cloudinary"

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

  try {
    const data = await prisma.pendaftaran.findUnique({ where: { id } })
    if (!data) return NextResponse.json({ error: "Data not found" }, { status: 404 })

    const urls = [
      data.pasFoto,
      data.ktp,
      data.ijazah,
      data.formulir,
      data.ijazahSMA,
      data.screenshotPDDIKTI,
      data.skPengangkatan,
      data.skMengajar,
    ].filter(Boolean)

    for (const url of urls) {
      try {
        
        const safeUrl = url ?? ""
        const publicId = extractPublicId(safeUrl)
        const resourceType = safeUrl.includes(".pdf") ? "raw" : "image"


        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
        console.log(`✅ Cloudinary deleted: ${publicId}`)
      } catch (err) {
        console.warn(`⚠️ Gagal hapus file di Cloudinary: ${url}`, err)
      }
    }

    await prisma.pendaftaran.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ Gagal hapus data:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 🔍 Fungsi bantu untuk ambil public_id dari URL
function extractPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)(?:\.[a-z]+)?$/i)
  if (!match || !match[1]) throw new Error("Invalid Cloudinary URL")
  return match[1]
}
