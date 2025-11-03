import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Minus, Plus, Trash2} from "lucide-react";
import {CartItem} from "@/lib/api/definitions";
import {categoriesService} from "@/lib/api/services/categories.service";
import {useState, useEffect} from "react";
import { useCart } from "@/context/cart.context";


export default function ItemCart({item}: { item: CartItem }) {
    const {productId, quantity, subtotal} = item;
    const {nom, images} = productId;
    const [category, setCategory] = useState("");
    const { addItemToCart, removeItemFromCart, clearCartItem } = useCart();

    useEffect(() => {
        const fetchCategory = async () => {
            if (productId.id_categorie) {
                try {
                    const categoryData = await categoriesService.getCategory(productId.id_categorie);
                    setCategory(categoryData.name);
                } catch (error) {
                    console.error("Failed to fetch category:", error);
                }
            }
        };

        fetchCategory();

    }, [productId]);

    return (
        <div>
            <div className="flex gap-4">
                <div
                    className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <Image src={"/macbook-pro-laptop.jpeg"} alt={nom} fill
                           className="object-cover"/>
                </div>
                <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold">{nom}</h3>
                                <p className="text-sm text-muted-foreground">{category}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => clearCartItem(item)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4"/>
                                <span className="sr-only">Remove item</span>
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => removeItemFromCart(item)}
                            >
                                <Minus className="h-3 w-3"/>
                                <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span
                                className="w-12 text-center font-medium">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => addItemToCart(item)}
                            >
                                <Plus className="h-3 w-3"/>
                                <span className="sr-only">Increase quantity</span>
                            </Button>
                        </div>
                        <p className="font-bold">${(subtotal).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}