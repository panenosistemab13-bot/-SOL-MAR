import React, { useState, useEffect } from "react";
import { useInventory } from "../context/InventoryContext";
import {
  Package,
  AlertTriangle,
  Scissors,
  Sun,
  Waves,
  Sparkles,
  Anchor,
  History,
  Bell,
  Trash2,
  TrendingUp,
  Activity,
  ShieldCheck,
  Truck,
  CloudSun,
  CheckCircle2,
  Clock,
  Search,
  ArrowUpRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { cn } from "../lib/utils";
import { ref, set } from "firebase/database";
import { rtdb } from "../lib/firebase";

export function Dashboard() {
  const { bikinis, threads, lowStockItemsCount, logs, users, currentUser } =
    useInventory();

  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClearLogs = () => {
    if (
      window.confirm("Deseja realmente limpar todo o histórico de alterações?")
    ) {
      set(ref(rtdb, "inventory/logs"), null).catch((err) =>
        console.error("Erro ao limpar logs:", err),
      );
    }
  };

  const visibleLogs = logs?.filter((log) => {
    const isJeff =
      log.username.toLowerCase() === "jeff" ||
      log.username.toLowerCase() === "jefferson";
    return !isJeff;
  });

  // Aggregate stock by model
  const stockByModel = bikinis.reduce(
    (acc, current) => {
      const existing = acc.find((item) => item.model === current.model);
      if (existing) {
        existing.stock += current.stock;
      } else {
        acc.push({ model: current.model, stock: current.stock });
      }
      return acc;
    },
    [] as { model: string; stock: number }[],
  );

  const lowBikinis = bikinis.filter((b) => b.stock <= b.minStockAlert);
  const lowThreads = threads.filter((t) => t.stock <= t.minStockAlert);

  const totalBikinis = bikinis.reduce((sum, item) => sum + item.stock, 0);
  const totalThreads = threads.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0c0d12]/90 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-white p-6 md:p-8 space-y-8">
      {/* Immersive Cyber/Operational Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -translate-y-20" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none translate-y-20" />

      {/* Hero Operational Banner matching reference */}
      <div className="relative bg-gradient-to-r from-[#161821] via-[#12131a] to-[#0c0d12] rounded-[1.8rem] border border-red-500/20 p-6 md:p-8 flex flex-col xl:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center opacity-10 pointer-events-none mix-blend-luminosity" />

        <div className="flex items-center gap-5 relative z-10 w-full xl:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 p-0.5 shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0c0d12] rounded-[14px] flex items-center justify-center text-red-400">
              <Activity className="w-8 h-8 animate-pulse text-red-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-[0.2em] text-red-400 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-red-400" /> OPERAÇÃO NORMAL
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-sans text-white tracking-tight mt-2">
              Bem-vindo ao Sistema Operacional
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Controle total de biquínis, insumos e logística em alta resolução.
            </p>
          </div>
        </div>

        {/* Operational Quick Metrics Pill */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Package size={16} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Peças</p>
              <p className="text-sm font-black text-white font-mono">{totalBikinis}</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Scissors size={16} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Insumos</p>
              <p className="text-sm font-black text-white font-mono">{totalThreads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bento Grid Stats matching reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Biquínis */}
        <div className="relative group overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#121318]/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-red-500/40">
          <div className="absolute -right-16 -top-16 w-44 h-44 bg-red-600/10 blur-[60px] rounded-full group-hover:bg-red-600/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              <Package size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              Coleção Ativa
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Biquínis Confeccionados</p>
            <h3 className="text-4xl font-black font-mono text-white tracking-tight flex items-baseline">
              {totalBikinis}
              <span className="text-xs font-bold text-red-400 ml-2 uppercase tracking-wider font-sans">peças</span>
            </h3>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-400 h-full w-[85%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 2: Insumos */}
        <div className="relative group overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#121318]/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40">
          <div className="absolute -right-16 -top-16 w-44 h-44 bg-cyan-500/10 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Scissors size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Aviamentos
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Linhas & Tecidos</p>
            <h3 className="text-4xl font-black font-mono text-white tracking-tight flex items-baseline">
              {totalThreads}
              <span className="text-xs font-bold text-cyan-400 ml-2 uppercase tracking-wider font-sans">rolos</span>
            </h3>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[70%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 3: Alertas Críticos */}
        <div className={cn(
          "relative group overflow-hidden rounded-[1.8rem] border p-6 shadow-xl backdrop-blur-xl transition-all duration-300",
          lowStockItemsCount > 0 ? "bg-red-500/5 border-red-500/40" : "bg-[#121318]/80 border-white/10"
        )}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={cn("p-3 rounded-xl border", lowStockItemsCount > 0 ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400")}>
              <AlertTriangle size={20} />
            </div>
            <span className={cn("text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border", lowStockItemsCount > 0 ? "bg-red-500/10 border-red-500/30 text-red-300 animate-pulse" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300")}>
              {lowStockItemsCount > 0 ? "Alerta Ativo" : "Estoque OK"}
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Itens Críticos</p>
            <h3 className="text-4xl font-black font-mono text-white tracking-tight flex items-baseline">
              {lowStockItemsCount}
              <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider font-sans">críticos</span>
            </h3>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className={cn("h-full rounded-full", lowStockItemsCount > 0 ? "bg-red-500 w-[90%]" : "bg-emerald-500 w-[15%]")} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart matching reference */}
        <div className="lg:col-span-2 rounded-[1.8rem] border border-white/10 bg-[#121318]/80 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold font-sans text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} className="text-red-400" /> Movimentação & Estoque por Modelo
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Visão gráfica consolidada da produção</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Vermelho Operacional
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByModel} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="redOpGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="cyanOpGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="model" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 8 }}
                  contentStyle={{
                    backgroundColor: '#121318',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                    fontSize: 12,
                    color: 'white',
                  }}
                />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                  {stockByModel.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "url(#redOpGlow)" : "url(#cyanOpGlow)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas Recentes Widget matching reference */}
        <div className="rounded-[1.8rem] border border-white/10 bg-[#121318]/80 backdrop-blur-xl p-6 md:p-8 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider flex items-center gap-2">
              <Bell size={16} className="text-red-400" /> Alertas Recentes
            </h3>
            <span className="text-[10px] font-mono bg-red-500/10 text-red-400 font-bold px-2.5 py-0.5 rounded-full border border-red-500/20">
              CRÍTICOS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[260px] custom-scrollbar">
            {lowStockItemsCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-slate-500 text-center gap-2">
                <CheckCircle2 size={28} className="text-emerald-400" />
                <p className="font-sans text-xs uppercase tracking-widest font-black text-emerald-400">Nenhum alerta pendente</p>
              </div>
            ) : (
              <>
                {lowBikinis.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs uppercase">{b.model}</p>
                      <p className="text-[10px] text-red-400 mt-0.5">Tamanho: {b.size} • {b.colorName}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                      {b.stock} / {b.minStockAlert}
                    </span>
                  </div>
                ))}
                {lowThreads.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs uppercase">{t.name}</p>
                      <p className="text-[10px] text-cyan-400 mt-0.5">Insumo: {t.colorName}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                      {t.stock} / {t.minStockAlert}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Histórico de Alterações */}
      <div className="rounded-[1.8rem] border border-white/10 bg-[#121318]/80 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-cyan-400" /> Últimas Atividades Operacionais
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Registro de alterações e eventos em tempo real</p>
          </div>
          {currentUser?.role === "MESTRE" && (
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 size={12} /> Limpar Histórico
            </button>
          )}
        </div>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {visibleLogs && visibleLogs.length > 0 ? (
            visibleLogs.map((log) => {
              const userMatch = users?.find((u) => u.username === log.username);
              const avatar = userMatch?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80";
              const parsedTime = new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " - " + new Date(log.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

              return (
                <div key={log.id} className="p-3.5 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={avatar} alt={log.workerName} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-200 font-medium leading-normal">
                        <strong className="text-red-400 font-bold uppercase tracking-wider">{log.workerName.toUpperCase()}</strong> {log.action}
                      </p>
                      <p className="text-[10px] text-slate-500">@{log.username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg font-mono shrink-0">
                    {parsedTime}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-center gap-2">
              <History size={24} className="text-slate-600" />
              <p className="font-sans text-xs uppercase tracking-widest font-black">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
