import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {ShoppingCart, Info} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CartItem, Product} from "@/lib/api/definitions";
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
                } catch (error) {
                    console.error("Failed to fetch category:", error);
                }
            }
        };

        fetchCategory();

    }, [_id]);

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-card overflow-hidden">
                <img
                    src={"/placeholder.svg"}
                    alt={product.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <CardContent className="p-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">{category ?? "Category"}</p>
                    <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[3rem] leading-tight">
                        {product.nom}
                    </h3>
                </div>

                <div className="mt-auto">
                    <p className="text-xl font-bold text-accent">${product.prix}</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-2">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        style={{cursor: "pointer"}} size="sm"
                        onClick={navigateToProduct}>
                    <Info className="h-4 w-4 mr-2"/>
                    Détails
                </Button>
                <Button className="w-full bg-primary hover:bg-primary/90 text-accent-foreground"
                        style={{cursor: "pointer"}} size="sm"
                        onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-4 w-4 mr-2"/>
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    )
}
