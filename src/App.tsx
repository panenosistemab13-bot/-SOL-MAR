import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Dashboard } from './pages/Dashboard';
import { Bikinis } from './pages/Bikinis';
import { Threads } from './pages/Threads';
import { Sales } from './pages/Sales';
import { EstoqueEncomenda } from './pages/EstoqueEncomenda';
import { MainMenu } from './components/MainMenu';
import { TopNav } from './components/TopNav';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('menu');
  const { lowStockItemsCount } = useInventory(); 
  
  const tabTitles: Record<string, string> = {
    dashboard: 'Gestão de Inventário',
    bikinis: 'Estoque de Biquínis',
    threads: 'Insumos & Fios',
    sales: 'Relatórios & Vendas',
    estoque_encomenda: 'Estoque Encomenda',
  };

  const navTabs = ['dashboard', 'bikinis', 'estoque_encomenda', 'threads', 'sales'];

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
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const index = navTabs.indexOf(currentTab);
          if (index !== -1) {
            const nextIndex = (index + 1) % navTabs.length;
            setCurrentTab(navTabs[nextIndex]);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const index = navTabs.indexOf(currentTab);
          if (index !== -1) {
            const prevIndex = (index - 1 + navTabs.length) % navTabs.length;
            setCurrentTab(navTabs[prevIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTab]);

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
          <div className="flex-1 flex items-center justify-end gap-4">
            {lowStockItemsCount > 0 && (
              <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide flex items-center gap-2 shadow-sm">
                <span className="shrink-0 leading-none">⚠️</span> 
                {lowStockItemsCount} Críticos
              </div>
            )}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 md:p-12 relative">
          <div className="max-w-7xl mx-auto h-full relative z-10">
            {currentTab === 'dashboard' && <Dashboard />}
            {currentTab === 'bikinis' && <Bikinis />}
            {currentTab === 'threads' && <Threads />}
            {currentTab === 'sales' && <Sales />}
            {currentTab === 'estoque_encomenda' && <EstoqueEncomenda />}
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
