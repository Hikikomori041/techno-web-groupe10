"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {Menu, User, LogOut, BarChart3} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {authService} from "@/lib/api/services/auth.service";
import {usePathname, useRouter} from "next/navigation";

export function DashboardHeader() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string; avatarUrl?: string } | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await authService.isAuthenticated();
                if (response.user) {
                    setIsAuthenticated(true);
                    setUser(response.user);
                    setIsAdmin(checkAdmin(response.user.roles))
                } else {
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                    setUser(null);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            }
        };
        verifyAuth();
    }, [isAuthenticated]);

    const checkAdmin = (roles: string[]) => {
        return roles.includes("admin");
    }

    const logout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null)
        setIsAdmin(false);
        router.push('/sign-in');
    }

    const navLinks = [
        {href: "/dashboard", label: "Statistiques", adminOnly: false},
        {href: "/dashboard/products", label: "Produits", adminOnly: false},
        {href: "/dashboard/categories", label: "Catégories", adminOnly: false},
        {href: "/dashboard/orders", label: "Commandes", adminOnly: false}, // ✅ Accessible aux modérateurs
        {href: "/dashboard/users", label: "Utilisateurs", adminOnly: true},
        {href: "/products", label: "Boutique", adminOnly: false},
    ];

    const visibleNavLinks = navLinks.filter(link => {
        if (link.adminOnly && !isAdmin) {
            return false;
        }
        return true;
    })

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* ---------- Logo ---------- */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img src={"/favicon.ico"} height={"80px"} width={"80px"} alt="Logo"/>
                    </Link>

                    {/* ---------- Navigation + Actions ---------- */}
                    <nav className="flex items-center gap-4">
                        {/* Navigation Links (Desktop Only) */}
                        <div className="hidden md:flex items-center gap-6 ml-8">
                            {visibleNavLinks.map(({href, label}) => {
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center justify-center text-sm font-medium transition-colors rounded-md px-3 py-1.5 ${
                                            isActive
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:text-accent hover:bg-muted"
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Menu (Mobile) */}
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5"/>
                                <span className="sr-only">Menu</span>
                            </Button>

                            {/* Auth Section */}
                            <div className="hidden md:flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 rounded-full">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4"/>}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user?.name || "User"}</span>
                                                <span className="text-xs text-muted-foreground">{user?.email}</span>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">Profile</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile/orders">My Orders</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={logout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4"/> Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
