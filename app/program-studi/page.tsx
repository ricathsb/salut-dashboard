/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
    Plus,
    Edit,
    Trash2,
    BookOpen,
    Award,
    GraduationCap,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
    RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface ProgramStudi {
    id: string
    nama: string
    fakultas: string
    jenjang: string
    akreditasi: string
    biayaSemester: number
    deskripsi: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface Fakultas {
    id: string
    nama: string
    namaLengkap: string
    isActive: boolean
}

interface FilterState {
    search: string
    fakultas: string
    jenjang: string
    akreditasi: string
    status: string
}

export default function ProgramStudiPage() {
    const [programStudi, setProgramStudi] = useState<ProgramStudi[]>([])
    const [fakultasList, setFakultasList] = useState<Fakultas[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState<ProgramStudi | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        fakultas: "all",
        jenjang: "all",
        akreditasi: "all",
        status: "all",
    })

    const [formData, setFormData] = useState({
        id: "",
        nama: "",
        fakultas: "",
        jenjang: "",
        akreditasi: "",
        biayaSemester: "",
        deskripsi: "",
        isActive: true,
    })

    useEffect(() => {
        fetchProgramStudi()
        fetchFakultas()
    }, [])

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filters])

    const fetchProgramStudi = async () => {
        try {
            const response = await fetch("/api/program-studi")
            const data = await response.json()
            setProgramStudi(data)
        } catch (error) {
            console.error("Error fetching program studi:", error)
            toast({
                title: "Error",
                description: "Gagal memuat data program studi",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchFakultas = async () => {
        try {
            const response = await fetch("/api/fakultas")
            const data = await response.json()
            setFakultasList(data)
        } catch (error) {
            console.error("Error fetching fakultas:", error)
        }
    }

    // Helper function to get fakultas name by ID
    const getFakultasName = (fakultasId: string) => {
        const fakultas = fakultasList.find((f) => f.id === fakultasId)
        return fakultas ? fakultas.namaLengkap : fakultasId
    }

    // COMPLETELY FIXED: Filter logic with comprehensive matching
    const filteredData = programStudi.filter((item) => {
        const matchesSearch =
            item.nama.toLowerCase().includes(filters.search.toLowerCase()) ||
            getFakultasName(item.fakultas).toLowerCase().includes(filters.search.toLowerCase())

        // FIXED: Comprehensive fakultas matching - check ID, nama, and namaLengkap
        let matchesFakultas = filters.fakultas === "all"
        if (!matchesFakultas) {
            const selectedFakultas = fakultasList.find((f) => f.id === filters.fakultas)
            if (selectedFakultas) {
                matchesFakultas =
                    item.fakultas === selectedFakultas.id ||
                    item.fakultas === selectedFakultas.nama ||
                    item.fakultas === selectedFakultas.namaLengkap ||
                    item.fakultas.toLowerCase() === selectedFakultas.id.toLowerCase() ||
                    item.fakultas.toLowerCase() === selectedFakultas.nama.toLowerCase() ||
                    item.fakultas.toLowerCase() === selectedFakultas.namaLengkap.toLowerCase()
            } else {
                // Fallback: direct string comparison
                matchesFakultas =
                    item.fakultas === filters.fakultas || item.fakultas.toLowerCase() === filters.fakultas.toLowerCase()
            }
        }

        const matchesJenjang = filters.jenjang === "all" || item.jenjang === filters.jenjang
        const matchesAkreditasi = filters.akreditasi === "all" || item.akreditasi === filters.akreditasi
        const matchesStatus =
            filters.status === "all" ||
            (filters.status === "active" && item.isActive) ||
            (filters.status === "inactive" && !item.isActive)

        return matchesSearch && matchesFakultas && matchesJenjang && matchesAkreditasi && matchesStatus
    })

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = filteredData.slice(startIndex, endIndex)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = "/api/program-studi"
            const method = editingProgram ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Gagal menyimpan data")
            }

            toast({
                title: "✅ Berhasil",
                description: `Program studi berhasil ${editingProgram ? "diperbarui" : "ditambahkan"}`,
            })

            setDialogOpen(false)
            resetForm()
            fetchProgramStudi()
        } catch (error: any) {
            toast({
                title: "❌ Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (program: ProgramStudi) => {
        setEditingProgram(program)
        setFormData({
            id: program.id,
            nama: program.nama,
            fakultas: program.fakultas,
            jenjang: program.jenjang,
            akreditasi: program.akreditasi,
            biayaSemester: program.biayaSemester.toString(),
            deskripsi: program.deskripsi || "",
            isActive: program.isActive,
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string, nama: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus program studi "${nama}"?`)) return

        try {
            const response = await fetch(`/api/program-studi?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Gagal menghapus data")
            }

            toast({
                title: "✅ Berhasil",
                description: `Program studi "${nama}" berhasil dihapus`,
            })

            fetchProgramStudi()
        } catch (error: any) {
            toast({
                title: "❌ Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const resetForm = () => {
        setFormData({
            id: "",
            nama: "",
            fakultas: "",
            jenjang: "",
            akreditasi: "",
            biayaSemester: "",
            deskripsi: "",
            isActive: true,
        })
        setEditingProgram(null)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        resetForm()
    }

    const clearFilters = () => {
        setFilters({
            search: "",
            fakultas: "all",
            jenjang: "all",
            akreditasi: "all",
            status: "all",
        })
    }

    const getActiveFiltersCount = () => {
        let count = 0
        if (filters.search) count++
        if (filters.fakultas !== "all") count++
        if (filters.jenjang !== "all") count++
        if (filters.akreditasi !== "all") count++
        if (filters.status !== "all") count++
        return count
    }

    const removeFilter = (filterKey: keyof FilterState) => {
        setFilters({
            ...filters,
            [filterKey]: filterKey === "search" ? "" : "all",
        })
    }

    const getAkreditasiBadge = (akreditasi: string) => {
        const colors = {
            A: "bg-emerald-100 text-emerald-800 border-emerald-200",
            B: "bg-blue-100 text-blue-800 border-blue-200",
            C: "bg-amber-100 text-amber-800 border-amber-200",
            "Baik Sekali": "bg-emerald-100 text-emerald-800 border-emerald-200",
            Baik: "bg-blue-100 text-blue-800 border-blue-200",
            Unggul: "bg-purple-100 text-purple-800 border-purple-200",
        }
        return colors[akreditasi as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const generatePageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("...")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (loading) {
        return (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-green-200 to-emerald-200 rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48"></div>
                                <div className="h-4 bg-gray-200 rounded w-64"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-xl shadow-sm"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-white rounded-xl shadow-sm"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white shadow-lg">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Program Studi</h1>
                            <p className="text-gray-600 mt-1">Kelola data program studi dan akreditasi</p>
                        </div>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => setDialogOpen(true)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Tambah Program Studi</span>
                                <span className="sm:hidden">Tambah</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white mx-4 rounded-xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    {editingProgram ? "✏️ Edit Program Studi" : "➕ Tambah Program Studi"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="id" className="text-sm font-semibold text-gray-700">
                                        Kode Program Studi
                                    </Label>
                                    <Input
                                        id="id"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                        placeholder="Contoh: TI, SI, MI"
                                        required
                                        disabled={!!editingProgram}
                                        className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nama" className="text-sm font-semibold text-gray-700">
                                        Nama Program Studi
                                    </Label>
                                    <Input
                                        id="nama"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        placeholder="Teknik Informatika"
                                        required
                                        className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fakultas" className="text-sm font-semibold text-gray-700">
                                        Fakultas
                                    </Label>
                                    <Select
                                        value={formData.fakultas}
                                        onValueChange={(value) => setFormData({ ...formData, fakultas: value })}
                                    >
                                        <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 rounded-lg">
                                            <SelectValue placeholder="Pilih fakultas" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                                            {fakultasList
                                                .filter((f) => f.isActive)
                                                .map((fakultas) => (
                                                    <SelectItem key={fakultas.id} value={fakultas.id} className="text-gray-900 hover:bg-gray-50">
                                                        {fakultas.namaLengkap}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="jenjang" className="text-sm font-semibold text-gray-700">
                                            Jenjang
                                        </Label>
                                        <Select
                                            value={formData.jenjang}
                                            onValueChange={(value) => setFormData({ ...formData, jenjang: value })}
                                        >
                                            <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 rounded-lg">
                                                <SelectValue placeholder="Pilih" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                                                <SelectItem value="D3" className="text-gray-900 hover:bg-gray-50">
                                                    D3
                                                </SelectItem>
                                                <SelectItem value="D4" className="text-gray-900 hover:bg-gray-50">
                                                    D4
                                                </SelectItem>
                                                <SelectItem value="S1" className="text-gray-900 hover:bg-gray-50">
                                                    S1
                                                </SelectItem>
                                                <SelectItem value="S2" className="text-gray-900 hover:bg-gray-50">
                                                    S2
                                                </SelectItem>
                                                <SelectItem value="S3" className="text-gray-900 hover:bg-gray-50">
                                                    S3
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="akreditasi" className="text-sm font-semibold text-gray-700">
                                            Akreditasi
                                        </Label>
                                        <Select
                                            value={formData.akreditasi}
                                            onValueChange={(value) => setFormData({ ...formData, akreditasi: value })}
                                        >
                                            <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 rounded-lg">
                                                <SelectValue placeholder="Pilih" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                                                <SelectItem value="Unggul" className="text-gray-900 hover:bg-gray-50">
                                                    Unggul
                                                </SelectItem>
                                                <SelectItem value="Baik Sekali" className="text-gray-900 hover:bg-gray-50">
                                                    Baik Sekali
                                                </SelectItem>
                                                <SelectItem value="Baik" className="text-gray-900 hover:bg-gray-50">
                                                    Baik
                                                </SelectItem>
                                                <SelectItem value="A" className="text-gray-900 hover:bg-gray-50">
                                                    A
                                                </SelectItem>
                                                <SelectItem value="B" className="text-gray-900 hover:bg-gray-50">
                                                    B
                                                </SelectItem>
                                                <SelectItem value="C" className="text-gray-900 hover:bg-gray-50">
                                                    C
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="biayaSemester" className="text-sm font-semibold text-gray-700">
                                        Biaya Semester (Rp)
                                    </Label>
                                    <Input
                                        id="biayaSemester"
                                        type="number"
                                        value={formData.biayaSemester}
                                        onChange={(e) => setFormData({ ...formData, biayaSemester: e.target.value })}
                                        placeholder="5000000"
                                        required
                                        className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deskripsi" className="text-sm font-semibold text-gray-700">
                                        Deskripsi (Opsional)
                                    </Label>
                                    <Textarea
                                        id="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                        placeholder="Deskripsi program studi..."
                                        rows={3}
                                        className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 rounded-lg resize-none"
                                    />
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                                        Status Aktif
                                    </Label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                {editingProgram ? "Memperbarui..." : "Menyimpan..."}
                                            </>
                                        ) : (
                                            <>{editingProgram ? "✏️ Perbarui" : "💾 Simpan"}</>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDialogClose}
                                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total Program</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{programStudi.length}</p>
                                    <p className="text-xs text-blue-700 mt-1">Program Studi</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-green-600 mb-1">Program Aktif</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-green-900">
                                        {programStudi.filter((p) => p.isActive).length}
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">Sedang Berjalan</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-purple-600 mb-1">Akreditasi Unggul</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                                        {programStudi.filter((p) => p.akreditasi === "Unggul").length}
                                    </p>
                                    <p className="text-xs text-purple-700 mt-1">Terakreditasi</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">Program S1</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-indigo-900">
                                        {programStudi.filter((p) => p.jenjang === "S1").length}
                                    </p>
                                    <p className="text-xs text-indigo-700 mt-1">Sarjana</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-indigo-100 rounded-full">
                                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* IMPROVED: Filters Card with Better Spacing and Layout */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                                <Filter className="h-5 w-5 text-blue-600" />
                                Filter & Pencarian
                                {getActiveFiltersCount() > 0 && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                                        {getActiveFiltersCount()} aktif
                                    </Badge>
                                )}
                            </CardTitle>
                            {getActiveFiltersCount() > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9 px-3"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Cari program studi atau fakultas..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-10 h-12 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-gray-900 rounded-lg shadow-sm"
                            />
                            {filters.search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFilter("search")}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        {/* Filter Grid - IMPROVED with Better Spacing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Fakultas Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Fakultas</Label>
                                <Select value={filters.fakultas} onValueChange={(value) => setFilters({ ...filters, fakultas: value })}>
                                    <SelectTrigger className="h-12 bg-white border-gray-200 text-gray-900 rounded-lg shadow-sm hover:border-gray-300 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                                        <SelectValue placeholder="Semua Fakultas" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            Semua Fakultas
                                        </SelectItem>
                                        {fakultasList.map((fakultas) => (
                                            <SelectItem
                                                key={fakultas.id}
                                                value={fakultas.id}
                                                className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50"
                                            >
                                                {fakultas.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filters.fakultas !== "all" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter("fakultas")}
                                        className="h-6 text-xs text-gray-500 hover:text-gray-700 p-0"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Hapus filter
                                    </Button>
                                )}
                            </div>

                            {/* Jenjang Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Jenjang</Label>
                                <Select value={filters.jenjang} onValueChange={(value) => setFilters({ ...filters, jenjang: value })}>
                                    <SelectTrigger className="h-12 bg-white border-gray-200 text-gray-900 rounded-lg shadow-sm hover:border-gray-300 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                                        <SelectValue placeholder="Semua Jenjang" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            Semua Jenjang
                                        </SelectItem>
                                        <SelectItem value="D3" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            D3 - Diploma Tiga
                                        </SelectItem>
                                        <SelectItem value="D4" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            D4 - Diploma Empat
                                        </SelectItem>
                                        <SelectItem value="S1" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            S1 - Sarjana
                                        </SelectItem>
                                        <SelectItem value="S2" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            S2 - Magister
                                        </SelectItem>
                                        <SelectItem value="S3" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            S3 - Doktor
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {filters.jenjang !== "all" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter("jenjang")}
                                        className="h-6 text-xs text-gray-500 hover:text-gray-700 p-0"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Hapus filter
                                    </Button>
                                )}
                            </div>

                            {/* Akreditasi Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Akreditasi</Label>
                                <Select
                                    value={filters.akreditasi}
                                    onValueChange={(value) => setFilters({ ...filters, akreditasi: value })}
                                >
                                    <SelectTrigger className="h-12 bg-white border-gray-200 text-gray-900 rounded-lg shadow-sm hover:border-gray-300 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                                        <SelectValue placeholder="Semua Akreditasi" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            Semua Akreditasi
                                        </SelectItem>
                                        <SelectItem value="Unggul" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            🏆 Unggul
                                        </SelectItem>
                                        <SelectItem value="Baik Sekali" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            ⭐ Baik Sekali
                                        </SelectItem>
                                        <SelectItem value="Baik" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            ✅ Baik
                                        </SelectItem>
                                        <SelectItem value="A" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            🅰️ A
                                        </SelectItem>
                                        <SelectItem value="B" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            🅱️ B
                                        </SelectItem>
                                        <SelectItem value="C" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            🅲 C
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {filters.akreditasi !== "all" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter("akreditasi")}
                                        className="h-6 text-xs text-gray-500 hover:text-gray-700 p-0"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Hapus filter
                                    </Button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Status</Label>
                                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                    <SelectTrigger className="h-12 bg-white border-gray-200 text-gray-900 rounded-lg shadow-sm hover:border-gray-300 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
                                        <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            Semua Status
                                        </SelectItem>
                                        <SelectItem value="active" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            ✅ Aktif
                                        </SelectItem>
                                        <SelectItem value="inactive" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50">
                                            ❌ Tidak Aktif
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {filters.status !== "all" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter("status")}
                                        className="h-6 text-xs text-gray-500 hover:text-gray-700 p-0"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Hapus filter
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {getActiveFiltersCount() > 0 && (
                            <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Filter aktif:</span>
                                {filters.search && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"
                                    >
                                        🔍 "{filters.search}"
                                        <X className="h-3 w-3 cursor-pointer hover:text-blue-600" onClick={() => removeFilter("search")} />
                                    </Badge>
                                )}
                                {filters.fakultas !== "all" && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-800 border border-green-200 flex items-center gap-1"
                                    >
                                        🏫 {fakultasList.find((f) => f.id === filters.fakultas)?.nama}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-green-600"
                                            onClick={() => removeFilter("fakultas")}
                                        />
                                    </Badge>
                                )}
                                {filters.jenjang !== "all" && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"
                                    >
                                        🎓 {filters.jenjang}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-purple-600"
                                            onClick={() => removeFilter("jenjang")}
                                        />
                                    </Badge>
                                )}
                                {filters.akreditasi !== "all" && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1"
                                    >
                                        🏆 {filters.akreditasi}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-orange-600"
                                            onClick={() => removeFilter("akreditasi")}
                                        />
                                    </Badge>
                                )}
                                {filters.status !== "all" && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-1"
                                    >
                                        📊 {filters.status === "active" ? "Aktif" : "Tidak Aktif"}
                                        <X className="h-3 w-3 cursor-pointer hover:text-gray-600" onClick={() => removeFilter("status")} />
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Filter Results Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-5 border-t border-gray-200 bg-gray-50/50 -mx-8 -mb-8 px-8 py-5 rounded-b-lg">
                            <p className="text-sm text-gray-600">
                                Menampilkan <span className="font-semibold text-blue-600">{currentData.length}</span> dari{" "}
                                <span className="font-semibold text-green-600">{filteredData.length}</span> program studi
                                {filteredData.length !== programStudi.length && (
                                    <span className="text-gray-500"> (difilter dari {programStudi.length} total)</span>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table - COMPLETELY REMOVED Kode Column */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-green-600" />
                            Daftar Program Studi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                                        <TableHead className="text-gray-700 font-semibold w-16">No</TableHead>
                                        {/* COMPLETELY REMOVED: Kode column */}
                                        <TableHead className="text-gray-700 font-semibold min-w-[200px]">Program Studi</TableHead>
                                        <TableHead className="text-gray-700 font-semibold min-w-[150px]">Fakultas</TableHead>
                                        <TableHead className="text-gray-700 font-semibold min-w-[80px]">Jenjang</TableHead>
                                        <TableHead className="text-gray-700 font-semibold min-w-[100px]">Akreditasi</TableHead>
                                        <TableHead className="text-gray-700 font-semibold min-w-[130px]">Biaya Semester</TableHead>
                                        <TableHead className="text-gray-700 font-semibold min-w-[80px]">Status</TableHead>
                                        <TableHead className="text-center text-gray-700 font-semibold min-w-[100px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentData.map((item, index) => (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100"
                                        >
                                            <TableCell className="font-medium text-gray-600">{startIndex + index + 1}</TableCell>
                                            {/* COMPLETELY REMOVED: Kode cell and moved kode to subtitle */}
                                            <TableCell>
                                                <div className="font-semibold text-gray-900">{item.nama}</div>
                                                {/* REMOVED: Kode subtitle as requested */}
                                                {item.deskripsi && (
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.deskripsi}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-700">{getFakultasName(item.fakultas)}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-medium">
                                                    {item.jenjang}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`font-medium border ${getAkreditasiBadge(item.akreditasi)}`}>
                                                    {item.akreditasi}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900 text-sm">
                                                {formatCurrency(item.biayaSemester)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`font-medium ${item.isActive
                                                        ? "bg-green-100 text-green-800 border border-green-200"
                                                        : "bg-red-100 text-red-800 border border-red-200"
                                                        }`}
                                                >
                                                    {item.isActive ? "✅ Aktif" : "❌ Tidak Aktif"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(item)}
                                                        className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id, item.nama)}
                                                        className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200"
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

                        {/* Empty State */}
                        {currentData.length === 0 && (
                            <div className="text-center py-12">
                                {filteredData.length === 0 && programStudi.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                            <Search className="h-8 w-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data yang cocok</h3>
                                            <p className="text-gray-500 mb-4">Coba ubah filter atau kata kunci pencarian</p>
                                            <Button
                                                variant="outline"
                                                onClick={clearFilters}
                                                className="bg-white border-blue-300 text-blue-600 hover:bg-blue-50"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Reset Filter
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                            <BookOpen className="h-8 w-8 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada program studi</h3>
                                            <p className="text-gray-500">Mulai dengan menambahkan program studi pertama</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50/50">
                                <div className="text-sm text-gray-600 font-medium">
                                    Halaman <span className="text-blue-600">{currentPage}</span> dari{" "}
                                    <span className="text-green-600">{totalPages}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="hidden sm:inline ml-1">Sebelumnya</span>
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {generatePageNumbers().map((page, index) => (
                                            <Button
                                                key={index}
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => typeof page === "number" && setCurrentPage(page)}
                                                disabled={page === "..."}
                                                className={`w-9 h-9 p-0 ${page === currentPage
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                                    : page === "..."
                                                        ? "cursor-default bg-transparent border-none"
                                                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="hidden sm:inline mr-1">Selanjutnya</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
