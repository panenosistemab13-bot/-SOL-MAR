import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Lock, User, AlertCircle, Eye, EyeOff, Sun } from 'lucide-react';

// @ts-ignore
import backgroundImage from '../assets/images/sol_mar_bg_1781047598977.png';

export function Login() {
  const { login } = useInventory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorCode('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    setErrorCode(null);

    // Give a slight visual delay for a premium feel
    setTimeout(() => {
      const success = login(username, password);
      setIsSubmitting(false);
      if (!success) {
        setErrorCode('Login ou senha incorretos. Tente novamente.');
      }
    }, 600);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center font-sans px-4 relative overflow-hidden text-white bg-[#1a130c] bg-cover bg-center bg-no-repeat selection:bg-[#ebdcb9]/30 selection:text-[#3d2723]"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark Vignette Overlay to ensure text contrast while retaining the beautiful background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 z-0 pointer-events-none" />

      {/* Decorative ambient color glow reflecting current card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ebdcb9]/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ebdcb9] via-[#c6b694] to-[#ad9e7a] p-0.5 shadow-xl flex items-center justify-center relative overflow-hidden mb-4">
            <div className="absolute inset-0 bg-[#3d2723] rounded-[22px] flex items-center justify-center">
              <Sun 
                className="w-8 h-8 text-[#ebdcb9] animate-spin" 
                style={{ animationDuration: '60s' }} 
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-serif font-bold tracking-[0.2em] text-[#fbf8f2] m-0">
            SOL & MAR
          </h1>
          <p className="text-[10px] text-[#c5a880] uppercase tracking-[0.35em] font-medium mt-2 leading-none">
            Coleção LU CONFECÇÕES
          </p>
        </div>

        {/* Login Box with Clay/Glass styling */}
        <div className="bg-[#130d08]/85 border border-[#ebdcb9]/15 rounded-[2.8rem] p-8 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ebdcb9]/20 to-transparent" />
          
          <div className="mb-6">
            <h2 className="text-xl font-serif text-[#fbf8f2] tracking-wide">Acesso ao Painel</h2>
            <p className="text-xs text-[#d7cab5] mt-1.5">Insira suas credenciais para gerenciar estoques e equipes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorCode && (
              <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorCode}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#c5a880] uppercase tracking-widest block font-sans">
                Usuário / Login
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5a880]/60 group-focus-within:text-[#ebdcb9] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Ex: Lu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-black/40 border border-[#ebdcb9]/15 hover:border-[#ebdcb9]/30 focus:border-[#ebdcb9]/50 focus:ring-1 focus:ring-[#ebdcb9]/10 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-[#fbf8f2] font-medium tracking-wide placeholder-[#c5a880]/30 transition-all"
                  id="login-username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#c5a880] uppercase tracking-widest block font-sans">
                Senha de Acesso
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5a880]/60 group-focus-within:text-[#ebdcb9] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-black/40 border border-[#ebdcb9]/15 hover:border-[#ebdcb9]/30 focus:border-[#ebdcb9]/50 focus:ring-1 focus:ring-[#ebdcb9]/10 focus:outline-none rounded-xl pl-11 pr-11 py-3 text-sm text-[#fbf8f2] font-medium tracking-wide placeholder-[#c5a880]/30 transition-all font-mono"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c5a880]/50 hover:text-[#ebdcb9] transition-colors cursor-pointer"
                  id="toggle-password-vis"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#ebdcb9] via-[#c6b694] to-[#ad9e7a] hover:brightness-105 active:scale-[0.99] text-[#3d2723] font-black py-3.5 px-4 rounded-xl shadow-lg text-xs tracking-widest uppercase transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              id="login-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#3d2723]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Conectando...</span>
                </>
              ) : (
                <span>Entrar no Painel</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
