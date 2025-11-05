/**
 * EmptyState - État vide cohérent pour toutes les pages
 */

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center",
            className
        )}>
            {icon && (
                <div className="mb-4 text-muted-foreground opacity-50">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-foreground mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} variant="default">
                    {action.label}
                </Button>
            )}
        </div>
    )
}

