import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Package, AlertTriangle, Scissors, Sun, Waves, Sparkles, Anchor, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { bikinis, threads, lowStockItemsCount, resetAllStockToZero } = useInventory();
  const [isConfirmingReset, setIsConfirmingReset] = React.useState(false);

  // Aggregate stock by model
  const stockByModel = bikinis.reduce((acc, current) => {
    const existing = acc.find(item => item.model === current.model);
    if (existing) {
      existing.stock += current.stock;
    } else {
      acc.push({ model: current.model, stock: current.stock });
    }
    return acc;
  }, [] as { model: string, stock: number }[]);

  const lowBikinis = bikinis.filter(b => b.stock <= b.minStockAlert);
  const lowThreads = threads.filter(t => t.stock <= t.minStockAlert);

  const totalBikinis = bikinis.reduce((sum, item) => sum + item.stock, 0);
  const totalThreads = threads.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-950/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-white p-6 md:p-8 space-y-8">
      {/* Immersive Ocean Background Layer */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center tracking-normal opacity-15 mix-blend-overlay pointer-events-none"
        style={{ filter: 'hue-rotate(185deg) saturate(1.8)' }}
      />
      
      {/* Decorative Wave Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none -translate-y-20" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none translate-y-20" />

      {/* Luxury Beach Header Section */}
      <div className="relative bg-gradient-to-r from-sky-500/10 via-pink-500/5 to-slate-950/40 rounded-[2.2rem] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
        
        {/* Glowing Sun and Waves visual title */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-sky-400 p-0.5 shadow-lg shadow-pink-500/20 flex items-center justify-center relative group overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-white/20 blur pointer-events-none" />
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-pink-400 group-hover:text-sky-300 transition-colors">
              <Sun className="w-8 h-8 animate-spin" style={{ animationDuration: '40s' }} />
            </div>
            <Waves className="absolute bottom-1 right-1 w-5 h-5 text-sky-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-[0.25em] text-pink-400 uppercase bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 flex items-center gap-1.5 shadow-sm">
                <Sparkles size={11} className="animate-pulse text-pink-400" /> VIBE PRAIANA LOGÍSTICA
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-pink-200 tracking-tight mt-1">
              Painel de Gestão de Inventário
            </h2>
          </div>
        </div>

        {/* Actions section */}
        <div className="flex items-center gap-4 relative z-10 flex-wrap">
          {/* Zerar Dados Button with confirmation inline */}
          {!isConfirmingReset ? (
            <button
              onClick={() => setIsConfirmingReset(true)}
              className="text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-3 rounded-xl transition duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-rose-500/5 hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCw className="w-4 h-4" />
              Zerar Estoques e Dados
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl backdrop-blur-md">
              <span className="text-[10px] text-rose-200 font-bold tracking-wider px-2 uppercase">Zerar Tudo?</span>
              <button
                onClick={() => {
                  resetAllStockToZero();
                  setIsConfirmingReset(false);
                }}
                className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg transition duration-200 cursor-pointer shadow-sm"
              >
                Sim, Zerar!
              </button>
              <button
                onClick={() => setIsConfirmingReset(false)}
                className="text-[11px] font-semibold text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Sand-glass counter badge */}
          <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-md shadow-lg">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ritmo dos Mares</p>
              <p className="text-xs text-sky-300 font-mono mt-0.5">Estoque sincronizado</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <Anchor className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Glass Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Biquínis Total */}
        <div className="relative group overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-pink-500/30 hover:shadow-pink-500/5">
          {/* Subtle Pink/Ocean wave image inside */}
          <div className="absolute -right-20 -top-20 w-52 h-52 bg-pink-500/10 blur-[80px] rounded-full group-hover:bg-pink-500/20 transition-all duration-700" />
          <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-sky-500/5 blur-[70px] rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10 mb-6">
            <div className="p-4 bg-gradient-to-br from-pink-500/20 to-pink-500/5 text-pink-400 rounded-3xl border border-pink-500/20 shadow-md shadow-pink-500/5">
              <Package size={26} className="text-pink-400" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-pink-300 uppercase bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full">
              Sereia Chic
            </span>
          </div>
          
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-[0.15em] uppercase mb-1">Biquínis no Cabide</p>
            <h3 className="text-5xl font-black font-sans text-white tracking-tight flex items-baseline">
              {totalBikinis}
              <span className="text-sm font-bold text-pink-400/70 ml-2 font-mono uppercase tracking-wider">volumes</span>
            </h3>
            {/* Custom visual progress track in container footer */}
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400 to-pink-500 h-full w-[80%] rounded-full opacity-80" />
            </div>
          </div>
        </div>

        {/* Card 2: Aviamentos e Fios */}
        <div className="relative group overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-sky-400/5">
          <div className="absolute -right-20 -top-20 w-52 h-52 bg-sky-500/10 blur-[80px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700" />
          <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-pink-500/5 blur-[70px] rounded-full pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 mb-6">
            <div className="p-4 bg-gradient-to-br from-sky-500/20 to-sky-500/5 text-sky-400 rounded-3xl border border-sky-400/20 shadow-md shadow-sky-500/5">
              <Scissors size={26} className="text-sky-400" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-sky-300 uppercase bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              Redes de Pesca
            </span>
          </div>

          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-[0.15em] uppercase mb-1">Insumos & Aviamentos</p>
            <h3 className="text-5xl font-black font-sans text-white tracking-tight flex items-baseline">
              {totalThreads}
              <span className="text-sm font-bold text-sky-400/70 ml-2 font-mono uppercase tracking-wider">itens</span>
            </h3>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-400 to-sky-400 h-full w-[65%] rounded-full opacity-80" />
            </div>
          </div>
        </div>

        {/* Card 3: Alertas Críticos */}
        <div className={cn(
          "relative group overflow-hidden rounded-[2.2rem] border p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1",
          lowStockItemsCount > 0 
            ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-400/50 shadow-rose-950/20" 
            : "bg-slate-900/40 border-white/10 hover:border-emerald-500/30"
        )}>
          <div className={cn(
            "absolute -right-20 -top-20 w-52 h-52 blur-[80px] rounded-full transition-all duration-700",
            lowStockItemsCount > 0 ? "bg-rose-500/15 group-hover:bg-rose-500/25" : "bg-emerald-500/10 group-hover:bg-emerald-500/15"
          )} />

          <div className="flex items-center justify-between relative z-10 mb-6">
            <div className={cn(
              "p-4 rounded-3xl border shadow-md",
              lowStockItemsCount > 0 
                ? "bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-rose-500/5" 
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            )}>
              <AlertTriangle size={26} />
            </div>
            <span className={cn(
              "text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border",
              lowStockItemsCount > 0 
                ? "bg-rose-500/10 border-rose-500/20 text-rose-300 animate-pulse" 
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            )}>
              {lowStockItemsCount > 0 ? "Maré Alta (Alerta)" : "Maré Calma"}
            </span>
          </div>

          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 tracking-[0.15em] uppercase mb-1">Reposição Necessária</p>
            <h3 className="text-5xl font-black font-sans text-white tracking-tight flex items-baseline">
              {lowStockItemsCount}
              <span className="text-sm font-bold text-slate-400 ml-2 font-mono uppercase tracking-wider">críticos</span>
            </h3>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className={cn(
                "h-full rounded-full opacity-80",
                lowStockItemsCount > 0 ? "bg-rose-500 w-[90%]" : "bg-emerald-500 w-[10%]"
              )} />
            </div>
          </div>
        </div>

      </div>

      {/* Ocean Chart & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Glowing Ocean Wave Chart */}
        <div className="lg:col-span-2 rounded-[2.2rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5 relative z-10">
            <div>
              <h3 className="text-lg font-black font-sans text-white uppercase tracking-[0.15em] flex items-center gap-2">
                <Waves size={18} className="text-sky-400 animate-bounce" /> Distribuição de Marcas no Mar
              </h3>
              <p className="text-xs text-slate-400 mt-1">Estoque total agrupado por moldes e biquínis</p>
            </div>
            
            {/* Visual legend bubbles */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                <span className="text-slate-300 font-mono text-[10px]">Tons de Azul</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                <span className="text-slate-300 font-mono text-[10px]">Neon Pink</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByModel} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                {/* Custom Gradient Definitions */}
                <defs>
                  <linearGradient id="azureGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="pinkGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#db2777" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="model" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', fontFamily: 'sans-serif'}} dy={12} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.04)', radius: 8}}
                  contentStyle={{backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)', fontFamily: 'sans-serif', fontSize: 12, color: 'white', backdropFilter: 'blur(8px)'}}
                  itemStyle={{color: 'white'}}
                />
                
                <Bar dataKey="stock" radius={[8, 8, 0, 0]}>
                  {stockByModel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'url(#azureGlow)' : 'url(#pinkGlow)'} className="cursor-pointer hover:opacity-100 transition-opacity" />
                  ))}
                </Bar>
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sophisticated Praia Alerts Grid - Floating Marine Cards */}
        <div className="rounded-[2.2rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 flex flex-col relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-500/5 blur-[100px] rounded-full pointer-events-none" />

          <h3 className="text-lg font-black font-sans text-white mb-6 border-b border-white/5 pb-4 flex items-center justify-between uppercase tracking-[0.15em] relative z-10">
            <span className="flex items-center gap-2">⚓ Alertas da Areia</span>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 font-bold px-2 py-0.5 rounded-full border border-rose-500/20">AÇÃO</span>
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar relative z-10 max-h-[300px]">
            {lowStockItemsCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 text-center gap-3">
                <Sun size={32} className="text-emerald-400 animate-spin" style={{ animationDuration: '60s' }} />
                <p className="font-sans text-xs uppercase tracking-widest font-black text-emerald-400">Maré limpa! Estoques saudáveis</p>
              </div>
            ) : (
              <>
                {lowBikinis.map(b => (
                  <div 
                    key={b.id} 
                    className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-pink-500/20 transition-all duration-300 flex items-center justify-between group/alert"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-black text-white text-xs tracking-wider uppercase truncate">{b.model}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="font-extrabold text-pink-400 text-[9px] bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded-md">
                          Tam: {b.size}
                        </span>
                        
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <span className="w-2 h-2 rounded-full shadow-md" style={{backgroundColor: b.colorHex}} />
                          <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[80px]">{b.colorName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="text-rose-400 font-extrabold text-lg font-mono leading-none flex items-center justify-end gap-1">
                        <span>{b.stock}</span>
                        <span className="text-[10px] text-slate-500 font-normal">/</span>
                        <span className="text-[10px] text-rose-300/60 font-normal">{b.minStockAlert}</span>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mt-1">Crítico</span>
                    </div>
                  </div>
                ))}

                {lowThreads.map(t => (
                  <div 
                    key={t.id} 
                    className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-slate-800 hover:border-sky-500/20 transition-all duration-300 flex items-center justify-between group/alert"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-black text-slate-200 text-xs tracking-wider uppercase truncate">{t.name}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <span className="w-2 h-2 rounded-full shadow-md" style={{backgroundColor: t.colorHex}} />
                          <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[80px]">{t.colorName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="text-rose-400 font-extrabold text-lg font-mono leading-none flex items-center justify-end gap-1">
                        <span>{t.stock}</span>
                        <span className="text-[10px] text-slate-500 font-normal">/</span>
                        <span className="text-[10px] text-rose-300/60 font-normal">{t.minStockAlert}</span>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mt-1">Fios</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
