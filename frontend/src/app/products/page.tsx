"use client";

import {useEffect, useState, useRef, useCallback} from "react";
import {Footer} from "@/app/_ui/commun/footer"
import {ProductGrid} from "@/app/_ui/products/product-grid"
import {FilterPanel} from "@/app/_ui/products/product-filter"
import {Header} from "@/app/_ui/commun/header";
import {productsService} from "@/lib/api/services/products.service";
import {Product, ProductFilters} from "@/lib/api/definitions";

export default function Page() {
    const [filters, setFilters] = useState<ProductFilters>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchProducts = useCallback(
        async (reset = false) => {
            if (loading || (!hasMore && !reset)) return;
            setLoading(true);

            try {
                const nextPage = reset ? 1 : page;
                const data = await productsService.filterProducts(nextPage, 12, filters);
                setProducts((prev) => (reset ? data.products : [...prev, ...data.products]));
                setHasMore(data.hasMore);
                setPage(nextPage + 1);
            } finally {
                setLoading(false);
            }
        },
        [filters, page, hasMore, loading]
    );

    // Fetch on filters change
    useEffect(() => {
        fetchProducts(true);
    }, [filters]);

    // Infinite scroll
    useEffect((): any => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchProducts();
                }
            },
            {threshold: 0.5}
        );
        const target = observerTarget.current;
        if (target) observer.observe(target);
        return () => target && observer.unobserve(target);
    }, [fetchProducts, hasMore, loading]);

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
                            <FilterPanel onChange={setFilters} onClear={() => setFilters({})}/>
                        </aside>

                        {/* Products Grid */}
                        <div className="flex-1">
                            <div className="mb-6 flex items-center justify-between">
                            </div>
                            <ProductGrid products={products}/>
                            {loading && <p className="text-center mt-6 text-muted-foreground">Loading...</p>}
                            {hasMore && <div ref={observerTarget} className="h-12"></div>}
                        </div>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    )
}
