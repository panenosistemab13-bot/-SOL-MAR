import React from 'react';
import { Home, LayoutGrid, ShoppingCart, Tag, User } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export function MobileBottomNav({ currentTab, onSelectTab }: MobileBottomNavProps) {
  const { lowStockItemsCount } = useInventory();

  const navItems = [
    {
      id: 'dashboard',
      label: 'INÍCIO',
      icon: Home
    },
    {
      id: 'bikinis',
      label: 'COLEÇÕES',
      icon: LayoutGrid
    },
    {
      id: 'estoque_encomenda',
      label: 'PEDIDOS',
      icon: ShoppingCart
    },
    {
      id: 'threads',
      label: 'PROMOÇÕES',
      icon: Tag
    },
    {
      id: 'configuracoes',
      label: 'PERFIL',
      icon: User
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#0B0A08]/98 backdrop-blur-2xl border-t border-[#D6AD62]/25 pb-[env(safe-area-inset-bottom,8px)] pt-2 px-3 shadow-[0_-8px_30px_rgba(0,0,0,0.9)] max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative cursor-pointer active:scale-95 transition-all select-none"
            >
              <div className="relative mb-1">
                <Icon 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    isActive 
                      ? 'text-[#D6AD62] stroke-[2.4px]' 
                      : 'text-[#F5F0E7] stroke-[1.8px] opacity-80'
                  }`} 
                />
                {/* Notification indicator on Pedidos/Dashboard if low stock */}
                {item.id === 'dashboard' && lowStockItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#D6AD62] shadow-[0_0_6px_#D6AD62] animate-pulse" />
                )}
              </div>

              <span 
                className={`text-[9.5px] font-sans font-bold tracking-[0.14em] uppercase transition-colors duration-200 leading-none ${
                  isActive 
                    ? 'text-[#D6AD62]' 
                    : 'text-[#F5F0E7]/70'
                }`}
              >
                {item.label}
              </span>

              {/* Discreet active indicator dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#D6AD62] shadow-[0_0_6px_#D6AD62] mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
