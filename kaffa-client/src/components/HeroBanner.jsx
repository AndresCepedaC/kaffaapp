import { memo } from 'react';

function HeroBanner() {
  return (
    <>
      {/* Hero Banner */}
      <div className="mb-10 text-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1a14] via-[#1a1610] to-[#141008] border border-[#3a3024]/30 py-10 px-6 border-glow">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #c9a96e 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10">
          <p className="text-[#c9a96e]/40 uppercase tracking-[0.5em] text-[9px] font-bold mb-3">
            Bienvenido a
          </p>
          <h2 className="hero-title text-4xl sm:text-5xl font-extrabold text-glow mb-2">
            <span className="bg-gradient-to-r from-[#e8c87a] via-[#d4b068] to-[#a67c4a] bg-clip-text text-transparent">
              Kaffa
            </span>
            <span className="text-[#f0e6d2]/70 font-light"> La Aldea</span>
          </h2>
          <div className="flex items-center justify-center gap-4 text-[#7a6e5d] text-xs mt-3">
            <span className="flex items-center gap-1.5">
              <span className="text-base">☕</span> Café de origen
            </span>
            <span className="w-1 h-1 rounded-full bg-[#3a3024]" />
            <span className="flex items-center gap-1.5">
              <span className="text-base">🍔</span> Cocina artesanal
            </span>
            <span className="w-1 h-1 rounded-full bg-[#3a3024]" />
            <span className="flex items-center gap-1.5">
              <span className="text-base">🍹</span> Cocteles
            </span>
          </div>
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6b4d2d]/20 via-[#8b5e35]/10 to-[#6b4d2d]/20 border border-[#3a3024]/20 py-2.5">
        <div className="flex whitespace-nowrap marquee-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="text-[#c9a96e]/40 text-xs tracking-widest font-medium">
              &nbsp;✦ CAFÉ DE ORIGEN &nbsp;✦ COCINA ARTESANAL &nbsp;✦ COCTELES PREMIUM &nbsp;✦ WAFFLES &
              TARTAS &nbsp;✦ HAMBURGUESAS DE LA ALDEA &nbsp;✦ SMOOTHIES NATURALES &nbsp;✦ HOJALDRADOS
              FRESCOS &nbsp;✦ LIMONADAS FRAPÉE &nbsp;
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export default memo(HeroBanner);
