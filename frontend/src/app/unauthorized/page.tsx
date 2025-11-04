"use client"

import Link from "next/link"
import { ShieldAlert, Home, LogIn, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-primary mb-4">403</h1>
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <ShieldAlert className="w-10 h-10 text-muted-foreground" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Access Denied</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Sorry, you don't have permission to access this page. Please sign in or contact support if you believe this
                        is an error.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link href="/sign-in" className="block">
                        <Button className="w-full" size="lg">
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/" className="block">
                        <Button variant="outline" className="w-full bg-transparent" size="lg">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full" size="lg" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>

                <div className="mt-12 p-6 bg-card border border-border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-card-foreground mb-4">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        If you think you should have access to this page, please try:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Signing in with the correct account</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Checking if your account has the necessary permissions</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Contacting our support team for assistance</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
