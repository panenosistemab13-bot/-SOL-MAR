import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Tag, 
  Scissors, 
  Package, 
  Settings, 
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

// @ts-ignore
import backgroundImage from '../assets/images/sol_mar_bg_1781047598977.png';

interface MainMenuProps {
  onSelect: (tab: string) => void;
}

const menuItems = [
  { 
    id: 'dashboard', 
    title: 'Dashboard', 
    subtitle: 'Visão Geral', 
    description: 'Gestão inteligente de estoque e alertas críticos.',
    icon: LayoutDashboard,
    glow: 'rgba(125, 211, 252, 0.4)'
  },
  { 
    id: 'bikinis', 
    title: 'Biquínis', 
    subtitle: 'Coleção Lu Confecções', 
    description: 'Gestão detalhada de biquínis, modelos, cores e tamanhos.',
    icon: Tag,
    glow: 'rgba(244, 114, 182, 0.4)'
  },
  { 
    id: 'estoque_encomenda', 
    title: 'Encomendas', 
    subtitle: 'Separação', 
    description: 'Divisão de itens por estágio de produção, controle e prazos.',
    icon: Package,
    glow: 'rgba(244, 114, 182, 0.4)'
  },
  { 
    id: 'threads', 
    title: 'Insumos', 
    subtitle: 'Materiais', 
    description: 'Controle de linhas, fios, aviamentos e suprimentos.',
    icon: Scissors,
    glow: 'rgba(125, 211, 252, 0.4)'
  }
];

