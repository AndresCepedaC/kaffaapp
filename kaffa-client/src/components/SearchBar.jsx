import { memo } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="flex-1 max-w-md relative group">
      <input
        id="search-input"
        type="text"
        placeholder="¿Qué se te antoja hoy?"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-[#1e1a14]/80 border border-[#3a3024]/50 rounded-2xl py-2.5 pl-11 pr-10 text-[#f0e6d2] placeholder-[#5a4835] focus:outline-none focus:border-[#c9a96e]/40 focus:bg-[#1e1a14] focus:shadow-lg focus:shadow-[#c9a96e]/5 transition-all duration-300 text-sm body-font"
      />
      <Search className="w-4 h-4 text-[#5a4835] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#c9a96e] transition-colors" />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#3a3024]/50 rounded-full transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-3.5 h-3.5 text-[#7a6e5d]" />
        </button>
      )}
    </div>
  );
}

export default memo(SearchBar);
