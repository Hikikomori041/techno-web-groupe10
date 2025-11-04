"use client"

import {useState, useCallback} from "react"
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Checkbox} from "@/components/ui/checkbox"
import {Slider} from "@/components/ui/slider"
import {X} from "lucide-react"
import {ProductFilters} from "@/lib/api/definitions";

interface FilterPanelProps {
    onChange: (filters: ProductFilters) => void
    onClear?: () => void
}

export function FilterPanel({onChange, onClear}: FilterPanelProps) {
    const [filters, setFilters] = useState<ProductFilters>({
        categoryId: "",
        search: "",
        minPrice: 0,
        maxPrice: 5000,
        inStockOnly: false,
        specifications: {},
    })

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])

    // Update filter and trigger parent update
    const updateFilter = useCallback(
        (key: keyof ProductFilters, value: any) => {
            const updated = {...filters, [key]: value}
            setFilters(updated)
            onChange(updated)
        },
        [filters, onChange],
    )

    const updateSpecs = (index: number, field: "key" | "value", value: string) => {
        const newSpecs = [...specs]
        newSpecs[index][field] = value
        setSpecs(newSpecs)
        const obj = Object.fromEntries(newSpecs.filter((s) => s.key && s.value).map((s) => [s.key, s.value]))
        updateFilter("specifications", obj)
    }

    const addSpec = () => setSpecs([...specs, {key: "", value: ""}])
    const removeSpec = (i: number) => {
        const newSpecs = specs.filter((_, idx) => idx !== i)
        setSpecs(newSpecs)
        const obj = Object.fromEntries(newSpecs.filter((s) => s.key && s.value).map((s) => [s.key, s.value]))
        updateFilter("specifications", obj)
    }

    const clearAll = () => {
        setFilters({
            categoryId: "",
            search: "",
            minPrice: 0,
            maxPrice: 5000,
            inStockOnly: false,
            specifications: {},
        })
        setPriceRange([0, 5000])
        setSpecs([])
        onClear?.()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Category ID */}
                <div className="space-y-2">
                    <Label htmlFor="categoryId" className="font-semibold">
                        Category ID
                    </Label>
                    <Input
                        id="categoryId"
                        placeholder="e.g., 507f1f77bcf86cd799439011"
                        value={filters.categoryId}
                        onChange={(e) => updateFilter("categoryId", e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search" className="font-semibold">
                        Search Products
                    </Label>
                    <Input
                        id="search"
                        placeholder="e.g., laptop, smartphone..."
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                    <Label className="font-semibold">Price Range</Label>
                    <div className="space-y-4 pt-2">
                        <Slider
                            value={priceRange}
                            onValueChange={(val) => {
                                setPriceRange(val as [number, number])
                                updateFilter("minPrice", val[0])
                                updateFilter("maxPrice", val[1])
                            }}
                            min={0}
                            max={5000}
                            step={50}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">${priceRange[0]}</span>
                            <span className="text-muted-foreground">${priceRange[1]}</span>
                        </div>
                    </div>
                </div>

                {/* Stock Availability */}
                <div className="space-y-3">
                    <Label className="font-semibold">Availability</Label>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="inStockOnly"
                            checked={filters.inStockOnly}
                            onCheckedChange={(v) => updateFilter("inStockOnly", v === true)}
                        />
                        <Label htmlFor="inStockOnly" className="text-sm font-normal cursor-pointer">
                            Only show products in stock
                        </Label>
                    </div>
                </div>

                {/* Specifications */}
                <div className="space-y-3">
                    <Label className="font-semibold">Specifications</Label>
                    <p className="text-xs text-muted-foreground">Add custom key-value pairs to filter by
                        specifications</p>
                    <div className="space-y-3">
                        {specs.map((spec, i) => (
                            <div key={i} className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder="Key (e.g., RAM)"
                                        value={spec.key}
                                        onChange={(e) => updateSpecs(i, "key", e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder="Value (e.g., 16GB)"
                                        value={spec.value}
                                        onChange={(e) => updateSpecs(i, "value", e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeSpec(i)}
                                    className="shrink-0"
                                    aria-label="Remove specification"
                                >
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button onClick={addSpec} size="sm" variant="secondary" className="w-full">
                        + Add Specification
                    </Button>
                </div>

                {/* Clear All Button */}
                <Button variant="outline" className="w-full bg-transparent" onClick={clearAll}>
                    Clear All Filters
                </Button>
            </CardContent>
        </Card>
    )
}