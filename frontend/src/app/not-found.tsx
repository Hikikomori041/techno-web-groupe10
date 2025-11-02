import Link from "next/link"
import {Search, Home, ShoppingBag} from "lucide-react"
import {Button} from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <Search className="w-10 h-10 text-muted-foreground"/>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Sorry, the page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link href="/" className="block">
                        <Button className="w-full" size="lg">
                            <Home className="w-4 h-4 mr-2"/>
                            Back to Home
                        </Button>
                    </Link>
                    <Link href="/products" className="block">
                        <Button variant="outline" className="w-full bg-transparent" size="lg">
                            <ShoppingBag className="w-4 h-4 mr-2"/>
                            Browse Products
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 p-6 bg-card border border-border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-card-foreground mb-4">Quick Links:</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <Link href="/" className="text-primary hover:underline">
                            Home
                        </Link>
                        <Link href="/products" className="text-primary hover:underline">
                            Products
                        </Link>
                        <Link href="/cart" className="text-primary hover:underline">
                            Cart
                        </Link>
                        <Link href="/profile" className="text-primary hover:underline">
                            Profile
                        </Link>
                        <Link href="/sign-in" className="text-primary hover:underline">
                            Sign In
                        </Link>
                        <Link href="/sign-up" className="text-primary hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
