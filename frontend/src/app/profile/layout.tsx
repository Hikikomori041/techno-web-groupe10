"use client";

import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {ReactNode} from "react";
import {authService} from "@/lib/api/services/auth.service";
import {Header} from "@/app/_ui/commun/header";
import {Footer} from "@/app/_ui/commun/footer";
import {useEffect, useState} from "react";
import type {User as UserType} from "@/lib/api/definitions";
import {Sidenav} from "@/app/_ui/profile/sidenav";

export default function ProfileLayout({children}: { children: ReactNode }) {
    const router = useRouter();

    const [user, setUser] = useState<UserType | null>(null);

    const checkAuthAndFetchProfile = async () => {
        try {
            const result = await authService.isAuthenticated();

            if (!result.authenticated || !result.user) {
                router.push('/sign-in');
                return;
            }

            const res = await authService.profile();
            setUser(res)
        } catch (err) {
            toast.error('Authentication failed');
            router.push('/sign-in');
        }
    };

    useEffect(() => {
        checkAuthAndFetchProfile()
    }, []);

    const logout = async () => {
        toast.info("Logged out");
        await authService.logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <Header/>
            <div className="container mx-auto px-4 py-8 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside className="space-y-4">
                        <Sidenav user={user} logout={logout}/>
                    </aside>

                    {/* Main Content */}
                    <div>{children}</div>
                </div>
            </div>

            <Footer/>
        </div>
    );
}
