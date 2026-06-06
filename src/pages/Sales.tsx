import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { format, subDays } from 'date-fns';
import { 
  FileText, 
  Download, 
  Plus, 
  Sun, 
  Waves, 
  Anchor, 
  Compass, 
  TrendingUp, 
  Sparkles, 
  ShoppingBag, 
  Eye, 
  X, 
  DollarSign, 
  Ship, 
  ArrowUpRight, 
  Layers, 
  Award,
  ChevronRight,
  User,
  Heart
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { cn } from '../lib/utils';

export function Sales() {
  const { sales, bikinis, registerSale } = useInventory();
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<any>(null);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  // New sale state
  const [selectedBikiniId, setSelectedBikiniId] = useState<string>('');
  const [sellingQuantity, setSellingQuantity] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(159.90);
  const [formModelFilter, setFormModelFilter] = useState<string>('Todos');

  // Filter threads out or focus primarily on bikinis for retail styling
  const availableBikinis = useMemo(() => bikinis.filter(b => b.stock > 0), [bikinis]);

  const formUniqueModels = useMemo(() => ['Todos', ...Array.from(new Set(availableBikinis.map(b => b.model))) as string[]], [availableBikinis]);
  
  const filteredFormBikinis = useMemo(() => {
    return formModelFilter === 'Todos' 
      ? availableBikinis 
      : availableBikinis.filter(b => b.model === formModelFilter);
  }, [availableBikinis, formModelFilter]);

  // Dynamic calculations for Marine Stats
  const stats = useMemo(() => {
    const totalRev = sales.reduce((sum, s) => sum + s.total, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((acc, i) => acc + i.quantity, 0), 0);
    const averageTicket = sales.length > 0 ? totalRev / sales.length : 0;

    // Favorite model
    const counts: Record<string, number> = {};
    sales.forEach(s => {
      s.items.forEach(i => {
        const prod = bikinis.find(b => b.id === i.productId);
        if (prod) {
          counts[prod.model] = (counts[prod.model] || 0) + i.quantity;
        }
      });
    });

    const favoriteModel = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';

    return {
      totalRev,
      totalItems,
      averageTicket,
      favoriteModel
    };
  }, [sales, bikinis]);

  // Wave Chart Data - aggregated sales of last 7 days
  const chartData = useMemo(() => {
    const history: Record<string, number> = {};
    // Pre-populate last 7 days
    for (let i = 6; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), 'dd/MM');
      history[dateStr] = 0;
    }

    sales.forEach(s => {
      const dateStr = format(new Date(s.date), 'dd/MM');
      if (history[dateStr] !== undefined) {
        history[dateStr] += s.total;
      } else {
        // Fallback for older items or if outside 7 days
        history[dateStr] = s.total;
      }
    });

    return Object.entries(history).map(([day, total]) => ({
      day,
      Faturamento: parseFloat(total.toFixed(2))
    }));
  }, [sales]);

  // Compass Rose Data (Radar distribution of sales across Bikini models)
  const modelRadarData = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(s => {
      s.items.forEach(i => {
        const prod = bikinis.find(b => b.id === i.productId);
        if (prod) {
          counts[prod.model] = (counts[prod.model] || 0) + i.quantity;
        }
      });
    });

    // Take current models from context so radar has active nodes
    const activeModels = Array.from(new Set(bikinis.map(b => b.model))) as string[];
    if (activeModels.length === 0) {
      return [{ model: 'Sem Dados', Vendas: 0 }];
    }

    return activeModels.map((model: string) => ({
      model: model.length > 10 ? `${model.substring(0, 10)}.` : model,
      Vendas: counts[model] || 0
    }));
  }, [sales, bikinis]);

  // Export PDF with full beautiful styles
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(2, 132, 199); // Sky / ocean blue
    doc.text("Relatório de Vendas AcquaLog", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Estilo de Vida Praiano & Controle Logístico`, 14, 26);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 32);

    // Summary text
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Resumo Financeiro da Temporada:`, 14, 42);
    doc.setFontSize(10);
    doc.text(`- Faturamento Acumulado: ${formatCurrency(stats.totalRev)}`, 16, 48);
    doc.text(`- Total de Peças Lançadas: ${stats.totalItems} volumes`, 16, 54);
    doc.text(`- Ticket Médio dos Mares: ${formatCurrency(stats.averageTicket)}`, 16, 60);
    doc.text(`- Peça Mais Cobiçada: ${stats.favoriteModel}`, 16, 66);

    const tableData = sales.map(s => {
      const itemDetails = s.items.map(i => {
         const product = bikinis.find(b => b.id === i.productId);
         return product ? `${i.quantity}x ${product.model} (${product.size})` : `${i.quantity}x Item`;
      }).join(', ');

      return [
        format(new Date(s.date), 'dd/MM/yyyy HH:mm'),
        `#${s.id.toUpperCase()}`,
        itemDetails,
        formatCurrency(s.total)
      ];
    });

    autoTable(doc, {
      startY: 74,
      head: [['Data / Hora', 'Código', 'Itens Vendidos', 'Valor Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [244, 63, 94] }, // Hot pink!
    });

    doc.save(`acqualog-relatorio-mares-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Live registration of a real or custom sale
  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBikiniId) return;

    const b = bikinis.find(item => item.id === selectedBikiniId);
    if (!b) return;

    if (b.stock < sellingQuantity) {
      alert(`Quantidade desejada excede o estoque atual (${b.stock} em estoque)`);
      return;
    }

    const totalCalculated = sellingQuantity * sellingPrice;

    registerSale({
      date: new Date().toISOString(),
      items: [
        { productId: b.id, type: 'bikini', quantity: sellingQuantity, unitPrice: sellingPrice }
      ],
      total: totalCalculated
    });

    // Reset state & close panel
    setSelectedBikiniId('');
    setSellingQuantity(1);
    setIsNewSaleOpen(false);
  };



  return (
    <div className="relative space-y-8 select-none text-white pb-12">
      {/* Immersive Sunset Ocean Background Filter */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-30 mix-blend-color-dodge pointer-events-none rounded-[3rem]"
        style={{ filter: 'contrast(1.2) saturate(1.8)' }}
      />

      {/* Luxury Glowing Sea Orbs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-sky-500/10 blur-[170px] rounded-full pointer-events-none" />

      {/* Top action header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl z-20 overflow-hidden shadow-2xl">
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-pink-500/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-sky-500 p-0.5 shadow-lg shadow-pink-500/15 flex items-center justify-center relative">
            <Compass className="w-7 h-7 text-white animate-spin" style={{ animationDuration: '60s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 uppercase">
                Auditoria de Bordo
              </span>
              <span className="text-[9px] font-black tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 uppercase">
                Praia & Sol
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-widest uppercase text-white mt-1.5">
              Cabine de Faturamento e Relatórios
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-20">
          <button 
            type="button"
            onClick={() => setIsNewSaleOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-pink-500 hover:opacity-90 text-white px-5 py-3 rounded-full transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-500/10"
          >
            <ShoppingBag size={15} />
            Lançar Venda
          </button>

          <button 
            type="button"
            onClick={handleExportPDF}
            disabled={sales.length === 0}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 px-5 py-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider"
          >
            <Download size={15} className="text-sky-400" />
            Certificar PDF
          </button>
        </div>
      </div>

      {/* SOPHISTICATED INSTRUMENT DIALS (Luxury Beach Stats widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 animate-fade-in">
        
        {/* STATS 1: Collected tides */}
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-900/30 backdrop-blur-xl p-6 group transition-all duration-300 hover:border-pink-500/30 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest bg-pink-500/15 border border-pink-500/15 px-2.5 py-1 rounded-lg">
              Faturamento
            </span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Ondas de Caixa</p>
            <h3 className="text-3xl font-black font-mono text-white tracking-tight">
              {formatCurrency(stats.totalRev)}
            </h3>
          </div>
          {/* Subtle progress highlight */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Meta de Verão</span>
            <span className="text-pink-300 font-bold">100% ativa</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-pink-500 h-full w-[70%] rounded-full shadow-[0_0_8px_#ec4899]" />
          </div>
        </div>

        {/* STATS 2: Lançados */}
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-900/30 backdrop-blur-xl p-6 group transition-all duration-300 hover:border-sky-400/30 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest bg-sky-500/15 border border-sky-500/15 px-2.5 py-1 rounded-lg">
              Estoque Lançado
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <Ship size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Volumes ao Vento</p>
            <h3 className="text-3xl font-black font-mono text-white tracking-tight flex items-baseline gap-1">
              {stats.totalItems} <span className="text-xs font-bold text-slate-500 uppercase">unidades</span>
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Remessa</span>
            <span className="text-sky-300 font-bold">Atlântico Sul</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-400 h-full w-[85%] rounded-full shadow-[0_0_8px_#38bdf8]" />
          </div>
        </div>

        {/* STATS 3: Ticket medio */}
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-900/30 backdrop-blur-xl p-6 group transition-all duration-300 hover:border-pink-500/30 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest bg-pink-500/15 border border-pink-500/15 px-2.5 py-1 rounded-lg">
              Brisa Média
            </span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Média por Concha</p>
            <h3 className="text-3xl font-black font-mono text-white tracking-tight">
              {formatCurrency(stats.averageTicket)}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Performance</span>
            <span className="text-pink-300 font-bold">Excelente</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-400 to-pink-500 h-full w-[60%] rounded-full shadow-[0_0_8px_#ec4899]" />
          </div>
        </div>

        {/* STATS 4: Favorito */}
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-900/30 backdrop-blur-xl p-6 group transition-all duration-300 hover:border-sky-400/30 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest bg-sky-500/15 border border-sky-500/15 px-2.5 py-1 rounded-lg">
              Estampa de Ouro
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <Award size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">A Estrela da Estação</p>
            <h3 className="text-xl font-black text-white tracking-tight uppercase truncate">
              {stats.favoriteModel}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Demanda</span>
            <span className="text-sky-300 font-extrabold uppercase animate-pulse">Alta</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-400 h-full w-[95%] rounded-full shadow-[0_0_8px_#38bdf8]" />
          </div>
        </div>

      </div>

      {/* PREMIUM FLASHY GRAPHICS (2 Interactive Beachy Graphs with High-Contrast Blue & Hot Pink) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* GRAPH 1: Area Wave Chart for Faturamento (Ocean tide theme) */}
        <div className="lg:col-span-8 rounded-[2.5rem] border border-white/5 bg-slate-900/30 backdrop-blur-xl p-6 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5 relative z-10">
            <div>
              <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-pink-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Waves size={16} className="text-sky-300 animate-bounce" /> Ondas de Faturamento Real-Time
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Visão de marés financeiras ao longo das últimas marés e dias</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-sky-500/10 px-2 rounded-md border border-sky-500/20">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="text-[9px] text-slate-300 font-mono font-bold uppercase py-1">Tide Blue</span>
              </div>
              <div className="flex items-center gap-1.5 bg-pink-500/10 px-2 rounded-md border border-pink-500/20">
                <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
                <span className="text-[9px] text-slate-300 font-mono font-bold uppercase py-1">Pink Pearl</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="oceanWaveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.4} />
                    <stop offset="30%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                  dy={8}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} 
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(236,72,153,0.2)', strokeWidth: 1.5 }}
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)',
                    fontSize: 11,
                    color: '#fff',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Faturamento" 
                  stroke="url(#oceanWaveGradient)" 
                  strokeWidth={3.5} 
                  fillOpacity={1} 
                  fill="url(#oceanWaveGradient)" 
                  dot={{ r: 4, stroke: '#ec4899', strokeWidth: 1, fill: '#0f172a' }}
                  activeDot={{ r: 6, stroke: '#38bdf8', strokeWidth: 1.5, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Radar Chart "Rosa dos Ventos" for Distribution */}
        <div className="lg:col-span-4 rounded-[2.5rem] border border-white/5 bg-slate-900/30 backdrop-blur-xl p-6 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-500/5 blur-[90px] rounded-full pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Compass size={16} className="text-pink-400 animate-spin" style={{ animationDuration: '40s' }} /> Rosa Dos Ventos
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Demanda direcional de biquínis vendidos na temporada</p>
          </div>

          <div className="h-[220px] w-full my-4 flex items-center justify-center relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={modelRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis 
                  dataKey="model" 
                  tick={{ fill: '#cbd5e1', fontSize: 8, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 'auto']} 
                  tick={{ fill: '#64748b', fontSize: 8 }} 
                  axisLine={false}
                />
                <Radar 
                  name="Vendas" 
                  dataKey="Vendas" 
                  stroke="#ec4899" 
                  fill="#06b6d4" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[9px] text-center text-slate-500 uppercase tracking-widest font-black py-1.5 bg-white/[0.02] border border-white/5 rounded-xl">
            Sincronizado via Satélite
          </div>
        </div>

      </div>

      {/* REGISTERED SALES - GORGEOUS NAUTICAL CAPSULES (NO LIST / NO TABLE) */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-widest text-sky-400 bg-sky-500/10 px-3.5 py-1.5 rounded-full border border-sky-400/20 uppercase flex items-center gap-2 shadow-sm shadow-sky-500/5">
            <Sparkles size={11} className="text-sky-300" /> Registro De Conchas Financeiras
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Clique na concha para expandir o recibo</span>
        </div>

        {sales.length === 0 ? (
          <div className="bg-slate-900/20 rounded-[3rem] border border-white/5 py-24 text-center shadow-xl backdrop-blur-xl flex flex-col items-center justify-center gap-4">
             <Waves size={42} className="text-pink-500 opacity-20 animate-bounce" />
             <p className="text-slate-400 font-sans tracking-widest font-bold text-xs uppercase">Sem vendas registradas neste porto de faturamento.</p>
          </div>
        ) : (
          /* GORGEOUS CAPsULE GRID (Instead of list table) */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {sales.map((sale, idx) => {
              const saleItemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
              const dateObj = new Date(sale.date);
              const formattedDate = format(dateObj, 'dd MMM, HH:mm');
              
              // Custom marine dynamic icons based on total price
              const isMegaTide = sale.total >= 200;
              
              return (
                <div 
                  key={sale.id}
                  onClick={() => setSelectedSaleDetail(sale)}
                  className={cn(
                    "relative group/capsule rounded-[2.5rem] border p-5 transition-all duration-300 select-none overflow-hidden flex flex-col justify-between backdrop-blur-md shadow-xl hover:-translate-y-1 cursor-pointer",
                    isMegaTide 
                      ? "border-pink-500/30 bg-gradient-to-br from-pink-500/[0.08] via-slate-900/30 to-slate-950/80 hover:border-pink-500/50" 
                      : "border-white/5 bg-slate-900/30 hover:border-sky-500/20"
                  )}
                  style={{
                    boxShadow: isMegaTide 
                      ? '0 15px 35px -10px rgba(236, 72, 153, 0.15)' 
                      : '0 10px 30px -15px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Subtle tidal wave glowing overlay inside card */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover/capsule:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Glass Header */}
                  <div className="flex items-center justify-between w-full relative z-10 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-[11px] border shrink-0 transition-transform duration-300 group-hover/capsule:scale-105",
                        isMegaTide 
                          ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' 
                          : 'bg-sky-500/10 border-sky-500/10 text-sky-400'
                      )}>
                        {isMegaTide ? <Sparkles size={12} /> : <Anchor size={12} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest font-mono">
                          #{sale.id.substring(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[8px] text-slate-500 font-semibold tracking-wider">{formattedDate}</p>
                      </div>
                    </div>

                    <span className={cn(
                      "text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md border",
                      isMegaTide 
                        ? 'bg-pink-500/15 border-pink-500/20 text-pink-300' 
                        : 'bg-slate-800 border-white/5 text-slate-300'
                    )}>
                      {isMegaTide ? 'MARÉ ALTA' : 'BRISA'}
                    </span>
                  </div>

                  {/* Body: Items summarized beautifully */}
                  <div className="my-4 py-1 relative z-10 space-y-2">
                    {sale.items.map((it, iIdx) => {
                      const prod = bikinis.find(b => b.id === it.productId);
                      return (
                        <div key={iIdx} className="flex items-center justify-between text-[11px] bg-white/[0.015] border border-white/5 px-2.5 py-1.5 rounded-xl group-hover/capsule:bg-white/[0.03] transition-colors">
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                            <span className="text-[10px] font-black text-pink-400 bg-pink-500/5 px-1 rounded">
                              {it.quantity}x
                            </span>
                            <span className="font-bold text-slate-200 capitalize truncate">
                              {prod ? `${prod.model} (${prod.size})` : 'Item'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-slate-400 font-mono text-[10px]">
                            {prod && (
                              <span 
                                className="w-1.5 h-1.5 rounded-full border border-white/10" 
                                style={{ backgroundColor: prod.colorHex }} 
                              />
                            )}
                            <span>{formatCurrency(it.unitPrice)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer: Multi details */}
                  <div className="flex items-center justify-between w-full relative z-10 pt-3 border-t border-white/5">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">
                      {saleItemsCount} {saleItemsCount === 1 ? 'Volume' : 'Volumes'}
                    </span>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-lg font-black font-mono text-white tracking-tighter leading-none">
                        {formatCurrency(sale.total)}
                      </span>
                      <ChevronRight size={14} className="text-pink-400 opacity-60 group-hover/capsule:opacity-100 group-hover/capsule:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PANEL MODAL A: Full Interactive Bill/Receipt details popover */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in select-text">
          <div className="relative border border-white/10 bg-slate-950/95 max-w-md w-full rounded-[3rem] overflow-hidden p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Visual background sand textures */}
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-pink-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/10 blur-2xl rounded-full" />

            <div className="flex items-center justify-between relative z-10 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  ⚓
                </div>
                <div>
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-[#fff]">Detalhes Da Concha</h3>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">ID: {selectedSaleDetail.id.toUpperCase()}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedSaleDetail(null)}
                className="w-10 h-10 rounded-full border border-white/5 hover:border-pink-500/30 hover:bg-white/5 flex items-center justify-center transition-all text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulated Marine Holographic Bill Voucher */}
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/5 relative z-10 font-mono text-[11px] text-slate-300 space-y-4 shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-white/10 uppercase text-[9px] text-sky-400 font-bold">
                <span>AcquaLog Logística</span>
                <span>Porto de Saída</span>
              </div>

              <div className="space-y-1.5 uppercase text-[10px]">
                <p><span className="text-slate-500">Navegado em:</span> {format(new Date(selectedSaleDetail.date), 'dd/MM/yyyy - HH:mm:ss')}</p>
                <p><span className="text-slate-500">ID Identificação:</span> #{selectedSaleDetail.id.substring(0, 16).toUpperCase()}</p>
                <p><span className="text-slate-500">Status Remessa:</span> <span className="text-pink-300 font-sans font-black">✔ ENVIADO AO MAR</span></p>
              </div>

              <div className="border-t border-dashed border-white/10 pt-3 space-y-3">
                <p className="text-[9px] text-slate-400 uppercase font-bold">Resumo da Cargo:</p>
                {selectedSaleDetail.items.map((i: any, ind: number) => {
                  const prod = bikinis.find(b => b.id === i.productId);
                  return (
                    <div key={ind} className="flex justify-between items-start leading-tight">
                      <div className="uppercase">
                        <p className="font-extrabold text-white">{prod ? prod.model : 'Item'}</p>
                        <p className="text-[9px] text-slate-500">Tam: {prod ? prod.size : '-'} • Cor: {prod ? prod.colorName : '-'}</p>
                      </div>
                      <div className="text-right">
                        <p>{i.quantity} u x {formatCurrency(i.unitPrice)}</p>
                        <p className="font-bold text-pink-300 mt-0.5">{formatCurrency(i.quantity * i.unitPrice)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-white/10 pt-3 flex justify-between items-baseline">
                <span className="text-white uppercase font-bold text-[10px]">Total Líquido:</span>
                <span className="text-xl font-black font-sans text-pink-400 tracking-tight">{formatCurrency(selectedSaleDetail.total)}</span>
              </div>
            </div>

            {/* PDF certification trigger */}
            <div className="flex gap-3 relative z-10">
              <button 
                type="button"
                onClick={() => {
                  handleExportPDF();
                  setSelectedSaleDetail(null);
                }}
                className="flex-1 bg-gradient-to-r from-sky-500 to-pink-500 text-white font-black uppercase text-[10px] py-3.5 tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Download size={13} /> Ancorar PDF (Recibo)
              </button>
              
              <button 
                type="button"
                onClick={() => setSelectedSaleDetail(null)}
                className="flex-1 border border-white/5 hover:border-white/10 text-slate-300 font-black uppercase text-[10px] py-3.5 tracking-wider rounded-2xl"
              >
                Retornar ao Mar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANEL MODAL B: Form Launcher "Lançar Venda" customized like custom captain console */}
      {isNewSaleOpen && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in select-text">
          <form 
            onSubmit={handleSubmitSale}
            className="relative border border-white/10 bg-slate-950/95 max-w-xl w-full rounded-[3rem] overflow-hidden p-6 md:p-8 space-y-6 shadow-2xl"
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-pink-500/10 blur-[90px] rounded-full" />
            <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-sky-500/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between relative z-10 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-pink-500/10">
                  👙
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#fff]">Registrar Saída Logística</h3>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Biquínis e volumes lançados ao faturamento</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsNewSaleOpen(false)}
                className="w-10 h-10 rounded-full border border-white/5 hover:border-pink-500/30 hover:bg-white/5 flex items-center justify-center transition-all text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              
              {/* Product selector: scrolling cards box */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    Conchas e Modelos em Estoque Ativo:
                  </label>
                  
                  {/* Model filter tabs for quick switching with beach look */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-white/5 rounded-xl max-w-full overflow-x-auto scrollbar-none shrink-0">
                    {formUniqueModels.map((m) => {
                      const isActive = formModelFilter === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormModelFilter(m)}
                          className={cn(
                            "px-2.5 py-1 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all shrink-0",
                            isActive 
                              ? "bg-gradient-to-r from-sky-400 to-pink-500 text-white shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          )}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {filteredFormBikinis.length === 0 ? (
                  <div className="bg-rose-500/[0.04] border border-rose-500/10 p-6 rounded-2xl text-center space-y-1">
                    <Waves className="w-5 h-5 mx-auto text-rose-400/40 animate-pulse" />
                    <p className="text-[10px] text-rose-300 uppercase font-black tracking-widest">
                      Nenhum item com estoque correspondente.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {filteredFormBikinis.map((item) => {
                      const isChosen = selectedBikiniId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedBikiniId(item.id);
                            // Auto select standard price suggestion
                            setSellingPrice(159.90);
                          }}
                          className={cn(
                            "group/item-btn rounded-2xl border p-3 flex flex-col justify-between text-left transition-all duration-300 relative overflow-hidden h-24",
                            isChosen 
                              ? "border-pink-500 bg-gradient-to-br from-pink-500/25 via-slate-900/60 to-slate-950/80 shadow-inner ring-2 ring-pink-500/30" 
                              : "border-white/5 bg-slate-900/50 hover:border-sky-500/30 hover:bg-slate-900/80"
                          )}
                        >
                          {/* Ocean ripple on selected */}
                          {isChosen && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-transparent animate-pulse pointer-events-none" />
                          )}

                          <div className="flex items-start justify-between w-full relative z-10">
                            <div className="min-w-0 flex-1 pr-1">
                              <span className={cn(
                                "font-black text-[11px] tracking-wide uppercase transition-colors block truncate",
                                isChosen ? "text-pink-300" : "text-white group-hover/item-btn:text-sky-300"
                              )}>
                                {item.model}
                              </span>
                              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5 block truncate">
                                {item.colorName}
                              </span>
                            </div>
                            
                            <span className={cn(
                              "text-[8px] font-mono px-1.5 py-0.5 rounded-lg font-black border tracking-wider shrink-0",
                              isChosen 
                                ? "bg-pink-500/20 text-pink-300 border-pink-500/30" 
                                : "bg-sky-500/10 text-sky-400 border-sky-400/20"
                            )}>
                              {item.size}
                            </span>
                          </div>

                          <div className="flex items-center justify-between w-full relative z-10 mt-2">
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-md relative shrink-0 block" 
                                style={{ 
                                  backgroundColor: item.colorHex,
                                  boxShadow: `0 0 6px ${item.colorHex}50`
                                }} 
                              />
                            </div>
                            
                            <span className="text-[9px] font-bold text-slate-300 font-mono flex items-baseline gap-0.5">
                              Est: <strong className={cn(
                                "font-black",
                                isChosen ? "text-pink-300 text-[11px]" : "text-sky-300"
                              )}>{item.stock}</strong>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quantity launcher */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">
                    Quantidade Desejada:
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={!selectedBikiniId}
                    value={sellingQuantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10);
                      setSellingQuantity(isNaN(qty) ? 1 : Math.max(1, qty));
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    placeholder="1"
                    className="w-full bg-white/5 hover:bg-white/10 focus:bg-slate-900 border border-white/5 focus:border-pink-500/40 rounded-2xl py-3 px-4 font-mono text-center text-md font-bold text-white focus:outline-none focus:ring-0 transition-all uppercase placeholder:text-slate-600 shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">
                    Preço Unitário (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={!selectedBikiniId}
                    value={sellingPrice}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value);
                      setSellingPrice(isNaN(price) ? 0 : Math.max(0, price));
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    placeholder="159.90"
                    className="w-full bg-white/5 hover:bg-white/10 focus:bg-slate-900 border border-white/5 focus:border-pink-500/40 rounded-2xl py-3 px-4 font-mono text-center text-md font-bold text-[#fff] focus:outline-none focus:ring-0 transition-all uppercase placeholder:text-slate-600 shadow-inner"
                  />
                </div>
              </div>

              {/* Real-time calculated checkout voucher summary */}
              {selectedBikiniId && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/[0.05] to-sky-500/[0.05] border border-white/5 font-mono text-[10px] text-slate-300 space-y-1 relative overflow-hidden">
                  <span className="absolute top-1 right-2 uppercase tracking-widest text-[7px] text-pink-300 font-black">Cargo-Checkout</span>
                  <p className="uppercase text-slate-400">Modelo Selecionado: <strong className="text-white ml-1 font-sans">{bikinis.find(b => b.id === selectedBikiniId)?.model}</strong></p>
                  <p className="uppercase text-slate-400">Valor Estimado: <strong className="text-white ml-1 font-serif">{sellingQuantity}x R$ {sellingPrice.toFixed(2)}</strong></p>
                  <div className="border-t border-white/5 mt-2 pt-2 flex justify-between items-baseline">
                    <span className="text-white uppercase font-bold">Resgate de Bordo:</span>
                    <span className="text-md font-sans text-pink-400 font-black">{formatCurrency(sellingQuantity * sellingPrice)}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Launch CTA */}
            <div className="flex gap-3 relative z-10">
              <button 
                type="submit"
                disabled={!selectedBikiniId}
                className="flex-1 bg-gradient-to-r from-sky-500 to-pink-500 hover:opacity-90 text-white font-black uppercase text-[10px] py-4 tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                ⚓ Lançar no Faturamento logístico
              </button>
              
              <button 
                type="button"
                onClick={() => setIsNewSaleOpen(false)}
                className="flex-1 border border-white/5 hover:border-white/10 text-slate-300 font-black uppercase text-[10px] py-4 tracking-wider rounded-2xl"
              >
                Cancelar Transação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FOOTER DECORATION - Custom beach stamp */}
      <div className="w-full text-center relative z-10 pt-4 flex flex-col items-center justify-center gap-2 select-none">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">
          <span>AcquaLog Brasil</span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          <span>Capitânia Logística e Corporativa</span>
        </div>
        <p className="text-[9px] text-slate-600 font-light max-w-sm">
          Sua bússola de faturamento integrada com sensações tropicais de praia, sol e brisa do mar. Todos os direitos de bordo reservados.
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-slate-500 text-xs">
          <Heart size={10} className="text-pink-500 fill-pink-500/30 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Estilo Acqua 2026.</span>
        </div>
      </div>
    </div>
  );
}
