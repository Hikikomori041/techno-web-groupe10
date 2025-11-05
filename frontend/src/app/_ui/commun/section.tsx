/**
 * Section - Composant de section réutilisable
 * Pour organiser le contenu des pages de manière cohérente
 */

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface SectionProps {
    children: ReactNode
    title?: string
    description?: string
    className?: string
    id?: string
}

export function Section({ children, title, description, className, id }: SectionProps) {
    return (
        <section id={id} className={cn("py-12 md:py-16", className)}>
            {(title || description) && (
                <div className="text-center mb-10 md:mb-12 space-y-3">
                    {title && (
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </section>
    )
}

