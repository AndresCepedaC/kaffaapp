import { useState, useEffect, useRef, useCallback } from 'react';
import { getCategories, getProducts, createOrder } from './services/api';
import { ShoppingCart, Plus, Minus, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

const categoryEmojis = {
  "Base de Café": "☕", "Calientes": "🍵", "Coladas": "🥛",
  "Hervidos y Aromáticas": "🫖", "Frías de Café": "🧊",
  "Jugos - Frappés - Malteadas": "🥤", "Sodas Italianas": "🫧",
  "Limonadas Frapée": "🍋", "Smoothies": "🥝", "Funcionales": "💪",
  "Tartas, Waffles y Más": "🧇", "Hojaldrados": "🥐", "Rellenos": "🫓",
  "Cervezas y Bebidas": "🍺", "Cocteles con Licor": "🍹",
  "Cocteles sin Licor": "🧃", "Hamburguesas": "🍔",
  "Picadas y Carnes": "🥩", "Salchipapa": "🌭", "Patacones": "🍌",
  "Para Compartir": "🧀", "Sandwich y Wraps": "🥪", "Desgranados": "🌽",
};

// Intersection Observer hook for scroll-based animations
function useOnScreen(options) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
}

// Animated product card wrapper
function ProductCard({ product, index, addToCart, addedProductId, categoryEmojis }) {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`product-card bg-[#1e1a14] rounded-2xl overflow-hidden border border-[#3a3024]/60 group relative ${isVisible ? 'card-visible' : 'card-hidden'}`}
      style={{ transitionDelay: `${Math.min(index % 6 * 80, 400)}ms` }}
    >
      <div className="aspect-[4/3] bg-[#141008] img-container relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div className={`absolute inset-0 items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
          <span className="text-6xl opacity-15">{categoryEmojis[product.category?.name] || '☕'}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141008] via-[#141008]/20 to-transparent opacity-90" />
        <div className="absolute top-3 right-3 price-badge text-[#e8c87a] px-3 py-1.5 rounded-xl text-sm font-bold">
          ${product.price ? product.price.toLocaleString() : '0'}
        </div>
        {product.category && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#141008]/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#3a3024]/30">
            <span className="text-xs">{categoryEmojis[product.category.name] || '📦'}</span>
            <span className="text-[10px] font-medium text-[#c9a96e]/80">{product.category.name}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1.5 text-[#f0e6d2] group-hover:text-[#e8c87a] transition-colors duration-300">{product.name}</h3>
        <p className="text-[#7a6e5d] text-sm mb-5 line-clamp-2 leading-relaxed">{product.description}</p>
        <button onClick={() => addToCart(product)}
          className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-300 flex items-center justify-center gap-2 btn-add ${addedProductId === product.id
            ? 'bg-[#3d6b4d] text-white border border-[#4d8b5d] added-flash'
            : 'bg-gradient-to-r from-[#6b4d2d] to-[#8b5e35] hover:from-[#7b5d3d] hover:to-[#9b6e45] text-[#f0e6d2] border border-[#8b5e35]/40 hover:border-[#c9a96e]/50 hover:shadow-lg hover:shadow-[#6b4d2d]/30 active:scale-95'
            }`}>
          {addedProductId === product.id ? <>✓ Agregado</> : <><Plus className="w-4 h-4" /> Agregar</>}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [includeTip, setIncludeTip] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [headerSolid, setHeaderSolid] = useState(false);
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setHeaderSolid(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    Promise.all([getCategories(), getProducts()]).then(([catData, prodData]) => {
      setCategories(catData);
      setProducts(prodData);
      if (catData.length > 0) setSelectedCategory(catData[0].id);
      setTimeout(() => setIsLoading(false), 400);
    });
  }, []);

  const filteredProducts = searchTerm
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : (selectedCategory ? products.filter(p => !p.category || p.category.id === selectedCategory) : products);

  const addToCart = useCallback((product) => {
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 900);
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.product.id !== productId));
  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tipAmount = includeTip ? cartSubtotal * 0.10 : 0;
  const finalTotal = cartSubtotal + tipAmount;
  const cartItemCount = cart.reduce((a, b) => a + b.quantity, 0);
  const scrollCategories = (dir) => { if (categoryRef.current) categoryRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' }); };
  const currentCat = categories.find(c => c.id === selectedCategory);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const order = { items: cart.map(item => ({ product: item.product, quantity: item.quantity })), tipOrDiscountPercent: includeTip ? 10.0 : 0.0, tip: includeTip, notes };
    try {
      const createdOrder = await createOrder(order);
      const phoneNumber = "573005054912";
      let message = `Hola! Quisiera realizar el siguiente pedido (Orden #${createdOrder.id}):\n\n`;
      cart.forEach(item => { message += `- ${item.quantity}x ${item.product.name} ($${item.product.price.toLocaleString()})\n`; });
      message += `\nSubtotal: $${cartSubtotal.toLocaleString()}`;
      if (includeTip) message += `\nPropina (10%): $${tipAmount.toLocaleString()}`;
      message += `\n*TOTAL: $${finalTotal.toLocaleString()}*\n`;
      if (notes) message += `\n*Nota / Mesa:* ${notes}`;
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
      setCart([]); setNotes(''); setIncludeTip(false); setIsCartOpen(false);
    } catch (error) { console.error(error); alert("Error al crear el pedido"); }
  };

  return (
    <div className="min-h-screen bg-[#0f0c08] text-[#f0e6d2] font-sans selection:bg-[#8b5e35] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.4); } 50% { box-shadow: 0 0 20px 6px rgba(201,169,110,0.15); } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.08); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes steamRise { 0% { opacity: 0; transform: translateY(0) scaleX(1); } 50% { opacity: 0.6; transform: translateY(-20px) scaleX(1.2); } 100% { opacity: 0; transform: translateY(-40px) scaleX(0.8); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes textReveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
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
      <header className={`fixed top-0 w-full z-50 header-anim transition-all duration-500 ${headerSolid ? 'bg-[#0f0c08]/98 backdrop-blur-xl border-b border-[#c9a96e]/10 shadow-xl shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] p-2.5 rounded-xl shadow-lg shadow-[#8b5e35]/30 float-anim">
                <span className="text-lg">☕</span>
              </div>
              <div className="steam steam-1" style={{ top: '-8px' }}></div>
              <div className="steam steam-2" style={{ top: '-8px' }}></div>
              <div className="steam steam-3" style={{ top: '-8px' }}></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="hero-title text-xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-[#e8c87a] via-[#c9a96e] to-[#a67c4a] bg-clip-text text-transparent">Kaffa</span>
                <span className="text-[#f0e6d2]/60 font-light ml-1">La Aldea</span>
              </h1>
              <p className="text-[7px] uppercase tracking-[0.4em] text-[#c9a96e]/40 font-medium">Café · Cocina · Cocteles</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative group">
            <input type="text" placeholder="¿Qué se te antoja hoy?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1a14]/80 border border-[#3a3024]/50 rounded-2xl py-2.5 pl-11 pr-10 text-[#f0e6d2] placeholder-[#5a4835] focus:outline-none focus:border-[#c9a96e]/40 focus:bg-[#1e1a14] focus:shadow-lg focus:shadow-[#c9a96e]/5 transition-all duration-300 text-sm body-font" />
            <Search className="w-4 h-4 text-[#5a4835] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#c9a96e] transition-colors" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#3a3024]/50 rounded-full transition-colors"><X className="w-3.5 h-3.5 text-[#7a6e5d]" /></button>}
          </div>

          <button onClick={() => setIsCartOpen(!isCartOpen)}
            className={`relative p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 ${cartItemCount > 0 ? 'bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] shadow-lg shadow-[#8b5e35]/30 pulse-glow' : 'hover:bg-[#1e1a14] border border-[#3a3024]/40'}`}>
            <ShoppingCart className={`w-5 h-5 transition-colors ${cartItemCount > 0 ? 'text-[#0f0c08]' : 'text-[#7a6e5d]'}`} />
            {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-[#c94a4a] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0f0c08] bounce-in">{cartItemCount}</span>}
          </button>
        </div>
      </header>

      <main className="pt-20 pb-28 max-w-6xl mx-auto px-4 body-font">

        {/* Hero Banner */}
        {!searchTerm && (
          <div className="mb-10 text-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1a14] via-[#1a1610] to-[#141008] border border-[#3a3024]/30 py-10 px-6 border-glow">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c9a96e 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="relative z-10">
              <p className="text-[#c9a96e]/40 uppercase tracking-[0.5em] text-[9px] font-bold mb-3">Bienvenido a</p>
              <h2 className="hero-title text-4xl sm:text-5xl font-extrabold text-glow mb-2">
                <span className="bg-gradient-to-r from-[#e8c87a] via-[#d4b068] to-[#a67c4a] bg-clip-text text-transparent">Kaffa</span>
                <span className="text-[#f0e6d2]/70 font-light"> La Aldea</span>
              </h2>
              <div className="flex items-center justify-center gap-4 text-[#7a6e5d] text-xs mt-3">
                <span className="flex items-center gap-1.5"><span className="text-base">☕</span> Café de origen</span>
                <span className="w-1 h-1 rounded-full bg-[#3a3024]" />
                <span className="flex items-center gap-1.5"><span className="text-base">🍔</span> Cocina artesanal</span>
                <span className="w-1 h-1 rounded-full bg-[#3a3024]" />
                <span className="flex items-center gap-1.5"><span className="text-base">🍹</span> Cocteles</span>
              </div>
            </div>
          </div>
        )}

        {/* Marquee Banner */}
        {!searchTerm && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6b4d2d]/20 via-[#8b5e35]/10 to-[#6b4d2d]/20 border border-[#3a3024]/20 py-2.5">
            <div className="flex whitespace-nowrap marquee-track">
              {[...Array(2)].map((_, i) => (
                <span key={i} className="text-[#c9a96e]/40 text-xs tracking-widest font-medium">
                  &nbsp;✦ CAFÉ DE ORIGEN &nbsp;✦ COCINA ARTESANAL &nbsp;✦ COCTELES PREMIUM &nbsp;✦ WAFFLES & TARTAS &nbsp;✦ HAMBURGUESAS DE LA ALDEA &nbsp;✦ SMOOTHIES NATURALES &nbsp;✦ HOJALDRADOS FRESCOS &nbsp;✦ LIMONADAS FRAPÉE &nbsp;
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {!searchTerm && (
          <div className="mb-10 relative">
            <h2 className="text-[#c9a96e]/40 uppercase tracking-[0.3em] text-[10px] font-bold mb-4 text-center">
              Nuestro Menú
            </h2>
            <div className="relative flex items-center gap-2">
              <button onClick={() => scrollCategories(-1)} className="hidden md:flex flex-shrink-0 p-2.5 rounded-xl bg-[#1e1a14] border border-[#3a3024]/30 hover:border-[#c9a96e]/30 text-[#7a6e5d] hover:text-[#c9a96e] transition-all hover:shadow-lg hover:shadow-[#c9a96e]/5">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div ref={categoryRef} className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`category-btn snap-center px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold flex items-center gap-2 border ${selectedCategory === cat.id
                      ? 'active bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] border-[#c9a96e]/60 text-[#0f0c08] shadow-xl shadow-[#8b5e35]/30'
                      : 'bg-[#1e1a14]/70 border-[#3a3024]/30 text-[#7a6e5d] hover:border-[#c9a96e]/20 hover:text-[#c9a96e] hover:bg-[#1e1a14]'}`}>
                    <span className="text-base">{categoryEmojis[cat.name] || '📦'}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => scrollCategories(1)} className="hidden md:flex flex-shrink-0 p-2.5 rounded-xl bg-[#1e1a14] border border-[#3a3024]/30 hover:border-[#c9a96e]/30 text-[#7a6e5d] hover:text-[#c9a96e] transition-all hover:shadow-lg hover:shadow-[#c9a96e]/5">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {currentCat && (
              <div className="mt-4 text-center">
                <p className="text-[#c9a96e]/50 text-sm">{categoryEmojis[currentCat.name]} {currentCat.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Search Info */}
        {searchTerm && (
          <div className="mb-8 text-center"><h2 className="text-xl font-bold hero-title text-[#f0e6d2]">Resultados para "{searchTerm}"</h2><p className="text-[#7a6e5d] text-sm mt-1">{filteredProducts.length} productos encontrados</p></div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"><div className="aspect-[4/3] skeleton rounded-t-2xl" /><div className="bg-[#1e1a14] p-5 space-y-3"><div className="h-5 w-2/3 skeleton rounded-lg" /><div className="h-3 w-full skeleton rounded-lg" /><div className="h-10 w-full skeleton rounded-lg mt-3" /></div></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} addToCart={addToCart} addedProductId={addedProductId} categoryEmojis={categoryEmojis} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24"><div className="text-6xl mb-4 opacity-20">🔍</div><p className="text-[#5a4835] text-lg">No se encontraron productos.</p></div>
        )}
      </main>

      {/* Floating Cart (Mobile) */}
      {cartItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bounce-in md:hidden">
          <button onClick={() => setIsCartOpen(true)}
            className="bg-gradient-to-r from-[#c9a96e] to-[#8b5e35] text-[#0f0c08] px-7 py-3.5 rounded-2xl font-bold shadow-2xl shadow-[#8b5e35]/40 flex items-center gap-3 border border-[#c9a96e]/40 active:scale-95 transition-transform">
            <ShoppingCart className="w-5 h-5" />
            <span>Ver Pedido ({cartItemCount})</span>
            <span className="bg-[#0f0c08]/20 px-3 py-1 rounded-lg text-sm">${cartSubtotal.toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-40" onClick={() => setIsCartOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f0c08] border-l border-[#3a3024]/20 z-50 shadow-2xl flex flex-col cart-slide">
            <div className="p-5 border-b border-[#3a3024]/20 flex items-center justify-between bg-[#1e1a14]">
              <h2 className="text-lg font-bold flex items-center gap-3 hero-title">
                <div className="bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] p-2 rounded-xl"><ShoppingCart className="w-4 h-4 text-[#0f0c08]" /></div>
                <span className="bg-gradient-to-r from-[#e8c87a] to-[#c9a96e] bg-clip-text text-transparent">Tu Pedido</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[#3a3024]/30 rounded-xl text-[#7a6e5d] hover:text-[#f0e6d2] transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#5a4835] space-y-4"><div className="text-6xl opacity-15">🛒</div><p className="text-[#7a6e5d]">Tu carrito está vacío</p></div>
              ) : (
                <div className="space-y-2.5">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-[#1e1a14] rounded-xl p-3 flex gap-3 border border-[#3a3024]/20 hover:border-[#3a3024]/40 transition-all duration-300">
                      <div className="w-14 h-14 bg-[#141008] rounded-lg flex-shrink-0 overflow-hidden border border-[#3a3024]/15">
                        {item.product.imageUrl ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><span className="text-xl opacity-20">{categoryEmojis[item.product.category?.name] || '☕'}</span></div>}
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div><h4 className="font-bold text-sm text-[#f0e6d2] truncate">{item.product.name}</h4><p className="text-[#c9a96e] text-xs font-bold">${item.product.price.toLocaleString()}</p></div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-[#141008] rounded-lg border border-[#3a3024]/20">
                            <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 hover:text-[#c9a96e] text-[#7a6e5d] transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="w-6 text-center text-xs font-bold text-[#f0e6d2]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 hover:text-[#c9a96e] text-[#7a6e5d] transition-colors"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="text-xs font-bold text-[#c9a96e] ml-auto">${(item.product.price * item.quantity).toLocaleString()}</span>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-[#5a4835] hover:text-[#c94a4a] p-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-[#3a3024]/20 bg-[#1e1a14] space-y-4">
                <div><label className="block text-[#7a6e5d] text-[10px] font-bold uppercase tracking-widest mb-2">Notas / Mesa</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[#141008] border border-[#3a3024]/20 rounded-xl p-3 text-[#f0e6d2] placeholder-[#5a4835] focus:outline-none focus:border-[#c9a96e]/30 transition-all text-sm resize-none body-font" placeholder="Ej: Mesa 5, sin azúcar..." rows="2" />
                </div>
                <div className="space-y-2 py-2 border-t border-[#3a3024]/15">
                  <div className="flex justify-between text-[#7a6e5d] text-sm"><span>Subtotal</span><span>${cartSubtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-[#f0e6d2] hover:text-[#c9a96e] transition-colors select-none">
                      <input type="checkbox" checked={includeTip} onChange={(e) => setIncludeTip(e.target.checked)} className="w-4 h-4 rounded border-[#3a3024] bg-[#141008] accent-[#c9a96e]" />
                      <span className="text-sm">Propina (10%)</span>
                    </label>
                    <span className={`text-sm font-bold ${includeTip ? 'text-[#c9a96e]' : 'text-[#5a4835]'}`}>+${tipAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#3a3024]/20">
                  <span className="text-[#7a6e5d] uppercase text-[10px] tracking-widest font-bold">Total</span>
                  <span className="text-3xl font-bold hero-title bg-gradient-to-r from-[#e8c87a] to-[#c9a96e] bg-clip-text text-transparent">${finalTotal.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-[#c9a96e] to-[#8b5e35] hover:from-[#d4b478] hover:to-[#9b6e45] text-[#0f0c08] py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-[#8b5e35]/30 active:scale-[0.97] border border-[#c9a96e]/40 flex items-center justify-center gap-2 text-sm">
                  Confirmar y Enviar a WhatsApp
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
