/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ImageIcon, Upload, Edit, Eye, EyeOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface Brosur {
    id: string
    imageUrl: string
    linkUrl: string
    aktif: boolean
    createdAt: string
    updatedAt: string
}

function BrosurPage() {
    const [brosur, setBrosur] = useState<Brosur | null>(null)
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        imageUrl: "",
        linkUrl: "",
        aktif: true,
    })

    useEffect(() => {
        fetchBrosur()
    }, [])

    const fetchBrosur = async () => {
        try {
            const response = await fetch("/api/brosur")
            if (response.ok) {
                const data = await response.json()
                setBrosur(data)
                if (data) {
                    setFormData({
                        imageUrl: data.imageUrl,
                        linkUrl: data.linkUrl,
                        aktif: data.aktif,
                    })
                }
            }
        } catch (error) {
            console.error("Error fetching brosur:", error)
            toast({
                title: "Error",
                description: "Gagal memuat data brosur",
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
            const response = await fetch("/api/brosur/upload", {
                method: "POST",
                body: formDataUpload,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }))

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = "/api/brosur"
            const method = brosur ? "PUT" : "POST"

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
                description: `Brosur berhasil ${brosur ? "diperbarui" : "ditambahkan"}`,
            })

            setDialogOpen(false)
            fetchBrosur()
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

    const toggleStatus = async () => {
        if (!brosur) return

        try {
            const response = await fetch("/api/brosur", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    aktif: !brosur.aktif,
                }),
            })

            if (!response.ok) {
                throw new Error("Gagal mengubah status")
            }

            toast({
                title: "Berhasil",
                description: `Brosur ${!brosur.aktif ? "diaktifkan" : "dinonaktifkan"}`,
            })

            fetchBrosur()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="max-w-4xl mx-auto">
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
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Kelola Brosur</h1>
                            <p className="text-gray-600">Manajemen brosur popup website</p>
                        </div>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 btn-solid">
                                <Edit className="h-4 w-4" />
                                {brosur ? "Edit Brosur" : "Tambah Brosur"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-gray-900">{brosur ? "Edit Brosur" : "Tambah Brosur Baru"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image" className="text-gray-700">
                                        Upload Gambar Brosur
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
                                    {formData.imageUrl && (
                                        <div className="mt-2">
                                            <Image
                                                src={formData.imageUrl || "/placeholder.svg"}
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
                                        Link URL
                                    </Label>
                                    <Input
                                        id="linkUrl"
                                        type="url"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                        placeholder="https://www.ut.ac.id/"
                                        required
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="aktif"
                                        checked={formData.aktif}
                                        onCheckedChange={(checked) => setFormData({ ...formData, aktif: checked })}
                                    />
                                    <Label htmlFor="aktif" className="text-gray-700">
                                        Aktif (Tampilkan popup)
                                    </Label>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={isSubmitting || !formData.imageUrl} className="flex-1 btn-solid">
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                {brosur ? "Memperbarui..." : "Menyimpan..."}
                                            </>
                                        ) : (
                                            <>{brosur ? "Perbarui" : "Simpan"}</>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        className="btn-outline bg-transparent"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Current Brosur Display */}
                <Card className="card-solid">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-purple-600" />
                            Brosur Saat Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {brosur ? (
                            <div className="space-y-4">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={brosur.imageUrl || "/placeholder.svg"}
                                            alt="Brosur"
                                            width={300}
                                            height={400}
                                            className="rounded-lg shadow-lg object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Link URL</Label>
                                            <div className="mt-1">
                                                <a
                                                    href={brosur.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline break-all"
                                                >
                                                    {brosur.linkUrl}
                                                </a>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Status</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${brosur.aktif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {brosur.aktif ? "Aktif" : "Tidak Aktif"}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={toggleStatus}
                                                    className="flex items-center gap-1 bg-transparent"
                                                >
                                                    {brosur.aktif ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4" />
                                                            Nonaktifkan
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4" />
                                                            Aktifkan
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label className="text-gray-700">Dibuat</Label>
                                                <p className="text-gray-900">{new Date(brosur.createdAt).toLocaleDateString("id-ID")}</p>
                                            </div>
                                            <div>
                                                <Label className="text-gray-700">Diperbarui</Label>
                                                <p className="text-gray-900">{new Date(brosur.updatedAt).toLocaleDateString("id-ID")}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada brosur</h3>
                                <p className="text-gray-500">Tambahkan brosur pertama untuk ditampilkan di website</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default BrosurPage
