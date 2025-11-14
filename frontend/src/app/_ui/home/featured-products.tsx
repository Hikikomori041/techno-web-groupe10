"use client"

import {Card, CardContent, CardFooter} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Loader2} from "lucide-react"
import Link from "next/link"
import {useEffect, useState} from "react"
import {productsService} from "@/lib/api/services/products.service"
import {Product} from "@/lib/api/definitions"
import {useCart} from "@/context/cart.context"
import {useRouter} from "next/navigation"
import {ShoppingCart, Info} from "lucide-react"
import {debugLog} from "@/lib/utils"

export function FeaturedProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const {addItemToCart} = useCart()
    const router = useRouter()

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true)
                setError(null)
                // Fetch 8 products that are in stock, sorted by creation date (newest first)
                const result = await productsService.filterProducts(1, 8, {
                    inStockOnly: true
                })
                
                // Take first 4 products for featured section
                const featuredProducts = result.products.slice(0, 4)
                setProducts(featuredProducts)
            } catch (err: unknown) {
                debugLog("Error fetching featured products:", err)
                setError("Failed to load featured products")
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    const handleAddToCart = async (product: Product) => {
        try {
            await addItemToCart(product._id, 1)
        } catch (err) {
            debugLog("Error adding product to cart:", err)
        }
    }

    const navigateToProduct = (productId: string) => {
        router.push(`/products/${productId}`)
    }

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Featured Products</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Check out our most popular items</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No featured products available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product, index) => {
                            // Ensure unique key
                            const productKey = product._id ? String(product._id) : `product-${index}`
                            
                            return (
                                <Card key={productKey} className="overflow-hidden group hover:shadow-lg transition-shadow h-full flex flex-col">
                                    <div className="aspect-square bg-card overflow-hidden relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                                            src={product.images?.[0] || "/computer-monitor-display.jpg"}
                                            alt={product.nom}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.src = "/computer-monitor-display.jpg"
                                            }}
                                        />
                                        {product.quantite_en_stock === 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 flex-1">{product.nom}</h3>
                                        <p className="text-2xl font-bold text-primary mt-auto">${product.prix.toFixed(2)}</p>
                                        {product.quantite_en_stock > 0 && product.quantite_en_stock < 10 && (
                                            <p className="text-xs text-orange-600 mt-1">
                                                Only {product.quantite_en_stock} left in stock!
                                            </p>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                                        <Button 
                                            className="w-full" 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigateToProduct(product._id)}
                                        >
                                            <Info className="h-4 w-4 mr-2" />
                                            Details
                                        </Button>
                                        <Button 
                                            className="w-full" 
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.quantite_en_stock === 0}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            {product.quantite_en_stock === 0 ? "Out of Stock" : "Add to Cart"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Button variant="outline" size="lg" asChild>
                        <Link href={"/products"}>View All Products</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
