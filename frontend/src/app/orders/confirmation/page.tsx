"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Package, MapPin, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/app/_ui/commun/header"
import { Footer } from "@/app/_ui/commun/footer"
import { ordersService } from "@/lib/api/services/orders.service"
import { Order } from "@/lib/api/definitions"
import { debugLog } from "@/lib/utils"

function OrderConfirmationContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!orderId) {
            router.push("/products")
            return
        }

        const fetchOrder = async () => {
            try {
                const orderData = await ordersService.getOrderById(orderId)
                setOrder(orderData)
            } catch (err: unknown) {
                debugLog("Error fetching order:", err)
                const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || "Impossible de récupérer les détails de la commande"
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header />
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Chargement de votre commande...</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Header />
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <Package className="h-24 w-24 text-muted-foreground" />
                        <h1 className="text-3xl font-bold">Commande introuvable</h1>
                        <p className="text-muted-foreground max-w-md">{error}</p>
                        <Button asChild size="lg" className="mt-4">
                            <Link href="/products">Retour au catalogue</Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: "En attente",
            preparation: "En préparation",
            payment_confirmed: "Paiement confirmé",
            shipped: "Expédiée",
            delivered: "Livrée",
            cancelled: "Annulée",
        }
        return labels[status] || status
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            preparation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            payment_confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        }
        return colors[status] || "bg-gray-100 text-gray-800"
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Header />
            <div className="container mx-auto px-4 py-8 lg:px-8">
                {/* Success Header */}
                <div className="max-w-3xl mx-auto mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-green-100 dark:bg-green-900 p-6">
                            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Commande confirmée !</h1>
                    <p className="text-lg text-muted-foreground">
                        Merci pour votre achat. Votre commande a été créée avec succès.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Order Info Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Commande #{order.orderNumber}</CardTitle>
                                    <CardDescription>
                                        Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </CardDescription>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Shipping Address */}
                            <div className="flex gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold mb-1">Adresse de livraison</p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.shippingAddress.street}<br />
                                        {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                                        {order.shippingAddress.country}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Expected Delivery */}
                            <div className="flex gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold mb-1">Livraison estimée</p>
                                    <p className="text-sm text-muted-foreground">
                                        3-5 jours ouvrables
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Articles commandés ({order.items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Quantité: {item.quantity} × ${item.productPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                                    </div>
                                    {index < order.items.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}

                            <Separator />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">${order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild variant="default" className="flex-1">
                            <Link href="/profile/orders">Voir mes commandes</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/products">Continuer mes achats</Link>
                        </Button>
                    </div>

                    {/* Info Box */}
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                        <CardContent className="pt-6">
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-blue-900 dark:text-blue-100">
                                    📧 Un e-mail de confirmation a été envoyé
                                </p>
                                <p className="text-blue-700 dark:text-blue-300">
                                    Vous recevrez des notifications par e-mail à chaque étape de votre commande.
                                    Vous pouvez également suivre l&apos;état de votre commande dans votre espace personnel.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-muted/30">
                <Header />
                <div className="container mx-auto px-4 py-16 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Chargement...</p>
                    </div>
                </div>
                <Footer />
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    )
}

