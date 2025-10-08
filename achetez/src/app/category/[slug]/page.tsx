"use client"

import {useState} from "react"
import {useParams} from "next/navigation"
import {Header} from "@/app/_ui/header"
import {Footer} from "@/app/_ui/footer"
import {ProductGrid} from "@/app/_ui/products/grid"
import {CategoryFilters} from "@/app/_ui/category/filter"
import {Button} from "@/components/ui/button"
import {ChevronLeft, ChevronRight, Laptop, Smartphone, Headphones, Monitor} from "lucide-react"
import {products} from "@/lib/db";

const categoryData = {
    laptops: {
        name: "Laptops",
        icon: Laptop,
        description:
            "Discover our collection of high-performance laptops from leading brands. Whether you need a powerful workstation, a lightweight ultrabook, or a gaming laptop, we have the perfect device for you.",
        totalProducts: 48,
        image: "/modern-laptops.png",
    },
    smartphones: {
        name: "Smartphones",
        icon: Smartphone,
        description:
            "Explore the latest smartphones with cutting-edge technology, stunning displays, and powerful cameras. Find the perfect device that fits your lifestyle and budget.",
        totalProducts: 64,
        image: "/modern-smartphones-collection.jpg",
    },
    accessories: {
        name: "Accessories",
        icon: Headphones,
        description:
            "Complete your tech setup with our wide range of accessories including headphones, keyboards, mice, cases, chargers, and more. Quality accessories to enhance your digital experience.",
        totalProducts: 92,
        image: "/tech-accessories.png",
    },
    monitors: {
        name: "Monitors",
        icon: Monitor,
        description:
            "Upgrade your viewing experience with our premium monitors. From professional-grade displays to high-refresh gaming monitors, find the perfect screen for your needs.",
        totalProducts: 36,
        image: "/modern-computer-monitors.jpg",
    },
}

export default function CategoryPage() {
    const params = useParams()
    const slug = params.slug as string
    const category = categoryData[slug as keyof typeof categoryData]
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(category?.totalProducts / 20) || 1

    if (!category) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
                        <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
                    </div>
                </main>
                <Footer/>
            </div>
        )
    }

    const Icon = category.icon

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1 bg-background">
                {/* Category Hero Section */}
                <div className="bg-card border-b">
                    <div className="container mx-auto px-4 lg:px-8 py-12">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-shrink-0">
                                <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                                    <Icon className="h-10 w-10 text-accent"/>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">{category.name}</h1>
                                <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">{category.description}</p>
                                <p className="text-sm text-muted-foreground mt-4">{category.totalProducts} products
                                    available</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filter Sidebar */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <CategoryFilters category={slug}/>
                        </aside>

                        {/* Products Grid */}
                        <div className="flex-1">
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, category.totalProducts)} of{" "}
                                    {category.totalProducts} products
                                </p>
                            </div>

                            <ProductGrid products={products}/>

                            {/* Pagination */}
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4"/>
                                </Button>

                                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={currentPage === i + 1 ? "bg-accent text-accent-foreground" : ""}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    )
}
