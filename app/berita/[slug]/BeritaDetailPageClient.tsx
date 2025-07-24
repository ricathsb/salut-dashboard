"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Tag, Share2, Facebook, Twitter, Linkedin, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Berita {
    id: string
    judul: string
    konten: string
    gambar: string
    slug: string
    jenis: "internal" | "eksternal"
    excerpt?: string
    author?: string
    tags?: string
    createdAt: string
    updatedAt: string
}

interface BeritaDetailPageClientProps {
    berita: Berita
}

export default function BeritaDetailPageClient({ berita }: BeritaDetailPageClientProps) {
    const [copied, setCopied] = useState(false)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const handleShare = async (platform: string) => {
        const url = window.location.href
        const title = berita.judul

        switch (platform) {
            case "facebook":
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
                break
            case "twitter":
                window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
                    "_blank",
                )
                break
            case "linkedin":
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
                break
            case "copy":
                try {
                    await navigator.clipboard.writeText(url)
                    setCopied(true)
                    toast({
                        title: "Berhasil",
                        description: "Link berhasil disalin ke clipboard",
                    })
                    setTimeout(() => setCopied(false), 2000)
                } catch (error) {
                    console.error("Failed to copy:", error)
                    toast({
                        title: "Error",
                        description: "Gagal menyalin link",
                        variant: "destructive",
                    })
                }
                break
        }
    }

    const tags = berita.tags ? berita.tags.split(",").map((tag) => tag.trim()) : []

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
                        <Link href="/berita">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Berita
                        </Link>
                    </Button>
                </div>

                {/* Article Header */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="mb-6">
                            <Badge className="mb-4">{berita.jenis === "internal" ? "Berita Internal" : "Berita Eksternal"}</Badge>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{berita.judul}</h1>

                            {berita.excerpt && <p className="text-xl text-gray-600 mb-6 leading-relaxed">{berita.excerpt}</p>}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(berita.createdAt)}</span>
                                </div>
                                {berita.author && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>{berita.author}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                    <Tag className="h-4 w-4 text-gray-500" />
                                    {tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Featured Image */}
                        {berita.gambar && (
                            <div className="mb-8">
                                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                                    <Image
                                        src={berita.gambar || "/placeholder.svg"}
                                        alt={berita.judul}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                        )}

                        {/* Share Buttons */}
                        <div className="flex items-center gap-2 mb-8 pb-6 border-b">
                            <span className="text-sm font-medium text-gray-700 mr-2">Bagikan:</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare("facebook")}
                                className="flex items-center gap-1"
                            >
                                <Facebook className="h-4 w-4" />
                                Facebook
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare("twitter")}
                                className="flex items-center gap-1"
                            >
                                <Twitter className="h-4 w-4" />
                                Twitter
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare("linkedin")}
                                className="flex items-center gap-1"
                            >
                                <Linkedin className="h-4 w-4" />
                                LinkedIn
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare("copy")}
                                className="flex items-center gap-1"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Tersalin" : "Salin Link"}
                            </Button>
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none">
                            {berita.jenis === "internal" ? (
                                <div className="text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: berita.konten }} />
                            ) : (
                                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{berita.konten}</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Article Footer */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="text-sm text-gray-500">
                                <p>Terakhir diperbarui: {formatDate(berita.updatedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
                                    <Share2 className="h-4 w-4 mr-1" />
                                    Bagikan Artikel
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/berita">Lihat Berita Lainnya</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
