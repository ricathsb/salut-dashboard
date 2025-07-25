/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
    Newspaper,
    Upload,
    Edit,
    Eye,
    EyeOff,
    RefreshCw,
    Trash2,
    Plus,
    Calendar,
    Link,
    Search,
    FileText,
    Globe,
    TagIcon,
    X,
    Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TiptapEditor from "@/components/tiptap-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Berita {
    id: string
    judul: string
    konten: string
    gambar: string
    slug: string
    linkUrl: string | null
    jenis: "internal" | "eksternal"
    excerpt?: string
    metaTitle?: string
    metaDescription?: string
    tags?: string
    author?: string
    tanggal: string
    tampilDiCarousel: boolean
    aktif: boolean
    createdAt: string
    updatedAt: string
}

interface Tag {
    id: string
    nama: string
    slug: string
    warna: string
    aktif: boolean
}

function BeritaPage() {
    const [berita, setBerita] = useState<Berita[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editingBerita, setEditingBerita] = useState<Berita | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("semua")
    const [jenisBerita, setJenisBerita] = useState<"internal" | "eksternal">("eksternal")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [newTagName, setNewTagName] = useState("")
    const [showNewTagInput, setShowNewTagInput] = useState(false)

    const [formData, setFormData] = useState({
        id: "",
        judul: "",
        konten: "",
        kontenHtml: "",
        gambar: "",
        slug: "",
        linkUrl: "",
        jenis: "eksternal" as "internal" | "eksternal",
        excerpt: "",
        metaTitle: "",
        metaDescription: "",
        tags: "",
        author: "",
        tampilDiCarousel: false,
        aktif: true,
    })

    useEffect(() => {
        fetchBerita()
        fetchTags()
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

    const fetchTags = async () => {
        try {
            const response = await fetch("/api/tags")
            if (response.ok) {
                const data = await response.json()
                setTags(data)
            }
        } catch (error) {
            console.error("Error fetching tags:", error)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Error",
                description: "File harus berupa gambar",
                variant: "destructive",
            })
            return
        }

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
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
    }

    const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const judul = e.target.value
        setFormData((prev) => ({
            ...prev,
            judul,
            slug: generateSlug(judul),
            metaTitle: judul,
        }))
    }

    const handleTagSelect = (tagName: string) => {
        if (!selectedTags.includes(tagName)) {
            setSelectedTags([...selectedTags, tagName])
        }
    }

    const handleTagRemove = (tagName: string) => {
        selectedTags.filter((tag) => tag !== tagName)
        setSelectedTags(selectedTags.filter((tag) => tag !== tagName))
    }

    const handleCreateNewTag = async () => {
        if (!newTagName.trim()) return

        try {
            const response = await fetch("/api/tags", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nama: newTagName.trim(),
                    warna: "#3b82f6",
                }),
            })

            if (response.ok) {
                const newTag = await response.json()
                setTags([...tags, newTag])
                setSelectedTags([...selectedTags, newTag.nama])
                setNewTagName("")
                setShowNewTagInput(false)
                toast({
                    title: "Berhasil",
                    description: "Tag baru berhasil dibuat",
                })
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.error || "Gagal membuat tag",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error creating tag:", error)
            toast({
                title: "Error",
                description: "Gagal membuat tag",
                variant: "destructive",
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = "/api/berita"
            const method = editingBerita ? "PUT" : "POST"

            const payload = {
                ...formData,
                tags: selectedTags.join(", "),
                ...(jenisBerita === "internal" && { kontenHtml: formData.kontenHtml }),
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
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
        setJenisBerita(item.jenis)
        setSelectedTags(item.tags ? item.tags.split(", ").filter((tag) => tag.trim()) : [])
        setFormData({
            id: item.id,
            judul: item.judul,
            konten: item.jenis === "eksternal" ? item.konten : "",
            kontenHtml: item.jenis === "internal" ? item.konten : "",
            gambar: item.gambar,
            slug: item.slug,
            linkUrl: item.linkUrl || "",
            jenis: item.jenis,
            excerpt: item.excerpt || "",
            metaTitle: item.metaTitle || "",
            metaDescription: item.metaDescription || "",
            tags: item.tags || "",
            author: item.author || "",
            tampilDiCarousel: item.tampilDiCarousel,
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
            kontenHtml: "",
            gambar: "",
            slug: "",
            linkUrl: "",
            jenis: "eksternal",
            excerpt: "",
            metaTitle: "",
            metaDescription: "",
            tags: "",
            author: "",
            tampilDiCarousel: false,
            aktif: true,
        })
        setEditingBerita(null)
        setJenisBerita("eksternal")
        setSelectedTags([])
        setNewTagName("")
        setShowNewTagInput(false)
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

    const filteredBerita = berita.filter((item) => {
        const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTab = activeTab === "semua" || item.jenis === activeTab
        return matchesSearch && matchesTab
    })

    const getJenisBadge = (jenis: string) => {
        return jenis === "internal"
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : "bg-green-100 text-green-800 border-green-200"
    }

    const getTagColor = (tagName: string) => {
        const tag = tags.find((t) => t.nama === tagName)
        return tag?.warna || "#3b82f6"
    }

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
                            <p className="text-gray-600">Manajemen berita internal dan eksternal dengan Tiptap Editor</p>
                        </div>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                                <Plus className="h-4 w-4" />
                                Tambah Berita
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl bg-white mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-gray-900">
                                    {editingBerita ? "Edit Berita" : "Tambah Berita Baru"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Pilih Jenis Berita */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Jenis Berita</Label>
                                    <Select
                                        value={formData.jenis}
                                        onValueChange={(value: "internal" | "eksternal") => {
                                            setFormData({ ...formData, jenis: value })
                                            setJenisBerita(value)
                                        }}
                                    >
                                        <SelectTrigger className="bg-white border-gray-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="eksternal">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    Berita Eksternal (Link ke website lain)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="internal">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Berita Internal (Artikel lengkap)
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                    {jenisBerita === "internal" && (
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
                                        </div>
                                    )}
                                </div>

                                {/* Tags Section */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Tags</Label>

                                    {/* Selected Tags */}
                                    {selectedTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {selectedTags.map((tagName) => (
                                                <Badge
                                                    key={tagName}
                                                    className="flex items-center gap-1 px-2 py-1"
                                                    style={{
                                                        backgroundColor: getTagColor(tagName) + "20",
                                                        color: getTagColor(tagName),
                                                        border: `1px solid ${getTagColor(tagName)}40`,
                                                    }}
                                                >
                                                    <TagIcon className="h-3 w-3" />
                                                    {tagName}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTagRemove(tagName)}
                                                        className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Available Tags */}
                                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {tags
                                                .filter((tag) => !selectedTags.includes(tag.nama))
                                                .map((tag) => (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() => handleTagSelect(tag.nama)}
                                                        className="px-2 py-1 text-xs rounded-full border hover:bg-gray-100 transition-colors"
                                                        style={{
                                                            borderColor: tag.warna + "40",
                                                            color: tag.warna,
                                                            backgroundColor: tag.warna + "10",
                                                        }}
                                                    >
                                                        + {tag.nama}
                                                    </button>
                                                ))}
                                        </div>

                                        {/* Add New Tag */}
                                        {showNewTagInput ? (
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    value={newTagName}
                                                    onChange={(e) => setNewTagName(e.target.value)}
                                                    placeholder="Nama tag baru"
                                                    className="flex-1 h-8 text-sm"
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            handleCreateNewTag()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" size="sm" onClick={handleCreateNewTag} className="h-8 px-3 text-xs">
                                                    Tambah
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowNewTagInput(false)
                                                        setNewTagName("")
                                                    }}
                                                    className="h-8 px-3 text-xs"
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowNewTagInput(true)}
                                                className="h-8 px-3 text-xs text-gray-600 border-dashed"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Buat Tag Baru
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Konten berdasarkan jenis */}
                                {jenisBerita === "internal" ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Konten Berita (Rich Text Editor)</Label>
                                            <TiptapEditor
                                                value={formData.kontenHtml}
                                                onChange={(content) => setFormData({ ...formData, kontenHtml: content })}
                                                height={500}
                                                placeholder="Tulis konten berita lengkap di sini..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="excerpt" className="text-gray-700">
                                                Ringkasan/Excerpt
                                            </Label>
                                            <Textarea
                                                id="excerpt"
                                                value={formData.excerpt}
                                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                                placeholder="Ringkasan singkat untuk preview..."
                                                rows={3}
                                                className="bg-white border-gray-300 text-gray-900"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="author" className="text-gray-700">
                                                    Penulis
                                                </Label>
                                                <Input
                                                    id="author"
                                                    value={formData.author}
                                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                    placeholder="Nama penulis"
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        {/* SEO Fields */}
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-gray-900">SEO Settings</h3>

                                            <div className="space-y-2">
                                                <Label htmlFor="metaTitle" className="text-gray-700">
                                                    Meta Title
                                                </Label>
                                                <Input
                                                    id="metaTitle"
                                                    value={formData.metaTitle}
                                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                                    placeholder="Judul untuk SEO (max 60 karakter)"
                                                    maxLength={60}
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                                <p className="text-xs text-gray-500">{formData.metaTitle.length}/60 karakter</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="metaDescription" className="text-gray-700">
                                                    Meta Description
                                                </Label>
                                                <Textarea
                                                    id="metaDescription"
                                                    value={formData.metaDescription}
                                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                                    placeholder="Deskripsi untuk SEO (max 160 karakter)"
                                                    maxLength={160}
                                                    rows={3}
                                                    className="bg-white border-gray-300 text-gray-900"
                                                />
                                                <p className="text-xs text-gray-500">{formData.metaDescription.length}/160 karakter</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="konten" className="text-gray-700">
                                                Ringkasan Berita
                                            </Label>
                                            <Textarea
                                                id="konten"
                                                value={formData.konten}
                                                onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                                                placeholder="Tulis ringkasan berita di sini..."
                                                required
                                                rows={6}
                                                className="bg-white border-gray-300 text-gray-900 resize-y"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="linkUrl" className="text-gray-700">
                                                Link URL Berita
                                            </Label>
                                            <Input
                                                id="linkUrl"
                                                type="url"
                                                value={formData.linkUrl}
                                                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                                placeholder="https://www.ut.ac.id/berita/..."
                                                required={jenisBerita === "eksternal"}
                                                className="bg-white border-gray-300 text-gray-900"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Upload Gambar */}
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

                                {/* Settings */}
                                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900">Pengaturan Tampilan</h3>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="tampilDiCarousel"
                                            checked={formData.tampilDiCarousel}
                                            onCheckedChange={(checked) => setFormData({ ...formData, tampilDiCarousel: checked })}
                                        />
                                        <Label htmlFor="tampilDiCarousel" className="text-gray-700 flex items-center gap-2">
                                            <Monitor className="h-4 w-4" />
                                            Tampilkan di Carousel (Halaman Utama)
                                        </Label>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                                    <p className="text-sm font-medium text-gray-600">Berita Internal</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {berita.filter((b) => b.jenis === "internal").length}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-solid">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Berita Eksternal</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {berita.filter((b) => b.jenis === "eksternal").length}
                                    </p>
                                </div>
                                <Globe className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-solid">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Di Carousel</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {berita.filter((b) => b.tampilDiCarousel).length}
                                    </p>
                                </div>
                                <Monitor className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-solid">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Berita Aktif</p>
                                    <p className="text-3xl font-bold text-emerald-600">{berita.filter((b) => b.aktif).length}</p>
                                </div>
                                <Eye className="h-8 w-8 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs dan Search */}
                <Card className="card-solid">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                                <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                                    <TabsTrigger value="semua">Semua</TabsTrigger>
                                    <TabsTrigger value="internal">Internal</TabsTrigger>
                                    <TabsTrigger value="eksternal">Eksternal</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Cari berita berdasarkan judul..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white border-gray-300"
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-gray-700 w-12">No</TableHead>
                                        <TableHead className="text-gray-700">Gambar</TableHead>
                                        <TableHead className="text-gray-700">Judul</TableHead>
                                        <TableHead className="text-gray-700">Jenis</TableHead>
                                        <TableHead className="text-gray-700">Tags</TableHead>
                                        <TableHead className="text-gray-700">Carousel</TableHead>
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
                                                    {item.jenis === "eksternal" && item.linkUrl && (
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                            <Link className="h-3 w-3" />
                                                            <a
                                                                href={item.linkUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Link URL
                                                            </a>
                                                        </div>
                                                    )}
                                                    {item.jenis === "internal" && item.author && (
                                                        <div className="text-xs text-gray-500 mt-1">Penulis: {item.author}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getJenisBadge(item.jenis)}`}>
                                                    {item.jenis === "internal" ? "Internal" : "Eksternal"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags &&
                                                        item.tags
                                                            .split(", ")
                                                            .filter((tag) => tag.trim())
                                                            .map((tagName, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    className="text-xs px-1 py-0.5"
                                                                    style={{
                                                                        backgroundColor: getTagColor(tagName) + "20",
                                                                        color: getTagColor(tagName),
                                                                        border: `1px solid ${getTagColor(tagName)}40`,
                                                                    }}
                                                                >
                                                                    {tagName}
                                                                </Badge>
                                                            ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${item.tampilDiCarousel
                                                            ? "bg-purple-100 text-purple-800 border-purple-200"
                                                            : "bg-gray-100 text-gray-800 border-gray-200"
                                                        }`}
                                                >
                                                    {item.tampilDiCarousel ? "Ya" : "Tidak"}
                                                </Badge>
                                            </TableCell>
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
                                                        variant="whiteOutline"
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
                                                        variant="whiteOutline"
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
