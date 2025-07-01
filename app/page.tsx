"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Download, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Registration {
  id: string
  namaLengkap: string
  nik: string
  nisn: string
  noHp: string
  email: string
  tanggalLahir: string
  alamat: string
  fakultas: string
  programStudi: string
  dokumenPath: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations")
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch registration data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    console.log("Delete registration:", id)
    toast({
      title: "Delete",
      description: `Delete functionality for ID: ${id} (Not implemented yet)`,
    })
  }

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/download?id=${id}`)

      if (!response.ok) {
        throw new Error("Download failed")
      }

      const contentDisposition = response.headers.get("content-disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `registrasi-${id}.csv`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: `File ${filename} downloaded successfully`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={120}
              height={25}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard Registrasi Mahasiswa
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola data registrasi mahasiswa dengan mudah
          </p>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Registrasi Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Fakultas</TableHead>
                    <TableHead>Program Studi</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration, index) => (
                    <TableRow
                      key={registration.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{registration.namaLengkap}</TableCell>
                      <TableCell>{registration.nik}</TableCell>
                      <TableCell>{registration.nisn}</TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>{registration.noHp}</TableCell>
                      <TableCell>{registration.fakultas}</TableCell>
                      <TableCell>{registration.programStudi}</TableCell>
                      <TableCell>{formatDate(registration.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(registration.id)}
                            className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(registration.id)}
                            className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {registrations.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Tidak ada data registrasi
                </h3>
                <p className="text-gray-500 dark:text-gray-400">Belum ada mahasiswa yang mendaftar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
