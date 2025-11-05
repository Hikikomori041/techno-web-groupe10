"use client"

import {useState, useCallback, useEffect} from "react"
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Checkbox} from "@/components/ui/checkbox"
import {Slider} from "@/components/ui/slider"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ProductFilters, Category} from "@/lib/api/definitions"
import {categoriesService} from "@/lib/api/services/categories.service"

interface FilterPanelProps {
    onChange: (filters: ProductFilters) => void
    onClear?: () => void
}

// Spécifications communes pour les produits tech
const COMMON_SPECIFICATIONS = {
    "RAM": ["4GB", "8GB", "16GB", "32GB", "64GB"],
    "Stockage": ["128GB", "256GB", "512GB", "1TB", "2TB"],
    "Processeur": ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"],
    "Écran": ["13 pouces", "14 pouces", "15 pouces", "16 pouces", "17 pouces"],
    "Carte graphique": ["Intel HD", "NVIDIA GTX", "NVIDIA RTX", "AMD Radeon"],
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
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [selectedSpecs, setSelectedSpecs] = useState<{[key: string]: string[]}>({})
    const [expandedSpec, setExpandedSpec] = useState<string | null>(null)

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesService.getAllCategories()
                setCategories(data)
            } catch (error) {
                console.error("Error fetching categories:", error)
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    // Update filter and trigger parent update
    const updateFilter = useCallback(
        (key: keyof ProductFilters, value: any) => {
            const updated = {...filters, [key]: value}
            setFilters(updated)
            onChange(updated)
        },
        [filters, onChange],
    )

    // Handle specification checkbox toggle
    const toggleSpec = (specKey: string, specValue: string) => {
        const currentValues = selectedSpecs[specKey] || []
        const isSelected = currentValues.includes(specValue)
        
        let newValues: string[]
        if (isSelected) {
            newValues = currentValues.filter(v => v !== specValue)
        } else {
            newValues = [...currentValues, specValue]
        }

        const newSelectedSpecs = {
            ...selectedSpecs,
            [specKey]: newValues
        }

        // Remove empty arrays
        if (newValues.length === 0) {
            delete newSelectedSpecs[specKey]
        }

        setSelectedSpecs(newSelectedSpecs)

        // Convert to specifications format for API
        // For now, we'll just use the first selected value for each spec
        // (You can modify this logic based on your backend's capabilities)
        const specsForApi: {[key: string]: string} = {}
        Object.entries(newSelectedSpecs).forEach(([key, values]) => {
            if (values.length > 0) {
                specsForApi[key] = values[0] // Using first value, can be modified for OR logic
            }
        })

        updateFilter("specifications", specsForApi)
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
        setSelectedSpecs({})
        onClear?.()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Category Dropdown */}
                <div className="space-y-2">
                    <Label htmlFor="categoryId" className="font-semibold">
                        Catégorie
                    </Label>
                    <Select
                        value={filters.categoryId || "all"}
                        onValueChange={(value) => updateFilter("categoryId", value === "all" ? "" : value)}
                    >
                        <SelectTrigger id="categoryId" className="w-full">
                            <SelectValue placeholder={loadingCategories ? "Chargement..." : "Toutes les catégories"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les catégories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search" className="font-semibold">
                        Rechercher
                    </Label>
                    <Input
                        id="search"
                        placeholder="Ex: laptop, smartphone..."
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                    <Label className="font-semibold">Fourchette de prix</Label>
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
                    <Label className="font-semibold">Disponibilité</Label>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="inStockOnly"
                            checked={filters.inStockOnly}
                            onCheckedChange={(v) => updateFilter("inStockOnly", v === true)}
                        />
                        <Label htmlFor="inStockOnly" className="text-sm font-normal cursor-pointer">
                            Produits en stock uniquement
                        </Label>
                    </div>
                </div>

                {/* Specifications with Checkboxes */}
                <div className="space-y-3">
                    <Label className="font-semibold">Spécifications</Label>
                    <div className="space-y-4">
                        {Object.entries(COMMON_SPECIFICATIONS).map(([specKey, specValues]) => {
                            const isExpanded = expandedSpec === specKey
                            const selectedCount = selectedSpecs[specKey]?.length || 0
                            
                            return (
                                <div key={specKey} className="border rounded-lg p-3">
                                    <button
                                        onClick={() => setExpandedSpec(isExpanded ? null : specKey)}
                                        className="w-full flex items-center justify-between text-sm font-medium"
                                    >
                                        <span>{specKey} {selectedCount > 0 && `(${selectedCount})`}</span>
                                        <span className="text-muted-foreground">
                                            {isExpanded ? "−" : "+"}
                                        </span>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                            {specValues.map((value) => {
                                                const isChecked = selectedSpecs[specKey]?.includes(value) || false
                                                const checkboxId = `spec-${specKey}-${value}`
                                                
                                                return (
                                                    <div key={value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={checkboxId}
                                                            checked={isChecked}
                                                            onCheckedChange={() => toggleSpec(specKey, value)}
                                                        />
                                                        <Label 
                                                            htmlFor={checkboxId} 
                                                            className="text-sm font-normal cursor-pointer"
                                                        >
                                                            {value}
                                                        </Label>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Clear All Button */}
                <Button variant="outline" className="w-full bg-transparent" onClick={clearAll}>
                    Effacer tous les filtres
                </Button>
            </CardContent>
        </Card>
    )
}

