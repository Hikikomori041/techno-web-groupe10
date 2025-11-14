import ProductCard from "@/app/_ui/products/product-card";
import {Product} from "@/lib/api/definitions";

export function ProductGrid({products}: { products: Product[] }) {
    // Deduplicate products by _id to ensure unique keys
    const seenIds = new Set<string>();
    const uniqueProducts: Product[] = [];
    
    for (const product of products) {
        const productId = product._id ? String(product._id) : null;
        if (productId && !seenIds.has(productId)) {
            seenIds.add(productId);
            uniqueProducts.push(product);
        } else if (!productId) {
            // If no _id, include it anyway (shouldn't happen, but handle gracefully)
            uniqueProducts.push(product);
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueProducts.map((product, index) => (
                <ProductCard 
                    product={product} 
                    key={product._id ? String(product._id) : `product-${index}`}
                />
            ))}
        </div>
    )
}
