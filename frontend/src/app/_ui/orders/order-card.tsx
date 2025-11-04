"use client"

import type {Order} from "@/lib/api/definitions"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function OrderCard({ order }: { order: Order}) {
    const router = useRouter()

    const statusLabels = {
        pending: "Pending",
        preparation: "In Preparation",
        payment_confirmed: "Payment Confirmed",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
    }

    const statusVariants = {
        pending: "outline" as const,
        preparation: "secondary" as const,
        payment_confirmed: "default" as const,
        shipped: "secondary" as const,
        delivered: "default" as const,
        cancelled: "destructive" as const,
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

    return (
        <div
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/profile/orders/${order._id}`)}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <p className="font-medium font-mono">{order.orderNumber}</p>
                </div>
                <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
                <p className="font-bold text-primary">{formatPrice(order.total)}</p>
            </div>
        </div>
    )
}
