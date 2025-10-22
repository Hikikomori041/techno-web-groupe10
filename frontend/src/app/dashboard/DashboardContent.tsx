'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkAuth, logout, User } from '@/lib/auth';
import { statsApi, type DashboardStats } from '@/lib/statsApi';
import DashboardNav from '@/components/DashboardNav';

export default function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await checkAuth();
      
      if (result.authenticated && result.user) {
        setUser(result.user);
        // Fetch stats if user is admin or moderator
        if (result.user.roles.includes('admin') || result.user.roles.includes('moderator')) {
          await fetchStats();
        }
      } else {
        setError('Not authenticated. Please login.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to check authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await statsApi.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    router.push('/login');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const statusLabels = {
    pending: 'En attente',
    preparation: 'En préparation',
    payment_confirmed: 'Payé',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    preparation: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    payment_confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const isAdminOrMod = user.roles.includes('admin') || user.roles.includes('moderator');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue, {user.firstName} {user.lastName}
            </p>
          </div>

          {isAdminOrMod && stats ? (
            <>
              {/* Key Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-100">Total Revenue</p>
                    <svg className="w-8 h-8 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold">{formatPrice(stats.revenue.total)}</p>
                  <p className="text-sm text-green-100 mt-2">
                    Ce mois: {formatPrice(stats.revenue.thisMonth)}
                  </p>
                </div>

                {/* Total Orders */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-100">Total Orders</p>
                    <svg className="w-8 h-8 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold">{stats.orders.total}</p>
                  <p className="text-sm text-blue-100 mt-2">
                    Pending: {stats.orders.pending}
                  </p>
                </div>

                {/* Products Sold */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-purple-100">Products Sold</p>
                    <svg className="w-8 h-8 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold">{stats.sales.totalQuantitySold}</p>
                  <p className="text-sm text-purple-100 mt-2">
                    Avg: {formatPrice(stats.revenue.averageOrder)}
                  </p>
                </div>

                {/* Total Users */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-orange-100">Total Users</p>
                    <svg className="w-8 h-8 text-orange-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold">{stats.users.total}</p>
                  <p className="text-sm text-orange-100 mt-2">
                    Admins: {stats.users.admins} | Mods: {stats.users.moderators}
                  </p>
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  📈 Revenue Trend (Last 30 Days)
                </h2>
                <div className="h-64 flex items-end justify-between gap-1">
                  {stats.revenueByDay.length > 0 ? (
                    stats.revenueByDay.map((day, index) => {
                      const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue));
                      const height = (day.revenue / maxRevenue) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer relative"
                            style={{ height: `${height}%` }}
                            title={`${formatDate(day.date)}: ${formatPrice(day.revenue)} (${day.orders} orders)`}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {formatPrice(day.revenue)}
                            </div>
                          </div>
                          {index % 5 === 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 rotate-45 origin-left mt-2">
                              {formatDate(day.date)}
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 w-full text-center">No revenue data yet</p>
                  )}
                </div>
              </div>

              {/* Orders & Products Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Order Status Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    📊 Order Status Distribution
                  </h2>
                  <div className="space-y-4">
                    {[
                      { key: 'pending', label: 'En attente', color: 'bg-yellow-500', count: stats.orders.pending },
                      { key: 'preparation', label: 'En préparation', color: 'bg-blue-500', count: stats.orders.preparation },
                      { key: 'payment_confirmed', label: 'Payé', color: 'bg-green-500', count: stats.orders.payment_confirmed },
                      { key: 'shipped', label: 'Expédiée', color: 'bg-purple-500', count: stats.orders.shipped },
                      { key: 'delivered', label: 'Livrée', color: 'bg-green-600', count: stats.orders.delivered },
                      { key: 'cancelled', label: 'Annulée', color: 'bg-red-500', count: stats.orders.cancelled },
                    ].map((status) => {
                      const percentage = stats.orders.total > 0 
                        ? (status.count / stats.orders.total) * 100 
                        : 0;
                      return (
                        <div key={status.key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">{status.label}</span>
                            <span className="text-gray-900 dark:text-white font-semibold">
                              {status.count} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`${status.color} h-2 rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    🏆 Top Products
                  </h2>
                  <div className="space-y-4">
                    {stats.sales.topProducts.length > 0 ? (
                      stats.sales.topProducts.map((product, index) => {
                        const maxRevenue = stats.sales.topProducts[0]?.revenue || 1;
                        const percentage = (product.revenue / maxRevenue) * 100;
                        return (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {index + 1}. {product.name}
                              </span>
                              <span className="text-gray-900 dark:text-white font-semibold">
                                {formatPrice(product.revenue)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {product.quantity} units sold
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 text-center py-8">No sales data yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders & Product Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      📋 Recent Orders
                    </h2>
                    <Link
                      href="/dashboard/orders"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                          onClick={() => router.push(`/orders/${order._id}`)}
                        >
                          <div>
                            <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColors[order.status as keyof typeof statusColors]}`}>
                              {statusLabels[order.status as keyof typeof statusLabels]}
                            </span>
                            <p className="font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-8">No orders yet</p>
                    )}
                  </div>
                </div>

                {/* Product Alerts */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    ⚠️ Alerts
                  </h2>
                  <div className="space-y-4">
                    {/* Low Stock Alert */}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="font-semibold text-yellow-800 dark:text-yellow-400">Low Stock</p>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-500">
                        {stats.products.lowStock} product{stats.products.lowStock !== 1 ? 's' : ''} low on stock
                      </p>
                    </div>

                    {/* Out of Stock Alert */}
                    {stats.products.outOfStock > 0 && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <p className="font-semibold text-red-800 dark:text-red-400">Out of Stock</p>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-500">
                          {stats.products.outOfStock} product{stats.products.outOfStock !== 1 ? 's' : ''} out of stock
                        </p>
                      </div>
                    )}

                    {/* Pending Orders */}
                    {stats.orders.pending > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-semibold text-blue-800 dark:text-blue-400">Action Required</p>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-500">
                          {stats.orders.pending} pending order{stats.orders.pending !== 1 ? 's' : ''} need processing
                        </p>
                        <Link
                          href="/dashboard/orders"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                        >
                          View orders →
                        </Link>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Quick Stats
                      </p>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <p>• {stats.products.inStock} products in stock</p>
                        <p>• {stats.orders.delivered} orders delivered</p>
                        <p>• Today: {formatPrice(stats.revenue.today)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Regular User View */
            <div className="max-w-2xl mx-auto">
              {/* User Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/products"
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-center"
                  >
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Browse Products</p>
                  </Link>
                  <Link
                    href="/orders"
                    className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition text-center"
                  >
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">My Orders</p>
                  </Link>
                  <Link
                    href="/cart"
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition text-center"
                  >
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Shopping Cart</p>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-center"
                  >
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Logout</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
