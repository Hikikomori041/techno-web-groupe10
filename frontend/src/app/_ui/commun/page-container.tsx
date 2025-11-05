/**
 * PageContainer - Composant de conteneur réutilisable pour toutes les pages
 * Assure une structure et un espacement cohérents
 */

import { cn } from "@/lib/utils"

interface PageContainerProps {
    children: React.ReactNode
    className?: string
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

const maxWidthClasses = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-[1400px]",
    "2xl": "max-w-[1600px]",
    full: "max-w-full"
}

export function PageContainer({ children, className, maxWidth = "xl" }: PageContainerProps) {
    return (
        <div className={cn(
            "container mx-auto px-4 sm:px-6 lg:px-8 py-8",
            maxWidthClasses[maxWidth],
            className
        )}>
            {children}
        </div>
    )
}

