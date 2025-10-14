import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {ShoppingCart, Star} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function ProductCard({ product }: any) {
    return (
        <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-card overflow-hidden">
                <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                <h3 className="font-semibold text-base mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent"/>
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>
                <p className="text-xl font-bold text-accent">${product.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2"/>
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    )
}