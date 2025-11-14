"use client"

import {useEffect, useState, Suspense} from "react"
import {useRouter} from "next/navigation"
import {ordersService} from "@/lib/api/services/orders.service";
import type {Order} from "@/lib/api/definitions"
import {Button} from "@/components/ui/button"
import {Loader2, AlertTriangle, Package} from "lucide-react"
import OrderCard from "@/app/_ui/orders/order-card";
import { debugLog } from "@/lib/utils";

function OrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const ordersData = await ordersService.getUserOrders()
            debugLog("Loaded profile orders", ordersData)
            setOrders(ordersData)
        } catch (err: unknown) {
            setError((err as { message?: string })?.message || "Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4"/>
                    <p className="text-muted-foreground">Loading your orders...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full text-center border">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={fetchOrders}>Retry</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card shadow border-b">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {orders.length} {orders.length === 1 ? "order" : "orders"}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => router.push("/products")}>
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {orders.length === 0 ? (
                    <div className="bg-card rounded-lg shadow-lg p-12 text-center border">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                        <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h3>
                        <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet</p>
                        <Button onClick={() => router.push("/products")}>Discover Our Products</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order._id} order={order}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function OrdersPageWrapper() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                </div>
            }
        >
            <OrdersPage/>
        </Suspense>
    )
}