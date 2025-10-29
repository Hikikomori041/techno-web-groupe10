import { notFound } from "next/navigation"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {Header} from "@/app/_ui/header";
import {Footer} from "@/app/_ui/footer";

// Mock product data - in a real app, this would come from a database
const products = [
    {
        id: "1",
        name: 'MacBook Pro 16"',
        price: 2499,
        originalPrice: 2799,
        rating: 4.8,
        reviews: 234,
        inStock: true,
        images: [
            "/macbook-pro-laptop.jpeg",
            "/macbook-pro-laptop.jpeg",
            "/macbook-pro-laptop.jpeg",
            "/macbook-pro-laptop.jpeg",
        ],
        category: "Laptops",
        brand: "Apple",
        description:
            "The MacBook Pro 16-inch is a powerhouse laptop designed for professionals. With the latest M3 Pro chip, stunning Liquid Retina XDR display, and up to 22 hours of battery life, it's perfect for demanding workflows.",
        features: [
            "Apple M3 Pro chip with 12-core CPU and 18-core GPU",
            "16-inch Liquid Retina XDR display with ProMotion",
            "32GB unified memory",
            "1TB SSD storage",
            "Up to 22 hours battery life",
            "Three Thunderbolt 4 ports, HDMI port, SDXC card slot",
            "1080p FaceTime HD camera",
            "Six-speaker sound system with force-cancelling woofers",
        ],
        specifications: {
            Processor: "Apple M3 Pro (12-core CPU)",
            Graphics: "18-core GPU",
            Memory: "32GB Unified Memory",
            Storage: "1TB SSD",
            Display: '16.2" Liquid Retina XDR (3456 x 2234)',
            Weight: "4.7 lbs (2.15 kg)",
            Dimensions: '14.01" x 9.77" x 0.66"',
            Battery: "Up to 22 hours",
            Ports: "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3",
            Wireless: "Wi-Fi 6E, Bluetooth 5.3",
        },
    },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = products.find((p) => p.id === params.id)

    if (!product) {
        notFound()
    }

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="text-sm text-muted-foreground mb-6">
                    <span className="hover:text-foreground cursor-pointer">Home</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-foreground cursor-pointer">{product.category}</span>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-card rounded-lg overflow-hidden border">
                            <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    className="aspect-square bg-card rounded-lg overflow-hidden border hover:border-primary transition-colors"
                                >
                                    <img
                                        src={image || "/placeholder.svg"}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{product.category}</Badge>
                                {discount > 0 && <Badge className="bg-destructive text-destructive-foreground">{discount}% OFF</Badge>}
                                {product.inStock && <Badge className="bg-green-600 text-white">In Stock</Badge>}
                            </div>
                            <h1 className="text-3xl font-bold mb-2 text-balance">{product.name}</h1>
                            <p className="text-sm text-muted-foreground mb-4">by {product.brand}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium">{product.rating}</span>
                                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-4xl font-bold text-primary">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                                )}
                            </div>

                            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to Cart
                                </Button>
                                <Button size="lg" variant="outline">
                                    <Heart className="h-5 w-5" />
                                </Button>
                                <Button size="lg" variant="outline">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                            <Button size="lg" variant="secondary" className="w-full">
                                Buy Now
                            </Button>
                        </div>

                        <Separator />

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <Truck className="h-6 w-6 text-primary" />
                                    <p className="text-sm font-medium">Free Shipping</p>
                                    <p className="text-xs text-muted-foreground">On orders over $50</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <Shield className="h-6 w-6 text-primary" />
                                    <p className="text-sm font-medium">2 Year Warranty</p>
                                    <p className="text-xs text-muted-foreground">Full coverage</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <RotateCcw className="h-6 w-6 text-primary" />
                                    <p className="text-sm font-medium">30-Day Returns</p>
                                    <p className="text-xs text-muted-foreground">No questions asked</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <Tabs defaultValue="features" className="mb-12">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="specifications">Specifications</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="features" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                                <ul className="space-y-3">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                            <span className="text-muted-foreground leading-relaxed">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="specifications" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                                <div className="space-y-3">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="flex py-3 border-b last:border-0">
                                            <span className="font-medium w-1/3">{key}</span>
                                            <span className="text-muted-foreground w-2/3">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                                <div className="space-y-6">
                                    {[1, 2, 3].map((review) => (
                                        <div key={review} className="border-b last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                                                    ))}
                                                </div>
                                                <span className="font-medium">John Doe</span>
                                                <span className="text-sm text-muted-foreground">• 2 weeks ago</span>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Amazing laptop! The performance is incredible and the display is stunning. Highly recommend for
                                                professional work.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer/>
        </div>
    )
}
