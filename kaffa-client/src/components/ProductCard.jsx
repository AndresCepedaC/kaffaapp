import { memo, useRef, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { categoryEmojis } from '../constants';

// Intersection Observer hook for scroll-based animations
function useOnScreen(options) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);
  return [ref, isVisible];
}

function ProductCard({ product, index, addToCart, addedProductId }) {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  const isAdded = addedProductId === product.id;

  return (
    <div
      ref={ref}
      id={`product-card-${product.id}`}
      className={`product-card bg-[#1e1a14] rounded-2xl overflow-hidden border border-[#3a3024]/60 group relative ${
        isVisible ? 'card-visible' : 'card-hidden'
      }`}
      style={{ transitionDelay: `${Math.min((index % 6) * 80, 400)}ms` }}
    >
      {/* Image Section - Gestalt: Proximity - image, title, price form cohesive visual group */}
      <div className="aspect-[4/3] bg-[#141008] img-container relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`absolute inset-0 items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
          <span className="text-6xl opacity-15">{categoryEmojis[product.category?.name] || '☕'}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141008] via-[#141008]/20 to-transparent opacity-90" />

        {/* Price badge - Gestalt: Figure/Ground - price stands out from image */}
        <div className="absolute top-3 right-3 price-badge text-[#e8c87a] px-3 py-1.5 rounded-xl text-sm font-bold">
          ${product.price ? product.price.toLocaleString() : '0'}
        </div>

        {/* Category tag */}
        {product.category && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#141008]/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#3a3024]/30">
            <span className="text-xs">{categoryEmojis[product.category.name] || '📦'}</span>
            <span className="text-[10px] font-medium text-[#c9a96e]/80">{product.category.name}</span>
          </div>
        )}
      </div>

      {/* Info Section - Gestalt: Proximity - name, description, CTA tightly grouped */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1.5 text-[#f0e6d2] group-hover:text-[#e8c87a] transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-[#7a6e5d] text-sm mb-5 line-clamp-2 leading-relaxed">{product.description}</p>
        <button
          id={`add-to-cart-${product.id}`}
          onClick={() => addToCart(product)}
          className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-300 flex items-center justify-center gap-2 btn-add ${
            isAdded
              ? 'bg-[#3d6b4d] text-white border border-[#4d8b5d] added-flash'
              : 'bg-gradient-to-r from-[#6b4d2d] to-[#8b5e35] hover:from-[#7b5d3d] hover:to-[#9b6e45] text-[#f0e6d2] border border-[#8b5e35]/40 hover:border-[#c9a96e]/50 hover:shadow-lg hover:shadow-[#6b4d2d]/30 active:scale-95'
          }`}
        >
          {isAdded ? <>✓ Agregado</> : <><Plus className="w-4 h-4" /> Agregar</>}
        </button>
      </div>
    </div>
  );
}

export default memo(ProductCard);
