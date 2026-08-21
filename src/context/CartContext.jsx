import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('sync_cart');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('sync_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedModel = 'iPhone 15 Pro') => {
    const modelToUse = selectedModel || product.selectedModel || 'iPhone 15 Pro';
    const cartItemId = `${product.id}-${modelToUse}`;

    setCart((prev) => {
      const existing = prev.find(
        (item) => (item.cartItemId || `${item.id}-${item.selectedModel || 'iPhone 15 Pro'}`) === cartItemId
      );
      if (existing) {
        return prev.map((item) =>
          (item.cartItemId || `${item.id}-${item.selectedModel || 'iPhone 15 Pro'}`) === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartItemId,
          selectedModel: modelToUse,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const idToMatch = item.cartItemId || item.id;
        return idToMatch === cartItemId ? { ...item, quantity } : item;
      })
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) =>
      prev.filter((item) => {
        const idToMatch = item.cartItemId || item.id;
        return idToMatch !== cartItemId;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
