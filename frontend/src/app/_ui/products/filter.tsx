"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function ProductFilters() {
    const [priceRange, setPriceRange] = useState([0, 5000])

    const categories = [
        { id: "laptops", label: "Laptops", count: 24 },
        { id: "smartphones", label: "Smartphones", count: 32 },
        { id: "accessories", label: "Accessories", count: 45 },
        { id: "monitors", label: "Monitors", count: 18 },
    ]

    const brands = [
        { id: "apple", label: "Apple", count: 15 },
        { id: "samsung", label: "Samsung", count: 22 },
        { id: "dell", label: "Dell", count: 18 },
        { id: "hp", label: "HP", count: 12 },
        { id: "sony", label: "Sony", count: 8 },
    ]

    const ratings = [
        { id: "4plus", label: "4★ & above", value: 4 },
        { id: "3plus", label: "3★ & above", value: 3 },
        { id: "2plus", label: "2★ & above", value: 2 },
    ]

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold mb-3">Categories</h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox id={category.id} />
                                    <Label
                                        htmlFor={category.id}
                                        className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                                    >
                                        <span>{category.label}</span>
                                        <span className="text-muted-foreground">({category.count})</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="font-semibold mb-3">Price Range</h3>
                        <div className="space-y-4">
                            <Slider value={priceRange} onValueChange={setPriceRange} max={5000} step={100} className="w-full" />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">${priceRange[0]}</span>
                                <span className="text-muted-foreground">${priceRange[1]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Brands */}
                    <div>
                        <h3 className="font-semibold mb-3">Brands</h3>
                        <div className="space-y-2">
                            {brands.map((brand) => (
                                <div key={brand.id} className="flex items-center space-x-2">
                                    <Checkbox id={brand.id} />
                                    <Label
                                        htmlFor={brand.id}
                                        className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                                    >
                                        <span>{brand.label}</span>
                                        <span className="text-muted-foreground">({brand.count})</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ratings */}
                    <div>
                        <h3 className="font-semibold mb-3">Customer Rating</h3>
                        <div className="space-y-2">
                            {ratings.map((rating) => (
                                <div key={rating.id} className="flex items-center space-x-2">
                                    <Checkbox id={rating.id} />
                                    <Label htmlFor={rating.id} className="text-sm font-normal cursor-pointer">
                                        {rating.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <Button variant="outline" className="w-full bg-transparent">
                        Clear All Filters
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
