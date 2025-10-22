'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkAuth, User } from '@/lib/auth';
import DashboardNav from '@/components/DashboardNav';
import { categoriesApi, type Category } from '@/lib/categoriesApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Moderator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CategoryRef {
  _id: string;
  name: string;
  description?: string;
}

interface Product {
  _id: string;
  nom: string;
  prix: number;
  description?: string;
  images?: string[];
  specifications: Array<{ key: string; value: string }>;
  categoryId: CategoryRef | string;
  moderatorId: Moderator | string;
  quantite_en_stock: number;
  date_de_creation: string;
}

interface ProductStats {
  _id: string;
  quantite_en_stock: number;
  nombre_de_vente: number;
}

interface ProductWithStats extends Product {
  stats?: ProductStats;
}

interface ProductForm {
  nom: string;
  prix: number;
  description: string;
  categoryId: string;
  specifications: Array<{ key: string; value: string }>;
}

export default function ProductManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    nom: '',
    prix: 0,
    description: '',
    categoryId: '',
    specifications: [],
  });
  const [stockInput, setStockInput] = useState<number>(0);

  useEffect(() => {
    checkAuthAndFetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data.filter(cat => cat.isActive));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const checkAuthAndFetchProducts = async () => {
    try {
      const result = await checkAuth();
      
      if (!result.authenticated || !result.user) {
        router.push('/login');
        return;
      }

      // Check if user has admin or moderator role
      const hasAccess = result.user.roles.includes('admin') || result.user.roles.includes('moderator');
      if (!hasAccess) {
        setError('Access denied. Admin or Moderator role required.');
        return;
      }

      setUser(result.user);
      await fetchProducts();
    } catch (err) {
      setError('Authentication failed');
      router.push('/login');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products/dashboard/all`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const productsData = await response.json();
      
      // Fetch stats for all products
      const productsWithStats = await Promise.all(
        productsData.map(async (product: Product) => {
          try {
            const statsResponse = await fetch(`${API_URL}/product-stats/${product._id}`, {
              credentials: 'include',
            });
            
            if (statsResponse.ok) {
              const text = await statsResponse.text();
              if (text) {
                const stats = JSON.parse(text);
                return { ...product, stats };
              }
            }
          } catch (err) {
            console.error(`Failed to fetch stats for ${product._id}:`, err);
          }
          return product;
        })
      );

      setProducts(productsWithStats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Filter out empty specifications
      const validSpecs = formData.specifications.filter(
        spec => spec.key.trim() && spec.value.trim()
      );

      const productData = {
        nom: formData.nom,
        prix: parseFloat(formData.prix.toString()),
        description: formData.description,
        categoryId: formData.categoryId,
        specifications: validSpecs,
        quantite_en_stock: stockInput,
      };

      const url = editingProduct 
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products/create`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      // Reset form and refresh products
      setFormData({
        nom: '',
        prix: 0,
        description: '',
        categoryId: '',
        specifications: [],
      });
      setStockInput(0);
      setShowAddForm(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const categoryId = typeof product.categoryId === 'string' 
      ? product.categoryId 
      : product.categoryId?._id || '';
    
    setFormData({
      nom: product.nom,
      prix: product.prix,
      description: product.description || '',
      categoryId: categoryId,
      specifications: product.specifications || [],
    });
    setStockInput(product.quantite_en_stock || 0);
    setShowAddForm(true);
  };

  // Helper functions for specifications
  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '' }],
    });
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({
      ...formData,
      specifications: newSpecs,
    });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete product (${response.status})`);
      }

      await fetchProducts();
      alert('Product deleted successfully!');
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setStockInput(0);
    setFormData({
      nom: '',
      prix: 0,
      description: '',
      categoryId: '',
      specifications: [],
    });
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Product Management
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {products.length} product{products.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (showAddForm) handleCancel();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showAddForm ? 'Cancel' : '+ Add Product'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Laptop Dell XPS 15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="999.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockInput}
                    onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Product description..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Specifications
                  </label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    + Add Specification
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.specifications.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No specifications added. Click "Add Specification" to add product details.
                    </p>
                  ) : (
                    formData.specifications.map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., RAM, CPU, Storage"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., 16GB DDR4"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          title="Remove specification"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-2">📦</div>
                      <p className="text-gray-500 dark:text-gray-400">No products yet</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-4 text-blue-600 hover:underline"
                      >
                        Add your first product
                      </button>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.nom}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(product.prix)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className={`text-sm font-semibold ${
                            (product.quantite_en_stock || 0) > 10 
                              ? 'text-green-600 dark:text-green-400' 
                              : (product.quantite_en_stock || 0) > 0
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {product.quantite_en_stock !== undefined 
                              ? `${product.quantite_en_stock} units` 
                              : 'N/A'}
                          </div>
                          {product.stats?.nombre_de_vente !== undefined && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {product.stats.nombre_de_vente} sold
                            </div>
                          )}
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-left"
                          >
                            Update Stock
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {product.moderatorId && typeof product.moderatorId === 'object' ? (
                            <>
                              <div className="font-medium">
                                {product.moderatorId.firstName} {product.moderatorId.lastName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {product.moderatorId.email}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {typeof product.categoryId === 'object' ? product.categoryId.name : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(product.date_de_creation).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={`/products/${product._id}`}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

