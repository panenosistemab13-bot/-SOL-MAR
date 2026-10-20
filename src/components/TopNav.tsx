import React from 'react';
import { LayoutDashboard, Tag, Scissors, Grid, Package, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

interface TopNavProps {
  currentTab: string;
  onSelect: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'bikinis', label: 'Biquínis', icon: Tag },
  { id: 'estoque_encomenda', label: 'Encomendas', icon: Package },
  { id: 'threads', label: 'Insumos', icon: Scissors },
];

export function TopNav({ currentTab, onSelect }: TopNavProps) {
  const { currentUser, lowStockItemsCount } = useInventory();
  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';
  
  const allowedItems = isAdmOrMestre
    ? [...navItems, { id: 'configuracoes', label: 'Ajustes', icon: Settings }]
    : navItems;

  return (
    <div className="flex items-center gap-1.5 bg-[#18181b]/90 border border-white/10 rounded-2xl p-1.5 shadow-xl backdrop-blur-md overflow-x-auto max-w-full">
      <button
        onClick={() => onSelect('menu')}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-medium text-xs shrink-0 cursor-pointer",
          currentTab === 'menu' 
            ? "bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
            : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
        )}
        title="Menu Principal"
      >
        <Grid size={16} />
        <span className="hidden sm:inline">Menu</span>
      </button>
      
      <div className="w-[1px] h-5 bg-white/10 mx-1 shrink-0" />
      
      <div className="flex items-center gap-1 overflow-x-auto">
        {allowedItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-300 relative shrink-0 cursor-pointer text-xs font-semibold",
                isActive 
                  ? "bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon size={16} className="relative z-10 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>

              {item.id === 'dashboard' && lowStockItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
