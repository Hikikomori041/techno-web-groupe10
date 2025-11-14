import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {ShoppingCart, Info} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Product} from "@/lib/api/definitions";
import {useRouter} from "next/navigation";
import {categoriesService} from "@/lib/api/services/categories.service";
import {useEffect, useState} from "react";
import {useCart} from "@/context/cart.context";

export default function ProductCard({product}: { product: Product }) {
    const router = useRouter();
    const {_id} = product;
    const [category, setCategory] = useState("");


    const { addItemToCart } = useCart()
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToCart = async () => {
        setIsAdding(true)
        try {
            await addItemToCart(product._id, 1)
        } finally {
            setIsAdding(false)
        }
    }


    const navigateToProduct = () => {
        router.push(`/products/${_id}`);
    }
    useEffect(() => {
        const fetchCategory = async () => {
            if (product.id_categorie) {
                try {
                    const categoryData = await categoriesService.getCategory(product.id_categorie);
                    setCategory(categoryData.name);
                } catch (error: unknown) {
                    console.error("Failed to fetch category:", error);
                }
            }
        };

        fetchCategory();

    }, [product.id_categorie]);

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
            <div className="aspect-square bg-card overflow-hidden relative">
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
                            Rupture de stock
                        </span>
                    </div>
                )}
            </div>
            <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">{category || "Catégorie"}</p>
                    <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] leading-tight">
                        {product.nom}
                    </h3>
                </div>

                <div className="mt-auto">
                    <p className="text-lg sm:text-xl font-bold text-primary">${product.prix.toFixed(2)}</p>
                    {product.quantite_en_stock > 0 && product.quantite_en_stock < 10 && (
                        <p className="text-xs text-orange-600 mt-1">
                            Plus que {product.quantite_en_stock} en stock !
                        </p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-3 sm:p-4 pt-0 mt-auto flex flex-col gap-2">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        style={{cursor: "pointer"}} size="sm"
                        onClick={navigateToProduct}>
                    <Info className="h-4 w-4 mr-2"/>
                    Détails
                </Button>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        style={{cursor: "pointer"}} size="sm"
                        onClick={handleAddToCart}
                        disabled={isAdding || product.quantite_en_stock === 0}
                >
                    <ShoppingCart className="h-4 w-4 mr-2"/>
                    {isAdding ? "Ajout..." : product.quantite_en_stock === 0 ? "Indisponible" : "Ajouter au panier"}
                </Button>
            </CardFooter>
        </Card>
    )
}
