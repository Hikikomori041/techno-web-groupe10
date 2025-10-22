'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartIcon from '@/components/CartIcon';
import { checkAuth, logout, type User } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchUser();
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.filter((cat: Category) => cat.isActive).slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Same as Products Page */}
      <div className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">IT Materials</span>
            </Link>

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
                href="/products"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
              >
                Produits
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
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Matériel IT Professionnel
              <br />
              <span className="text-blue-200">À Prix Compétitifs</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Découvrez notre large gamme d'ordinateurs, composants et accessoires informatiques de qualité professionnelle
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/products"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl font-bold text-lg"
              >
                Voir les Produits
              </Link>
              {!user && (
                <Link
                  href="/register"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg font-bold text-lg"
                >
                  Créer un Compte
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nos Catégories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explorez notre sélection de matériel IT professionnel
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category._id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block px-6 py-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
          >
            Voir toutes les catégories →
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi Nous Choisir ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Des avantages qui font la différence
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Qualité Garantie
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Produits neufs avec garantie constructeur
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Prix Compétitifs
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Les meilleurs prix du marché
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Livraison Rapide
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Expédition sous 24-48h
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Support Expert
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Assistance technique disponible
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-12 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à Équiper Votre Entreprise ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Parcourez notre catalogue complet et trouvez le matériel IT parfait pour vos besoins
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/products"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl font-bold text-lg"
              >
                Explorer le Catalogue
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg font-bold text-lg"
                >
                  Se Connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</p>
              <p className="text-gray-600 dark:text-gray-400">Produits</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">98%</p>
              <p className="text-gray-600 dark:text-gray-400">Satisfaction Client</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">24h</p>
              <p className="text-gray-600 dark:text-gray-400">Livraison Express</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">5★</p>
              <p className="text-gray-600 dark:text-gray-400">Note Moyenne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">IT Materials</h3>
              <p className="text-gray-400 text-sm">
                Votre partenaire de confiance pour tous vos besoins en matériel informatique professionnel
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products" className="hover:text-white transition">Produits</Link></li>
                <li><Link href="/products?inStockOnly=true" className="hover:text-white transition">En Stock</Link></li>
                <li><Link href="/orders" className="hover:text-white transition">Mes Commandes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Catégories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat._id}>
                    <Link href={`/products?category=${cat._id}`} className="hover:text-white transition">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Compte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {user ? (
                  <>
                    <li><Link href="/dashboard" className="hover:text-white transition">Mon Profil</Link></li>
                    <li><Link href="/cart" className="hover:text-white transition">Mon Panier</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:text-white transition">Connexion</Link></li>
                    <li><Link href="/register" className="hover:text-white transition">Inscription</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 IT Materials. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
