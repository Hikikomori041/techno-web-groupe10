"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import type {Order} from "@/lib/api/definitions"
import {ordersService} from "@/lib/api/services/orders.service";
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {ArrowLeft, Loader2, AlertTriangle, Package, CheckCircle2} from "lucide-react"
import {authService} from "@/lib/api/services/auth.service";
import {toast} from "sonner";
import { debugLog } from "@/lib/utils";

const statusLabels = {
    pending: "Pending",
    preparation: "In Preparation",
    payment_confirmed: "Payment Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
}

const paymentLabels = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
}

export default function DashboardOrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.dashOrderId as string

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cancelling, setCancelling] = useState(false)

    useEffect(() => {
        if (orderId) {
            fetchOrder()
        } else {
            setError("Order ID is missing")
            setLoading(false)
        }
    }, [orderId])

    const fetchOrder = async () => {
        if (!orderId) {
            setError("Order ID is missing")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const check = await authService.isAuthenticated()
            if (!check.authenticated || !check.user) {
                router.push('/sign-in')
                return
            }
            const hasAccess = check.user.roles.includes("admin") || check.user.roles.includes("moderator")
            if (!hasAccess) {
                router.push('/unauthorized')
                return
            }

            debugLog("Fetching order with ID:", orderId)
            const orderData = await ordersService.getOrderById(orderId)
            debugLog("Dashboard order loaded", orderData)
            
            if (!orderData) {
                setError("Order not found")
                toast.error("Order not found")
            } else {
                setOrder(orderData)
            }
        } catch (err: any) {
            debugLog("Error fetching order:", err)
            const errorMessage = err.response?.data?.message || err.message || "Failed to load order"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const getOrderId = (order: Order | null): string => {
        if (!order) return orderId || '';
        return order._id ? String(order._id) : (order.id ? String(order.id) : orderId || '');
    }

    const handleCancelOrder = async () => {
        if (!confirm("Are you sure you want to cancel this order?")) {
            return
        }
        const cancelOrderId = getOrderId(order);
        if (!cancelOrderId) {
            toast.error("Invalid order ID")
            return
        }
        try {
            setCancelling(true)
            debugLog("Cancelling order:", cancelOrderId)
            await ordersService.cancelOrder(cancelOrderId)
            toast.success("Order cancelled successfully")
            // Refresh order data
            await fetchOrder()
        } catch (err: any) {
            debugLog("Error cancelling order:", err)
            const errorMessage = err.response?.data?.message || err.message || "Failed to cancel order"
            toast.error(errorMessage)
        } finally {
            setCancelling(false)
        }
    }

    const canCancel = (status: string) => {
        return ["pending", "preparation", "payment_confirmed"].includes(status)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "delivered":
                return "default"
            case "shipped":
            case "preparation":
                return "secondary"
            case "cancelled":
                return "destructive"
            default:
                return "outline"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4"/>
                    <p className="text-muted-foreground">Loading order...</p>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="pt-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || "This order does not exist."}</p>
                    <Button onClick={() => router.push("/profile/orders")}>My Orders</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-3/4 space-y-8 flex flex-col mx-auto mt-12 mb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/orders")}>
                        <ArrowLeft className="h-5 w-5"/>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-mono">{order.orderNumber}</h1>
                        <p className="text-sm text-muted-foreground mt-1">Ordered on {formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <Badge variant={getStatusVariant(order.status)}>{statusLabels[order.status]}</Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {["pending", "preparation", "payment_confirmed", "shipped", "delivered"].map((status, index) => {
                                    const isComplete =
                                        ["pending", "preparation", "payment_confirmed", "shipped", "delivered"].indexOf(order.status) >=
                                        index
                                    const isCurrent = order.status === status

                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                }`}
                                            >
                                                {isComplete ? <CheckCircle2 className="h-4 w-4"/> : index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p
                                                    className={`font-medium ${
                                                        isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {statusLabels[status as keyof typeof statusLabels]}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ordered Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex items-center gap-4">
                                                <Package className="h-10 w-10 text-muted-foreground"/>
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{item.productName || `Product #${item.productId}`}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Quantity: {item.quantity} × {formatPrice(item.productPrice)}
                                                    </p>
                                                </div>
                                                <div className="text-lg font-bold text-primary">
                                                    {formatPrice(item.subtotal || (item.quantity * item.productPrice))}
                                                </div>
                                            </div>
                                            {index < order.items.length - 1 && <Separator className="mt-4"/>}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No items in this order</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Total */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(order.total)}</span>
                                </div>
                            </div>

                            <Separator/>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                                <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                                    {paymentLabels[order.paymentStatus || "pending"]}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {order.shippingAddress.street}
                                    <br/>
                                    {order.shippingAddress.postalCode} {order.shippingAddress.city}
                                    <br/>
                                    {order.shippingAddress.country}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {canCancel(order.status) && (
                            <Button onClick={handleCancelOrder} disabled={cancelling} variant="destructive"
                                    className="w-full">
                                {cancelling ? "Cancelling..." : "Cancel Order"}
                            </Button>
                        )}

                        <Button onClick={() => router.push("/dashboard/orders")} variant="outline" className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            All Orders
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
