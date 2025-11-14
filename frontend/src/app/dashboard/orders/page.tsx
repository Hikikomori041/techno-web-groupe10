"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
    Clock,
    Package,
    CreditCard,
    Truck,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    LayoutGrid,
    TableIcon,
    MapPin,
} from "lucide-react"
import {User} from "@/lib/api/definitions"
import {authService} from "@/lib/api/services/auth.service";
import type {Order} from "@/lib/api/definitions"
import {ordersService} from "@/lib/api/services/orders.service";
import {toast} from "sonner";
import {debugLog} from "@/lib/utils";



export default function AdminOrdersPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [viewMode, setViewMode] = useState<"table" | "cards">("cards")

    useEffect(() => {
        checkAuthAndFetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const checkAuthAndFetchOrders = async () => {
        try {
            const result = await authService.isAuthenticated()

            if (!result.authenticated || !result.user) {
                router.push("/sign-in")
                return
            }

            const hasAccess = result.user.roles.includes("admin") || result.user.roles.includes("moderator")
            if (!hasAccess) {
                router.push("/unauthorized")
                return
            }

            setUser(result.user)
            await fetchOrders()
        } catch {
            setError("Authentication failed")
            router.push("/sign-in")
        }
    }

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const ordersData = await ordersService.getAllOrders()
            setOrders(ordersData)
        } catch (err: unknown) {
            setError((err as { message?: string })?.message || "Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    const getOrderId = (order: Order): string => {
        return String(order._id);
    }

    const handleUpdateStatus = async (order: Order, newStatus: string) => {
        const orderId = getOrderId(order);
        if (!orderId) {
            toast.error("Invalid order ID")
            return;
        }
        try {
            setUpdatingOrder(orderId)
            debugLog("Updating order status", { orderId, newStatus })
            await ordersService.updateOrderStatus(orderId, newStatus)
            toast.success("Order status updated successfully")
            await fetchOrders()
        } catch (err: unknown) {
            debugLog("Error updating order status:", err)
            const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || "Failed to update order status"
            toast.error(errorMessage)
        } finally {
            setUpdatingOrder(null)
        }
    }

    const handleUpdatePayment = async (order: Order, newPaymentStatus: string) => {
        const orderId = getOrderId(order);
        if (!orderId) {
            toast.error("Invalid order ID")
            return;
        }
        try {
            setUpdatingOrder(orderId)
            debugLog("Updating payment status", { orderId, newPaymentStatus })
            await ordersService.updatePaymentStatus(orderId, newPaymentStatus)
            toast.success("Payment status updated successfully")
            await fetchOrders()
        } catch (err: unknown) {
            debugLog("Error updating payment status:", err)
            const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || "Failed to update payment status"
            toast.error(errorMessage)
        } finally {
            setUpdatingOrder(null)
        }
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
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Deduplicate orders by _id to ensure unique keys
    const uniqueOrders = orders.reduce((acc, order) => {
        const orderId = order._id ? String(order._id) : null;
        if (orderId && !acc.seen.has(orderId)) {
            acc.seen.add(orderId);
            acc.unique.push(order);
        } else if (!orderId) {
            // If no ID, include it anyway (shouldn't happen, but handle gracefully)
            acc.unique.push(order);
        }
        return acc;
    }, { seen: new Set<string>(), unique: [] as Order[] });

    const filteredOrders = filterStatus === "all" 
        ? uniqueOrders.unique 
        : uniqueOrders.unique.filter((order) => order.status === filterStatus)

    const ordersByStatus = {
        pending: orders.filter((o) => o.status === "pending"),
        preparation: orders.filter((o) => o.status === "preparation"),
        payment_confirmed: orders.filter((o) => o.status === "payment_confirmed"),
        shipped: orders.filter((o) => o.status === "shipped"),
        delivered: orders.filter((o) => o.status === "delivered"),
        cancelled: orders.filter((o) => o.status === "cancelled"),
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            </div>
        )
    }

    if (error && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-6">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Button asChild>
                            <Link href="/admin/products">Back to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
                    <p className="text-muted-foreground">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Stats Summary */}
                {orders.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                        <Card
                            className={`cursor-pointer hover:shadow-lg transition ${filterStatus === "pending" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setFilterStatus(filterStatus === "pending" ? "all" : "pending")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{ordersByStatus.pending.length}</p>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:shadow-lg transition ${filterStatus === "preparation" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setFilterStatus(filterStatus === "preparation" ? "all" : "preparation")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Preparation</p>
                                </div>
                                <p className="text-2xl font-bold text-primary">{ordersByStatus.preparation.length}</p>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:shadow-lg transition ${filterStatus === "payment_confirmed" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setFilterStatus(filterStatus === "payment_confirmed" ? "all" : "payment_confirmed")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <CreditCard className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Paid</p>
                                </div>
                                <p className="text-2xl font-bold text-primary">{ordersByStatus.payment_confirmed.length}</p>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:shadow-lg transition ${filterStatus === "shipped" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setFilterStatus(filterStatus === "shipped" ? "all" : "shipped")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Truck className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Shipped</p>
                                </div>
                                <p className="text-2xl font-bold text-accent">{ordersByStatus.shipped.length}</p>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:shadow-lg transition ${filterStatus === "delivered" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setFilterStatus(filterStatus === "delivered" ? "all" : "delivered")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Delivered</p>
                                </div>
                                <p className="text-2xl font-bold text-primary">{ordersByStatus.delivered.length}</p>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:shadow-lg transition ${filterStatus === "cancelled" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setFilterStatus(filterStatus === "cancelled" ? "all" : "cancelled")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <XCircle className="h-4 w-4 text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Cancelled</p>
                                </div>
                                <p className="text-2xl font-bold text-destructive">{ordersByStatus.cancelled.length}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* View Mode Toggle */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-foreground">View:</label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === "cards" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("cards")}
                                    >
                                        <LayoutGrid className="h-4 w-4 mr-2"/>
                                        Cards
                                    </Button>
                                    <Button
                                        variant={viewMode === "table" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("table")}
                                    >
                                        <TableIcon className="h-4 w-4 mr-2"/>
                                        Table
                                    </Button>
                                </div>
                            </div>
                            {filterStatus !== "all" && (
                                <Button variant="link" onClick={() => setFilterStatus("all")} className="text-primary">
                                    View All
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Cards View */}
                {viewMode === "cards" && (
                    <div className="space-y-4">
                        {filteredOrders.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2"/>
                                    <p className="text-muted-foreground">No orders found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredOrders.map((order, index) => {
                                // Ensure unique key - use _id or fallback to index
                                const orderKey = order._id ? String(order._id) : `order-${index}`

                                return (
                                    <Card key={orderKey} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">{formatDate(order.createdAt)}</p>
                                                    <p className="text-lg font-bold text-foreground font-mono">{order.orderNumber}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Customer: {typeof order.userId === 'object' && order.userId ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Order
                                                        Status</label>
                                                    <Select
                                                        value={order.status}
                                                        onValueChange={(value) => handleUpdateStatus(order, value)}
                                                        disabled={updatingOrder === getOrderId(order)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="preparation">In Preparation</SelectItem>
                                                            <SelectItem value="payment_confirmed">Payment
                                                                Confirmed</SelectItem>
                                                            <SelectItem value="shipped">Shipped</SelectItem>
                                                            <SelectItem value="delivered">Delivered</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">Payment
                                                        Status</label>
                                                    <Select
                                                        value={order.paymentStatus}
                                                        onValueChange={(value) => handleUpdatePayment(order, value)}
                                                        disabled={updatingOrder === getOrderId(order)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="paid">Paid</SelectItem>
                                                            <SelectItem value="failed">Failed</SelectItem>
                                                            <SelectItem value="refunded">Refunded</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div
                                                className="flex justify-between items-center pt-4 border-t border-border">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4"/>
                                                    {order.shippingAddress.city}, {order.shippingAddress.country}
                                                </div>
                                                <Button onClick={() => router.push(`/dashboard/orders/${getOrderId(order)}`)}>View
                                                    Details</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                )}

                {/* Table View */}
                {viewMode === "table" && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2"/>
                                                    <p className="text-muted-foreground">No orders found</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredOrders.map((order, index) => {
                                                // Ensure unique key - use _id, id, or fallback to index
                                                const orderKey = order._id ? String(order._id) : `order-${index}`

                                                return (
                                                    <TableRow key={orderKey} className="hover:bg-muted/50">
                                                        <TableCell>
                                                            <div
                                                                className="text-sm font-mono font-medium text-foreground">{order.orderNumber}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm text-foreground">
                                                                {typeof order.userId === 'object' && order.userId ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() : 'N/A'}
                                                            </div>
                                                            <div
                                                                className="text-xs text-muted-foreground">{typeof order.userId === 'object' && order.userId ? order.userId.email : 'N/A'}</div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatDate(order.createdAt)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div
                                                                className="text-sm font-semibold text-foreground">{formatPrice(order.total)}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={order.status}
                                                                onValueChange={(value) => handleUpdateStatus(order, value)}
                                                                disabled={updatingOrder === getOrderId(order)}
                                                            >
                                                                <SelectTrigger className="w-[180px]">
                                                                    <SelectValue/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="preparation">In
                                                                        Preparation</SelectItem>
                                                                    <SelectItem value="payment_confirmed">Payment
                                                                        Confirmed</SelectItem>
                                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={order.paymentStatus}
                                                                onValueChange={(value) => handleUpdatePayment(order, value)}
                                                                disabled={updatingOrder === getOrderId(order)}
                                                            >
                                                                <SelectTrigger className="w-[140px]">
                                                                    <SelectValue/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="paid">Paid</SelectItem>
                                                                    <SelectItem value="failed">Failed</SelectItem>
                                                                    <SelectItem value="refunded">Refunded</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="link"
                                                                onClick={() => router.push(`/dashboard/orders/${getOrderId(order)}`)}
                                                                className="text-primary"
                                                            >
                                                                View
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
