"use client";


import {Fragment, ReactNode, useEffect} from "react";
import {Footer} from "@/app/_ui/commun/footer";
import {DashboardHeader} from "@/app/_ui/commun/dashboard-header";
import {authService} from "@/lib/api/services/auth.service";
import {toast} from "sonner";
import {useRouter} from "next/navigation";


export default function DashboardLayout({children}: { children: ReactNode }){
    const router = useRouter()

    const checkAuthAndFetchProfile = async () => {
        try {
            const result = await authService.isAuthenticated();

            if (!result.authenticated || !result.user) {
                router.push('/sign-in');
                return;
            }

            const hasAccess = result.user.roles.includes('admin') || result.user.roles.includes('moderator');
            if (!hasAccess) {
                router.push('/sign-in');
                return;
            }

        } catch (err) {
            toast.error('Authentication failed');
            router.push('/sign-in');
        }
    };

    useEffect(() => {
        checkAuthAndFetchProfile();
    }, []);

    return (
        <div className="min-h-screen bg-muted/30">
            <DashboardHeader/>
            <Fragment>{children}</Fragment>

            <Footer/>
        </div>
    )
}