const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CartItem {
  _id: string;
  productId: {
    _id: string;
    nom: string;
    prix: number;
    description?: string;
    images?: string[];
    id_categorie: number;
  };
  quantity: number;
  subtotal: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export const cartApi = {
  // Add product to cart
  addToCart: async (productId: string, quantity: number = 1): Promise<CartItem> => {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add to cart');
    }

    return response.json();
  },

  // Get user's cart
  getCart: async (): Promise<Cart> => {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Return empty cart if not authenticated
        return { items: [], total: 0, itemCount: 0 };
      }
      throw new Error('Failed to fetch cart');
    }

    return response.json();
  },

  // Update cart item quantity
  updateQuantity: async (productId: string, quantity: number): Promise<any> => {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }

    return response.json();
  },

  // Remove item from cart
  removeItem: async (productId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to remove item');
    }
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  },
};

