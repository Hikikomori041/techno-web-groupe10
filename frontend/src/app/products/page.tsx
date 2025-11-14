"use client";

import {useEffect, useState, useRef} from "react";
import {Footer} from "@/app/_ui/commun/footer"
import {ProductGrid} from "@/app/_ui/products/product-grid"
import {FilterPanel} from "@/app/_ui/products/product-filter-improved"
import {Header} from "@/app/_ui/commun/header";
import {Button} from "@/components/ui/button";
import {productsService} from "@/lib/api/services/products.service";
import {Product, ProductFilters} from "@/lib/api/definitions";
import { debugLog } from "@/lib/utils";

export default function Page() {
    const [filters, setFilters] = useState<ProductFilters>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Fetch products function
    const fetchProducts = async (reset: boolean = false) => {
        if (loading || (!hasMore && !reset)) return;
        setLoading(true);

        try {
            const nextPage = reset ? 1 : page;
            debugLog("Fetching products", { page: nextPage, filters });
            
            const data = await productsService.filterProducts(nextPage, 12, filters);
            
            setProducts((prev) => {
                if (reset) {
                    return data.products;
                }
                // Deduplicate products by _id to prevent duplicate keys
                const existingIds = new Set(prev.map(p => p._id));
                const newProducts = data.products.filter(p => p._id && !existingIds.has(p._id));
                return [...prev, ...newProducts];
            });
            setHasMore(data.hasMore);
            setPage(nextPage + 1);
            
            debugLog("Products loaded", {
                count: data.products.length,
                total: data.total,
                hasMore: data.hasMore
            });
        } catch (error: unknown) {
            debugLog('Error fetching products:', error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    // Fetch on filters change - reset pagination
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Infinite scroll
    useEffect(() => {
        if (initialLoad) return; // Skip on initial load

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchProducts(false);
                }
            },
            {threshold: 0.5}
        );
        
        const target = observerTarget.current;
        if (target) observer.observe(target);
        
        return () => {
            if (target) observer.unobserve(target);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loading, initialLoad]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Tous les produits</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">Parcourez notre collection complète de produits technologiques</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Filter Sidebar */}
                        <aside className="w-full lg:w-64 flex-shrink-0">
                            <div className="sticky top-20">
                                <FilterPanel onChange={setFilters} onClear={() => setFilters({})}/>
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <div className="flex-1 min-w-0">
                            <div className="mb-4 sm:mb-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {loading && initialLoad ? (
                                        "Chargement des produits..."
                                    ) : (
                                        `${products.length} produit${products.length !== 1 ? 's' : ''} trouvé${products.length !== 1 ? 's' : ''}`
                                    )}
                                </p>
                            </div>
                            
                            {products.length === 0 && !loading ? (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Essayez de modifier vos filtres ou votre recherche
                                    </p>
                                    <Button variant="outline" onClick={() => setFilters({})}>
                                        Réinitialiser les filtres
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <ProductGrid products={products}/>
                                    {loading && <p className="text-center mt-6 text-sm text-muted-foreground">Chargement...</p>}
                                    {hasMore && !loading && <div ref={observerTarget} className="h-12"></div>}
                                    {!hasMore && products.length > 0 && (
                                        <p className="text-center mt-6 text-sm text-muted-foreground">
                                            ✓ Tous les produits ont été chargés
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    )
}
