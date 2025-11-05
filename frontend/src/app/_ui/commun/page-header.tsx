/**
 * PageHeader - En-tête de page réutilisable
 * Assure une cohérence visuelle sur toutes les pages
 */

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PageHeaderProps {
    title: string
    description?: string
    actions?: ReactNode
    className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 mb-8", className)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-base text-muted-foreground max-w-3xl">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
            <div className="h-px bg-gradient-to-r from-border via-border/50 to-transparent" />
        </div>
    )
}

