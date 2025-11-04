"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react"

interface Product {
    id: number
    name: string
    price: number
    category: string
    stock: number
    rating: number
    reviews: number
    image: string
    description?: string
}

const initialProducts: Product[] = [
    {
        id: 1,
        name: 'MacBook Pro 16"',
        price: 2499,
        category: "Laptops",
        stock: 45,
        rating: 4.8,
        reviews: 234,
        image: "/macbook-pro-laptop.png",
        description: "Powerful laptop for professionals",
    },
    {
        id: 2,
        name: "iPhone 15 Pro",
        price: 999,
        category: "Smartphones",
        stock: 120,
        rating: 4.9,
        reviews: 567,
        image: "/modern-smartphone.png",
        description: "Latest flagship smartphone",
    },
    {
        id: 3,
        name: "Sony WH-1000XM5",
        price: 399,
        category: "Accessories",
        stock: 78,
        rating: 4.7,
        reviews: 892,
        image: "/wireless-headphones.png",
        description: "Premium noise-cancelling headphones",
    },
    {
        id: 4,
        name: 'Dell UltraSharp 27"',
        price: 549,
        category: "Monitors",
        stock: 32,
        rating: 4.6,
        reviews: 156,
        image: "/computer-monitor-display.png",
        description: "Professional 4K monitor",
    },
    {
        id: 5,
        name: "Samsung Galaxy S24",
        price: 899,
        category: "Smartphones",
        stock: 95,
        rating: 4.7,
        reviews: 423,
        image: "/modern-smartphone.png",
        description: "Android flagship device",
    },
]

export default function ProductManagementPage() {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [searchQuery, setSearchQuery] = useState("")
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState<Partial<Product>>({})

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleEdit = (product: Product) => {
        setSelectedProduct(product)
        setEditForm(product)
        setIsEditDialogOpen(true)
    }

    const handleDelete = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (selectedProduct) {
            setProducts(products.filter((p) => p.id !== selectedProduct.id))
            setIsDeleteDialogOpen(false)
            setSelectedProduct(null)
        }
    }

    const saveEdit = () => {
        if (selectedProduct && editForm) {
            setProducts(products.map((p) => (p.id === selectedProduct.id ? { ...p, ...editForm } : p)))
            setIsEditDialogOpen(false)
            setSelectedProduct(null)
            setEditForm({})
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
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products by name or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No products found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const stockStatus = getStockStatus(product.stock)
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={product.image || "/placeholder.svg"}
                                                                alt={product.name}
                                                                className="h-12 w-12 rounded object-cover bg-muted"
                                                            />
                                                            <div>
                                                                <p className="font-medium">{product.name}</p>
                                                                <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.category}</TableCell>
                                                    <TableCell className="font-semibold">${product.price}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={stockStatus.variant}>
                                                            {stockStatus.label} ({product.stock})
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">{product.rating}</span>
                                                            <span className="text-sm text-muted-foreground">({product.reviews})</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
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

                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                            <p>
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update product information and save changes</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={editForm.name || ""}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={editForm.price || ""}
                                        onChange={(e) => setEditForm({ ...editForm, price: Number.parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={editForm.stock || ""}
                                        onChange={(e) => setEditForm({ ...editForm, stock: Number.parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={editForm.category}
                                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laptops">Laptops</SelectItem>
                                        <SelectItem value="Smartphones">Smartphones</SelectItem>
                                        <SelectItem value="Accessories">Accessories</SelectItem>
                                        <SelectItem value="Monitors">Monitors</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={editForm.description || ""}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
                                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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
