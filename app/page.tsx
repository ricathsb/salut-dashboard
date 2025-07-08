/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Download, Trash2, GraduationCap, Award, Users } from "lucide-react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
  jenjang: string // Added missing jenjang field
  dokumenPath: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  jalur: string
}

export default function Home() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterJalur, setFilterJalur] = useState<string>("all")

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations")
      const data = await response.json()
      console.log("=== DEBUG DATA JALUR ===")
      data.forEach((item: Registration, index: number) => {
        console.log(`${index + 1}. ${item.namaLengkap} - Jalur: "${item.jalur}" (type: ${typeof item.jalur})`)
      })
      console.log("========================")
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

  const isRPLJalur = (jalur: string): boolean => {
    const jalurLower = jalur?.toString().trim().toLowerCase() || ""
    if (jalurLower.includes("non") && jalurLower.includes("rpl")) {
      return false
    }
    return (
      jalurLower === "rpl" ||
      jalurLower === "rekognisi pembelajaran lampau" ||
      (jalurLower.includes("rpl") && !jalurLower.includes("non"))
    )
  }

  const isNonRPLJalur = (jalur: string): boolean => {
    const jalurLower = jalur?.toString().trim().toLowerCase() || ""
    return (
      (jalurLower.includes("non") && jalurLower.includes("rpl")) ||
      jalurLower === "non-rpl" ||
      jalurLower === "reguler" ||
      jalurLower === "regular" ||
      (jalurLower !== "" && !isRPLJalur(jalur))
    )
  }

  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch = registration.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
    let matchesFilter = false
    if (filterJalur === "all") {
      matchesFilter = true
    } else if (filterJalur === "rpl") {
      matchesFilter = isRPLJalur(registration.jalur)
    } else if (filterJalur === "non-rpl") {
      matchesFilter = isNonRPLJalur(registration.jalur)
    }
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id))
    try {
      const response = await fetch(`/api/registrations/delete?id=${id}`, {
        method: "DELETE",
      })
      const contentType = response.headers.get("content-type")
      let data
      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        data = { error: "Unexpected response from server" }
      }
      if (!response.ok) {
        throw new Error(data.error || "Delete failed")
      }
      setRegistrations((prevRegistrations) => prevRegistrations.filter((registration) => registration.id !== id))
      toast({
        title: "Success",
        description: `Data dengan ID ${id} berhasil dihapus.`,
      })
    } catch (error: any) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus data",
        variant: "destructive",
      })
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleDownload = async (id: string) => {
    setDownloadingIds((prev) => new Set(prev).add(id))
    try {
      const response = await fetch(`/api/registrations/download?id=${id}`)
      if (!response.ok) {
        const text = await response.text()
        console.error("❌ Server error:", response.status, text)
        throw new Error("Download failed")
      }
      const contentDisposition = response.headers.get("content-disposition")
      let filename = `registrasi-${id}.zip`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          filename = match[1]
        }
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast({
        title: "Success",
        description: `File ${filename} berhasil diunduh`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: "Gagal mengunduh file",
        variant: "destructive",
      })
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    try {
      const response = await fetch("/api/registrations/download-all")
      if (!response.ok) {
        throw new Error("Download all failed")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `registrasi-semua-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "Berhasil",
        description: "Berhasil mengunduh semua data pendaftaran dalam bentuk ZIP.",
      })
    } catch (error) {
      console.error("Download all error:", error)
      toast({
        title: "Gagal",
        description: "Gagal mengunduh data pendaftaran.",
        variant: "destructive",
      })
    } finally {
      setDownloadingAll(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getJalurBadgeStyle = (jalur: string) => {
    if (isRPLJalur(jalur)) {
      return "bg-blue-100 text-blue-800 border border-blue-200"
    } else {
      return "bg-green-100 text-green-800 border border-green-200"
    }
  }

  const getJalurLabel = (jalur: string) => {
    if (isRPLJalur(jalur)) {
      return "RPL"
    } else if (isNonRPLJalur(jalur)) {
      return "Non-RPL"
    } else {
      return jalur || "Tidak Diketahui"
    }
  }

  // Function to get jenjang badge style similar to program-studi page
  const getJenjangBadge = (jenjang: string) => {
    const colors = {
      D3: "bg-orange-100 text-orange-800 border border-orange-200",
      D4: "bg-purple-100 text-purple-800 border border-purple-200",
      S1: "bg-blue-100 text-blue-800 border border-blue-200",
      S2: "bg-green-100 text-green-800 border border-green-200",
      S3: "bg-red-100 text-red-800 border border-red-200",
    }
    return colors[jenjang as keyof typeof colors] || "bg-gray-100 text-gray-800 border border-gray-200"
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-48 sm:w-64 mb-4 sm:mb-6"></div>
            <div className="h-64 sm:h-96 bg-white rounded-xl shadow-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg text-white w-fit">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">Dashboard Registrasi</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                Kelola data registrasi mahasiswa dengan mudah dan efisien
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total Mahasiswa</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{registrations.length}</p>
                  <p className="text-xs text-blue-700 mt-1">Terdaftar</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-600 mb-1">Jalur RPL</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900">
                    {registrations.filter((reg) => isRPLJalur(reg.jalur)).length}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Mahasiswa</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-purple-600 mb-1">Jalur Non-RPL</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                    {registrations.filter((reg) => isNonRPLJalur(reg.jalur)).length}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">Mahasiswa</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nama mahasiswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-900 text-sm sm:text-base"
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={filterJalur} onValueChange={setFilterJalur}>
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-900 text-sm sm:text-base">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filter berdasarkan jalur" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                    Semua Jalur
                  </SelectItem>
                  <SelectItem value="rpl" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                    RPL (Rekognisi Pembelajaran Lampau)
                  </SelectItem>
                  <SelectItem value="non-rpl" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                    Non-RPL (Reguler)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
              <span className="font-medium">
                {filteredRegistrations.length} dari {registrations.length} data
              </span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Card className="bg-white border border-gray-200 shadow-xl">
          <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                Data Registrasi Mahasiswa
              </CardTitle>
              <Button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                {downloadingAll ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{downloadingAll ? "Mengunduh..." : "Download Semua"}</span>
                <span className="sm:hidden">{downloadingAll ? "..." : "Download"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      No
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[150px]">
                      Nama Lengkap
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[120px]">
                      NIK
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[100px]">
                      NISN
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[180px]">
                      Email
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[120px]">
                      No. HP
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[120px]">
                      Fakultas
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[150px]">
                      Program Studi
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[100px]">
                      Jenjang
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[100px]">
                      Jalur
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm min-w-[120px]">
                      Tanggal Daftar
                    </TableHead>
                    <TableHead className="h-12 sm:h-14 px-3 sm:px-6 text-center font-semibold text-gray-700 text-xs sm:text-sm min-w-[100px]">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration, index) => (
                    <TableRow
                      key={registration.id}
                      className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="p-3 sm:p-6 font-medium text-gray-700 text-xs sm:text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell className="p-3 sm:p-6 font-semibold text-gray-900 text-xs sm:text-sm">
                        {registration.namaLengkap}
                      </TableCell>
                      <TableCell className="p-3 sm:p-6 text-gray-700 text-xs sm:text-sm">{registration.nik}</TableCell>
                      <TableCell className="p-3 sm:p-6 text-gray-700 text-xs sm:text-sm">{registration.nisn}</TableCell>
                      <TableCell className="p-3 sm:p-6 text-gray-700 text-xs sm:text-sm">
                        {registration.email}
                      </TableCell>
                      <TableCell className="p-3 sm:p-6 text-gray-700 text-xs sm:text-sm">{registration.noHp}</TableCell>
                      <TableCell className="p-3 sm:p-6 text-gray-700 text-xs sm:text-sm">
                        {registration.fakultas}
                      </TableCell>
                      <TableCell className="p-3 sm:p-6 text-gray-700 text-xs sm:text-sm">
                        {registration.programStudi}
                      </TableCell>
                      <TableCell className="p-3 sm:p-6">
                        <Badge className={`font-medium border ${getJenjangBadge(registration.jenjang)}`}>
                          {registration.jenjang || "Tidak Diketahui"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 sm:p-6">
                        <Badge
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getJalurBadgeStyle(registration.jalur)}`}
                        >
                          {getJalurLabel(registration.jalur)}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 sm:p-6 text-gray-700 text-xs sm:text-sm">
                        {formatDate(registration.createdAt)}
                      </TableCell>
                      <TableCell className="p-3 sm:p-6">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(registration.id)}
                            disabled={downloadingIds.has(registration.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingIds.has(registration.id) ? (
                              <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                            ) : (
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(registration.id)}
                            disabled={deletingIds.has(registration.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingIds.has(registration.id) ? (
                              <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRegistrations.length === 0 && registrations.length > 0 && (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="p-3 sm:p-4 bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Tidak ada data yang cocok</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Coba ubah kata kunci pencarian atau filter yang digunakan.
                </p>
              </div>
            )}
            {registrations.length === 0 && (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="p-3 sm:p-4 bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Tidak ada data registrasi</h3>
                <p className="text-sm sm:text-base text-gray-600">Belum ada mahasiswa yang mendaftar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
