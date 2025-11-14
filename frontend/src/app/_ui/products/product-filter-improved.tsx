"use client"

import {useState, useEffect} from "react"
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Checkbox} from "@/components/ui/checkbox"
import {Slider} from "@/components/ui/slider"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Search, X} from "lucide-react"
import {ProductFilters, Category} from "@/lib/api/definitions"
import {categoriesService} from "@/lib/api/services/categories.service"
import {useDebounce} from "@/hooks/useDebounce"
import {debugLog} from "@/lib/utils"

interface FilterPanelProps {
    onChange: (filters: ProductFilters) => void
    onClear?: () => void
}

// Spécifications communes pour les produits tech
const COMMON_SPECIFICATIONS = {
    "RAM": ["4GB", "8GB", "16GB", "32GB", "64GB"],
    "Stockage": ["128GB", "256GB", "512GB", "1TB", "2TB"],
    "Processeur": ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"],
    "Type": ["Laptop", "Desktop", "Smartphone", "Tablet", "Accessoire"],
}

export function FilterPanel({onChange, onClear}: FilterPanelProps) {
    const [searchInput, setSearchInput] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
    const [inStockOnly, setInStockOnly] = useState(false)
    const [selectedSpecs, setSelectedSpecs] = useState<{[key: string]: string[]}>({})
    const [expandedSpec, setExpandedSpec] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)

    // Debounce search input to avoid excessive API calls
    const debouncedSearch = useDebounce(searchInput, 500)

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesService.getAllCategories()
                debugLog("Fetched categories:", data)
                const activeCategories = data.filter(cat => cat.isActive && (cat._id || cat.id))
                debugLog("Active categories:", activeCategories.map(c => ({ _id: c._id, id: (c as any).id, name: c.name })))
                setCategories(activeCategories)
            } catch (error) {
                debugLog("Error fetching categories:", error)
            } finally {
                setLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    // Emit filter changes to parent
    useEffect(() => {
        const specsForApi: {[key: string]: string} = {}
        Object.entries(selectedSpecs).forEach(([key, values]) => {
            if (values.length > 0) {
                // Join multiple values with OR logic (if needed by backend)
                specsForApi[key] = values[0] // For now, use first value
            }
        })

        const filters: ProductFilters = {
            search: debouncedSearch || undefined,
            categoryId: categoryId && categoryId.trim() !== '' ? categoryId.trim() : undefined,
            minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
            maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined,
            inStockOnly: inStockOnly || undefined,
            specifications: Object.keys(specsForApi).length > 0 ? specsForApi : undefined,
        }

        // Remove undefined values
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== undefined)
        ) as ProductFilters

        debugLog("Filter changes:", { categoryId, cleanFilters })
        onChange(cleanFilters)
    }, [debouncedSearch, categoryId, priceRange, inStockOnly, selectedSpecs, onChange])

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

        const newSelectedSpecs = { ...selectedSpecs }
        
        if (newValues.length === 0) {
            delete newSelectedSpecs[specKey]
        } else {
            newSelectedSpecs[specKey] = newValues
        }

        setSelectedSpecs(newSelectedSpecs)
    }

    const clearAll = () => {
        setSearchInput("")
        setCategoryId("")
        setPriceRange([0, 5000])
        setInStockOnly(false)
        setSelectedSpecs({})
        setExpandedSpec(null)
        onClear?.()
    }

    const hasActiveFilters = searchInput || categoryId || priceRange[0] > 0 || priceRange[1] < 5000 || inStockOnly || Object.keys(selectedSpecs).length > 0

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filtres</CardTitle>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2">
                            <X className="h-4 w-4 mr-1" />
                            <span className="text-xs">Effacer</span>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search" className="font-semibold text-sm">
                        Rechercher
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Rechercher un produit..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {searchInput && (
                        <p className="text-xs text-muted-foreground">
                            Recherche en cours...
                        </p>
                    )}
                </div>

                {/* Category Dropdown */}
                <div className="space-y-2">
                    <Label htmlFor="categoryId" className="font-semibold text-sm">
                        Catégorie
                    </Label>
                    <Select
                        value={categoryId || "all"}
                        onValueChange={(value) => setCategoryId(value === "all" ? "" : value)}
                    >
                        <SelectTrigger id="categoryId" className="w-full">
                            <SelectValue placeholder={loadingCategories ? "Chargement..." : "Toutes les catégories"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les catégories</SelectItem>
                            {categories.length === 0 && !loadingCategories ? (
                                <SelectItem value="no-categories" disabled>
                                    Aucune catégorie disponible
                                </SelectItem>
                            ) : (
                                categories
                                    .filter(category => {
                                        const catId = category._id || (category as any).id;
                                        return catId && String(catId).trim() !== '';
                                    })
                                    .map((category) => {
                                        const catId = category._id || (category as any).id;
                                        return (
                                            <SelectItem 
                                                key={String(catId)} 
                                                value={String(catId)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        );
                                    })
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                    <Label className="font-semibold text-sm">Prix : ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                        value={priceRange}
                        onValueChange={(val) => setPriceRange(val as [number, number])}
                        min={0}
                        max={5000}
                        step={50}
                        className="w-full"
                    />
                </div>

                {/* Stock Availability */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="inStockOnly"
                        checked={inStockOnly}
                        onCheckedChange={(v) => setInStockOnly(v === true)}
                    />
                    <Label htmlFor="inStockOnly" className="text-sm font-normal cursor-pointer">
                        En stock uniquement
                    </Label>
                </div>

                {/* Specifications with Checkboxes */}
                <div className="space-y-3">
                    <Label className="font-semibold text-sm">Spécifications</Label>
                    <div className="space-y-2">
                        {Object.entries(COMMON_SPECIFICATIONS).map(([specKey, specValues]) => {
                            const isExpanded = expandedSpec === specKey
                            const selectedCount = selectedSpecs[specKey]?.length || 0
                            
                            return (
                                <div key={specKey} className="border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setExpandedSpec(isExpanded ? null : specKey)}
                                        className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            {specKey}
                                            {selectedCount > 0 && (
                                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                                                    {selectedCount}
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-muted-foreground text-lg">
                                            {isExpanded ? "−" : "+"}
                                        </span>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="px-3 pb-3 space-y-2 max-h-48 overflow-y-auto bg-muted/20">
                                            {specValues.map((value) => {
                                                const isChecked = selectedSpecs[specKey]?.includes(value) || false
                                                const checkboxId = `spec-${specKey}-${value}`.replace(/\s+/g, '-')
                                                
                                                return (
                                                    <div key={value} className="flex items-center space-x-2 py-1">
                                                        <Checkbox
                                                            id={checkboxId}
                                                            checked={isChecked}
                                                            onCheckedChange={() => toggleSpec(specKey, value)}
                                                        />
                                                        <Label 
                                                            htmlFor={checkboxId} 
                                                            className="text-sm font-normal cursor-pointer flex-1"
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

                {/* Clear All Button (larger) */}
                {hasActiveFilters && (
                    <Button variant="outline" className="w-full" onClick={clearAll}>
                        <X className="mr-2 h-4 w-4" />
                        Effacer tous les filtres
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

