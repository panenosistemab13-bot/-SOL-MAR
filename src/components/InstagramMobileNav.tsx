import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Tag, 
  Scissors, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  AlertCircle,
  Send,
  Heart,
  CalendarCheck,
  Sparkles,
  Plus,
  X,
  Camera,
  Type,
  Trash2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InstagramMobileNavProps {
  currentTab: string;
  onSelect: (tab: string) => void;
}

export function InstagramMobileHeader({ currentTab, onSelect }: InstagramMobileNavProps) {
  const { lowStockItemsCount, unreadMessagesCount, currentUser, galleryPosts } = useInventory();

  const recentPostsCount = galleryPosts?.filter(p => p.userId !== currentUser?.id && new Date(p.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length || 0;
  
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#120c08]/95 border-b border-white/10 px-4 py-2.5 flex items-center justify-between backdrop-blur-xl shadow-lg">
      {/* Brand Logo in Instagram-style Serif */}
      <button 
        onClick={() => onSelect('menu')} 
        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px] flex items-center justify-center">
          <div className="w-full h-full bg-[#120c08] rounded-full flex items-center justify-center">
            <Sparkles size={13} className="text-[#ebdcb9]" />
          </div>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-serif italic font-extrabold text-lg text-white tracking-wider leading-none">
            Sol & Mar
          </span>
          <span className="text-[8px] text-[#c5a880] uppercase tracking-widest font-mono leading-none mt-0.5">
            Lu Confecções
          </span>
        </div>
      </button>

      {/* Top Right Action Icons (Notifications & Chat) */}
      <div className="flex items-center gap-3">
        {/* Critical Alerts Heart/Notification Icon */}
        <button
          onClick={() => onSelect('menu')}
          className="relative text-slate-300 hover:text-white p-1.5 rounded-full active:scale-90 transition-transform cursor-pointer"
          title="Notificações"
        >
          <Heart size={22} className={recentPostsCount > 0 ? "text-rose-400 fill-rose-500/20 animate-pulse" : ""} />
          {recentPostsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#120c08]" />
          )}
        </button>

        {/* Direct Messages Icon */}
        <button
          onClick={() => onSelect('chat')}
          className="relative text-slate-300 hover:text-white p-1.5 rounded-full active:scale-90 transition-transform cursor-pointer"
          title="Mural de Mensagens"
        >
          <Send size={21} className="rotate-[-20deg]" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-tr from-[#ec4899] to-[#dc2743] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-[#120c08]">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export function InstagramStoriesRow() {
  const { users, stories, currentUser, addStory, deleteStory } = useInventory();
  
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [newStoryType, setNewStoryType] = useState<'image' | 'text' | 'audio'>('text');
  const [newStoryContent, setNewStoryContent] = useState('');
  
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Group stories by user
  const storiesByUser = users.map(user => {
    return {
      user,
      userStories: stories.filter(s => s.userId === user.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    };
  }).filter(group => group.user.id === currentUser?.id || group.userStories.length > 0);

  // Move current user to the front
  storiesByUser.sort((a, b) => {
    if (a.user.id === currentUser?.id) return -1;
    if (b.user.id === currentUser?.id) return 1;
    return 0;
  });

  const handleAddStory = () => {
    if (!newStoryContent.trim()) return;
    addStory({
      userId: currentUser!.id,
      type: newStoryType,
      content: newStoryContent.trim()
    });
    setIsAddingStory(false);
    setNewStoryContent('');
  };

  const currentViewingGroup = storiesByUser.find(g => g.user.id === viewingUserId);

  useEffect(() => {
    if (viewingUserId && currentViewingGroup && currentViewingGroup.userStories.length > 0) {
      const currentStory = currentViewingGroup.userStories[activeStoryIndex];
      const duration = currentStory?.type === 'audio' ? 30000 : 5000;

      const timer = setTimeout(() => {
        if (activeStoryIndex < currentViewingGroup.userStories.length - 1) {
          setActiveStoryIndex(activeStoryIndex + 1);
        } else {
          // Go to next user
          const currentIndex = storiesByUser.findIndex(g => g.user.id === viewingUserId);
          if (currentIndex < storiesByUser.length - 1 && storiesByUser[currentIndex + 1].userStories.length > 0) {
            setViewingUserId(storiesByUser[currentIndex + 1].user.id);
            setActiveStoryIndex(0);
          } else {
            setViewingUserId(null);
          }
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [viewingUserId, activeStoryIndex, currentViewingGroup, storiesByUser]);

  const handleNextStory = () => {
    if (!currentViewingGroup) return;
    if (activeStoryIndex < currentViewingGroup.userStories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      const currentIndex = storiesByUser.findIndex(g => g.user.id === viewingUserId);
      if (currentIndex < storiesByUser.length - 1 && storiesByUser[currentIndex + 1].userStories.length > 0) {
        setViewingUserId(storiesByUser[currentIndex + 1].user.id);
        setActiveStoryIndex(0);
      } else {
        setViewingUserId(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (!currentViewingGroup) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      const currentIndex = storiesByUser.findIndex(g => g.user.id === viewingUserId);
      if (currentIndex > 0 && storiesByUser[currentIndex - 1].userStories.length > 0) {
        setViewingUserId(storiesByUser[currentIndex - 1].user.id);
        setActiveStoryIndex(storiesByUser[currentIndex - 1].userStories.length - 1);
      } else {
        setViewingUserId(null);
      }
    }
  };

  return (
    <>
      <div className="md:hidden w-full overflow-x-auto no-scrollbar scrollbar-none py-3 px-3 bg-[#120c08]/60 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4 w-max">
          {storiesByUser.map(({ user, userStories }) => {
            const isCurrentUser = user.id === currentUser?.id;
            const hasStories = userStories.length > 0;

            return (
              <button
                key={user.id}
                onClick={() => {
                  if (hasStories) {
                    setViewingUserId(user.id);
                    setActiveStoryIndex(0);
                  } else if (isCurrentUser) {
                    setIsAddingStory(true);
                  }
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform relative"
              >
                {/* Instagram Story Gradient Ring */}
                <div
                  className={cn(
                    "p-[2px] rounded-full transition-all duration-300 relative",
                    hasStories
                      ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] ring-2 ring-amber-400/40 shadow-lg"
                      : "bg-white/10"
                  )}
                >
                  <div className="p-[2px] bg-[#120c08] rounded-full relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-13 h-13 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {isCurrentUser && !hasStories && (
                  <div className="absolute bottom-4 right-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#120c08]">
                    <Plus size={12} className="text-white" />
                  </div>
                )}

                <span className="text-[10px] tracking-tight font-medium max-w-[62px] truncate text-stone-300">
                  {isCurrentUser ? 'Seu story' : user.username}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isAddingStory && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <button onClick={() => setIsAddingStory(false)} className="p-2 text-white/70 hover:text-white">
                <X size={24} />
              </button>
              <h3 className="text-white font-bold">Novo Story</h3>
              <button 
                onClick={handleAddStory}
                disabled={!newStoryContent.trim()}
                className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white font-bold text-sm disabled:opacity-50"
              >
                Postar
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
              <div className="flex bg-white/5 rounded-full p-1 gap-1">
                <button 
                  onClick={() => setNewStoryType('text')}
                  className={cn("px-4 py-2 rounded-full flex items-center gap-1.5 text-xs transition-all", newStoryType === 'text' ? 'bg-white/20 text-white' : 'text-white/50')}
                >
                  <Type size={14} /> Texto
                </button>
                <button 
                  onClick={() => setNewStoryType('image')}
                  className={cn("px-4 py-2 rounded-full flex items-center gap-1.5 text-xs transition-all", newStoryType === 'image' ? 'bg-white/20 text-white' : 'text-white/50')}
                >
                  <Camera size={14} /> Imagem
                </button>
                <button 
                  onClick={() => setNewStoryType('audio')}
                  className={cn("px-4 py-2 rounded-full flex items-center gap-1.5 text-xs transition-all", newStoryType === 'audio' ? 'bg-white/20 text-white' : 'text-white/50')}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg> Áudio
                </button>
              </div>

              {newStoryType === 'text' ? (
                <textarea
                  autoFocus
                  value={newStoryContent}
                  onChange={e => setNewStoryContent(e.target.value)}
                  placeholder="O que está acontecendo?"
                  className="w-full max-w-sm h-48 bg-transparent text-center text-3xl font-bold text-white placeholder:text-white/20 outline-none resize-none"
                />
              ) : newStoryType === 'image' ? (
                <div className="w-full max-w-sm space-y-4">
                  <div className="relative w-full">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewStoryContent(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center flex items-center justify-center gap-2">
                      <Camera size={18} />
                      <span>Selecionar da Galeria</span>
                    </div>
                  </div>
                  {newStoryContent && (
                    <img src={newStoryContent} alt="Preview" className="w-full aspect-[9/16] object-cover rounded-2xl border border-white/10" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
              ) : (
                <div className="w-full max-w-sm space-y-4 flex flex-col items-center">
                  <input
                    type="url"
                    value={newStoryContent}
                    onChange={e => setNewStoryContent(e.target.value)}
                    placeholder="Cole a URL do áudio (mp3/ogg)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none"
                  />
                  {newStoryContent && (
                    <div className="w-full p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl border border-white/10 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        </svg>
                      </div>
                      <audio controls src={newStoryContent} className="w-full h-10" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {viewingUserId && currentViewingGroup && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Progress Bars */}
            <div className="absolute top-0 inset-x-0 p-4 flex gap-1 z-20">
              {currentViewingGroup.userStories.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: idx < activeStoryIndex ? '100%' : '0%' }}
                    animate={{ width: idx === activeStoryIndex ? '100%' : idx < activeStoryIndex ? '100%' : '0%' }}
                    transition={{ duration: idx === activeStoryIndex ? (currentViewingGroup.userStories[idx].type === 'audio' ? 30 : 5) : 0, ease: 'linear' }}
                    className="h-full bg-white"
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-6 inset-x-0 p-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <img src={currentViewingGroup.user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                <span className="text-white font-bold text-sm shadow-sm">{currentViewingGroup.user.username}</span>
                <span className="text-white/60 text-xs">{new Date(currentViewingGroup.userStories[activeStoryIndex]?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                {currentViewingGroup.user.id === currentUser?.id && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStory(currentViewingGroup.userStories[activeStoryIndex].id);
                      if (currentViewingGroup.userStories.length === 1) {
                        setViewingUserId(null);
                      } else {
                        handleNextStory();
                      }
                    }}
                    className="p-2 text-white hover:bg-white/20 rounded-full"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => setViewingUserId(null)} className="p-2 text-white hover:bg-white/20 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Story Content */}
            <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
              {currentViewingGroup.userStories[activeStoryIndex]?.type === 'image' ? (
                <img 
                  src={currentViewingGroup.userStories[activeStoryIndex].content} 
                  alt="Story" 
                  className="w-full h-full object-cover"
                />
              ) : currentViewingGroup.userStories[activeStoryIndex]?.type === 'audio' ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600">
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-8 shadow-2xl backdrop-blur-xl border border-white/20 animate-pulse">
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </div>
                  <audio 
                    autoPlay 
                    src={currentViewingGroup.userStories[activeStoryIndex].content} 
                    className="w-full max-w-sm" 
                    controls 
                    controlsList="nodownload noplaybackrate"
                  />
                  <p className="text-white/60 text-sm mt-4 font-medium tracking-wide uppercase">Mensagem de Voz</p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600">
                  <p className="text-white text-3xl font-bold text-center leading-tight whitespace-pre-wrap break-words">
                    {currentViewingGroup.userStories[activeStoryIndex]?.content}
                  </p>
                </div>
              )}
              
              {/* Invisible Click Areas for Prev/Next */}
              <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={handlePrevStory} />
              <div className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={handleNextStory} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function InstagramMobileBottomNav({ currentTab, onSelect }: InstagramMobileNavProps) {
  const { lowStockItemsCount, unreadMessagesCount, currentUser } = useInventory();
  const isFuncionarioB = currentUser?.role === 'FUNCIONARIO_B';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#120c08]/95 border-t border-white/10 px-2 py-1.5 flex items-center justify-around backdrop-blur-2xl shadow-2xl">
      {/* 1. Início */}
      <button
        onClick={() => onSelect('menu')}
        className={cn(
          "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer active:scale-90",
          currentTab === 'menu' ? "text-[#ebdcb9]" : "text-stone-400 hover:text-white"
        )}
      >
        <Home size={22} strokeWidth={currentTab === 'menu' ? 2.5 : 1.8} />
        <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Início</span>
      </button>

      {/* 2. Publi (+) */}
      <button
        onClick={() => onSelect('publi')}
        className={cn(
          "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer active:scale-90",
          currentTab === 'publi' ? "text-[#ebdcb9]" : "text-stone-400 hover:text-white"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
          currentTab === 'publi' ? "border-[#ebdcb9] bg-[#ebdcb9]/20 text-[#ebdcb9]" : "border-stone-500 text-stone-400"
        )}>
          <Plus size={16} strokeWidth={2.5} />
        </div>
        <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Publi</span>
      </button>

      {/* 3. Biquínis */}
      <button
        onClick={() => onSelect('bikinis')}
        className={cn(
          "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer active:scale-90",
          currentTab === 'bikinis' ? "text-[#ebdcb9]" : "text-stone-400 hover:text-white"
        )}
      >
        <Tag size={22} strokeWidth={currentTab === 'bikinis' ? 2.5 : 1.8} />
        <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Biquínis</span>
        {lowStockItemsCount > 0 && (
          <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#120c08]" />
        )}
      </button>

      {/* 4. Insumos */}
      <button
        onClick={() => onSelect('threads')}
        className={cn(
          "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer active:scale-90",
          currentTab === 'threads' ? "text-[#ebdcb9]" : "text-stone-400 hover:text-white"
        )}
      >
        <Scissors size={22} strokeWidth={currentTab === 'threads' ? 2.5 : 1.8} />
        <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Insumos</span>
      </button>

      {/* 5. Chat */}
      <button
        onClick={() => onSelect('chat')}
        className={cn(
          "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer active:scale-90",
          currentTab === 'chat' ? "text-[#ebdcb9]" : "text-stone-400 hover:text-white"
        )}
      >
        <MessageSquare size={22} strokeWidth={currentTab === 'chat' ? 2.5 : 1.8} />
        <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Chat</span>
        {unreadMessagesCount > 0 && (
          <span className="absolute top-0.5 right-2 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {unreadMessagesCount}
          </span>
        )}
      </button>

      {/* 6. Perfil */}
      <button
        onClick={() => onSelect('profile')}
        className={cn(
          "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer active:scale-90",
          currentTab === 'profile' ? "text-[#ebdcb9]" : "text-stone-400 hover:text-white"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-full overflow-hidden border transition-all p-[1px]",
          currentTab === 'profile' ? "border-[#ebdcb9] ring-2 ring-[#ebdcb9]/30" : "border-stone-500"
        )}>
          <img 
            src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
            alt="Perfil" 
            className="w-full h-full object-cover rounded-full" 
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Perfil</span>
      </button>
    </nav>
  );
}
