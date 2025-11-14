"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ImageUpload"
import { productsService } from "@/lib/api/services/products.service"
import { categoriesService } from "@/lib/api/services/categories.service"
import { Category } from "@/lib/api/definitions"
import { toast } from "sonner"
import { debugLog } from "@/lib/utils"
import { useEffect } from "react"

export default function AddProductPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [generatingDescription, setGeneratingDescription] = useState(false)

    const [formData, setFormData] = useState({
        nom: "",
        prix: 0,
        description: "",
        images: [] as string[],
        categoryId: "",
        quantite_en_stock: 0,
        specifications: [] as Array<{ key: string; value: string }>,
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesService.getAllCategories()
                debugLog("Fetched categories:", data.map(c => ({ _id: c._id, name: c.name, isActive: c.isActive })))
                // Filter active categories and ensure they have valid IDs
                const validCategories = data.filter(cat => {
                    return cat.isActive && cat._id && String(cat._id).trim() !== '';
                })
                debugLog("Valid categories:", validCategories.map(c => ({ _id: c._id, name: c.name })))
                setCategories(validCategories)
            } catch (error: unknown) {
                debugLog("Error fetching categories:", error)
                toast.error("Erreur lors du chargement des catégories")
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...formData.specifications]
        newSpecs[index][field] = value
        setFormData(prev => ({ ...prev, specifications: newSpecs }))
    }

    const addSpecification = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: "", value: "" }]
        }))
    }

    const removeSpecification = (index: number) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }))
    }

    const generateAIDescription = async () => {
        if (!formData.nom.trim()) {
            toast.error("Veuillez d'abord entrer le nom du produit")
            return
        }

        setGeneratingDescription(true)
        try {
            // Call AI description generation
            const description = await generateDescriptionWithAI({
                nom: formData.nom,
                prix: formData.prix,
                specifications: formData.specifications.filter(s => s.key && s.value),
            })

            setFormData(prev => ({ ...prev, description }))
            toast.success("Description générée avec succès !")
        } catch (error: unknown) {
            console.error("Error generating description:", error)
            const message = (error as { message?: string })?.message || "Erreur lors de la génération de la description"
            toast.error(message)
        } finally {
            setGeneratingDescription(false)
        }
    }

    // Simple AI description generation (can be replaced with actual AI API)
    const generateDescriptionWithAI = async (data: {
        nom: string
        prix: number
        specifications: Array<{ key: string; value: string }>
    }): Promise<string> => {
        // For now, create a smart description based on product data
        // In production, replace this with actual DeepSeek or OpenAI API call
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

        let description = `${data.nom} est un produit de qualité supérieure conçu pour répondre à vos besoins. `

        if (data.specifications.length > 0) {
            description += 'Caractéristiques techniques : '
            const specs = data.specifications.map(s => `${s.key} ${s.value}`).join(', ')
            description += specs + '. '
        }

        if (data.prix > 1000) {
            description += `Au prix de $${data.prix.toFixed(2)}, ce produit haut de gamme offre des performances exceptionnelles et une fiabilité à toute épreuve. `
        } else if (data.prix > 500) {
            description += `Disponible à $${data.prix.toFixed(2)}, il offre un excellent rapport qualité-prix. `
        } else {
            description += `À seulement $${data.prix.toFixed(2)}, c'est une affaire à ne pas manquer ! `
        }

        description += 'Commandez dès maintenant et profitez de notre garantie satisfait ou remboursé de 30 jours. Livraison gratuite disponible.'

        return description
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.nom.trim()) {
            toast.error("Le nom du produit est requis")
            return
        }

        if (formData.prix <= 0) {
            toast.error("Le prix doit être supérieur à 0")
            return
        }

        if (!formData.categoryId || formData.categoryId === "none") {
            toast.error("Veuillez sélectionner une catégorie")
            return
        }

        // Filter out empty specifications AND remove any _id fields
        const validSpecs = formData.specifications
            .filter(s => s.key.trim() && s.value.trim())
            .map(({ key, value }) => ({ key, value })) // Remove _id if present

        setSubmitting(true)
        try {
            const productData = {
                nom: formData.nom,
                prix: formData.prix,
                description: formData.description || undefined,
                images: formData.images.length > 0 ? formData.images : undefined,
                categoryId: formData.categoryId,
                quantite_en_stock: formData.quantite_en_stock,
                specifications: validSpecs,
            }

            debugLog("Creating product with data", productData)

            await productsService.createProduct(productData)

            toast.success("Produit créé avec succès !")
            router.push("/dashboard/products")
        } catch (error: unknown) {
            console.error("Error creating product:", error)
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as { message?: string })?.message || "Erreur lors de la création du produit"
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/dashboard/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux produits
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Ajouter un produit</CardTitle>
                    <CardDescription>
                        Créez un nouveau produit pour votre catalogue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom du produit *</Label>
                                <Input
                                    id="nom"
                                    placeholder="Ex: Laptop Dell XPS 15"
                                    value={formData.nom}
                                    onChange={(e) => handleInputChange("nom", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="prix">Prix ($) *</Label>
                                    <Input
                                        id="prix"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="1299.99"
                                        value={formData.prix || ""}
                                        onChange={(e) => handleInputChange("prix", parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantite">Quantité en stock *</Label>
                                    <Input
                                        id="quantite"
                                        type="number"
                                        min="0"
                                        placeholder="50"
                                        value={formData.quantite_en_stock || ""}
                                        onChange={(e) => handleInputChange("quantite_en_stock", parseInt(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Catégorie *</Label>
                                <Select
                                    value={formData.categoryId || undefined}
                                    onValueChange={(value) => {
                                        handleInputChange("categoryId", value)
                                        debugLog("Category selected", value)
                                    }}
                                >
                                    <SelectTrigger id="categoryId" className={!formData.categoryId ? "text-muted-foreground" : ""}>
                                        <SelectValue placeholder={loadingCategories ? "Chargement..." : "Sélectionnez une catégorie"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingCategories ? (
                                            <SelectItem value="loading" disabled>
                                                Chargement...
                                            </SelectItem>
                                        ) : categories.length === 0 ? (
                                            <SelectItem value="no-categories" disabled>
                                                Aucune catégorie disponible
                                            </SelectItem>
                                        ) : (
                                            categories
                                                .filter(category => {
                                                    return category._id && String(category._id).trim() !== '';
                                                })
                                                .map((cat) => {
                                                    const catId = cat._id;
                                                    return (
                                                        <SelectItem key={String(catId)} value={String(catId)}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    );
                                                })
                                        )}
                                    </SelectContent>
                                </Select>
                                {!formData.categoryId && (
                                    <p className="text-xs text-red-500">⚠️ La catégorie est obligatoire</p>
                                )}
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label>Images du produit</Label>
                            <ImageUpload
                                images={formData.images}
                                onChange={(images) => handleInputChange("images", images)}
                                maxImages={5}
                            />
                        </div>

                        {/* Description with AI */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">Description</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={generateAIDescription}
                                    disabled={generatingDescription || !formData.nom.trim()}
                                >
                                    {generatingDescription ? (
                                        <>
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            Génération...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-3 w-3" />
                                            Générer avec IA
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Textarea
                                id="description"
                                placeholder="Description détaillée du produit..."
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                rows={6}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                💡 Cliquez sur &quot;Générer avec IA&quot; pour créer automatiquement une description à partir du nom et des spécifications
                            </p>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-2">
                            <Label>Spécifications techniques</Label>
                            <div className="space-y-3">
                                {formData.specifications.map((spec, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Clé (ex: RAM)"
                                            value={spec.key}
                                            onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Valeur (ex: 16GB)"
                                            value={spec.value}
                                            onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeSpecification(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={addSpecification}
                                    className="w-full"
                                >
                                    + Ajouter une spécification
                                </Button>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/dashboard/products")}
                                disabled={submitting}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    "Créer le produit"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

