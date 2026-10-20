import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Bell, ChevronDown, LogOut, Settings, Sparkles, User } from 'lucide-react';

interface MobileHeaderProps {
  onNavigateTab: (tab: string) => void;
}

export function MobileHeader({ onNavigateTab }: MobileHeaderProps) {
  const { currentUser, logout, lowStockItemsCount } = useInventory();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Usuário';

  return (
    <header className="h-[64px] bg-[#0B0A08]/95 backdrop-blur-2xl border-b border-[#D6AD62]/20 flex items-center justify-between px-4 shrink-0 z-50 sticky top-0 shadow-[0_4px_25px_rgba(0,0,0,0.8)] select-none">
      {/* Sol & Mar Biquínis Brand Logo (Reference Match) */}
      <div 
        onClick={() => onNavigateTab('dashboard')}
        className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
      >
        {/* Stylized Sun & Ocean Wave Logo */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#171511] to-[#252017] border border-[#D6AD62]/60 p-1 flex items-center justify-center shadow-[0_0_12px_rgba(214,173,98,0.25)] shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full text-[#D6AD62]" fill="none" stroke="currentColor">
            {/* Wave crest */}
            <path 
              d="M6 24C10 24 13 21 16 17C19 13 22 10 26 10C30 10 33 13 34 16C35 19 32 22 28 22C24 22 21 19 22 16" 
              strokeWidth="2.2" 
              strokeLinecap="round"
            />
            <path 
              d="M10 27C14 27 17 24 20 21C23 18 26 16 29 16C32 16 34 18 34 20" 
              strokeWidth="1.8" 
              strokeLinecap="round"
            />
            {/* Sun arc */}
            <circle cx="20" cy="20" r="17" strokeWidth="1.5" stroke="#D6AD62" strokeDasharray="3 2" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-serif font-bold tracking-[0.22em] text-[#FFFFFF] uppercase leading-tight">
            SOL & MAR
          </span>
          <span className="text-[7.5px] font-sans font-medium tracking-[0.35em] text-[#D6AD62] uppercase leading-none mt-0.5">
            BIQUÍNIS
          </span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-3">
        {/* User Pill with Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 py-1 pl-1 pr-2 rounded-full bg-[#171511] border border-[#D6AD62]/30 hover:border-[#D6AD62]/60 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#D6AD62]/70 shadow-sm shrink-0">
              <img 
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                alt={firstName} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <span className="text-[11px] font-medium text-[#F5F0E7] max-w-[65px] truncate">
              {firstName}
            </span>
            <ChevronDown size={12} className={`text-[#D6AD62] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* User Quick Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[#0B0A08]/95 backdrop-blur-2xl border border-[#D6AD62]/30 p-2 shadow-[0_15px_35px_rgba(0,0,0,0.85)] z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[#D6AD62]/15 mb-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-[#D6AD62] font-mono uppercase">{currentUser?.role}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onNavigateTab('configuracoes');
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs text-[#F5F0E7] hover:bg-[#D6AD62]/15 hover:text-[#D6AD62] flex items-center gap-2 transition-colors"
              >
                <Settings size={14} className="text-[#D6AD62]" /> Minha Conta
              </button>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                className="w-full px-3 py-2 rounded-xl text-left text-xs text-red-300 hover:bg-red-950/40 flex items-center gap-2 transition-colors mt-0.5"
              >
                <LogOut size={14} /> Desconectar
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon with Indicator */}
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="relative p-2 rounded-full text-[#F5F0E7] hover:text-[#D6AD62] active:scale-95 transition-all"
          title="Notificações"
        >
          <Bell size={18} className="text-[#F5F0E7]" />
          {lowStockItemsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D6AD62] shadow-[0_0_8px_#D6AD62] animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
}
