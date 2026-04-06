import { useState, useRef, useEffect } from 'react';
import { Lock, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';

// ─── Admin PIN config ────────────────────────────────────────
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';
const SESSION_KEY = 'kaffa_admin_auth';

/**
 * Returns true if the admin is currently authenticated in this tab session.
 */
export function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

/**
 * Clears the admin session.
 */
export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * AdminGate — Wraps admin content behind a PIN screen.
 * If unauthenticated, shows a numpad-style PIN entry.
 * If authenticated, renders children.
 */
export default function AdminGate({ children, onBack }) {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!authenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [authenticated]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
      setError('');
    } else {
      setError('PIN incorrecto');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPin('');
    }
  };

  const handleNumpad = (digit) => {
    if (pin.length >= 8) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  // If already authenticated, render children directly
  if (authenticated) {
    return children;
  }

  // PIN Entry Screen
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div
        className={`w-full max-w-sm bounce-in ${shaking ? 'animate-shake' : ''}`}
        style={{ animation: shaking ? 'shake 0.5s ease-in-out' : undefined }}
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-[#c9a96e]/15 shadow-2xl"
          style={{ background: 'linear-gradient(145deg, #1e1a14, #141110)' }}
        >
          {/* Lock Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#c9a96e]/15 to-[#8b5e35]/10 border border-[#c9a96e]/20 flex items-center justify-center">
            <Shield className="w-9 h-9 text-[#c9a96e]" />
          </div>

          <h2 className="text-center text-xl font-bold hero-title bg-gradient-to-r from-[#e8c87a] to-[#c9a96e] bg-clip-text text-transparent mb-1">
            Acceso Administrativo
          </h2>
          <p className="text-center text-[#7a6e5d] text-xs mb-6">
            Ingrese el PIN de administrador para continuar
          </p>

          {/* PIN Input */}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5d]" />
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setError(''); }}
                placeholder="• • • •"
                className="w-full bg-[#141008] border border-[#3a3024]/30 rounded-xl py-3.5 pl-10 pr-12 text-center text-[#f0e6d2] text-lg font-bold tracking-[0.5em] outline-none focus:border-[#c9a96e]/40 transition-colors placeholder:tracking-[0.3em] placeholder:text-[#5a4835]"
                inputMode="numeric"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a6e5d] hover:text-[#c9a96e] transition-colors"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-center text-[#f87171] text-xs font-semibold mb-3 bounce-in">
                🔒 {error}
              </p>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleNumpad(String(digit))}
                  className="h-12 rounded-xl bg-[#141008] border border-[#3a3024]/20 text-[#f0e6d2] font-bold text-lg hover:bg-[#c9a96e]/10 hover:border-[#c9a96e]/25 active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-[#141008] border border-[#3a3024]/20 text-[#c94a4a] font-bold text-xs hover:bg-[#c94a4a]/10 hover:border-[#c94a4a]/25 active:scale-95 transition-all"
              >
                CLR
              </button>
              <button
                type="button"
                onClick={() => handleNumpad('0')}
                className="h-12 rounded-xl bg-[#141008] border border-[#3a3024]/20 text-[#f0e6d2] font-bold text-lg hover:bg-[#c9a96e]/10 hover:border-[#c9a96e]/25 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-[#141008] border border-[#3a3024]/20 text-[#7a6e5d] font-bold text-xs hover:bg-[#c9a96e]/10 hover:border-[#c9a96e]/25 active:scale-95 transition-all"
              >
                ⌫
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pin.length < 4}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                pin.length >= 4
                  ? 'bg-gradient-to-r from-[#c9a96e] to-[#8b5e35] text-[#0f0c08] shadow-lg shadow-[#8b5e35]/30 active:scale-[0.97]'
                  : 'bg-[#1e1a14] text-[#5a4835] cursor-not-allowed'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Acceder
            </button>
          </form>

          {/* Back button */}
          <button
            onClick={onBack}
            className="w-full mt-3 py-2.5 rounded-xl border border-[#3a3024]/15 text-[#7a6e5d] hover:bg-[#1e1a14] hover:text-[#c9a96e] transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Menú
          </button>
        </div>

        {/* Security notice */}
        <p className="text-center text-[#5a4835] text-[10px] mt-4 uppercase tracking-widest">
          🔐 Área protegida — Solo personal autorizado
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
