import ProductCard from "@/app/_ui/products/product-card";
import {Product} from "@/lib/api/definitions";

export function ProductGrid({products}: { products: Product[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
                <ProductCard product={product} key={product._id}/>
            ))}
        </div>
    )
}
