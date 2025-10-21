import {createContext, useEffect, useState} from "react";

const addCartItem = (cartItems, item) => {
    // find if cartItems contains item
    const existItem = cartItems.find((cartItem) => cartItem.id === item.id)

    // if found, increment the quantity
    if (existItem) {
        return cartItems.map((cartItem) => cartItem.id === item.id ? {
            ...cartItem,
            quantity: cartItem.quantity + 1
        } : cartItem)
    }

    // return new array with modify cartItems / new cart item
    return [...cartItems, {...item, quantity: 1}]
}

const removeCartItem = (cartItems, item) => {
    return cartItems
        .map((cartItem) =>
            cartItem.id === item.id
                ? {...cartItem, quantity: cartItem.quantity - 1}
                : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0);
}

const clearCartItems = (cartItems, item) => {
    return cartItems.filter((cartItem) => cartItem.id !== item.id)
}

export const CartContext = createContext({
    isCartOpen: false,
    setIsCartOpen: () => {
    },
    cartItems: [],
    cartCount: 0,
    addItemToCart: () => {
    },
    removeItemFromCart: () => {
    },
    clearCartItem: () => {
    },
    cartTotal: 0
})

export const CartProvider = ({children}) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([])
    const [cartCount, setCartCount] = useState(0)
    const [cartTotal, setCartTotal] = useState(0)

    useEffect(() => {
        const newCartCount = cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0)
        setCartCount(newCartCount)
        const newCartTotal = cartItems.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0)
        setCartTotal(newCartTotal)
    }, [cartItems])

    const addItemToCart = (item) => {
        setCartItems(addCartItem(cartItems, item))
    }

    const removeItemFromCart = (item) => {
        setCartItems(removeCartItem(cartItems, item))
    }

    const clearCartItem = (item) => {
        setCartItems(clearCartItems(cartItems, item))
    }

    const value = {
        isCartOpen,
        setIsCartOpen,
        cartItems,
        addItemToCart,
        cartCount,
        removeItemFromCart,
        clearCartItem,
        cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}