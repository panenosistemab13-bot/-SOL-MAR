import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Bikini, BikiniStockDivided } from '../types';
import { cn } from '../lib/utils';
import { 
  Search, 
  Package, 
  Scissors, 
  Wrench, 
  Factory, 
  ArrowLeft, 
  Zap, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  Sun,
  Waves,
  Sparkles,
  Anchor,
  Moon
} from 'lucide-react';

export function EstoqueEncomenda() {
  const { bikinis, updateBikiniDividedStock } = useInventory();
  const [variationsSearch, setVariationsSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'todos' | 'pendentes' | 'completos'>('todos');
  
  // Mobile/responsive display state
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Compute overall dashboard analytics
  const totalStats = useMemo(() => {
    let embalados = 0;
    let naBase = 0;
    let emProducao = 0;
    let emRecorte = 0;
    let paraConsertos = 0;
    let sobras = 0;
    let totalStock = 0;
    let totalDivided = 0;

    bikinis.forEach(b => {
      totalStock += b.stock;
      const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
      embalados += divided.embalados || 0;
      naBase += divided.naBase || 0;
      emProducao += divided.emProducao || 0;
      emRecorte += divided.emRecorte || 0;
      paraConsertos += divided.paraConsertos || 0;
      sobras += divided.sobras || 0;
      totalDivided += (divided.embalados || 0) + (divided.naBase || 0) + (divided.emProducao || 0) + (divided.emRecorte || 0) + (divided.paraConsertos || 0) + (divided.sobras || 0);
    });

    return { 
      embalados, 
      naBase, 
      emProducao, 
      emRecorte, 
      paraConsertos, 
      sobras, 
      totalStock, 
      totalDivided,
      percent: totalStock > 0 ? Math.round((totalDivided / totalStock) * 100) : 0
    };
  }, [bikinis]);

  // Compute model completion index
  const modelCompletionMap = useMemo(() => {
    const result: Record<string, { total: number; divided: number; percent: number; isFullyDivided: boolean }> = {};
    
    bikinis.forEach(b => {
      if (!result[b.model]) {
        result[b.model] = { total: 0, divided: 0, percent: 0, isFullyDivided: true };
      }
      result[b.model].total += b.stock;
      
      const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
      const currentDivided = (divided.embalados || 0) + (divided.naBase || 0) + (divided.emProducao || 0) + (divided.emRecorte || 0) + (divided.paraConsertos || 0) + (divided.sobras || 0);
      result[b.model].divided += currentDivided;
      
      if (currentDivided !== b.stock) {
        result[b.model].isFullyDivided = false;
      }
    });

    Object.keys(result).forEach(model => {
      const r = result[model];
      r.percent = r.total > 0 ? Math.min(100, Math.round((r.divided / r.total) * 100)) : 0;
    });

    return result;
  }, [bikinis]);

  // Group all bikinis by model (no global search filter)
  const groupedByModel = useMemo(() => bikinis.reduce((acc, b) => {
    if (!acc[b.model]) acc[b.model] = [];
    acc[b.model].push(b);
    return acc;
  }, {} as Record<string, Bikini[]>), [bikinis]);

  // Filter model keys on Status Filter (Todos vs Pendentes vs Completos)
  const modelKeys = useMemo(() => {
    const keys = Object.keys(groupedByModel).sort((a, b) => a.localeCompare(b));
    return keys.filter(key => {
      const completion = modelCompletionMap[key];
      if (!completion) return true;
      if (filterType === 'pendentes') return completion.percent < 100;
      if (filterType === 'completos') return completion.percent >= 100;
      return true;
    });
  }, [groupedByModel, modelCompletionMap, filterType]);

  // Auto-select first model
  useEffect(() => {
    if (modelKeys.length > 0) {
      if (!selectedModel || !modelKeys.includes(selectedModel)) {
        setSelectedModel(modelKeys[0]);
      }
    } else {
      setSelectedModel(null);
    }
  }, [modelKeys, selectedModel]);

  // Clear inner search whenever the active model changes
  useEffect(() => {
    setVariationsSearch('');
  }, [selectedModel]);

  const handleChange = (id: string, field: keyof BikiniStockDivided, value: string, currentBikini: Bikini) => {
    const num = Math.max(0, parseInt(value) || 0);
    const currentDivided = currentBikini.dividedStock || {
      embalados: 0,
      naBase: 0,
      paraConsertos: 0,
      emRecorte: 0,
      emProducao: 0,
      sobras: 0
    };
    updateBikiniDividedStock(id, { ...currentDivided, [field]: num });
  };

  const handleResetBikini = (b: Bikini) => {
    updateBikiniDividedStock(b.id, {
      embalados: 0,
      naBase: 0,
      paraConsertos: 0,
      emRecorte: 0,
      emProducao: 0,
      sobras: 0
    });
  };

  const handleAutoFillRemaining = (b: Bikini) => {
    const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
    const currentTotal = divided.embalados + divided.naBase + divided.paraConsertos + divided.emRecorte + divided.emProducao + (divided.sobras || 0);
    const remaining = b.stock - currentTotal;
    
    if (remaining > 0) {
      const updatedEmbalados = (divided.embalados || 0) + remaining;
      updateBikiniDividedStock(b.id, {
        ...divided,
        embalados: updatedEmbalados
      });
    }
  };

  const selectedItems = selectedModel ? groupedByModel[selectedModel] || [] : [];
  const selectedModelTotal = selectedItems.reduce((acc, item) => acc + item.stock, 0);

  const selectedModelDivided = useMemo(() => {
    return selectedItems.reduce((acc, b) => {
      const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
      return acc + divided.embalados + divided.naBase + divided.paraConsertos + divided.emRecorte + divided.emProducao + (divided.sobras || 0);
    }, 0);
  }, [selectedItems]);

  const filteredSelectedItems = useMemo(() => {
    if (!variationsSearch.trim()) return selectedItems;
    return selectedItems.filter(b => 
      b.size.toLowerCase().includes(variationsSearch.toLowerCase()) || 
      b.colorName.toLowerCase().includes(variationsSearch.toLowerCase())
    );
  }, [selectedItems, variationsSearch]);

  const selectModelOnMobile = (model: string) => {
    setSelectedModel(model);
    setMobileView('detail');
  };

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-950/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-white p-6 md:p-8 space-y-8">
      
      {/* Immersive Ocean Background Layer */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center tracking-normal opacity-15 mix-blend-overlay pointer-events-none"
        style={{ filter: 'hue-rotate(185deg) saturate(1.8)' }}
      />

      {/* Decorative Wave Glows */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[350px] bg-pink-500/10 blur-[130px] rounded-full pointer-events-none -translate-y-20" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none translate-y-20" />

      {/* 1. Global Analytics Panel - Smart Beach Shell metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4 relative z-10 select-none">
        
        {/* Global Progress Widget */}
        <div className="col-span-2 sm:col-span-3 xl:col-span-1 p-5 rounded-[2rem] bg-gradient-to-br from-pink-500/15 via-sky-500/10 to-slate-950/40 border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
          <div>
            <span className="text-[9px] text-pink-400 uppercase font-black tracking-widest flex items-center gap-1.5">
              <Sparkles size={11} className="animate-spin" /> Marés Globais
            </span>
            <div className="text-3xl font-black font-sans mt-2 text-white">{totalStats.percent}%</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400 to-pink-500 h-full transition-all duration-500" style={{ width: `${totalStats.percent}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1.5 flex justify-between">
              <span>{totalStats.totalDivided}</span>
              <span className="text-slate-500">de {totalStats.totalStock} un</span>
            </p>
          </div>
        </div>

        {/* Embalados Widget */}
        <div className="p-4 rounded-[1.8rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 flex flex-col justify-between hover:bg-white/[0.04] transition-all backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/15 shadow-sm">
              <Package size={14} />
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Embalados</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black font-mono text-white">{totalStats.embalados}</span>
            <span className="text-[10px] text-slate-500 ml-1 font-mono">un</span>
          </div>
        </div>

        {/* Na Base Widget */}
        <div className="p-4 rounded-[1.8rem] bg-white/[0.02] border border-white/5 hover:border-sky-400/20 flex flex-col justify-between hover:bg-white/[0.04] transition-all backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/15 shadow-sm">
              <Anchor size={14} className="animate-pulse" />
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Na Base</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black font-mono text-white">{totalStats.naBase}</span>
            <span className="text-[10px] text-slate-500 ml-1 font-mono">un</span>
          </div>
        </div>

        {/* Em Produção Widget */}
        <div className="p-4 rounded-[1.8rem] bg-white/[0.02] border border-white/5 hover:border-yellow-400/20 flex flex-col justify-between hover:bg-white/[0.04] transition-all backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/15 shadow-sm">
              <Factory size={14} />
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Produção</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black font-mono text-white">{totalStats.emProducao}</span>
            <span className="text-[10px] text-slate-500 ml-1 font-mono">un</span>
          </div>
        </div>

        {/* Em Recorte Widget */}
        <div className="p-4 rounded-[1.8rem] bg-white/[0.02] border border-white/5 hover:border-teal-400/20 flex flex-col justify-between hover:bg-white/[0.04] transition-all backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/15 shadow-sm">
              <Scissors size={14} />
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Recorte</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black font-mono text-white">{totalStats.emRecorte}</span>
            <span className="text-[10px] text-slate-500 ml-1 font-mono">un</span>
          </div>
        </div>

        {/* Para Conserto Widget */}
        <div className="p-4 rounded-[1.8rem] bg-white/[0.02] border border-white/5 hover:border-orange-400/20 flex flex-col justify-between hover:bg-white/[0.04] transition-all backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/15 shadow-sm">
              <Wrench size={14} />
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Consertos</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black font-mono text-white">{totalStats.paraConsertos}</span>
            <span className="text-[10px] text-slate-500 ml-1 font-mono">un</span>
          </div>
        </div>

        {/* Sobras Widget */}
        <div className="p-4 rounded-[1.8rem] bg-white/[0.02] border border-white/5 hover:border-purple-400/20 flex flex-col justify-between hover:bg-white/[0.04] transition-all backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/15 shadow-sm">
              <Package size={14} />
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Sobras</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black font-mono text-white">{totalStats.sobras}</span>
            <span className="text-[10px] text-slate-500 ml-1 font-mono">un</span>
          </div>
        </div>

      </div>

      {/* 2. Main Dual Panel Interaction Screen */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-21rem)] md:h-[calc(100vh-23rem)] min-h-[520px] relative z-10">
        
        {/* LEFT COLUMN: Sidebar with Status Filters */}
        <div className={cn(
          "w-full lg:w-80 flex flex-col bg-slate-900/35 border border-white/10 rounded-[2.2rem] overflow-hidden shrink-0 shadow-2xl backdrop-blur-xl transition-all duration-300",
          mobileView === 'detail' ? "hidden lg:flex" : "flex"
        )}>
          
          {/* Smart Filters tab bar */}
          <div className="p-5 border-b border-white/5 bg-white/[0.01]">
            <div className="flex bg-white/5 p-1 rounded-xl gap-1">
              {(['todos', 'pendentes', 'completos'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    filterType === tab 
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Model list item with custom Progress Meter */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {modelKeys.length === 0 ? (
               <div className="text-center py-12 text-slate-500 text-xs uppercase tracking-wider flex flex-col items-center gap-3">
                 <SlidersHorizontal size={24} className="opacity-30" />
                 <span>Nenhum modelo nesta aba</span>
               </div>
            ) : (
              modelKeys.map(model => {
                const items = groupedByModel[model];
                const total = items.reduce((sum, item) => sum + item.stock, 0);
                const isSelected = selectedModel === model;
                const progress = modelCompletionMap[model] || { percent: 0, isFullyDivided: false };
                
                return (
                  <button 
                    key={model}
                    onClick={() => selectModelOnMobile(model)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all duration-200 border flex flex-col gap-3 group relative overflow-hidden",
                      isSelected 
                        ? "bg-gradient-to-br from-pink-500/[0.12] via-pink-400/[0.03] to-transparent border-pink-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                        : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="min-w-0 pr-2">
                        <h4 className={cn("font-extrabold tracking-widest uppercase transition-colors text-xs truncate", isSelected ? "text-pink-400" : "text-slate-200 group-hover:text-white")}>
                          {model}
                        </h4>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-mono">{items.length} cores • {total} un</p>
                      </div>
                      
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0",
                        progress.percent === 100 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-white/5 text-slate-400 border border-white/5"
                      )}>
                        {progress.percent}%
                      </div>
                    </div>

                    {/* Miniature visual progress bar inside sidebar card */}
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-300",
                        progress.percent === 100 ? "bg-emerald-500" : "bg-pink-500"
                      )} style={{ width: `${progress.percent}%` }} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Redesigned Bento Workstation panel */}
        <div className={cn(
          "flex-1 bg-slate-900/35 border border-white/10 rounded-[2.2rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl transition-all duration-300",
          mobileView === 'list' && selectedModel ? "hidden lg:flex" : "flex"
        )}>
          {selectedModel ? (
            <>
              {/* Header: compact layout for both mobile and desktop */}
              <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01] gap-4">
                <div className="flex items-center gap-3 min-w-0">
                   {/* Back button on mobile */}
                   <button 
                     onClick={() => setMobileView('list')}
                     className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                   >
                     <ArrowLeft size={18} />
                   </button>
                   
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400/20 to-pink-500/20 border border-white/10 flex items-center justify-center text-pink-400 shrink-0 shadow-lg shadow-pink-500/5">
                     <Waves size={20} className="animate-bounce" />
                   </div>
                   <div className="min-w-0">
                      <h1 className="text-lg md:text-xl font-black text-white uppercase tracking-widest truncate">{selectedModel}</h1>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                        Laguna de Distribuição de Encomendas
                      </p>
                   </div>
                </div>
                
                {/* Visual Model Progress ring or badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Sincronia do Lote</p>
                    <p className="text-xs font-mono font-bold text-pink-400">
                      {selectedModelDivided} / {selectedModelTotal} un
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 font-mono text-xs font-black text-pink-300 shadow-md">
                    {selectedModelTotal > 0 ? Math.round((selectedModelDivided / selectedModelTotal) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Sub-header with search input specific to this model */}
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-end shrink-0">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute inset-y-0 left-3 my-auto text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Buscar por tamanho ou cor..." 
                    value={variationsSearch}
                    onChange={e => setVariationsSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:bg-white/10 focus:border-pink-500/30 transition-all text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Scrollable list of biquini variations */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {filteredSelectedItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs uppercase tracking-wider flex flex-col items-center gap-3">
                    <SlidersHorizontal size={24} className="opacity-30" />
                    <span>Nenhuma variação encontrada</span>
                  </div>
                ) : (
                  filteredSelectedItems.map(b => {
                    const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
                    const totalDivided = divided.embalados + divided.naBase + divided.paraConsertos + divided.emRecorte + divided.emProducao + (divided.sobras || 0);
                    const isFullyDivided = totalDivided === b.stock;
                    const isOverDivided = totalDivided > b.stock;
                    const remaining = b.stock - totalDivided;

                    return (
                      <div key={b.id} className={cn(
                        "rounded-3xl border bg-white/[0.01] transition-all duration-300 relative overflow-hidden group",
                        isFullyDivided ? "border-emerald-500/35 bg-gradient-to-b from-emerald-500/[0.03] to-transparent shadow-[0_4px_30px_rgba(16,185,129,0.02)]" :
                        isOverDivided ? "border-rose-500/40 bg-gradient-to-b from-rose-500/[0.03] to-transparent shadow-[0_4px_30px_rgba(244,63,94,0.03)]" : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                      )}>
                        
                        {/* Compact Item Header: Gorgeous styled bar */}
                        <div className="px-5 py-4 border-b border-white/5 flex flex-wrap items-center justify-between bg-white/[0.02] gap-3">
                          <div className="flex items-center gap-4">
                            {/* Colored chip indicator */}
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/15 bg-white/5 text-xs font-black text-white relative shrink-0 shadow-md">
                              {b.size}
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[1.5px] border-black shadow" style={{ backgroundColor: b.colorHex }} />
                            </div>
                            
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-100 text-xs md:text-sm tracking-widest uppercase truncate block">{b.colorName}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-mono">Diferença:</span>
                                <span className={cn(
                                  "text-[10px] font-mono font-bold",
                                  remaining === 0 ? "text-slate-400" :
                                  remaining > 0 ? "text-pink-400" : "text-rose-400"
                                )}>
                                  {remaining === 0 ? "Sincronizado" : remaining > 0 ? `Falta ${remaining}` : `Sobrou ${Math.abs(remaining)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Interactive actions for each item block */}
                          <div className="flex items-center gap-3 flex-wrap">
                            
                            {/* Autocomplete helper */}
                            {remaining > 0 && (
                              <button
                                onClick={() => handleAutoFillRemaining(b)}
                                title="Distribuir todo o estoque faltante para Embalados"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-300 text-[10px] font-black uppercase tracking-wider hover:bg-pink-500/20 active:scale-95 transition-all shadow-md group-hover:border-pink-500/40"
                              >
                                <Zap size={11} className="fill-pink-300" />
                                Distribuir Tudo (+{remaining})
                              </button>
                            )}

                            {/* Clear / Reset Button if any stock has been placed */}
                            {totalDivided > 0 && (
                              <button
                                onClick={() => handleResetBikini(b)}
                                title="Zerar todos os campos deste tamanho"
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all active:scale-95 text-xs p-1"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}

                            {/* Numeric completion tag */}
                            <div className={cn(
                              "flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl font-extrabold border shadow-sm",
                              isFullyDivided ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                              isOverDivided ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-slate-300 bg-white/5 border-white/5"
                            )}>
                               <span>{totalDivided}</span>
                               <span className="opacity-40">/</span>
                               <span>{b.stock} un</span>
                            </div>

                            {isFullyDivided && (
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                                <CheckCircle size={15} />
                              </div>
                            )}

                            {isOverDivided && (
                              <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/15 flex items-center justify-center text-rose-400 shrink-0" title="Quantidade distribuída excede o total do estoque!">
                                <AlertTriangle size={15} className="animate-bounce" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Redesigned grid with custom labeled inputs */}
                        <div className="p-4 md:p-6 bg-white/[0.005]">
                          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                            
                            {/* Stage 1: Embalados */}
                            <div className="relative group/input flex flex-col bg-slate-950/20 border border-white/5 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500/35 transition-all">
                               <div className="flex items-center justify-between text-slate-400">
                                 <span className="text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                   <Package size={11} className="text-pink-400" /> 
                                   Embalados
                                 </span>
                               </div>
                               <input 
                                 type="number" 
                                 min="0"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 value={divided.embalados || ''} 
                                 onChange={(e) => handleChange(b.id, 'embalados', e.target.value, b)}
                                 className="w-full bg-transparent border-0 text-white font-mono text-center text-lg focus:outline-none placeholder:text-white/5 pt-2.5 font-bold" 
                                 placeholder="0"
                               />
                            </div>

                            {/* Stage 2: Na Base */}
                            <div className="relative group/input flex flex-col bg-slate-950/20 border border-white/5 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/35 transition-all">
                               <div className="flex items-center justify-between text-slate-400">
                                 <span className="text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                   <Anchor size={11} className="text-blue-400" /> 
                                   Na Base
                                 </span>
                               </div>
                               <input 
                                 type="number" 
                                 min="0"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 value={divided.naBase || ''} 
                                 onChange={(e) => handleChange(b.id, 'naBase', e.target.value, b)}
                                 className="w-full bg-transparent border-0 text-white font-mono text-center text-lg focus:outline-none placeholder:text-white/5 pt-2.5 font-bold" 
                                 placeholder="0"
                               />
                            </div>

                            {/* Stage 3: Em Produção */}
                            <div className="relative group/input flex flex-col bg-slate-950/20 border border-white/5 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-yellow-500/20 focus-within:border-yellow-500/35 transition-all">
                               <div className="flex items-center justify-between text-slate-400">
                                 <span className="text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                   <Factory size={11} className="text-yellow-400" /> 
                                   Produção
                                 </span>
                               </div>
                               <input 
                                 type="number" 
                                 min="0"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 value={divided.emProducao || ''} 
                                 onChange={(e) => handleChange(b.id, 'emProducao', e.target.value, b)}
                                 className="w-full bg-transparent border-0 text-white font-mono text-center text-lg focus:outline-none placeholder:text-white/5 pt-2.5 font-bold" 
                                 placeholder="0"
                               />
                            </div>

                            {/* Stage 4: Em Recorte */}
                            <div className="relative group/input flex flex-col bg-slate-950/20 border border-white/5 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500/35 transition-all">
                               <div className="flex items-center justify-between text-slate-400">
                                 <span className="text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                   <Scissors size={11} className="text-teal-400" /> 
                                   Recorte
                                 </span>
                               </div>
                               <input 
                                 type="number" 
                                 min="0"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 value={divided.emRecorte || ''} 
                                 onChange={(e) => handleChange(b.id, 'emRecorte', e.target.value, b)}
                                 className="w-full bg-transparent border-0 text-white font-mono text-center text-lg focus:outline-none placeholder:text-white/5 pt-2.5 font-bold" 
                                 placeholder="0"
                               />
                            </div>

                            {/* Stage 5: Para Consertos */}
                            <div className="relative group/input flex flex-col bg-slate-950/20 border border-white/5 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/35 transition-all">
                               <div className="flex items-center justify-between text-slate-400">
                                 <span className="text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                   <Wrench size={11} className="text-orange-400" /> 
                                   Consertos
                                 </span>
                               </div>
                               <input 
                                 type="number" 
                                 min="0"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 value={divided.paraConsertos || ''} 
                                 onChange={(e) => handleChange(b.id, 'paraConsertos', e.target.value, b)}
                                 className="w-full bg-transparent border-0 text-white font-mono text-center text-lg focus:outline-none placeholder:text-white/5 pt-2.5 font-bold" 
                                 placeholder="0"
                               />
                            </div>

                            {/* Stage 6: Sobras */}
                            <div className="relative group/input flex flex-col bg-slate-950/20 border border-white/5 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500/35 transition-all">
                               <div className="flex items-center justify-between text-slate-400">
                                 <span className="text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                   <Package size={11} className="text-purple-400" /> 
                                   Sobras
                                 </span>
                               </div>
                               <input 
                                 type="number" 
                                 min="0"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 value={divided.sobras || ''} 
                                 onChange={(e) => handleChange(b.id, 'sobras', e.target.value, b)}
                                 className="w-full bg-transparent border-0 text-white font-mono text-center text-lg focus:outline-none placeholder:text-white/5 pt-2.5 font-bold" 
                                 placeholder="0"
                               />
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center space-y-4">
               <Waves size={48} className="text-pink-500 opacity-25 animate-pulse" />
               <p className="tracking-widest uppercase font-bold text-xs">Selecione um modelo na barra lateral<br/>para iniciar a divisão.</p>
               <div className="flex items-center gap-2 max-w-sm text-[11px] text-slate-400 rounded-xl bg-white/[0.02] border border-white/5 p-3.5 mt-2 text-left">
                 <Info size={14} className="shrink-0 text-pink-400" />
                 <span className="leading-relaxed">Filtre seus biquínis pelos status pendente ou completo no menu esquerdo para agilizar a rastreabilidade logística de seus pacotes.</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
