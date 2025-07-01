import { NextResponse } from "next/server"

// Dummy data sesuai dengan format yang diberikan
const dummyRegistrations = [
  {
    id: "reg1",
    namaLengkap: "Andi Pratama",
    nik: "3201234567890123",
    nisn: "1234567890",
    noHp: "081234567893",
    email: "andi.pratama@email.com",
    tanggalLahir: "1995-05-15 00:00:00",
    alamat: "Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta 10110",
    fakultas: "FE",
    programStudi: "Manajemen",
    dokumenPath: null,
    status: "pending",
    createdAt: "2025-07-01 03:34:30.807",
    updatedAt: "2025-07-01 03:34:30.807",
  },
  {
    id: "reg2",
    namaLengkap: "Maya Sari",
    nik: "3301234567890124",
    nisn: "1234567891",
    noHp: "081234567894",
    email: "maya.sari@email.com",
    tanggalLahir: "1992-08-20 00:00:00",
    alamat: "Jl. Sudirman No. 456, Bandung, Jawa Barat 40123",
    fakultas: "FKIP",
    programStudi: "Pendidikan Bahasa Indonesia",
    dokumenPath: null,
    status: "approved",
    createdAt: "2025-07-01 03:34:30.807",
    updatedAt: "2025-07-01 03:34:30.807",
  },
  {
    id: "reg3",
    namaLengkap: "Rizki Firmansyah",
    nik: "3501234567890125",
    nisn: "1234567892",
    noHp: "081234567895",
    email: "rizki.firmansyah@email.com",
    tanggalLahir: "1990-12-10 00:00:00",
    alamat: "Jl. Diponegoro No. 789, Surabaya, Jawa Timur 60123",
    fakultas: "FMIPA",
    programStudi: "Sistem Informasi",
    dokumenPath: null,
    status: "pending",
    createdAt: "2025-07-01 03:34:30.807",
    updatedAt: "2025-07-01 03:34:30.807",
  },
  {
    id: "reg4",
    namaLengkap: "Siti Nurhaliza",
    nik: "3201234567890126",
    nisn: "1234567893",
    noHp: "081234567896",
    email: "siti.nurhaliza@email.com",
    tanggalLahir: "1993-03-25 00:00:00",
    alamat: "Jl. Ahmad Yani No. 321, Yogyakarta, DIY 55123",
    fakultas: "FKIP",
    programStudi: "Pendidikan Matematika",
    dokumenPath: null,
    status: "approved",
    createdAt: "2025-07-01 04:15:20.807",
    updatedAt: "2025-07-01 04:15:20.807",
  },
  {
    id: "reg5",
    namaLengkap: "Budi Santoso",
    nik: "3301234567890127",
    nisn: "1234567894",
    noHp: "081234567897",
    email: "budi.santoso@email.com",
    tanggalLahir: "1991-11-08 00:00:00",
    alamat: "Jl. Gatot Subroto No. 654, Medan, Sumatera Utara 20123",
    fakultas: "FE",
    programStudi: "Akuntansi",
    dokumenPath: null,
    status: "rejected",
    createdAt: "2025-07-01 05:22:15.807",
    updatedAt: "2025-07-01 05:22:15.807",
  },
]

export async function GET() {
  try {
    // Simulasi delay API
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(dummyRegistrations)
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // TODO: Implement actual delete logic
    console.log("Delete registration with ID:", id)

    return NextResponse.json({
      success: true,
      message: `Registration ${id} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
  }
}
