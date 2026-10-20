import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Dashboard } from './pages/Dashboard';
import { Bikinis } from './pages/Bikinis';
import { Threads } from './pages/Threads';
import { EstoqueEncomenda } from './pages/EstoqueEncomenda';
import { Configuracoes } from './pages/Configuracoes';
import { MobileDashboard } from './components/mobile/MobileDashboard';
import { MobileBikinis } from './components/mobile/MobileBikinis';
import { MobileThreads } from './components/mobile/MobileThreads';
import { MobileEstoqueEncomenda } from './components/mobile/MobileEstoqueEncomenda';
import { MobileConfiguracoes } from './components/mobile/MobileConfiguracoes';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { Login } from './components/Login';
import { MainMenu } from './components/MainMenu';
import { TopNav } from './components/TopNav';
import { PwaInstaller } from './components/PwaInstaller';
import { LayoutDashboard, Tag, Package, Scissors, Settings, LogOut, Sparkles } from 'lucide-react';

// @ts-ignore
import backgroundImage from './assets/images/sol_mar_bg_1781047598977.png';

function AppContent() {
  const { lowStockItemsCount, currentUser, logout } = useInventory(); 
  
  const checkIsMobile = () => {
    if (typeof window === 'undefined') return false;
    const isSmallWidth = window.innerWidth < 768;
    const isLandscapePhone = window.innerHeight < 550 && window.innerWidth < 950;
    return isSmallWidth || isLandscapePhone;
  };

  const [isMobile, setIsMobile] = useState(() => checkIsMobile());

  const [currentTab, setCurrentTab] = useState(() => {
    return checkIsMobile() ? 'dashboard' : 'menu';
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const tabTitles: Record<string, string> = {
    dashboard: 'Gestão de Inventário',
    bikinis: 'Estoque de Biquínis',
    estoque_encomenda: 'Estoque Encomenda',
    threads: 'Insumos & Fios',
    configuracoes: 'Configurações do Sistema'
  };

  const navTabs = ['dashboard', 'bikinis', 'estoque_encomenda', 'threads', 'configuracoes'];

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

  // Mobile rendering layout (100% luxury resort wear aesthetic matching reference image)
  if (isMobile) {
    return (
      <div 
        className="min-h-screen flex flex-col text-[#F5F0E7] font-sans selection:bg-[#D6AD62]/30 selection:text-[#0B0A08] pb-24 relative overflow-hidden bg-[#0B0A08] z-10"
      >
        {/* Soft Luxury Gold Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D6AD62]/10 blur-[110px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-[#8D6A32]/10 blur-[110px] rounded-full pointer-events-none z-0" />

        {/* Dedicated Luxury Mobile Header (Matches Reference) */}
        <MobileHeader onNavigateTab={setCurrentTab} />

        {/* Clean Mobile Pages container */}
        <div id="main-scroll-container" className="flex-1 overflow-y-auto px-4 pt-3.5 relative z-10">
          <div className="max-w-lg mx-auto space-y-4 pb-4">
            {currentTab === 'dashboard' && <MobileDashboard onNavigateTab={setCurrentTab} />}
            {currentTab === 'bikinis' && <MobileBikinis />}
            {currentTab === 'threads' && <MobileThreads />}
            {currentTab === 'estoque_encomenda' && <MobileEstoqueEncomenda />}
            {currentTab === 'configuracoes' && <MobileConfiguracoes />}
          </div>
        </div>

        {/* Floating Luxurious Bottom Navigation Dock (Matches Reference) */}
        <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>
    );
  }

  if (currentTab === 'menu') {
    return <MainMenu onSelect={setCurrentTab} />;
  }

  return (
    <div 
      className="min-h-screen flex text-[#fbf8f2] font-sans selection:bg-[#ebdcb9]/35 selection:text-[#3d2723] bg-[#1a130c] bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-black/90 z-0 pointer-events-none" />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent relative z-10">
        <header className="py-4 bg-black/35 backdrop-blur-xl border-b border-white/5 flex flex-col xl:flex-row items-start xl:items-center justify-between px-6 md:px-10 gap-4 shrink-0 z-50 sticky top-0">
          {/* Left section with Title & Horizontal List Navigation on the Left */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 w-full xl:w-auto">
            <div>
              <h1 className="text-2xl font-serif font-bold text-white m-0 tracking-tight">{tabTitles[currentTab]}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[12px] font-light tracking-wide text-sky-400 m-0 capitalize leading-none">{today}</p>
                <div className="hidden md:flex items-center gap-1.5 text-[10px] text-white/30 bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded-full font-mono select-none">
                  <span className="bg-white/5 px-1 rounded text-[9px] text-white/50">← →</span> Mudar
                  <span className="text-white/10">•</span>
                  <span className="bg-white/5 px-1 rounded text-[9px] text-white/50">Backspace</span> Menu
                </div>
              </div>
            </div>

            {/* Horizontal list navigation on the left */}
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
            {currentTab === 'estoque_encomenda' && <EstoqueEncomenda />}
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
      <AppContent />
      <PwaInstaller />
    </InventoryProvider>
  );
}
