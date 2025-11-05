"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, ShoppingCart, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/app/_ui/commun/header"
import { Footer } from "@/app/_ui/commun/footer"
import { productsService } from "@/lib/api/services/products.service"
import { categoriesService } from "@/lib/api/services/categories.service"
import { Product, Category } from "@/lib/api/definitions"
import { useCart } from "@/context/cart.context"
import { toast } from "sonner"

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.id as string
    const { addItemToCart } = useCart()

    const [product, setProduct] = useState<Product | null>(null)
    const [category, setCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)
    const [addingToCart, setAddingToCart] = useState(false)

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productData = await productsService.getProductById(productId)
                setProduct(productData)

                // Fetch category details
                if (productData.id_categorie) {
                    try {
                        const categoryData = await categoriesService.getCategory(productData.id_categorie)
                        setCategory(categoryData)
                    } catch (err) {
                        console.error("Error fetching category:", err)
                    }
                }
            } catch (err: any) {
                console.error("Error fetching product:", err)
                setError("Impossible de charger les détails du produit")
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            fetchProductDetails()
        }
    }, [productId])

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta
        if (newQuantity >= 1 && product && newQuantity <= product.quantite_en_stock) {
            setQuantity(newQuantity)
        }
    }

    const handleAddToCart = async () => {
        if (!product) return

        setAddingToCart(true)
        try {
            await addItemToCart(product._id, quantity)
            toast.success(`${quantity} × ${product.nom} ajouté(s) au panier`)
        } catch (error: any) {
            console.error("Error adding to cart:", error)
            toast.error(error.message || "Erreur lors de l'ajout au panier")
        } finally {
            setAddingToCart(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header />
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Chargement du produit...</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header />
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <Package className="h-24 w-24 text-muted-foreground" />
                        <h1 className="text-3xl font-bold">Produit introuvable</h1>
                        <p className="text-muted-foreground max-w-md">{error}</p>
                        <Button asChild size="lg" className="mt-4">
                            <Link href="/products">Retour au catalogue</Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    const images = product.images && product.images.length > 0
        ? product.images
        : ["/computer-monitor-display.jpg"]

    const inStock = product.quantite_en_stock > 0

    return (
        <div className="min-h-screen bg-muted/30">
            <Header />
            <div className="container mx-auto px-4 py-8 lg:px-8">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-6">
                    <Link href="/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour aux produits
                    </Link>
                </Button>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Images Section */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="aspect-square relative bg-muted">
                                    <img
                                        src={images[selectedImage]}
                                        alt={product.nom}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/computer-monitor-display.jpg"
                                        }}
                                    />
                                    {!inStock && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Badge variant="destructive" className="text-lg px-4 py-2">
                                                Rupture de stock
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                                            selectedImage === index
                                                ? "border-primary"
                                                : "border-transparent hover:border-muted-foreground"
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.nom} - Image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "/computer-monitor-display.jpg"
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details Section */}
                    <div className="space-y-6">
                        {/* Title and Category */}
                        <div>
                            {category && (
                                <Badge variant="secondary" className="mb-3">
                                    {category.name}
                                </Badge>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.nom}</h1>
                            <p className="text-3xl font-bold text-primary">${product.prix.toFixed(2)}</p>
                        </div>

                        <Separator />

                        {/* Stock Status */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Disponibilité</p>
                            {inStock ? (
                                <Badge variant="default" className="bg-green-600">
                                    En stock ({product.quantite_en_stock} disponibles)
                                </Badge>
                            ) : (
                                <Badge variant="destructive">Rupture de stock</Badge>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Description</h2>
                                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specifications && product.specifications.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Spécifications</h2>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            {product.specifications.map((spec, index) => (
                                                <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                                                    <span className="font-medium">{spec.key}</span>
                                                    <span className="text-muted-foreground">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <Separator />

                        {/* Quantity and Add to Cart */}
                        {inStock && (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Quantité</p>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.quantite_en_stock}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                >
                                    {addingToCart ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Ajout en cours...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            Ajouter au panier
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Additional Info */}
                        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                            <CardContent className="pt-6">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-blue-900 dark:text-blue-100">Livraison gratuite sur les commandes de plus de $500</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-blue-900 dark:text-blue-100">Politique de retour de 30 jours</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-blue-900 dark:text-blue-100">Garantie 1 an sur tous les produits</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
