"use client";

import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {authService} from "@/lib/api/services/auth.service";
import {useEffect, useState} from "react";
import {User} from "@/lib/api/definitions";
import {toast} from "sonner";

export default function ProfilePage() {

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    const checkAuthAndFetchProfile = async () => {
        try {
            const result = await authService.isAuthenticated();

            if (!result.authenticated || !result.user) {
                router.push('/sign-in');
                return;
            }

            const res = await authService.profile();
            setUser(res)
        } catch {
            toast.error('Authentication failed');
            router.push('/sign-in');
        }
    };

    useEffect(() => {
        checkAuthAndFetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <Button variant="outline"
                            onClick={() => router.push("/profile/orders")}
                            className="w-full mt-4 bg-transparent">
                        View All Orders
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
