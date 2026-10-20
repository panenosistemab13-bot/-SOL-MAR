import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Thread } from '../../types';
import { 
  Plus, 
  Minus, 
  Search, 
  AlertCircle, 
  Scissors, 
  Check, 
  X,
  Droplet
} from 'lucide-react';

export function MobileThreads() {
  const { threads, updateThreadStock, setThreadStock, isReadOnly } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'FIO' | 'RETA'>('FIO');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');

  // Filter threads based on Type AND Search
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchesType = t.name.toUpperCase() === selectedType;
      const matchesSearch = !search.trim() || 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        t.colorName.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [threads, search, selectedType]);

  // Group filtered threads by color
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

  const totalStock = useMemo(() => {
    return filteredThreads.reduce((sum, item) => sum + item.stock, 0);
  }, [filteredThreads]);

  const lowStockCount = useMemo(() => {
    return filteredThreads.filter(t => t.stock <= t.minStockAlert).length;
  }, [filteredThreads]);

  const handleSaveStock = (id: string) => {
    const parsed = parseInt(tempStockValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setThreadStock(id, parsed);
    }
    setEditingStockId(null);
  };

  return (
    <div className="space-y-4 pb-6 select-none font-sans">
      {/* Title */}
      <div className="px-1">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#D6AD62] uppercase block">
          ATELIÊ & CONFECÇÃO
        </span>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Insumos & Fios
        </h2>
      </div>

      {/* Type Switcher - Horizontal Segmented Control */}
      <div className="p-1 rounded-2xl bg-[#171511] border border-[#D6AD62]/25 flex gap-1 shadow-md">
        <button
          onClick={() => setSelectedType('FIO')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            selectedType === 'FIO'
              ? 'bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] shadow-md font-bold'
              : 'text-[#F5F0E7] hover:text-[#D6AD62]'
          }`}
        >
          <Scissors size={14} className="stroke-[2.2]" /> Fios Overlock
        </button>
        <button
          onClick={() => setSelectedType('RETA')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            selectedType === 'RETA'
              ? 'bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] shadow-md font-bold'
              : 'text-[#F5F0E7] hover:text-[#D6AD62]'
          }`}
        >
          <Scissors size={14} className="stroke-[2.2]" /> Linhas Reta
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D6AD62]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar cores em ${selectedType === 'FIO' ? 'Fios' : 'Retas'}...`}
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

      {/* Grouped Metrics Banner */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Carretéis
          </span>
          <span className="text-base font-mono font-bold text-white mt-0.5 block">
            {totalStock}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Cores
          </span>
          <span className="text-base font-mono font-bold text-white mt-0.5 block">
            {groupedByColor.length}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 text-center shadow-sm">
          <span className="text-[9px] font-bold text-[#D6AD62] uppercase tracking-wider block">
            Críticos
          </span>
          <span className={`text-base font-mono font-bold mt-0.5 block ${lowStockCount > 0 ? 'text-[#D6AD62]' : 'text-white'}`}>
            {lowStockCount}
          </span>
        </div>
      </div>

      {/* Vertical List of Threads Grouped by Color */}
      <div className="space-y-3">
        {groupedByColor.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#171511]/60 border border-[#D6AD62]/20 text-[#F5F0E7]/70 space-y-2">
            <Droplet size={24} className="mx-auto text-[#D6AD62]/40" />
            <p className="text-xs">Nenhum insumo encontrado para este filtro.</p>
          </div>
        ) : (
          groupedByColor.map(([colorName, { colorHex, items }]) => (
            <div 
              key={colorName} 
              className="rounded-2xl bg-[#171511] border border-[#D6AD62]/20 overflow-hidden shadow-md"
            >
              <div className="divide-y divide-[#D6AD62]/10">
                {items.map((thread) => {
                  const isLow = thread.stock <= thread.minStockAlert;
                  const isEditing = editingStockId === thread.id;

                  return (
                    <div 
                      key={thread.id} 
                      className="px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Color Preview & Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-5 h-5 rounded-full border border-white/40 shadow-sm shrink-0" 
                          style={{ backgroundColor: colorHex }} 
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate leading-tight">
                            {thread.colorName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-[#F5F0E7]/70 font-mono">
                              {thread.name}
                            </span>
                            {isLow && (
                              <span className="flex items-center gap-0.5 text-[8px] font-bold text-[#D6AD62] bg-[#D6AD62]/15 border border-[#D6AD62]/30 px-1 py-0.2 rounded">
                                <AlertCircle size={9} /> Repor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stock Stepper Controls */}
                      <div className="flex items-center gap-2 shrink-0">
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
                              onClick={() => handleSaveStock(thread.id)}
                              className="p-1 rounded-xl bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08]"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!isReadOnly) {
                                setEditingStockId(thread.id);
                                setTempStockValue(String(thread.stock));
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-black/40 border border-[#D6AD62]/25 font-mono font-bold text-sm text-[#D6AD62] hover:border-[#D6AD62] transition-all min-w-[50px] text-center"
                            title="Toque para editar"
                          >
                            {thread.stock}
                          </button>
                        )}

                        {!isReadOnly && (
                          <div className="flex items-center gap-1 bg-black/40 border border-[#D6AD62]/25 rounded-xl p-0.5">
                            <button
                              onClick={() => updateThreadStock(thread.id, -1)}
                              disabled={thread.stock <= 0}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#D6AD62] hover:bg-[#D6AD62]/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                              title="Diminuir"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="w-[1px] h-4 bg-[#D6AD62]/20" />
                            <button
                              onClick={() => updateThreadStock(thread.id, 1)}
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
          ))
        )}
      </div>
    </div>
  );
}
