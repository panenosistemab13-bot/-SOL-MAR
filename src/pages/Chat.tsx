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
  Flag,
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

export function Chat({ 
  onBack, 
  onActiveChatChange,
  activeChat: propActiveChat,
  onSelectActiveChat
}: { 
  onBack?: () => void; 
  onActiveChatChange?: (hasActiveChat: boolean) => void;
  activeChat?: string | null;
  onSelectActiveChat?: (chatId: string | null) => void;
}) {
  const { currentUser, isReadOnly, users, theme, groupUnreadCounts } = useInventory();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [internalActiveChat, setInternalActiveChat] = useState<string | null>(null);

  const activeChat = propActiveChat !== undefined ? propActiveChat : internalActiveChat;
  const setActiveChat = (id: string | null) => {
    if (onSelectActiveChat) {
      onSelectActiveChat(id);
    } else {
      setInternalActiveChat(id);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [showViewDetails, setShowViewDetails] = useState<string | null>(null);

  useEffect(() => {
    onActiveChatChange?.(!!activeChat);
  }, [activeChat, onActiveChatChange]);
  
  // Administrative states
  const [urgency, setUrgency] = useState<'comum' | 'urgente' | 'crítico'>('comum');
  const [pinnedOnSend, setPinnedOnSend] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMestre = currentUser?.role === 'MESTRE' || currentUser?.username?.toLowerCase() === 'mestre';
  const isAdmOrMestre = isMestre || currentUser?.role === 'ADM';
  const isWriter = isAdmOrMestre || currentUser?.role === 'LIDER';

  // Chat Definitions - Unified Groups
  const dms = [
    { 
      id: 'mural', 
      name: 'Mural de Avisos 📢', 
      avatar: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=100&q=80', 
      lastMsg: 'Avisos oficiais da gerência', 
      time: 'Grupo',
      isGroup: true,
      unreadCount: groupUnreadCounts?.['mural'] || 0,
      unread: (groupUnreadCounts?.['mural'] || 0) > 0,
      restricted: true // Only Admins can send
    },
    { 
      id: 'resenha', 
      name: 'Resenha 🏖️', 
      avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80', 
      lastMsg: 'Espaço para diversão!', 
      time: 'Grupo',
      isGroup: true,
      unreadCount: groupUnreadCounts?.['resenha'] || 0,
      unread: (groupUnreadCounts?.['resenha'] || 0) > 0,
      restricted: false
    },
  ];

  const filteredDMs = dms.filter(dm => 
    dm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sync Messages based on active chat
  useEffect(() => {
    if (!activeChat) return;
    
    const path = `chat/groups/${activeChat}/messages`;
    const chatRef = ref(rtdb, path);
    setIsLoading(true);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages: ChatMessage[] = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));

        loadedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeChat]);

  // View Tracking
  useEffect(() => {
    if (!currentUser || messages.length === 0 || !activeChat) return;

    messages.forEach((msg) => {
      if (!msg.views || !msg.views[currentUser.username]) {
        const viewRef = ref(rtdb, `chat/groups/${activeChat}/messages/${msg.id}/views/${currentUser.username}`);
        set(viewRef, {
          name: currentUser.name,
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Error logging view:", err));
      }
    });
  }, [messages, currentUser, activeChat]);

  // Audio Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setMediaBlob(audioBlob);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          sendMediaMessage('audio', reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        sendMediaMessage('image', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMediaMessage = async (type: 'image' | 'audio', content: string) => {
    if (!activeChat || !currentUser || isReadOnly) return;
    
    const chatRef = ref(rtdb, `chat/groups/${activeChat}/messages`);
    const newMsgRef = push(chatRef);

    const messagePayload: any = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      text: type === 'image' ? '[Foto]' : '[Áudio]',
      type,
      mediaUrl: content,
      timestamp: new Date().toISOString(),
      views: {
        [currentUser.username]: {
          name: currentUser.name,
          timestamp: new Date().toISOString()
        }
      }
    };

    set(newMsgRef, messagePayload).catch(err => console.error("Error sending media:", err));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || isReadOnly || !activeChat) return;

    // Check Mural restriction
    if (activeChat === 'mural' && !isAdmOrMestre) {
      alert("Apenas Administradores podem enviar mensagens no Mural.");
      return;
    }

    const chatRef = ref(rtdb, `chat/groups/${activeChat}/messages`);
    const newMsgRef = push(chatRef);

    const messagePayload: any = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      text: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      views: {
        [currentUser.username]: {
          name: currentUser.name,
          timestamp: new Date().toISOString()
        }
      }
    };

    if (activeChat === 'mural' && !isMobile) {
      if (urgency !== 'comum') messagePayload.urgency = urgency;
      if (pinnedOnSend) messagePayload.pinned = true;
    }

    set(newMsgRef, messagePayload)
      .then(() => {
        setNewMessage('');
        setUrgency('comum');
        setPinnedOnSend(false);
      })
      .catch((err) => console.error("Error sending message:", err));
  };

  const canSendMessages = activeChat === 'resenha' || (activeChat === 'mural' && isAdmOrMestre);

  const handleDeleteMessage = (msgId: string) => {
    if (isReadOnly || !activeChat) return;
    const canDelete = currentUser?.role === 'MESTRE' || currentUser?.id === messages.find(m => m.id === msgId)?.senderId;
    if (!canDelete) return;

    if (window.confirm("Deseja realmente remover esta mensagem?")) {
      const msgRef = ref(rtdb, `chat/groups/${activeChat}/messages/${msgId}`);
      set(msgRef, null).catch(err => console.error("Erro ao remover mensagem:", err));
    }
  };

  const handleTogglePin = (msgId: string, currentPinned: boolean) => {
    if (isReadOnly || !activeChat) return;
    if (!isWriter) return;

    const msgRef = ref(rtdb, `chat/groups/${activeChat}/messages/${msgId}`);
    update(msgRef, {
      pinned: !currentPinned
    }).catch(err => console.error("Erro ao fixar/desafixar comunicado:", err));
  };

  const handleClearChatMessages = (chatId?: string) => {
    if (isReadOnly || !isMestre) return;
    const target = chatId || activeChat;
    if (!target) return;

    const chatName = dms.find(d => d.id === target)?.name || target;
    if (window.confirm(`[MESTRE] Deseja realmente apagar TODAS as mensagens de "${chatName}"? Esta ação não pode ser desfeita.`)) {
      const chatRef = ref(rtdb, `chat/groups/${target}/messages`);
      set(chatRef, null)
        .then(() => setMessages([]))
        .catch(err => console.error("Erro ao apagar mensagens:", err));
    }
  };

  const handleClearAllEntireSystemChats = () => {
    if (isReadOnly || !isMestre) return;

    if (window.confirm("[MESTRE] Deseja realmente apagar TODAS as conversas de TODOS os chats do aplicativo? Esta ação é irreversível e apagará o histórico completo.")) {
      const allChatsRef = ref(rtdb, `chat/groups`);
      set(allChatsRef, null)
        .then(() => {
          setMessages([]);
          alert("Todas as conversas foram apagadas com sucesso!");
        })
        .catch(err => console.error("Erro ao apagar todas as conversas:", err));
    }
  };

  return (
    <div className={cn(
      "max-w-4xl mx-auto w-full flex flex-col overflow-hidden relative transition-colors duration-300",
      theme === 'light' ? "bg-white text-black shadow-2xl border-slate-200" : "bg-black md:bg-[#130d08]/75 text-white md:border md:border-[#ebdcb9]/15 shadow-black/50",
      isMobile ? "fixed inset-0 z-[60] h-screen" : "min-h-[calc(100vh-200px)] md:h-[calc(100vh-200px)] md:backdrop-blur-2xl md:rounded-[2rem]"
    )}>
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
            <div className={cn(
              "flex items-center justify-between p-4 px-6 pt-6 transition-colors duration-300 lg:hidden",
              theme === 'light' ? "bg-slate-50/50" : "bg-black/20"
            )}>
              <div className="flex items-center gap-2">
                {isMobile && onBack && (
                  <button 
                    onClick={onBack}
                    className={cn(
                      "p-2 -ml-2 transition-colors",
                      theme === 'light' ? "text-slate-600 hover:text-black" : "text-white/70 hover:text-white"
                    )}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                <h1 className={cn(
                  "text-xl font-bold tracking-tight",
                  theme === 'light' ? "text-black" : "text-white"
                )}>{currentUser?.username || 'mensagens'}</h1>
                <ChevronLeft className={cn("-rotate-90", theme === 'light' ? "text-slate-400" : "text-white/60")} size={16} />
              </div>
              <div className="flex items-center gap-3 lg:hidden">
                {isMestre && (
                  <button
                    onClick={handleClearAllEntireSystemChats}
                    title="Apagar todas as conversas do sistema"
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 px-2.5 py-1 rounded-full transition-all cursor-pointer"
                  >
                    <Trash size={14} />
                    <span>Apagar tudo</span>
                  </button>
                )}
                <Video size={24} className={theme === 'light' ? "text-black" : "text-white"} />
                <Edit3 size={22} className={theme === 'light' ? "text-black" : "text-white"} />
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-2 lg:hidden">
              <div className={cn(
                "relative flex items-center rounded-xl px-3 py-2 transition-colors duration-300",
                theme === 'light' ? "bg-slate-100 text-slate-500" : "bg-white/10 text-white/50"
              )}>
                <Search size={16} className="mr-2" />
                <input 
                  type="text" 
                  placeholder="Pesquisar" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "bg-transparent w-full text-sm outline-none font-medium",
                    theme === 'light' ? "text-black placeholder:text-slate-400" : "text-white placeholder:text-white/40"
                  )}
                />
              </div>
            </div>

            {/* Notes Row (IG style) */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-6 py-4 lg:hidden">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn(
                  "w-16 h-16 rounded-full border-2 p-0.5 relative",
                  theme === 'light' ? "border-slate-200" : "border-white/20"
                )}>
                  <img src={currentUser?.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  <div className={cn(
                    "absolute bottom-0 right-0 bg-sky-500 rounded-full p-0.5 border-2",
                    theme === 'light' ? "border-white" : "border-black"
                  )}>
                    <Plus size={10} className="text-white" />
                  </div>
                </div>
                <span className={cn(
                  "text-[10px]",
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>Sua nota</span>
              </div>
              {users?.filter(u => 
                u.id !== currentUser?.id && 
                u.role !== 'MESTRE' && 
                u.username?.toLowerCase() !== 'mestre' && 
                u.name?.toLowerCase() !== 'mestre' &&
                u.username?.toLowerCase() !== 'jeff'
              ).slice(0, 5).map(user => (
                <div key={user.id} className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={cn(
                    "w-16 h-16 rounded-full border-2 p-0.5",
                    theme === 'light' ? "border-slate-100" : "border-white/10"
                  )}>
                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className={cn(
                    "text-[10px]",
                    theme === 'light' ? "text-slate-500" : "text-white/60"
                  )}>{user.username}</span>
                </div>
              ))}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 md:pb-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className={cn(
                  "text-sm font-bold",
                  theme === 'light' ? "text-black" : "text-white"
                )}>Mensagens</h2>
                {isMestre && (
                  <button 
                    onClick={handleClearAllEntireSystemChats}
                    title="Apagar todas as conversas do aplicativo"
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash size={13} />
                    <span>Apagar todas as conversas</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-1">
                {filteredDMs.map(dm => (
                  <button 
                    key={dm.id}
                    onClick={() => setActiveChat(dm.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl transition-colors active:scale-[0.98] cursor-pointer group",
                      theme === 'light' ? "hover:bg-slate-100" : "hover:bg-white/5"
                    )}
                  >
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex shrink-0">
                      <div className={cn(
                        "w-full h-full rounded-full p-0.5",
                        theme === 'light' ? "bg-white" : "bg-black"
                      )}>
                        <img src={dm.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={cn(
                        "text-[13px] font-bold truncate",
                        theme === 'light' ? "text-black" : "text-white"
                      )}>{dm.name}</p>
                      <div className="flex items-center gap-1">
                        <p className={cn(
                          "text-[12px] truncate",
                          dm.unread 
                            ? (theme === 'light' ? "text-black font-bold" : "text-white font-bold") 
                            : (theme === 'light' ? "text-slate-500 font-normal" : "text-white/50 font-normal")
                        )}>
                          {dm.lastMsg}
                        </p>
                        <span className={cn(
                          "text-[10px] shrink-0",
                          theme === 'light' ? "text-slate-400" : "text-white/30"
                        )}>• {dm.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {dm.unreadCount > 0 && (
                        <div className="min-w-[20px] h-5 px-1.5 bg-rose-500 text-white font-black text-[11px] rounded-full flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse">
                          {dm.unreadCount > 99 ? '99+' : dm.unreadCount}
                        </div>
                      )}
                      <Camera size={20} className={cn(
                        "transition-colors",
                        theme === 'light' 
                          ? "text-slate-400 group-hover:text-black" 
                          : "text-white/40 group-hover:text-white"
                      )} />
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
            className={cn(
              "flex-1 flex flex-col overflow-hidden transition-colors duration-300",
              theme === 'light' ? "bg-white" : "bg-black"
            )}
          >
            {/* Header Chat (IG Mobile Style) */}
            <div className={cn(
              "chat-header flex items-center justify-between px-4 py-3 border-b z-20 transition-colors duration-300",
              theme === 'dark' ? "bg-black border-white/10 text-white" : "bg-white border-slate-200 text-[#262626]"
            )}>
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => {
                    if (window.history.state && window.history.state.activeChat) {
                      window.history.back();
                    } else {
                      setActiveChat(null);
                    }
                  }}
                  className="p-1 -ml-1 active:scale-90 transition-transform cursor-pointer shrink-0"
                >
                  <ChevronLeft size={22} className={theme === 'dark' ? "text-white" : "text-[#262626]"} />
                </button>
                <img 
                  src={dms.find(d => d.id === activeChat)?.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" 
                />
                <span className="font-semibold text-[15px] tracking-tight truncate text-[#262626] dark:text-white">
                  {dms.find(d => d.id === activeChat)?.name.replace('📢', '').replace('🏖️', '').trim()}
                </span>
              </div>

              <div className="flex items-center gap-3.5 shrink-0 text-[#262626] dark:text-white">
                {isMestre && (
                  <button 
                    onClick={() => handleClearChatMessages()}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-full transition-all active:scale-90 cursor-pointer"
                    title="Apagar todas as mensagens desta conversa"
                  >
                    <Trash size={14} />
                  </button>
                )}
                <Video size={20} className="cursor-pointer active:scale-90 transition-transform" />
                <Flag size={18} className="cursor-pointer active:scale-90 transition-transform" />
                <Info size={20} className="cursor-pointer active:scale-90 transition-transform" />
              </div>
            </div>
            {/* Chat Body */}
            <div className={cn(
              "flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 transition-colors duration-300",
              theme === 'light' ? "bg-white" : "bg-black"
            )}>
              <div className="flex flex-col gap-4 pb-4">
                {messages.map((msg, index) => {
                  const isMine = currentUser?.id === msg.senderId;
                  const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                  
                  // DESKTOP MURAL STYLE
                  if (!isMobile && activeChat === 'mural') {
                    const viewCount = msg.views ? Object.keys(msg.views).length : 0;
                    return (
                      <div key={msg.id} className="w-full max-w-5xl mx-auto">
                        <div className={cn(
                          "rounded-[2rem] p-8 relative group border transition-all duration-300",
                          theme === 'light' 
                            ? "bg-slate-50/50 border-slate-100 shadow-xl" 
                            : "bg-[#1f1610]/40 border-white/5 shadow-2xl"
                        )}>
                          {msg.pinned && (
                            <div className={cn(
                              "absolute top-6 right-8 flex items-center gap-2 px-3 py-1 rounded-full border",
                              theme === 'light'
                                ? "bg-amber-100/50 text-amber-700 border-amber-200"
                                : "bg-[#ebdcb9]/10 text-[#ebdcb9] border-[#ebdcb9]/20"
                            )}>
                              <Pin size={12} className="rotate-45" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Fixado</span>
                            </div>
                          )}

                          <div className="flex items-start gap-4 mb-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl overflow-hidden border shrink-0",
                              theme === 'light' ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
                            )}>
                              <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    "text-sm font-bold",
                                    theme === 'light' ? "text-black" : "text-white"
                                  )}>{msg.senderName.toLowerCase()}</span>
                                  <span className={cn(
                                    "text-[10px] font-medium",
                                    theme === 'light' ? "text-slate-500" : "text-white/30"
                                  )}>
                                    {new Date(msg.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {msg.urgency && msg.urgency !== 'comum' && (
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                                      msg.urgency === 'crítico' ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                    )}>
                                      {msg.urgency}
                                    </span>
                                  )}
                                </div>
                                
                                <button 
                                  onClick={() => setShowViewDetails(showViewDetails === msg.id ? null : msg.id)}
                                  className={cn(
                                    "p-1 transition-colors",
                                    theme === 'light' ? "text-slate-400 hover:text-black" : "text-white/20 hover:text-white"
                                  )}
                                >
                                  <MoreVertical size={16} />
                                </button>
                              </div>
                              
                              {showViewDetails === msg.id && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
                                >
                                  <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <CheckCheck size={12} />
                                    Histórico de Visualização
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {msg.views && Object.values(msg.views).map((v: any, idx) => (
                                      <div key={idx} className="flex flex-col bg-emerald-500/5 border border-emerald-500/10 px-2 py-1.5 rounded-lg">
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase truncate">{v.name}</span>
                                        <span className="text-[8px] text-emerald-500/60">
                                          {new Date(v.timestamp).toLocaleDateString()} às {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}

                              <div className={cn(
                                "text-[15px] leading-relaxed whitespace-pre-wrap",
                                theme === 'light' ? "text-slate-800" : "text-white/90"
                              )}>
                                {msg.type === 'image' && (
                                  <div className={cn(
                                    "mt-3 rounded-2xl overflow-hidden border max-w-2xl",
                                    theme === 'light' ? "border-slate-100 shadow-sm" : "border-white/10"
                                  )}>
                                    <img src={msg.mediaUrl} alt="Imagem" className="w-full h-auto" />
                                  </div>
                                )}
                                {msg.type === 'audio' && (
                                  <div className={cn(
                                    "mt-3 flex items-center gap-4 p-4 rounded-2xl border max-w-md",
                                    theme === 'light' ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
                                  )}>
                                    <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                      theme === 'light' ? "bg-amber-100" : "bg-[#ebdcb9]/20"
                                    )}>
                                      <Mic size={18} className={theme === 'light' ? "text-amber-700" : "text-[#ebdcb9]"} />
                                    </div>
                                    <audio controls className={cn("h-10 flex-1 opacity-80", theme === 'dark' ? "filter invert" : "")}>
                                      <source src={msg.mediaUrl} type="audio/webm" />
                                    </audio>
                                  </div>
                                )}
                                {msg.text && msg.type !== 'image' && msg.type !== 'audio' && msg.text}
                                {msg.text && (msg.type === 'image' || msg.type === 'audio') && msg.text !== '[Foto]' && msg.text !== '[Áudio]' && (
                                  <p className="mt-3">{msg.text}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={cn(
                            "pt-6 mt-6 border-t space-y-4",
                            theme === 'light' ? "border-slate-100" : "border-white/5"
                          )}>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                              <CheckCheck size={14} />
                              VISUALIZADO ({viewCount})
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {msg.views && Object.values(msg.views).map((v: any, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[10px] font-bold text-emerald-500 uppercase">{v.name.split(' ')[0]}</span>
                                  <span className="text-[9px] text-emerald-500/50">
                                    ({new Date(v.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {isAdmOrMestre && (
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className={cn(
                                "absolute bottom-6 right-8 p-2 transition-colors opacity-0 group-hover:opacity-100",
                                theme === 'light' ? "text-slate-300 hover:text-rose-500" : "text-white/10 hover:text-rose-500"
                              )}
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // MOBILE / INSTAGRAM STYLE
                  const isSenderMestre = msg.senderName?.toLowerCase() === 'mestre' 
                    || users.find(u => u.id === msg.senderId)?.role === 'MESTRE' 
                    || users.find(u => u.id === msg.senderId)?.username?.toLowerCase() === 'mestre';

                  const msgDate = new Date(msg.timestamp);
                  const dateStr = msgDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const timeStr = msgDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  const senderUser = users.find(u => u.id === msg.senderId);
                  const avatarUrl = msg.senderAvatar || senderUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

                  return (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex flex-col max-w-[85%] mb-3",
                        isMine ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      {!isMine && (
                        <span className={cn(
                          "text-[10px] mb-1 ml-1 font-bold transition-colors duration-500",
                          theme === 'dark' ? "text-white/60" : "text-black/60"
                        )}>{msg.senderName}</span>
                      )}
                      
                      <div className="flex items-end gap-1.5 w-full">
                        {/* Avatar for incoming messages (except Mestre) */}
                        {!isMine && !isSenderMestre && (
                          <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden bg-white/10 mb-0.5 border border-white/10 shadow-sm">
                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <div className="relative group flex-1 min-w-0">
                          <div 
                            className={cn(
                              "px-3.5 py-2 rounded-[20px] text-[14px] leading-tight whitespace-pre-wrap break-words inline-block min-w-[30px]",
                              isMine 
                                ? (theme === 'dark' ? "bg-[#3797f0] text-white rounded-br-[4px]" : "bg-[#3797f0] text-white rounded-br-[4px]")
                                : (theme === 'dark' ? "bg-[#262626] text-white rounded-bl-[4px]" : "bg-[#efefef] text-black rounded-bl-[4px]")
                            )}
                          >
                            {/* Media content */}
                            {msg.type === 'image' && (
                              <div className={cn(
                                "mb-1 rounded-lg overflow-hidden border",
                                theme === 'dark' ? "border-white/10" : "border-black/10"
                              )}>
                                <img src={msg.mediaUrl} alt="Imagem" className="max-w-full h-auto" />
                              </div>
                            )}
                            {msg.type === 'audio' && (
                              <div className="flex items-center gap-3 py-1">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                  theme === 'dark' ? "bg-white/10" : "bg-black/10"
                                )}>
                                  <Mic size={14} className={cn(theme === 'dark' ? "text-white" : "text-[#3d2723]")} />
                                </div>
                                <audio controls className={cn("h-8 max-w-[180px]", theme === 'dark' ? "filter invert" : "")}>
                                  <source src={msg.mediaUrl} type="audio/webm" />
                                </audio>
                              </div>
                            )}
                            {msg.text && msg.type !== 'image' && msg.type !== 'audio' && msg.text}
                            {msg.text && (msg.type === 'image' || msg.type === 'audio') && msg.text !== '[Foto]' && msg.text !== '[Áudio]' && (
                              <p className="mt-1">{msg.text}</p>
                            )}
                          </div>

                          {/* Message Actions - Visualization Tracking */}
                          <div className={cn(
                            "absolute bottom-0 flex items-center gap-1",
                            isMine ? "-left-8" : "-right-8"
                          )}>
                            <button 
                              onClick={() => setShowViewDetails(showViewDetails === msg.id ? null : msg.id)}
                              className="p-1 text-white/20 hover:text-white transition-colors"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>

                          {/* Visualization Details Modal/Overlay */}
                          {showViewDetails === msg.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute bottom-full mb-2 z-50 bg-[#1f1610] border border-white/10 rounded-xl p-3 shadow-2xl min-w-[180px] max-w-[240px]"
                            >
                              <h4 className="text-[10px] font-bold text-[#ebdcb9] uppercase tracking-widest mb-2 pb-1 border-b border-white/5">Visualizado por:</h4>
                              <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                                {msg.views && Object.values(msg.views).length > 0 ? (
                                  Object.values(msg.views).map((v: any, idx) => (
                                    <div key={idx} className="flex flex-col">
                                      <span className="text-[11px] font-medium text-white">{v.name}</span>
                                      <span className="text-[9px] text-white/40">
                                        {new Date(v.timestamp).toLocaleDateString()} às {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-white/30 italic">Ninguém viu ainda</span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Avatar for outgoing messages (except Mestre) */}
                        {isMine && !isSenderMestre && (
                          <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden bg-white/10 mb-0.5 border border-white/10 shadow-sm">
                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Date and Time below the message */}
                      <div className={cn(
                        "text-[9px] mt-1 font-medium tracking-tight opacity-60 flex items-center gap-1 px-1",
                        isMine ? "justify-end text-right" : "justify-start text-left",
                        theme === 'dark' ? "text-slate-400" : "text-slate-600"
                      )}>
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Footer Input */}
            <footer className={cn(
              "chat-input-container p-3 transition-colors duration-300",
              theme === 'dark' ? "bg-black border-t border-white/10" : "bg-white border-t border-slate-100"
            )}>
              {canSendMessages ? (
                <div className="space-y-2">
                  {!isMobile && activeChat === 'mural' && (
                    <div className={cn(
                      "flex items-center gap-4 px-4 py-2 border-b transition-colors",
                      theme === 'light' ? "border-slate-100" : "border-white/5"
                    )}>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          theme === 'light' ? "text-slate-400" : "text-white/40"
                        )}>Urgência:</span>
                        <select 
                          value={urgency}
                          onChange={(e: any) => setUrgency(e.target.value)}
                          className={cn(
                            "bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none border-none cursor-pointer transition-colors",
                            theme === 'light' ? "text-amber-600 hover:text-black" : "text-[#ebdcb9] hover:text-white"
                          )}
                        >
                          <option value="comum">Comum</option>
                          <option value="urgente" className="text-amber-500">Urgente</option>
                          <option value="crítico" className="text-rose-500">Crítico</option>
                        </select>
                      </div>

                      <div className={cn(
                        "w-px h-4",
                        theme === 'light' ? "bg-slate-200" : "bg-white/10"
                      )} />

                      <button 
                        onClick={() => setPinnedOnSend(!pinnedOnSend)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-lg transition-all",
                          pinnedOnSend 
                            ? (theme === 'light' ? "bg-amber-100 text-amber-700" : "bg-[#ebdcb9]/20 text-[#ebdcb9]") 
                            : (theme === 'light' ? "text-slate-400 hover:text-black" : "text-white/40 hover:text-white")
                        )}
                      >
                        <Pin size={14} className={cn("transition-transform", pinnedOnSend && "rotate-45")} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Fixar no Topo</span>
                      </button>
                    </div>
                  )}

                  {isRecording && (
                    <div className="flex items-center justify-between px-4 py-2 bg-rose-500/20 border border-rose-500/30 rounded-2xl mb-2 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-xs font-bold text-rose-500">Gravando: {recordingTime}s</span>
                      </div>
                      <button 
                        onClick={stopRecording}
                        className="text-xs font-bold text-white bg-rose-500 px-3 py-1 rounded-lg"
                      >
                        Parar e Enviar
                      </button>
                    </div>
                  )}

                  <form 
                    onSubmit={handleSendMessage}
                    className={cn(
                      "input-bar flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors duration-300",
                      theme === 'dark' ? "bg-[#262626]" : "bg-[#f5f5f5]"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                    />
                    
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cam-btn w-7 h-7 rounded-full bg-[#0084ff] flex items-center justify-center shrink-0 active:scale-90 transition-transform text-white shadow-sm"
                    >
                      <Camera size={14} />
                    </button>
                    
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={activeChat === 'mural' ? "Aviso importante..." : "Message..."} 
                      className={cn(
                        "flex-1 bg-transparent text-[14px] outline-none px-2 py-0.5 transition-colors duration-300",
                        theme === 'dark' ? "text-white placeholder:text-white/40" : "text-[#262626] placeholder:text-slate-400"
                      )}
                      disabled={isRecording}
                    />

                    <div className="input-actions flex items-center gap-3 pr-2 text-[#262626] dark:text-white">
                      {newMessage.trim() ? (
                        <button 
                          type="submit"
                          className="text-[#0084ff] font-bold text-[14px] px-1 cursor-pointer active:scale-95 transition-transform"
                        >
                          Enviar
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onMouseDown={startRecording}
                            onTouchStart={startRecording}
                            onMouseUp={stopRecording}
                            onTouchEnd={stopRecording}
                            className={cn(
                              "transition-all active:scale-90 cursor-pointer",
                              isRecording ? "text-rose-500 scale-125" : (theme === 'dark' ? "text-white/80 hover:text-white" : "text-[#262626] hover:text-black")
                            )}
                          >
                            <Mic size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                              "transition-all active:scale-90 cursor-pointer",
                              theme === 'dark' ? "text-white/80 hover:text-white" : "text-[#262626] hover:text-black"
                            )}
                          >
                            <ImageIcon size={18} />
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "transition-all active:scale-90 cursor-pointer",
                              theme === 'dark' ? "text-white/80 hover:text-white" : "text-[#262626] hover:text-black"
                            )}
                          >
                            <Smile size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <div className={cn(
                  "py-3 text-center text-xs font-bold uppercase tracking-widest",
                  theme === 'dark' ? "text-white/20" : "text-slate-300"
                )}>
                  Somente leitura neste grupo
                </div>
              )}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


