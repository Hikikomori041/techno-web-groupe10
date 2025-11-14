"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    AlertTriangle,
    Clock,
    XCircle,
    Loader2,
    ArrowRight,
    BarChart3,
} from "lucide-react"
import {authService} from "@/lib/api/services/auth.service";
import {statsService} from "@/lib/api/services/stats.service";
import {DashboardStats, User} from "@/lib/api/definitions";
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {debugLog} from "@/lib/utils";


export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        checkAuthStatus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const checkAuthStatus = async () => {
        try {
            const result = await authService.isAuthenticated()

            if (result.authenticated && result.user) {
                setUser(result.user)
                if (result.user.roles.includes("admin") || result.user.roles.includes("moderator")) {
                    await fetchStats()
                }
            } else {
                setError("Not authenticated. Please login.")
                setTimeout(() => {
                    router.push("/sign-in")
                }, 2000)
            }
        } catch {
            setError("Failed to check authentication")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const statsData = await statsService.getDashboardStats()
            debugLog("Dashboard stats fetched:", {
                revenue: statsData.revenue,
                orders: statsData.orders,
                revenueByDayCount: statsData.revenueByDay?.length || 0,
                revenueByDaySample: statsData.revenueByDay?.slice(0, 3)
            })
            // Ensure revenueByDay is an array and has proper format
            if (statsData.revenueByDay && Array.isArray(statsData.revenueByDay)) {
                debugLog("Revenue by day data:", statsData.revenueByDay)
                // Fill in missing days for better graph visualization
                const filledRevenueByDay = fillMissingDays(statsData.revenueByDay)
                debugLog("Filled revenue by day:", filledRevenueByDay.slice(0, 5))
                setStats({
                    ...statsData,
                    revenueByDay: filledRevenueByDay
                })
            } else {
                debugLog("No revenueByDay data or not an array")
                setStats(statsData)
            }
        } catch (err) {
            debugLog("Failed to fetch stats:", err)
            setError("Failed to load statistics")
        }
    }

    // Fill in missing days in the last 30 days with zero revenue
    const fillMissingDays = (revenueData: Array<{date: string; revenue: number; orders: number}>) => {
        const daysMap = new Map<string, {date: string; revenue: number; orders: number}>()
        
        // Add existing data
        revenueData.forEach(day => {
            // Handle both YYYY-MM-DD and ISO date formats
            let dateStr = day.date
            if (dateStr.includes('T')) {
                dateStr = dateStr.split('T')[0]
            }
            // Ensure date is in YYYY-MM-DD format
            if (dateStr.length > 10) {
                dateStr = dateStr.substring(0, 10)
            }
            const revenue = typeof day.revenue === 'number' ? day.revenue : 0
            const orders = typeof day.orders === 'number' ? day.orders : 0
            daysMap.set(dateStr, {date: dateStr, revenue, orders})
        })
        
        // Fill in last 30 days
        const filled: Array<{date: string; revenue: number; orders: number}> = []
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)
            const dateStr = date.toISOString().split('T')[0]
            
            if (daysMap.has(dateStr)) {
                filled.push(daysMap.get(dateStr)!)
            } else {
                filled.push({date: dateStr, revenue: 0, orders: 0})
            }
        }
        
        return filled
    }

    const handleLogout = async () => {
        setIsLoading(true)
        await authService.logout()
        router.push("/sign-in")
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<
            string,
            { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
        > = {
            pending: {label: "Pending", variant: "outline"},
            preparation: {label: "Preparing", variant: "secondary"},
            payment_confirmed: {label: "Paid", variant: "default"},
            shipped: {label: "Shipped", variant: "secondary"},
            delivered: {label: "Delivered", variant: "default"},
            cancelled: {label: "Cancelled", variant: "destructive"},
        }
        const config = statusConfig[status] || {label: status, variant: "outline" as const}
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4"/>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/sign-in">Go to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isAdminOrMod = user.roles.includes("admin") || user.roles.includes("moderator")

    return (
        <div className="min-h-screen bg-background">
            <div className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
                        <p className="text-muted-foreground">
                            Welcome, {user.firstName} {user.lastName}
                        </p>
                    </div>

                    {isAdminOrMod && stats ? (
                        <>
                            {/* Key Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {/* Total Revenue */}
                                <Card
                                    className="bg-gradient-to-br from-primary to-accent border-0 text-primary-foreground">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
                                        <DollarSign className="h-5 w-5 opacity-90"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatPrice(stats.revenue.total)}</div>
                                        <p className="text-xs opacity-90 mt-1">This
                                            month: {formatPrice(stats.revenue.thisMonth)}</p>
                                    </CardContent>
                                </Card>

                                {/* Total Orders */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                        <ShoppingCart className="h-5 w-5 text-muted-foreground"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.orders.total}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Pending: {stats.orders.pending}</p>
                                    </CardContent>
                                </Card>

                                {/* Products Sold */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                                        <Package className="h-5 w-5 text-muted-foreground"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.sales.totalQuantitySold}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Avg: {formatPrice(stats.revenue.averageOrder)}</p>
                                    </CardContent>
                                </Card>

                                {/* Total Users */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <Users className="h-5 w-5 text-muted-foreground"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.users.total}</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Admins: {stats.users.admins} | Mods: {stats.users.moderators}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Revenue Trend */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5"/>
                                        Revenue Trend (Last 30 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-end justify-between gap-0.5 pb-8 px-2 overflow-x-auto">
                                        {stats.revenueByDay && stats.revenueByDay.length > 0 ? (
                                            (() => {
                                                const revenues = stats.revenueByDay.map((d) => Number(d.revenue) || 0)
                                                const maxRevenue = Math.max(...revenues, 1) // Ensure at least 1 to avoid division by zero
                                                const hasData = revenues.some(r => r > 0)
                                                
                                                debugLog("Graph rendering:", {
                                                    maxRevenue,
                                                    hasData,
                                                    revenuesSample: revenues.slice(0, 5),
                                                    totalDays: stats.revenueByDay.length
                                                })
                                                
                                                return hasData ? (
                                                    stats.revenueByDay.map((day, index) => {
                                                        const revenue = Number(day.revenue) || 0
                                                        const heightPercent = maxRevenue > 0 ? Math.max((revenue / maxRevenue) * 100, 3) : 0 // Minimum 3% height for visibility
                                                        const minHeightPx = revenue > 0 ? '8px' : '0'
                                                        return (
                                                            <div key={`${day.date}-${index}`}
                                                                 className="flex-1 flex flex-col items-center gap-1 group min-w-[6px] max-w-[12px]">
                                                                <div
                                                                    className="w-full bg-gradient-to-t from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/80 rounded-t transition-all cursor-pointer relative shadow-md hover:shadow-lg"
                                                                    style={{
                                                                        height: `${heightPercent}%`,
                                                                        minHeight: minHeightPx
                                                                    }}
                                                                    title={`${formatDate(day.date)}: ${formatPrice(revenue)} (${day.orders || 0} orders)`}
                                                                >
                                                                    <div
                                                                        className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1.5 rounded whitespace-nowrap border shadow-lg z-10 pointer-events-none">
                                                                        <div className="font-semibold text-primary">{formatPrice(revenue)}</div>
                                                                        <div className="text-xs text-muted-foreground mt-0.5">{day.orders || 0} order{day.orders !== 1 ? 's' : ''}</div>
                                                                        <div className="text-xs text-muted-foreground">{formatDate(day.date)}</div>
                                                                    </div>
                                                                </div>
                                                                {index % 7 === 0 && (
                                                                    <span
                                                                        className="text-[10px] text-muted-foreground whitespace-nowrap -rotate-45 origin-center mt-1">
                                        {formatDate(day.date)}
                                      </span>
                                                                )}
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="w-full text-center py-8">
                                                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50"/>
                                                        <p className="text-muted-foreground font-medium">No revenue data available</p>
                                                        <p className="text-xs text-muted-foreground mt-2">Complete some orders to see revenue trends</p>
                                                    </div>
                                                )
                                            })()
                                        ) : (
                                            <div className="w-full text-center py-8">
                                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50"/>
                                                <p className="text-muted-foreground font-medium">No revenue data available</p>
                                                <p className="text-xs text-muted-foreground mt-2">Complete some orders to see revenue trends</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Orders & Products Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Order Status Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5"/>
                                            Order Status Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            {
                                                key: "pending",
                                                label: "Pending",
                                                color: "bg-yellow-500",
                                                count: stats.orders.pending
                                            },
                                            {
                                                key: "preparation",
                                                label: "Preparing",
                                                color: "bg-blue-500",
                                                count: stats.orders.preparation
                                            },
                                            {
                                                key: "payment_confirmed",
                                                label: "Paid",
                                                color: "bg-green-500",
                                                count: stats.orders.payment_confirmed,
                                            },
                                            {
                                                key: "shipped",
                                                label: "Shipped",
                                                color: "bg-purple-500",
                                                count: stats.orders.shipped
                                            },
                                            {
                                                key: "delivered",
                                                label: "Delivered",
                                                color: "bg-green-600",
                                                count: stats.orders.delivered
                                            },
                                            {
                                                key: "cancelled",
                                                label: "Cancelled",
                                                color: "bg-red-500",
                                                count: stats.orders.cancelled
                                            },
                                        ].map((status) => {
                                            const percentage = stats.orders.total > 0 ? (status.count / stats.orders.total) * 100 : 0
                                            return (
                                                <div key={status.key}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-foreground">{status.label}</span>
                                                        <span className="text-foreground font-semibold">
                              {status.count} ({Math.round(percentage)}%)
                            </span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className={`${status.color} h-2 rounded-full transition-all`}
                                                            style={{width: `${percentage}%`}}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </CardContent>
                                </Card>

                                {/* Top Products */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5"/>
                                            Top Products
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {stats.sales.topProducts.length > 0 ? (
                                            stats.sales.topProducts.map((product, index) => {
                                                const maxRevenue = stats.sales.topProducts[0]?.revenue || 1
                                                const percentage = (product.revenue / maxRevenue) * 100
                                                return (
                                                    <div key={index}>
                                                        <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground font-medium">
                                {index + 1}. {product.name}
                              </span>
                                                            <span
                                                                className="text-foreground font-semibold">{formatPrice(product.revenue)}</span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2 mb-1">
                                                            <div
                                                                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                                                                style={{width: `${percentage}%`}}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{product.quantity} units
                                                            sold</p>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">No sales data yet</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Orders & Alerts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Recent Orders */}
                                <Card className="lg:col-span-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Recent Orders</CardTitle>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/dashboard/orders">
                                                View all <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {stats.recentOrders.length > 0 ? (
                                            stats.recentOrders.map((order) => (
                                                <div
                                                    key={order._id}
                                                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition cursor-pointer"
                                                    onClick={() => router.push(`/orders/${order._id}`)}
                                                >
                                                    <div>
                                                        <p className="font-mono text-sm font-semibold text-foreground">{order.orderNumber}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(order.createdAt).toLocaleString("en-US")}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {getStatusBadge(order.status)}
                                                        <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">No orders yet</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Alerts */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Alerts</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Low Stock Alert */}
                                        <div
                                            className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle
                                                    className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
                                                <p className="font-semibold text-yellow-800 dark:text-yellow-400">Low
                                                    Stock</p>
                                            </div>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-500">
                                                {stats.products.lowStock} product{stats.products.lowStock !== 1 ? "s" : ""} low
                                                on stock
                                            </p>
                                        </div>

                                        {/* Out of Stock Alert */}
                                        {stats.products.outOfStock > 0 && (
                                            <div
                                                className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400"/>
                                                    <p className="font-semibold text-red-800 dark:text-red-400">Out of
                                                        Stock</p>
                                                </div>
                                                <p className="text-sm text-red-700 dark:text-red-500">
                                                    {stats.products.outOfStock} product{stats.products.outOfStock !== 1 ? "s" : ""} out
                                                    of stock
                                                </p>
                                            </div>
                                        )}

                                        {/* Pending Orders */}
                                        {stats.orders.pending > 0 && (
                                            <div
                                                className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
                                                    <p className="font-semibold text-blue-800 dark:text-blue-400">Action
                                                        Required</p>
                                                </div>
                                                <p className="text-sm text-blue-700 dark:text-blue-500 mb-2">
                                                    {stats.orders.pending} pending
                                                    order{stats.orders.pending !== 1 ? "s" : ""} need processing
                                                </p>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0 text-blue-600 dark:text-blue-400"
                                                    asChild
                                                >
                                                    <Link href="/dashboard/orders">
                                                        View orders <ArrowRight className="ml-1 h-3 w-3"/>
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}

                                        {/* Quick Stats */}
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm font-semibold text-foreground mb-2">Quick Stats</p>
                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                <p>• {stats.products.inStock} products in stock</p>
                                                <p>• {stats.orders.delivered} orders delivered</p>
                                                <p>• Today: {formatPrice(stats.revenue.today)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        /* Regular User View */
                        <div className="max-w-2xl mx-auto">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center gap-4">
                                        {user.picture ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={user.picture || "/placeholder.svg"}
                                                    alt="Profile"
                                                    className="w-20 h-20 rounded-full border-2 border-primary"
                                                />
                                            </>
                                        ) : (
                                            <div
                                                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                                                {user.firstName?.[0]}
                                                {user.lastName?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="text-xl font-semibold text-foreground">
                                                {user.firstName} {user.lastName}
                                            </h2>
                                            <p className="text-muted-foreground">{user.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                {user.roles.map((role) => (
                                                    <Badge key={role} variant="secondary">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent"
                                                asChild>
                                            <Link href="/dashboard/products">
                                                <Package className="h-8 w-8"/>
                                                <span className="text-sm font-medium">Browse Products</span>
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent"
                                                asChild>
                                            <Link href="/dashboard/orders">
                                                <ShoppingCart className="h-8 w-8"/>
                                                <span className="text-sm font-medium">My Orders</span>
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent"
                                                asChild>
                                            <Link href="/cart">
                                                <ShoppingCart className="h-8 w-8"/>
                                                <span className="text-sm font-medium">Shopping Cart</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-auto flex-col gap-2 py-6 text-destructive hover:text-destructive bg-transparent"
                                            onClick={handleLogout}
                                        >
                                            <XCircle className="h-8 w-8"/>
                                            <span className="text-sm font-medium">Logout</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
