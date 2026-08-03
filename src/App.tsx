import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Dashboard } from './pages/Dashboard';
import { Bikinis } from './pages/Bikinis';
import { Threads } from './pages/Threads';
import { Sales } from './pages/Sales';
import { Configuracoes } from './pages/Configuracoes';
import { Chat } from './pages/Chat';
import { Login } from './components/Login';
import { MainMenu } from './components/MainMenu';
import { DesktopHome } from './components/DesktopHome';
import { TopNav } from './components/TopNav';
import { PwaInstaller } from './components/PwaInstaller';
import { GlobalPinnedAlerts } from './components/GlobalPinnedAlerts';
import { LayoutDashboard, Tag, Package, Scissors, ShoppingCart, Settings, LogOut, Sparkles, MessageSquare, CalendarCheck } from 'lucide-react';
import { Attendance } from './pages/Attendance';
import { InstagramMobileHeader, InstagramStoriesRow, InstagramMobileBottomNav, UserProfileGalleryModal } from './components/InstagramMobileNav';
import { cn } from './lib/utils';

// @ts-ignore
import backgroundImage from './assets/images/sol_mar_bg_1781047598977.png';

function AppContent() {
  const { lowStockItemsCount, unreadMessagesCount, currentUser, logout, theme } = useInventory(); 
  
  const [isStandalone, setIsStandalone] = useState(false);
  const [currentTab, setCurrentTab] = useState('menu');
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const navTabs = React.useMemo(() => {
    const tabs = ['chat', 'bikinis', 'threads', 'sales'];
    if (isAdmOrMestre) {
      tabs.push('attendance');
    }
    tabs.push('configuracoes');
    return tabs;
  }, [isAdmOrMestre]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true
      );
    }
  }, []);

  const isFuncionarioB = currentUser?.role === 'FUNCIONARIO_B';

  const tabTitles: Record<string, string> = {
    dashboard: 'Gestão de Inventário',
    bikinis: 'Estoque de Biquínis',
    threads: 'Insumos & Fios',
    sales: 'Relatórios & Vendas',
    chat: 'Mural de Avisos',
    attendance: 'Lista de Presença',
    configuracoes: 'Configurações do Sistema',
    publi: 'Criar Publicação'
  };

  React.useEffect(() => {
    if (currentTab === 'dashboard') {
      setCurrentTab('menu');
    }
    if (!isAdmOrMestre && currentTab === 'attendance') {
      setCurrentTab('menu');
    }
  }, [isAdmOrMestre, currentTab]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInputActive = active && (
        active.tagName === 'INPUT' || 
        active.tagName === 'TEXTAREA' || 
        (active as HTMLElement).isContentEditable
      );
      if (isInputActive) return;

      if (currentTab !== 'menu') {
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
  }, [currentTab, navTabs]);

  if (!currentUser) {
    return <Login />;
  }

  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

  // Early return logic removed

  return (
    <div 
      className={cn(
        "min-h-screen flex font-sans selection:bg-[#ebdcb9]/35 selection:text-[#3d2723] bg-cover bg-center bg-no-repeat relative overflow-hidden pb-16 md:pb-0 transition-colors duration-500",
        theme === 'dark' ? "text-[#fbf8f2] bg-[#1a130c]" : "text-black bg-white"
      )}
      style={{ backgroundImage: theme === 'dark' ? `url(${backgroundImage})` : 'none' }}
    >
      <div className={cn(
        "absolute inset-0 z-0 pointer-events-none transition-opacity duration-500",
        theme === 'dark' ? "bg-gradient-to-b from-black/85 via-black/45 to-black/90 opacity-100" : "bg-white opacity-0"
      )} />
      
      {/* INSTAGRAM MOBILE TOP HEADER & STORIES ROW */}
      <InstagramMobileHeader 
        currentTab={currentTab} 
        onSelect={setCurrentTab} 
        viewingProfileUserId={viewingProfileUserId}
        onSelectProfile={setViewingProfileUserId}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent relative z-10 pt-13 md:pt-0">
        {currentTab === 'menu' && (
          <div className="w-full md:hidden z-20">
            <InstagramStoriesRow 
              viewingProfileUserId={viewingProfileUserId}
              onSelectProfile={setViewingProfileUserId}
            />
          </div>
        )}

        {/* DESKTOP HEADER */}
        {currentTab !== 'menu' && (
          <header className="hidden md:flex h-[100px] bg-black/35 backdrop-blur-xl border-b border-white/5 items-center justify-between px-10 shrink-0 z-50 sticky top-0 gap-3">
            {/* Left section */}
            <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left leading-tight w-full md:w-auto">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-white m-0 tracking-tight">{tabTitles[currentTab]}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-3 mt-1">
                <p className="text-[11px] md:text-[13px] font-light tracking-wide text-sky-400 m-0 capitalize leading-none">{today}</p>
                <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-white/30 bg-white/[0.02] border border-white/5 px-2.5 py-0.5 rounded-full font-mono select-none">
                  <span className="flex gap-0.5 bg-white/5 px-1 rounded text-[9px] border border-white/10 text-white/50 font-sans">← →</span> Mudar aba
                  <span className="text-white/10">•</span>
                  <span className="bg-white/5 px-1 rounded text-[9px] border border-white/10 text-white/50 font-sans">Backspace</span> Voltar ao Menu
                </div>
              </div>
            </div>
            
            {/* Center section - Dynamic TopNav */}
            <div className="flex-shrink-0 flex items-center justify-center relative w-full md:w-auto">
              <div className="absolute inset-0 bg-[#a855f7]/5 blur-[60px] rounded-full pointer-events-none"></div>
              <TopNav currentTab={currentTab} onSelect={setCurrentTab} />
            </div>

            {/* Right section */}
            <div className="flex-1 flex items-center justify-center md:justify-end gap-2.5 md:gap-3.5 w-full md:w-auto">
              {lowStockItemsCount > 0 && (
                <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full text-[10px] md:text-[12px] font-semibold tracking-wide flex items-center gap-1 sm:gap-2 shadow-sm shrink-0">
                  <span className="shrink-0 leading-none">⚠️</span> 
                  {lowStockItemsCount} Críticos
                </div>
              )}
              
              {currentUser && (
                <div className="flex items-center gap-2 md:gap-2.5">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] md:text-[12px] font-bold text-white leading-none">{currentUser.name}</p>
                    <p className="text-[8px] md:text-[9px] text-[#a855f7] uppercase font-black tracking-wider mt-1">{currentUser.role === 'MESTRE' ? 'Mestre' : currentUser.role}</p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden border border-white/20 shadow-md">
                    <img src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 md:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Sair da Conta"
                    id="header-logout-btn"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 hover:scale-105 active:scale-95 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </header>
        )}
        
        <div id="main-scroll-container" className={cn(
          "flex-1 overflow-y-auto no-scrollbar p-0 md:p-12 pb-24 md:pb-12 relative touch-pan-y",
          currentTab === 'chat' && "pb-0"
        )}>
          <div className="max-w-7xl mx-auto h-full relative z-10">
            {currentTab === 'menu' && (
              <>
                <div className="md:hidden">
                  <MainMenu 
                    onSelect={setCurrentTab} 
                    showPostCreator={true} 
                    hideCameraMobile={true} 
                    viewingProfileUserId={viewingProfileUserId}
                    onSelectProfile={setViewingProfileUserId}
                  />
                </div>
                <div className="hidden md:block h-full">
                  <DesktopHome onSelect={setCurrentTab} />
                </div>
              </>
            )}
            {currentTab === 'publi' && <MainMenu onSelect={setCurrentTab} showPostCreator={true} autoOpenGallery={true} />}
            {currentTab === 'profile' && <MainMenu onlyMyPosts={true} onSelect={setCurrentTab} showPostCreator={false} />}
            {currentTab === 'bikinis' && <Bikinis />}
            {currentTab === 'threads' && <Threads />}
            {currentTab === 'sales' && <Sales />}
            {currentTab === 'chat' && <Chat onBack={() => setCurrentTab('menu')} />}
            {currentTab === 'attendance' && isAdmOrMestre && <Attendance />}
            {currentTab === 'configuracoes' && <Configuracoes />}
          </div>
        </div>
      </main>

      {/* INSTAGRAM MOBILE BOTTOM NAVIGATION BAR */}
      {currentTab !== 'chat' && (
        <InstagramMobileBottomNav 
          currentTab={currentTab} 
          onSelect={setCurrentTab} 
          viewingProfileUserId={viewingProfileUserId}
          onSelectProfile={setViewingProfileUserId}
        />
      )}

      {/* GLOBAL PROFILE MODAL FOR MOBILE */}
      {viewingProfileUserId && (
        <div className="md:hidden">
          <UserProfileGalleryModal 
            userId={viewingProfileUserId} 
            onClose={() => setViewingProfileUserId(null)} 
          />
        </div>
      )}
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
