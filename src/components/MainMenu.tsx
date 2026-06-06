import React, { useState } from 'react';
import { LayoutDashboard, Tag, Scissors, ShoppingCart, ChevronLeft, ChevronRight, Package, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

interface MainMenuProps {
  onSelect: (tab: string) => void;
}

const menuItems = [
  { 
    id: 'dashboard', 
    title: 'Dashboard', 
    subtitle: 'V I S Ã O   G E R A L', 
    description: 'Gestão inteligente de estoque e alertas críticos.',
    icon: LayoutDashboard,
    glow: 'rgba(125, 211, 252, 0.5)' // sky-300
  },
  { 
    id: 'bikinis', 
    title: 'Biquínis', 
    subtitle: 'C O L E Ç Ã O   L U   C O N F E C Ç Õ E S', 
    description: 'Gestão detalhada de modelos, cores e tamanhos.',
    icon: Tag,
    glow: 'rgba(244, 114, 182, 0.5)' // pink-400
  },
  { 
    id: 'estoque_encomenda', 
    title: 'Encomendas', 
    subtitle: 'S E P A R A Ç Ã O', 
    description: 'Divisão de itens por estágio de produção.',
    icon: Package,
    glow: 'rgba(244, 114, 182, 0.5)' // pink-400
  },
  { 
    id: 'threads', 
    title: 'Insumos', 
    subtitle: 'M A T E R I A I S', 
    description: 'Controle de linhas, aviamentos e suprimentos.',
    icon: Scissors,
    glow: 'rgba(125, 211, 252, 0.5)' // sky-300
  },
  { 
    id: 'sales', 
    title: 'Vendas', 
    subtitle: 'R E L A T Ó R I O S', 
    description: 'Análise de performance e histórico financeiro.',
    icon: ShoppingCart,
    glow: 'rgba(244, 114, 182, 0.5)' // pink-400
  },
];

export function MainMenu({ onSelect }: MainMenuProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { lowStockItemsCount, currentUser } = useInventory();

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const allowedMenuItems = isAdmOrMestre
    ? [
        ...menuItems,
        {
          id: 'configuracoes',
          title: 'Configurações',
          subtitle: 'A J U S T E S   D O   S I S T E M A',
          description: 'Gestão de usuários, foto de perfil, controle de acessos e dados.',
          icon: Settings,
          glow: 'rgba(168, 85, 247, 0.5)', // purple-500
        },
      ]
    : menuItems;
  
  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date());
  const time = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'medium' }).format(new Date());

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allowedMenuItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allowedMenuItems.length) % allowedMenuItems.length);
  };

  const currentItem = allowedMenuItems[currentIndex] || allowedMenuItems[0];
  const Icon = currentItem.icon;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        (activeElement as HTMLElement).isContentEditable
      );
      if (isInputActive) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(currentItem.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, onSelect, allowedMenuItems]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-between font-sans selection:bg-pink-200 selection:text-pink-900 relative overflow-hidden text-white">
      {/* Background ambient glow based on current item */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] opacity-20 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ backgroundColor: currentItem.glow }}
      />
      <div 
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"
      />

      {/* Top Header */}
      <header className="w-full px-10 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center relative">
             <div className="absolute inset-0 bg-pink-500/20 blur-md rounded-full pointer-events-none"></div>
             <svg className="relative z-10 text-pink-400" width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
             </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white m-0">SOL & MAR</h1>
            <p className="text-[10px] text-pink-400 uppercase tracking-[0.3em] font-semibold mt-1">Coleção LU CONFECÇÕES</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm">
          <span className="text-sky-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="12" cy="12" r="10"></circle>
               <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
          <span className="text-xs text-slate-300 font-mono tracking-wider">{today} • {time}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full px-12 z-10">
        <div className="w-full max-w-[1000px] flex items-center justify-between relative h-full max-h-[600px]">
          
          {/* Prev Button */}
          <button 
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95 shadow-xl group z-20"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Center Card Container */}
          <div className="flex flex-col items-center justify-center relative">
            <button 
              onClick={() => onSelect(currentItem.id)}
              className="group relative cursor-pointer outline-none w-[280px] h-[280px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-md group-hover:border-white/20 transition-all duration-500 group-hover:shadow-[0_0_80px_-20px_rgba(255,255,255,0.1)] overflow-hidden">
                 <div className="absolute inset-0 bg-noise opacity-20 object-cover" />
                 <div className="absolute inset-0 border-[2px] border-transparent group-hover:border-pink-500/10 rounded-[2.5rem] transition-colors duration-500" />
              </div>
              
              <div className="relative z-10 flex items-center justify-center">
                 <div className="absolute inset-0 blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-500" style={{ backgroundColor: currentItem.glow }}></div>
                 <Icon size={90} className="text-white relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
              </div>
              
              {/* Notification Badge */}
               {currentItem.id === 'dashboard' && lowStockItemsCount > 0 && (
                  <div className="absolute top-6 right-6 bg-rose-500 border border-rose-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse">
                     !
                  </div>
               )}
            </button>
            
            <div className="mt-10 flex flex-col items-center text-center max-w-md">
               <div className="flex items-center gap-4 mb-3">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20"></div>
                  <h3 className="text-[10px] font-bold text-pink-400 tracking-[0.4em] uppercase">{currentItem.subtitle}</h3>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20"></div>
               </div>
               
               <h2 className="text-5xl font-bold text-white tracking-tight mb-4 font-sans">
                  {currentItem.title}
               </h2>
               
               <p className="text-slate-400 text-sm font-light tracking-wide px-4">
                 {currentItem.description}
                </p>
                <div className="mt-6 flex items-center justify-center gap-1.5 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full text-[11px] font-medium tracking-wide text-white/50 shadow-inner select-none max-w-sm mx-auto">
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] font-semibold text-white/80 border border-white/10">← →</span> ou
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] font-semibold text-white/80 border border-white/10">↑ ↓</span>
                  <span className="text-slate-600 mx-0.5">•</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-semibold text-white/95 border border-white/10">Enter</span> para Entrar
                </div>
                <p className="hidden">
               </p>
            </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95 shadow-xl group z-20"
          >
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-10 py-6 flex items-center justify-between border-t border-white/5 relative z-10 text-xs text-slate-500 font-mono tracking-wide">
         <p>© 2026 Sol & Mar • Todos os direitos reservados.</p>
         <p>Sistema Web • Criado por Jefferson Augusto</p>
      </footer>
    </div>
  );
}
