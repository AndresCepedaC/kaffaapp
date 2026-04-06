import { useState, useCallback, useMemo } from 'react';

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [includeTip, setIncludeTip] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);

  const addToCart = useCallback((product) => {
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 900);
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setNotes('');
    setIncludeTip(false);
  }, []);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const tipAmount = useMemo(
    () => (includeTip ? cartSubtotal * 0.10 : 0),
    [includeTip, cartSubtotal]
  );

  const finalTotal = useMemo(
    () => cartSubtotal + tipAmount,
    [cartSubtotal, tipAmount]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((a, b) => a + b.quantity, 0),
    [cart]
  );

  return {
    cart,
    notes,
    setNotes,
    includeTip,
    setIncludeTip,
    addedProductId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    tipAmount,
    finalTotal,
    cartItemCount,
  };
}
