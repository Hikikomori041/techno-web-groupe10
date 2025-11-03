import {notFound} from "next/navigation"
import {ShoppingCart, Truck, Shield, RotateCcw} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Header} from "@/app/_ui/commun/header";
import {Footer} from "@/app/_ui/commun/footer";
import {productsService} from "@/lib/api/services/products.service";
import {categoriesService} from "@/lib/api/services/categories.service";
import {Product} from "@/lib/api/definitions";
import Link from "next/link";


export default async function Page(props: { params: Promise<{ id: string }> }) {
    const {id} = await props.params;
    let product: Product | null = null;
    let category: string | null = null;
    try {
        // Fetch product by ID from backend
        product = await productsService.getProductById(id);
        let categoryId = product.id_categorie
        await categoriesService.getCategory(categoryId).then((categories) => {
            category = categories.name
        });

    } catch (error) {
        console.error("Error fetching product:", error);
    }

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="text-sm text-muted-foreground mb-6">
                    <Link href={"/"} className="hover:text-foreground cursor-pointer">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href={"/products"} className="hover:text-foreground cursor-pointer">Products</Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">{product.nom}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.nom}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg
                                className="w-32 h-32 text-white opacity-50"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        )}
                        <div className="grid grid-cols-4 gap-4">
                            {product.images && product.images.length > 1 && (
                                <div className="p-4 grid grid-cols-4 gap-2">
                                    {product.images.slice(1, 5).map((image, index) => (
                                        <div key={index}
                                             className="aspect-square bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                            <img src={image} alt={`${product.nom} ${index + 2}`}
                                                 className="w-full h-full object-cover"/>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{category}</Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-2 text-balance">{product.nom}</h1>


                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-4xl font-bold text-primary">${product.prix}</span>
                            </div>

                            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
                        </div>

                        <Separator/>

                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <Button size="lg"
                                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <ShoppingCart className="h-5 w-5 mr-2"/>
                                    Add to Cart
                                </Button>
                            </div>
                        </div>

                        <Separator/>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <Truck className="h-6 w-6 text-primary"/>
                                    <p className="text-sm font-medium">Free Shipping</p>
                                    <p className="text-xs text-muted-foreground">On orders over $50</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <Shield className="h-6 w-6 text-primary"/>
                                    <p className="text-sm font-medium">2 Year Warranty</p>
                                    <p className="text-xs text-muted-foreground">Full coverage</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <RotateCcw className="h-6 w-6 text-primary"/>
                                    <p className="text-sm font-medium">30-Day Returns</p>
                                    <p className="text-xs text-muted-foreground">No questions asked</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <Tabs defaultValue="specifications" className="mb-12">
                    <TabsList className="flex items-center justify-center w-full">
                        <TabsTrigger value="specifications"> Technical Specifications</TabsTrigger>
                    </TabsList>
                    <TabsContent value="specifications" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4">
                                </h3>
                                <div className="space-y-3">
                                    {product.specifications?.length ? (
                                        product.specifications.map((spec) => (
                                            <div key={spec._id} className="flex py-3 border-b last:border-0">
                                                <span className="font-medium w-1/3">{spec.key}</span>
                                                <span className="text-muted-foreground w-2/3">
                                                    {spec.value}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            No specifications available for this product.
                                        </p>
                                    )}
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
