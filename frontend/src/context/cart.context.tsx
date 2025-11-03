"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Cart, CartItem } from "@/lib/api/definitions";

interface CartContextType {
    cart: Cart;
    addItemToCart: (item: CartItem) => void;
    removeItemFromCart: (item: CartItem) => void;
    clearCartItem: (item: CartItem) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
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
    // Cart structure from your definitions.ts
    const [cart, setCart] = useState<Cart>({
        items: [],
        total: 0,
        itemCount: 0,
    });

    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);

    // 🔹 Load from localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            const parsed: Cart = JSON.parse(storedCart);
            setCart(parsed);
            setCartCount(parsed.itemCount || 0);
            setCartTotal(parsed.total || 0);
        }
    }, []);

    // 🔹 Save to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // 🔹 Utility function to recalculate totals
    const recalculateCart = (items: CartItem[]) => {
        const count = items.reduce((sum, i) => sum + i.quantity, 0);
        const total = items.reduce(
            (sum, i) => sum + i.productId.prix * i.quantity,
            0
        );
        return { count, total };
    };

    // 🔹 Add or increase item
    const addItemToCart = (newItem: CartItem) => {
        setCart((prev) => {
            const existing = prev.items.find(
                (i) => i.productId._id === newItem.productId._id
            );

            let updatedItems: CartItem[];
            if (existing) {
                updatedItems = prev.items.map((i) =>
                    i.productId._id === newItem.productId._id
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                );
            } else {
                updatedItems = [...prev.items, newItem];
            }

            const { count, total } = recalculateCart(updatedItems);
            setCartCount(count);
            setCartTotal(total);

            return { ...prev, items: updatedItems, countItems: count, total };
        });
    };

    // 🔹 Remove one quantity
    const removeItemFromCart = (item: CartItem) => {
        setCart((prev) => {
            const updatedItems = prev.items
                .map((i) =>
                    i.productId._id === item.productId._id
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0);

            const { count, total } = recalculateCart(updatedItems);
            setCartCount(count);
            setCartTotal(total);

            return { ...prev, items: updatedItems, countItems: count, total };
        });
    };

    // 🔹 Remove item completely
    const clearCartItem = (item: CartItem) => {
        setCart((prev) => {
            const updatedItems = prev.items.filter(
                (i) => i.productId._id !== item.productId._id
            );

            const { count, total } = recalculateCart(updatedItems);
            setCartCount(count);
            setCartTotal(total);

            return { ...prev, items: updatedItems, countItems: count, total };
        });
    };

    // 🔹 Clear everything
    const clearCart = () => {
        const emptyCart: Cart = { items: [], total: 0, itemCount: 0 };
        setCart(emptyCart);
        setCartCount(0);
        setCartTotal(0);
        localStorage.removeItem("cart");
    };

    const value: CartContextType = {
        cart,
        addItemToCart,
        removeItemFromCart,
        clearCartItem,
        clearCart,
        cartCount,
        cartTotal,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
