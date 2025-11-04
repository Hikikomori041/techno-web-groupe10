"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Cart, CartItem, Product } from "@/lib/api/definitions";
import { cartService } from "@/lib/api/services/cart.service";
import { authService } from "@/lib/api/services/auth.service";
import { productsService } from "@/lib/api/services/products.service";
import { toast } from "sonner";

interface CartContextType {
    cart: Cart;
    addItemToCart: (productId: string, quantity?: number) => Promise<void>;
    removeItemFromCart: (productId: string) => Promise<void>;
    updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    syncCartOnLogin: () => Promise<void>;
    cartCount: number;
    cartTotal: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState<Cart>({
        items: [],
        total: 0,
        itemCount: 0,
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);

    // Update cart statistics
    const updateCartStats = useCallback((updatedCart: Cart) => {
        setCartCount(updatedCart.itemCount || 0);
        setCartTotal(updatedCart.total || 0);
    }, []);

    // Recalculate local cart totals
    const recalculateLocalCart = useCallback((items: CartItem[]): Cart => {
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        return { items, total, itemCount };
    }, []);

    // Load cart from backend
    const loadCartFromBackend = useCallback(async () => {
        try {
            const backendCart = await cartService.getCart();
            setCart(backendCart);
            updateCartStats(backendCart);
        } catch (error) {
            console.error("Error loading cart from backend:", error);
            throw error;
        }
    }, [updateCartStats]);

    // Load cart from localStorage
    const loadCartFromLocalStorage = useCallback(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            try {
                const parsed: Cart = JSON.parse(storedCart);
                setCart(parsed);
                updateCartStats(parsed);
            } catch (error) {
                console.error("Error parsing cart from localStorage:", error);
            }
        }
    }, [updateCartStats]);

    // Check authentication status and load cart
    useEffect(() => {
        const initializeCart = async () => {
            try {
                const authCheck = await authService.isAuthenticated();
                setIsAuthenticated(authCheck.authenticated);

                if (authCheck.authenticated) {
                    await loadCartFromBackend();
                } else {
                    loadCartFromLocalStorage();
                }
            } catch (error) {
                console.error("Error initializing cart:", error);
                loadCartFromLocalStorage();
            } finally {
                setIsLoading(false);
            }
        };

        initializeCart();
    }, [loadCartFromBackend, loadCartFromLocalStorage]);

    // Save to localStorage (only for guests)
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isAuthenticated, isLoading]);

    // Sync local cart to backend when user logs in
    const syncCartOnLogin = useCallback(async () => {
        const localCartData = localStorage.getItem('cart');

        if (!localCartData) {
            // No local cart, just load from backend
            await loadCartFromBackend();
            return;
        }

        try {
            const localCart: Cart = JSON.parse(localCartData);

            if (localCart.items.length > 0) {
                console.log('Syncing local cart to backend...');

                // Add each item from local cart to backend
                const syncPromises = localCart.items.map(item =>
                    cartService.addToCart(item.productId._id, item.quantity)
                        .catch(err => console.error(`Failed to sync ${item.productId.nom}:`, err))
                );

                await Promise.all(syncPromises);

                // Clear local storage after sync
                localStorage.removeItem('cart');

                // Reload cart from backend
                await loadCartFromBackend();

                toast.success('Your cart has been synced!');
            } else {
                // Empty local cart, just load from backend
                await loadCartFromBackend();
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
            toast.error('Failed to sync cart');
            // Still try to load from backend
            await loadCartFromBackend();
        }
    }, [loadCartFromBackend]);

    // Add item to cart
    const addItemToCart = async (productId: string, quantity: number = 1) => {
        try {
            if (isAuthenticated) {
                // Add to backend
                await cartService.addToCart(productId, quantity);
                await loadCartFromBackend();
                toast.success("Item added to cart");
            } else {
                // Add to local cart (guest)
                // Fetch product details first
                const product = await productsService.getProductById(productId);

                setCart((prev) => {
                    const existingItemIndex = prev.items.findIndex(
                        item => item.productId._id === productId
                    );

                    let updatedItems: CartItem[];

                    if (existingItemIndex > -1) {
                        // Update existing item
                        updatedItems = prev.items.map((item, index) => {
                            if (index === existingItemIndex) {
                                const newQuantity = item.quantity + quantity;
                                return {
                                    ...item,
                                    quantity: newQuantity,
                                    subtotal: product.prix * newQuantity
                                };
                            }
                            return item;
                        });
                    } else {
                        // Add new item
                        const newItem: CartItem = {
                            _id: `local-${Date.now()}`,
                            productId: {
                                _id: product._id,
                                nom: product.nom,
                                prix: product.prix,
                                description: product.description,
                                images: product.images,
                                id_categorie: product.id_categorie
                            },
                            quantity,
                            subtotal: product.prix * quantity,
                            addedAt: new Date().toISOString()
                        };
                        updatedItems = [...prev.items, newItem];
                    }

                    const newCart = recalculateLocalCart(updatedItems);
                    updateCartStats(newCart);
                    return newCart;
                });

                toast.success("Item added to cart");
                toast.info("Sign in to save your cart", { duration: 3000 });
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);
            toast.error("Failed to add item to cart");
        }
    };

    // Remove item from cart
    const removeItemFromCart = async (productId: string) => {
        try {
            if (isAuthenticated) {
                await cartService.removeFromCart(productId);
                await loadCartFromBackend();
                toast.success("Item removed from cart");
            } else {
                // Remove from local cart
                setCart((prev) => {
                    const updatedItems = prev.items.filter(
                        (item) => item.productId._id !== productId
                    );
                    const newCart = recalculateLocalCart(updatedItems);
                    updateCartStats(newCart);
                    return newCart;
                });
                toast.success("Item removed from cart");
            }
        } catch (error) {
            console.error("Error removing item from cart:", error);
            toast.error("Failed to remove item from cart");
        }
    };

    // Update item quantity
    const updateItemQuantity = async (productId: string, quantity: number) => {
        try {
            if (quantity <= 0) {
                await removeItemFromCart(productId);
                return;
            }

            if (isAuthenticated) {
                await cartService.updateQuantity(productId, quantity);
                await loadCartFromBackend();
            } else {
                // Update local cart
                setCart((prev) => {
                    const updatedItems = prev.items.map((item) =>
                        item.productId._id === productId
                            ? {
                                ...item,
                                quantity,
                                subtotal: item.productId.prix * quantity
                            }
                            : item
                    );
                    const newCart = recalculateLocalCart(updatedItems);
                    updateCartStats(newCart);
                    return newCart;
                });
            }
        } catch (error) {
            console.error("Error updating item quantity:", error);
            toast.error("Failed to update quantity");
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            if (isAuthenticated) {
                await cartService.clearCart();
                const emptyCart: Cart = { items: [], total: 0, itemCount: 0 };
                setCart(emptyCart);
                updateCartStats(emptyCart);
                toast.success("Cart cleared");
            } else {
                const emptyCart: Cart = { items: [], total: 0, itemCount: 0 };
                setCart(emptyCart);
                updateCartStats(emptyCart);
                localStorage.removeItem("cart");
                toast.success("Cart cleared");
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            toast.error("Failed to clear cart");
        }
    };

    const value: CartContextType = {
        cart,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        syncCartOnLogin,
        cartCount,
        cartTotal,
        isLoading,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};