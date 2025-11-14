"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Edit, Trash2, Loader2, Package } from "lucide-react"
import { authService } from "@/lib/api/services/auth.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { categoriesService } from "@/lib/api/services/categories.service"
import { Category } from "@/lib/api/definitions"
import { toast } from "sonner"
import { debugLog } from "@/lib/utils"

export default function CategoriesManagementPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true,
    })
    const [submitting, setSubmitting] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        try {
            const data = await categoriesService.getAllCategories()
            // Deduplicate categories by _id to ensure unique keys
            const uniqueCategories = data.reduce((acc, category) => {
                const catId = category._id;
                const catIdStr = catId ? String(catId) : null;
                if (catIdStr && !acc.seen.has(catIdStr)) {
                    acc.seen.add(catIdStr);
                    acc.unique.push(category);
                } else if (!catIdStr) {
                    // If no ID, include it anyway (shouldn't happen, but handle gracefully)
                    acc.unique.push(category);
                }
                return acc;
            }, { seen: new Set<string>(), unique: [] as Category[] });
            
            setCategories(uniqueCategories.unique)
        } catch (error: unknown) {
            debugLog("Error fetching categories:", error)
            toast.error("Erreur lors du chargement des catégories")
        } finally {
            setLoading(false)
        }
    }, [])

    const checkAuthAndFetchCategories = useCallback(async () => {
        try {
            const result = await authService.isAuthenticated()
            if (result.authenticated && result.user) {
                setIsAdmin(result.user.roles.includes("admin"))
            }
            await fetchCategories()
        } catch (error: unknown) {
            debugLog("Error checking auth:", error)
            await fetchCategories()
        }
    }, [fetchCategories])

    useEffect(() => {
        checkAuthAndFetchCategories()
    }, [checkAuthAndFetchCategories])

    const handleAddCategory = async () => {
        if (!formData.name.trim()) {
            toast.error("Le nom de la catégorie est requis")
            return
        }

        setSubmitting(true)
        try {
            await categoriesService.createCategory(formData)
            toast.success("Catégorie créée avec succès")
            setIsAddDialogOpen(false)
            setFormData({ name: "", description: "", isActive: true })
            await fetchCategories()
        } catch (error: unknown) {
            debugLog("Error creating category:", error)
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors de la création de la catégorie"
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleEditCategory = async () => {
        if (!selectedCategory || !formData.name.trim()) {
            toast.error("Le nom de la catégorie est requis")
            return
        }

        const categoryId = selectedCategory._id || (selectedCategory as Category & { id?: string }).id;
        if (!categoryId) {
            toast.error("ID de catégorie invalide")
            return
        }

        setSubmitting(true)
        try {
            await categoriesService.updateCategory(String(categoryId), formData)
            toast.success("Catégorie mise à jour avec succès")
            setIsEditDialogOpen(false)
            setSelectedCategory(null)
            setFormData({ name: "", description: "", isActive: true })
            await fetchCategories()
        } catch (error: unknown) {
            debugLog("Error updating category:", error)
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors de la mise à jour de la catégorie"
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return

        const categoryId = selectedCategory._id || (selectedCategory as Category & { id?: string }).id;
        if (!categoryId) {
            toast.error("ID de catégorie invalide")
            return
        }

        setSubmitting(true)
        try {
            await categoriesService.deleteCategory(String(categoryId))
            toast.success("Catégorie supprimée avec succès")
            setIsDeleteDialogOpen(false)
            setSelectedCategory(null)
            await fetchCategories()
        } catch (error: unknown) {
            debugLog("Error deleting category:", error)
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors de la suppression de la catégorie"
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const openEditDialog = (category: Category) => {
        setSelectedCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            isActive: category.isActive,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (category: Category) => {
        setSelectedCategory(category)
        setIsDeleteDialogOpen(true)
    }

    const openAddDialog = () => {
        setFormData({ name: "", description: "", isActive: true })
        setIsAddDialogOpen(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {isAdmin ? "Gestion des catégories" : "Catégories"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isAdmin 
                            ? "Gérez les catégories de produits de votre boutique"
                            : "Consultez les catégories de produits disponibles"
                        }
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Toutes les catégories</CardTitle>
                                <CardDescription>
                                    {categories.length} catégorie(s) au total
                                    {!isAdmin && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            (Lecture seule)
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            {isAdmin && (
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={openAddDialog}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une catégorie
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date de création</TableHead>
                                        {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">Aucune catégorie trouvée</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category, index) => {
                                            // Ensure unique key - use _id, id, or fallback to index
                                            const categoryKey = category._id 
                                                ? String(category._id) 
                                                : ((category as Category & { id?: string }).id 
                                                    ? String((category as Category & { id?: string }).id) 
                                                    : `category-${index}`)
                                            
                                            return (
                                            <TableRow key={categoryKey}>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <span className="line-clamp-1 text-sm text-muted-foreground">
                                                        {category.description || "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {category.isActive ? (
                                                        <Badge variant="default" className="bg-green-600">Actif</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Inactif</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {category.createdAt
                                                        ? new Date(category.createdAt).toLocaleDateString("fr-FR", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })
                                                        : "-"}
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(category)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openDeleteDialog(category)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Category Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une catégorie</DialogTitle>
                        <DialogDescription>
                            Créez une nouvelle catégorie pour vos produits
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="add-name">Nom *</Label>
                            <Input
                                id="add-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Ordinateurs portables"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add-description">Description</Label>
                            <Input
                                id="add-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description de la catégorie"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="add-active"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="add-active">Catégorie active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                            Annuler
                        </Button>
                        <Button onClick={handleAddCategory} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                "Créer"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier la catégorie</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations de la catégorie
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nom *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Ordinateurs portables"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description de la catégorie"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-active"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="edit-active">Catégorie active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                            Annuler
                        </Button>
                        <Button onClick={handleEditCategory} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                "Mettre à jour"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Category Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la catégorie</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la catégorie &quot;{selectedCategory?.name}&quot; ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCategory} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Suppression...
                                </>
                            ) : (
                                "Supprimer"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    )
}

