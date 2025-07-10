/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Newspaper, Upload, Edit, Eye, EyeOff, RefreshCw, Trash2, Plus, Calendar, Link, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Berita {
    id: string
    judul: string
    konten: string
    gambar: string
    slug: string
    linkUrl: string | null
    tanggal: string
    aktif: boolean
    createdAt: string
    updatedAt: string
}

function BeritaPage() {
    const [berita, setBerita] = useState<Berita[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editingBerita, setEditingBerita] = useState<Berita | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        id: "",
        judul: "",
        konten: "",
        gambar: "",
        slug: "",
        linkUrl: "",
        aktif: true,
    })

    useEffect(() => {
        fetchBerita()
    }, [])

    const fetchBerita = async () => {
        try {
            const response = await fetch("/api/berita")
            if (response.ok) {
                const data = await response.json()
                setBerita(data)
            }
        } catch (error) {
            console.error("Error fetching berita:", error)
            toast({
                title: "Error",
                description: "Gagal memuat data berita",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Error",
                description: "File harus berupa gambar",
                variant: "destructive",
            })
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Error",
                description: "Ukuran file maksimal 5MB",
                variant: "destructive",
            })
            return
        }

        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        try {
            const response = await fetch("/api/berita/upload", {
                method: "POST",
                body: formDataUpload,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            setFormData((prev) => ({ ...prev, gambar: data.imageUrl }))

            toast({
                title: "Berhasil",
                description: "Gambar berhasil diupload",
            })
        } catch (error) {
            console.error("Upload error:", error)
            toast({
                title: "Error",
                description: "Gagal mengupload gambar",
                variant: "destructive",
            })
        } finally {
            setUploading(false)
        }
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    }

    const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const judul = e.target.value
        setFormData((prev) => ({
            ...prev,
            judul,
            slug: generateSlug(judul),
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = "/api/berita"
            const method = editingBerita ? "PUT" : "POST"

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
                description: `Berita berhasil ${editingBerita ? "diperbarui" : "ditambahkan"}`,
            })

            setDialogOpen(false)
            resetForm()
            fetchBerita()
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

    const handleEdit = (item: Berita) => {
        setEditingBerita(item)
        setFormData({
            id: item.id,
            judul: item.judul,
            konten: item.konten,
            gambar: item.gambar,
            slug: item.slug,
            linkUrl: item.linkUrl || "",
            aktif: item.aktif,
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return

        try {
            const response = await fetch(`/api/berita?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Gagal menghapus data")
            }

            toast({
                title: "Berhasil",
                description: "Berita berhasil dihapus",
            })

            fetchBerita()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const toggleStatus = async (item: Berita) => {
        try {
            const response = await fetch("/api/berita", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...item,
                    aktif: !item.aktif,
                }),
            })

            if (!response.ok) {
                throw new Error("Gagal mengubah status")
            }

            toast({
                title: "Berhasil",
                description: `Berita ${!item.aktif ? "diaktifkan" : "dinonaktifkan"}`,
            })

            fetchBerita()
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
            judul: "",
            konten: "",
            gambar: "",
            slug: "",
            linkUrl: "",
            aktif: true,
        })
        setEditingBerita(null)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        resetForm()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const filteredBerita = berita.filter((item) => item.judul.toLowerCase().includes(searchTerm.toLowerCase()))

    if (loading) {
        return (
            <div className="page-container">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                        <div className="h-96 bg-white rounded-xl shadow"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg text-white">
                            <Newspaper className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Kelola Berita</h1>
                            <p className="text-gray-600">Manajemen berita dan pengumuman website</p>
                        </div>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                                <Plus className="h-4 w-4" />
                                Tambah Berita
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-white mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-gray-900">
                                    {editingBerita ? "Edit Berita" : "Tambah Berita Baru"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="judul" className="text-gray-700">
                                        Judul Berita
                                    </Label>
                                    <Input
                                        id="judul"
                                        value={formData.judul}
                                        onChange={handleJudulChange}
                                        placeholder="Masukkan judul berita"
                                        required
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-gray-700">
                                        Slug URL
                                    </Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="judul-berita-dalam-format-url"
                                        required
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Slug akan otomatis dibuat dari judul, tapi bisa diubah jika diperlukan
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="konten" className="text-gray-700">
                                        Konten Berita
                                    </Label>
                                    <Textarea
                                        id="konten"
                                        value={formData.konten}
                                        onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                                        placeholder="Tulis konten berita di sini..."
                                        required
                                        rows={6}
                                        className="bg-white border-gray-300 text-gray-900 resize-y"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image" className="text-gray-700">
                                        Upload Gambar Berita
                                    </Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                        <label htmlFor="image" className="flex flex-col items-center justify-center cursor-pointer">
                                            {uploading ? (
                                                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                                            ) : (
                                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            )}
                                            <span className="text-sm text-gray-600">
                                                {uploading ? "Mengupload..." : "Klik untuk upload gambar"}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 5MB)</span>
                                        </label>
                                    </div>
                                    {formData.gambar && (
                                        <div className="mt-2">
                                            <Image
                                                src={formData.gambar || "/placeholder.svg"}
                                                alt="Preview"
                                                width={200}
                                                height={150}
                                                className="rounded-lg object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkUrl" className="text-gray-700">
                                        Link URL (Opsional)
                                    </Label>
                                    <Input
                                        id="linkUrl"
                                        type="url"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                        placeholder="https://www.ut.ac.id/"
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Link untuk tombol "Baca Selengkapnya" (kosongkan jika tidak diperlukan)
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="aktif"
                                        checked={formData.aktif}
                                        onCheckedChange={(checked) => setFormData({ ...formData, aktif: checked })}
                                    />
                                    <Label htmlFor="aktif" className="text-gray-700">
                                        Aktif (Tampilkan di website)
                                    </Label>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !formData.gambar}
                                        className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                {editingBerita ? "Memperbarui..." : "Menyimpan..."}
                                            </>
                                        ) : (
                                            <>{editingBerita ? "Perbarui" : "Simpan"}</>
                                        )}
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
                                    <p className="text-sm font-medium text-gray-600">Total Berita</p>
                                    <p className="text-3xl font-bold text-gray-900">{berita.length}</p>
                                </div>
                                <Newspaper className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-solid">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Berita Aktif</p>
                                    <p className="text-3xl font-bold text-green-600">{berita.filter((b) => b.aktif).length}</p>
                                </div>
                                <Eye className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-solid">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Berita Nonaktif</p>
                                    <p className="text-3xl font-bold text-red-600">{berita.filter((b) => !b.aktif).length}</p>
                                </div>
                                <EyeOff className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Cari berita berdasarkan judul..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-gray-300"
                    />
                </div>

                {/* Data Table */}
                <Card className="card-solid">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-orange-600" />
                            Daftar Berita
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-gray-700 w-12">No</TableHead>
                                        <TableHead className="text-gray-700">Gambar</TableHead>
                                        <TableHead className="text-gray-700">Judul</TableHead>
                                        <TableHead className="text-gray-700">Slug</TableHead>
                                        <TableHead className="text-gray-700">Tanggal</TableHead>
                                        <TableHead className="text-gray-700">Status</TableHead>
                                        <TableHead className="text-center text-gray-700">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBerita.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-gray-900">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="w-16 h-12 relative">
                                                    <Image
                                                        src={item.gambar || "/placeholder.svg"}
                                                        alt={item.judul}
                                                        fill
                                                        className="rounded object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-2">{item.judul}</div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        {item.linkUrl && (
                                                            <>
                                                                <Link className="h-3 w-3" />
                                                                <a
                                                                    href={item.linkUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    Link URL
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 font-mono text-xs">{item.slug}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${item.aktif ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
                                                >
                                                    {item.aktif ? "Aktif" : "Nonaktif"}
                                                </Badge>
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
                                                        onClick={() => toggleStatus(item)}
                                                        className={`h-8 w-8 p-0 ${item.aktif
                                                                ? "text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                                                                : "text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                                                            }`}
                                                    >
                                                        {item.aktif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

                        {filteredBerita.length === 0 && (
                            <div className="text-center py-8">
                                <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada berita</h3>
                                <p className="text-gray-500">Mulai dengan menambahkan berita pertama</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default BeritaPage
