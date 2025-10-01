import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Laptop, Smartphone, Headphones, Monitor } from "lucide-react"

const categories = [
  {
    name: "Laptops",
    icon: Laptop,
    description: "High-performance laptops",
    href: "/category/laptops",
  },
  {
    name: "Smartphones",
    icon: Smartphone,
    description: "Latest mobile devices",
    href: "/category/smartphones",
  },
  {
    name: "Accessories",
    icon: Headphones,
    description: "Tech accessories & more",
    href: "/category/accessories",
  },
  {
    name: "Monitors",
    icon: Monitor,
    description: "Premium displays",
    href: "/category/monitors",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Shop by Category</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Browse our wide selection of tech products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.name} href={category.href}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-accent group cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
