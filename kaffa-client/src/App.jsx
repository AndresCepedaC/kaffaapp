import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { createOrder } from './services/api';
import { MENU_GROUPS } from './constants';

// Hooks
import useCart from './hooks/useCart';
import useProducts from './hooks/useProducts';

// Components
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoryNav from './components/CategoryNav';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import Chatbot from './components/Chatbot';
import SEOHead from './components/SEOHead';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [activeGroupName, setActiveGroupName] = useState(MENU_GROUPS[0].name);
  const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);

  // Custom hooks for state management
  const {
    cart, notes, setNotes, includeTip, setIncludeTip, addedProductId,
    addToCart, removeFromCart, updateQuantity, clearCart,
    cartSubtotal, tipAmount, finalTotal, cartItemCount,
  } = useCart();

  const {
    categories, selectedCategory, setSelectedCategory,
    searchTerm, setSearchTerm, isLoading, error, filteredProducts,
  } = useProducts();

  // Scroll header effect
  useEffect(() => {
    const handleScroll = () => setHeaderSolid(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [notification, setNotification] = useState(null);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Checkout handler
  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    const order = {
      items: cart.map(item => ({ product: item.product, quantity: item.quantity })),
      tipOrDiscountPercent: includeTip ? 10.0 : 0.0,
      tip: includeTip,
      notes,
    };
    try {
      const result = await createOrder(order);
      const createdOrder = result.order;
      const printed = result.printed;

      // Show printer feedback
      if (printed) {
        setNotification({ type: 'success', message: `✅ Pedido #${createdOrder.id} creado y comanda impresa.` });
      } else {
        setNotification({ type: 'warning', message: `⚠️ Pedido #${createdOrder.id} creado. No se pudo imprimir la comanda.` });
      }

      // Clear cart and show success modal
      clearCart();
      setIsCartOpen(false);
      setIsOrderSuccessful(true);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: '❌ Error al crear el pedido. Inténtalo de nuevo.' });
    }
  }, [cart, includeTip, notes, cartSubtotal, tipAmount, finalTotal, clearCart]);

  // Dynamic SEO based on selected category
  const currentCategory = useMemo(
    () => categories.find(c => c.id === selectedCategory),
    [categories, selectedCategory]
  );

  const seoTitle = useMemo(() => {
    if (searchTerm) return `Buscar "${searchTerm}" | Kaffa La Aldea`;
    if (currentCategory) return `${currentCategory.name} | Kaffa La Aldea - Café · Cocina · Cocteles`;
    return 'Kaffa La Aldea | Café · Cocina · Cocteles';
  }, [searchTerm, currentCategory]);

  const seoDescription = useMemo(() => {
    if (currentCategory) {
      return `Descubre nuestros productos de ${currentCategory.name} en Kaffa La Aldea. ${currentCategory.description || ''} ¡Ordena en línea!`;
    }
    return 'Kaffa La Aldea - Tu cafetería artesanal favorita. Café de origen, cocina artesanal, cocteles premium, waffles, hamburguesas y más.';
  }, [currentCategory]);

  return (
    <div className="min-h-screen bg-[#0f0c08] text-[#f0e6d2] font-sans selection:bg-[#8b5e35] selection:text-white">
      <SEOHead title={seoTitle} description={seoDescription} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.4); } 50% { box-shadow: 0 0 20px 6px rgba(201,169,110,0.15); } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.08); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes steamRise { 0% { opacity: 0; transform: translateY(0) scaleX(1); } 50% { opacity: 0.6; transform: translateY(-20px) scaleX(1.2); } 100% { opacity: 0; transform: translateY(-40px) scaleX(0.8); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes borderGlow { 0%, 100% { border-color: rgba(201,169,110,0.1); } 50% { border-color: rgba(201,169,110,0.3); } }

        .card-hidden { opacity: 0; transform: translateY(40px) scale(0.96); }
        .card-visible { opacity: 1; transform: translateY(0) scale(1); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
        .cart-slide { animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        .header-anim { animation: slideDown 0.6s ease-out; }
        .pulse-glow { animation: pulseGlow 2.5s infinite; }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .bounce-in { animation: bounceIn 0.5s ease-out; }
        .skeleton { background: linear-gradient(90deg, #1e1a14 25%, #2a2418 50%, #1e1a14 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .product-card { transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1); }
        .product-card:hover { transform: translateY(-10px); box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(201,169,110,0.08); border-color: rgba(201,169,110,0.25); }
        .img-container { overflow: hidden; }
        .img-container img { transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.8s ease; }
        .product-card:hover .img-container img { transform: scale(1.12); filter: brightness(1.1) saturate(1.1); }

        .category-btn { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .category-btn:hover { transform: translateY(-3px); }
        .category-btn.active { transform: translateY(-4px) scale(1.05); }

        .price-badge { background: rgba(20,16,8,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(201,169,110,0.2); }

        .btn-add { position: relative; overflow: hidden; }
        .btn-add::after { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; background: rgba(255,255,255,0.15); border-radius: 50%; transform: translate(-50%, -50%); transition: width 0.4s, height 0.4s; }
        .btn-add:active::after { width: 300px; height: 300px; }

        .added-flash { animation: bounceIn 0.4s ease-out; }

        .hero-title { font-family: 'Playfair Display', serif; }
        .body-font { font-family: 'Inter', sans-serif; }

        .steam { position: absolute; width: 4px; height: 12px; background: rgba(201,169,110,0.3); border-radius: 50%; filter: blur(3px); }
        .steam-1 { animation: steamRise 2.5s ease-out infinite; left: 30%; }
        .steam-2 { animation: steamRise 3s ease-out infinite 0.5s; left: 50%; }
        .steam-3 { animation: steamRise 2.8s ease-out infinite 1s; left: 70%; }

        .text-glow { text-shadow: 0 0 30px rgba(201,169,110,0.3), 0 0 60px rgba(201,169,110,0.1); }
        .border-glow { animation: borderGlow 3s ease-in-out infinite; }

        .marquee-track { animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Header */}
      <Header
        headerSolid={headerSolid}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItemCount={cartItemCount}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />

      <main className="pt-20 pb-28 max-w-6xl mx-auto px-4 body-font">
        {/* Hero & Marquee */}
        {!searchTerm && <HeroBanner />}

        {/* Category Navigation */}
        {!searchTerm && (
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            activeGroupName={activeGroupName}
            setActiveGroupName={setActiveGroupName}
          />
        )}

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          addToCart={addToCart}
          addedProductId={addedProductId}
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
        />
      </main>

      {/* Floating Cart Button (Mobile) */}
      {cartItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bounce-in md:hidden">
          <button
            id="mobile-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="bg-gradient-to-r from-[#c9a96e] to-[#8b5e35] text-[#0f0c08] px-7 py-3.5 rounded-2xl font-bold shadow-2xl shadow-[#8b5e35]/40 flex items-center gap-3 border border-[#c9a96e]/40 active:scale-95 transition-transform"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Ver Pedido ({cartItemCount})</span>
            <span className="bg-[#0f0c08]/20 px-3 py-1 rounded-lg text-sm">
              ${cartSubtotal.toLocaleString()}
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        notes={notes}
        setNotes={setNotes}
        includeTip={includeTip}
        setIncludeTip={setIncludeTip}
        cartSubtotal={cartSubtotal}
        tipAmount={tipAmount}
        finalTotal={finalTotal}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        handleCheckout={handleCheckout}
      />

      {/* Virtual Assistant / Chatbot */}
      <Chatbot />

      {/* Toast Notification (Printer & Order Feedback) */}
      {notification && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[90vw] bounce-in"
          role="alert"
        >
          <div
            className="rounded-2xl px-5 py-4 shadow-2xl border flex items-start gap-3 body-font"
            style={{
              background: notification.type === 'success'
                ? 'linear-gradient(135deg, #1a2e1a 0%, #0f1a0f 100%)'
                : notification.type === 'warning'
                ? 'linear-gradient(135deg, #2e2a1a 0%, #1a1508 100%)'
                : 'linear-gradient(135deg, #2e1a1a 0%, #1a0808 100%)',
              borderColor: notification.type === 'success'
                ? 'rgba(74,222,128,0.3)'
                : notification.type === 'warning'
                ? 'rgba(201,169,110,0.3)'
                : 'rgba(239,68,68,0.3)',
            }}
          >
            <p
              className="flex-1 text-sm font-medium"
              style={{
                color: notification.type === 'success'
                  ? '#4ade80'
                  : notification.type === 'warning'
                  ? '#e8c87a'
                  : '#f87171',
              }}
            >
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className="text-[#7a6e5d] hover:text-[#f0e6d2] transition-colors flex-shrink-0 mt-0.5"
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Success Modal */}
      {isOrderSuccessful && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0f0c08]/80 backdrop-blur-sm transition-opacity">
          <div className="bg-gradient-to-br from-[#1e1a14] to-[#0f0c08] border border-[#c9a96e]/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(201,169,110,0.15)] bounce-in">
            <div className="w-20 h-20 bg-gradient-to-br from-[#c9a96e]/20 to-[#8b5e35]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c9a96e]/30">
              <svg className="w-10 h-10 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-playfair text-[#c9a96e] mb-3">¡Pedido Confirmado!</h2>
            <p className="text-[#a89f91] mb-8 font-inter leading-relaxed">
              Muchas gracias por hacer tu pedido, te lo traeremos lo antes posible.
            </p>
            <button
              onClick={() => setIsOrderSuccessful(false)}
              className="w-full bg-gradient-to-r from-[#c9a96e] to-[#8b5e35] text-[#0f0c08] font-bold py-3.5 px-6 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#8b5e35]/20 outline-none"
            >
              Volver al menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
