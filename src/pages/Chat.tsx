import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { rtdb } from '../lib/firebase';
import { ref, onValue, push, set, update } from 'firebase/database';
import { Send, MessageSquare, Shield, CheckCheck, Sparkles, Users, Trash, Pin, Bell } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  text: string;
  timestamp: string; // ISO Format
  pinned?: boolean;
  urgency?: 'comum' | 'prioridade' | 'urgente';
  views?: {
    [username: string]: {
      name: string;
      timestamp: string;
    }
  };
}

export function Chat() {
  const { currentUser, isReadOnly, users } = useInventory();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [urgency, setUrgency] = useState<'comum' | 'prioridade' | 'urgente'>('comum');
  const [pinnedOnSend, setPinnedOnSend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWriter = currentUser?.role === 'MESTRE' || 
                   currentUser?.role === 'ADM' || 
                   currentUser?.role === 'LIDER';

  // 1. Escutar mensagens do Firebase em tempo real
  useEffect(() => {
    const chatRef = ref(rtdb, 'chat/messages');
    setIsLoading(true);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = new Date().getTime();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const expiredIds: string[] = [];

        const loadedMessages: ChatMessage[] = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        })).filter(msg => {
          if (!msg.timestamp) return true;
          const msgTime = new Date(msg.timestamp).getTime();
          if (isNaN(msgTime)) return true;
          const isExpired = (now - msgTime) > threeDaysMs;
          if (isExpired) {
            expiredIds.push(msg.id);
            return false;
          }
          return true;
        });

        loadedMessages.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        setMessages(loadedMessages);

        if (expiredIds.length > 0 && !isReadOnly) {
          expiredIds.forEach(id => {
            const expiredRef = ref(rtdb, `chat/messages/${id}`);
            set(expiredRef, null).catch(err => console.error("Erro ao limpar aviso antigo:", err));
          });
        }
      } else {
        setMessages([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.warn("Chat sync notice:", error?.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isReadOnly]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // 3. Marcar mensagens como visualizadas
  useEffect(() => {
    if (!currentUser || messages.length === 0) return;

    messages.forEach((msg) => {
      if (!msg.views || !msg.views[currentUser.username]) {
        const viewRef = ref(rtdb, `chat/messages/${msg.id}/views/${currentUser.username}`);
        set(viewRef, {
          name: currentUser.name,
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Erro ao registrar visualização:", err));
      }
    });
  }, [messages, currentUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || isReadOnly) return;

    const chatRef = ref(rtdb, 'chat/messages');
    const newMsgRef = push(chatRef);

    const messagePayload: any = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      views: {
        [currentUser.username]: {
          name: currentUser.name,
          timestamp: new Date().toISOString()
        }
      }
    };

    if (isWriter) {
      if (urgency !== 'comum') {
        messagePayload.urgency = urgency;
      }
      if (pinnedOnSend) {
        messagePayload.pinned = true;
      }
    }

    set(newMsgRef, messagePayload)
      .then(() => {
        setNewMessage('');
        setUrgency('comum');
        setPinnedOnSend(false);
      })
      .catch((err) => {
        console.error("Erro ao enviar mensagem:", err);
      });
  };

  const handleDeleteMessage = (msgId: string, senderId: string) => {
    if (isReadOnly) return;
    const canDelete = currentUser?.role === 'MESTRE';
    if (!canDelete) return;

    if (window.confirm("Deseja realmente remover este aviso importante?")) {
      const msgRef = ref(rtdb, `chat/messages/${msgId}`);
      set(msgRef, null).catch(err => console.error("Erro ao remover aviso:", err));
    }
  };

  const handleTogglePin = (msgId: string, currentPinned: boolean) => {
    if (isReadOnly) return;
    if (!isWriter) return;

    const msgRef = ref(rtdb, `chat/messages/${msgId}`);
    update(msgRef, {
      pinned: !currentPinned
    }).catch(err => console.error("Erro ao fixar/desafixar comunicado:", err));
  };

  const handleClearAll = () => {
    if (isReadOnly) return;
    const canDelete = currentUser?.role === 'MESTRE';
    if (!canDelete) return;

    if (window.confirm("Deseja realmente apagar TODOS os comunicados deste mural? Esta ação é irreversível.")) {
      const chatRef = ref(rtdb, `chat/messages`);
      set(chatRef, null).catch(err => console.error("Erro ao apagar mural:", err));
    }
  };

  const formatRole = (role: string) => {
    if (role === 'MESTRE') return 'Mestre';
    if (role === 'ADM') return 'Adm';
    if (role === 'LIDER') return 'Líder';
    if (role === 'FUNCIONARIO_A') return 'Confecção A';
    if (role === 'FUNCIONARIO_B') return 'Confecção B';
    return role;
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'MESTRE') return 'bg-[#3d2723]/30 text-[#ebdcb9] border-[#ebdcb9]/40';
    if (role === 'ADM') return 'bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]/20';
    if (role === 'LIDER') return 'bg-[#c5a880]/20 text-[#ebdcb9] border-[#c5a880]/30';
    return 'bg-white/5 text-slate-300 border-white/5';
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col bg-[#130d08]/75 backdrop-blur-2xl border border-[#ebdcb9]/15 rounded-[2rem] overflow-hidden relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Radiant Background Blur elements to simulate high production beach look */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#c5a880]/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#ebdcb9]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* 1. Elegant Header */}
      <div className="p-4 bg-black/40 border-b border-[#ebdcb9]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ebdcb9]/10 flex items-center justify-center border border-[#ebdcb9]/25 shrink-0">
            <Bell size={15} className="text-[#ebdcb9] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black text-[#fbf8f2] tracking-widest uppercase m-0 leading-none">Mural de Avisos</h2>
              <span className="text-[8px] bg-gradient-to-r from-[#ebdcb9] to-[#c5a880] text-[#3d2723] font-black px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                Oficial
              </span>
            </div>
            <p className="text-[9px] text-[#d7cab5] m-0 mt-1 leading-none">Lançamento de comunicados importantes, tarefas e avisos.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {currentUser?.role === 'MESTRE' && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[8px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20 transition-all cursor-pointer"
            >
              <Trash size={10} /> Limpar Tudo
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2.5 py-1.5 rounded-lg">
            <Users size={11} className="text-[#c5a880]" />
            <span className="text-[8px] uppercase font-bold tracking-widest text-[#ebdcb9]/60">
              Confecção Sol & Mar
            </span>
          </div>
        </div>
      </div>

      {/* 2. Message History Area */}
      <div className="flex-grow overflow-y-auto p-5 space-y-4 relative min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-24">
            <div className="w-8 h-8 rounded-full border-2 border-[#ebdcb9] border-t-transparent animate-spin mb-3" />
            <p className="text-[10px] text-[#c5a880] font-bold tracking-widest animate-pulse uppercase">Sincronizando mural...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-[#c5a880]/50 mb-4 shadow-sm">
              <MessageSquare size={24} className="stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-[#fbf8f2] tracking-wider uppercase">Sem avisos recentes</h3>
            <p className="text-xs text-[#d7cab5] max-w-xs mt-1.5 leading-relaxed">
              O mural está limpo. Comunicados importantes sobre a produção serão publicados aqui por administradores e líderes.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto pb-4">
            {messages.map((msg) => {
              const viewEntries = Object.entries(msg.views || {});
              const filteredEntries = viewEntries.filter(([username]) => {
                const isMestre = username.toLowerCase() === 'jeff' || users?.find(u => u.username.toLowerCase() === username.toLowerCase())?.role === 'MESTRE';
                const loggedUserIsMestre = currentUser?.role === 'MESTRE';
                return !(isMestre && !loggedUserIsMestre);
              });
              const currentViews = filteredEntries.map(([, val]) => val);
              const hasViewers = currentViews.length > 0;
              const dateObj = new Date(msg.timestamp);
              const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const isMine = currentUser?.id === msg.senderId;

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-2.5 relative group rounded-xl p-3 sm:p-3.5 transition-all duration-200 border ${
                    msg.pinned
                      ? 'bg-[#c5a880]/10 border-[#c5a880]/30 shadow-sm'
                      : isMine 
                        ? 'bg-white/[0.03] border-[#ebdcb9]/10' 
                        : 'bg-black/20 border-white/5'
                  }`}
                >
                  {/* Pin label icon */}
                  {msg.pinned && (
                    <div className="absolute top-3.5 right-3.5 text-[#ebdcb9] flex items-center gap-1 text-[7.5px] font-black uppercase tracking-widest bg-[#c5a880]/20 px-2 py-0.5 rounded border border-[#c5a880]/30 shadow-sm leading-none">
                      <Pin size={7} className="text-[#ebdcb9] rotate-45" /> FIXADO
                    </div>
                  )}

                  {/* Avatar Bubble inside high end border */}
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#ebdcb9]/25 shadow-sm shrink-0 bg-black/40">
                    <img 
                      src={msg.senderAvatar} 
                      alt={msg.senderName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1 pr-12">
                      <span className="text-[11px] font-bold text-[#fbf8f2]">{msg.senderName}</span>
                      
                      <span className={`text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded border leading-none ${getRoleBadgeStyle(msg.senderRole)}`}>
                        {formatRole(msg.senderRole)}
                      </span>

                      {msg.urgency === 'urgente' && (
                        <span className="text-[7.5px] bg-red-950 text-red-400 border border-red-900 font-extrabold px-1 py-0.5 rounded uppercase tracking-wider leading-none">
                          🔥 URGENTE
                        </span>
                      )}
                      
                      {msg.urgency === 'prioridade' && (
                        <span className="text-[7.5px] bg-amber-950 text-amber-400 border border-amber-900 font-bold px-1 py-0.5 rounded uppercase tracking-wider leading-none">
                          ⚠️ PRIORIDADE
                        </span>
                      )}

                      <span className="text-[8px] text-[#c5a880]/60 font-mono">
                        {formattedDate} - {formattedTime}
                      </span>
                    </div>

                    {/* Speech Text */}
                    <p className="text-[11px] sm:text-[11.5px] text-[#fbf8f2]/90 leading-relaxed whitespace-pre-wrap break-words pr-2 m-0 font-light">
                      {msg.text}
                    </p>

                    {/* View Receipts tracking box inside clay bubble */}
                    {hasViewers && (
                      <div className="mt-2.5 pt-2 border-t border-[#ebdcb9]/10 space-y-1.5 select-none">
                        <div className="flex items-center gap-1.5 text-[7.5px] font-black tracking-widest text-emerald-400 uppercase">
                          <CheckCheck size={10} className="text-emerald-400 shrink-0" />
                          <span>Visualizado ({currentViews.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {currentViews.map((v: any, index) => {
                            const viewDate = new Date(v.timestamp);
                            const timeStr = viewDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const dateStr = viewDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                            return (
                              <span 
                                key={index}
                                className="inline-flex items-center gap-1 text-[8px] font-medium text-emerald-300 bg-emerald-950/25 border border-emerald-500/15 px-2 py-0.5 rounded-lg uppercase tracking-wider transition-all duration-200"
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-bold">{v.name}</span>
                                <span className="text-emerald-500/70 font-mono text-[7px]">({dateStr} {timeStr})</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover Buttons on Right Column */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Toggle Pin element (Writers only) */}
                    {isWriter && (
                      <button
                        onClick={() => handleTogglePin(msg.id, !!msg.pinned)}
                        className="p-1.5 text-[#c5a880] hover:text-[#ebdcb9] hover:bg-[#ebdcb9]/10 rounded-lg cursor-pointer transition-all"
                        title={msg.pinned ? "Desafixar do topo" : "Fixar no topo"}
                      >
                        <Pin size={12} className={msg.pinned ? "fill-current" : ""} />
                      </button>
                    )}

                    {/* Delete trigger for Mestre */}
                    {currentUser?.role === 'MESTRE' && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id, msg.senderId)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-all"
                        title="Excluir comunicado"
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. Input Footer Bar */}
      {currentUser && (
        <div className="p-3 bg-black/50 border-t border-[#ebdcb9]/10 sticky bottom-0 z-20 backdrop-blur-md">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            
            {/* Extended Options for Writers */}
            {isWriter && (
              <div className="flex flex-wrap gap-1.5 items-center px-1">
                {/* Urgency select with custom arrow */}
                <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1 shadow-sm">
                  <span className="text-[7.5px] font-black tracking-widest uppercase text-[#c5a880]">Urgência:</span>
                  <select
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    disabled={isReadOnly}
                    className="bg-transparent text-[#ebdcb9] text-[8px] font-black focus:outline-none cursor-pointer uppercase tracking-wider hover:text-white"
                  >
                    <option value="comum" className="bg-[#130d08] text-[#d7cab5]">Comum</option>
                    <option value="prioridade" className="bg-[#130d08] text-amber-400 font-bold">⚠️ Prioridade</option>
                    <option value="urgente" className="bg-[#130d08] text-red-500 font-black">🔥 Urgente</option>
                  </select>
                </div>

                {/* Pin toggle */}
                <label className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1 shadow-sm cursor-pointer select-none hover:bg-white/[0.04] transition-colors">
                  <input
                    type="checkbox"
                    checked={pinnedOnSend}
                    onChange={(e) => setPinnedOnSend(e.target.checked)}
                    disabled={isReadOnly}
                    className="w-3 h-3 text-[#ebdcb9] bg-black/40 border-white/10 rounded focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer accent-[#c5a880]"
                  />
                  <span className="text-[7.5px] font-black tracking-widest uppercase text-[#c5a880] flex items-center gap-1">
                    <Pin size={7} className="text-[#ebdcb9] shrink-0" />
                    Fixar no Topo
                  </span>
                </label>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva uma mensagem ou comunicado para a confecção..."
                disabled={isReadOnly}
                className="flex-1 bg-black/40 border border-[#ebdcb9]/15 rounded-xl px-3.5 py-2 text-[11px] text-[#fbf8f2]/90 placeholder-[#c5a880]/30 focus:outline-none focus:border-[#ebdcb9]/50 focus:ring-1 focus:ring-[#ebdcb9]/10 transition-all resize-none max-h-20 min-h-[38px] leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isReadOnly}
                className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${
                  newMessage.trim() && !isReadOnly
                    ? 'bg-gradient-to-tr from-[#ebdcb9] to-[#ad9e7a] text-[#3d2723] hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-stone-600 border border-white/5 cursor-not-allowed'
                }`}
                aria-label="Enviar mensagem"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
