import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Dashboard } from './pages/Dashboard';
import { Bikinis } from './pages/Bikinis';
import { Threads } from './pages/Threads';
import { Sales } from './pages/Sales';
import { EstoqueEncomenda } from './pages/EstoqueEncomenda';
import { Configuracoes } from './pages/Configuracoes';
import { Login } from './components/Login';
import { MainMenu } from './components/MainMenu';
import { TopNav } from './components/TopNav';

function AppContent() {
  const { lowStockItemsCount, currentUser, logout } = useInventory(); 
  const [currentTab, setCurrentTab] = useState('menu');
  
  if (!currentUser) {
    return <Login />;
  }

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const tabTitles: Record<string, string> = {
    dashboard: 'Gestão de Inventário',
    bikinis: 'Estoque de Biquínis',
    threads: 'Insumos & Fios',
    sales: 'Relatórios & Vendas',
    estoque_encomenda: 'Estoque Encomenda',
    configuracoes: 'Configurações do Sistema'
  };

  const navTabs = isAdmOrMestre
    ? ['dashboard', 'bikinis', 'estoque_encomenda', 'threads', 'sales', 'configuracoes']
    : ['dashboard', 'bikinis', 'estoque_encomenda', 'threads', 'sales'];

  React.useEffect(() => {
    // Redirect role-restricted users who somehow land on configuracoes to dashboard
    if (currentTab === 'configuracoes' && !isAdmOrMestre) {
      setCurrentTab('menu');
    }
  }, [currentTab, isAdmOrMestre]);

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

  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

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
    </InventoryProvider>
  );
}
