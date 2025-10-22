'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi, type Order } from '@/lib/ordersApi';

const statusLabels = {
  pending: 'En attente',
  preparation: 'En préparation',
  payment_confirmed: 'Paiement confirmé',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const statusColors = {
  pending: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  preparation: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  payment_confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
};

const paymentLabels = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échec',
  refunded: 'Remboursé',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderData = await ordersApi.getOrderById(orderId);
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande?')) {
      return;
    }

    try {
      setCancelling(true);
      await ordersApi.cancelOrder(orderId);
      await fetchOrder();
      alert('Commande annulée avec succès');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (status: string) => {
    return ['pending', 'preparation', 'payment_confirmed'].includes(status);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Commande introuvable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Cette commande n\'existe pas.'}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Mes commandes
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
                onClick={() => router.push('/orders')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {order.orderNumber}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Commandé le {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Suivi de commande
              </h2>
              <div className="space-y-3">
                {['pending', 'preparation', 'payment_confirmed', 'shipped', 'delivered'].map((status, index) => {
                  const isComplete = ['pending', 'preparation', 'payment_confirmed', 'shipped', 'delivered']
                    .indexOf(order.status) >= index;
                  const isCurrent = order.status === status;
                  
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isComplete 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {isComplete ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isCurrent 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : isComplete 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-400'
                        }`}>
                          {statusLabels[status as keyof typeof statusLabels]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Articles commandés
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantité: {item.quantity} × {formatPrice(item.productPrice)}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Total */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Récapitulatif
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span className="text-green-600 dark:text-green-400">Gratuite</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paiement</p>
                <p className={`font-semibold ${
                  order.paymentStatus === 'paid' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {paymentLabels[order.paymentStatus]}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Adresse de livraison
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                {order.shippingAddress.country}
              </p>
            </div>

            {/* Cancel Button */}
            {canCancel(order.status) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
              >
                {cancelling ? 'Annulation...' : 'Annuler la commande'}
              </button>
            )}

            <button
              onClick={() => router.push('/orders')}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              ← Mes commandes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

