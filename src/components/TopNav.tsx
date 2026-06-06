import React from 'react';
import { LayoutDashboard, Tag, Scissors, ShoppingCart, Grid, Package } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopNavProps {
  currentTab: string;
  onSelect: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'bikinis', icon: Tag },
  { id: 'estoque_encomenda', icon: Package },
  { id: 'threads', icon: Scissors },
  { id: 'sales', icon: ShoppingCart },
];

export function TopNav({ currentTab, onSelect }: TopNavProps) {
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
        {navItems.map(item => {
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
