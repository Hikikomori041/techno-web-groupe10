import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import type {Category, CreateProductDto} from "@/lib/api/definitions"

interface ProductFormProps {
    editForm: Partial<CreateProductDto>
    setEditForm: (form: Partial<CreateProductDto>) => void
    categories: Category[] | null
}

export function ProductForm({ editForm, setEditForm, categories }: ProductFormProps) {
    const addSpecification = () => {
        setEditForm({
            ...editForm,
            specifications: [...(editForm.specifications || []), { key: "", value: "" }],
        })
    }

    const updateSpecification = (index: number, field: "key" | "value", value: string) => {
        const specs = [...(editForm.specifications || [])]
        specs[index] = { ...specs[index], [field]: value }
        setEditForm({ ...editForm, specifications: specs })
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
        setEditForm({ ...editForm, images: imgs })
    }

    const removeImage = (index: number) => {
        setEditForm({
            ...editForm,
            images: editForm.images?.filter((_, i) => i !== index),
        })
    }

    return (
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
                <Label htmlFor="nom">Product Name *</Label>
                <Input
                    id="nom"
                    value={editForm.nom || ""}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
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
                        onChange={(e) => setEditForm({ ...editForm, prix: Number.parseFloat(e.target.value) })}
                        placeholder="0.00"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="quantite_en_stock">Stock *</Label>
                    <Input
                        id="quantite_en_stock"
                        type="number"
                        value={editForm.quantite_en_stock || ""}
                        onChange={(e) => setEditForm({ ...editForm, quantite_en_stock: Number.parseInt(e.target.value) })}
                        placeholder="0"
                    />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="id_categorie">Category *</Label>
                <Select
                    value={editForm.categoryId}
                    onValueChange={(value) => setEditForm({ ...editForm, categoryId: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    placeholder="Enter product description"
                />
            </div>

            {/* Images Section */}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>Images</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addImage}>
                        <Plus className="h-4 w-4 mr-1" />
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
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No images added</p>
                )}
            </div>

            {/* Specifications Section */}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>Specifications</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                        <Plus className="h-4 w-4 mr-1" />
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
                                    <X className="h-4 w-4" />
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
}