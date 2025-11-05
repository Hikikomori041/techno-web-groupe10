"use client"

import {useEffect, useState, useMemo} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Plus, Pencil, Trash2, Package} from "lucide-react"
import type {Category, CreateProductDto, Product} from "@/lib/api/definitions"
import {categoriesService} from "@/lib/api/services/categories.service"
import {productsService} from "@/lib/api/services/products.service"
import {authService} from "@/lib/api/services/auth.service"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import {ProductForm} from "@/app/_ui/products/product.form";


export default function ProductManagementPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[] | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState<Partial<CreateProductDto>>({})

    const fetchProducts = async () => {
        try {
            const check = await authService.isAuthenticated()
            if (!check.authenticated || !check.user) {
                router.push('/sign-in')
                return
            }

            if (!check.user.roles.includes("admin") && !check.user.roles.includes("moderator")) {
                router.push('/unauthorized')
                return
            }

            const fetchedProducts = await productsService.getAllProductsDashboard()
            console.log('📦 Fetched products:', fetchedProducts.map(p => ({
                nom: p.nom,
                id_categorie: p.id_categorie,
                categoryId: (p as any).categoryId
            })))
            
            setProducts(fetchedProducts)
            
            const fetchedCategories = await categoriesService.getAllCategories()
            console.log('📂 Fetched categories:', fetchedCategories.map(c => ({ _id: c._id, name: c.name })))
            setCategories(fetchedCategories)
        } catch (error) {
            console.error("Error fetching data:", error)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await fetchProducts()
        }
        loadData()
    }, [])

    // Create a category map for efficient lookup
    const categoryMap = useMemo(() => {
        if (!categories) return new Map()
        return new Map(categories.map(cat => [cat._id, cat.name]))
    }, [categories])

    const getCategoryName = (categoryId: string) => {
        if (!categoryId) {
            console.log('⚠️ No categoryId provided')
            return "No Category"
        }
        const name = categoryMap.get(categoryId)
        if (!name) {
            console.log('⚠️ Category not found in map:', { 
                categoryId, 
                availableCategories: Array.from(categoryMap.keys()) 
            })
        }
        return name || "Unknown"
    }

    const handleAdd = () => {
        // Redirect to dedicated add page
        router.push("/dashboard/products/add")
    }

    const handleEdit = (product: Product) => {
        // Redirect to dedicated edit page
        router.push(`/dashboard/products/edit/${product._id}`)
    }

    const handleDelete = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!selectedProduct) return

        try {
            await productsService.deleteProductById(selectedProduct._id)
            toast.info("Product deleted successfully")
            setIsDeleteDialogOpen(false)
            setSelectedProduct(null)
            await fetchProducts() // Refresh the list
        } catch (err) {
            console.error("Error deleting product:", err)
            toast.error("Failed to delete product")
        }
    }

    const saveAdd = async () => {
        if (editForm.nom && editForm.prix && editForm.categoryId) {
            try {
                const newProduct: CreateProductDto = {
                    nom: editForm.nom,
                    prix: editForm.prix,
                    description: editForm.description,
                    images: editForm.images || [],
                    specifications: editForm.specifications || [],
                    categoryId: editForm.categoryId,
                    quantite_en_stock: editForm.quantite_en_stock || 0,
                }
                await productsService.createProduct(newProduct)
                await fetchProducts()
                toast.success("Product added successfully")
                setIsAddDialogOpen(false)
                setEditForm({})
            } catch (err) {
                console.error("Error adding product:", err)
                toast.error("Failed to add product")
            }
        } else {
            toast.error("Please fill in all required fields")
        }
    }

    const saveEdit = async () => {
        if (!selectedProduct || !editForm) return

        try {
            // Clean specifications by removing _id fields
            const cleanSpecifications = (editForm.specifications || selectedProduct.specifications || []).map(
                ({key, value}) => ({key, value})
            )

            const updatedProduct: CreateProductDto = {
                nom: editForm.nom || selectedProduct.nom,
                prix: editForm.prix || selectedProduct.prix,
                description: editForm.description || selectedProduct.description,
                images: editForm.images || selectedProduct.images || [],
                specifications: cleanSpecifications,
                categoryId: editForm.categoryId || selectedProduct.id_categorie,
                quantite_en_stock: editForm.quantite_en_stock ?? selectedProduct.quantite_en_stock,
            }
            await productsService.updateProduct(selectedProduct._id, updatedProduct)
            await fetchProducts()
            toast.success("Product updated successfully")
            setIsEditDialogOpen(false)
            setSelectedProduct(null)
            setEditForm({})
        } catch (err) {
            console.error("Error updating product:", err)
            toast.error("Failed to update product")
        }
    }

    const getStockStatus = (stock: number) => {
        if (stock === 0) return {label: "Out of Stock", variant: "destructive" as const}
        if (stock < 20) return {label: "Low Stock", variant: "secondary" as const}
        return {label: "In Stock", variant: "default" as const}
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Product Management</h1>
                    <p className="text-muted-foreground">Manage your product inventory</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Products Overview</CardTitle>
                                <CardDescription>View, edit, and manage all products</CardDescription>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    onClick={handleAdd}>
                                <Plus className="h-4 w-4 mr-2"/>
                                Add Product
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2"/>
                                                <p className="text-muted-foreground">No products found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.map((product) => {
                                            const stockStatus = getStockStatus(product.quantite_en_stock)
                                            return (
                                                <TableRow key={product._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-medium">{product.nom}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getCategoryName(product.id_categorie)}</TableCell>
                                                    <TableCell className="font-semibold">${product.prix}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.variant}>
                                                            {stockStatus.label} ({product.quantite_en_stock})
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(product.date_de_creation).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm"
                                                                    onClick={() => handleEdit(product)}>
                                                                <Pencil className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(product)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                            <DialogDescription>Create a new product with all necessary information</DialogDescription>
                        </DialogHeader>
                        <ProductForm editForm={editForm} setEditForm={setEditForm} categories={categories}/>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={saveAdd} className="bg-primary hover:bg-primary/90">
                                Add Product
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update product information and save changes</DialogDescription>
                        </DialogHeader>
                        <ProductForm editForm={editForm} setEditForm={setEditForm} categories={categories}/>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsEditDialogOpen(false)
                                setSelectedProduct(null)
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Product</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{selectedProduct?.nom}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setSelectedProduct(null)
                            }}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete Product
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}


/*
"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Package } from "lucide-react"
import type { Category, CreateProductDto, Product } from "@/lib/api/definitions"
import { categoriesService } from "@/lib/api/services/categories.service"
import { productsService } from "@/lib/api/services/products.service"
import { authService } from "@/lib/api/services/auth.service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ProductForm } from "@/app/_ui/products/product.form"

/!*
const initialProducts: Product[] = [
    {
        _id: "1",
        nom: 'MacBook Pro 16"',
        prix: 2499,
        id_categorie: "laptops",
        quantite_en_stock: 45,
        date_de_creation: new Date().toISOString(),
        description: "Powerful laptop for professionals",
        images: ["/macbook-pro-laptop.png"],
        specifications: [
            { key: "Processor", value: "M3 Pro" },
            { key: "RAM", value: "16GB" },
            { key: "Storage", value: "512GB SSD" },
        ],
    },
    {
        _id: "2",
        nom: "iPhone 15 Pro",
        prix: 999,
        id_categorie: "smartphones",
        quantite_en_stock: 120,
        date_de_creation: new Date().toISOString(),
        description: "Latest flagship smartphone",
        images: ["/modern-smartphone.png"],
        specifications: [
            { key: "Display", value: '6.1" OLED' },
            { key: "Chip", value: "A17 Pro" },
            { key: "Camera", value: "48MP" },
        ],
    },
    {
        _id: "3",
        nom: "Sony WH-1000XM5",
        prix: 399,
        id_categorie: "accessories",
        quantite_en_stock: 78,
        date_de_creation: new Date().toISOString(),
        description: "Premium noise-cancelling headphones",
        images: ["/wireless-headphones.png"],
        specifications: [
            { key: "Type", value: "Over-ear" },
            { key: "Battery", value: "30 hours" },
            { key: "Connectivity", value: "Bluetooth 5.2" },
        ],
    },
    {
        _id: "4",
        nom: 'Dell UltraSharp 27"',
        prix: 549,
        id_categorie: "monitors",
        quantite_en_stock: 32,
        date_de_creation: new Date().toISOString(),
        description: "Professional 4K monitor",
        images: ["/computer-monitor-display.png"],
        specifications: [
            { key: "Resolution", value: "3840x2160" },
            { key: "Refresh Rate", value: "60Hz" },
            { key: "Panel Type", value: "IPS" },
        ],
    },
    {
        _id: "5",
        nom: "Samsung Galaxy S24",
        prix: 899,
        id_categorie: "smartphones",
        quantite_en_stock: 0,
        date_de_creation: new Date().toISOString(),
        description: "Android flagship device",
        images: ["/modern-smartphone.png"],
        specifications: [
            { key: "Display", value: '6.2" AMOLED' },
            { key: "Processor", value: "Snapdragon 8 Gen 3" },
            { key: "RAM", value: "8GB" },
        ],
    },
]
*!/

export default function ProductManagementPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[] | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState<Partial<CreateProductDto>>({})

    const fetchProducts = async () => {
        try {
            const check = await authService.isAuthenticated()
            if (!check.authenticated || !check.user) {
                router.push('/login')
                return
            }
            const fetchedProducts = await productsService.getAllProductsDashboard()
            setProducts(fetchedProducts)
            const fetchedCategories = await categoriesService.getAllCategories()
            setCategories(fetchedCategories)
        } catch (error) {
            console.error("Error fetching data:", error)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await fetchProducts()
        }
        loadData()
    }, [])

    // Create a category map for efficient lookup
    const categoryMap = useMemo(() => {
        if (!categories) return new Map()
        return new Map(categories.map(cat => [cat._id, cat.name]))
    }, [categories])

    const getCategoryName = (categoryId: string) => {
        return categoryMap.get(categoryId) || "Unknown"
    }

    const handleAdd = () => {
        setEditForm({
            nom: "",
            prix: 0,
            description: "",
            images: [],
            specifications: [],
            categoryId: "",
            quantite_en_stock: 0,
        })
        setIsAddDialogOpen(true)
    }

    const handleEdit = (product: Product) => {
        setEditForm({
            nom: product.nom,
            prix: product.prix,
            description: product.description,
            images: product.images,
            specifications: product.specifications,
            categoryId: product.id_categorie,
            quantite_en_stock: product.quantite_en_stock,
        })
        setIsEditDialogOpen(true)
    }

    const handleDelete = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!selectedProduct) return

        try {
            await productsService.deleteProductById(selectedProduct._id)
            toast.info("Product deleted successfully")
            setIsDeleteDialogOpen(false)
            setSelectedProduct(null)
            await fetchProducts() // Refresh the list
        } catch (err) {
            console.error("Error deleting product:", err)
            toast.error("Failed to delete product")
        }
    }

    const saveAdd = async () => {
        if (editForm.nom && editForm.prix && editForm.categoryId) {
            try {
                const newProduct: CreateProductDto = {
                    nom: editForm.nom,
                    prix: editForm.prix,
                    description: editForm.description,
                    images: editForm.images || [],
                    specifications: editForm.specifications || [],
                    categoryId: editForm.categoryId,
                    quantite_en_stock: editForm.quantite_en_stock || 0,
                }
                await productsService.createProduct(newProduct)
                await fetchProducts()
                toast.success("Product added successfully")
                setIsAddDialogOpen(false)
                setEditForm({})
            } catch (err) {
                console.error("Error adding product:", err)
                toast.error("Failed to add product")
            }
        } else {
            toast.error("Please fill in all required fields")
        }
    }

    const saveEdit = async () => {
        if (!selectedProduct || !editForm) return

        try {
            const cleanSpecifications = (editForm.specifications || selectedProduct.specifications || []).map(
                ({ key, value }) => ({ key, value })
            )

            const updatedProduct: CreateProductDto = {
                nom: editForm.nom || selectedProduct.nom,
                prix: editForm.prix || selectedProduct.prix,
                description: editForm.description || selectedProduct.description,
                images: editForm.images || selectedProduct.images || [],
                specifications: cleanSpecifications,
                categoryId: editForm.categoryId || selectedProduct.id_categorie,
                quantite_en_stock: editForm.quantite_en_stock ?? selectedProduct.quantite_en_stock,
            }

            console.log(updatedProduct)

            await productsService.updateProduct(selectedProduct._id, updatedProduct)
            await fetchProducts()
            toast.success("Product updated successfully")
            setIsEditDialogOpen(false)
            setSelectedProduct(null)
            setEditForm({})
        } catch (err) {
            console.error("Error updating product:", err)
            toast.error("Failed to update product")
        }
    }

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const }
        if (stock < 20) return { label: "Low Stock", variant: "secondary" as const }
        return { label: "In Stock", variant: "default" as const }
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Product Management</h1>
                    <p className="text-muted-foreground">Manage your product inventory</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Products Overview</CardTitle>
                                <CardDescription>View, edit, and manage all products</CardDescription>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    onClick={handleAdd}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No products found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.map((product) => {
                                            const stockStatus = getStockStatus(product.quantite_en_stock)
                                            return (
                                                <TableRow key={product._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-medium">{product.nom}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getCategoryName(product.id_categorie)}</TableCell>
                                                    <TableCell className="font-semibold">${product.prix}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.variant}>
                                                            {stockStatus.label} ({product.quantite_en_stock})
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(product.date_de_creation).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm"
                                                                    onClick={() => handleEdit(product)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(product)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/!* Add Dialog *!/}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                            <DialogDescription>Create a new product with all necessary information</DialogDescription>
                        </DialogHeader>
                        <ProductForm editForm={editForm} setEditForm={setEditForm} categories={categories} />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={saveAdd} className="bg-primary hover:bg-primary/90">
                                Add Product
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/!* Edit Dialog *!/}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update product information and save changes</DialogDescription>
                        </DialogHeader>
                        <ProductForm editForm={editForm} setEditForm={setEditForm} categories={categories} />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsEditDialogOpen(false)
                                setSelectedProduct(null)
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/!* Delete Confirmation Dialog *!/}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Product</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{selectedProduct?.nom}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setSelectedProduct(null)
                            }}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete Product
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}




/!*
"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Search, Plus, Pencil, Trash2, Package, X} from "lucide-react"
import type {Category, CreateProductDto, Product, UpdateProductDto} from "@/lib/api/definitions"
import {categoriesService} from "@/lib/api/services/categories.service";
import {productsService} from "@/lib/api/services/products.service";
import {authService} from "@/lib/api/services/auth.service";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const initialProducts: Product[] = [
    {
        _id: "1",
        nom: 'MacBook Pro 16"',
        prix: 2499,
        id_categorie: "laptops",
        quantite_en_stock: 45,
        date_de_creation: new Date().toISOString(),
        description: "Powerful laptop for professionals",
        images: ["/macbook-pro-laptop.png"],
        specifications: [
            {key: "Processor", value: "M3 Pro"},
            {key: "RAM", value: "16GB"},
            {key: "Storage", value: "512GB SSD"},
        ],
    },
    {
        _id: "2",
        nom: "iPhone 15 Pro",
        prix: 999,
        id_categorie: "smartphones",
        quantite_en_stock: 120,
        date_de_creation: new Date().toISOString(),
        description: "Latest flagship smartphone",
        images: ["/modern-smartphone.png"],
        specifications: [
            {key: "Display", value: '6.1" OLED'},
            {key: "Chip", value: "A17 Pro"},
            {key: "Camera", value: "48MP"},
        ],
    },
    {
        _id: "3",
        nom: "Sony WH-1000XM5",
        prix: 399,
        id_categorie: "accessories",
        quantite_en_stock: 78,
        date_de_creation: new Date().toISOString(),
        description: "Premium noise-cancelling headphones",
        images: ["/wireless-headphones.png"],
        specifications: [
            {key: "Type", value: "Over-ear"},
            {key: "Battery", value: "30 hours"},
            {key: "Connectivity", value: "Bluetooth 5.2"},
        ],
    },
    {
        _id: "4",
        nom: 'Dell UltraSharp 27"',
        prix: 549,
        id_categorie: "monitors",
        quantite_en_stock: 32,
        date_de_creation: new Date().toISOString(),
        description: "Professional 4K monitor",
        images: ["/computer-monitor-display.png"],
        specifications: [
            {key: "Resolution", value: "3840x2160"},
            {key: "Refresh Rate", value: "60Hz"},
            {key: "Panel Type", value: "IPS"},
        ],
    },
    {
        _id: "5",
        nom: "Samsung Galaxy S24",
        prix: 899,
        id_categorie: "smartphones",
        quantite_en_stock: 0,
        date_de_creation: new Date().toISOString(),
        description: "Android flagship device",
        images: ["/modern-smartphone.png"],
        specifications: [
            {key: "Display", value: '6.2" AMOLED'},
            {key: "Processor", value: "Snapdragon 8 Gen 3"},
            {key: "RAM", value: "8GB"},
        ],
    },
]

/!*const categories = [
    {id: "laptops", name: "Laptops"},
    {id: "smartphones", name: "Smartphones"},
    {id: "accessories", name: "Accessories"},
    {id: "monitors", name: "Monitors"},
]*!/

export default function ProductManagementPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [categories, setCategories] = useState<Category[] | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState<Partial<UpdateProductDto>>({})

    const fetchProducts = async () => {
        try {
            const check = await authService.isAuthenticated()
            if (!check.authenticated || !check.user) {
                router.push('/login');
                return;
            }
            const fetchedProducts = await productsService.getAllProductsDashboard()
            setProducts(fetchedProducts)
            const fetchedCategories = await categoriesService.getAllCategories()
            setCategories(fetchedCategories)
        } catch (error) {
            console.error("Error fetching users:", error)

        }
    }

    useEffect(() => {
        const loadData = async () => {
            await fetchProducts()
        }
        loadData()
    }, []);

     function getCategoryName(categoryId: string) {
        const res = await categoriesService.getCategory(categoryId)
        return res.name;
    }

    const handleAdd = () => {
        setEditForm({
            nom: "",
            prix: 0,
            description: "",
            images: [],
            specifications: [],
            categoryId: "",
            quantite_en_stock: 0,
        })
        setIsAddDialogOpen(true)
    }

    const handleEdit = (product: Product) => {
        setSelectedProduct(product)
        setEditForm(product)
        setIsEditDialogOpen(true)
    }

    const handleDelete = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!selectedProduct)
            return
        try {
            if (selectedProduct) {
                await productsService.deleteProductById(selectedProduct._id)
                toast.info("Product deleted successfully")
            }
        } catch (err){

        }

    }

    const saveAdd = async () => {
        if (editForm.nom && editForm.prix && editForm.categoryId) {
            const newProduct: CreateProductDto = {
                nom: editForm.nom,
                prix: editForm.prix,
                description: editForm.description,
                images: editForm.images || [],
                specifications: editForm.specifications || [],
                categoryId: editForm.categoryId,
                quantite_en_stock: editForm.quantite_en_stock || 0,
            }
            await productsService.createProduct(newProduct)
            await fetchProducts()
            toast.success("Product added successfully")
            setIsAddDialogOpen(false)
            setEditForm({})
        }
    }

    const saveEdit = async () => {
        if (!editForm) return;
        if (selectedProduct && editForm) {
            const updatedProduct: UpdateProductDto = {
                _id: selectedProduct._id,
                nom: editForm.nom || selectedProduct.nom,
                prix: editForm.prix || selectedProduct.prix,
                description: editForm.description || selectedProduct.description,
                images: editForm.images || selectedProduct.images || [],
                specifications: editForm.specifications || selectedProduct.specifications || [],
                categoryId: editForm.categoryId || selectedProduct.id_categorie,
                quantite_en_stock: editForm.quantite_en_stock || selectedProduct.quantite_en_stock,
            }
            await productsService.updateProduct(selectedProduct._id, updatedProduct)
            await fetchProducts()
            toast.success("Product updated successfully")
            setIsEditDialogOpen(false)
            setSelectedProduct(null)
            setEditForm({})
        }
    }

    const getStockStatus = (stock: number) => {
        if (stock === 0) return {label: "Out of Stock", variant: "destructive" as const}
        if (stock < 20) return {label: "Low Stock", variant: "secondary" as const}
        return {label: "In Stock", variant: "default" as const}
    }

    const addSpecification = () => {
        setEditForm({
            ...editForm,
            specifications: [...(editForm.specifications || []), {key: "", value: ""}],
        })
    }

    const updateSpecification = (index: number, field: "key" | "value", value: string) => {
        const specs = [...(editForm.specifications || [])]
        specs[index] = {...specs[index], [field]: value}
        setEditForm({...editForm, specifications: specs})
    }

    const removeSpecification = (index: number) => {
        setEditForm({
            ...editForm,
            specifications: editForm.specifications?.filter((_, i) => i !== index),
        })
    }

    const addImage = () => {
        setEditForm({
            ...editForm,
            images: [...(editForm.images || []), ""],
        })
    }

    const updateImage = (index: number, value: string) => {
        const imgs = [...(editForm.images || [])]
        imgs[index] = value
        setEditForm({...editForm, images: imgs})
    }

    const removeImage = (index: number) => {
        setEditForm({
            ...editForm,
            images: editForm.images?.filter((_, i) => i !== index),
        })
    }

    const ProductFormFields = () => (
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
                <Label htmlFor="nom">Product Name *</Label>
                <Input
                    id="nom"
                    value={editForm.nom || ""}
                    onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                    placeholder="Enter product name"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="prix">Price ($) *</Label>
                    <Input
                        id="prix"
                        type="number"
                        value={editForm.prix || ""}
                        onChange={(e) => setEditForm({...editForm, prix: Number.parseFloat(e.target.value)})}
                        placeholder="0.00"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="quantite_en_stock">Stock *</Label>
                    <Input
                        id="quantite_en_stock"
                        type="number"
                        value={editForm.quantite_en_stock || ""}
                        onChange={(e) => setEditForm({...editForm, quantite_en_stock: Number.parseInt(e.target.value)})}
                        placeholder="0"
                    />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="id_categorie">Category *</Label>
                <Select
                    value={editForm.categoryId}
                    onValueChange={(value) => setEditForm({...editForm, categoryId: value})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category"/>
                    </SelectTrigger>
                    <SelectContent>
                        {categories?.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    placeholder="Enter product description"
                />
            </div>

            {/!* Images Section *!/}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>Images</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addImage}>
                        <Plus className="h-4 w-4 mr-1"/>
                        Add Image
                    </Button>
                </div>
                {editForm.images && editForm.images.length > 0 ? (
                    <div className="space-y-2">
                        {editForm.images.map((image, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={image}
                                    onChange={(e) => updateImage(index, e.target.value)}
                                    placeholder="Image URL"
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => removeImage(index)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No images added</p>
                )}
            </div>

            {/!* Specifications Section *!/}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>Specifications</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                        <Plus className="h-4 w-4 mr-1"/>
                        Add Specification
                    </Button>
                </div>
                {editForm.specifications && editForm.specifications.length > 0 ? (
                    <div className="space-y-2">
                        {editForm.specifications.map((spec, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={spec.key}
                                    onChange={(e) => updateSpecification(index, "key", e.target.value)}
                                    placeholder="Key (e.g., RAM)"
                                    className="flex-1"
                                />
                                <Input
                                    value={spec.value}
                                    onChange={(e) => updateSpecification(index, "value", e.target.value)}
                                    placeholder="Value (e.g., 16GB)"
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" size="icon"
                                        onClick={() => removeSpecification(index)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No specifications added</p>
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Product Management</h1>
                    <p className="text-muted-foreground">Manage your product inventory</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Products Overview</CardTitle>
                                <CardDescription>View, edit, and manage all products</CardDescription>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    onClick={handleAdd}>
                                <Plus className="h-4 w-4 mr-2"/>
                                Add Product
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2"/>
                                                <p className="text-muted-foreground">No products found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.map((product) => {
                                            const stockStatus = getStockStatus(product.quantite_en_stock)
                                            return (
                                                <TableRow key={product._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-medium">{product.nom}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getCategoryName(product.id_categorie)}</TableCell>
                                                    <TableCell className="font-semibold">${product.prix}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.variant}>
                                                            {stockStatus.label} ({product.quantite_en_stock})
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(product.date_de_creation).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm"
                                                                    onClick={() => handleEdit(product)}>
                                                                <Pencil className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(product)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                            <DialogDescription>Create a new product with all necessary information</DialogDescription>
                        </DialogHeader>
                        <ProductFormFields/>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={saveAdd} className="bg-primary hover:bg-primary/90">
                                Add Product
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update product information and save changes</DialogDescription>
                        </DialogHeader>
                        <ProductFormFields/>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsEditDialogOpen(false)
                                setSelectedProduct(null)
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/!* Delete Confirmation Dialog *!/}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Product</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{selectedProduct?.nom}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setSelectedProduct(null)
                            }}>
                                Cancel
                            </Button>
                            <Button variant="destructive"onClick={() => selectedProduct && confirmDelete()}>
                                Delete Product
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
*!/
*/
