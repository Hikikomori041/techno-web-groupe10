"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/app/_ui/commun/header"
import { Footer } from "@/app/_ui/commun/footer"
import { useCart } from "@/context/cart.context"
import ItemCart from "@/app/_ui/cart/cart-item"
import { authService } from "@/lib/api/services/auth.service"
import { toast } from "sonner"

export default function CartPage() {
    const router = useRouter()
    const { cart, cartCount, cartTotal, isLoading: cartLoading } = useCart()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(false)

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const result = await authService.isAuthenticated()
                setIsAuthenticated(result.authenticated)
            } catch (err) {
                console.error("Error checking auth status:", err)
                setIsAuthenticated(false)
            }
        }

        checkAuthStatus()
    }, [])

    const handleCheckout = async () => {
        setIsCheckingAuth(true)

        try {
            // Double-check authentication before proceeding
            if (isAuthenticated === null) {
                const result = await authService.isAuthenticated()
                setIsAuthenticated(result.authenticated)

                if (!result.authenticated) {
                    toast.error("Please log in to proceed to checkout.")
                    router.push("/sign-in")
                    return
                }
            }

            if (!isAuthenticated) {
                toast.error("Please log in to proceed to checkout.")
                router.push("/sign-in")
                return
            }

            // Check if cart is empty
            if (cartCount === 0) {
                toast.error("Your cart is empty")
                return
            }

            // Proceed to checkout
            router.push("/checkout")
            toast.success("Proceeding to checkout...")
        } catch (error: unknown) {
            console.error("Checkout error:", error)
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsCheckingAuth(false)
        }
    }

    // Loading state
    if (cartLoading) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header />
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading your cart...</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    // Empty cart state
    if (cartCount === 0) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header />
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <ShoppingBag className="h-24 w-24 text-muted-foreground" />
                        <h1 className="text-3xl font-bold">Your cart is empty</h1>
                        <p className="text-muted-foreground max-w-md">
                            Looks like you haven&apos;t added anything to your cart yet. Start shopping to find amazing
                            products!
                        </p>
                        <Button asChild size="lg" className="mt-4">
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Header />
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    {!isAuthenticated && (
                        <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 px-4 py-2 rounded-md border border-yellow-200 dark:border-yellow-800">
                            💡 <Link href="/sign-in" className="underline font-medium">Sign in</Link> to save your cart
                        </div>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    {/* Cart Items */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cart Items ({cartCount})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.items.map((item, index) => (
                                    <div key={item._id || `${item.productId._id}-${index}`}>
                                        <ItemCart item={item} />
                                        {index < cart.items.length - 1 && (
                                            <Separator className="mt-4" />
                                        )}
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
                                        <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                                        <span className="font-medium">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleCheckout}
                                    disabled={isCheckingAuth || cartCount === 0}
                                >
                                    {isCheckingAuth ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Proceed to Checkout"
                                    )}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Secure checkout powered by Stripe
                                </p>
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
            <Footer />
        </div>
    )
}