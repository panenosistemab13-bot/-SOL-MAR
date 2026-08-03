import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Bikini } from '../types';
import { cn } from '../lib/utils';
import { Plus, Minus, Search, AlertCircle, Sun, Waves, Sparkles, Anchor, ChevronRight, Eye, Layers } from 'lucide-react';

export function Bikinis() {
  const { bikinis, updateBikiniStock, setBikiniStock, addBikiniModel, removeBikiniModel, currentUser, isReadOnly, theme } = useInventory();
  const isLight = theme === 'light';
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  // Group all bikinis by model
  const groupedByModel = useMemo(() => {
    const grouped = bikinis.reduce((acc, current) => {
      if (!acc[current.model]) {
        acc[current.model] = [];
      }
      acc[current.model].push(current);
      return acc;
    }, {} as Record<string, Bikini[]>);

    return Object.entries(grouped).sort(([modelA], [modelB]) => modelA.localeCompare(modelB));
  }, [bikinis]);

  // If no model is selected and we have models, auto-select the first one
  useEffect(() => {
    if (groupedByModel.length > 0 && !selectedModel) {
      setSelectedModel(groupedByModel[0][0]);
    }
  }, [groupedByModel, selectedModel]);

  // Total metrics count
  const totalModelsCount = groupedByModel.length;
  const totalOverallStock = bikinis.reduce((acc, b) => acc + b.stock, 0);

  // Get active items for the selected model
  const activeItems = useMemo(() => {
    if (!selectedModel) return [];
    const modelData = groupedByModel.find(([m]) => m === selectedModel);
    return modelData ? modelData[1] : [];
  }, [selectedModel, groupedByModel]);

  // Filter variations for active items
  const filteredItems = useMemo(() => {
    if (!search.trim()) return activeItems;
    return activeItems.filter(v => 
      v.size.toLowerCase().includes(search.toLowerCase()) || 
      v.colorName.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeItems, search]);

  // Group filtered items by color
  const groupedByColor = useMemo(() => {
    const grouped: Record<string, { colorHex: string; items: Bikini[] }> = {};
    filteredItems.forEach(item => {
      if (!grouped[item.colorName]) {
        grouped[item.colorName] = {
          colorHex: item.colorHex,
          items: []
        };
      }
      grouped[item.colorName].items.push(item);
    });
    return Object.entries(grouped).sort(([colorA], [colorB]) => colorA.localeCompare(colorB));
  }, [filteredItems]);

  return (
    <div className={cn(
      "relative md:rounded-[2.5rem] overflow-hidden md:border backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-4 md:p-8 space-y-6 md:space-y-8 min-h-full transition-colors duration-300",
      isLight ? "bg-white border-slate-200 text-black shadow-slate-200/50" : "bg-[#130d08]/75 border-[#ebdcb9]/15 text-white"
    )}>
      {/* Immersive Ocean Background Layer */}
      {!isLight && (
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center tracking-normal opacity-[0.05] mix-blend-overlay pointer-events-none"
        />
      )}

      {/* Decorative Wave Glows */}
      <div className={cn(
        "absolute top-0 right-1/4 w-[500px] h-[350px] blur-[130px] rounded-full pointer-events-none -translate-y-20",
        isLight ? "bg-pink-100/30" : "bg-pink-500/10"
      )} />
      <div className={cn(
        "absolute bottom-10 left-1/4 w-[400px] h-[300px] blur-[120px] rounded-full pointer-events-none translate-y-20",
        isLight ? "bg-blue-100/20" : "bg-sky-500/10"
      )} />

      {/* Luxury Beach Header Section */}
      <div className={cn(
        "relative rounded-2xl sm:rounded-[2.2rem] border p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 backdrop-blur-xl overflow-hidden shadow-inner select-none transition-all",
        isLight 
          ? "bg-gradient-to-r from-amber-50 to-blue-50 border-slate-100" 
          : "bg-gradient-to-r from-[#ebdcb9]/10 via-[#c5a880]/5 to-black/40 border-white/5"
      )}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-[0.05] pointer-events-none" />
        
        {/* Glowing Sun and Waves visual title */}
        <div className="flex items-center gap-3.5 sm:gap-5 relative z-10 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#ebdcb9] to-[#ad9e7a] p-0.5 shadow-lg flex items-center justify-center relative group overflow-hidden shrink-0">
            <div className="w-full h-full bg-[#3d2723] rounded-[14px] flex items-center justify-center text-[#ebdcb9]">
              <Sun className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse text-[#ebdcb9]" />
            </div>
            <Waves className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ebdcb9] animate-bounce" />
          </div>
          <div className="min-w-0">
            <span className={cn(
              "text-[9px] sm:text-[10px] font-black tracking-[0.25em] uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit shadow-sm",
              isLight 
                ? "text-amber-700 bg-amber-50 border-amber-200" 
                : "text-[#ebdcb9] bg-[#ebdcb9]/10 border-[#cbdcb9]/20"
            )}>
              <Sparkles size={11} className={cn("animate-pulse", isLight ? "text-amber-500" : "text-[#ebdcb9]")} /> PORTAL DE BIQUÍNIS
            </span>
            <h2 className={cn(
              "text-xl sm:text-3xl font-serif tracking-wide mt-1",
              isLight ? "text-slate-900" : "text-[#fbf8f2]"
            )}>
              Grade de Estampa & Estoques
            </h2>
          </div>
        </div>

        {/* Dynamic visual dashboard stats bar in Header */}
        <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-md relative z-10 shadow-lg shrink-0 w-full md:w-auto justify-around md:justify-start">
          <div className="text-center md:text-right border-r border-[#ebdcb9]/10 pr-4 sm:pr-6 mr-1 sm:mr-2">
            <p className="text-[8px] sm:text-[9px] text-[#c5a880] font-bold uppercase tracking-widest">Modelagens</p>
            <p className="text-lg sm:text-xl font-extrabold text-[#ebdcb9] font-mono mt-0.5">{totalModelsCount}</p>
          </div>
          <div className="text-center md:text-right flex items-center gap-2.5 sm:gap-3">
            <div>
              <p className="text-[8px] sm:text-[9px] text-[#c5a880] font-bold uppercase tracking-widest">Disponibilidade</p>
              <p className="text-lg sm:text-xl font-black text-[#ebdcb9] font-mono mt-0.5">{totalOverallStock} <span className="text-[9px] sm:text-[10px] text-[#c5a880]/60 font-bold font-sans">un</span></p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ebdcb9]/15 flex items-center justify-center text-[#ebdcb9] border border-[#ebdcb9]/20">
              <Anchor size={14} className="animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Model Selector Carousel (lg:hidden) */}
      {groupedByModel.length > 0 && (
        <div className="lg:hidden w-full overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 scrollbar-none">
          {groupedByModel.map(([model, items]) => {
            const isSelected = selectedModel === model;
            const modelStock = items.reduce((sum, b) => sum + b.stock, 0);
            return (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap active:scale-95",
                  isSelected
                    ? "border-[#ebdcb9] bg-[#ebdcb9]/20 text-[#ebdcb9] shadow-md ring-1 ring-[#ebdcb9]/40"
                    : (isLight ? "border-slate-200 bg-slate-100 text-slate-600" : "border-white/10 bg-slate-900/60 text-stone-300 hover:bg-white/5")
                )}
              >
                <span>{model}</span>
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded",
                  isLight ? "bg-slate-200 text-slate-500" : "bg-black/40 text-stone-400"
                )}>
                  {modelStock}u
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Immersive Column Split Layout: Left vertical grouped "MODELOS DISPONÍVEIS", Right showing "Variações Ativas" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10">
        
        {/* Left Column: MODELOS DISPONÍVEIS (Hidden on mobile when pill bar is shown, or stacked) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[11px] font-black tracking-widest text-[#ebdcb9] uppercase bg-[#ebdcb9]/10 px-3 py-1 rounded-full border border-[#ebdcb9]/25 flex items-center gap-1.5 shadow-sm">
              <Layers size={12} className="text-[#ebdcb9] animate-pulse" /> MODELOS DISPONÍVEIS
            </span>
            {isAdmOrMestre && !isReadOnly && (
              <button
                onClick={() => {
                  setIsAddingModel(!isAddingModel);
                  setErrorMsg(null);
                  setNewModelName('');
                }}
                className="text-[10px] font-bold text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500 border border-sky-500/25 px-2.5 py-1 rounded-lg transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
                title="Adicionar Novo Modelo"
              >
                + Novo
              </button>
            )}
          </div>

          {isAddingModel && (
            <div className="p-4 rounded-[1.5rem] bg-slate-900/60 border border-sky-500/30 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">Novo Modelo de Biquíni</h4>
              <p className="text-[9px] text-slate-400 leading-normal">
                Insira o nome da nova modelagem. O sistema criará as variações correspondentes de tamanhos (P, M, G) e todas as cores com quantidade inicial 0.
              </p>
              
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Nome do Modelo"
                  value={newModelName}
                  onChange={e => setNewModelName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none uppercase"
                />
                {errorMsg && (
                  <p className="text-[9px] text-rose-400 font-medium">{errorMsg}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const name = newModelName.trim().toUpperCase();
                    if (!name) {
                      setErrorMsg('Digite um nome válido.');
                      return;
                    }
                    if (bikinis.some(b => b.model.toUpperCase() === name)) {
                      setErrorMsg('Esse modelo já existe.');
                      return;
                    }
                    addBikiniModel(name);
                    setSelectedModel(name);
                    setIsAddingModel(false);
                    setNewModelName('');
                    setErrorMsg(null);
                  }}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition duration-150 uppercase tracking-wider cursor-pointer"
                >
                  Criar Modelo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingModel(false);
                    setNewModelName('');
                    setErrorMsg(null);
                  }}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[10px] px-3.5 py-2 rounded-xl transition duration-150 uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {groupedByModel.length === 0 ? (
            <div className="bg-slate-900/20 rounded-[2rem] border border-white/5 p-8 text-center shadow-xl backdrop-blur-lg">
               <Waves size={24} className="text-pink-500 mx-auto opacity-20 animate-bounce mb-2" />
               <p className="text-slate-400 font-sans tracking-wide font-bold text-[10px] uppercase">Nenhuma modelagem ativa.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {groupedByModel.map(([model, items]) => {
                const isSelected = selectedModel === model;
                const modelStock = items.reduce((sum, b) => sum + b.stock, 0);
                const isLowStock = items.some(v => v.stock <= v.minStockAlert);
                const firstLetter = model.charAt(0);

                return (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={cn(
                      "relative group rounded-[2rem] border text-left p-4 transition-all duration-300 select-none overflow-hidden flex items-center justify-between backdrop-blur-md shadow-lg w-full",
                      isSelected 
                        ? (isLight ? "border-amber-400 bg-amber-50 text-amber-900 shadow-amber-100 ring-2 ring-amber-200" : "border-pink-500/60 bg-gradient-to-r from-pink-500/[0.15] via-slate-900/40 to-slate-950/80 shadow-pink-500/10 ring-2 ring-pink-500/20")
                        : (isLight ? "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600" : "border-white/5 bg-slate-900/35 hover:border-sky-500/30 hover:bg-slate-900/40")
                    )}
                  >
                    {/* Subtle waves flare in background */}
                    <div className={cn(
                      "absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full pointer-events-none transition-all duration-500",
                      isSelected ? "bg-pink-500/10" : "bg-sky-500/5 group-hover:bg-sky-500/10"
                    )} />

                    {/* Left: icon/letter + model info */}
                    <div className="flex items-center gap-3.5 relative z-10 min-w-0 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm tracking-wider border shrink-0 transition-all duration-300",
                        isSelected 
                          ? "bg-gradient-to-tr from-pink-500 to-sky-400 border-pink-400/20 text-white shadow-md shadow-pink-500/15" 
                          : "bg-white/5 border-white/10 group-hover:border-sky-400/40"
                      )}>
                        <span className={cn(
                          "relative z-10 transition-colors",
                          isSelected ? "text-white" : "text-transparent bg-clip-text bg-gradient-to-tr from-sky-300 to-pink-300"
                        )}>{firstLetter}</span>
                      </div>

                      <div className="min-w-0">
                        <h3 className={cn(
                          "text-[11px] font-black tracking-widest uppercase truncate transition-colors",
                          isSelected ? "text-[#ebdcb9]" : "text-[#d7cab5] group-hover:text-white"
                        )}>
                          {model}
                        </h3>
                        <span className="text-[8px] text-[#c5a880]/80 uppercase tracking-widest font-extrabold mt-0.5 block">
                          {items.length} variações
                        </span>
                      </div>
                    </div>

                    {/* Right: Low warning & stock badge */}
                    <div className="flex items-center gap-2 relative z-10 shrink-0">
                      {isLowStock && (
                        <div className="w-2 h-2 rounded-full bg-orange-600 animate-ping shadow-[0_0_8px_#ea580c]" title="Maré Baixa" />
                      )}
                      <span className={cn(
                        "text-[10px] font-mono px-2.5 py-1 rounded-xl border font-bold shrink-0",
                        isSelected 
                          ? "bg-[#ebdcb9]/20 text-[#ebdcb9] border-[#ebdcb9]/40" 
                          : "bg-black/40 text-stone-400 border-white/5"
                      )}>
                        {modelStock} u
                      </span>
                    </div>

                    {/* Left accent border if selected */}
                    <div className={cn(
                      "absolute left-0 inset-y-0 w-1 transition-all duration-300",
                      isSelected ? "bg-gradient-to-b from-[#ebdcb9] to-[#c5a880]" : "bg-transparent"
                    )} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active model variations details / workbench */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9">
          {selectedModel ? (
            <div className={cn(
              "relative z-10 border rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500",
              isLight ? "bg-slate-50/50 border-slate-100" : "border-[#ebdcb9]/15 bg-black/20"
            )}>
              
              {/* Detailed Workstation Header */}
              <div className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b",
                isLight ? "border-slate-200" : "border-[#ebdcb9]/10"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0",
                    isLight ? "bg-amber-100 border-amber-200 text-amber-600" : "bg-gradient-to-tr from-[#ebdcb9]/20 to-[#c5a880]/10 border-[#ebdcb9]/15 text-[#ebdcb9]"
                  )}>
                    <Waves className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className={cn(
                      "text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-wider",
                      isLight ? "bg-amber-100 border-amber-200 text-amber-700" : "text-[#ebdcb9] bg-[#ebdcb9]/10 border border-[#ebdcb9]/25"
                    )}>
                      Variações Ativas
                    </span>
                    <div className="flex items-center gap-3.5 mt-1.5 flex-wrap">
                      <h3 className={cn("text-xl font-extrabold tracking-widest uppercase leading-none", isLight ? "text-slate-900" : "text-white")}>{selectedModel}</h3>
                      {isAdmOrMestre && !isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`ATENÇÃO: Tem certeza de que deseja deletar PERMANENTEMENTE o modelo "${selectedModel}" e TODAS as suas variações associadas? Esta ação excluirá todos os seus estoques correspondentes.`)) {
                              removeBikiniModel(selectedModel);
                              setSelectedModel(null);
                            }
                          }}
                          className="text-[9px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent px-2.5 py-1 rounded-xl transition duration-150 cursor-pointer shadow-sm hover:shadow-rose-500/10"
                        >
                          Remover Modelo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Search Tool */}
                <div className="relative">
                  <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isLight ? "text-slate-400" : "text-[#c5a880]")} size={13} />
                  <input 
                    type="text" 
                    placeholder="Buscar tamanho ou cor..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={cn(
                      "w-full sm:w-64 pl-8 pr-4 py-2 border transition-all rounded-full text-[11px] focus:outline-none",
                      isLight 
                        ? "bg-white border-slate-200 text-black placeholder:text-slate-400 focus:border-amber-400" 
                        : "bg-black/40 border border-[#ebdcb9]/15 text-white hover:border-[#ebdcb9]/45 placeholder:text-stone-600"
                    )}
                  />
                </div>
              </div>

              {/* Visual Capsules Grid to Adjust Stocks (Grouped by Color) */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-3 md:gap-6">
                {groupedByColor.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-slate-500 text-xs uppercase tracking-wider font-bold">
                    Nenhuma variação corresponde ao filtro
                  </div>
                ) : (
                  groupedByColor.map(([colorName, group]) => {
                    const colorGroupTotalStock = group.items.reduce((sum, item) => sum + item.stock, 0);
                    
                    return (
                      <div 
                        key={colorName}
                        className={cn(
                          "border rounded-xl p-2 space-y-2 shadow-sm relative overflow-hidden group/color-card",
                          isLight ? "bg-white border-slate-100 shadow-slate-200/50" : "border-[#ebdcb9]/10 bg-black/30"
                        )}
                      >
                        {/* Light subtle glow of the color itself at the background on hover */}
                        <div 
                          className="absolute -top-10 -right-10 w-28 h-28 blur-3xl rounded-full opacity-0 group-hover/color-card:opacity-10 transition-opacity duration-500 pointer-events-none" 
                          style={{ backgroundColor: group.colorHex }}
                        />
                        
                        {/* Color Info Header */}
                        <div className={cn(
                          "flex items-center justify-between pb-1.5 border-b relative z-10 select-none",
                          isLight ? "border-slate-50" : "border-white/5"
                        )}>
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="w-5 h-5 rounded-full border border-white/20 shadow-lg relative" 
                              style={{ 
                                backgroundColor: group.colorHex,
                                boxShadow: `0 0 12px ${group.colorHex}65, inset 0 1px 1px rgba(255,255,255,0.4)`
                              }} 
                            />
                            <div>
                              <h4 className={cn("text-[11px] font-black tracking-wider uppercase truncate max-w-[70px]", isLight ? "text-slate-800" : "text-slate-100")}>{colorName}</h4>
                            </div>
                          </div>
                          
                          <div className={cn(
                            "border px-1.5 py-0.5 rounded-lg text-right",
                            isLight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                          )}>
                            <span className={cn("text-[10px] font-black font-mono", isLight ? "text-slate-900" : "text-[#ebdcb9]")}>{colorGroupTotalStock} u</span>
                          </div>
                        </div>

                        {/* Sizes Grid inside this Color Group */}
                        <div className="grid grid-cols-3 gap-1 relative z-10">
                          {group.items.map(v => {
                            const isCritical = v.stock <= v.minStockAlert;
                            return (
                              <div 
                                key={v.id} 
                                className={cn(
                                  "p-1.5 rounded-lg border flex flex-col justify-between gap-0.5 hover:bg-opacity-80 transition-all relative overflow-hidden",
                                  isCritical 
                                    ? (isLight ? "border-rose-200 bg-rose-50" : "border-rose-500/20 bg-rose-500/[0.02]")
                                    : (isLight ? "bg-slate-50 border-slate-100 hover:border-amber-200" : "bg-white/[0.015] border-white/5 hover:border-sky-500/20 hover:bg-white/[0.03]")
                                )}
                              >
                                {isCritical && (
                                  <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-ping" />
                                )}

                                {/* Size Label & Little warning indicators */}
                                <div className="flex items-center justify-between pointer-events-none">
                                  <span className={cn(
                                    "font-black text-[10px] border px-1.5 py-0.5 rounded-lg",
                                    isLight ? "text-amber-700 bg-amber-50 border-amber-100" : "text-sky-400 bg-sky-500/10 border-sky-500/10"
                                  )}>
                                    {v.size}
                                  </span>
                                  {isCritical && (
                                    <span className="text-[8px] text-rose-400 font-black tracking-widest uppercase animate-pulse">Min</span>
                                  )}
                                </div>

                                {/* Stock Count (Manual Input) */}
                                <div className="text-center relative z-10 w-full">
                                  <input
                                    type="number"
                                    value={v.stock === 0 ? '' : v.stock}
                                    onChange={(e) => {
                                      const parsed = parseInt(e.target.value, 10);
                                      setBikiniStock(v.id, isNaN(parsed) ? 0 : Math.max(0, parsed));
                                    }}
                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                    placeholder="0"
                                    className={cn(
                                      "w-full bg-transparent text-center text-[11px] font-black outline-none py-0.5",
                                      "border rounded-xl font-mono text-xl font-black select-text focus:outline-none focus:ring-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                      isLight 
                                        ? "bg-white border-slate-200 text-slate-900 focus:border-amber-400" 
                                        : "bg-white/5 hover:bg-white/10 focus:bg-slate-950/90 border-white/5 focus:border-pink-500/40 text-white focus:text-pink-300"
                                    )}
                                  />
                                  <span className="text-[8px] text-slate-500 font-mono block uppercase mt-0.5 tracking-widest">Estoque</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className={cn(
              "rounded-[3rem] border py-24 text-center shadow-xl backdrop-blur-xl flex flex-col items-center justify-center gap-4",
              isLight ? "bg-slate-50 border-slate-100" : "bg-slate-900/40 border-white/5"
            )}>
              <Waves size={40} className="text-pink-500 opacity-20 animate-bounce" />
              <p className={cn("font-sans tracking-widest font-bold text-xs uppercase", isLight ? "text-slate-400" : "text-slate-400")}>Selecione um modelo à esquerda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