export function MainMenu({ onSelect }: MainMenuProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeString, setTimeString] = useState('');
  const { lowStockItemsCount } = useInventory();

  // Allowed menu items includes Settings page
  const allowedMenuItems = [
    ...menuItems,
    {
      id: 'configuracoes',
      title: 'Configurações',
      subtitle: 'Ajustes do Sistema',
      description: 'Gestão de usuários, foto de perfil, controle de acessos e dados.',
      icon: Settings,
      glow: 'rgba(168, 85, 247, 0.4)',
    },
  ];

  // Dynamic Ticking Clock Hook with exact formatting "9 de jun. de 2026 • 20:24:02"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(now);
      
      const formattedTime = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      
      setTimeString(`${formattedDate} • ${formattedTime}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allowedMenuItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allowedMenuItems.length) % allowedMenuItems.length);
  };

  const currentItem = allowedMenuItems[currentIndex] || allowedMenuItems[0];
  const Icon = currentItem.icon;

  // Keyboard Navigation Support
  useEffect(() => {
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
    <div 
      className="min-h-screen flex flex-col items-center justify-between font-sans selection:bg-[#e4cb9c]/30 selection:text-[#3e2723] relative overflow-hidden text-white bg-[#1a130c] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark Vignette Overlay to ensure text contrast while retaining the beautiful background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 z-0 pointer-events-none" />
      
      {/* Decorative ambient color glow reflecting current card */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[150px] opacity-15 pointer-events-none transition-all duration-1000 ease-in-out z-0"
        style={{ backgroundColor: currentItem.glow }}
      />

      {/* 1. Header Area with Brand Logo & Realtime Clock Pill */}
      <header className="w-full px-8 md:px-12 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* Sol & Mar Wavy Rise Icon */}
          <div className="w-10 h-10 flex items-center justify-center relative shrink-0">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e4cb9c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {/* Sun */}
              <circle cx="12" cy="11" r="3.5" fill="currentColor" fillOpacity="0.1" />
              <path d="M12 4V5.5" />
              <path d="M12 16.5V18" />
              <path d="M5 11h1.5" />
              <path d="M17.5 11H19" />
              <path d="m7.05 6.05 1.06 1.06" />
              <path d="m15.89 14.89 1.06 1.06" />
              <path d="m16.95 6.05-1.06 1.06" />
              <path d="m7.05 14.89 1.06 1.06" />
              {/* Waves */}
              <path d="M4 19.5c1.5-1 3-1 4.5 0s3 1 4.5 0s3-1 4.5 0" strokeWidth="1.2" />
              <path d="M5.5 21.5C6.5 21 7.5 21 8.5 21.5s2 0.5 3 0s2-0.5 3 0" strokeWidth="1" opacity="0.7" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-serif font-bold tracking-[0.2em] text-[#fbf8f2] m-0">
              SOL & MAR
            </h1>
            <p className="text-[9px] text-[#c5a880] uppercase tracking-[0.25em] font-medium leading-none mt-1">
              Coleção LU CONFECÇÕES
            </p>
          </div>
        </div>

        {/* Real-time Ticking Date-Time Pill */}
        <div className="flex items-center gap-2.5 bg-black/25 border border-white/5 hover:border-white/10 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-md transition-colors">
          <Clock size={13} className="text-[#c5a880]" />
          <span className="text-[11px] text-[#ebdcb9] font-mono tracking-wider">
            {timeString}
          </span>
        </div>
      </header>

      {/* 2. Main Carousel Content Area */}
      <main className="flex-grow flex items-center justify-center w-full px-6 relative z-10 my-[3vh]">
        <div className="w-full max-w-[1100px] flex items-center justify-between relative">
          
          {/* Left Navigation Arrow */}
          <button 
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-black/20 border border-[#ebdcb9]/15 flex items-center justify-center text-[#ebdcb9] hover:text-white hover:bg-[#ebdcb9]/10 hover:border-[#ebdcb9]/30 transition-all hover:scale-105 active:scale-95 shadow-xl group z-20 self-center"
            title="Anterior"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Center Card and Content Block */}
          <div className="flex flex-col items-center justify-center relative flex-1 mx-4">
            
            {/* The 3D Debossed Clay Sand-Style Squirle Card */}
            <button 
              onClick={() => onSelect(currentItem.id)}
              className="group relative cursor-pointer outline-none w-[270px] h-[270px] flex items-center justify-center transition-transform hover:scale-[1.03] duration-500"
            >
              {/* Outer Glow behind card */}
              <div 
                className="absolute inset-4 blur-[40px] opacity-15 group-hover:opacity-30 transition-all duration-500 rounded-full"
                style={{ backgroundColor: currentItem.glow }}
              />

              {/* 3D Tactile Sand-Colored Clay Card Body */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ebdcb9] via-[#c6b694] to-[#ad9e7a] rounded-[2.8rem] shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.45),inset_2px_2px_8px_rgba(0,0,0,0.35),0_15px_45px_rgba(0,0,0,0.65)] border border-[#ebdcb9]/30 flex items-center justify-center transition-all duration-500 group-hover:shadow-[inset_-1px_-1px_6px_rgba(255,255,255,0.45),inset_1px_1px_6px_rgba(0,0,0,0.35),0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Subtle internal ring to emphasize luxury finish */}
                <div className="absolute inset-4 rounded-[2rem] border border-[#f5ebce]/25 pointer-events-none" />
                {/* Visual sand noise overlay inside card texture */}
                <div className="absolute inset-0 bg-[#3d2c16] opacity-[0.02] mix-blend-overlay pointer-events-none" />
              </div>

              {/* Inner Engraved/Debossed 3D outline Icon */}
              <div className="relative z-10 flex items-center justify-center">
                <Icon 
                  size={84} 
                  className="text-[#64492c] relative z-10 transition-transform duration-500 group-hover:scale-[1.06]" 
                  style={{
                    filter: 'drop-shadow(1px 1.5px 1px rgba(255, 255, 255, 0.45)) drop-shadow(-1px -1.5px 1px rgba(0, 0, 0, 0.355))'
                  }}
                  strokeWidth={1.2} 
                />
              </div>
              
              {/* Floating Alert Indicator Badges */}
              {currentItem.id === 'dashboard' && lowStockItemsCount > 0 && (
                <div className="absolute top-5 right-5 bg-rose-600 border border-rose-400 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-[0_4px_15px_rgba(220,38,38,0.7)] animate-pulse z-30">
                  !
                </div>
              )}
            </button>
            
            {/* 3. Description Section under Card */}
            <div className="mt-8 flex flex-col items-center text-center max-w-lg">
              {/* Category Subtitle */}
              <div className="flex items-center gap-4 mb-3">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#c5a880]/30" />
                <h3 className="text-[10px] font-bold text-[#c5a880] tracking-[0.35em] uppercase">
                  {currentItem.subtitle}
                </h3>
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#c5a880]/30" />
              </div>
              
              {/* Large Title in elegant Playfair Display Serif */}
              <h2 className="text-[44px] md:text-5xl font-serif text-[#fbf8f2] tracking-wide mb-3 select-none leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                {currentItem.title}
              </h2>
              
              {/* Paragraph details */}
              <p className="text-[#d7cab5] text-sm font-light tracking-wide px-4 max-w-md leading-relaxed select-none">
                {currentItem.description}
              </p>

              {/* Keyboard navigation helper pill */}
              <div className="mt-7 flex items-center justify-center gap-1.5 bg-black/20 border border-[#ebdcb9]/10 px-5 py-2.5 rounded-full text-[10px] font-medium tracking-wide text-[#cbd4c4]/70 shadow-lg select-none backdrop-blur-sm">
                <span className="flex items-center gap-0.5 bg-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#ebdcb9] border border-[#ebdcb9]/15">← →</span> ou
                <span className="flex items-center gap-0.5 bg-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#ebdcb9] border border-[#ebdcb9]/15">↑ ↓</span>
                <span className="text-[#c5a880]/40 mx-1">•</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#ebdcb9] border border-[#ebdcb9]/15">Enter</span> para Entrar
              </div>
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <button 
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-black/20 border border-[#ebdcb9]/15 flex items-center justify-center text-[#ebdcb9] hover:text-white hover:bg-[#ebdcb9]/10 hover:border-[#ebdcb9]/30 transition-all hover:scale-105 active:scale-95 shadow-xl group z-20 self-center"
            title="Próximo"
          >
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>
      </main>

      {/* Decorative Rotating circular typography badge "leve sua essência" */}
      <div className="hidden lg:flex absolute right-10 xl:right-20 top-1/2 -translate-y-1/2 flex-col items-center justify-center z-10 pointer-events-none select-none">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg width="150" height="150" viewBox="0 0 100 100" className="animate-[spin_45s_linear_infinite] opacity-45">
            <path id="curvePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
            <text fill="#c5a880" fontSize="5.5" letterSpacing="2.8" className="tracking-widest uppercase font-serif italic font-bold">
              <textPath href="#curvePath">leve sua essência • leve sua essência •</textPath>
            </text>
          </svg>
          {/* Static cursive brand signature center */}
          <div className="absolute font-serif italic text-[11px] text-[#c5a880]/80 tracking-widest text-center mt-1">
            Sol & Mar
          </div>
        </div>
      </div>

      {/* 4. Elegant Footer with Boundary Sunrise Divider */}
      <div className="w-full shrink-0 z-10 mt-auto">
        {/* Wavy/Sun Bound Divider */}
        <div className="w-full relative flex items-center justify-center z-10 px-10">
          <div className="absolute inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#c5a880]/25 to-transparent"></div>
          <div className="relative px-4 bg-transparent">
            {/* Mini sunset logo inside line */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c5a880" strokeWidth="1.5" className="animate-pulse">
              <circle cx="12" cy="11" r="2.5" />
              <path d="M12 5V6.5" />
              <path d="M7 11H8.5" />
              <path d="M15.5 11H17" />
              <path d="m8.5 7.5.8.8" />
              <path d="m15.5 7.5-.8.8" />
              <path d="M4 16c2-0.5 4-0.5 6 0s4 0.5 6 0s4-0.5 4-0.5" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Text columns */}
        <footer className="w-full px-10 md:px-14 py-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#ebdcb9]/40 font-mono tracking-wider gap-3">
          <p>© 2026 Sol & Mar • Todos os direitos reservados.</p>
          <p>Sistema Web • Criado por Jefferson Augusto</p>
        </footer>
      </div>

    </div>
  );
}
