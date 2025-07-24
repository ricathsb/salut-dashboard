import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import jwt from "jsonwebtoken"

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Verify JWT token
function verifyToken(request: NextRequest) {
    const token = request.cookies.get("token")?.value

    if (!token) {
        return null
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
        return decoded
    } catch (error) {
        console.error("Token verification failed:", error)
        return null
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = verifyToken(request)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 })
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        resource_type: "image",
                        folder: "salut-dashboard/berita",
                        transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto" }, { format: "webp" }],
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                    },
                )
                .end(buffer)
        })

        const uploadResult = result as any

        return NextResponse.json({
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        })
    } catch (error) {
        console.error("Error uploading image:", error)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }
}
