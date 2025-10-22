'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CartIcon from '@/components/CartIcon';
import { cartApi } from '@/lib/cartApi';
import { checkAuth, logout, type User } from '@/lib/auth';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
    fetchUser();
  }, [productId]);

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

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      // Fetch product details
      const productResponse = await fetch(`${API_URL}/products/${productId}`, {
        credentials: 'include',
      });

      if (!productResponse.ok) {
        throw new Error('Product not found');
      }

      const productData = await productResponse.json();
      setProduct(productData);

      // Fetch product stats (if available)
      try {
        const statsResponse = await fetch(`${API_URL}/product-stats/${productId}`, {
          credentials: 'include',
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (err) {
        // Stats are optional, don't fail if not found
        console.log('Stats not available for this product');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
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

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      setCartSuccess(false);
      await cartApi.addToCart(product._id, 1);
      setCartSuccess(true);
      
      // Dispatch custom event to update cart icon
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success message for 2 seconds
      setTimeout(() => setCartSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Impossible d\'ajouter au panier. Veuillez vous connecter.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Produit introuvable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Ce produit n\'existe pas ou a été supprimé.'}</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour aux produits
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/products')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.nom}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Ajouté le {formatDate(product.date_de_creation)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {user && (
                <>
                  <Link
                    href="/orders"
                    className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Mes commandes"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </Link>
                  <CartIcon />
                </>
              )}

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-32 h-32 text-white opacity-50"
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

              {/* Additional Images */}
              {product.images && product.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      <img src={image} alt={`${product.nom} ${index + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stock & Sales Stats */}
            {product && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {product.quantite_en_stock}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      En stock
                    </div>
                  </div>
                  {stats && (
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.nombre_de_vente}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Vendus
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Price & Category */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prix</p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.prix)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Catégorie</p>
                  <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-semibold">
                    {typeof product.categoryId === 'object' ? product.categoryId.name : 'N/A'}
                  </span>
                </div>
              </div>

              {product && product.quantite_en_stock > 0 ? (
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`w-full px-6 py-3 rounded-lg transition font-semibold ${
                    cartSuccess 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white disabled:opacity-50`}
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ajout en cours...
                    </span>
                  ) : cartSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Ajouté au panier!
                    </span>
                  ) : (
                    '🛒 Ajouter au panier'
                  )}
                </button>
              ) : (
                <button disabled className="w-full px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed font-semibold">
                  Rupture de stock
                </button>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Caractéristiques techniques
                </h3>
                <div className="space-y-3">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {spec.key}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations produit
              </h3>
              <div className="space-y-3">
                {product.moderatorId && typeof product.moderatorId === 'object' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Vendu par</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {product.moderatorId.firstName} {product.moderatorId.lastName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ID Produit</span>
                  <span className="text-xs font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {product._id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Date d'ajout</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(product.date_de_creation)}
                  </span>
                </div>
                {product && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Disponibilité</span>
                      <span className={`font-semibold ${product.quantite_en_stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {product.quantite_en_stock > 0 ? 'En stock' : 'Rupture de stock'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/products')}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
              >
                ← Retour aux produits
              </button>
              <button
                onClick={() => router.push('/dashboard/products')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Gérer le produit
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section (Placeholder) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Produits similaires
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Les produits similaires apparaîtront ici
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

