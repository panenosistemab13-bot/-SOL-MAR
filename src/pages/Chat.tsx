import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { rtdb } from '../lib/firebase';
import { ref, onValue, push, set, update } from 'firebase/database';
import { 
  Send, 
  MessageSquare, 
  Shield, 
  CheckCheck, 
  Sparkles, 
  Users, 
  Trash, 
  Pin, 
  Bell, 
  ChevronLeft, 
  Camera, 
  Video, 
  Phone, 
  Info, 
  Image as ImageIcon, 
  Mic, 
  Smile, 
  Search, 
  Plus,
  Edit3,
  Heart,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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

import { moderateContent } from '../lib/ai';

export function Chat() {
  const { currentUser, isReadOnly, users } = useInventory();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [urgency, setUrgency] = useState<'comum' | 'prioridade' | 'urgente'>('comum');
  const [pinnedOnSend, setPinnedOnSend] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWriter = currentUser?.role === 'MESTRE' || 
                   currentUser?.role === 'ADM' || 
                   currentUser?.role === 'LIDER';

  // Mock DMs for Instagram look
  const dms = [
    { 
      id: 'mural', 
      name: 'Mural de Avisos', 
      avatar: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=100&q=80', 
      lastMsg: messages.length > 0 ? messages[messages.length - 1].text : 'Bem-vindo ao mural oficial', 
      time: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Agora',
      isGroup: true,
      unread: messages.some(m => !m.views || !m.views[currentUser?.username || ''])
    },
    { id: '1', name: 'Luciana', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', lastMsg: 'Biquíni azul finalizado!', time: '1h', unread: true },
    { id: '2', name: 'Fernanda', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', lastMsg: 'Viu o novo modelo?', time: '3h', unread: false },
    { id: '3', name: ' Jefferson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', lastMsg: 'Estoque atualizado.', time: 'Ontem', unread: false },
    { id: '4', name: 'Ana Paula', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', lastMsg: 'Me envia o molde?', time: 'Ter', unread: false },
  ];

  const filteredDMs = dms.filter(dm => 
    dm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dm.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          if (msg.senderId === 'jeff' || msg.senderName?.toLowerCase().includes('jefferson')) return false;
          const msgSender = users?.find(u => u.id === msg.senderId);
          if (msgSender?.username === 'jeff') return false;

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
  }, [isReadOnly, users]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0 && activeChat === 'mural') {
      scrollToBottom();
    }
  }, [messages, activeChat]);

  // 3. Marcar mensagens como visualizadas
  useEffect(() => {
    if (!currentUser || messages.length === 0 || activeChat !== 'mural') return;

    messages.forEach((msg) => {
      if (!msg.views || !msg.views[currentUser.username]) {
        const viewRef = ref(rtdb, `chat/messages/${msg.id}/views/${currentUser.username}`);
        set(viewRef, {
          name: currentUser.name,
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Erro ao registrar visualização:", err));
      }
    });
  }, [messages, currentUser, activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || isReadOnly) return;

    // Moderation check
    const safety = await moderateContent(newMessage.trim());
    if (!safety.isSafe) {
      alert(`Aviso impróprio detectado: ${safety.reason || 'Siga as diretrizes do SOL & MAR.'}`);
      return;
    }

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

  const handleDeleteMessage = (msgId: string) => {
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

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col bg-[#000000] md:bg-[#130d08]/75 md:backdrop-blur-2xl md:border md:border-[#ebdcb9]/15 md:rounded-[2rem] overflow-hidden relative h-full md:h-[calc(100vh-200px)]">
      <AnimatePresence mode="wait">
        {!activeChat ? (
          <motion.div 
            key="inbox"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header Inbox */}
            <div className="flex items-center justify-between p-4 px-6 pt-6 bg-black/20">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{currentUser?.username || 'mensagens'}</h1>
                <ChevronLeft className="-rotate-90 text-white/60" size={16} />
              </div>
              <div className="flex items-center gap-6">
                <Video size={24} className="text-white" />
                <Edit3 size={22} className="text-white" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-2">
              <div className="relative flex items-center bg-white/10 rounded-xl px-3 py-2 text-white/50">
                <Search size={16} className="mr-2" />
                <input 
                  type="text" 
                  placeholder="Pesquisar" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full text-sm outline-none text-white placeholder:text-white/40 font-medium"
                />
              </div>
            </div>

            {/* Notes Row (IG style) */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-6 py-4">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 p-0.5 relative">
                  <img src={currentUser?.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 bg-sky-500 rounded-full p-0.5 border-2 border-black">
                    <Plus size={10} className="text-white" />
                  </div>
                </div>
                <span className="text-[10px] text-white/60">Sua nota</span>
              </div>
              {users?.slice(0, 5).filter(u => u.id !== currentUser?.id).map(user => (
                <div key={user.id} className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-white/10 p-0.5">
                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className="text-[10px] text-white/60">{user.username}</span>
                </div>
              ))}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 md:pb-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-sm font-bold text-white">Mensagens</h2>
                <button className="text-sky-500 text-xs font-semibold">Solicitações</button>
              </div>
              
              <div className="space-y-1">
                {filteredDMs.map(dm => (
                  <button 
                    key={dm.id}
                    onClick={() => setActiveChat(dm.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors active:scale-[0.98] cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex shrink-0">
                      <div className="w-full h-full rounded-full bg-black p-0.5">
                        <img src={dm.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[13px] font-bold text-white truncate">{dm.name}</p>
                      <div className="flex items-center gap-1">
                        <p className={cn(
                          "text-[12px] truncate",
                          dm.unread ? "text-white font-bold" : "text-white/50 font-normal"
                        )}>
                          {dm.lastMsg}
                        </p>
                        <span className="text-[10px] text-white/30 shrink-0">• {dm.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {dm.unread && <div className="w-2 h-2 bg-sky-500 rounded-full shadow-sm shadow-sky-500/50" />}
                      <Camera size={20} className="text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden bg-black"
          >
            {/* Header Chat */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                    <img src={dms.find(d => d.id === activeChat)?.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight">
                      {dms.find(d => d.id === activeChat)?.name}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-medium leading-tight">Ativo(a) agora</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <Phone size={22} className="text-white" />
                <Video size={24} className="text-white" />
                <Info size={22} className="text-white" />
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-[#000000]">
              {activeChat === 'mural' ? (
                <>
                  <div className="flex flex-col items-center py-8 mb-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 p-1 mb-3">
                      <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=150&q=80" alt="" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Mural de Avisos</h3>
                    <p className="text-[12px] text-white/50">Grupo • Confecção Sol & Mar</p>
                    <button className="mt-4 px-4 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-colors">
                      Ver Perfil
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 pb-4">
                    {messages.map((msg, index) => {
                      const isMine = currentUser?.id === msg.senderId;
                      const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                      const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== msg.senderId;
                      
                      return (
                        <div 
                          key={msg.id} 
                          className={cn(
                            "flex flex-col max-w-[75%]",
                            isMine ? "self-end items-end" : "self-start items-start",
                            showAvatar ? "mt-4" : "mt-0.5"
                          )}
                        >
                          {!isMine && showAvatar && (
                            <span className="text-[10px] text-white/40 mb-1 ml-1 font-bold">{msg.senderName}</span>
                          )}
                          
                          <div className="flex items-end gap-2 w-full">
                            {!isMine && (
                              <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden bg-white/5 mb-0.5">
                                {showAvatar && <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" />}
                              </div>
                            )}
                            
                            <div className="relative group flex-1">
                              <div 
                                className={cn(
                                  "px-4 py-2.5 rounded-[20px] text-[13px] leading-snug whitespace-pre-wrap break-words inline-block min-w-[30px]",
                                  isMine 
                                    ? "bg-[#3797f0] text-white rounded-br-[4px] float-right" 
                                    : "bg-[#262626] text-white rounded-bl-[4px]",
                                  msg.pinned && "ring-1 ring-[#c5a880]/50 bg-[#c5a880]/10"
                                )}
                              >
                                {msg.text}
                              </div>

                              {/* Admin Actions Tooltip */}
                              <div className={cn(
                                "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
                                isMine ? "-left-12" : "-right-12"
                              )}>
                                {currentUser?.role === 'MESTRE' && (
                                  <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 text-rose-500 hover:scale-110">
                                    <Trash size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isMine && isLastInGroup && (
                            <span className="text-[10px] text-white/30 mt-1 mr-1">Visto</span>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <MessageSquare size={40} className="text-white/20" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Iniciar conversa</h3>
                  <p className="text-sm text-white/50 max-w-[240px] mt-2">
                    Envie mensagens privadas para outros colaboradores da Sol & Mar.
                  </p>
                  <button className="mt-6 px-6 py-2 bg-sky-500 rounded-lg text-sm font-bold text-white shadow-lg active:scale-95 transition-transform">
                    Enviar mensagem
                  </button>
                </div>
              )}
            </div>

            {/* Footer Input IG Style */}
            <div className="p-3 bg-black">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-[#262626] rounded-full px-4 py-2"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                  <Camera size={18} className="text-white fill-current" />
                </div>
                
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mensagem..." 
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />

                {newMessage.trim() ? (
                  <button 
                    type="submit"
                    className="text-sky-500 font-bold text-sm px-2 cursor-pointer active:scale-95"
                  >
                    Enviar
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Mic size={22} className="text-white" />
                    <ImageIcon size={22} className="text-white" />
                    <Smile size={22} className="text-white" />
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


