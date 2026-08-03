import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Home, 
  Tag, 
  Scissors, 
  ShoppingCart, 
  MessageSquare, 
  MessageCircle,
  Settings, 
  ArrowLeft,
  Bookmark,
  AlertCircle,
  Send,
  Heart,
  CalendarCheck,
  Sparkles,
  Plus,
  X,
  Camera,
  Type,
  Trash2,
  Mic,
  Square,
  PlusSquare,
  ChevronLeft
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InstagramMobileNavProps {
  currentTab: string;
  onSelect: (tab: string) => void;
  viewingProfileUserId?: string | null;
  onSelectProfile?: (userId: string | null) => void;
}

export function UserProfileGalleryModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { users, galleryPosts, currentUser, theme } = useInventory();
  const user = users.find(u => u.id === userId);
  const userPosts = galleryPosts.filter(p => p.userId === userId);

  if (!user) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col overflow-y-auto transition-colors duration-500",
      theme === 'dark' ? "bg-black/90 backdrop-blur-md" : "bg-white"
    )}>
      <div className={cn(
        "flex items-center justify-between p-4 border-b transition-colors duration-500",
        theme === 'dark' ? "border-white/10 bg-[#120c08]" : "border-black/10 bg-white"
      )}>
        <h3 className={cn(
          "font-serif font-bold text-lg transition-colors duration-500",
          theme === 'dark' ? "text-white" : "text-[#3d2723]"
        )}>Perfil de {user.name || user.username}</h3>
        <button onClick={onClose} className={cn(
          "p-2 transition-colors duration-500",
          theme === 'dark' ? "text-white/70 hover:text-white" : "text-[#3d2723]/70 hover:text-[#3d2723]"
        )}>
          <X size={22} />
        </button>
      </div>

      <div className="p-4 flex flex-col items-center gap-4">
        <img 
          src={user.avatarUrl} 
          alt={user.name} 
          className={cn(
            "w-24 h-24 rounded-full object-cover border-2 shadow-lg transition-colors duration-500",
            theme === 'dark' ? "border-[#ebdcb9] bg-black" : "border-black/10 bg-white"
          )} 
        />
        <div className="text-center">
          <h2 className={cn(
            "text-xl font-bold transition-colors duration-500",
            theme === 'dark' ? "text-white" : "text-[#3d2723]"
          )}>{user.name}</h2>
          <p className="text-xs text-[#ebdcb9] uppercase font-mono mt-0.5">@{user.username}</p>
          <p className={cn(
            "text-xs mt-2 transition-colors duration-500",
            theme === 'dark' ? "text-white/60" : "text-[#3d2723]/60"
          )}>{userPosts.length} publicações</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 p-0 mt-4 pb-20">
        {userPosts.length === 0 ? (
          <div className={cn(
            "text-center py-12 text-sm transition-colors duration-500",
            theme === 'dark' ? "text-white/50" : "text-[#3d2723]/50"
          )}>Nenhuma publicação ainda.</div>
        ) : (
          userPosts.map(post => {
            const postLikes = post.likes || [];
            const postComments = post.comments || [];
            
            return (
              <div key={post.id} className={cn(
                "w-full flex flex-col transition-colors duration-500",
                theme === 'dark' ? "bg-black/20" : "bg-black/5"
              )}>
                {/* Header */}
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px]">
                    <img 
                      src={user.avatarUrl} 
                      alt="" 
                      className={cn(
                        "w-full h-full rounded-full object-cover border transition-colors duration-500",
                        theme === 'dark' ? "border-black bg-black" : "border-white bg-white"
                      )} 
                    />
                  </div>
                  <span className={cn(
                    "font-bold text-sm transition-colors duration-500",
                    theme === 'dark' ? "text-white" : "text-[#3d2723]"
                  )}>{user.username}</span>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div className={cn(
                    "w-full aspect-square relative",
                    theme === 'dark' ? "bg-white/5" : "bg-black/5"
                  )}>
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <Heart 
                        size={26} 
                        className={cn(
                          "transition-colors",
                          postLikes.includes(currentUser?.id || '') ? "text-red-500 fill-red-500" : (theme === 'dark' ? "text-white" : "text-black")
                        )} 
                      />
                      <MessageCircle size={26} className={cn(theme === 'dark' ? "text-white" : "text-black")} />
                      <Send size={24} className={cn("-rotate-12", theme === 'dark' ? "text-white" : "text-black")} />
                    </div>
                    <Bookmark size={26} className={cn(theme === 'dark' ? "text-white" : "text-black")} />
                  </div>

                  {/* Likes Count */}
                  <div className="mb-2">
                    <p className={cn(
                      "text-sm font-bold transition-colors duration-500",
                      theme === 'dark' ? "text-white" : "text-[#3d2723]"
                    )}>
                      {postLikes.length} {postLikes.length === 1 ? 'curtida' : 'curtidas'}
                    </p>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p className={cn(
                      "text-sm leading-relaxed mb-2 transition-colors duration-500",
                      theme === 'dark' ? "text-white" : "text-[#3d2723]"
                    )}>
                      <span className="font-bold mr-2">{user.username}</span>
                      {post.caption}
                    </p>
                  )}

                  {/* Date */}
                  <p className={cn(
                    "text-[10px] uppercase font-bold mb-4 transition-colors duration-500",
                    theme === 'dark' ? "text-white/40" : "text-[#3d2723]/40"
                  )}>
                    {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>

                  {/* Comments Section */}
                  {postComments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {postComments.map((comment, idx) => (
                        <div key={idx} className={cn(
                          "rounded-2xl p-4 border transition-colors duration-500",
                          theme === 'dark' ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
                        )}>
                          <div className="flex items-start gap-3">
                            <p className={cn(
                              "text-sm leading-relaxed transition-colors duration-500",
                              theme === 'dark' ? "text-white" : "text-[#3d2723]"
                            )}>
                              <span className="font-black mr-2 text-[#ebdcb9]">{comment.userName}</span>
                              <span className={cn(
                                "font-medium transition-colors duration-500",
                                theme === 'dark' ? "text-white/90" : "text-[#3d2723]/90"
                              )}>{comment.text}</span>
                            </p>
                          </div>
                          <p className={cn(
                            "text-[10px] font-bold mt-2 transition-colors duration-500",
                            theme === 'dark' ? "text-white/30" : "text-black/30"
                          )}>
                            {new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className={cn(
                    "flex items-center gap-3 pt-2 border-t transition-colors duration-500",
                    theme === 'dark' ? "border-white/5" : "border-black/5"
                  )}>
                    <img 
                      src={currentUser?.avatarUrl} 
                      alt="" 
                      className={cn(
                        "w-7 h-7 rounded-full object-cover border transition-colors duration-500",
                        theme === 'dark' ? "border-white/10" : "border-black/10"
                      )} 
                    />
                    <input 
                      type="text" 
                      placeholder="Adicione um comentário..." 
                      className={cn(
                        "bg-transparent text-sm w-full outline-none transition-colors duration-500",
                        theme === 'dark' ? "text-white/80 placeholder:text-white/30" : "text-[#3d2723]/80 placeholder:text-[#3d2723]/30"
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function MobileNotificationsModal({ onClose, onSelectUser }: { onClose: () => void; onSelectUser: (userId: string) => void }) {
  const { galleryPosts, users, currentUser, clearNotifications, theme } = useInventory();

  const activities: Array<{
    id: string;
    userId: string;
    type: 'publish' | 'like' | 'comment';
    text: string;
    time: string;
    postId?: string;
  }> = [];

  const lastCleared = currentUser?.lastNotificationsClear ? new Date(currentUser.lastNotificationsClear).getTime() : 0;

  galleryPosts.forEach(post => {
    const author = users.find(u => u.id === post.userId);
    if (author?.username === 'jeff') return; // Hide jeff's activity

    const authorName = author?.name || author?.username || 'Usuário';

    // Activity: Publish
    if (new Date(post.createdAt).getTime() > lastCleared) {
      activities.push({
        id: `pub-${post.id}`,
        userId: post.userId,
        type: 'publish',
        text: `${authorName} publicou um novo post: "${post.caption ? post.caption.slice(0, 30) + '...' : 'Foto'}"`,
        time: post.createdAt,
        postId: post.id
      });
    }

    if (post.likes && post.likes.length > 0) {
      post.likes.forEach(likerUsername => {
        const liker = users.find(u => u.username === likerUsername || u.id === likerUsername);
        if (liker?.username === 'jeff') return; // Hide jeff's likes
        const likerName = liker?.name || liker?.username || likerUsername;
        
        // Show like if it happened after clear AND (it's my post OR I am the one who liked)
        // Note: For simplicity, we assume like time is post time if not tracked specifically, 
        // but here we only have post.createdAt. If we want better accuracy we need like timestamp.
        // For now, let's stick to post time filtering.
        if (new Date(post.createdAt).getTime() > lastCleared) {
          if (post.userId === currentUser?.id || liker?.id === currentUser?.id) {
            activities.push({
              id: `like-${post.id}-${likerUsername}`,
              userId: liker?.id || post.userId,
              type: 'like',
              text: `${likerName} curtiu ${post.userId === currentUser?.id ? 'sua publicação' : `a publicação de ${authorName}`}`,
              time: post.createdAt
            });
          }
        }
      });
    }

    if (post.comments && post.comments.length > 0) {
      post.comments.forEach(comment => {
        const commenter = users.find(u => u.id === comment.userId);
        if (commenter?.username === 'jeff') return; // Skip jeff

        const commenterName = commenter?.name || commenter?.username || 'Usuário';
        
        if (new Date(comment.createdAt).getTime() > lastCleared) {
          activities.push({
            id: `comm-${comment.id}`,
            userId: comment.userId,
            type: 'comment',
            text: `${commenterName} comentou: "${comment.text.slice(0, 30)}..."`,
            time: comment.createdAt
          });
        }
      });
    }
  });

  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col overflow-y-auto transition-colors duration-500",
      theme === 'dark' ? "bg-black/90 backdrop-blur-md" : "bg-white"
    )}>
      <div className={cn(
        "flex items-center justify-between p-4 border-b transition-colors duration-500",
        theme === 'dark' ? "border-white/10 bg-[#120c08]" : "border-black/10 bg-white"
      )}>
        <h3 className={cn(
          "font-serif font-bold text-lg transition-colors duration-500",
          theme === 'dark' ? "text-white" : "text-[#3d2723]"
        )}>Notificações</h3>
        <div className="flex items-center gap-2">
          {activities.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('Limpar todas as notificações?')) {
                  clearNotifications();
                }
              }}
              className="text-xs font-bold text-rose-400 bg-rose-400/10 px-3 py-1.5 rounded-full"
            >
              Limpar
            </button>
          )}
          <button onClick={onClose} className={cn(
            "p-2 transition-colors duration-500",
            theme === 'dark' ? "text-white/70 hover:text-white" : "text-[#3d2723]/70 hover:text-[#3d2723]"
          )}>
            <X size={22} />
          </button>
        </div>
      </div>

      <div className={cn(
        "flex flex-col divide-y transition-colors duration-500",
        theme === 'dark' ? "divide-white/5" : "divide-black/5"
      )}>
        {activities.map(act => {
          const actUser = users.find(u => u.id === act.userId);
          return (
            <div 
              key={act.id} 
              onClick={() => {
                if (act.userId) {
                  onSelectUser(act.userId);
                }
              }}
              className={cn(
                "flex items-center gap-3 p-4 transition-colors cursor-pointer",
                theme === 'dark' ? "hover:bg-white/5" : "hover:bg-black/5"
              )}
            >
              <img 
                src={actUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                alt="" 
                className={cn(
                  "w-11 h-11 rounded-full object-cover border shrink-0 transition-colors duration-500",
                  theme === 'dark' ? "border-white/20 bg-black" : "border-black/10 bg-white"
                )} 
              />
              <div className="flex-1 flex flex-col">
                <p className={cn(
                  "text-sm leading-snug transition-colors duration-500",
                  theme === 'dark' ? "text-white/90" : "text-[#3d2723]/90"
                )}>{act.text}</p>
                <span className={cn(
                  "text-[10px] mt-1 transition-colors duration-500",
                  theme === 'dark' ? "text-white/40" : "text-[#3d2723]/40"
                )}>{new Date(act.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <div className={cn(
            "text-center py-16 text-sm transition-colors duration-500",
            theme === 'dark' ? "text-white/50" : "text-[#3d2723]/50"
          )}>Nenhuma notificação recente.</div>
        )}
      </div>
    </div>
  );
}

export function InstagramMobileHeader({ currentTab, onSelect, viewingProfileUserId, onSelectProfile }: InstagramMobileNavProps) {
  const { lowStockItemsCount, unreadMessagesCount, currentUser, galleryPosts, users, theme } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);
  const [internalViewingProfileUserId, setInternalViewingProfileUserId] = useState<string | null>(null);

  const effectiveProfileUserId = viewingProfileUserId !== undefined ? viewingProfileUserId : internalViewingProfileUserId;
  const setEffectiveProfileUserId = onSelectProfile || setInternalViewingProfileUserId;

  const lastCleared = currentUser?.lastNotificationsClear ? new Date(currentUser.lastNotificationsClear).getTime() : 0;
  
  const recentPostsCount = useMemo(() => {
    if (!galleryPosts || !users) return 0;
    return galleryPosts.filter(p => 
      p.userId !== currentUser?.id && 
      users.find(u => u.id === p.userId)?.username !== 'jeff' &&
      new Date(p.createdAt).getTime() > lastCleared
    ).length;
  }, [galleryPosts, users, currentUser?.id, lastCleared]);
  
  return (
    <>
      <header className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-2.5 flex items-center justify-between backdrop-blur-xl shadow-lg transition-colors duration-500",
        theme === 'dark' ? "bg-[#120c08]/95 border-white/10" : "bg-white/95 border-black/5"
      )}>
        {/* Brand Logo in Instagram-style Serif */}
        <button 
          onClick={() => {
            onSelect('menu');
          }} 
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px] flex items-center justify-center">
            <div className={cn(
              "w-full h-full rounded-full flex items-center justify-center transition-colors duration-500",
              theme === 'dark' ? "bg-[#120c08]" : "bg-white"
            )}>
              <Sparkles size={13} className="text-[#ebdcb9]" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className={cn(
              "font-serif italic font-extrabold text-lg tracking-wider leading-none transition-colors duration-500",
              theme === 'dark' ? "text-white" : "text-[#3d2723]"
            )}>
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
            onClick={() => setShowNotifications(true)}
            className={cn(
              "relative p-1.5 rounded-full active:scale-90 transition-all cursor-pointer",
              theme === 'dark' ? "text-white" : "text-black"
            )}
            title="Notificações"
          >
            <Heart size={22} className={recentPostsCount > 0 ? "text-rose-400 fill-rose-500/20 animate-pulse" : ""} />
            {recentPostsCount > 0 && (
              <span className={cn(
                "absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border",
                theme === 'dark' ? "border-[#120c08]" : "border-white"
              )} />
            )}
          </button>

          {/* Direct Messages Icon */}
          <button
            onClick={() => onSelect('chat')}
            className={cn(
              "relative p-1.5 rounded-full active:scale-90 transition-all cursor-pointer",
              theme === 'dark' ? "text-white" : "text-black"
            )}
            title="Mural de Mensagens"
          >
            <Send size={21} className="rotate-[-20deg]" />
            {unreadMessagesCount > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 bg-gradient-to-tr from-[#ec4899] to-[#dc2743] text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-lg border",
                theme === 'dark' ? "border-[#120c08]" : "border-white"
              )}>
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {showNotifications && (
        <MobileNotificationsModal 
          onClose={() => setShowNotifications(false)} 
          onSelectUser={(userId) => {
            setShowNotifications(false);
            setEffectiveProfileUserId(userId);
          }}
        />
      )}
    </>
  );
}

export function AudioRecorder({ onRecordingComplete }: { onRecordingComplete: (base64: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          onRecordingComplete(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {isRecording && (
          <motion.div 
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -inset-4 bg-rose-500/20 rounded-full z-0"
          />
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all z-10 relative shadow-2xl",
            isRecording ? "bg-rose-500 text-white" : "bg-white text-black hover:scale-105 active:scale-95"
          )}
        >
          {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
        </button>
      </div>
      
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-white font-mono text-xl">{formatTime(recordingTime)}</span>
        </div>
      )}
    </div>
  );
}

export function InstagramStoriesRow({ viewingProfileUserId, onSelectProfile }: { viewingProfileUserId?: string | null, onSelectProfile?: (id: string | null) => void }) {
  const { users, stories, currentUser, addStory, deleteStory, theme } = useInventory();
  
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [newStoryType, setNewStoryType] = useState<'image' | 'text' | 'audio'>('text');
  const [newStoryContent, setNewStoryContent] = useState('');
  
  const [internalViewingProfileUserId, setInternalViewingProfileUserId] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const effectiveProfileUserId = viewingProfileUserId !== undefined ? viewingProfileUserId : internalViewingProfileUserId;
  const setEffectiveProfileUserId = onSelectProfile || setInternalViewingProfileUserId;

  // Group stories by user - Memoized to prevent infinite loops
  const storiesByUser = React.useMemo(() => {
    const groups = users.filter(u => u.username !== 'jeff' && u.name.toLowerCase() !== 'jefferson').map(user => {
      return {
        user,
        userStories: stories.filter(s => s.userId === user.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      };
    });

    // Move current user to the front
    return groups.sort((a, b) => {
      if (a.user.id === currentUser?.id) return -1;
      if (b.user.id === currentUser?.id) return 1;
      return 0;
    });
  }, [users, stories, currentUser?.id]);

  const handleAddStory = () => {
    if (!newStoryContent.trim() || !currentUser) return;
    addStory({
      userId: currentUser.id,
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
      <div className={cn(
        "md:hidden w-full overflow-x-auto no-scrollbar scrollbar-none py-3 px-3 backdrop-blur-md transition-colors duration-500",
        theme === 'dark' ? "bg-[#120c08]/60 border-b border-white/5" : "bg-white/80 border-b border-black/5"
      )}>
        <div className="flex items-center gap-4 w-max">
          {storiesByUser.map(({ user, userStories }) => {
            const isCurrentUser = user.id === currentUser?.id;
            const hasStories = userStories.length > 0;

            return (
              <button
                key={user.id}
                onClick={() => {
                  const isJeff = user.username === 'jeff' || user.name.toLowerCase() === 'jefferson';
                  if (isJeff && !isCurrentUser) return null;

                  if (isCurrentUser) {
                    if (hasStories) {
                      if (window.confirm('Ver stories ou adicionar novo? \nClique OK para Ver, Cancelar para Adicionar.')) {
                        setViewingUserId(user.id);
                        setActiveStoryIndex(0);
                      } else {
                        setIsAddingStory(true);
                      }
                    } else {
                      setIsAddingStory(true);
                    }
                  } else {
                    // Logic: Stories first, then Profile
                    if (hasStories) {
                      setViewingUserId(user.id);
                      setActiveStoryIndex(0);
                    } else {
                      setEffectiveProfileUserId(user.id);
                    }
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
                      : (theme === 'dark' ? "bg-white/10" : "bg-black/10")
                  )}
                >
                  <div className={cn(
                    "p-[2px] rounded-full relative transition-colors duration-500",
                    theme === 'dark' ? "bg-[#120c08]" : "bg-white"
                  )}>
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-13 h-13 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {isCurrentUser && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingStory(true);
                    }}
                    className={cn(
                      "absolute bottom-4 right-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 z-10 hover:scale-110 transition-all",
                      theme === 'dark' ? "border-[#120c08]" : "border-white"
                    )}
                  >
                    <Plus size={12} className="text-white" />
                  </div>
                )}

                <span className={cn(
                  "text-[10px] tracking-tight font-medium max-w-[62px] truncate transition-colors duration-500",
                  theme === 'dark' ? "text-stone-300" : "text-stone-800"
                )}>
                  {isCurrentUser ? 'Seu story' : (user.name || user.username)}
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
                <div className="w-full max-w-sm space-y-6 flex flex-col items-center">
                  <AudioRecorder onRecordingComplete={(base64) => setNewStoryContent(base64)} />
                  
                  {newStoryContent && newStoryContent.startsWith('data:audio') && (
                    <div className="w-full p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl border border-white/10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        </svg>
                      </div>
                      <audio controls src={newStoryContent} className="w-full h-10" />
                      <button 
                        onClick={() => setNewStoryContent('')}
                        className="text-xs text-white/60 hover:text-white underline"
                      >
                        Remover e gravar novo
                      </button>
                    </div>
                  )}

                  {!newStoryContent && (
                    <p className="text-white/40 text-center text-xs px-8 leading-relaxed">
                      Toque no microfone para começar a gravar sua mensagem de voz.
                    </p>
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
                <span className="text-white font-bold text-sm shadow-sm">{currentViewingGroup.user.name || currentViewingGroup.user.username}</span>
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

export function InstagramMobileBottomNav({ currentTab, onSelect, viewingProfileUserId, onSelectProfile }: InstagramMobileNavProps) {
  const { lowStockItemsCount, unreadMessagesCount, currentUser, theme } = useInventory();
  const isFuncionarioB = currentUser?.role === 'FUNCIONARIO_B';

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-[70] border-t px-2 py-1.5 flex items-center justify-around backdrop-blur-2xl shadow-2xl transition-colors duration-500",
      theme === 'dark' ? "bg-[#120c08]/95 border-white/10" : "bg-white/95 border-black/5"
    )}>
        {/* 1. Início */}
        <button
          onClick={() => {
            onSelect('menu');
          }}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer active:scale-90",
            currentTab === 'menu' ? "text-[#ebdcb9]" : (theme === 'dark' ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-black")
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
            currentTab === 'publi' ? "text-[#ebdcb9]" : (theme === 'dark' ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-black")
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
            currentTab === 'publi' 
              ? "border-[#ebdcb9] bg-[#ebdcb9]/20 text-[#ebdcb9]" 
              : (theme === 'dark' ? "border-stone-500 text-stone-400" : "border-stone-400 text-stone-500")
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
            currentTab === 'bikinis' ? "text-[#ebdcb9]" : (theme === 'dark' ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-black")
          )}
        >
          <Tag size={22} strokeWidth={currentTab === 'bikinis' ? 2.5 : 1.8} />
          <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Biquínis</span>
          {lowStockItemsCount > 0 && (
            <span className={cn(
              "absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 ring-2",
              theme === 'dark' ? "ring-[#120c08]" : "ring-white"
            )} />
          )}
        </button>

        {/* 4. Insumos */}
        <button
          onClick={() => onSelect('threads')}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer active:scale-90",
            currentTab === 'threads' ? "text-[#ebdcb9]" : (theme === 'dark' ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-black")
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
            currentTab === 'chat' ? "text-[#ebdcb9]" : (theme === 'dark' ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-black")
          )}
        >
          <MessageSquare size={22} strokeWidth={currentTab === 'chat' ? 2.5 : 1.8} />
          <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Chat</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0.5 right-1.5 bg-rose-500 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-md shadow-rose-500/50 animate-pulse">
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </span>
          )}
        </button>

        {/* 6. Perfil */}
        <button
          onClick={() => onSelect('profile')}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer active:scale-90",
            currentTab === 'profile' ? "text-[#ebdcb9]" : (theme === 'dark' ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-black")
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded-full overflow-hidden border transition-all p-[1px]",
            currentTab === 'profile' 
              ? "border-[#ebdcb9] ring-2 ring-[#ebdcb9]/30" 
              : (theme === 'dark' ? "border-stone-500" : "border-stone-300")
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
