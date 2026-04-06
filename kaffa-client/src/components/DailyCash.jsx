import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getDailyClosing, API_BASE_URL } from '../services/api';

export default function DailyCash() {
  const [closing, setClosing] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getDailyClosing(selectedDate)
      .then(setClosing)
      .catch(() => setClosing(null))
      .finally(() => setIsLoading(false));
  }, [selectedDate]);

  const handleExportCSV = () => {
    const yearMonth = selectedDate.substring(0, 7); // e.g. "2026-04"
    window.location.href = `${API_BASE_URL}/cash/export?yearMonth=${yearMonth}`;
  };

  const cards = [
    {
      emoji: '💵',
      label: 'Efectivo en Caja',
      value: closing?.totalCash ?? 0,
      color: 'from-[#2d6a4f]/20 to-[#1b4332]/10',
      border: 'border-[#2d6a4f]/30',
      text: 'text-[#4ade80]',
    },
    {
      emoji: '🏦',
      label: 'Dinero en Banco',
      value: closing?.totalBank ?? 0,
      color: 'from-[#1d3557]/20 to-[#0d1b2a]/10',
      border: 'border-[#3a86ff]/30',
      text: 'text-[#60a5fa]',
    },
    {
      emoji: '📊',
      label: 'Total Ventas',
      value: closing?.grandTotal ?? 0,
      color: 'from-[#c9a96e]/15 to-[#8b5e35]/10',
      border: 'border-[#c9a96e]/30',
      text: 'text-[#e8c87a]',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Date selector and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-[#1e1a14] border border-[#3a3024]/30 rounded-xl px-4 py-2.5 text-[#f0e6d2] text-sm font-semibold outline-none focus:border-[#c9a96e]/40 transition-colors"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {closing && (
            <div className="bg-[#1e1a14] border border-[#3a3024]/20 rounded-xl px-4 py-2 text-[#c9a96e] text-sm font-bold">
              {closing.orderCount} pedidos
            </div>
          )}
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#1d3557] hover:bg-[#254675] border border-[#3a86ff]/30 text-[#60a5fa] px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#1d3557]/20"
          >
            <Download className="w-4 h-4" />
            Reporte Mensual (CSV)
          </button>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 rounded-2xl skeleton border border-[#3a3024]/10"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 border ${card.border} transition-all hover:scale-[1.02] hover:shadow-lg`}
              style={{ animationDelay: `${i * 100}ms`, animation: 'fadeInUp 0.5s ease-out forwards' }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{card.emoji}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#7a6e5d] font-bold">
                  {card.label}
                </span>
              </div>
              <p className={`text-4xl font-bold hero-title ${card.text}`}>
                ${Math.round(card.value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary bar */}
      {closing && closing.grandTotal > 0 && (
        <div className="bg-[#1e1a14] rounded-2xl p-5 border border-[#3a3024]/20">
          <p className="text-[10px] uppercase tracking-widest text-[#7a6e5d] font-bold mb-3">
            Distribución de Pagos
          </p>
          <div className="flex gap-1 rounded-full overflow-hidden h-4 bg-[#141008]">
            {closing.totalCash > 0 && (
              <div
                className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded-full transition-all duration-700"
                style={{ width: `${(closing.totalCash / closing.grandTotal) * 100}%` }}
                title={`Efectivo: $${Math.round(closing.totalCash).toLocaleString()}`}
              ></div>
            )}
            {closing.totalBank > 0 && (
              <div
                className="bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] rounded-full transition-all duration-700"
                style={{ width: `${(closing.totalBank / closing.grandTotal) * 100}%` }}
                title={`Banco: $${Math.round(closing.totalBank).toLocaleString()}`}
              ></div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#7a6e5d]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]"></span>
              Efectivo {closing.grandTotal > 0 ? Math.round((closing.totalCash / closing.grandTotal) * 100) : 0}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]"></span>
              Banco {closing.grandTotal > 0 ? Math.round((closing.totalBank / closing.grandTotal) * 100) : 0}%
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {closing && closing.orderCount === 0 && !isLoading && (
        <div className="text-center py-12 text-[#5a4835]">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-[#7a6e5d] text-lg">No hay ventas registradas para esta fecha</p>
        </div>
      )}
    </div>
  );
}
