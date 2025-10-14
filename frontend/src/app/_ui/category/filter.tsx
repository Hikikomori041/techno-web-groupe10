"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface CategoryFiltersProps {
    category: string
}

const categorySpecificFilters = {
    laptops: {
        brands: [
            { id: "apple", label: "Apple", count: 8 },
            { id: "dell", label: "Dell", count: 12 },
            { id: "hp", label: "HP", count: 10 },
            { id: "lenovo", label: "Lenovo", count: 9 },
            { id: "asus", label: "ASUS", count: 9 },
        ],
        specs: [
            { id: "intel-i7", label: "Intel Core i7" },
            { id: "intel-i9", label: "Intel Core i9" },
            { id: "amd-ryzen", label: "AMD Ryzen" },
            { id: "16gb-ram", label: "16GB RAM" },
            { id: "32gb-ram", label: "32GB RAM" },
            { id: "ssd-512", label: "512GB SSD" },
            { id: "ssd-1tb", label: "1TB SSD" },
        ],
    },
    smartphones: {
        brands: [
            { id: "apple", label: "Apple", count: 15 },
            { id: "samsung", label: "Samsung", count: 18 },
            { id: "google", label: "Google", count: 8 },
            { id: "oneplus", label: "OnePlus", count: 12 },
            { id: "xiaomi", label: "Xiaomi", count: 11 },
        ],
        specs: [
            { id: "5g", label: "5G Support" },
            { id: "128gb", label: "128GB Storage" },
            { id: "256gb", label: "256GB Storage" },
            { id: "512gb", label: "512GB Storage" },
            { id: "camera-48mp", label: "48MP+ Camera" },
            { id: "fast-charge", label: "Fast Charging" },
        ],
    },
    accessories: {
        brands: [
            { id: "logitech", label: "Logitech", count: 22 },
            { id: "razer", label: "Razer", count: 15 },
            { id: "sony", label: "Sony", count: 18 },
            { id: "bose", label: "Bose", count: 12 },
            { id: "anker", label: "Anker", count: 25 },
        ],
        specs: [
            { id: "wireless", label: "Wireless" },
            { id: "bluetooth", label: "Bluetooth" },
            { id: "usb-c", label: "USB-C" },
            { id: "noise-cancel", label: "Noise Cancelling" },
            { id: "rgb", label: "RGB Lighting" },
        ],
    },
    monitors: {
        brands: [
            { id: "dell", label: "Dell", count: 10 },
            { id: "lg", label: "LG", count: 8 },
            { id: "samsung", label: "Samsung", count: 7 },
            { id: "asus", label: "ASUS", count: 6 },
            { id: "benq", label: "BenQ", count: 5 },
        ],
        specs: [
            { id: "4k", label: "4K Resolution" },
            { id: "144hz", label: "144Hz+" },
            { id: "27inch", label: "27 inch" },
            { id: "32inch", label: "32 inch" },
            { id: "curved", label: "Curved Display" },
            { id: "hdr", label: "HDR Support" },
        ],
    },
}

export function CategoryFilters({ category }: CategoryFiltersProps) {
    const [priceRange, setPriceRange] = useState([0, 5000])
    const filters = categorySpecificFilters[category as keyof typeof categorySpecificFilters]

    if (!filters) return null

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
                            {filters.brands.map((brand) => (
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

                    {/* Category-specific Specifications */}
                    <div>
                        <h3 className="font-semibold mb-3">Specifications</h3>
                        <div className="space-y-2">
                            {filters.specs.map((spec) => (
                                <div key={spec.id} className="flex items-center space-x-2">
                                    <Checkbox id={spec.id} />
                                    <Label htmlFor={spec.id} className="text-sm font-normal cursor-pointer">
                                        {spec.label}
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
