import React from 'react';
import { LayoutDashboard, Tag, Scissors, ShoppingCart, Grid, Package, Settings, MessageSquare, CalendarCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

interface TopNavProps {
  currentTab: string;
  onSelect: (tab: string) => void;
}

const navItems = [
  { id: 'chat', icon: MessageSquare },
  { id: 'attendance', icon: CalendarCheck },
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'bikinis', icon: Tag },
  { id: 'estoque_encomenda', icon: Package },
  { id: 'threads', icon: Scissors },
  { id: 'sales', icon: ShoppingCart },
];

export function TopNav({ currentTab, onSelect }: TopNavProps) {
  const { currentUser, lowStockItemsCount, unreadMessagesCount } = useInventory();
  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';
  
  const allowedItems = isAdmOrMestre
    ? [...navItems, { id: 'configuracoes', icon: Settings }]
    : navItems;

  return (
    <div className="flex items-center bg-[#18181b] border border-white/5 rounded-[1.5rem] p-1.5 shadow-2xl backdrop-blur-md">
      <button
        onClick={() => onSelect('menu')}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
          currentTab === 'menu' 
            ? "bg-white/10 text-white" 
            : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
        )}
      >
        <Grid size={20} />
      </button>
      
      <div className="w-[1px] h-6 bg-white/10 mx-2" />
      
      <div className="flex items-center gap-1.5 border-l border-transparent">
        {allowedItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-[1.25rem] transition-all duration-300 relative",
                isActive 
                  ? "bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={22} className="relative z-10" />

              {item.id === 'dashboard' && lowStockItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#18181b]" />
              )}

              {item.id === 'chat' && unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-pink-500 to-amber-500 border border-[#18181b] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg animate-bounce z-20">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
