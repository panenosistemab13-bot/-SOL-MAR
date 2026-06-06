import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Plus, 
  Minus, 
  Search, 
  AlertCircle, 
  Sun, 
  Waves, 
  Sparkles, 
  Anchor, 
  Compass, 
  Wind, 
  LifeBuoy, 
  Droplet, 
  Palette, 
  Flame, 
  TrendingUp, 
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { cn } from '../lib/utils';
import { Thread } from '../types';

export function Threads() {
  const { threads, updateThreadStock, setThreadStock } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'FIO' | 'RETA'>('FIO');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Filter threads based on Type AND Search
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchesType = t.name.toUpperCase() === selectedType;
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                            t.colorName.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [threads, search, selectedType]);

  // Group filtered threads by color for vertical grouping layout
  const groupedByColor = useMemo(() => {
    const grouped: Record<string, { colorHex: string; items: Thread[] }> = {};
    filteredThreads.forEach(item => {
      if (!grouped[item.colorName]) {
        grouped[item.colorName] = {
          colorHex: item.colorHex,
          items: []
        };
      }
      grouped[item.colorName].items.push(item);
    });
    return Object.entries(grouped).sort(([colorA], [colorB]) => colorA.localeCompare(colorB));
  }, [filteredThreads]);

  // Aggregate stats
  const totalStock = useMemo(() => {
    return filteredThreads.reduce((sum, item) => sum + item.stock, 0);
  }, [filteredThreads]);

  const criticalItems = useMemo(() => {
    return filteredThreads.filter(t => t.stock <= t.minStockAlert);
  }, [filteredThreads]);

  const normalItems = useMemo(() => {
    return filteredThreads.filter(t => t.stock > t.minStockAlert);
  }, [filteredThreads]);

  // Coastal wave percentage calculator (for the custom animated SVG wave)
  const tidePercentage = useMemo(() => {
    if (filteredThreads.length === 0) return 0;
    const maxReference = filteredThreads.length * 80; // Assuming 80 units is 100% capacity per thread
    const percentage = Math.min(100, Math.round((totalStock / maxReference) * 100));
    return percentage;
  }, [filteredThreads, totalStock]);

  // Prepare chart data formatting for Recharts
  const chartData = useMemo(() => {
    return filteredThreads.map(t => ({
      name: t.colorName,
      tipo: t.name,
      Estoque: t.stock,
      Alerta: t.minStockAlert,
      color: t.colorHex
    })).sort((a, b) => b.Estoque - a.Estoque);
  }, [filteredThreads]);

  // Dynamically assign beach-beachfront icons based on the stock state and item id
  const getLagoonIcon = (item: Thread, index: number) => {
    if (item.stock <= item.minStockAlert) return <LifeBuoy className="w-5 h-5 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} />;
    const icons = [
      <Anchor className="w-5 h-5 text-sky-400" />,
      <Compass className="w-5 h-5 text-pink-400" />,
      <Waves className="w-5 h-5 text-sky-300" />,
      <Wind className="w-5 h-5 text-fuchsia-400" />,
      <Sun className="w-5 h-5 text-yellow-400 font-bold" />,
      <Droplet className="w-5 h-5 text-blue-400" />,
      <Flame className="w-5 h-5 text-pink-500" />
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="relative rounded-[3.2rem] overflow-hidden border border-white/10 bg-slate-950/85 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] text-white p-6 md:p-10 space-y-10">
      
      {/* 1. PARALLAX SEA OVERLAY - Visual Ocean Deep Background */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
        style={{ filter: 'hue-rotate(190deg) saturate(1.8) contrast(1.1)' }}
      />

      {/* Tropical glowing neon orbs */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[350px] bg-pink-500/10 blur-[140px] rounded-full pointer-events-none -translate-y-24" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-sky-400/10 blur-[130px] rounded-full pointer-events-none translate-y-20" />

      {/* 2. THE HIGH-END LUXURY HEADER WITH SHORELINE CARA */}
      <div className="relative bg-gradient-to-r from-sky-400/15 via-slate-900/50 to-pink-500/10 rounded-[2.8rem] border border-white/5 p-6 md:p-10 flex flex-col xl:flex-row items-center justify-between gap-8 backdrop-blur-3xl overflow-hidden shadow-2xl select-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-5 pointer-events-none" />
        
        {/* Floating Yacht header */}
        <div className="flex items-center gap-6 relative z-10 w-full xl:w-auto">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-sky-400 via-pink-500 to-fuchsia-600 p-0.5 shadow-xl shadow-pink-500/15 flex items-center justify-center relative group overflow-hidden shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[28px] flex items-center justify-center text-pink-400">
              <Compass className="w-10 h-10 animate-spin text-sky-400" style={{ animationDuration: '25s' }} />
            </div>
            <Waves className="absolute bottom-2 right-2 w-5 h-5 text-pink-400 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-[0.3em] text-pink-400 uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 flex items-center gap-2 w-fit shadow-lg">
              <Sparkles size={12} className="animate-pulse text-sky-400" /> TROPICAL EMBROIDERY SYSTEM
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-sky-200 tracking-tight mt-1.5 font-sans">
              Insumos & Fios
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Artesanato de Linhas na Maré Ativa</p>
          </div>
        </div>

        {/* 3. COOP INTEGRATED MARITIME WEATHER GAUGE & DASH MINIS */}
        <div className="flex flex-col sm:flex-row items-stretch gap-5 w-full xl:w-auto z-10">
          
          {/* Animated Water / Tide Wave Level Indicator (Cara Praiana) */}
          <div className="flex-1 bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 rounded-3xl p-4 flex items-center gap-4 transition-all hover:border-sky-500/30 overflow-hidden relative group">
            {/* Live dynamic tidal wave backdrop inside. Filled depending on tidePercentage */}
            <div 
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-sky-400/15 via-pink-500/5 to-transparent transition-all duration-1000 ease-out z-0" 
              style={{ height: `${tidePercentage}%` }}
            />
            {/* Animated ocean foam wave line */}
            <svg className="absolute bottom-[10%] left-0 w-full h-8 opacity-25 text-sky-400 pointer-events-none animate-pulse" viewBox="0 0 120 28" fill="none">
              <path d="M0 15C30 5 60 25 90 15C105 10 120 15 120 15V28H0V15Z" fill="currentColor"/>
            </svg>

            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-300 border border-sky-400/20 relative z-10 shrink-0">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Nível da Maré</p>
              <p className="text-lg font-black text-sky-300 font-mono">{tidePercentage}% <span className="text-[10px] text-slate-500 font-normal">Capacidade</span></p>
              <p className="text-[9px] text-slate-500 font-sans mt-0.5 font-bold uppercase tracking-wider">
                {tidePercentage > 75 
                  ? '🌊 MARÉ CHEIA (ESTOQUE ALTO)' 
                  : tidePercentage > 35 
                    ? '🌤️ MARÉ AMENA (ESTABILIZADO)' 
                    : '🚨 BAIXA-MAR (REPOSIÇÃO URGENTE)'}
              </p>
            </div>
          </div>

          {/* Critical Alarm Badge */}
          <div className="bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 rounded-3xl p-4 flex items-center gap-4 transition-all hover:border-pink-500/30 shrink-0 relative group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-400/25 shrink-0 relative">
              <LifeBuoy className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
              {criticalItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce shadow-md">
                  {criticalItems.length}
                </span>
              )}
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Alertas de Porto</p>
              <p className="text-lg font-black text-pink-300 font-mono">{criticalItems.length} <span className="text-[10px] text-slate-500 font-normal">críticos</span></p>
              <p className="text-[9px] text-slate-500 font-sans mt-0.5 uppercase tracking-wider font-bold">Incorrendo Maré Baixa</p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. THE LUXURY DESCRIPTIVE STATISTICS & TROPICAL WAVE CHARTS (VISUAL SPECTACLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Oceanscape bar chart container (Recharts visual highlight, 100% custom styled) */}
        <div className="lg:col-span-8 bg-slate-900/35 border border-white/10 rounded-[2.8rem] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/5 blur-2xl rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 select-none">
            <div>
              <span className="text-[9px] font-black px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/10 rounded-full tracking-wider uppercase">
                Análise de Corrente
              </span>
              <h3 className="text-lg font-extrabold text-white tracking-wider mt-1 flex items-center gap-2">
                <Palette size={16} className="text-pink-400 animate-pulse" /> Maré de Estoques por Linha
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                <span className="text-slate-400 uppercase text-[10px]">Estoque Suficiente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
                <span className="text-pink-300 uppercase text-[10px]">Ponto Crítico</span>
              </div>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-wider font-sans">
              Veleje o filtro de busca para ver tendências
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff30" 
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff30" 
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#020617ef', 
                      borderRadius: '1.5rem', 
                      borderColor: '#ffffff10',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontFamily: 'Outfit, sans-serif'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="Estoque" radius={[12, 12, 0, 0]} maxBarSize={30}>
                    {chartData.map((entry, index) => {
                      const isLow = entry.Estoque <= entry.Alerta;
                      // Glow colors matching the thread hex but using sea blue/neon pink highlights based on state
                      const fillGradient = isLow ? '#EC4899' : '#38BDF8';
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={fillGradient}
                          fillOpacity={0.8}
                          stroke={isLow ? '#f43f5e30' : '#0ea5e930'}
                          strokeWidth={1}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Info card of current beach selection (Gauge / details, 100% custom) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-white/10 rounded-[2.8rem] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-pink-500/5 blur-2xl rounded-full pointer-events-none" />
          
          <div className="space-y-4 select-none">
            <span className="text-[9px] font-black px-2.5 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/10 rounded-full tracking-wider uppercase">
              Resumo Costeiro
            </span>
            <h3 className="text-lg font-extrabold text-white tracking-wider">Metrologia de Linhas</h3>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Enrolado</span>
                <span className="text-lg font-bold text-sky-300 font-mono">{totalStock} <span className="text-[9px] text-slate-500">vol</span></span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Insumos Saudáveis</span>
                <span className="text-lg font-bold text-teal-400 font-mono">{normalItems.length} <span className="text-[9px] text-slate-500">cores</span></span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Maré Vermelha (Críticos)</span>
                <span className="text-lg font-bold text-pink-400 font-mono">{criticalItems.length} <span className="text-[9px] text-slate-500 font-bold">cores</span></span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-4 text-[10px] text-slate-500 leading-relaxed font-sans uppercase font-bold flex items-center gap-2">
            <TrendingUp size={12} className="text-pink-400 animate-pulse" /> Sincronizado com os teares acqualogic em tempo real.
          </div>
        </div>

      </div>

      {/* 5. PORTO DE SELEÇÃO - BEACH FILTER BAR AND SEARCH SEARCH DECK */}
      <div className="relative bg-slate-900/30 border border-white/10 rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl z-10 shadow-lg">
        
        {/* Deluxe Beach Filter Tabs (No list style!) */}
        <div className="flex items-center p-1.5 bg-black/40 rounded-2xl border border-white/5 shrink-0 w-full md:w-auto">
          {[
            { value: 'FIO', label: 'Fios', icon: <Waves size={13} /> },
            { value: 'RETA', label: 'Retas', icon: <Anchor size={13} /> }
          ].map(tab => {
            const isActive = selectedType === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedType(tab.value as any)}
                className={cn(
                  "flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white shadow-md shadow-pink-500/10 scale-105" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Luxury Search Deck */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Navegar cores do porto..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-6 py-3 bg-white/5 border border-white/10 hover:border-sky-500/20 focus:border-pink-500/40 transition-all rounded-full text-xs text-white focus:outline-none placeholder:text-slate-500 font-sans"
          />
        </div>
      </div>

      {/* 6. COLEÇÃO DE PÉROLAS DE COSTURA - 100% ICON-BASED MULTIDIMENSIONAL CARD GRID */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between select-none">
          <span className="text-xs font-bold font-mono tracking-widest text-[#EC4899] uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 flex items-center gap-1.5 shadow-sm">
            <Palette size={13} className="text-pink-300 animate-bounce" /> CORES DE EMBARCAÇÃO
          </span>
          <span className="text-[10px] text-slate-500 font-sans tracking-tight uppercase font-bold">Use os giroscópios de ajuste para alterar estoque</span>
        </div>

        {groupedByColor.length === 0 ? (
          <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 py-20 text-center shadow-xl backdrop-blur-xl flex flex-col items-center justify-center gap-4">
            <Waves size={40} className="text-pink-500 opacity-20 animate-bounce" />
            <p className="text-slate-400 font-sans tracking-widest font-bold text-xs uppercase">Estoque do porto completamente vazio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedByColor.map(([colorName, group]) => {
              const colorGroupTotalStock = group.items.reduce((sum, item) => sum + item.stock, 0);
              
              return (
                <div 
                  key={colorName}
                  className="border border-white/10 bg-slate-950/40 rounded-[2.5rem] p-5 space-y-4 shadow-xl relative overflow-hidden group/color-card"
                >
                  {/* Light subtle glow of the color itself at the background on hover */}
                  <div 
                    className="absolute -top-10 -right-10 w-28 h-28 blur-3xl rounded-full opacity-0 group-hover/color-card:opacity-10 transition-opacity duration-500 pointer-events-none" 
                    style={{ backgroundColor: group.colorHex }}
                  />
                  
                  {/* Color Info Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 relative z-10 select-none">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20 shadow-lg relative" 
                        style={{ 
                          backgroundColor: group.colorHex,
                          boxShadow: `0 0 12px ${group.colorHex}65, inset 0 1px 1px rgba(255,255,255,0.4)`
                        }} 
                      />
                      <div>
                        <h4 className="text-sm font-black tracking-wider uppercase text-slate-100">{colorName}</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Insumo ativo</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl text-right">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Total: </span>
                      <span className="text-xs font-black text-pink-300 font-mono">{colorGroupTotalStock} u</span>
                    </div>
                  </div>

                  {/* Vertical Stack inside this Color Group */}
                  <div className="space-y-2.5 relative z-10">
                    {group.items.map((v) => {
                      const isCritical = v.stock <= v.minStockAlert;
                      return (
                        <div 
                          key={v.id} 
                          className={cn(
                            "p-3 rounded-2xl bg-white/[0.015] border flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-all relative overflow-hidden",
                            isCritical 
                              ? "border-rose-500/25 bg-rose-500/[0.02]" 
                              : "border-white/5 hover:border-sky-500/20"
                          )}
                        >
                          {isCritical && (
                            <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-ping" />
                          )}

                          {/* Variation Name and indicator */}
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center border transition-transform duration-300",
                              v.name === 'RETA' 
                                ? 'bg-sky-500/10 border-sky-400/20 text-sky-400' 
                                : 'bg-pink-500/10 border-pink-400/20 text-pink-400'
                            )}>
                              {v.name === 'RETA' ? <Anchor size={12} /> : <Waves size={12} />}
                            </div>
                            <div>
                              <span className="font-extrabold text-[12px] uppercase tracking-wider text-slate-200">
                                {v.name}
                              </span>
                              {isCritical && (
                                <span className="text-[7.5px] text-rose-400 font-black tracking-widest uppercase block mt-0.5 animate-pulse">Min</span>
                              )}
                            </div>
                          </div>

                          {/* Stocks and Direct manual input aligned on the horizontal row inside card */}
                          <div className="flex items-center gap-3">
                            <div className="w-[84px] relative z-10 animate-fade-in">
                              <input
                                type="number"
                                value={v.stock === 0 ? '' : v.stock}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value, 10);
                                  setThreadStock(v.id, isNaN(parsed) ? 0 : Math.max(0, parsed));
                                }}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                placeholder="0"
                                className={cn(
                                  "w-full text-center py-1.5 bg-white/5 hover:bg-white/10 focus:bg-slate-950 border border-white/5 focus:border-pink-500/40 rounded-xl font-mono text-sm font-black select-text focus:outline-none focus:ring-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                  isCritical ? "text-rose-400 focus:text-rose-400" : "text-white focus:text-pink-300"
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );

  // Simple state bridge for hover
  function setHoverCardId(id: string | null) {
    setHoveredCardId(id);
  }
}
