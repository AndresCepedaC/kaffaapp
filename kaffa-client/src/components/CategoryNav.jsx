import { memo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryEmojis, MENU_GROUPS } from '../constants';

function CategoryNav({
  categories,
  selectedCategory,
  setSelectedCategory,
  activeGroupName,
  setActiveGroupName,
}) {
  const categoryRef = useRef(null);

  const scrollCategories = (dir) => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  const currentCat = categories.find(c => c.id === selectedCategory);

  return (
    <div className="mb-10 relative">
      <h2 className="text-[#c9a96e]/40 uppercase tracking-[0.3em] text-[10px] font-bold mb-4 text-center">
        Nuestro Menú
      </h2>

      {/* Main Groups */}
      <div className="flex justify-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {MENU_GROUPS.map(group => (
          <button
            key={group.name}
            id={`group-btn-${group.name.replace(/\s/g, '-').toLowerCase()}`}
            onClick={() => {
              setActiveGroupName(group.name);
              const firstCat = categories.find(c => group.categories.includes(c.name));
              if (firstCat) setSelectedCategory(firstCat.id);
            }}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 min-w-[100px] border ${
              activeGroupName === group.name
                ? 'bg-gradient-to-br from-[#c9a96e]/20 to-[#8b5e35]/10 border-[#c9a96e]/40 shadow-lg shadow-[#8b5e35]/5 scale-105'
                : 'bg-[#1e1a14]/40 border-[#3a3024]/30 text-[#7a6e5d] hover:border-[#c9a96e]/20 hover:bg-[#1e1a14]'
            }`}
          >
            <span className="text-2xl">{group.icon}</span>
            <span className={`text-xs font-bold tracking-wider uppercase ${activeGroupName === group.name ? 'text-[#e8c87a]' : ''}`}>
              {group.name}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-categories */}
      <div className="relative flex items-center gap-2">
        <button
          onClick={() => scrollCategories(-1)}
          className="hidden md:flex flex-shrink-0 p-2.5 rounded-xl bg-[#1e1a14] border border-[#3a3024]/30 hover:border-[#c9a96e]/30 text-[#7a6e5d] hover:text-[#c9a96e] transition-all hover:shadow-lg hover:shadow-[#c9a96e]/5"
          aria-label="Anterior categoría"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div
          ref={categoryRef}
          className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory flex-1 justify-center"
        >
          {categories
            .filter(cat => MENU_GROUPS.find(g => g.name === activeGroupName)?.categories.includes(cat.name))
            .map(cat => (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-btn snap-center px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold flex items-center gap-2 border ${
                  selectedCategory === cat.id
                    ? 'active bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] border-[#c9a96e]/60 text-[#0f0c08] shadow-xl shadow-[#8b5e35]/30'
                    : 'bg-[#1e1a14]/70 border-[#3a3024]/30 text-[#7a6e5d] hover:border-[#c9a96e]/20 hover:text-[#c9a96e] hover:bg-[#1e1a14]'
                }`}
              >
                <span className="text-base">{categoryEmojis[cat.name] || '📦'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
        </div>
        <button
          onClick={() => scrollCategories(1)}
          className="hidden md:flex flex-shrink-0 p-2.5 rounded-xl bg-[#1e1a14] border border-[#3a3024]/30 hover:border-[#c9a96e]/30 text-[#7a6e5d] hover:text-[#c9a96e] transition-all hover:shadow-lg hover:shadow-[#c9a96e]/5"
          aria-label="Siguiente categoría"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {currentCat && (
        <div className="mt-4 text-center">
          <p className="text-[#c9a96e]/50 text-sm italic">{currentCat.description}</p>
        </div>
      )}
    </div>
  );
}

export default memo(CategoryNav);
