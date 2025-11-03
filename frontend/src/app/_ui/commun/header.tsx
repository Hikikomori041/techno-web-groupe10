"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {ShoppingCart, Menu, User, LogOut} from "lucide-react";
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
import {useCart} from "@/context/cart.context";
import {useRouter} from "next/navigation";


export function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string; avatarUrl?: string } | null>(null);
    const {cartCount} = useCart();
    const router = useRouter();


    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await authService.isAuthenticated();
                if (response.user) {
                    setIsAuthenticated(true);
                    setUser(response.user);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            }
        };
        verifyAuth();
    }, []);

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
                            <Link
                                href="/products"
                                className="text-sm font-medium hover:text-accent transition-colors"
                            >
                                Products
                            </Link>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Cart */}
                            <Button variant="ghost" size="icon" className="relative"
                                    onClick={() => router.push('/cart')}
                                    style={{cursor: "pointer"}}>
                                <ShoppingCart className="h-5 w-5"/>
                                <span className="sr-only">Shopping cart</span>
                                <span
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                                    {cartCount}
                                </span>
                            </Button>

                            {/* Menu (Mobile) */}
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5"/>
                                <span className="sr-only">Menu</span>
                            </Button>

                            {/* Auth Section */}
                            <div className="hidden md:flex items-center gap-2">
                                {!isAuthenticated ? (
                                    <>
                                        <Button variant="ghost" asChild>
                                            <Link href="/sign-in">Sign In</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href="/sign-up">Sign Up</Link>
                                        </Button>
                                    </>
                                ) : (
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
                                                onClick={() => {
                                                    // Optional: call logout function
                                                    authService.logout();
                                                    setIsAuthenticated(false);
                                                }}
                                            >
                                                <LogOut className="mr-2 h-4 w-4"/> Logout
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}


/*
import Link from "next/link"
import { ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/!* ---------- Logo ---------- *!/}
                    <Link href="/" className="flex items-center space-x-2">
                        <img src={"/favicon.ico"} height={"80px"} width={"80px"}/>
                    </Link>

                    {/!* ---------- Navigation + Actions ---------- *!/}
                    <nav className="flex items-center gap-4">

                        {/!* Navigation Links (Desktop Only) *!/}
                        <div className="hidden md:flex items-center gap-6 ml-8">
                            <Link
                                href="/products"
                                className="text-sm font-medium hover:text-accent transition-colors"
                            >
                                Products
                            </Link>
                        </div>

                        {/!* Action Buttons *!/}
                        <div className="flex items-center gap-2">
                            {/!* Cart *!/}
                            <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                <span className="sr-only">Shopping cart</span>
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                  0
                </span>
                            </Button>

                            {/!* Menu (Mobile) *!/}
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Menu</span>
                            </Button>

                            {/!* Auth Buttons (Desktop Only) *!/}
                            <div className="hidden md:flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/sign-up">Sign Up</Link>
                                </Button>
                            </div>
                        </div>
                    </nav>

                </div>
            </div>
        </header>
    )
}
*/
