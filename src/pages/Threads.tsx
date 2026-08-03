import React, { useState, useMemo, useEffect } from 'react';
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
  Trash2,
  PackagePlus,
  Filter,
  Check,
  X,
  Layers,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { cn } from '../lib/utils';
import { Thread } from '../types';

const PRESET_COLORS = [
  { name: 'Amarelo', hex: '#FACC15' },
  { name: 'Vermelho Borgonha', hex: '#800020' },
  { name: 'Preto', hex: '#000000' },
  { name: 'Rosa Bebê', hex: '#FBCFE8' },
  { name: 'Rosa Pink', hex: '#EC4899' },
  { name: 'Azul Claro', hex: '#93C5FD' },
  { name: 'Azul Marinho', hex: '#1E3A8A' },
  { name: 'Roxo Escuro', hex: '#4C1D95' },
  { name: 'Roxo Claro', hex: '#C4B5FD' },
  { name: 'Marrom Claro', hex: '#C19A6B' },
  { name: 'Marrom Escuro', hex: '#654321' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Laranja', hex: '#F97316' },
  { name: 'Verde', hex: '#22C55E' }
];

const getTypeIcon = (typeName: string, size = 14) => {
  const upper = typeName.toUpperCase();
  if (upper.includes('RETA')) return <Anchor size={size} />;
  if (upper.includes('FIO')) return <Waves size={size} />;
  if (upper.includes('ELÁSTICO') || upper.includes('ELASTICO')) return <SlidersHorizontal size={size} />;
  if (upper.includes('ARGOLA') || upper.includes('BOJO')) return <LifeBuoy size={size} />;
  if (upper.includes('ETIQUETA') || upper.includes('FITA')) return <Sparkles size={size} />;
  if (upper.includes('SOL') || upper.includes('TECIDO') || upper.includes('FORRO')) return <Sun size={size} />;
  return <PackagePlus size={size} />;
};

function ColorCodeInput({ 
  colorName, 
  initialCode, 
  updateThreadColorCode, 
  isReadOnly,
  isElastic 
}: { 
  colorName: string; 
  initialCode: string; 
  updateThreadColorCode: (colorName: string, code: string) => void; 
  isReadOnly?: boolean; 
  isElastic?: boolean;
}) {
  const [localCode, setLocalCode] = useState(initialCode || '');
  const isFocusedRef = React.useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalCode(initialCode || '');
    }
  }, [initialCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalCode(val);
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (localCode !== (initialCode || '')) {
      updateThreadColorCode(colorName, localCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-[#ebdcb9]/15 border border-[#ebdcb9]/40 hover:border-[#ebdcb9] focus-within:border-[#ebdcb9] focus-within:bg-black/80 px-2.5 py-1 rounded-xl shadow-inner transition-all">
      <span className="text-[10px] font-black text-[#ebdcb9] uppercase tracking-wider whitespace-nowrap select-none">
        {isElastic ? 'NÚMERO:' : 'CODIGO:'}
      </span>
      <input 
        type="text"
        disabled={isReadOnly}
        placeholder={isElastic ? "7" : "163"}
        value={localCode}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-20 bg-transparent text-amber-300 font-mono font-black text-xs focus:outline-none placeholder:text-stone-500 uppercase tracking-wider select-text"
        title={isElastic ? "Digite o número / tamanho do elástico (Exemplo: 7, 10mm)" : "Digite o código da cor (Exemplo: 163)"}
      />
    </div>
  );
}

export function Threads() {
  const { threads, updateThreadStock, setThreadStock, updateThreadColorCode, addThread, removeThread, isReadOnly } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('FIO');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState('ELÁSTICO');
  const [customType, setCustomType] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('');
  const [newColorHex, setNewColorHex] = useState('#EC4899');
  const [newInitialStock, setNewInitialStock] = useState<number>(10);
  const [newMinStock, setNewMinStock] = useState<number>(20);

  const customTypeInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newType === 'OUTRO') {
      setTimeout(() => customTypeInputRef.current?.focus(), 50);
    } else if (newType === 'ELÁSTICO') {
      setNewColorName('BRANCO');
      setNewColorHex('#FFFFFF');
    } else if (newType === 'ARGOLAS OASIS') {
      setNewColorName('DOURADO AMARELADO');
      setNewColorHex('#EAB308');
      setNewColorCode('PADRÃO');
    }
  }, [newType]);
  
  // Delete confirm modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get unique types from existing threads
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();
    threads.forEach(t => typesSet.add(t.name.toUpperCase()));
    return Array.from(typesSet);
  }, [threads]);

  // Ensure selectedType defaults to first available category if current selection is invalid
  useEffect(() => {
    if (availableTypes.length > 0 && (!selectedType || !availableTypes.includes(selectedType))) {
      setSelectedType(availableTypes[0]);
    }
  }, [availableTypes, selectedType]);

  // Filter threads based on Type, Search, and Critical status
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchesType = !selectedType || t.name.toUpperCase() === selectedType;
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                            t.colorName.toLowerCase().includes(search.toLowerCase()) ||
                            (t.colorCode && t.colorCode.toLowerCase().includes(search.toLowerCase()));
      const matchesCritical = !filterCriticalOnly || t.stock <= t.minStockAlert;
      return matchesType && matchesSearch && matchesCritical;
    });
  }, [threads, search, selectedType, filterCriticalOnly]);

  // Group filtered threads by color and number/code so each number/code has its own card ("aba")
  const groupedByColor = useMemo(() => {
    const grouped: Record<string, { cardTitle: string; colorName: string; colorCode: string; colorHex: string; items: Thread[] }> = {};
    
    filteredThreads.forEach(item => {
      const isElastic = item.name.toUpperCase().includes('ELÁSTICO') || item.name.toUpperCase().includes('ELASTICO');
      
      // Key that separates different numbers / items into distinct cards
      let key = `${item.name.toUpperCase()}_${item.colorName.toUpperCase()}`;
      if (item.colorCode && item.colorCode.trim()) {
        key += `_${item.colorCode.trim().toUpperCase()}`;
      } else {
        key += `_${item.id}`;
      }

      let cardTitle = item.colorName;
      if (isElastic) {
        cardTitle = item.colorCode ? `ELÁSTICO NÚMERO ${item.colorCode}` : `ELÁSTICO`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          cardTitle,
          colorName: item.colorName,
          colorCode: item.colorCode || '',
          colorHex: item.colorHex || '#FFFFFF',
          items: []
        };
      }
      grouped[key].items.push(item);
    });

    return Object.entries(grouped)
      .map(([key, data]) => [key, data] as const)
      .sort((a, b) => a[1].cardTitle.localeCompare(b[1].cardTitle, undefined, { numeric: true }));
  }, [filteredThreads]);

  // Aggregate stats
  const totalStock = useMemo(() => {
    return threads.reduce((sum, item) => sum + item.stock, 0);
  }, [threads]);

  const criticalItems = useMemo(() => {
    return threads.filter(t => t.stock <= t.minStockAlert);
  }, [threads]);

  const normalItems = useMemo(() => {
    return threads.filter(t => t.stock > t.minStockAlert);
  }, [threads]);

  // Coastal wave percentage
  const tidePercentage = useMemo(() => {
    if (threads.length === 0) return 0;
    const maxReference = threads.length * 50; // Assuming 50 units is full average capacity
    const percentage = Math.min(100, Math.round((totalStock / maxReference) * 100));
    return percentage;
  }, [threads, totalStock]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return filteredThreads.map(t => ({
      name: `${t.colorName} (${t.name})`,
      tipo: t.name,
      Estoque: t.stock,
      Alerta: t.minStockAlert,
      color: t.colorHex
    })).sort((a, b) => b.Estoque - a.Estoque).slice(0, 15);
  }, [filteredThreads]);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    const finalTypeName = (newType === 'OUTRO' ? customType : newType).trim().toUpperCase();
    const isElastic = finalTypeName.includes('ELÁSTICO') || finalTypeName.includes('ELASTICO');
    const isArgolas = finalTypeName.includes('ARGOLA') || finalTypeName.includes('OASIS');
    
    let finalColorName = isElastic ? 'BRANCO' : newColorName.trim();
    if (isArgolas) {
      if (!finalColorName || (finalColorName.toUpperCase() !== 'DOURADO AMARELADO' && finalColorName.toUpperCase() !== 'DOURADO ROSADO')) {
        finalColorName = 'DOURADO AMARELADO';
      } else {
        finalColorName = finalColorName.toUpperCase();
      }
    }

    let finalColorHex = isElastic 
      ? '#FFFFFF' 
      : isArgolas 
        ? (finalColorName.toUpperCase().includes('ROSADO') ? '#FB7185' : '#EAB308')
        : newColorHex;

    let finalColorCode = newColorCode.trim();
    if (isArgolas && !finalColorCode) {
      finalColorCode = 'PADRÃO';
    }

    if (!finalTypeName) {
      alert('Por favor, selecione ou digite o tipo/categoria do insumo (ex: ELÁSTICO, FIO, RETA, ETIQUETA...).');
      return;
    }

    if (!finalColorName) {
      finalColorName = 'PADRÃO';
    }

    // Check if duplicate exists with same type, color, and number/code
    const exists = threads.some(
      t => t.name.toUpperCase() === finalTypeName && 
           t.colorName.toLowerCase() === finalColorName.toLowerCase() &&
           (t.colorCode || '').trim().toLowerCase() === finalColorCode.toLowerCase()
    );

    if (exists) {
      const codeMsg = finalColorCode ? ` (Nº/Cód: ${finalColorCode})` : '';
      alert(`O insumo "${finalTypeName}" na cor "${finalColorName}"${codeMsg} já está cadastrado no sistema.`);
      return;
    }

    addThread({
      name: finalTypeName,
      colorName: finalColorName,
      colorCode: finalColorCode,
      colorHex: finalColorHex,
      stock: Math.max(0, newInitialStock),
      minStockAlert: Math.max(0, newMinStock)
    });

    setIsAddModalOpen(false);
    setNewColorName(newType === 'ELÁSTICO' ? 'BRANCO' : '');
    setNewColorCode('');
    setCustomType('');
    showToast(`Insumo ${finalTypeName} (${finalColorName}) cadastrado com sucesso!`);
  };

  const handleDeleteThread = (id: string) => {
    if (isReadOnly) return;
    const item = threads.find(t => t.id === id);
    removeThread(id);
    setDeletingId(null);
    if (item) {
      showToast(`Insumo ${item.name} (${item.colorName}) removido!`);
    }
  };

  return (
    <div className="relative md:rounded-[3.2rem] overflow-hidden md:border md:border-[#ebdcb9]/15 bg-[#130d08]/75 backdrop-blur-xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] text-white p-4 md:p-10 space-y-6 md:space-y-10 min-h-full">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 text-white font-black px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400/30 flex items-center gap-3 backdrop-blur-md animate-bounce">
          <Check size={20} className="text-white" />
          <span className="text-xs uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-[0.05] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-[600px] h-[350px] bg-[#ebdcb9]/5 blur-[140px] rounded-full pointer-events-none -translate-y-24" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#c5a880]/5 blur-[130px] rounded-full pointer-events-none translate-y-20" />

      {/* HEADER SECTION */}
      <div className="relative bg-gradient-to-r from-[#ebdcb9]/15 via-black/50 to-[#c5a880]/10 rounded-2xl sm:rounded-[2.8rem] border border-white/5 p-4 sm:p-6 md:p-10 flex flex-col xl:flex-row items-center justify-between gap-6 sm:gap-8 backdrop-blur-3xl overflow-hidden shadow-2xl select-none">
        <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full xl:w-auto">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-tr from-[#ebdcb9] to-[#ad9e7a] p-0.5 shadow-xl flex items-center justify-center relative group overflow-hidden shrink-0">
            <div className="w-full h-full bg-[#3d2723] rounded-xl sm:rounded-[28px] flex items-center justify-center text-[#ebdcb9]">
              <Compass className="w-7 h-7 sm:w-10 sm:h-10 animate-spin text-[#ebdcb9]" style={{ animationDuration: '25s' }} />
            </div>
            <Waves className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 text-[#ebdcb9] animate-bounce" />
          </div>
          <div>
            <span className="text-[8px] sm:text-[10px] font-black tracking-[0.3em] text-[#ebdcb9] uppercase bg-[#ebdcb9]/10 px-2.5 py-1 rounded-full border border-[#ebdcb9]/25 flex items-center gap-1.5 sm:gap-2 w-fit shadow-lg">
              <Sparkles size={11} className="animate-pulse text-amber-400" /> SOL & MAR — EMBROIDERY SYSTEM
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#ebdcb9] tracking-tight mt-1">
              Insumos & Fios
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 uppercase tracking-widest font-mono">Gestão Completa de Linhas, Retas, Elásticos e Aviamentos</p>
          </div>
        </div>

        {/* Action Button & Tide Mini Display */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto z-10">
          
          {/* Tide Indicator */}
          <div className="flex-1 bg-slate-950/60 border border-white/10 rounded-3xl p-4 flex items-center gap-4 transition-all hover:border-[#ebdcb9]/30 overflow-hidden relative w-full sm:w-auto">
            <div 
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-amber-500/15 via-amber-500/5 to-transparent transition-all duration-1000 ease-out z-0" 
              style={{ height: `${tidePercentage}%` }}
            />
            <div className="w-12 h-12 rounded-2xl bg-[#ebdcb9]/10 flex items-center justify-center text-[#ebdcb9] border border-[#ebdcb9]/20 relative z-10 shrink-0">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Nível da Maré</p>
              <p className="text-lg font-black text-[#ebdcb9] font-mono">{tidePercentage}% <span className="text-[10px] text-slate-500 font-normal">Capacidade</span></p>
              <p className="text-[9px] text-slate-400 font-sans mt-0.5 font-bold uppercase tracking-wider">
                {tidePercentage > 75 
                  ? '🌊 MARÉ CHEIA (ESTOQUE ALTO)' 
                  : tidePercentage > 35 
                    ? '🌤️ MARÉ AMENA (ESTABILIZADO)' 
                    : '🚨 BAIXA-MAR (REPOSIÇÃO URGENTE)'}
              </p>
            </div>
          </div>



        </div>
      </div>

      {/* STATS & CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900/35 border border-white/10 rounded-[2.8rem] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 select-none">
            <div>
              <span className="text-[9px] font-black px-2.5 py-1 bg-[#ebdcb9]/10 text-[#ebdcb9] border border-[#ebdcb9]/20 rounded-full tracking-wider uppercase">
                Análise de Maré de Linhas
              </span>
              <h3 className="text-lg font-extrabold text-white tracking-wider mt-1 flex items-center gap-2">
                <Palette size={16} className="text-[#ebdcb9] animate-pulse" /> Maiores Estoques por Cor & Insumo
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ebdcb9] shadow-[0_0_6px_#ebdcb9]" />
                <span className="text-slate-400 uppercase text-[10px]">Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span className="text-rose-400 uppercase text-[10px]">Crítico</span>
              </div>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-wider">
              Nenhum insumo encontrado para o filtro atual
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
                      backgroundColor: '#130d08ef', 
                      borderRadius: '1.5rem', 
                      borderColor: '#ebdcb930',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="Estoque" radius={[12, 12, 0, 0]} maxBarSize={30}>
                    {chartData.map((entry, index) => {
                      const isLow = entry.Estoque <= entry.Alerta;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isLow ? '#f43f5e' : '#ebdcb9'}
                          fillOpacity={0.85}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Resumo Costeiro Badge */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-white/10 rounded-[2.8rem] p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-black px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full tracking-wider uppercase">
              Métricas Rápidas
            </span>
            <h3 className="text-lg font-extrabold text-white tracking-wider">Resumo de Insumos</h3>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total em Bobinas/Carretéis</span>
                <span className="text-lg font-bold text-[#ebdcb9] font-mono">{totalStock} <span className="text-[9px] text-slate-500">unid</span></span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Estoque Normal</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{normalItems.length} <span className="text-[9px] text-slate-500">itens</span></span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Abaixo do Mínimo</span>
                <button
                  onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
                  className={cn(
                    "text-lg font-bold font-mono px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-2",
                    criticalItems.length > 0 ? "text-rose-400 bg-rose-500/10 border border-rose-500/30" : "text-slate-400"
                  )}
                >
                  {criticalItems.length} <span className="text-[9px] text-slate-500 font-bold">críticos</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={12} className="text-[#ebdcb9] animate-pulse" /> Sincronizado instantaneamente no banco SOL & MAR
          </div>
        </div>

      </div>

      {/* CATEGORY TABS BAR */}
      <div className="relative bg-slate-900/40 border border-white/10 rounded-2xl sm:rounded-[2rem] p-3 backdrop-blur-xl z-10 shadow-lg flex items-center overflow-x-auto no-scrollbar scrollbar-none">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-0.5">
          {availableTypes.map(type => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                  isActive 
                    ? "bg-[#ebdcb9] text-[#3d2723] shadow-md font-extrabold" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {getTypeIcon(type, 13)}
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIONS & SEARCH BAR */}
      <div className="relative bg-slate-900/40 border border-white/10 rounded-[2rem] p-3 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-xl z-10 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Quick Add Insumo Button */}
          {!isReadOnly && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-tr from-[#ebdcb9] via-[#ad9e7a] to-[#c5a880] text-[#3d2723] rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg"
            >
              <PackagePlus size={15} /> Adicionar Novos Insumos
            </button>
          )}

          {/* Critical Only Toggle Button */}
          <button
            onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
            className={cn(
              "w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0",
              filterCriticalOnly 
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40" 
                : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
            )}
          >
            <AlertCircle size={15} />
            {filterCriticalOnly ? "Mostrando Somente Críticos" : "Filtrar Críticos"}
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input 
            type="text" 
            placeholder="Buscar por cor ou insumo..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-[#ebdcb9]/30 focus:border-[#ebdcb9] transition-all rounded-xl text-xs font-bold text-white focus:outline-none placeholder:text-stone-500"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* CARDS GRID - GROUPED BY COLOR */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between select-none">
          <span className="text-xs font-bold tracking-widest text-[#ebdcb9] uppercase bg-[#ebdcb9]/10 px-3.5 py-1.5 rounded-full border border-[#ebdcb9]/20 flex items-center gap-2 shadow-sm">
            <Palette size={14} className="text-[#ebdcb9] animate-bounce" /> CORES DE INSUMO ({groupedByColor.length} CORES)
          </span>
          <span className="text-[10px] text-slate-400 tracking-tight uppercase font-bold">
            Utilize os botões + e - para ajustar o estoque de cada item
          </span>
        </div>

        {groupedByColor.length === 0 ? (
          <div className="bg-black/30 rounded-[3rem] border border-white/5 py-20 text-center shadow-xl backdrop-blur-xl flex flex-col items-center justify-center gap-4">
            <Waves size={40} className="text-slate-600 animate-bounce" />
            <p className="text-slate-400 tracking-widest font-bold text-xs uppercase">Nenhum insumo encontrado nesta categoria ou busca.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isReadOnly && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-tr from-[#ebdcb9] via-[#ad9e7a] to-[#c5a880] text-[#3d2723] px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                >
                  <PackagePlus size={16} /> Adicionar Novos Insumos
                </button>
              )}
              {(search || (availableTypes.length > 0 && selectedType !== availableTypes[0]) || filterCriticalOnly) && (
                <button
                  onClick={() => {
                    setSearch('');
                    if (availableTypes.length > 0) setSelectedType(availableTypes[0]);
                    setFilterCriticalOnly(false);
                  }}
                  className="text-xs font-black text-[#ebdcb9] underline uppercase tracking-widest cursor-pointer px-3 py-2"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedByColor.map(([cardKey, group]) => {
              const colorGroupTotalStock = group.items.reduce((sum, item) => sum + item.stock, 0);
              const isElasticGroup = group.items.some(i => i.name.toUpperCase().includes('ELÁSTICO') || i.name.toUpperCase().includes('ELASTICO'));
              const mainItemId = group.items[0]?.id;
              const stableCardKey = mainItemId ? `card_${mainItemId}` : cardKey;
              
              return (
                <div 
                  key={stableCardKey}
                  className="border border-[#ebdcb9]/15 bg-black/50 rounded-[2.5rem] p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden group/color-card"
                >
                  {/* Subtle color glow in background */}
                  <div 
                    className="absolute -top-10 -right-10 w-28 h-28 blur-3xl rounded-full opacity-10 pointer-events-none" 
                    style={{ backgroundColor: group.colorHex }}
                  />
                  
                  {/* Color Info Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/5 relative z-10 gap-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-7 h-7 rounded-full border border-white/30 shadow-lg relative shrink-0" 
                        style={{ 
                          backgroundColor: group.colorHex,
                          boxShadow: `0 0 12px ${group.colorHex}65, inset 0 1px 1px rgba(255,255,255,0.4)`
                        }} 
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black tracking-wider uppercase text-white">
                            {isElasticGroup ? (group.colorCode ? `ELÁSTICO Nº ${group.colorCode}` : 'ELÁSTICO') : group.colorName}
                          </h4>
                          
                          {/* ESPAÇO PARA O CÓDIGO DA COR / NÚMERO DO ELÁSTICO */}
                          <ColorCodeInput 
                            colorName={mainItemId || group.colorName}
                            initialCode={group.colorCode}
                            updateThreadColorCode={updateThreadColorCode}
                            isReadOnly={isReadOnly}
                            isElastic={isElasticGroup}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                          {isElasticGroup ? `COR: ${group.colorName}` : `${group.items.length} variaçõ${group.items.length === 1 ? 'ão' : 'ões'}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Total: </span>
                      <span className="text-xs font-black text-[#ebdcb9] font-mono">{colorGroupTotalStock} u</span>
                    </div>
                  </div>

                  {/* Vertical Stack inside Color Group */}
                  <div className="space-y-3 relative z-10">
                    {group.items.map((v) => {
                      const isCritical = v.stock <= v.minStockAlert;
                      const activeCode = v.colorCode || threads.find(t => t.colorName.toLowerCase() === v.colorName.toLowerCase() && t.colorCode)?.colorCode;
                      const isElasticItem = v.name.toUpperCase().includes('ELÁSTICO') || v.name.toUpperCase().includes('ELASTICO');
                      return (
                        <div 
                          key={v.id} 
                          className={cn(
                            "p-3.5 rounded-2xl border flex flex-col gap-3 transition-all relative overflow-hidden",
                            isCritical 
                              ? "bg-rose-500/10 border-rose-500/30" 
                              : "bg-white/[0.02] border-white/10 hover:border-[#ebdcb9]/30"
                          )}
                        >
                          {/* Item Name & Stock Status Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0",
                                v.name.toUpperCase().includes('RETA')
                                  ? 'bg-sky-500/10 border-sky-400/20 text-sky-400' 
                                  : isElasticItem
                                    ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400'
                                    : 'bg-amber-500/10 border-amber-400/20 text-amber-400'
                              )}>
                                {getTypeIcon(v.name, 14)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-xs uppercase tracking-wider text-white">
                                    {v.name}
                                  </span>
                                  {activeCode && (
                                    <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                      {isElasticItem ? `Nº: ${activeCode}` : `CÓD: ${activeCode}`}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold block">
                                  Mínimo alerta: {v.minStockAlert}u
                                </span>
                              </div>
                            </div>

                            {/* Stock Badge & Delete Button */}
                            <div className="flex items-center gap-2">
                              {isCritical ? (
                                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                  <AlertCircle size={11} /> Baixo
                                </span>
                              ) : (
                                <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                  OK
                                </span>
                              )}

                              {!isReadOnly && (
                                <button
                                  onClick={() => setDeletingId(v.id)}
                                  title="Excluir Insumo"
                                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* CONTROLS ROW: Minus, Direct Input, Plus, Quick Adjustments */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                            
                            {/* Stock - / + Controls */}
                            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                              <button
                                disabled={isReadOnly || v.stock <= 0}
                                onClick={() => updateThreadStock(v.id, -1)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 active:scale-90 disabled:opacity-30 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                                title="Diminuir 1"
                              >
                                <Minus size={14} />
                              </button>

                              <input
                                type="number"
                                disabled={isReadOnly}
                                value={v.stock === 0 ? '' : v.stock}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value, 10);
                                  setThreadStock(v.id, isNaN(parsed) ? 0 : Math.max(0, parsed));
                                }}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                placeholder="0"
                                className={cn(
                                  "w-16 text-center bg-white/5 border border-white/20 rounded-lg py-1 font-mono text-sm font-black select-text focus:outline-none focus:border-amber-400 transition-all",
                                  isCritical ? "text-rose-400" : "text-amber-300"
                                )}
                              />

                              <button
                                disabled={isReadOnly}
                                onClick={() => updateThreadStock(v.id, 1)}
                                className="w-8 h-8 rounded-lg bg-[#ebdcb9] hover:brightness-110 active:scale-90 text-[#3d2723] font-bold flex items-center justify-center transition-all cursor-pointer shadow-md"
                                title="Aumentar 1"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Quick Adjustment Chips */}
                            {!isReadOnly && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateThreadStock(v.id, 5)}
                                  className="px-2 py-1 bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 rounded-lg text-[10px] font-black cursor-pointer transition-all"
                                  title="Adicionar +5"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => updateThreadStock(v.id, 10)}
                                  className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-black cursor-pointer transition-all"
                                  title="Adicionar +10"
                                >
                                  +10
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
            })}
          </div>
        )}
      </div>

      {/* CREATE NEW INSUMO / THREAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#2a1c13] border border-[#ebdcb9]/30 rounded-2xl p-3 sm:p-4 max-w-sm w-full space-y-3 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer p-2 rounded-xl bg-white/5"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ebdcb9]/10 border border-[#ebdcb9]/30 flex items-center justify-center text-[#ebdcb9]">
                <PackagePlus size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Cadastrar Novo Insumo</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Adicionar Linha, Reta, Elástico ou Aviamento</p>
              </div>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-5">
              {/* Tipo de Insumo */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Tipo / Categoria do Insumo
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {['ELÁSTICO', 'FIO', 'RETA', 'ARGOLAS OASIS', 'ETIQUETA', 'SOL OASIS', 'OUTRO'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={cn(
                        "py-2.5 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5",
                        newType === t 
                          ? "bg-[#ebdcb9] text-[#3d2723] border-[#ebdcb9] shadow-md font-extrabold" 
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      )}
                    >
                      {getTypeIcon(t, 12)}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>

                {newType === 'OUTRO' && (
                  <input
                    ref={customTypeInputRef}
                    type="text"
                    required
                    placeholder="Digite a nova categoria (Ex: FORRO, FITA, AVIAMENTOS)..."
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full mt-2 bg-white/5 border border-[#ebdcb9]/40 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#ebdcb9]"
                  />
                )}
              </div>

              {/* Nome da Cor e Código/Número do Insumo */}
              {(() => {
                const isElasticForm = newType === 'ELÁSTICO' || (newType === 'OUTRO' && customType.toUpperCase().includes('ELÁSTICO'));
                const isArgolasForm = newType === 'ARGOLAS OASIS' || (newType === 'OUTRO' && (customType.toUpperCase().includes('ARGOLA') || customType.toUpperCase().includes('OASIS')));

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                          <span>
                            {isElasticForm 
                              ? 'Cor do Elástico' 
                              : isArgolasForm 
                                ? 'Cor da Argola Oasis' 
                                : 'Nome da Cor / Tonalidade'}
                          </span>
                          {isElasticForm && (
                            <span className="text-[9px] text-amber-300 font-black bg-amber-400/15 px-2 py-0.5 rounded border border-amber-400/30">
                              FIXO EM BRANCO
                            </span>
                          )}
                          {isArgolasForm && (
                            <span className="text-[9px] text-amber-300 font-black bg-amber-400/15 px-2 py-0.5 rounded border border-amber-400/30">
                              OPÇÕES FIXAS (2 CORES)
                            </span>
                          )}
                        </label>

                        {isArgolasForm ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNewColorName('DOURADO AMARELADO');
                                setNewColorHex('#EAB308');
                              }}
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-xl border transition-all text-left cursor-pointer",
                                newColorName.toUpperCase().includes('AMARELADO') || !newColorName.toUpperCase().includes('ROSADO')
                                  ? "bg-amber-400/15 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/30 font-black"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                              )}
                            >
                              <div className="w-5 h-5 rounded-full bg-[#EAB308] border border-amber-300 shrink-0 shadow-sm" />
                              <div className="flex flex-col">
                                <span className="text-[11px] uppercase font-bold tracking-tight text-amber-100">DOURADO</span>
                                <span className="text-[9px] font-black tracking-wider text-amber-300">AMARELADO</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setNewColorName('DOURADO ROSADO');
                                setNewColorHex('#FB7185');
                              }}
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-xl border transition-all text-left cursor-pointer",
                                newColorName.toUpperCase().includes('ROSADO')
                                  ? "bg-rose-500/15 border-rose-400 text-rose-200 shadow-md ring-1 ring-rose-400/30 font-black"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                              )}
                            >
                              <div className="w-5 h-5 rounded-full bg-[#FB7185] border border-rose-300 shrink-0 shadow-sm" />
                              <div className="flex flex-col">
                                <span className="text-[11px] uppercase font-bold tracking-tight text-rose-100">DOURADO</span>
                                <span className="text-[9px] font-black tracking-wider text-rose-300">ROSADO</span>
                              </div>
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            required
                            readOnly={isElasticForm}
                            placeholder="Ex: Verde, Rosa Bebê..."
                            value={isElasticForm ? 'BRANCO' : newColorName}
                            onChange={(e) => !isElasticForm && setNewColorName(e.target.value)}
                            className={cn(
                              "w-full bg-white/5 border rounded-xl px-4 py-3 text-xs font-bold outline-none",
                              isElasticForm 
                                ? "border-amber-400/40 text-amber-200 cursor-not-allowed bg-amber-400/5 font-extrabold" 
                                : "border-[#ebdcb9]/20 text-white focus:border-[#ebdcb9]"
                            )}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          {isElasticForm 
                            ? 'Número = Tamanho' 
                            : isArgolasForm 
                              ? 'Variação / Tam (Vazio = PADRÃO)' 
                              : 'Código (Ex: 163)'}
                        </label>
                        <input
                          type="text"
                          readOnly={isArgolasForm}
                          placeholder={
                            isElasticForm 
                              ? "Ex: 7, 10mm, Nº 12" 
                              : isArgolasForm 
                                ? "PADRÃO" 
                                : "Ex: 163"
                          }
                          value={isArgolasForm ? 'PADRÃO' : newColorCode}
                          onChange={(e) => setNewColorCode(e.target.value)}
                          className="w-full bg-white/5 border border-[#ebdcb9]/20 rounded-xl px-4 py-3 text-xs font-bold font-mono text-amber-300 outline-none focus:border-[#ebdcb9]"
                        />
                        {isElasticForm && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                              Atalhos de Numeração:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {['5', '6', '7', '8', '10', '12', '14', '16'].map(num => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setNewColorCode(num)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border",
                                    newColorCode === num 
                                      ? "bg-amber-400 text-black border-amber-300 font-extrabold shadow-sm scale-105" 
                                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-amber-300"
                                  )}
                                >
                                  Nº {num}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {isArgolasForm && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                              Atalhos de Variação:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {['PADRÃO'].map(varOpt => (
                                <button
                                  key={varOpt}
                                  type="button"
                                  onClick={() => setNewColorCode(varOpt)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border",
                                    (newColorCode || 'PADRÃO') === varOpt 
                                      ? "bg-amber-400 text-black border-amber-300 font-extrabold shadow-sm scale-105" 
                                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-amber-300"
                                  )}
                                >
                                  {varOpt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Palette Color Presets & Custom Picker */}
                    {isElasticForm ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          Cor Visual do Elástico
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-7 h-7 rounded-full border-2 border-amber-400 bg-white shadow-lg shrink-0" />
                          <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                            BRANCO (#FFFFFF) — COR FIXA PARA ELÁSTICOS
                          </span>
                        </div>
                      </div>
                    ) : isArgolasForm ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          Cor Visual Selecionada (Argolas Oasis)
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                          <div 
                            className="w-7 h-7 rounded-full border-2 border-amber-400 shadow-lg shrink-0" 
                            style={{ backgroundColor: newColorName.toUpperCase().includes('ROSADO') ? '#FB7185' : '#EAB308' }}
                          />
                          <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                            {newColorName.toUpperCase().includes('ROSADO') ? 'DOURADO ROSADO (#FB7185)' : 'DOURADO AMARELADO (#EAB308)'} — COR FIXA
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                          <span>Selecione a Cor Visual</span>
                          <span className="font-mono text-[#ebdcb9]">{newColorHex}</span>
                        </label>
                        
                        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-32 overflow-y-auto">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setNewColorHex(c.hex);
                                if (!newColorName) setNewColorName(c.name);
                              }}
                              title={c.name}
                              className={cn(
                                "w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative shrink-0",
                                newColorHex.toLowerCase() === c.hex.toLowerCase()
                                  ? "border-amber-400 scale-110 shadow-lg"
                                  : "border-white/20 hover:scale-105"
                              )}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-7 h-7 rounded-full bg-transparent border-0 cursor-pointer p-0"
                            title="Seletor Personalizado"
                          />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Quantidade Inicial & Alerta Mínimo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-[#ebdcb9]/20 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#ebdcb9]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Alerta Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-[#ebdcb9]/20 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#ebdcb9]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-tr from-[#ebdcb9] via-[#ad9e7a] to-[#c5a880] text-[#3d2723] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <PackagePlus size={16} /> Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#130d08] border border-rose-500/30 rounded-[2rem] p-6 max-w-sm w-full space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Excluir Insumo?</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">
                Esta ação removerá este insumo do controle de estoque do sistema.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteThread(deletingId)}
                className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
