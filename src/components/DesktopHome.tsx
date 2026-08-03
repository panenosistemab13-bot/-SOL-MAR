import React, { useState, useEffect } from 'react';
import { MessageSquare, Tag, Scissors, ShoppingCart, CalendarCheck, Settings, ChevronLeft, ChevronRight, CornerDownLeft, Sparkles, Sun, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

interface DesktopHomeProps {
  onSelect: (tab: string) => void;
}

export function DesktopHome({ onSelect }: DesktopHomeProps) {
  const { currentUser } = useInventory();
  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const menuItems = [
    {
      id: 'chat',
      title: 'Mural',
      subtitle: 'Mural de Avisos',
      desc: 'Comunicados e notícias importantes com acompanhamento de quem visualizou.',
      icon: MessageSquare,
    },
    {
      id: 'bikinis',
      title: 'Biquínis',
      subtitle: 'Estoque de Biquínis',
      desc: 'Gerenciamento completo do estoque de peças e coleções de biquínis.',
      icon: Tag,
    },
    {
      id: 'threads',
      title: 'Insumos',
      subtitle: 'Insumos & Fios',
      desc: 'Controle de fios, tecidos e aviamentos da produção.',
      icon: Scissors,
    },
    {
      id: 'sales',
      title: 'Vendas',
      subtitle: 'Relatórios & Vendas',
      desc: 'Lançamento de vendas, faturamento e relatórios financeiros.',
      icon: ShoppingCart,
    },
    ...(isAdmOrMestre ? [{
      id: 'attendance',
      title: 'Presença',
      subtitle: 'Lista de Presença',
      desc: 'Controle de presença da equipe (Exclusivo ADM).',
      icon: CalendarCheck,
    }] : []),
    {
      id: 'configuracoes',
      title: 'Configurações',
      subtitle: 'Configurações do Sistema',
      desc: 'Gerenciamento de usuários, permissões e dados do sistema.',
      icon: Settings,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dateTimeStr, setDateTimeStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = now.getDate();
      const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDateTimeStr(`${day} de ${month} de ${year} • ${time}`);
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentItem = menuItems[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % menuItems.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(currentItem.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentItem, menuItems]);

  return (
    <div className="hidden md:flex flex-col justify-between h-full w-full relative px-10 py-8 select-none">
      {/* Top Header */}
      <div className="w-full flex items-start justify-between z-20">
        {/* Top-Left: Logo & Collection */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ebdcb9]/15 border border-[#ebdcb9]/30 flex items-center justify-center text-[#ebdcb9] shadow-md">
            <Sun size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-serif font-bold tracking-[0.2em] text-[#ebdcb9] m-0 uppercase leading-none">
              SOL & MAR
            </h1>
            <p className="text-[10px] font-serif tracking-widest text-[#ebdcb9]/70 mt-1 uppercase m-0 leading-none">
              COLEÇÃO LU CONFECÇÕES
            </p>
          </div>
        </div>

        {/* Top-Right: Date & Time */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md shadow-xl text-xs font-serif text-white/90">
          <Clock size={14} className="text-[#ebdcb9]" />
          <span>{dateTimeStr || '3 de ago. de 2026 • 21:16:07'}</span>
        </div>
      </div>

      {/* Center Stage */}
      <div className="flex flex-col items-center justify-center relative z-10 max-w-lg mx-auto w-full">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-md cursor-pointer z-20 shadow-xl"
          title="Anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-md cursor-pointer z-20 shadow-xl"
          title="Próximo"
        >
          <ChevronRight size={24} />
        </button>

        {/* Large Rounded Card */}
        <div 
          onClick={() => onSelect(currentItem.id)}
          className="w-56 h-56 rounded-[3rem] bg-gradient-to-b from-[#ebdcb9] to-[#c5a880] text-[#3d2723] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/30 cursor-pointer transform hover:scale-105 transition-all duration-300 relative group"
        >
          <div className="absolute inset-2 rounded-[2.5rem] border border-[#3d2723]/10 pointer-events-none" />
          <currentItem.icon size={80} strokeWidth={1.5} className="drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
        </div>

        {/* Title and Description */}
        <div className="text-center mt-8 space-y-2">
          <div className="text-[10px] font-black tracking-[0.3em] text-[#ebdcb9] uppercase bg-black/40 px-3 py-1 rounded-full border border-white/10 inline-block">
            Avisos Importantes
          </div>
          <h2 className="text-4xl font-serif text-white tracking-wide font-bold">
            {currentItem.title}
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {currentItem.desc}
          </p>
        </div>

        {/* Bottom Icon Bar */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-4 py-2.5 backdrop-blur-md shadow-2xl mt-8">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === currentIndex;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  isSelected 
                    ? "bg-[#ebdcb9] text-[#3d2723] shadow-lg scale-110" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                title={item.subtitle}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        {/* Keyboard Helper */}
        <div className="flex items-center gap-2 mt-6 text-xs text-white/50 bg-black/30 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-white font-mono text-[10px]">
            ← ou →
          </span>
          <span>ou clique nos ícones • Pressione</span>
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-white font-mono text-[10px] font-bold">
            Enter <CornerDownLeft size={10} />
          </span>
          <span>para Entrar</span>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full flex items-center justify-between text-xs text-white/50 z-20 pt-4 border-t border-white/5">
        <div>© 2026 Sol & Mar • Todos os direitos reservados.</div>
        <div>Sistema Web • Criado por Jefferson Augusto</div>
      </div>
    </div>
  );
}
