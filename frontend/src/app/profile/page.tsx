"use client";

import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {authService} from "@/lib/api/services/auth.service";
import {ordersService} from "@/lib/api/services/orders.service";
import {useEffect, useState} from "react";
import {Order, User} from "@/lib/api/definitions";
import OrderCard from "@/app/_ui/orders/order-card";

export default function ProfilePage() {

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.isAuthenticated();
                if (!userData.authenticated) {
                    router.push("/login");
                    return;
                } else {
                    if (userData.user){
                        setUser(userData.user);
                        const userOrders = await ordersService.getUserOrders();
                        setOrders(userOrders);
                    }
                }
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
                        {orders.slice(0, 4).map((order) => (
                            <OrderCard order={order} key={order._id}/>
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
