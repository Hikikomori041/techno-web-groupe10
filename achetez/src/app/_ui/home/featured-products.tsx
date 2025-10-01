import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

const products = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    price: 2499,
    rating: 4.8,
    reviews: 234,
    image: "/macbook-pro-laptop.png",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    price: 999,
    rating: 4.9,
    reviews: 567,
    image: "/modern-smartphone.png",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    price: 399,
    rating: 4.7,
    reviews: 892,
    image: "/wireless-headphones.png",
  },
  {
    id: 4,
    name: 'Dell UltraSharp 27"',
    price: 549,
    rating: 4.6,
    reviews: 156,
    image: "/computer-monitor-display.png",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Featured Products</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Check out our most popular items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-card overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews})</span>
                </div>
                <p className="text-2xl font-bold text-accent">${product.price}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" variant="default">
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
