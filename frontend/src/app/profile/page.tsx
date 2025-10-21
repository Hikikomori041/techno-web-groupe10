import { User, Package, MapPin, CreditCard, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
    const orders = [
        {
            id: "ORD-001",
            date: "2024-01-15",
            status: "Delivered",
            total: 1299.99,
            items: 2,
        },
        {
            id: "ORD-002",
            date: "2024-01-10",
            status: "In Transit",
            total: 899.99,
            items: 1,
        },
        {
            id: "ORD-003",
            date: "2024-01-05",
            status: "Processing",
            total: 149.99,
            items: 3,
        },
    ]

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-24 w-24 mb-4">
                                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">JD</AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold">John Doe</h2>
                                    <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                                    <Badge className="mt-2" variant="secondary">
                                        Premium Member
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-2">
                                <nav className="flex flex-col gap-1">
                                    <Button variant="ghost" className="justify-start gap-2">
                                        <User className="h-4 w-4" />
                                        Profile Info
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-2">
                                        <Package className="h-4 w-4" />
                                        Orders
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Addresses
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Payment Methods
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-2">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </Button>
                                    <Separator className="my-2" />
                                    <Button variant="ghost" className="justify-start gap-2 text-destructive hover:text-destructive">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </Button>
                                </nav>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Profile Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Manage your personal information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium">First Name</label>
                                        <p className="text-sm text-muted-foreground mt-1">John</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Last Name</label>
                                        <p className="text-sm text-muted-foreground mt-1">Doe</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <p className="text-sm text-muted-foreground mt-1">john.doe@example.com</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Phone</label>
                                        <p className="text-sm text-muted-foreground mt-1">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <Button>Edit Profile</Button>
                            </CardContent>
                        </Card>

                        {/* Order History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>View and track your orders</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{order.id}</p>
                                                    <Badge
                                                        variant={
                                                            order.status === "Delivered"
                                                                ? "default"
                                                                : order.status === "In Transit"
                                                                    ? "secondary"
                                                                    : "outline"
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.items} {order.items === 1 ? "item" : "items"} • {order.date}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">${order.total.toFixed(2)}</p>
                                                <Button variant="link" className="h-auto p-0 text-primary">
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-4 bg-transparent">
                                    View All Orders
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Saved Addresses */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Saved Addresses</CardTitle>
                                <CardDescription>Manage your delivery addresses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium">Home</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    123 Main Street
                                                    <br />
                                                    Apartment 4B
                                                    <br />
                                                    New York, NY 10001
                                                </p>
                                            </div>
                                            <Badge>Default</Badge>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full bg-transparent">
                                        Add New Address
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
