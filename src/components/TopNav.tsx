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
  { id: 'bikinis', icon: Tag },
  { id: 'threads', icon: Scissors },
  { id: 'sales', icon: ShoppingCart },
];

export function TopNav({ currentTab, onSelect }: TopNavProps) {
  const { currentUser, lowStockItemsCount, unreadMessagesCount } = useInventory();
  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';
  const isFuncionarioB = currentUser?.role === 'FUNCIONARIO_B';
  
  const visibleNavItems = navItems.filter(item => {
    if (item.id === 'attendance' && !isAdmOrMestre) return false;
    return true;
  });

  const allowedItems = [...visibleNavItems, { id: 'configuracoes', icon: Settings }];

  return (
    <div className="flex items-center bg-[#18181b]/90 border border-white/5 rounded-2xl md:rounded-[1.5rem] p-1 md:p-1.5 shadow-2xl backdrop-blur-md max-w-full overflow-x-auto no-scrollbar scrollbar-none">
      <button
        onClick={() => onSelect('menu')}
        className={cn(
          "w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl transition-all duration-300 shrink-0",
          currentTab === 'menu' 
            ? "bg-white/10 text-white" 
            : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
        )}
      >
        <Grid size={16} className="md:w-5 md:h-5" />
      </button>
      
      <div className="w-[1px] h-5 md:h-6 bg-white/10 mx-1.5 md:mx-2 shrink-0" />
      
      <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
        {allowedItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-[1.25rem] transition-all duration-300 relative shrink-0",
                isActive 
                  ? "bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={16} className="md:w-[22px] md:h-[22px] relative z-10" />

              {item.id === 'dashboard' && lowStockItemsCount > 0 && (
                <span className="absolute top-1 md:top-1.5 right-1 md:right-1.5 w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-rose-500 border border-[#18181b]" />
              )}

              {item.id === 'chat' && unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-pink-500 to-amber-500 border border-[#18181b] text-white text-[7px] md:text-[8px] font-black w-3.5 h-3.5 md:w-4.5 md:h-4.5 rounded-full flex items-center justify-center shadow-lg animate-bounce z-20">
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
