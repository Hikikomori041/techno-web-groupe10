'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartIcon from '@/components/CartIcon';
import { checkAuth, logout, type User } from '@/lib/auth';
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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    categoryId: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  
  // Ref for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchUser();
    
    // Check for URL parameters (e.g., from homepage category links)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const inStockFromUrl = urlParams.get('inStockOnly');
    
    if (categoryFromUrl || inStockFromUrl) {
      const urlFilters = {
        categoryId: categoryFromUrl || '',
        search: '',
        minPrice: '',
        maxPrice: '',
        inStockOnly: inStockFromUrl === 'true',
      };
      setFilters(urlFilters);
      setAppliedFilters(urlFilters);
    }
  }, []);

  useEffect(() => {
    // Fetch products when applied filters change
    fetchProducts(true);
  }, [appliedFilters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchProducts(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, page]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data.filter(cat => cat.isActive));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const result = await checkAuth();
      if (result.authenticated && result.user) {
        setUser(result.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowProfileDropdown(false);
    if (showProfileDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileDropdown]);

  const fetchProducts = async (reset: boolean = false) => {
    try {
      const currentPage = reset ? 1 : page;
      
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      // Build query string
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      if (appliedFilters.categoryId) params.append('categoryId', appliedFilters.categoryId);
      if (appliedFilters.search) params.append('search', appliedFilters.search);
      if (appliedFilters.minPrice) params.append('minPrice', appliedFilters.minPrice);
      if (appliedFilters.maxPrice) params.append('maxPrice', appliedFilters.maxPrice);
      if (appliedFilters.inStockOnly) params.append('inStockOnly', 'true');

      const response = await fetch(`${API_URL}/products?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (reset) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(currentPage + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const resetFilters = {
      categoryId: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      inStockOnly: false,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erreur</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchProducts(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Nos Produits
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {total || 0} produit{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              {user && (
                <>
                  <Link
                    href="/orders"
                    className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Mes commandes"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </Link>
                  <CartIcon />
                </>
              )}
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Accueil
              </Link>
              
              {/* Show Dashboard only for Admin/Moderator */}
              {user && (user.roles.includes('admin') || user.roles.includes('moderator')) && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Dashboard
                </Link>
              )}

              {/* Profile Dropdown or Login Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileDropdown(!showProfileDropdown);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                    )}
                    <svg
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        My Orders
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Price (€)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Price (€)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="10000"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* In Stock Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStockOnly"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="inStockOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  In Stock Only
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Clear Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(appliedFilters.categoryId || appliedFilters.search || appliedFilters.minPrice || appliedFilters.maxPrice || appliedFilters.inStockOnly) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.categoryId && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      Category: {categories.find(c => c._id === appliedFilters.categoryId)?.name || appliedFilters.categoryId}
                    </span>
                  )}
                  {appliedFilters.search && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      Search: "{appliedFilters.search}"
                    </span>
                  )}
                  {appliedFilters.minPrice && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      Min: €{appliedFilters.minPrice}
                    </span>
                  )}
                  {appliedFilters.maxPrice && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      Max: €{appliedFilters.maxPrice}
                    </span>
                  )}
                  {appliedFilters.inStockOnly && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      In Stock Only
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {products?.length || 0} of {total} products
            </p>
          </div>
        )}

        {loading && (!products || products.length === 0) ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun produit disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ajoutez des produits via l'API Swagger ou le dashboard admin.
            </p>
            <a
              href="http://localhost:3000/api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ouvrir Swagger API
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products && products.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-24 h-24 text-white opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.nom}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {typeof product.categoryId === 'object' ? product.categoryId.name : 'N/A'}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatPrice(product.prix)}
                  </p>

                  {/* Moderator Info */}
                  {product.moderatorId && typeof product.moderatorId === 'object' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Par: {product.moderatorId.firstName} {product.moderatorId.lastName}
                    </p>
                  )}

                  {/* Stock Info */}
                  {product.quantite_en_stock !== undefined && (
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${
                        product.quantite_en_stock > 10 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : product.quantite_en_stock > 0
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {product.quantite_en_stock > 0 
                          ? `${product.quantite_en_stock} en stock`
                          : 'Rupture de stock'
                        }
                      </span>
                    </div>
                  )}

                  {product.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Specifications */}
                  {product.specifications && product.specifications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Spécifications:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.specifications.slice(0, 3).map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            {spec.key}: {spec.value}
                          </span>
                        ))}
                        {product.specifications.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded">
                            +{product.specifications.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ajouté le {formatDate(product.date_de_creation)}
                    </span>
                    <Link
                      href={`/products/${product._id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && products && products.length > 0 && (
          <div ref={observerTarget} className="py-8 text-center">
            {loadingMore ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading more products...</span>
              </div>
            ) : (
              <div className="text-gray-400">Scroll for more...</div>
            )}
          </div>
        )}

        {/* No More Products */}
        {!hasMore && products && products.length > 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No more products to load
          </div>
        )}
      </div>

      {/* Admin Notice */}
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                🔒 Gestion des produits
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Seuls les administrateurs et modérateurs peuvent ajouter, modifier ou supprimer des produits.
                Les opérations GET (lecture) sont publiques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

