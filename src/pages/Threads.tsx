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
  LifeBuoy, 
  Trash2,
  PackagePlus,
  Check,
  X,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
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
    setLocalCode(e.target.value);
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
    <div className="flex items-center gap-1.5 bg-[#ebdcb9]/15 border border-[#ebdcb9]/40 hover:border-[#ebdcb9] focus-within:border-[#ebdcb9] focus-within:bg-black/80 px-2 py-0.5 rounded-xl shadow-inner transition-all w-fit mt-1">
      <span className="text-[9px] font-black text-[#ebdcb9] uppercase tracking-wider whitespace-nowrap select-none">
        {isElastic ? 'Nº:' : 'CÓD:'}
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
        className="w-16 bg-transparent text-amber-300 font-mono font-black text-xs focus:outline-none placeholder:text-stone-500 uppercase tracking-wider select-text"
        title={isElastic ? "Digite o número / tamanho do elástico" : "Digite o código da cor"}
      />
    </div>
  );
}

export function Threads() {
  const { threads, updateThreadStock, setThreadStock, updateThreadColorCode, addThread, removeThread, isReadOnly, theme } = useInventory();
  const isLight = theme === 'light';
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);
  
  // Modal states for adding new threads
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

  // Get unique categories/types from existing threads
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();
    threads.forEach(t => typesSet.add(t.name.toUpperCase()));
    return Array.from(typesSet).sort();
  }, [threads]);

  // Auto-select first category if none is selected
  useEffect(() => {
    if (availableTypes.length > 0 && (!selectedType || !availableTypes.includes(selectedType))) {
      setSelectedType(availableTypes[0]);
    }
  }, [availableTypes, selectedType]);

  // Total metrics
  const totalStock = useMemo(() => {
    return threads.reduce((sum, item) => sum + item.stock, 0);
  }, [threads]);

  // Items for the selected category
  const activeTypeThreads = useMemo(() => {
    if (!selectedType) return [];
    return threads.filter(t => t.name.toUpperCase() === selectedType.toUpperCase());
  }, [threads, selectedType]);

  // Filter active items by search query & critical status
  const filteredThreads = useMemo(() => {
    return activeTypeThreads.filter(t => {
      const matchesSearch = !search.trim() || 
        t.colorName.toLowerCase().includes(search.toLowerCase()) ||
        (t.colorCode && t.colorCode.toLowerCase().includes(search.toLowerCase())) ||
        t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCritical = !filterCriticalOnly || t.stock <= t.minStockAlert;
      return matchesSearch && matchesCritical;
    });
  }, [activeTypeThreads, search, filterCriticalOnly]);

  // Group filtered items by color
  const groupedByColor = useMemo(() => {
    const grouped: Record<string, { cardTitle: string; colorName: string; colorCode: string; colorHex: string; items: Thread[] }> = {};
    
    filteredThreads.forEach(item => {
      const isElastic = item.name.toUpperCase().includes('ELÁSTICO') || item.name.toUpperCase().includes('ELASTICO');
      
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
      alert('Por favor, selecione ou digite o tipo/categoria do insumo.');
      return;
    }

    if (!finalColorName) {
      finalColorName = 'PADRÃO';
    }

    const exists = threads.some(
      t => t.name.toUpperCase() === finalTypeName && 
           t.colorName.toLowerCase() === finalColorName.toLowerCase() &&
           (t.colorCode || '').trim().toLowerCase() === finalColorCode.toLowerCase()
    );

    if (exists) {
      const codeMsg = finalColorCode ? ` (Nº/Cód: ${finalColorCode})` : '';
      alert(`O insumo "${finalTypeName}" na cor "${finalColorName}"${codeMsg} já está cadastrado.`);
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
    setSelectedType(finalTypeName);
    setNewColorName(newType === 'ELÁSTICO' ? 'BRANCO' : '');
    setNewColorCode('');
    setCustomType('');
    showToast(`Insumo ${finalTypeName} (${finalColorName}) cadastrado!`);
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
    <div className={cn(
      "relative md:rounded-[2.5rem] overflow-hidden md:border backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-4 md:p-8 space-y-6 md:space-y-8 min-h-full transition-colors duration-300",
      isLight ? "bg-white border-slate-200 text-black shadow-slate-200/50" : "bg-[#130d08]/75 border-[#ebdcb9]/15 text-white"
    )}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 text-white font-black px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400/30 flex items-center gap-3 backdrop-blur-md animate-bounce">
          <Check size={20} className="text-white" />
          <span className="text-xs uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Background Effects */}
      {!isLight && (
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center tracking-normal opacity-[0.05] mix-blend-overlay pointer-events-none"
        />
      )}

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
        
        {/* Glowing Compass and Waves visual title */}
        <div className="flex items-center gap-3.5 sm:gap-5 relative z-10 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#ebdcb9] to-[#ad9e7a] p-0.5 shadow-lg flex items-center justify-center relative group overflow-hidden shrink-0">
            <div className="w-full h-full bg-[#3d2723] rounded-[14px] flex items-center justify-center text-[#ebdcb9]">
              <Compass className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse text-[#ebdcb9]" />
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
              <Sparkles size={11} className={cn("animate-pulse", isLight ? "text-amber-500" : "text-[#ebdcb9]")} /> PORTAL DE INSUMOS
            </span>
            <h2 className={cn(
              "text-xl sm:text-3xl font-serif tracking-wide mt-1",
              isLight ? "text-slate-900" : "text-[#fbf8f2]"
            )}>
              Insumos & Fios
            </h2>
          </div>
        </div>

        {/* Dynamic visual dashboard stats bar in Header */}
        <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-md relative z-10 shadow-lg shrink-0 w-full md:w-auto justify-around md:justify-start">
          <div className="text-center md:text-right border-r border-[#ebdcb9]/10 pr-4 sm:pr-6 mr-1 sm:mr-2">
            <p className="text-[8px] sm:text-[9px] text-[#c5a880] font-bold uppercase tracking-widest">Categorias</p>
            <p className="text-lg sm:text-xl font-extrabold text-[#ebdcb9] font-mono mt-0.5">{availableTypes.length}</p>
          </div>
          <div className="text-center md:text-right flex items-center gap-2.5 sm:gap-3">
            <div>
              <p className="text-[8px] sm:text-[9px] text-[#c5a880] font-bold uppercase tracking-widest">Disponibilidade</p>
              <p className="text-lg sm:text-xl font-black text-[#ebdcb9] font-mono mt-0.5">{totalStock} <span className="text-[9px] sm:text-[10px] text-[#c5a880]/60 font-bold font-sans">un</span></p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ebdcb9]/15 flex items-center justify-center text-[#ebdcb9] border border-[#ebdcb9]/20">
              <Anchor size={14} className="animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Category Selector Carousel (lg:hidden) */}
      {availableTypes.length > 0 && (
        <div className="lg:hidden w-full overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 scrollbar-none">
          {availableTypes.map(type => {
            const isSelected = selectedType === type;
            const typeItems = threads.filter(t => t.name.toUpperCase() === type);
            const typeStock = typeItems.reduce((sum, t) => sum + t.stock, 0);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap active:scale-95",
                  isSelected
                    ? "border-[#ebdcb9] bg-[#ebdcb9]/20 text-[#ebdcb9] shadow-md ring-1 ring-[#ebdcb9]/40"
                    : (isLight ? "border-slate-200 bg-slate-100 text-slate-600" : "border-white/10 bg-slate-900/60 text-stone-300 hover:bg-white/5")
                )}
              >
                {getTypeIcon(type, 13)}
                <span>{type}</span>
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded",
                  isLight ? "bg-slate-200 text-slate-500" : "bg-black/40 text-stone-400"
                )}>
                  {typeStock}u
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Immersive Column Split Layout: Left vertical grouped "CATEGORIAS DISPONÍVEIS", Right showing "Insumos Ativos" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10">
        
        {/* Left Column: CATEGORIAS DISPONÍVEIS (Hidden on mobile when pill bar is shown) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[11px] font-black tracking-widest text-[#ebdcb9] uppercase bg-[#ebdcb9]/10 px-3 py-1 rounded-full border border-[#ebdcb9]/25 flex items-center gap-1.5 shadow-sm">
              <Layers size={12} className="text-[#ebdcb9] animate-pulse" /> CATEGORIAS DISPONÍVEIS
            </span>
            {!isReadOnly && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-[10px] font-bold text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500 border border-sky-500/25 px-2.5 py-1 rounded-lg transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
                title="Adicionar Novo Insumo"
              >
                + Novo
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {availableTypes.map(type => {
              const isSelected = selectedType === type;
              const typeItems = threads.filter(t => t.name.toUpperCase() === type);
              const typeStock = typeItems.reduce((sum, t) => sum + t.stock, 0);
              const isLowStock = typeItems.some(v => v.stock <= v.minStockAlert);

              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "relative group rounded-[2rem] border text-left p-4 transition-all duration-300 select-none overflow-hidden flex items-center justify-between backdrop-blur-md shadow-lg w-full cursor-pointer",
                    isSelected 
                      ? (isLight ? "border-amber-400 bg-amber-50 text-amber-900 shadow-amber-100 ring-2 ring-amber-200" : "border-pink-500/60 bg-gradient-to-r from-pink-500/[0.15] via-slate-900/40 to-slate-950/80 shadow-pink-500/10 ring-2 ring-pink-500/20")
                      : (isLight ? "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600" : "border-white/5 bg-slate-900/35 hover:border-sky-500/30 hover:bg-slate-900/40")
                  )}
                >
                  <div className="flex items-center gap-3.5 relative z-10 min-w-0 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm tracking-wider border shrink-0 transition-all duration-300",
                      isSelected 
                        ? "bg-gradient-to-tr from-pink-500 to-sky-400 border-pink-400/20 text-white shadow-md shadow-pink-500/15" 
                        : "bg-white/5 border-white/10 group-hover:border-sky-400/40"
                    )}>
                      {getTypeIcon(type, 16)}
                    </div>

                    <div className="min-w-0">
                      <h3 className={cn(
                        "text-[11px] font-black tracking-widest uppercase truncate transition-colors",
                        isSelected ? "text-[#ebdcb9]" : "text-[#d7cab5] group-hover:text-white"
                      )}>
                        {type}
                      </h3>
                      <span className="text-[8px] text-[#c5a880]/80 uppercase tracking-widest font-extrabold mt-0.5 block">
                        {typeItems.length} itens
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative z-10 shrink-0">
                    {isLowStock && (
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-ping shadow-[0_0_8px_#ea580c]" title="Estoque Baixo" />
                    )}
                    <span className={cn(
                      "text-[10px] font-mono px-2.5 py-1 rounded-xl border font-bold shrink-0",
                      isSelected 
                        ? "bg-[#ebdcb9]/20 text-[#ebdcb9] border-[#ebdcb9]/40" 
                        : "bg-black/40 text-stone-400 border-white/5"
                    )}>
                      {typeStock} u
                    </span>
                  </div>

                  <div className={cn(
                    "absolute left-0 inset-y-0 w-1 transition-all duration-300",
                    isSelected ? "bg-gradient-to-b from-[#ebdcb9] to-[#c5a880]" : "bg-transparent"
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active category variations details / workbench */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9">
          {selectedType ? (
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
                    {getTypeIcon(selectedType, 20)}
                  </div>
                  <div>
                    <span className={cn(
                      "text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-wider",
                      isLight ? "bg-amber-100 border-amber-200 text-amber-700" : "text-[#ebdcb9] bg-[#ebdcb9]/10 border border-[#ebdcb9]/25"
                    )}>
                      Insumos Ativos
                    </span>
                    <div className="flex items-center gap-3.5 mt-1.5 flex-wrap">
                      <h3 className={cn("text-xl font-extrabold tracking-widest uppercase leading-none", isLight ? "text-slate-900" : "text-white")}>{selectedType}</h3>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-[9px] font-bold text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500 border border-sky-500/25 px-2.5 py-1 rounded-xl transition duration-150 cursor-pointer shadow-sm"
                        >
                          + Adicionar Insumo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Search Tool & Filters */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
                    className={cn(
                      "px-3 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                      filterCriticalOnly 
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40" 
                        : (isLight ? "bg-white border-slate-200 text-slate-600" : "bg-black/40 border-white/10 text-stone-400 hover:text-white")
                    )}
                  >
                    <AlertCircle size={12} />
                    {filterCriticalOnly ? "Críticos" : "Filtrar Críticos"}
                  </button>

                  <div className="relative flex-1 sm:flex-initial">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isLight ? "text-slate-400" : "text-[#c5a880]")} size={13} />
                    <input 
                      type="text" 
                      placeholder="Buscar cor ou código..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className={cn(
                        "w-full sm:w-56 pl-8 pr-4 py-2 border transition-all rounded-full text-[11px] focus:outline-none",
                        isLight 
                          ? "bg-white border-slate-200 text-black placeholder:text-slate-400 focus:border-amber-400" 
                          : "bg-black/40 border border-[#ebdcb9]/15 text-white hover:border-[#ebdcb9]/45 placeholder:text-stone-600"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Capsules Grid (Grouped by Color) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {groupedByColor.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-slate-500 text-xs uppercase tracking-wider font-bold">
                    Nenhum insumo atende aos filtros selecionados
                  </div>
                ) : (
                  groupedByColor.map(([cardKey, group]) => {
                    const colorGroupTotalStock = group.items.reduce((sum, item) => sum + item.stock, 0);
                    const isElasticGroup = group.items.some(i => i.name.toUpperCase().includes('ELÁSTICO') || i.name.toUpperCase().includes('ELASTICO'));
                    const mainItemId = group.items[0]?.id;
                    const stableCardKey = mainItemId ? `card_${mainItemId}` : cardKey;

                    return (
                      <div 
                        key={stableCardKey}
                        className={cn(
                          "border rounded-[2.5rem] p-5 space-y-4 shadow-xl relative overflow-hidden group/color-card",
                          isLight ? "bg-white border-slate-100 shadow-slate-200/50" : "border-[#ebdcb9]/10 bg-black/30"
                        )}
                      >
                        {/* Background color glow on hover */}
                        <div 
                          className="absolute -top-10 -right-10 w-28 h-28 blur-3xl rounded-full opacity-0 group-hover/color-card:opacity-10 transition-opacity duration-500 pointer-events-none" 
                          style={{ backgroundColor: group.colorHex }}
                        />
                        
                        {/* Color Info Header */}
                        <div className={cn(
                          "flex items-center justify-between pb-3 border-b relative z-10 select-none",
                          isLight ? "border-slate-50" : "border-white/5"
                        )}>
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div 
                              className="w-6 h-6 rounded-full border border-white/20 shadow-lg relative shrink-0" 
                              style={{ 
                                backgroundColor: group.colorHex,
                                boxShadow: `0 0 12px ${group.colorHex}65, inset 0 1px 1px rgba(255,255,255,0.4)`
                              }} 
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className={cn("text-sm font-black tracking-wider uppercase truncate", isLight ? "text-slate-800" : "text-slate-100")}>
                                {isElasticGroup ? (group.colorCode ? `ELÁSTICO Nº ${group.colorCode}` : 'ELÁSTICO') : group.colorName}
                              </h4>
                              <ColorCodeInput 
                                colorName={mainItemId || group.colorName}
                                initialCode={group.colorCode}
                                updateThreadColorCode={updateThreadColorCode}
                                isReadOnly={isReadOnly}
                                isElastic={isElasticGroup}
                              />
                            </div>
                          </div>
                          
                          <div className={cn(
                            "border px-2.5 py-1 rounded-xl text-right shrink-0 ml-2",
                            isLight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                          )}>
                            <span className="text-[10px] text-stone-400 font-mono tracking-wider uppercase">Total: </span>
                            <span className={cn("text-xs font-black font-mono", isLight ? "text-slate-900" : "text-[#ebdcb9]")}>{colorGroupTotalStock} u</span>
                          </div>
                        </div>

                        {/* Items Grid inside Color Card */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 relative z-10">
                          {group.items.map(v => {
                            const isCritical = v.stock <= v.minStockAlert;
                            return (
                              <div 
                                key={v.id} 
                                className={cn(
                                  "p-3 rounded-2xl border flex flex-col justify-between gap-2.5 hover:bg-opacity-80 transition-all relative overflow-hidden",
                                  isCritical 
                                    ? (isLight ? "border-rose-200 bg-rose-50" : "border-rose-500/20 bg-rose-500/[0.02]")
                                    : (isLight ? "bg-slate-50 border-slate-100 hover:border-amber-200" : "bg-white/[0.015] border-white/5 hover:border-sky-500/20 hover:bg-white/[0.03]")
                                )}
                              >
                                {isCritical && (
                                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-ping" />
                                )}

                                <div className="flex items-center justify-between pointer-events-none">
                                  <span className={cn(
                                    "font-black text-[10px] border px-1.5 py-0.5 rounded-lg truncate max-w-[80px]",
                                    isLight ? "text-amber-700 bg-amber-50 border-amber-100" : "text-sky-400 bg-sky-500/10 border-sky-500/10"
                                  )}>
                                    {v.colorCode ? `#${v.colorCode}` : v.name}
                                  </span>
                                  {!isReadOnly && (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingId(v.id)}
                                      className="pointer-events-auto text-slate-500 hover:text-rose-400 p-0.5"
                                      title="Excluir"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>

                                {/* Stock Input & Controls */}
                                <div className="text-center py-0.5 relative z-10 w-full">
                                  <div className="flex items-center justify-center gap-1 my-1">
                                    {!isReadOnly && (
                                      <button
                                        type="button"
                                        onClick={() => updateThreadStock(v.id, -1)}
                                        className={cn(
                                          "w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0",
                                          isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                                        )}
                                      >
                                        <Minus size={11} />
                                      </button>
                                    )}
                                    <input
                                      type="number"
                                      value={v.stock === 0 ? '' : v.stock}
                                      onChange={(e) => {
                                        const parsed = parseInt(e.target.value, 10);
                                        setThreadStock(v.id, isNaN(parsed) ? 0 : Math.max(0, parsed));
                                      }}
                                      onWheel={(e) => (e.target as HTMLElement).blur()}
                                      placeholder="0"
                                      disabled={isReadOnly}
                                      className={cn(
                                        "w-14 text-center py-1 border rounded-xl font-mono text-base font-black select-text focus:outline-none focus:ring-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                        isLight 
                                          ? "bg-white border-slate-200 text-slate-900 focus:border-amber-400" 
                                          : "bg-white/5 hover:bg-white/10 focus:bg-slate-950/90 border-white/5 focus:border-pink-500/40 text-white focus:text-pink-300"
                                      )}
                                    />
                                    {!isReadOnly && (
                                      <button
                                        type="button"
                                        onClick={() => updateThreadStock(v.id, 1)}
                                        className={cn(
                                          "w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0",
                                          isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                                        )}
                                      >
                                        <Plus size={11} />
                                      </button>
                                    )}
                                  </div>
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
              <p className="font-sans tracking-widest font-bold text-xs uppercase text-slate-400">Selecione uma categoria de insumo.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW INSUMO / THREAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#2a1c13] border border-[#ebdcb9]/30 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative my-8">
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

            <form onSubmit={handleCreateThread} className="space-y-4">
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
                        "py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1",
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
                    className="w-full mt-2 bg-white/5 border border-[#ebdcb9]/40 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-[#ebdcb9]"
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
                                "flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left cursor-pointer",
                                newColorName.toUpperCase().includes('AMARELADO') || !newColorName.toUpperCase().includes('ROSADO')
                                  ? "bg-amber-400/15 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/30 font-black"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                              )}
                            >
                              <div className="w-4 h-4 rounded-full bg-[#EAB308] border border-amber-300 shrink-0 shadow-sm" />
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-tight text-amber-100">DOURADO</span>
                                <span className="text-[8px] font-black tracking-wider text-amber-300">AMARELADO</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setNewColorName('DOURADO ROSADO');
                                setNewColorHex('#FB7185');
                              }}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left cursor-pointer",
                                newColorName.toUpperCase().includes('ROSADO')
                                  ? "bg-rose-500/15 border-rose-400 text-rose-200 shadow-md ring-1 ring-rose-400/30 font-black"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                              )}
                            >
                              <div className="w-4 h-4 rounded-full bg-[#FB7185] border border-rose-300 shrink-0 shadow-sm" />
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-tight text-rose-100">DOURADO</span>
                                <span className="text-[8px] font-black tracking-wider text-rose-300">ROSADO</span>
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
                              "w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none",
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
                              ? 'Variação / Tam' 
                              : 'Código (Ex: 163)'}
                        </label>
                        <input
                          type="text"
                          readOnly={isArgolasForm}
                          placeholder={
                            isElasticForm 
                              ? "Ex: 7, 10mm" 
                              : isArgolasForm 
                                ? "PADRÃO" 
                                : "Ex: 163"
                          }
                          value={isArgolasForm ? 'PADRÃO' : newColorCode}
                          onChange={(e) => setNewColorCode(e.target.value)}
                          className="w-full bg-white/5 border border-[#ebdcb9]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-amber-300 outline-none focus:border-[#ebdcb9]"
                        />
                        {isElasticForm && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                              Atalhos:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {['5', '6', '7', '8', '10', '12', '14'].map(num => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setNewColorCode(num)}
                                  className={cn(
                                    "px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer border",
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
                      </div>
                    </div>

                    {/* Palette Color Presets */}
                    {!isElasticForm && !isArgolasForm && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                          <span>Selecione a Cor Visual</span>
                          <span className="font-mono text-[#ebdcb9]">{newColorHex}</span>
                        </label>
                        
                        <div className="flex flex-wrap gap-2 p-2.5 bg-white/5 rounded-xl border border-white/10 max-h-28 overflow-y-auto">
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
                                "w-6 h-6 rounded-full border-2 transition-all cursor-pointer relative shrink-0",
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
                            className="w-6 h-6 rounded-full bg-transparent border-0 cursor-pointer p-0"
                            title="Seletor Personalizado"
                          />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Quantidade Inicial & Alerta Mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-[#ebdcb9]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-[#ebdcb9]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Alerta Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-[#ebdcb9]/20 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-[#ebdcb9]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-tr from-[#ebdcb9] via-[#ad9e7a] to-[#c5a880] text-[#3d2723] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <PackagePlus size={15} /> Confirmar
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
