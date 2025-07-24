"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, List, ListOrdered, Quote, LinkIcon, Eye, EyeOff } from "lucide-react"

interface SimpleEditorProps {
    value: string
    onChange: (content: string) => void
    height?: number
    placeholder?: string
}

export default function SimpleEditor({
    value,
    onChange,
    height = 400,
    placeholder = "Tulis konten berita di sini...",
}: SimpleEditorProps) {
    const [content, setContent] = useState(value)
    const [isPreview, setIsPreview] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // Handle SSR
    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        setContent(value)
    }, [value])

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value
        setContent(newContent)
        onChange(newContent)
    }

    const insertMarkdown = (before: string, after = "") => {
        const textarea = document.querySelector("textarea[data-simple-editor]") as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = content.substring(start, end)
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

        setContent(newText)
        onChange(newText)

        // Restore cursor position
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, end + before.length)
        }, 0)
    }

    const formatMarkdownToHtml = (markdown: string) => {
        return markdown
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/^### (.*$)/gim, "<h3>$1</h3>")
            .replace(/^## (.*$)/gim, "<h2>$1</h2>")
            .replace(/^# (.*$)/gim, "<h1>$1</h1>")
            .replace(/^\* (.*$)/gim, "<li>$1</li>")
            .replace(/^(\d+)\. (.*$)/gim, "<li>$1. $2</li>")
            .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
            .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/\n/g, "<br>")
    }

    if (!isMounted) {
        return (
            <div className="border border-gray-300 rounded-lg bg-white">
                <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse"></div>
                <div className="animate-pulse bg-gray-50" style={{ height: `${height}px` }}></div>
            </div>
        )
    }

    return (
        <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-gray-200 bg-gray-50 p-2">
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown("**", "**")}
                        className="h-8 w-8 p-0"
                        title="Bold"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown("*", "*")}
                        className="h-8 w-8 p-0"
                        title="Italic"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown("* ")}
                        className="h-8 w-8 p-0"
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown("1. ")}
                        className="h-8 w-8 p-0"
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown("> ")}
                        className="h-8 w-8 p-0"
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown("[", "](url)")}
                        className="h-8 w-8 p-0"
                        title="Link"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <Button
                        type="button"
                        variant={isPreview ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setIsPreview(!isPreview)}
                        className="h-8 px-3"
                        title="Toggle Preview"
                    >
                        {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="ml-1 text-xs">{isPreview ? "Edit" : "Preview"}</span>
                    </Button>
                </div>
            </div>

            {/* Editor/Preview Content */}
            <div className="relative">
                {isPreview ? (
                    <div
                        className="p-4 prose prose-sm max-w-none overflow-y-auto"
                        style={{ minHeight: `${height - 60}px`, maxHeight: "600px" }}
                        dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }}
                    />
                ) : (
                    <Textarea
                        data-simple-editor
                        value={content}
                        onChange={handleContentChange}
                        placeholder={placeholder}
                        className="border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                        style={{ minHeight: `${height - 60}px`, maxHeight: "600px" }}
                    />
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Editor Markdown Sederhana</span>
                    <div className="flex items-center gap-4">
                        <span>{content.length} karakter</span>
                        <span>Gunakan **bold**, *italic*, # heading, * list</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
