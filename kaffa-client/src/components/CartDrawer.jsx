import { memo, useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Sparkles } from 'lucide-react';
import { categoryEmojis } from '../constants';
import { getRecommendations } from '../services/api';

function CartItem({ item, updateQuantity, removeFromCart }) {
  return (
    <div className="bg-[#1e1a14] rounded-xl p-3 flex gap-3 border border-[#3a3024]/20 hover:border-[#3a3024]/40 transition-all duration-300">
      <div className="w-14 h-14 bg-[#141008] rounded-lg flex-shrink-0 overflow-hidden border border-[#3a3024]/15">
        {item.product.imageUrl ? (
          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl opacity-20">{categoryEmojis[item.product.category?.name] || '☕'}</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h4 className="font-bold text-sm text-[#f0e6d2] truncate">{item.product.name}</h4>
          <p className="text-[#c9a96e] text-xs font-bold">${item.product.price.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#141008] rounded-lg border border-[#3a3024]/20">
            <button
              onClick={() => updateQuantity(item.product.id, -1)}
              className="p-1.5 hover:text-[#c9a96e] text-[#7a6e5d] transition-colors"
              aria-label="Reducir cantidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-[#f0e6d2]">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, 1)}
              className="p-1.5 hover:text-[#c9a96e] text-[#7a6e5d] transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs font-bold text-[#c9a96e] ml-auto">
            ${(item.product.price * item.quantity).toLocaleString()}
          </span>
          <button
            onClick={() => removeFromCart(item.product.id)}
            className="text-[#5a4835] hover:text-[#c94a4a] p-1 transition-colors"
            aria-label={`Eliminar ${item.product.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Cross-selling recommendation section
function CrossSellSection({ cart, addToCart }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (cart.length === 0) {
      setRecommendations([]);
      return;
    }
    const productIds = cart.map(item => item.product.id);
    getRecommendations(productIds)
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [cart]);

  if (recommendations.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-[#3a3024]/15">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#e8c87a]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9a96e]/70">
          También te podría interesar
        </h4>
      </div>
      <div className="space-y-2">
        {recommendations.map(product => (
          <div
            key={product.id}
            className="flex items-center gap-3 bg-[#1e1a14]/60 rounded-xl p-2.5 border border-[#3a3024]/15 hover:border-[#c9a96e]/20 transition-all group/rec"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#141008] border border-[#3a3024]/10">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm opacity-20">{categoryEmojis[product.category?.name] || '☕'}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#f0e6d2] truncate group-hover/rec:text-[#e8c87a] transition-colors">
                {product.name}
              </p>
              <p className="text-[10px] text-[#c9a96e]/60">${product.price?.toLocaleString()}</p>
            </div>
            <button
              onClick={() => addToCart(product)}
              className="p-1.5 rounded-lg bg-[#6b4d2d]/50 hover:bg-[#8b5e35] text-[#c9a96e] hover:text-white transition-all flex-shrink-0"
              aria-label={`Agregar ${product.name}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  notes,
  setNotes,
  includeTip,
  setIncludeTip,
  cartSubtotal,
  tipAmount,
  finalTotal,
  updateQuantity,
  removeFromCart,
  addToCart,
  handleCheckout,
}) {
  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop - Gestalt: Figure/Ground - darkens background to elevate cart */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-40"
        onClick={() => setIsCartOpen(false)}
        aria-label="Cerrar carrito"
      />

      {/* Cart Panel - Gestalt: Figure/Ground - elevated surface with strong borders and glow */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col cart-slide"
        style={{
          background: 'linear-gradient(180deg, #151110 0%, #0f0c08 50%, #0d0a07 100%)',
          borderLeft: '1px solid rgba(201,169,110,0.15)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.6), -2px 0 20px rgba(201,169,110,0.05)',
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#c9a96e]/10 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1e1a14 0%, #171310 100%)' }}>
          <h2 className="text-lg font-bold flex items-center gap-3 hero-title">
            <div className="bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] p-2 rounded-xl shadow-md shadow-[#8b5e35]/30">
              <ShoppingCart className="w-4 h-4 text-[#0f0c08]" />
            </div>
            <span className="bg-gradient-to-r from-[#e8c87a] to-[#c9a96e] bg-clip-text text-transparent">
              Tu Pedido
            </span>
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-[#3a3024]/30 rounded-xl text-[#7a6e5d] hover:text-[#f0e6d2] transition-all"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#5a4835] space-y-4">
              <div className="text-6xl opacity-15">🛒</div>
              <p className="text-[#7a6e5d]">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cart.map(item => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cross-selling section */}
        {cart.length > 0 && <CrossSellSection cart={cart} addToCart={addToCart} />}

        {/* Checkout Footer - Gestalt: Figure/Ground - checkout area visually elevated */}
        {cart.length > 0 && (
          <div
            className="p-5 space-y-4"
            style={{
              background: 'linear-gradient(135deg, #1e1a14 0%, #171310 100%)',
              borderTop: '1px solid rgba(201,169,110,0.15)',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <label className="block text-[#7a6e5d] text-[10px] font-bold uppercase tracking-widest mb-2">
                Notas / Mesa
              </label>
              <textarea
                id="cart-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#141008] border border-[#3a3024]/20 rounded-xl p-3 text-[#f0e6d2] placeholder-[#5a4835] focus:outline-none focus:border-[#c9a96e]/30 transition-all text-sm resize-none body-font"
                placeholder="Ej: Mesa 5, sin azúcar..."
                rows="2"
              />
            </div>
            <div className="space-y-2 py-2 border-t border-[#3a3024]/15">
              <div className="flex justify-between text-[#7a6e5d] text-sm">
                <span>Subtotal</span>
                <span>${cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer text-[#f0e6d2] hover:text-[#c9a96e] transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={includeTip}
                    onChange={(e) => setIncludeTip(e.target.checked)}
                    className="w-4 h-4 rounded border-[#3a3024] bg-[#141008] accent-[#c9a96e]"
                  />
                  <span className="text-sm">Propina (10%)</span>
                </label>
                <span className={`text-sm font-bold ${includeTip ? 'text-[#c9a96e]' : 'text-[#5a4835]'}`}>
                  +${tipAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-[#3a3024]/20">
              <span className="text-[#7a6e5d] uppercase text-[10px] tracking-widest font-bold">Total</span>
              <span className="text-3xl font-bold hero-title bg-gradient-to-r from-[#e8c87a] to-[#c9a96e] bg-clip-text text-transparent">
                ${finalTotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout CTA - Gestalt: Figure/Ground - glowing, prominent button */}
            <button
              id="checkout-btn"
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-[#c9a96e] to-[#8b5e35] hover:from-[#d4b478] hover:to-[#9b6e45] text-[#0f0c08] py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-[#8b5e35]/30 active:scale-[0.97] border border-[#c9a96e]/40 flex items-center justify-center gap-2 text-sm pulse-glow"
            >
              Confirmar y Enviar a WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(CartDrawer);
