import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Minus, Plus, Trash2} from "lucide-react";
import {Separator} from "@/components/ui/separator";

export default function CartItem({item} : any){
    return(
        <div>
            <div className="flex gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
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
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">Increase quantity</span>
                            </Button>
                        </div>
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            </div>
            {item.id !== cartItems[cartItems.length - 1].id && <Separator className="mt-4" />}
        </div>
    )
}