"use client";

import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {useRouter} from "next/navigation";
import {authService} from "@/lib/api/services/auth.service";
import {ordersService} from "@/lib/api/services/orders.service";
import {useEffect, useState} from "react";
import {User} from "@/lib/api/definitions";

export default function ProfilePage() {
    const orders = [
        {id: "ORD-001", date: "2024-01-15", status: "Delivered", total: 1299.99, items: 2},
        {id: "ORD-002", date: "2024-01-10", status: "In Transit", total: 899.99, items: 1},
        {id: "ORD-003", date: "2024-01-05", status: "Processing", total: 149.99, items: 3},
    ];

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.profile();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        }

        fetchUser();
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium">First Name</label>
                            <p className="text-sm text-muted-foreground mt-1">{user?.firstName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Last Name</label>
                            <p className="text-sm text-muted-foreground mt-1">{user?.lastName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Provider</label>
                            <p className="text-sm text-muted-foreground mt-1">{user?.provider}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                    <Button variant="outline"
                            onClick={() => router.push("/prodile/orders")}
                            className="w-full mt-4 bg-transparent">
                        View All Orders
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
