"use client"

import {useState} from "react"
import Image from "next/image"
import Link from "next/link"
import {Minus, Plus, Trash2, ShoppingBag} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {Header} from "@/app/_ui/commun/header";
import {Footer} from "@/app/_ui/commun/footer";
import {useCart} from "@/context/cart.context";
import ItemCart from "@/app/_ui/cart/cart-item";


export default function CartPage() {

    // const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    // const shipping = subtotal > 0 ? 15.99 : 0
    // const tax = subtotal * 0.08
    // const total = subtotal + shipping + tax

    const {cart, cartCount, cartTotal} = useCart();

    if (cartCount === 0) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header/>
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <ShoppingBag className="h-24 w-24 text-muted-foreground"/>
                        <h1 className="text-3xl font-bold">Your cart is empty</h1>
                        <p className="text-muted-foreground max-w-md">
                            Looks like you haven't added anything to your cart yet. Start shopping to find amazing
                            products!
                        </p>
                        <Button asChild size="lg" className="mt-4">
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Header/>
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    {/* Cart Items */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cart Items ({cartCount})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.productId._id}>
                                        <ItemCart item={item}/>

                                        <Separator className="mt-4"/>
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
                                    {/*<div className="flex justify-between text-sm">*/}
                                    {/*    <span className="text-muted-foreground">Subtotal</span>*/}
                                    {/*    <span className="font-medium">${subtotal.toFixed(2)}</span>*/}
                                    {/*</div>*/}
                                    {/*<div className="flex justify-between text-sm">*/}
                                    {/*    <span className="text-muted-foreground">Shipping</span>*/}
                                    {/*    <span className="font-medium">${shipping.toFixed(2)}</span>*/}
                                    {/*</div>*/}
                                    {/*<div className="flex justify-between text-sm">*/}
                                    {/*    <span className="text-muted-foreground">Tax (8%)</span>*/}
                                    {/*    <span className="font-medium">${tax.toFixed(2)}</span>*/}
                                    {/*</div>*/}
                                    {/*<Separator/>*/}
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button className="w-full" size="lg">
                                    Proceed to Checkout
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">Secure checkout powered by
                                    Stripe</p>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">Free shipping on orders over $500</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">30-day return policy</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
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
            <Footer/>
        </div>
    )
}
