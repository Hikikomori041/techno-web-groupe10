'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkAuth, User } from '@/lib/auth';
import { ordersApi, type Order } from '@/lib/ordersApi';
import DashboardNav from '@/components/DashboardNav';

const statusLabels = {
  pending: '⏳ En attente',
  preparation: '📦 En préparation',
  payment_confirmed: '💳 Paiement confirmé',
  shipped: '🚚 Expédiée',
  delivered: '✅ Livrée',
  cancelled: '❌ Annulée',
};

const paymentLabels = {
  pending: '⏳ En attente',
  paid: '✅ Payé',
  failed: '❌ Échec',
  refunded: '↩️ Remboursé',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  useEffect(() => {
    checkAuthAndFetchOrders();
  }, []);

  const checkAuthAndFetchOrders = async () => {
    try {
      const result = await checkAuth();
      
      if (!result.authenticated || !result.user) {
        router.push('/login');
        return;
      }

      const hasAccess = result.user.roles.includes('admin') || result.user.roles.includes('moderator');
      if (!hasAccess) {
        setError('Access denied. Admin or Moderator role required.');
        return;
      }

      setUser(result.user);
      await fetchOrders();
    } catch (err) {
      setError('Authentication failed');
      router.push('/login');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await ordersApi.getAllOrders();
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      await ordersApi.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleUpdatePayment = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      await ordersApi.updatePaymentStatus(orderId, newPaymentStatus);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status');
    } finally {
      setUpdatingOrder(null);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending'),
    preparation: orders.filter(o => o.status === 'preparation'),
    payment_confirmed: orders.filter(o => o.status === 'payment_confirmed'),
    shipped: orders.filter(o => o.status === 'shipped'),
    delivered: orders.filter(o => o.status === 'delivered'),
    cancelled: orders.filter(o => o.status === 'cancelled'),
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
                Order Management
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Summary */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${filterStatus === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">⏳ En attente</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {ordersByStatus.pending.length}
              </p>
            </div>
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${filterStatus === 'preparation' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'preparation' ? 'all' : 'preparation')}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">📦 Préparation</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {ordersByStatus.preparation.length}
              </p>
            </div>
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${filterStatus === 'payment_confirmed' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'payment_confirmed' ? 'all' : 'payment_confirmed')}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">💳 Payé</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {ordersByStatus.payment_confirmed.length}
              </p>
            </div>
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${filterStatus === 'shipped' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'shipped' ? 'all' : 'shipped')}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">🚚 Expédiée</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {ordersByStatus.shipped.length}
              </p>
            </div>
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${filterStatus === 'delivered' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'delivered' ? 'all' : 'delivered')}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">✅ Livrée</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {ordersByStatus.delivered.length}
              </p>
            </div>
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${filterStatus === 'cancelled' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'cancelled' ? 'all' : 'cancelled')}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">❌ Annulée</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {ordersByStatus.cancelled.length}
              </p>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vue:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'cards' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Cartes
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Tableau
                </button>
              </div>
            </div>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tout
              </button>
            )}
          </div>
        </div>

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                <div className="text-gray-400 text-4xl mb-2">📦</div>
                <p className="text-gray-500 dark:text-gray-400">Aucune commande trouvée</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Client: {order.userId?.firstName} {order.userId?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Statut de la commande
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={updatingOrder === order._id}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="preparation">📦 En préparation</option>
                        <option value="payment_confirmed">💳 Paiement confirmé</option>
                        <option value="shipped">🚚 Expédiée</option>
                        <option value="delivered">✅ Livrée</option>
                        <option value="cancelled">❌ Annulée</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Statut du paiement
                      </label>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdatePayment(order._id, e.target.value)}
                        disabled={updatingOrder === order._id}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="paid">✅ Payé</option>
                        <option value="failed">❌ Échec</option>
                        <option value="refunded">↩️ Remboursé</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      📍 {order.shippingAddress.city}, {order.shippingAddress.country}
                    </div>
                    <button
                      onClick={() => router.push(`/orders/${order._id}`)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-2">📦</div>
                      <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.userId?.firstName} {order.userId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.userId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(order.total)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="pending">⏳ En attente</option>
                          <option value="preparation">📦 En préparation</option>
                          <option value="payment_confirmed">💳 Paiement confirmé</option>
                          <option value="shipped">🚚 Expédiée</option>
                          <option value="delivered">✅ Livrée</option>
                          <option value="cancelled">❌ Annulée</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleUpdatePayment(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="pending">⏳ En attente</option>
                          <option value="paid">✅ Payé</option>
                          <option value="failed">❌ Échec</option>
                          <option value="refunded">↩️ Remboursé</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/orders/${order._id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

