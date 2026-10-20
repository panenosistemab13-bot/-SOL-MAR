import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Bikini, BikiniStockDivided } from '../../types';
import { 
  Search, 
  Package, 
  Scissors, 
  Wrench, 
  Factory, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Plus,
  Minus,
  X
} from 'lucide-react';

const STAGE_CONFIG = [
  { key: 'embalados', label: 'Embalados', icon: Package },
  { key: 'naBase', label: 'Na Base', icon: Factory },
  { key: 'emProducao', label: 'Em Produção', icon: Sparkles },
  { key: 'emRecorte', label: 'Em Recorte', icon: Scissors },
  { key: 'paraConsertos', label: 'Conserto', icon: Wrench },
  { key: 'sobras', label: 'Sobras', icon: AlertTriangle },
] as const;

export function MobileEstoqueEncomenda() {
  const { bikinis, updateBikiniDividedStock, isReadOnly } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'todos' | 'pendentes' | 'completos'>('todos');

  // Compute analytics
  const totalStats = useMemo(() => {
    let embalados = 0;
    let naBase = 0;
    let emProducao = 0;
    let emRecorte = 0;
    let paraConsertos = 0;
    let sobras = 0;

    bikinis.forEach(b => {
      const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
      embalados += divided.embalados || 0;
      naBase += divided.naBase || 0;
      emProducao += divided.emProducao || 0;
      emRecorte += divided.emRecorte || 0;
      paraConsertos += divided.paraConsertos || 0;
      sobras += divided.sobras || 0;
    });

    return { embalados, naBase, emProducao, emRecorte, paraConsertos, sobras };
  }, [bikinis]);

  // Group by model
  const models = useMemo(() => {
    const set = new Set<string>();
    bikinis.forEach(b => set.add(b.model));
    return Array.from(set).sort();
  }, [bikinis]);

  // Default select first model
  React.useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  // Filtered items
  const filteredBikinis = useMemo(() => {
    return bikinis.filter(b => {
      const matchesModel = !selectedModel || b.model === selectedModel;
      const matchesSearch = !search.trim() || 
        b.model.toLowerCase().includes(search.toLowerCase()) || 
        b.colorName.toLowerCase().includes(search.toLowerCase()) || 
        b.size.toLowerCase().includes(search.toLowerCase());

      const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
      const sumDivided = (divided.embalados || 0) + (divided.naBase || 0) + (divided.emProducao || 0) + (divided.emRecorte || 0) + (divided.paraConsertos || 0) + (divided.sobras || 0);

      if (filterType === 'pendentes') {
        return matchesModel && matchesSearch && sumDivided < b.stock;
      }
      if (filterType === 'completos') {
        return matchesModel && matchesSearch && sumDivided >= b.stock;
      }
      return matchesModel && matchesSearch;
    });
  }, [bikinis, selectedModel, search, filterType]);

  const handleStageChange = (bikini: Bikini, stageKey: keyof BikiniStockDivided, delta: number) => {
    if (isReadOnly) return;
    const current = bikini.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
    const currentValue = current[stageKey] || 0;
    const nextValue = Math.max(0, currentValue + delta);

    const updated: BikiniStockDivided = {
      ...current,
      [stageKey]: nextValue
    };

    updateBikiniDividedStock(bikini.id, updated);
  };

  return (
    <div className="space-y-4 pb-6 select-none font-sans">
      {/* Title */}
      <div className="px-1">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#D6AD62] uppercase block">
          PRODUÇÃO & ENCOMENDAS
        </span>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Estágios de Pedidos
        </h2>
      </div>

      {/* Top Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D6AD62]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar encomenda por estampa, modelo, tam..."
          className="w-full bg-[#171511] border border-[#D6AD62]/25 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-[#F5F0E7]/40 focus:outline-none focus:border-[#D6AD62] shadow-inner"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E7]/70 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Horizontal Stages Summary Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="p-2.5 rounded-2xl bg-[#171511] border border-[#D6AD62]/25 shrink-0 min-w-[95px] text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Embalados
          </span>
          <span className="text-sm font-mono font-bold text-white mt-0.5 block">
            {totalStats.embalados}
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#171511] border border-[#D6AD62]/25 shrink-0 min-w-[95px] text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Na Base
          </span>
          <span className="text-sm font-mono font-bold text-white mt-0.5 block">
            {totalStats.naBase}
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#171511] border border-[#D6AD62]/25 shrink-0 min-w-[95px] text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Produção
          </span>
          <span className="text-sm font-mono font-bold text-white mt-0.5 block">
            {totalStats.emProducao}
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#171511] border border-[#D6AD62]/25 shrink-0 min-w-[95px] text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Recorte
          </span>
          <span className="text-sm font-mono font-bold text-white mt-0.5 block">
            {totalStats.emRecorte}
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#171511] border border-[#D6AD62]/25 shrink-0 min-w-[95px] text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Consertos
          </span>
          <span className="text-sm font-mono font-bold text-white mt-0.5 block">
            {totalStats.paraConsertos}
          </span>
        </div>
      </div>

      {/* Horizontal Model Selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {models.map(m => {
          const isSelected = selectedModel === m;
          return (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold tracking-wide whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] shadow-sm font-bold'
                  : 'bg-[#171511] border border-[#D6AD62]/20 text-[#F5F0E7] hover:border-[#D6AD62]/50'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Filter Status Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 shadow-sm">
        {(['todos', 'pendentes', 'completos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
              filterType === tab
                ? 'bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] shadow-sm'
                : 'text-[#F5F0E7] hover:text-[#D6AD62]'
            }`}
          >
            {tab === 'todos' ? 'Todos' : tab === 'pendentes' ? 'Pendentes' : 'Completos'}
          </button>
        ))}
      </div>

      {/* Vertical List of Bikini Encomendas */}
      <div className="space-y-3">
        {filteredBikinis.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#171511]/60 border border-[#D6AD62]/20 text-[#F5F0E7]/70 space-y-2">
            <Package size={24} className="mx-auto text-[#D6AD62]/40" />
            <p className="text-xs">Nenhum registro encontrado para este filtro.</p>
          </div>
        ) : (
          filteredBikinis.map(b => {
            const divided = b.dividedStock || { embalados: 0, naBase: 0, paraConsertos: 0, emRecorte: 0, emProducao: 0, sobras: 0 };
            const sumDivided = (divided.embalados || 0) + (divided.naBase || 0) + (divided.emProducao || 0) + (divided.emRecorte || 0) + (divided.paraConsertos || 0) + (divided.sobras || 0);
            const isComplete = sumDivided >= b.stock;

            return (
              <div 
                key={b.id} 
                className="p-3.5 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 shadow-md space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0" 
                      style={{ backgroundColor: b.colorHex }} 
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {b.colorName}
                      </p>
                      <p className="text-[10px] text-[#D6AD62] font-mono">
                        {b.model} • Tam: <span className="font-bold text-white">{b.size}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stock vs Divided Pill */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      isComplete 
                        ? 'bg-[#D6AD62]/15 border-[#D6AD62]/40 text-[#D6AD62]' 
                        : 'bg-[#F3D99B]/15 border-[#F3D99B]/40 text-[#F3D99B]'
                    }`}>
                      {sumDivided} / {b.stock} un
                    </span>
                    {isComplete && <CheckCircle2 size={13} className="text-[#D6AD62]" />}
                  </div>
                </div>

                {/* 6 Stages Grid (2 columns on mobile) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D6AD62]/10">
                  {STAGE_CONFIG.map(({ key, label }) => {
                    const val = divided[key] || 0;
                    return (
                      <div 
                        key={key} 
                        className="p-2 rounded-xl bg-black/40 border border-[#D6AD62]/15 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="text-[9px] text-[#F5F0E7]/80 font-medium block truncate">
                            {label}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {val}
                          </span>
                        </div>

                        {!isReadOnly && (
                          <div className="flex items-center gap-0.5 shrink-0 bg-black/50 rounded-lg p-0.5 border border-[#D6AD62]/20">
                            <button
                              onClick={() => handleStageChange(b, key, -1)}
                              disabled={val <= 0}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#D6AD62] hover:bg-[#D6AD62]/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Minus size={11} />
                            </button>
                            <button
                              onClick={() => handleStageChange(b, key, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#D6AD62] hover:bg-[#D6AD62]/20 active:scale-95"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        )}
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
  );
}
