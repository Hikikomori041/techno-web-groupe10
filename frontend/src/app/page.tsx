import {HeroSection} from "@/app/_ui/home/hero-section"
import {CategoryGrid} from "@/app/_ui/home/category-grid"
import {FeaturedProducts} from "@/app/_ui/home/featured-products"
import {Footer} from "@/app/_ui/commun/footer"
import {Header} from "@/app/_ui/commun/header";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                <Header/>
                <HeroSection/>
                <CategoryGrid/>
                <FeaturedProducts/>
            </main>
            <Footer/>
        </div>
    )
}