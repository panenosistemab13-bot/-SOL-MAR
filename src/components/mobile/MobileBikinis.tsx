import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Bikini } from '../../types';
import { 
  Plus, 
  Minus, 
  Search, 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  Check, 
  X,
  Tag
} from 'lucide-react';

export function MobileBikinis() {
  const { 
    bikinis, 
    updateBikiniStock, 
    setBikiniStock, 
    addBikiniModel, 
    removeBikiniModel, 
    currentUser, 
    isReadOnly 
  } = useInventory();

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('ALL');
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');

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

  // Auto-select first model
  useEffect(() => {
    if (groupedByModel.length > 0 && !selectedModel) {
      setSelectedModel(groupedByModel[0][0]);
    }
  }, [groupedByModel, selectedModel]);

  // Active items for selected model
  const activeItems = useMemo(() => {
    if (!selectedModel) return [];
    const modelData = groupedByModel.find(([m]) => m === selectedModel);
    return modelData ? modelData[1] : [];
  }, [selectedModel, groupedByModel]);

  // Filter variations for active items
  const filteredItems = useMemo(() => {
    return activeItems.filter(v => {
      const matchesSearch = !search.trim() || 
        v.size.toLowerCase().includes(search.toLowerCase()) || 
        v.colorName.toLowerCase().includes(search.toLowerCase());
      const matchesSize = selectedSizeFilter === 'ALL' || v.size === selectedSizeFilter;
      return matchesSearch && matchesSize;
    });
  }, [activeItems, search, selectedSizeFilter]);

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

  const selectedModelTotalStock = activeItems.reduce((acc, b) => acc + b.stock, 0);

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;
    addBikiniModel(newModelName.trim());
    setSelectedModel(newModelName.trim().toUpperCase());
    setNewModelName('');
    setIsAddingModel(false);
  };

  const handleDeleteCurrentModel = () => {
    if (!selectedModel) return;
    if (window.confirm(`Tem certeza que deseja excluir o modelo "${selectedModel}" e todas as suas variações?`)) {
      removeBikiniModel(selectedModel);
      setSelectedModel(null);
    }
  };

  const handleSaveStock = (id: string) => {
    const parsed = parseInt(tempStockValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setBikiniStock(id, parsed);
    }
    setEditingStockId(null);
  };

  return (
    <div className="space-y-4 pb-6 select-none font-sans">
      {/* Title & Search Bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#D6AD62] uppercase block">
            COLEÇÕES SOL & MAR
          </span>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Estoque de Biquínis
          </h2>
        </div>

        {isAdmOrMestre && !isReadOnly && (
          <button
            onClick={() => setIsAddingModel(!isAddingModel)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] font-bold text-xs tracking-wider uppercase shrink-0 shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            title="Novo Modelo"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Modelo</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D6AD62]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar estampa, cor ou tamanho..."
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

      {/* Add Model Form (Drawer) */}
      {isAddingModel && (
        <form onSubmit={handleAddModel} className="p-4 rounded-2xl bg-[#171511] border border-[#D6AD62]/40 shadow-lg space-y-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#D6AD62]" /> Criar Novo Modelo
            </span>
            <button type="button" onClick={() => setIsAddingModel(false)} className="text-[#F5F0E7] hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="Ex: CORTININHA RIPPLE"
              className="flex-1 bg-black/50 border border-[#D6AD62]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#F5F0E7]/40 focus:outline-none focus:border-[#D6AD62]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] font-bold text-xs shrink-0 shadow active:scale-95"
            >
              Criar
            </button>
          </div>
        </form>
      )}

      {/* Horizontal Model Selector Pills with Gold Glow */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6AD62]">
            Modelos ({groupedByModel.length})
          </span>
          <span className="text-[10px] font-mono text-[#F5F0E7]/60">
            Deslize para ver mais →
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {groupedByModel.map(([modelName, items]) => {
            const isSelected = selectedModel === modelName;
            const modelStock = items.reduce((acc, b) => acc + b.stock, 0);

            return (
              <button
                key={modelName}
                onClick={() => setSelectedModel(modelName)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-200 shrink-0 flex items-center gap-2 shadow-sm ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] shadow-[0_0_15px_rgba(214,173,98,0.35)] scale-[1.02]'
                    : 'bg-[#171511] border border-[#D6AD62]/20 text-[#F5F0E7] hover:border-[#D6AD62]/50'
                }`}
              >
                <span>{modelName}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-black/40 text-[#D6AD62]'
                }`}>
                  {modelStock}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Active Header Summary & Size Filters */}
      {selectedModel && (
        <div className="p-3.5 rounded-2xl bg-[#171511] border border-[#D6AD62]/25 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-[#D6AD62] tracking-widest uppercase block">
                Modelo Ativo
              </span>
              <h2 className="text-base font-serif font-bold text-white tracking-wide truncate max-w-[210px]">
                {selectedModel}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[9px] text-[#F5F0E7]/70 uppercase block">Total</span>
                <span className="text-sm font-mono font-bold text-[#D6AD62]">
                  {selectedModelTotalStock} un
                </span>
              </div>

              {isAdmOrMestre && !isReadOnly && (
                <button
                  onClick={handleDeleteCurrentModel}
                  className="p-1.5 rounded-xl bg-red-950/30 text-red-300 border border-red-500/25 hover:bg-red-900/50 transition-colors ml-1"
                  title="Excluir Modelo"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Size Filter Pills (Horizontal) */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#D6AD62]/15">
            <span className="text-[10px] text-[#D6AD62] uppercase font-bold mr-1">Tamanho:</span>
            {['ALL', 'P', 'M', 'G', 'GG'].map((size) => {
              const isActive = selectedSizeFilter === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSizeFilter(size)}
                  className={`flex-1 py-1 rounded-xl text-[10px] font-bold font-mono transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] shadow-sm'
                      : 'bg-black/30 border border-[#D6AD62]/20 text-[#F5F0E7] hover:text-[#D6AD62]'
                  }`}
                >
                  {size === 'ALL' ? 'Todos' : size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grouped Variations by Color (Vertical List) */}
      <div className="space-y-3">
        {groupedByColor.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#171511]/60 border border-[#D6AD62]/20 text-[#F5F0E7]/70 space-y-2">
            <Tag size={24} className="mx-auto text-[#D6AD62]/40" />
            <p className="text-xs">Nenhuma peça encontrada com os filtros atuais.</p>
          </div>
        ) : (
          groupedByColor.map(([colorName, { colorHex, items }]) => {
            const colorTotal = items.reduce((acc, b) => acc + b.stock, 0);

            return (
              <div 
                key={colorName} 
                className="rounded-2xl bg-[#171511] border border-[#D6AD62]/20 overflow-hidden shadow-md"
              >
                {/* Color Header Row */}
                <div className="px-3.5 py-2.5 bg-black/40 border-b border-[#D6AD62]/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0" 
                      style={{ backgroundColor: colorHex }} 
                    />
                    <span className="text-xs font-bold text-white tracking-wide">
                      {colorName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#D6AD62]">
                    {colorTotal} <span className="text-[9px] font-normal text-[#F5F0E7]/60">peças</span>
                  </span>
                </div>

                {/* Items in this color */}
                <div className="divide-y divide-[#D6AD62]/10">
                  {items.map((bikini) => {
                    const isLow = bikini.stock <= bikini.minStockAlert;
                    const isEditing = editingStockId === bikini.id;

                    return (
                      <div 
                        key={bikini.id} 
                        className="px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Size Badge & Alerts */}
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-black/40 border border-[#D6AD62]/30 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
                            {bikini.size}
                          </span>
                          
                          {isLow && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-[#D6AD62] bg-[#D6AD62]/15 border border-[#D6AD62]/30 px-1.5 py-0.5 rounded-md">
                              <AlertCircle size={10} /> Repor
                            </span>
                          )}
                        </div>

                        {/* Stock Controls - Grouped Horizontally */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={tempStockValue}
                                onChange={(e) => setTempStockValue(e.target.value)}
                                className="w-14 bg-black/80 border border-[#D6AD62] rounded-xl px-2 py-1 text-center font-mono font-bold text-xs text-white focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveStock(bikini.id)}
                                className="p-1 rounded-xl bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08]"
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (!isReadOnly) {
                                  setEditingStockId(bikini.id);
                                  setTempStockValue(String(bikini.stock));
                                }
                              }}
                              className="px-2.5 py-1 rounded-xl bg-black/40 border border-[#D6AD62]/25 font-mono font-bold text-sm text-[#D6AD62] hover:border-[#D6AD62] transition-all min-w-[50px] text-center"
                              title="Toque para editar número"
                            >
                              {bikini.stock}
                            </button>
                          )}

                          {!isReadOnly && (
                            <div className="flex items-center gap-1 bg-black/40 border border-[#D6AD62]/25 rounded-xl p-0.5">
                              <button
                                onClick={() => updateBikiniStock(bikini.id, -1)}
                                disabled={bikini.stock <= 0}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#D6AD62] hover:bg-[#D6AD62]/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                title="Diminuir"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-[1px] h-4 bg-[#D6AD62]/20" />
                              <button
                                onClick={() => updateBikiniStock(bikini.id, 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#D6AD62] hover:bg-[#D6AD62]/20 active:scale-95 transition-all"
                                title="Aumentar"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
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
  );
}
