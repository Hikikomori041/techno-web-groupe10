"use client"

import { useState } from "react"
import { Footer } from "@/app/_ui/footer"
import { ProductGrid } from "@/app/_ui/products/grid"
import { ProductFilters } from "@/app/_ui/products/filter"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {Header} from "@/app/_ui/header";
import {products} from "@/lib/db";

export default function ProductsPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = 5

    return (
        <div className="min-h-screen flex flex-col">
<Header/>
            <main className="flex-1 bg-background">
                <div className="container mx-auto px-4 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">All Products</h1>
                        <p className="text-muted-foreground">Browse our complete collection of tech products</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filter Sidebar */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <ProductFilters />
                        </aside>

                        {/* Products Grid */}
                        <div className="flex-1">
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, 100)} of 100 products
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
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {[...Array(totalPages)].map((_, i) => (
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
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
