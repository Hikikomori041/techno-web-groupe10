"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, MapPin, CreditCard, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/app/_ui/commun/header"
import { Footer } from "@/app/_ui/commun/footer"
import { useCart } from "@/context/cart.context"
import { ordersService } from "@/lib/api/services/orders.service"
import { ShippingAddress } from "@/lib/api/definitions"
import { toast } from "sonner"

export default function CheckoutPage() {
    const router = useRouter()
    const { cart, cartCount, cartTotal, clearCart } = useCart()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        street: "",
        city: "",
        postalCode: "",
        country: "France",
    })

    // Redirect if cart is empty
    useEffect(() => {
        if (!cart || cartCount === 0) {
            router.push("/cart")
        }
    }, [cart, cartCount, router])

    const handleInputChange = (field: keyof ShippingAddress, value: string) => {
        setShippingAddress(prev => ({ ...prev, [field]: value }))
    }

    const validateForm = (): boolean => {
        if (!shippingAddress.street.trim()) {
            toast.error("Veuillez entrer une adresse")
            return false
        }
        if (!shippingAddress.city.trim()) {
            toast.error("Veuillez entrer une ville")
            return false
        }
        if (!shippingAddress.postalCode.trim()) {
            toast.error("Veuillez entrer un code postal")
            return false
        }
        if (!shippingAddress.country.trim()) {
            toast.error("Veuillez entrer un pays")
            return false
        }
        return true
    }

    const handleSubmitOrder = async () => {
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const order = await ordersService.createOrder(shippingAddress)
            
            // Clear cart from context
            clearCart()
            
            toast.success("Commande créée avec succès!")
            router.push(`/orders/confirmation?orderId=${order._id}`)
        } catch (error: any) {
            console.error("Order creation error:", error)
            const message = error.response?.data?.message || error.message || "Erreur lors de la création de la commande"
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (cartCount === 0) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Header />
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Finaliser votre commande</h1>
                    <p className="text-muted-foreground mt-2">
                        Entrez vos informations de livraison pour terminer votre achat
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    {/* Shipping Address Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Adresse de livraison
                                </CardTitle>
                                <CardDescription>
                                    Où souhaitez-vous recevoir votre commande ?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="street">Adresse *</Label>
                                    <Input
                                        id="street"
                                        placeholder="123 rue de la République"
                                        value={shippingAddress.street}
                                        onChange={(e) => handleInputChange("street", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ville *</Label>
                                        <Input
                                            id="city"
                                            placeholder="Paris"
                                            value={shippingAddress.city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">Code postal *</Label>
                                        <Input
                                            id="postalCode"
                                            placeholder="75001"
                                            value={shippingAddress.postalCode}
                                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Pays *</Label>
                                    <Input
                                        id="country"
                                        placeholder="France"
                                        value={shippingAddress.country}
                                        onChange={(e) => handleInputChange("country", e.target.value)}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Paiement
                                </CardTitle>
                                <CardDescription>
                                    Le paiement sera traité à la livraison (COD - Cash on Delivery)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                        💳 Paiement à la livraison disponible
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                                        Vous pouvez payer en espèces ou par carte lors de la réception de votre commande.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    Résumé de la commande
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Cart Items */}
                                <div className="space-y-3">
                                    {cart.items.map((item) => (
                                        <div key={item._id} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.productId.nom}</p>
                                                <p className="text-muted-foreground">
                                                    Quantité: {item.quantity} × ${item.productId.prix.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Totals */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Sous-total ({cartCount} articles)</span>
                                        <span className="font-medium">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Livraison</span>
                                        <span className="font-medium text-green-600">Gratuite</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Traitement en cours...
                                        </>
                                    ) : (
                                        "Confirmer la commande"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push("/cart")}
                                    disabled={isSubmitting}
                                >
                                    Retour au panier
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">Livraison gratuite</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">Politique de retour de 30 jours</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary text-xs">✓</span>
                                        </div>
                                        <p className="text-muted-foreground">Garantie 1 an sur tous les produits</p>
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

