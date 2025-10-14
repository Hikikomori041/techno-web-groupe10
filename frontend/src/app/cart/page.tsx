"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export default function CartPage() {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "MacBook Pro 16-inch",
            price: 2499.99,
            quantity: 1,
            image: "/macbook-pro-laptop.png",
            category: "Laptops",
        },
        {
            id: 2,
            name: "iPhone 15 Pro Max",
            price: 1199.99,
            quantity: 2,
            image: "/modern-smartphone.png",
            category: "Smartphones",
        },
        {
            id: 3,
            name: "AirPods Pro",
            price: 249.99,
            quantity: 1,
            image: "/wireless-earbuds.png",
            category: "Accessories",
        },
    ])

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return
        setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter((item) => item.id !== id))
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 0 ? 15.99 : 0
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <ShoppingBag className="h-24 w-24 text-muted-foreground" />
                        <h1 className="text-3xl font-bold">Your cart is empty</h1>
                        <p className="text-muted-foreground max-w-md">
                            Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
                        </p>
                        <Button asChild size="lg" className="mt-4">
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    {/* Cart Items */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id}>
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
                                ))}
                            </CardContent>
                        </Card>

                        <Button variant="outline" asChild className="w-full bg-transparent">
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium">${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax (8%)</span>
                                        <span className="font-medium">${tax.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Promo Code</label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Enter code" />
                                        <Button variant="outline">Apply</Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button className="w-full" size="lg">
                                    Proceed to Checkout
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">Secure checkout powered by Stripe</p>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">Free shipping on orders over $500</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">30-day return policy</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">1-year warranty on all products</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
