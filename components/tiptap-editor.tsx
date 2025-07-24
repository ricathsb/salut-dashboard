"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { Color } from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import { useEffect, useState } from "react"
import {
    Bold,
    Italic,
    UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    LinkIcon,
    ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Palette,
    Highlighter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

interface TiptapEditorProps {
    value: string
    onChange: (content: string) => void
    height?: number
    placeholder?: string
}

export default function TiptapEditor({
    value,
    onChange,
    height = 400,
    placeholder = "Tulis konten berita di sini...",
}: TiptapEditorProps) {
    const [isMounted, setIsMounted] = useState(false)

    // Handle SSR by only mounting on client side
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg my-4",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline hover:text-blue-800",
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content: value,
        immediatelyRender: false, // Fix SSR hydration issues
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4`,
                style: `min-height: ${height - 100}px;`,
            },
        },
    })

    // Update editor content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [editor, value])

    const handleImageUpload = async () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/*"
        input.click()

        input.onchange = async () => {
            const file = input.files?.[0]
            if (file) {
                const formData = new FormData()
                formData.append("file", file)

                try {
                    const response = await fetch("/api/berita/upload", {
                        method: "POST",
                        body: formData,
                    })

                    if (response.ok) {
                        const data = await response.json()
                        editor?.chain().focus().setImage({ src: data.imageUrl }).run()
                        toast({
                            title: "Berhasil",
                            description: "Gambar berhasil diupload",
                        })
                    }
                } catch (error) {
                    console.error("Error uploading image:", error)
                    toast({
                        title: "Error",
                        description: "Gagal mengupload gambar",
                        variant: "destructive",
                    })
                }
            }
        }
    }

    const addLink = () => {
        const url = window.prompt("Masukkan URL:")
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run()
        }
    }

    const setColor = (color: string) => {
        editor?.chain().focus().setColor(color).run()
    }

    const setHighlight = (color: string) => {
        editor?.chain().focus().setHighlight({ color }).run()
    }

    // Don't render until mounted on client side
    if (!isMounted) {
        return (
            <div className="border border-gray-300 rounded-lg bg-white">
                <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse"></div>
                <div className="animate-pulse bg-gray-50" style={{ height: `${height}px` }}></div>
            </div>
        )
    }

    if (!editor) {
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
                <div className="flex flex-wrap items-center gap-1">
                    {/* Undo/Redo */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="h-8 w-8 p-0"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="h-8 w-8 p-0"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Headings */}
                    <Button
                        type="button"
                        variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className="h-8 w-8 p-0"
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className="h-8 w-8 p-0"
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className="h-8 w-8 p-0"
                    >
                        <Heading3 className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Text Formatting */}
                    <Button
                        type="button"
                        variant={editor.isActive("bold") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className="h-8 w-8 p-0"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive("italic") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className="h-8 w-8 p-0"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive("underline") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className="h-8 w-8 p-0"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive("strike") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className="h-8 w-8 p-0"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive("code") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className="h-8 w-8 p-0"
                    >
                        <Code className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Colors */}
                    <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setColor("#ef4444")} className="h-8 w-8 p-0">
                            <Palette className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setColor("#3b82f6")} className="h-8 w-8 p-0">
                            <Palette className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setColor("#10b981")} className="h-8 w-8 p-0">
                            <Palette className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setHighlight("#fef08a")}
                            className="h-8 w-8 p-0"
                        >
                            <Highlighter className="h-4 w-4 text-yellow-500" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Lists */}
                    <Button
                        type="button"
                        variant={editor.isActive("bulletList") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className="h-8 w-8 p-0"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive("orderedList") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className="h-8 w-8 p-0"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Alignment */}
                    <Button
                        type="button"
                        variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        className="h-8 w-8 p-0"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        className="h-8 w-8 p-0"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        className="h-8 w-8 p-0"
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                        className="h-8 w-8 p-0"
                    >
                        <AlignJustify className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* Quote */}
                    <Button
                        type="button"
                        variant={editor.isActive("blockquote") ? "default" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className="h-8 w-8 p-0"
                    >
                        <Quote className="h-4 w-4" />
                    </Button>

                    {/* Link */}
                    <Button
                        type="button"
                        variant={editor.isActive("link") ? "default" : "ghost"}
                        size="sm"
                        onClick={addLink}
                        className="h-8 w-8 p-0"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>

                    {/* Image */}
                    <Button type="button" variant="ghost" size="sm" onClick={handleImageUpload} className="h-8 w-8 p-0">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="relative">
                <EditorContent
                    editor={editor}
                    className="overflow-y-auto"
                    style={{ minHeight: `${height - 60}px`, maxHeight: "600px" }}
                />
                {editor.isEmpty && <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">{placeholder}</div>}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Editor WYSIWYG dengan Tiptap</span>
                    <span>{editor.getText().length || 0} karakter</span>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
        .ProseMirror {
          outline: none;
          padding: 1rem;
          min-height: ${height - 100}px;
        }
        
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          line-height: 1.2;
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          line-height: 1.3;
        }
        
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          line-height: 1.4;
        }
        
        .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1em 0;
          padding-left: 1em;
          color: #6b7280;
          font-style: italic;
        }
        
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }
        
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .ProseMirror pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        .ProseMirror mark {
          background-color: #fef08a;
          padding: 0.1em 0.2em;
          border-radius: 0.2em;
        }
        
        .ProseMirror .is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
        </div>
    )
}
