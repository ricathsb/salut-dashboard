import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: "dutynt79z",
  api_key: "379477354539136",
  api_secret: "TRshSfxeJr7FjHPcyTI8wSVADv4",
})

async function cekFileExist(publicId: string) {
  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "raw", // penting! karena ini PDF
    })

    console.log("✅ File ditemukan!")
    console.log("🧾 Format:", resource.format)
    console.log("🔗 URL:", resource.secure_url)
  } catch (error: any) {
    if (error.http_code === 404) {
      console.log("❌ File tidak ditemukan di Cloudinary.")
    } else {
      console.log("⚠️ Terjadi kesalahan:", error.message)
    }
  }
}

// Jalankan pengecekan
cekFileExist("salut-soul-documents/documents/formulir_1751439980807")
