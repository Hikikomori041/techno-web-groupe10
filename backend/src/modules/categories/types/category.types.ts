export interface CategoryCreateInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

