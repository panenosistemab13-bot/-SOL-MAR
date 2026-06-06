import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { rtdb } from '../lib/firebase';
import { ref, onValue, push, set, update } from 'firebase/database';
import { Send, MessageSquare, Shield, Lock, Eye, CheckCheck, Sparkles, User, Bell, Users, Trash, Pin } from 'lucide-react';

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

  // 1. Escutar mensagens do Firebase em tempo real e remover automaticamente as com mais de 3 dias
  useEffect(() => {
    const chatRef = ref(rtdb, 'chat/messages');
    setIsLoading(true);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = new Date().getTime();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const expiredIds: string[] = [];

        // Converte objeto em array e filtra mensagens com menos de 3 dias de envio
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

        // Ordenação: primeiro os fixados, depois por data de envio (mais antigo primeiro, simulando chat)
        loadedMessages.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        setMessages(loadedMessages);

        // Se houver mensagens expiradas, remove-as definitivamente do banco de dados Firebase
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
    });

    return () => unsubscribe();
  }, [isReadOnly]);

  // 2. Rolar para o final do chat quando houver novas mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // 3. Marcar mensagens como visualizadas pelo usuário atual
  useEffect(() => {
    if (!currentUser || messages.length === 0) return;

    messages.forEach((msg) => {
      // Se eu ainda não visualizei a mensagem (não está listada no objeto 'views')
      if (!msg.views || !msg.views[currentUser.username]) {
        const viewRef = ref(rtdb, `chat/messages/${msg.id}/views/${currentUser.username}`);
        set(viewRef, {
          name: currentUser.name,
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Erro ao registrar visualização:", err));
      }
    });
  }, [messages, currentUser]);

  // 4. Enviar mensagem para o Firebase (Qualquer usuário logado pode enviar agora)
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

    // Mestre, ADM e Líder podem definir urgência e fixado ao criar
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

  // 5. Apagar mensagem (somente o MESTRE pode fazer isso)
  const handleDeleteMessage = (msgId: string, senderId: string) => {
    if (isReadOnly) return;
    const canDelete = currentUser?.role === 'MESTRE';
    if (!canDelete) return;

    if (window.confirm("Deseja realmente remover este aviso importante?")) {
      const msgRef = ref(rtdb, `chat/messages/${msgId}`);
      set(msgRef, null).catch(err => console.error("Erro ao remover aviso:", err));
    }
  };

  // 6. Fixar/Desafixar mensagem (somente Mestre, ADM, Líder podem fazer isso)
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
    if (role === 'ADM') return 'Administrador';
    if (role === 'LIDER') return 'Líder';
    if (role === 'FUNCIONARIO_A') return 'Confecção A';
    if (role === 'FUNCIONARIO_B') return 'Confecção B';
    return role;
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'MESTRE') return 'bg-purple-500/15 text-purple-400 border-purple-500/25';
    if (role === 'ADM') return 'bg-pink-500/15 text-pink-400 border-pink-500/25';
    if (role === 'LIDER') return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#09090b]/40 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden relative" style={{ minHeight: 'calc(100vh - 180px)' }}>
      {/* Radiant Background Blur */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-pink-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Bar / Info panel */}
      <div className="p-4 bg-[#0c0c0e]/80 border-b border-white/5 flex items-center justify-between z-10 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500/20 to-amber-500/20 flex items-center justify-center border border-pink-500/20">
            <Bell size={18} className="text-pink-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-widest uppercase m-0 leading-none">Mural de Avisos</h2>
              <span className="text-[9px] bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                Oficial
              </span>
            </div>
            <p className="text-[10px] text-slate-400 m-0 mt-1">Lançamento de comunicados importantes, tarefas e avisos.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser?.role === 'MESTRE' && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
            >
              <Trash size={12} /> Limpar Tudo
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-2xl">
            <Users size={14} className="text-pink-400" />
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Confecção Sol & Mar
            </span>
          </div>
        </div>
      </div>

      {/* Message Screen Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-mono tracking-wider animate-pulse uppercase">Sincronizando mural...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
              <MessageSquare size={24} className="stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-black text-white tracking-tight uppercase">Sem avisos recentes</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              O mural está limpo. Comunicados importantes sobre a produção serão publicados aqui por administradores e líderes.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => {
              const viewEntries = Object.entries(msg.views || {});
              const filteredEntries = viewEntries.filter(([username]) => {
                const isMestre = username.toLowerCase() === 'jeff' || users?.find(u => u.username.toLowerCase() === username.toLowerCase())?.role === 'MESTRE';
                const loggedUserIsMestre = currentUser?.role === 'MESTRE';
                return !(isMestre && !loggedUserIsMestre);
              });
              const currentViews = filteredEntries.map(([, val]) => val);
              const hasViewers = currentViews.length > 0;
              const viewerNames = currentViews.map((v: any) => v.name).join(', ');
              const dateObj = new Date(msg.timestamp);
              const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const isMine = currentUser?.id === msg.senderId;

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 relative group rounded-2xl p-3.5 transition-all duration-200 border ${
                    isMine 
                      ? 'bg-pink-500/[0.03] border-pink-500/10 hover:border-pink-500/20' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Avatar bubble */}
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-md shrink-0 bg-slate-950">
                    <img 
                      src={msg.senderAvatar} 
                      alt={msg.senderName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[11px] font-black tracking-tight text-white">{msg.senderName}</span>
                      
                      {/* Role Emblem */}
                      {(currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM' || currentUser?.role === 'LIDER') && (
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(msg.senderRole)}`}>
                          {formatRole(msg.senderRole)}
                        </span>
                      )}

                      {/* Timestamp */}
                      <span className="text-[9px] text-slate-500 ml-auto font-mono">
                        {formattedDate} às {formattedTime}
                      </span>

                      {/* Delete Trigger Button (Hover state only on MESTRE) */}
                      {currentUser?.role === 'MESTRE' && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id, msg.senderId)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 cursor-pointer"
                          title="Excluir comunicado"
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </div>

                    {/* Speech Text */}
                    <p className="text-[12px] sm:text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap break-words pr-2 m-0 font-medium">
                      {msg.text}
                    </p>

                    {/* View Receipts tracking box */}
                    {hasViewers && (
                      <div className="mt-3.5 pt-2.5 border-t border-white/[0.03] space-y-2 select-none">
                        <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-[#22c55e] uppercase">
                          <CheckCheck size={12} className="text-emerald-400 shrink-0" />
                          <span>Visualizado por ({currentViews.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-0.5">
                          {currentViews.map((v: any, index) => {
                            const viewDate = new Date(v.timestamp);
                            const timeStr = viewDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const dateStr = viewDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                            return (
                              <span 
                                key={index}
                                className="inline-flex items-center gap-1.5 text-[9px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider transition-all duration-200"
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-bold">{v.name}</span>
                                <span className="text-emerald-500/70 font-mono">({dateStr} às {timeStr})</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input panel (Todos os usuários integrados podem escrever agora) */}
      {currentUser && (
        <div className="p-3 bg-[#0c0c0e]/95 border-t border-white/5 sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            
            {/* Opções extras de fixação e urgência (Apenas Mestre, ADM e Líder) */}
            {isWriter && (
              <div className="flex flex-wrap gap-2 items-center px-1">
                {/* Menu suspenso grau de urgência */}
                <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl px-2.5 py-1.5 shadow-sm">
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Urgência:</span>
                  <select
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    disabled={isReadOnly}
                    className="bg-transparent text-slate-300 text-[10px] font-bold focus:outline-none cursor-pointer uppercase tracking-wider hover:text-white"
                  >
                    <option value="comum" className="bg-slate-950 text-slate-300">Comum</option>
                    <option value="prioridade" className="bg-slate-950 text-amber-400 font-bold">⚠️ Prioridade</option>
                    <option value="urgente" className="bg-slate-950 text-red-500 font-black">🔥 Urgente</option>
                  </select>
                </div>

                {/* Checkbox fixar no topo */}
                <label className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl px-2.5 py-1.5 shadow-sm cursor-pointer select-none group/lbl hover:bg-white/[0.04] transition-colors">
                  <input
                    type="checkbox"
                    checked={pinnedOnSend}
                    onChange={(e) => setPinnedOnSend(e.target.checked)}
                    disabled={isReadOnly}
                    className="w-3.5 h-3.5 text-pink-500 bg-[#0c0c0e]/80 border-white/10 rounded focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer accent-pink-500"
                  />
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 group-hover/lbl:text-slate-300 transition-colors flex items-center gap-1">
                    <Pin size={10} className="text-pink-400 shrink-0" />
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
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 transition-all resize-none max-h-24 min-h-[44px]"
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
                className={`w-[44px] h-[44px] rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  newMessage.trim() && !isReadOnly
                    ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white hover:opacity-90 active:scale-95 shadow-pink-500/10'
                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
                aria-label="Enviar mensagem"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
