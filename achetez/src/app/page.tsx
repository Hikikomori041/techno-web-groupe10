import { Header } from "@/app/_ui/header"
import { HeroSection } from "@/app/_ui/home/hero-section"
import { CategoryGrid } from "@/app/_ui/home/category-grid"
import { FeaturedProducts } from "@/app/_ui/home/featured-products"
import { Footer } from "@/app/_ui/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  )
}