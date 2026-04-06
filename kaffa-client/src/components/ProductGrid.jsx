import { memo } from 'react';
import ProductCard from './ProductCard';

function ProductGrid({ products, addToCart, addedProductId, isLoading, error, searchTerm }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] skeleton rounded-t-2xl" />
            <div className="bg-[#1e1a14] p-5 space-y-3">
              <div className="h-5 w-2/3 skeleton rounded-lg" />
              <div className="h-3 w-full skeleton rounded-lg" />
              <div className="h-10 w-full skeleton rounded-lg mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 bg-[#1e1a14]/50 rounded-3xl border border-[#c94a4a]/20">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-[#f0e6d2] mb-2">Error de conexión</h3>
        <p className="text-[#7a6e5d] max-w-md mx-auto px-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-[#c9a96e] text-[#0f0c08] rounded-xl font-bold hover:bg-[#d4b478] transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4 opacity-20">🔍</div>
        <p className="text-[#5a4835] text-lg">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <>
      {searchTerm && (
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold hero-title text-[#f0e6d2]">
            Resultados para "{searchTerm}"
          </h2>
          <p className="text-[#7a6e5d] text-sm mt-1">
            {products.length} productos encontrados
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            addToCart={addToCart}
            addedProductId={addedProductId}
          />
        ))}
      </div>
    </>
  );
}

export default memo(ProductGrid);
