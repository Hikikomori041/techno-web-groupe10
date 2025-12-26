"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { uploadService } from "@/lib/api/services/upload.service"
import { toast } from "sonner"

interface ImageUploadProps {
    images: string[]
    onChange: (images: string[]) => void
    maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        
        if (files.length === 0) return

        // Check if adding these files would exceed max
        if (images.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images autorisées`)
            return
        }

        // Validate file types
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/')
            if (!isImage) {
                toast.error(`${file.name} n'est pas une image valide`)
            }
            return isImage
        })

        if (validFiles.length === 0) return

        // Check file sizes (5MB max per file)
        const oversizedFiles = validFiles.filter(file => file.size > 5 * 1024 * 1024)
        if (oversizedFiles.length > 0) {
            toast.error(`Certaines images dépassent 5MB : ${oversizedFiles.map(f => f.name).join(', ')}`)
            return
        }

        setUploading(true)

        try {
            const uploadResults = await uploadService.uploadMultipleImages(validFiles)
            
            // Construct full URLs for the uploaded images
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
            const newImageUrls = uploadResults.map(result => `${apiBaseUrl}${result.url}`)
            
            onChange([...images, ...newImageUrls])
            toast.success(`${validFiles.length} image(s) téléchargée(s) avec succès`)
        } catch (error: unknown) {
            console.error('Upload error:', error)
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors du téléchargement"
            toast.error(message)
        } finally {
            setUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onChange(newImages)
        toast.success("Image supprimée")
    }

    return (
        <div className="space-y-4">
            {/* Upload Button */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || images.length >= maxImages}
                    className="w-full"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Téléchargement...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Télécharger des images ({images.length}/{maxImages})
                        </>
                    )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Formats acceptés : JPG, PNG, GIF, WEBP (max 5MB par image)
                </p>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                        <Card key={index} className="relative group overflow-hidden">
                            <div className="aspect-square bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                                    src={imageUrl}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "/computer-monitor-display.jpg"
                                    }}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                    Principal
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {images.length === 0 && (
                <Card className="border-dashed">
                    <div className="p-8 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                            Aucune image téléchargée
                        </p>
                    </div>
                </Card>
            )}
        </div>
    )
}

