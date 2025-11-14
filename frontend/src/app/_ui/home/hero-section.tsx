import {Button} from "@/components/ui/button"
import {ArrowRight} from "lucide-react"
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative bg-gradient-to-br from-primary via-primary to-accent/20 text-primary-foreground">
            <div className="container mx-auto px-4 lg:px-8 py-20 md:py-32">
                <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Discover the Latest in Tech</h1>
                    <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 leading-relaxed">
                        Shop premium laptops, smartphones, and accessories from top brands. Quality products at
                        competitive prices.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" variant="secondary" className="group">
                            <Link href={"/products"} className={"w-full flex items-center justify-between"}>
                                Shop Now
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Decorative element */}
            <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/modern-tech-devices-abstract-illustration.jpg" alt=""
                     className="w-full h-full object-contain"/>
            </div>
        </section>
    )
}
