import { memo, useState, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import SearchBar from './SearchBar';

/**
 * Header — Public-facing header.
 * The dashboard button has been REMOVED from public UI.
 * Admin access only via hidden triple-tap on logo or direct state trigger.
 */
function Header({ headerSolid, searchTerm, setSearchTerm, cartItemCount, isCartOpen, setIsCartOpen, showDashboard, setShowDashboard }) {
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState(null);

  // Hidden admin access — triple-tap logo 
  const handleLogoTap = useCallback(() => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimer) clearTimeout(tapTimer);

    if (newCount >= 5) {
      setShowDashboard(true);
      setTapCount(0);
      return;
    }

    const timer = setTimeout(() => setTapCount(0), 1500);
    setTapTimer(timer);
  }, [tapCount, tapTimer, setShowDashboard]);

  return (
    <header
      className={`fixed top-0 w-full z-50 header-anim transition-all duration-500 ${
        headerSolid
          ? 'bg-[#0f0c08]/98 backdrop-blur-xl border-b border-[#c9a96e]/10 shadow-xl shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo — 5-tap opens admin */}
        <div
          className="flex items-center gap-3 flex-shrink-0 cursor-pointer select-none"
          onClick={handleLogoTap}
        >
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
              <span className="bg-gradient-to-r from-[#e8c87a] via-[#c9a96e] to-[#a67c4a] bg-clip-text text-transparent">
                Kaffa
              </span>
              <span className="text-[#f0e6d2]/60 font-light ml-1">La Aldea</span>
            </h1>
            <p className="text-[7px] uppercase tracking-[0.4em] text-[#c9a96e]/40 font-medium">
              Café · Cocina · Cocteles
            </p>
          </div>
        </div>

        {/* Search (hidden when on dashboard) */}
        {!showDashboard && (
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cart Button — Only visible when NOT in dashboard */}
          {!showDashboard && (
            <button
              id="cart-toggle-btn"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className={`relative p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 ${
                cartItemCount > 0
                  ? 'bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] shadow-lg shadow-[#8b5e35]/30 pulse-glow'
                  : 'hover:bg-[#1e1a14] border border-[#3a3024]/40'
              }`}
              aria-label={`Carrito (${cartItemCount} items)`}
            >
              <ShoppingCart className={`w-5 h-5 transition-colors ${cartItemCount > 0 ? 'text-[#0f0c08]' : 'text-[#7a6e5d]'}`} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#c94a4a] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0f0c08] bounce-in">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
