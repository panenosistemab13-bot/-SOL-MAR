import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Dashboard } from './pages/Dashboard';
import { Bikinis } from './pages/Bikinis';
import { Threads } from './pages/Threads';
import { Sales } from './pages/Sales';
import { EstoqueEncomenda } from './pages/EstoqueEncomenda';
import { Configuracoes } from './pages/Configuracoes';
import { Chat } from './pages/Chat';
import { Login } from './components/Login';
import { MainMenu } from './components/MainMenu';
import { TopNav } from './components/TopNav';
import { PwaInstaller } from './components/PwaInstaller';
import { GlobalPinnedAlerts } from './components/GlobalPinnedAlerts';
import { LayoutDashboard, Tag, Package, Scissors, ShoppingCart, Settings, LogOut, Sparkles, MessageSquare, CalendarCheck } from 'lucide-react';
import { Attendance } from './pages/Attendance';

function AppContent() {
  const { lowStockItemsCount, unreadMessagesCount, currentUser, logout } = useInventory(); 
  
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'dashboard' : 'menu';
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const tabTitles: Record<string, string> = {
    dashboard: 'Gestão de Inventário',
    bikinis: 'Estoque de Biquínis',
    estoque_encomenda: 'Estoque Encomenda',
    threads: 'Insumos & Fios',
    sales: 'Relatórios & Vendas',
    chat: 'Mural de Avisos',
    attendance: 'Lista de Presença',
    configuracoes: 'Configurações do Sistema'
  };

  const navTabs = ['chat', 'dashboard', 'bikinis', 'estoque_encomenda', 'threads', 'sales', 'attendance', 'configuracoes'];

  React.useEffect(() => {
    if (isMobile && currentTab === 'menu') {
      setCurrentTab('dashboard');
    }
  }, [isMobile, currentTab]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInputActive = active && (
        active.tagName === 'INPUT' || 
        active.tagName === 'TEXTAREA' || 
        (active as HTMLElement).isContentEditable
      );
      if (isInputActive) return;

      if (!isMobile && currentTab !== 'menu') {
        if (e.key === 'Backspace') {
          e.preventDefault();
          setCurrentTab('menu');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const index = navTabs.indexOf(currentTab);
          if (index !== -1) {
            const nextIndex = (index + 1) % navTabs.length;
            setCurrentTab(navTabs[nextIndex]);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const index = navTabs.indexOf(currentTab);
          if (index !== -1) {
            const prevIndex = (index - 1 + navTabs.length) % navTabs.length;
            setCurrentTab(navTabs[prevIndex]);
          }
        } else if (e.key === 'ArrowDown') {
          const container = document.getElementById('main-scroll-container');
          if (container) {
            e.preventDefault();
            container.scrollBy({ top: 120, behavior: 'smooth' });
          }
        } else if (e.key === 'ArrowUp') {
          const container = document.getElementById('main-scroll-container');
          if (container) {
            e.preventDefault();
            container.scrollBy({ top: -120, behavior: 'smooth' });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTab, navTabs, isMobile]);

  if (!currentUser) {
    return <Login />;
  }

  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

  // Mobile rendering layout (100% compact and designed for fingers, screen estate, and fluid speeds)
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col text-slate-200 font-sans selection:bg-pink-500/20 selection:text-white pb-24 relative overflow-hidden">
        {/* Subtle glowing beach background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-12 left-0 w-64 h-64 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Compact Mobile Header */}
        <header className="h-[56px] bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-50 sticky top-0">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500/20 to-sky-500/20 flex items-center justify-center border border-pink-500/20 shadow-sm shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] font-black tracking-widest text-white block uppercase">SOL & MAR</span>
              <p className="text-[7px] text-pink-400 font-bold tracking-wider m-0 uppercase leading-none">LU CONFECÇÕES</p>
            </div>
          </div>

          {/* Page Badge */}
          <div className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-gradient-to-r from-white/[0.02] to-white/[0.04]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[100px]">
              {tabTitles[currentTab] ? tabTitles[currentTab].split(' ')[0] : 'Painel'}
            </span>
          </div>

          {/* User & Options */}
          <div className="flex items-center gap-1.5">
            {currentUser && (
              <div className="flex items-center gap-1 bg-white/[0.03] border border-white/5 pl-2 pr-0.5 py-0.5 rounded-full shrink-0">
                <span className="text-[9px] font-bold text-slate-300 max-w-[40px] truncate leading-none">
                  {currentUser.name.split(' ')[0]}
                </span>
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20">
                  <img 
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => logout()}
              className="p-1 px-1.5 text-slate-400 hover:text-rose-400 active:scale-95 transition-all cursor-pointer bg-white/5 rounded-lg border border-white/5"
              title="Sair"
              id="mobile-logout-btn"
            >
              <LogOut size={13} />
            </button>
          </div>
        </header>

        {/* Compact Mobile Pages container */}
        <div id="main-scroll-container" className="flex-1 overflow-y-auto px-3.5 pt-3.5 relative">
          <div className="max-w-md mx-auto relative z-10">
            {currentTab === 'dashboard' && <Dashboard />}
            {currentTab === 'bikinis' && <Bikinis />}
            {currentTab === 'threads' && <Threads />}
            {currentTab === 'sales' && <Sales />}
            {currentTab === 'estoque_encomenda' && <EstoqueEncomenda />}
            {currentTab === 'chat' && <Chat />}
            {currentTab === 'attendance' && <Attendance />}
            {currentTab === 'configuracoes' && <Configuracoes />}
          </div>
        </div>

        {/* Floating Glass Bottom Nav Dock */}
        <nav className="fixed bottom-3 inset-x-3 z-50 bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center justify-between shadow-[0_15px_30px_rgb(0,0,0,0.8)] max-w-md mx-auto">
          {navTabs.map((tabId) => {
            const isActive = currentTab === tabId;
            let TabIcon = LayoutDashboard;
            let label = 'Painel';

            if (tabId === 'dashboard') {
              TabIcon = LayoutDashboard;
              label = 'Início';
            } else if (tabId === 'bikinis') {
              TabIcon = Tag;
              label = 'Biquíni';
            } else if (tabId === 'estoque_encomenda') {
              TabIcon = Package;
              label = 'Pedido';
            } else if (tabId === 'threads') {
              TabIcon = Scissors;
              label = 'Insumos';
            } else if (tabId === 'sales') {
              TabIcon = ShoppingCart;
              label = 'Vendas';
            } else if (tabId === 'chat') {
              TabIcon = MessageSquare;
              label = 'Chat';
            } else if (tabId === 'attendance') {
              TabIcon = CalendarCheck;
              label = 'Presença';
            } else if (tabId === 'configuracoes') {
              TabIcon = Settings;
              label = 'Ajustes';
            }

            return (
              <button
                key={tabId}
                onClick={() => setCurrentTab(tabId)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-300 relative cursor-pointer ${
                  isActive 
                    ? 'text-pink-400 bg-white/[0.04] border border-white/5 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TabIcon size={16} className={`mb-1 transition-transform duration-200 ${isActive ? 'scale-110 text-pink-400 stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
                <span className={`text-[8px] font-black tracking-wide uppercase leading-none scale-90 ${isActive ? 'text-pink-300' : 'text-slate-500'}`}>
                  {label}
                </span>
                
                {/* Micro notification dot on mobile */}
                {tabId === 'dashboard' && lowStockItemsCount > 0 && (
                  <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-rose-500 border border-[#09090b]" />
                )}

                {tabId === 'chat' && unreadMessagesCount > 0 && (
                  <span className="absolute -top-0.5 right-3 bg-gradient-to-tr from-pink-500 to-amber-500 border border-[#09090b] text-white text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {unreadMessagesCount}
                  </span>
                )}
                
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-pink-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  if (currentTab === 'menu') {
    return <MainMenu onSelect={setCurrentTab} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-slate-800 font-sans selection:bg-pink-200 selection:text-pink-900">
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a] relative">
        <header className="h-[100px] bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5 flex items-center px-10 shrink-0 z-50 sticky top-0">
          {/* Left section */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-serif font-bold text-white m-0 tracking-tight">{tabTitles[currentTab]}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[13px] font-light tracking-wide text-sky-400 m-0 capitalize leading-none">{today}</p>
              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-white/30 bg-white/[0.02] border border-white/5 px-2.5 py-0.5 rounded-full font-mono select-none">
                <span className="flex gap-0.5 bg-white/5 px-1 rounded text-[9px] border border-white/10 text-white/50 font-sans">← →</span> Mudar aba
                <span className="text-white/10">•</span>
                <span className="bg-white/5 px-1 rounded text-[9px] border border-white/10 text-white/50 font-sans">Backspace</span> Voltar ao Menu
              </div>
            </div>
          </div>
          
          {/* Center section - Dynamic TopNav */}
          <div className="flex-shrink-0 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[#a855f7]/5 blur-[60px] rounded-full pointer-events-none"></div>
            <TopNav currentTab={currentTab} onSelect={setCurrentTab} />
          </div>

          {/* Right section */}
          <div className="flex-1 flex items-center justify-end gap-3.5">
            {lowStockItemsCount > 0 && (
              <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-wide hidden sm:flex items-center gap-2 shadow-sm">
                <span className="shrink-0 leading-none">⚠️</span> 
                {lowStockItemsCount} Críticos
              </div>
            )}
            
            {currentUser && (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden md:block">
                  <p className="text-[12px] font-bold text-white leading-none">{currentUser.name}</p>
                  <p className="text-[9px] text-[#a855f7] uppercase font-black tracking-wider mt-1">{currentUser.role === 'MESTRE' ? 'Mestre' : currentUser.role}</p>
                </div>
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-md">
                  <img src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Sair da Conta"
                  id="header-logout-btn"
                >
                  <svg className="w-5 h-5 hover:scale-105 active:scale-95 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </header>
        
        <div id="main-scroll-container" className="flex-1 overflow-y-auto p-8 md:p-12 relative">
          <div className="max-w-7xl mx-auto h-full relative z-10">
            {currentTab === 'dashboard' && <Dashboard />}
            {currentTab === 'bikinis' && <Bikinis />}
            {currentTab === 'threads' && <Threads />}
            {currentTab === 'sales' && <Sales />}
            {currentTab === 'estoque_encomenda' && <EstoqueEncomenda />}
            {currentTab === 'chat' && <Chat />}
            {currentTab === 'attendance' && <Attendance />}
            {currentTab === 'configuracoes' && <Configuracoes />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <GlobalPinnedAlerts />
      <AppContent />
      <PwaInstaller />
    </InventoryProvider>
  );
}
