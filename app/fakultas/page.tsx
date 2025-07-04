/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, School, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

interface Fakultas {
    id: string
    nama: string
    namaLengkap: string
    deskripsi: string | null
    akreditasi: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export default function FakultasPage() {
    const [fakultas, setFakultas] = useState<Fakultas[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingFakultas, setEditingFakultas] = useState<Fakultas | null>(null)
    const [formData, setFormData] = useState({
        id: "",
        nama: "",
        namaLengkap: "",
        deskripsi: "",
        akreditasi: "",
        isActive: true,
    })

    useEffect(() => {
        fetchFakultas()
    }, [])

    const fetchFakultas = async () => {
        try {
            const response = await fetch("/api/fakultas")
            const data = await response.json()
            setFakultas(data)
        } catch (error) {
            console.error("Error fetching fakultas:", error)
            toast({
                title: "Error",
                description: "Gagal memuat data fakultas",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = "/api/fakultas"
            const method = editingFakultas ? "PUT" : "POST"

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
                title: "Berhasil",
                description: `Fakultas berhasil ${editingFakultas ? "diperbarui" : "ditambahkan"}`,
            })

            setDialogOpen(false)
            resetForm()
            fetchFakultas()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleEdit = (fakultas: Fakultas) => {
        setEditingFakultas(fakultas)
        setFormData({
            id: fakultas.id,
            nama: fakultas.nama,
            namaLengkap: fakultas.namaLengkap,
            deskripsi: fakultas.deskripsi || "",
            akreditasi: fakultas.akreditasi,
            isActive: fakultas.isActive,
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus fakultas ini?")) return

        try {
            const response = await fetch(`/api/fakultas?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Gagal menghapus data")
            }

            toast({
                title: "Berhasil",
                description: "Fakultas berhasil dihapus",
            })

            fetchFakultas()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const resetForm = () => {
        setFormData({
            id: "",
            nama: "",
            namaLengkap: "",
            deskripsi: "",
            akreditasi: "",
            isActive: true,
        })
        setEditingFakultas(null)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        resetForm()
    }

    const getAkreditasiBadge = (akreditasi: string) => {
        const colors = {
            A: "bg-green-100 text-green-800 border-green-200",
            B: "bg-blue-100 text-blue-800 border-blue-200",
            C: "bg-yellow-100 text-yellow-800 border-yellow-200",
            "Baik Sekali": "bg-green-100 text-green-800 border-green-200",
            Baik: "bg-blue-100 text-blue-800 border-blue-200",
            Unggul: "bg-purple-100 text-purple-800 border-purple-200",
        }
        return colors[akreditasi as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
    }

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                    <div className="h-64 bg-white rounded-lg shadow"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
                        <School className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kelola Fakultas</h1>
                        <p className="text-gray-600">Manajemen data fakultas dan akreditasi</p>
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2 btn-solid">
                            <Plus className="h-4 w-4" />
                            Tambah Fakultas
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900">
                                {editingFakultas ? "Edit Fakultas" : "Tambah Fakultas Baru"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="id" className="text-gray-700">
                                    Kode Fakultas
                                </Label>
                                <Input
                                    id="id"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    placeholder="Contoh: FT, FE, FKIP"
                                    required
                                    disabled={!!editingFakultas}
                                    className="bg-white border-gray-300 text-gray-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nama" className="text-gray-700">
                                    Nama Singkat
                                </Label>
                                <Input
                                    id="nama"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Teknik, Ekonomi"
                                    required
                                    className="bg-white border-gray-300 text-gray-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="namaLengkap" className="text-gray-700">
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="namaLengkap"
                                    value={formData.namaLengkap}
                                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                                    placeholder="Fakultas Teknik"
                                    required
                                    className="bg-white border-gray-300 text-gray-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="akreditasi" className="text-gray-700">
                                    Akreditasi
                                </Label>
                                <Select
                                    value={formData.akreditasi}
                                    onValueChange={(value) => setFormData({ ...formData, akreditasi: value })}
                                >
                                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                        <SelectValue placeholder="Pilih akreditasi" />
                                    </SelectTrigger>
                                    <SelectContent className="select-content">
                                        <SelectItem value="Unggul" className="text-gray-900">
                                            Unggul
                                        </SelectItem>
                                        <SelectItem value="Baik Sekali" className="text-gray-900">
                                            Baik Sekali
                                        </SelectItem>
                                        <SelectItem value="Baik" className="text-gray-900">
                                            Baik
                                        </SelectItem>
                                        <SelectItem value="A" className="text-gray-900">
                                            A
                                        </SelectItem>
                                        <SelectItem value="B" className="text-gray-900">
                                            B
                                        </SelectItem>
                                        <SelectItem value="C" className="text-gray-900">
                                            C
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi" className="text-gray-700">
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Deskripsi fakultas (opsional)"
                                    rows={3}
                                    className="bg-white border-gray-300 text-gray-900"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive" className="text-gray-700">
                                    Aktif
                                </Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="flex-1 btn-solid">
                                    {editingFakultas ? "Perbarui" : "Simpan"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleDialogClose}
                                    className="btn-outline bg-transparent"
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-solid">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Fakultas</p>
                                <p className="text-3xl font-bold text-gray-900">{fakultas.length}</p>
                            </div>
                            <School className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-solid">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Fakultas Aktif</p>
                                <p className="text-3xl font-bold text-green-600">{fakultas.filter((f) => f.isActive).length}</p>
                            </div>
                            <Award className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-solid">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Akreditasi Unggul</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {fakultas.filter((f) => f.akreditasi === "Unggul" || f.akreditasi === "A").length}
                                </p>
                            </div>
                            <Award className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card className="card-solid">
                <CardHeader>
                    <CardTitle className="text-gray-900">Daftar Fakultas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-gray-700">Kode</TableHead>
                                    <TableHead className="text-gray-700">Nama Fakultas</TableHead>
                                    <TableHead className="text-gray-700">Akreditasi</TableHead>
                                    <TableHead className="text-gray-700">Status</TableHead>
                                    <TableHead className="text-gray-700">Tanggal Dibuat</TableHead>
                                    <TableHead className="text-center text-gray-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fakultas.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-gray-900">{item.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">{item.namaLengkap}</div>
                                                <div className="text-sm text-gray-500">{item.nama}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getAkreditasiBadge(item.akreditasi)}`}
                                            >
                                                {item.akreditasi}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {item.isActive ? "Aktif" : "Tidak Aktif"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-900">
                                            {new Date(item.createdAt).toLocaleDateString("id-ID")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                    className="h-8 w-8 p-0 btn-outline"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
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

                    {fakultas.length === 0 && (
                        <div className="text-center py-8">
                            <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada fakultas</h3>
                            <p className="text-gray-500">Mulai dengan menambahkan fakultas pertama</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
