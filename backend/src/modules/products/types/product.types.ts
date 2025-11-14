export interface ProductSpecificationInput {
  key: string;
  value: string;
}

export interface ProductCreateInput {
  nom: string;
  prix: number;
  description?: string;
  images?: string[];
  specifications: ProductSpecificationInput[];
  categoryId: string;
  moderatorId: string;
  quantite_en_stock: number;
}

export interface ProductUpdateInput {
  nom?: string;
  prix?: number;
  description?: string;
  images?: string[];
  specifications?: ProductSpecificationInput[];
  categoryId?: string;
  quantite_en_stock?: number;
}

export interface ProductFilterInput {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  page: number;
  limit: number;
  specifications?: Record<string, string>;
}

