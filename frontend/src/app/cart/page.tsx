'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi, type Cart, type CartItem } from '@/lib/cartApi';
import { ordersApi, type ShippingAddress } from '@/lib/ordersApi';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch (err: any) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      
      if (newQuantity === 0) {
        await cartApi.removeItem(productId);
      } else {
        await cartApi.updateQuantity(productId, newQuantity);
      }
      
      await fetchCart();
      // Dispatch custom event for other components
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce produit du panier?')) {
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      await cartApi.removeItem(productId);
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider le panier?')) {
      return;
    }

    try {
      setLoading(true);
      await cartApi.clearCart();
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err: any) {
      alert(err.message || 'Failed to clear cart');
      setLoading(false);
    }
  };

  const handleValidateCart = () => {
    if (!cart || cart.items.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    setShowAddressModal(true);
  };

  const handleCreateOrder = async () => {
    if (!address.street || !address.city || !address.postalCode || !address.country) {
      alert('Veuillez remplir tous les champs de l\'adresse');
      return;
    }

    try {
      setCreatingOrder(true);
      const order = await ordersApi.createOrder(address);
      
      // Clear local cart state
      setCart({ items: [], total: 0, itemCount: 0 });
      
      // Dispatch cart update event
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Close modal
      setShowAddressModal(false);
      
      // Redirect to confirmation page
      router.push(`/orders/confirmation?orderId=${order._id}`);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la commande');
    } finally {
      setCreatingOrder(false);
    }
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du panier...</p>
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
            onClick={fetchCart}
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
                Mon Panier
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {cart?.items.length || 0} article{(cart?.items.length || 0) > 1 ? 's' : ''} dans votre panier
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/products')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Continuer les achats
              </button>
              {cart && cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  Vider le panier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {cart && cart.items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Votre panier est vide
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ajoutez des produits pour commencer vos achats
            </p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Découvrir nos produits
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart?.items.map((item) => {
                const isUpdating = updatingItems.has(item.productId._id);
                return (
                  <div
                    key={item._id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${isUpdating ? 'opacity-50' : ''}`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
                          {item.productId.images && item.productId.images.length > 0 ? (
                            <img
                              src={item.productId.images[0]}
                              alt={item.productId.nom}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <svg
                              className="w-12 h-12 text-white opacity-50"
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
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.productId.nom}
                        </h3>
                        {item.productId.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {item.productId.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Prix unitaire: {formatPrice(item.productId.prix)}
                        </p>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.productId._id)}
                          disabled={isUpdating}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition disabled:opacity-50"
                          title="Retirer du panier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={isUpdating}
                            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Récapitulatif
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sous-total ({cart?.itemCount} articles)</span>
                    <span>{formatPrice(cart?.total || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Livraison</span>
                    <span className="text-green-600 dark:text-green-400">Gratuite</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="text-blue-600 dark:text-blue-400">{formatPrice(cart?.total || 0)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleValidateCart}
                  disabled={!cart || cart.items.length === 0}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Valider le panier
                </button>

                <button
                  onClick={() => router.push('/products')}
                  className="w-full mt-3 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Continuer mes achats
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Paiement sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Livraison gratuite</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Retour sous 30 jours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Adresse de livraison
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rue *
                </label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="75001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pays *
                </label>
                <input
                  type="text"
                  required
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="France"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total à payer</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(cart?.total || 0)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateOrder}
                disabled={creatingOrder}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {creatingOrder ? 'Création en cours...' : 'Confirmer la commande'}
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                disabled={creatingOrder}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

