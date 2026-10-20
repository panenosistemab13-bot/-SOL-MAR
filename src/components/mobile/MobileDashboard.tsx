import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { 
  Sun, 
  ShoppingBag, 
  Heart, 
  Tag, 
  UserCheck, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface MobileDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export function MobileDashboard({ onNavigateTab }: MobileDashboardProps) {
  const { bikinis, currentUser } = useInventory();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Francielle';
  const totalBikinis = bikinis.reduce((sum, item) => sum + item.stock, 0);

  // Editorial collection photos matching luxury resort wear aesthetics
  const collections = [
    {
      id: 'biquinis',
      name: 'BIQUÍNIS',
      image: 'https://images.unsplash.com/photo-1576188973526-0e5d7047b0cf?auto=format&fit=crop&w=500&q=80',
      tab: 'bikinis'
    },
    {
      id: 'conjuntos',
      name: 'CONJUNTOS',
      image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=500&q=80',
      tab: 'bikinis'
    },
    {
      id: 'saidas',
      name: 'SAÍDAS DE PRAIA',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
      tab: 'bikinis'
    },
    {
      id: 'acessorios',
      name: 'ACESSÓRIOS',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80',
      tab: 'threads'
    }
  ];

  return (
    <div className="space-y-5 pb-6 select-none font-sans">
      {/* 1. Welcome Section */}
      <div className="flex items-center gap-3 px-1 pt-1">
        <div className="w-8 h-8 rounded-full bg-[#171511] border border-[#D6AD62]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(214,173,98,0.2)]">
          <Sun size={17} className="text-[#D6AD62] animate-pulse" />
        </div>
        <div className="leading-tight">
          <span className="text-[10px] font-sans font-bold tracking-[0.25em] text-[#D6AD62] uppercase block">
            BEM-VINDA DE VOLTA,
          </span>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide mt-0.5">
            {firstName}
          </h1>
        </div>
      </div>

      {/* 2. Main Editorial Beachwear Banner (Exact Reference Match) */}
      <div className="relative rounded-[1.8rem] overflow-hidden bg-[#171511] border border-[#D6AD62]/30 shadow-[0_12px_35px_rgba(0,0,0,0.7)] group">
        {/* Background Editorial Beachwear Image */}
        <div className="relative h-[255px] sm:h-[280px] w-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" 
            alt="Editorial Sol & Mar" 
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-[0.92]"
          />
          {/* Subtle warm luxury sun vignette & dark gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

          {/* Content Overlay */}
          <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#D6AD62] uppercase block">
                SOL & MAR
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide mt-1 leading-[1.15] max-w-[210px] sm:max-w-xs drop-shadow-md">
                Biquínis que valorizam você
              </h2>
              <p className="text-[8.5px] sm:text-[9.5px] font-medium tracking-[0.18em] text-[#F5F0E7]/90 uppercase mt-2 drop-shadow">
                CONFORTO • ESTILO • VERÃO O ANO TODO
              </p>
            </div>

            <div className="flex items-end justify-between">
              {/* Gold Pill CTA Button */}
              <button
                onClick={() => onNavigateTab('bikinis')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D6AD62] via-[#F3D99B] to-[#D6AD62] text-[#0B0A08] font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_4px_18px_rgba(214,173,98,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <span>VER COLEÇÃO</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>

              {/* Carousel Indicators */}
              <div className="flex items-center gap-1.5 pb-1">
                {[0, 1, 2, 3].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeBannerIndex === idx
                        ? 'w-5 bg-[#D6AD62]'
                        : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Shortcuts (4 square rounded cards in a horizontal row) */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Meus Pedidos */}
        <button
          onClick={() => onNavigateTab('estoque_encomenda')}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 hover:border-[#D6AD62]/60 active:scale-95 transition-all flex flex-col items-center justify-between text-center min-h-[92px] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-black/40 border border-[#D6AD62]/20 flex items-center justify-center text-[#D6AD62] group-hover:scale-110 transition-transform">
            <ShoppingBag size={17} className="stroke-[1.8]" />
          </div>
          <span className="text-[8.5px] font-bold text-white uppercase tracking-wider leading-tight mt-1">
            MEUS<br />PEDIDOS
          </span>
          <ArrowRight size={10} className="text-[#D6AD62] mt-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Favoritos */}
        <button
          onClick={() => onNavigateTab('bikinis')}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 hover:border-[#D6AD62]/60 active:scale-95 transition-all flex flex-col items-center justify-between text-center min-h-[92px] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-black/40 border border-[#D6AD62]/20 flex items-center justify-center text-[#D6AD62] group-hover:scale-110 transition-transform">
            <Heart size={17} className="stroke-[1.8]" />
          </div>
          <span className="text-[8.5px] font-bold text-white uppercase tracking-wider leading-tight mt-1">
            FAVORITOS
          </span>
          <ArrowRight size={10} className="text-[#D6AD62] mt-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Promoções */}
        <button
          onClick={() => onNavigateTab('bikinis')}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 hover:border-[#D6AD62]/60 active:scale-95 transition-all flex flex-col items-center justify-between text-center min-h-[92px] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-black/40 border border-[#D6AD62]/20 flex items-center justify-center text-[#D6AD62] group-hover:scale-110 transition-transform">
            <Tag size={17} className="stroke-[1.8]" />
          </div>
          <span className="text-[8.5px] font-bold text-white uppercase tracking-wider leading-tight mt-1">
            PROMOÇÕES
          </span>
          <ArrowRight size={10} className="text-[#D6AD62] mt-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Minha Conta */}
        <button
          onClick={() => onNavigateTab('configuracoes')}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 hover:border-[#D6AD62]/60 active:scale-95 transition-all flex flex-col items-center justify-between text-center min-h-[92px] shadow-md group"
        >
          <div className="w-8 h-8 rounded-xl bg-black/40 border border-[#D6AD62]/20 flex items-center justify-center text-[#D6AD62] group-hover:scale-110 transition-transform">
            <UserCheck size={17} className="stroke-[1.8]" />
          </div>
          <span className="text-[8.5px] font-bold text-white uppercase tracking-wider leading-tight mt-1">
            MINHA<br />CONTA
          </span>
          <ArrowRight size={10} className="text-[#D6AD62] mt-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4. Categorias de Produtos ("NOSSAS COLEÇÕES") */}
      <div className="space-y-3">
        {/* Header with Golden Accent Lines */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-[1px] w-4 bg-[#D6AD62]" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#D6AD62] uppercase whitespace-nowrap">
              NOSSAS COLEÇÕES
            </span>
            <div className="h-[1px] flex-1 bg-[#D6AD62]/25" />
          </div>

          <button
            onClick={() => onNavigateTab('bikinis')}
            className="text-[10px] font-bold tracking-wider text-[#F5F0E7] hover:text-[#D6AD62] uppercase flex items-center gap-1 shrink-0 ml-1 transition-colors"
          >
            <span>VER TODAS</span>
            <ChevronRight size={12} className="text-[#D6AD62]" />
          </button>
        </div>

        {/* 4 Photo Cards (Horizontal Swipe Carousel) */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {collections.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigateTab(item.tab)}
              className="w-[110px] sm:w-[125px] rounded-2xl bg-[#171511] border border-[#D6AD62]/25 overflow-hidden shrink-0 shadow-md active:scale-95 transition-all text-left group"
            >
              <div className="h-[95px] sm:h-[105px] w-full overflow-hidden relative bg-black/60">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-2 bg-[#F5F0E7] flex items-center justify-between">
                <span className="text-[8.5px] font-sans font-bold text-[#0B0A08] tracking-wider uppercase truncate">
                  {item.name}
                </span>
                <ArrowRight size={10} className="text-[#8D6A32] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Resumo de Estoque ("ESTOQUE ATUAL") */}
      <div 
        onClick={() => onNavigateTab('bikinis')}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#171511] via-[#1c1813] to-[#0B0A08] border border-[#D6AD62]/30 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer active:scale-[0.99] transition-all group"
      >
        {/* Subtle Golden Wave Glow Layer */}
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-[#D6AD62]/15 via-[#F3D99B]/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Trending Up Circular Badge */}
            <div className="w-11 h-11 rounded-full bg-black/50 border border-[#D6AD62]/50 flex items-center justify-center text-[#D6AD62] shadow-[0_0_15px_rgba(214,173,98,0.25)] shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp size={20} className="stroke-[2.2]" />
            </div>

            <div>
              <span className="text-[9px] font-bold tracking-[0.25em] text-[#D6AD62] uppercase block">
                ESTOQUE ATUAL
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-serif font-bold text-white tracking-tight">
                  {totalBikinis}
                </span>
                <span className="text-[11px] text-[#F5F0E7]/80 font-normal">
                  itens disponíveis
                </span>
              </div>
            </div>
          </div>

          {/* Golden Circular Action Arrow */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] flex items-center justify-center shadow-[0_2px_10px_rgba(214,173,98,0.4)] group-hover:scale-110 transition-transform shrink-0">
            <ArrowRight size={16} className="stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
