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
            <p className="text-[13px] font-light tracking-wide text-sky-400 m-0 mt-1 capitalize">{today}</p>
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
