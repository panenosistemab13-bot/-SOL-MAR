import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Sun, Waves, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center font-sans px-4 relative overflow-hidden text-white selection:bg-pink-500/20 selection:text-pink-200">
      {/* Background ambient glow setup */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-12 w-[600px] h-[600px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div 
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"
      />
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-5 mix-blend-overlay pointer-events-none"
        style={{ filter: 'hue-rotate(180deg) saturate(1.5)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-sky-400 p-0.5 shadow-xl shadow-pink-500/10 flex items-center justify-center relative overflow-hidden mb-4">
            <div className="absolute inset-0 bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Sun className="w-8 h-8 text-pink-400 animate-spin" style={{ animationDuration: '60s' }} />
            </div>
            <Waves className="absolute bottom-1 right-1 w-5 h-5 text-sky-400" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-[0.1em] text-white m-0">
            SOL & MAR
          </h1>
          <p className="text-[10px] text-pink-400 uppercase tracking-[0.35em] font-bold mt-1.5">
            Coleção LU CONFECÇÕES
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Acesso ao Painel</h2>
            <p className="text-xs text-slate-400 mt-1">Insira suas credenciais para verificar os estoques.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorCode && (
              <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3.5 rounded-xl animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorCode}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                Usuário / Login
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Ex: Jeff"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/50 border border-white/10 hover:border-white/20 focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-white font-medium tracking-wide placeholder-slate-600 transition-all"
                  id="login-username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                Senha de Acesso
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/50 border border-white/10 hover:border-white/20 focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 focus:outline-none rounded-xl pl-11 pr-11 py-3 text-sm text-white font-medium tracking-wide placeholder-slate-600 transition-all font-mono"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
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
              className="w-full bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 text-sm tracking-widest uppercase transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              id="login-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
