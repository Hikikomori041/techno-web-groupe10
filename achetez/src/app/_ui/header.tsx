import Link from "next/link"
import { ShoppingCart, Search, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* ---------- Logo ---------- */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">T</span>
                        </div>
                        <span className="font-bold text-xl">TechStore</span>
                    </Link>

                    {/* ---------- Search Bar (Desktop Only) ---------- */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="pl-10 w-full"
                            />
                        </div>
                    </div>

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
                            {/* Search (Mobile) */}
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>

                            {/* Cart */}
                            <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                <span className="sr-only">Shopping cart</span>
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                  0
                </span>
                            </Button>

                            {/* Menu (Mobile) */}
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Menu</span>
                            </Button>

                            {/* Auth Buttons (Desktop Only) */}
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
