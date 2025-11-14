"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const productId = params.id as string

    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [loadingProduct, setLoadingProduct] = useState(true)
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
        const fetchData = async () => {
            try {
                // Fetch categories
                const catsData = await categoriesService.getAllCategories()
                setCategories(catsData.filter(cat => cat.isActive))
                setLoadingCategories(false)

                // Fetch product
                const productData = await productsService.getProductById(productId)
                setFormData({
                    nom: productData.nom,
                    prix: productData.prix,
                    description: productData.description || "",
                    images: productData.images || [],
                    categoryId: productData.id_categorie,
                    quantite_en_stock: productData.quantite_en_stock,
                    specifications: productData.specifications || [],
                })
                setLoadingProduct(false)
            } catch (error: unknown) {
                console.error("Error fetching data:", error)
                toast.error("Erreur lors du chargement des données")
                router.push("/dashboard/products")
            }
        }
        fetchData()
    }, [productId, router])

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
            toast.error("Le nom du produit est requis")
            return
        }

        setGeneratingDescription(true)
        try {
            const description = await generateDescriptionWithAI({
                nom: formData.nom,
                prix: formData.prix,
                specifications: formData.specifications.filter(s => s.key && s.value),
            })

            setFormData(prev => ({ ...prev, description }))
            toast.success("Description générée avec succès !")
        } catch (error: unknown) {
            console.error("Error generating description:", error)
            toast.error("Erreur lors de la génération")
        } finally {
            setGeneratingDescription(false)
        }
    }

    const generateDescriptionWithAI = async (data: {
        nom: string
        prix: number
        specifications: Array<{ key: string; value: string }>
    }): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 1000))

        let description = `${data.nom} est un produit exceptionnel qui allie performance et qualité. `

        if (data.specifications.length > 0) {
            description += 'Équipé de : '
            const specs = data.specifications.map(s => `${s.key} ${s.value}`).join(', ')
            description += specs + '. '
        }

        if (data.prix > 1500) {
            description += `Ce produit premium à $${data.prix.toFixed(2)} est conçu pour les professionnels exigeants et offre des performances de pointe. `
        } else if (data.prix > 800) {
            description += `Au prix de $${data.prix.toFixed(2)}, il représente un excellent investissement alliant qualité et accessibilité. `
        } else {
            description += `Avec son prix attractif de $${data.prix.toFixed(2)}, c'est le choix idéal pour tous les budgets. `
        }

        description += 'Garantie constructeur incluse. Livraison rapide et service client réactif disponibles.'

        return description
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.nom.trim() || formData.prix <= 0 || !formData.categoryId || formData.categoryId === "none") {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        // Filter out empty specifications AND remove any _id fields (MongoDB adds them)
        const validSpecs = formData.specifications
            .filter(s => s.key.trim() && s.value.trim())
            .map(({ key, value }) => ({ key, value })) // Remove _id, createdAt, etc.

        setSubmitting(true)
        try {
            const updateData = {
                nom: formData.nom,
                prix: formData.prix,
                description: formData.description || undefined,
                images: formData.images.length > 0 ? formData.images : undefined,
                categoryId: formData.categoryId,
                quantite_en_stock: formData.quantite_en_stock,
                specifications: validSpecs,
            }

            debugLog("Updating product with data", updateData)

            await productsService.updateProduct(productId, updateData)

            toast.success("Produit mis à jour avec succès !")
            router.push("/dashboard/products")
        } catch (error: unknown) {
            console.error("Error updating product:", error)
            const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as { message?: string })?.message || "Erreur lors de la mise à jour"
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingProduct) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
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
                    <CardTitle>Modifier le produit</CardTitle>
                    <CardDescription>
                        Mettez à jour les informations du produit
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Same form structure as Add page */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom du produit *</Label>
                                <Input
                                    id="nom"
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
                                        value={formData.quantite_en_stock || ""}
                                        onChange={(e) => handleInputChange("quantite_en_stock", parseInt(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Catégorie *</Label>
                                <Select
                                    value={formData.categoryId || "placeholder"}
                                    onValueChange={(value) => {
                                        if (value !== "placeholder") {
                                            handleInputChange("categoryId", value)
                                            debugLog("Category updated", value)
                                        }
                                    }}
                                >
                                    <SelectTrigger id="categoryId" className={!formData.categoryId ? "text-muted-foreground" : ""}>
                                        <SelectValue placeholder="Sélectionnez une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="placeholder" disabled>
                                            {loadingCategories ? "Chargement..." : "-- Sélectionnez une catégorie --"}
                                        </SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!formData.categoryId && (
                                    <p className="text-xs text-red-500">⚠️ La catégorie est obligatoire</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Images du produit</Label>
                            <ImageUpload
                                images={formData.images}
                                onChange={(images) => handleInputChange("images", images)}
                                maxImages={5}
                            />
                        </div>

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
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                rows={6}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                💡 Utilisez l&apos;IA pour générer une description professionnelle
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Spécifications techniques</Label>
                            <div className="space-y-3">
                                {formData.specifications.map((spec, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Clé"
                                            value={spec.key}
                                            onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Valeur"
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
                                        Mise à jour...
                                    </>
                                ) : (
                                    "Mettre à jour"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

