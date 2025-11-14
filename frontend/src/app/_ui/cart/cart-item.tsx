"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CartItem } from "@/lib/api/definitions"
import { useCart } from "@/context/cart.context"

interface ItemCartProps {
    item: CartItem
}

export default function ItemCart({ item }: ItemCartProps) {
    const { updateItemQuantity, removeItemFromCart } = useCart()
    const [isUpdating, setIsUpdating] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)

    const handleIncrement = async () => {
        setIsUpdating(true)
        try {
            await updateItemQuantity(item.productId._id, item.quantity + 1)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDecrement = async () => {
        if (item.quantity <= 1) return

        setIsUpdating(true)
        try {
            await updateItemQuantity(item.productId._id, item.quantity - 1)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleQuantityChange = async (value: string) => {
        const newQuantity = parseInt(value)

        if (isNaN(newQuantity) || newQuantity < 1) return

        setIsUpdating(true)
        try {
            await updateItemQuantity(item.productId._id, newQuantity)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleRemove = async () => {
        setIsRemoving(true)
        try {
            await removeItemFromCart(item.productId._id)
        } finally {
            setIsRemoving(false)
        }
    }

    return (
        <div className="flex gap-4 py-4">
            {/*</Link>*/}

            {/* Product Details */}
            <div className="flex flex-1 flex-col justify-between">
                <div className="space-y-1">
                    <Link
                        href={`/products/${item.productId._id}`}
                        className="font-medium hover:underline line-clamp-2"
                    >
                        {item.productId.nom}
                    </Link>
                    {item.productId.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.productId.description}
                        </p>
                    )}
                    <p className="text-lg font-semibold text-primary">
                        ${item.productId.prix.toFixed(2)}
                    </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={handleDecrement}
                            disabled={isUpdating || item.quantity <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            disabled={isUpdating}
                            className="h-8 w-12 border-0 border-x text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={handleIncrement}
                            disabled={isUpdating}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleRemove}
                        disabled={isRemoving}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Subtotal */}
            <div className="flex flex-col items-end justify-between">
                <p className="text-lg font-semibold">
                    ${item.subtotal.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                    {item.quantity} × ${item.productId.prix.toFixed(2)}
                </p>
            </div>
        </div>
    )
}