import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Camera, X, LogOut, MoreVertical, CalendarCheck, ShoppingCart, Edit3, Trash2, Settings, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';
import { InstagramStoriesRow, UserProfileGalleryModal } from './InstagramMobileNav';

// @ts-ignore
import backgroundImage from '../assets/images/sol_mar_bg_1781047598977.png';

export function MainMenu({ 
  onSelect, 
  onlyMyPosts = false, 
  showPostCreator = false,
  autoOpenGallery = false,
  hideCameraMobile = false,
  viewingProfileUserId: propProfileId,
  onSelectProfile
}: { 
  onSelect: (tab: string) => void; 
  onlyMyPosts?: boolean; 
  showPostCreator?: boolean;
  autoOpenGallery?: boolean;
  hideCameraMobile?: boolean;
  viewingProfileUserId?: string | null;
  onSelectProfile?: (id: string | null) => void;
}) {
  const { galleryPosts, addGalleryPost, likeGalleryPost, deleteGalleryPost, currentUser, users, addPostComment, deletePostComment, editPostComment, editGalleryPost, pinGalleryPost, logout, theme, setTheme, isMobile } = useInventory();
  
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [internalViewingProfileUserId, setInternalViewingProfileUserId] = useState<string | null>(null);
  const [showLikesModalForPostId, setShowLikesModalForPostId] = useState<string | null>(null);
  
  const viewingProfileUserId = propProfileId !== undefined ? propProfileId : internalViewingProfileUserId;
  const setViewingProfileUserId = onSelectProfile || setInternalViewingProfileUserId;
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoOpenGallery && fileInputRef.current) {
      const timer = setTimeout(() => {
        fileInputRef.current?.click();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoOpenGallery]);

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const handlePost = () => {
    if (!newPostImageUrl && !newPostCaption.trim()) return;
    addGalleryPost({
      userId: currentUser!.id,
      imageUrl: newPostImageUrl,
      caption: newPostCaption.trim(),
    });
    setNewPostImageUrl('');
    setNewPostCaption('');
    setShowCaptionInput(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedPosts = onlyMyPosts 
    ? galleryPosts.filter(p => p.userId === currentUser?.id)
    : galleryPosts;

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col font-sans relative pb-24 md:pb-0 transition-colors duration-500",
        theme === 'dark' ? "text-white bg-[#1a130c]" : "text-[#3d2723] bg-[#fbf8f2]"
      )}
    >
      <div className={cn(
        "absolute inset-0 z-0 pointer-events-none transition-opacity duration-500",
        theme === 'dark' ? "bg-black/90 md:bg-black/80 opacity-100" : "bg-white/50 opacity-0"
      )} />
      
      <div className="relative z-10 flex flex-col w-full max-w-md mx-auto h-full">
        {/* Inline Post Creator */}
        {showPostCreator && (
          <div className="px-4 py-3">
            <div className={cn(
              "w-full border rounded-2xl p-4 flex flex-col gap-3 shadow-lg transition-colors duration-500",
              theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-black/5"
            )}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] to-[#bc1888] flex items-center justify-center p-[2px] shrink-0 mt-0.5">
                  <img src={currentUser?.avatarUrl} alt="Avatar" className={cn(
                    "w-full h-full rounded-full object-cover transition-colors duration-500",
                    theme === 'dark' ? "bg-black" : "bg-white"
                  )} />
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  {showCaptionInput ? (
                    <textarea
                      placeholder="Escreva algo..."
                      value={newPostCaption}
                      onChange={e => setNewPostCaption(e.target.value)}
                      className={cn(
                        "bg-transparent text-sm outline-none w-full resize-none min-h-[40px] transition-colors duration-500",
                        theme === 'dark' ? "text-white placeholder:text-white/50" : "text-[#3d2723] placeholder:text-[#3d2723]/50"
                      )}
                      autoFocus
                    />
                  ) : (
                    <div 
                      onClick={() => setShowCaptionInput(true)} 
                      className={cn(
                        "text-sm cursor-pointer pt-1.5 transition-colors duration-500",
                        theme === 'dark' ? "text-white/50" : "text-[#3d2723]/50"
                      )}
                    >
                      O que você quer compartilhar hoje?
                    </div>
                  )}
                  
                  {newPostImageUrl && (
                    <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden mt-2 bg-black/50">
                      <img src={newPostImageUrl} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setNewPostImageUrl('')} 
                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={cn(
                "flex items-center justify-between pt-3 border-t transition-colors duration-500",
                theme === 'dark' ? "border-white/10" : "border-black/10"
              )}>
                <div className="flex items-center gap-4">
                  {!hideCameraMobile && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "transition-colors",
                        theme === 'dark' ? "text-white/70 hover:text-white" : "text-[#3d2723]/70 hover:text-[#3d2723]"
                      )}
                      title="Adicionar imagem"
                    >
                      <Camera size={22} />
                    </button>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  <button 
                    onClick={() => setShowCaptionInput(true)} 
                    className={cn("transition-colors font-serif italic text-xl font-bold leading-none", showCaptionInput ? "text-white" : "text-white/70 hover:text-white")}
                    title="Adicionar texto"
                  >
                    T
                  </button>
                </div>
                
                <button 
                  onClick={handlePost}
                  disabled={!newPostImageUrl && !newPostCaption.trim()}
                  className="bg-[#c5a880] text-[#3d2723] px-4 py-1.5 rounded-full text-xs font-bold disabled:opacity-50 transition-opacity"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Feed */}
        <div className="flex flex-col gap-6 pb-6">
          {onlyMyPosts && (
            <div className="px-4 pt-2">
              <div className={cn(
                "border rounded-2xl p-4 flex items-center justify-between shadow-lg relative transition-colors duration-500",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-black/10"
              )}>
                <div className="flex items-center gap-4">
                  <img src={currentUser?.avatarUrl} alt="Avatar" className={cn(
                    "w-16 h-16 rounded-full object-cover border-2 transition-colors duration-500",
                    theme === 'dark' ? "border-[#ebdcb9] bg-black" : "border-black/20 bg-white"
                  )} />
                  <div>
                    <h2 className={cn(
                      "text-base font-bold transition-colors duration-500",
                      theme === 'dark' ? "text-white" : "text-[#3d2723]"
                    )}>{currentUser?.name || currentUser?.username}</h2>
                    <p className={cn(
                      "text-xs transition-colors duration-500",
                      theme === 'dark' ? "text-white/60" : "text-[#3d2723]/60"
                    )}>Suas publicações ({displayedPosts.length})</p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={cn(
                      "p-2 rounded-xl transition-all cursor-pointer",
                      theme === 'dark' ? "text-white/70 hover:text-white bg-white/5 hover:bg-white/10" : "text-[#3d2723]/70 hover:text-[#3d2723] bg-black/5 hover:bg-black/10"
                    )}
                    title="Opções do perfil"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <div className={cn(
                        "absolute right-0 mt-2 w-48 border rounded-xl shadow-2xl z-50 py-1.5 flex flex-col transition-colors duration-500",
                        theme === 'dark' ? "bg-[#1f1610] border-white/15" : "bg-white border-black/10"
                      )}>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onSelect('configuracoes');
                          }}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors",
                            theme === 'dark' ? "text-white hover:bg-white/10" : "text-[#3d2723] hover:bg-black/5"
                          )}
                        >
                          <Settings size={16} className="text-[#ebdcb9]" />
                          Configurações
                        </button>
                        <div className={cn("h-px my-1", theme === 'dark' ? "bg-white/10" : "bg-black/10")} />
                        
                        {isMobile && (
                          <button
                            onClick={() => {
                              setTheme(theme === 'dark' ? 'light' : 'dark');
                              setShowProfileMenu(false);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors",
                              theme === 'dark' ? "text-white hover:bg-white/10" : "text-[#3d2723] hover:bg-black/5"
                            )}
                          >
                            {theme === 'dark' ? (
                              <>
                                <Sun size={16} className="text-[#ebdcb9]" />
                                Tema Claro
                              </>
                            ) : (
                              <>
                                <Moon size={16} className="text-[#ebdcb9]" />
                                Tema Escuro
                              </>
                            )}
                          </button>
                        )}

                        <div className={cn("h-px my-1", theme === 'dark' ? "bg-white/10" : "bg-black/10")} />
                        {isAdmOrMestre && (
                          <>
                            <button
                              onClick={() => {
                                setShowProfileMenu(false);
                                onSelect('attendance');
                              }}
                              className={cn(
                                "flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors",
                                theme === 'dark' ? "text-white hover:bg-white/10" : "text-[#3d2723] hover:bg-black/5"
                              )}
                            >
                              <CalendarCheck size={16} className="text-[#ebdcb9]" />
                              Presença
                            </button>
                            <button
                              onClick={() => {
                                setShowProfileMenu(false);
                                onSelect('sales');
                              }}
                              className={cn(
                                "flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors",
                                theme === 'dark' ? "text-white hover:bg-white/10" : "text-[#3d2723] hover:bg-black/5"
                              )}
                            >
                              <ShoppingCart size={16} className="text-[#ebdcb9]" />
                              Vendas
                            </button>
                            <div className={cn("h-px my-1", theme === 'dark' ? "bg-white/10" : "bg-black/10")} />
                          </>
                        )}
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors font-semibold",
                            theme === 'dark' ? "text-rose-400 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-500/5"
                          )}
                        >
                          <LogOut size={16} />
                          Sair da conta
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {displayedPosts.length === 0 ? (
            <div className={cn(
              "text-center py-20 flex flex-col items-center transition-colors duration-500",
              theme === 'dark' ? "text-white/50" : "text-[#3d2723]/50"
            )}>
              <Camera size={48} className="mb-4 opacity-20" />
              <p>{onlyMyPosts ? 'Você ainda não fez nenhuma publicação.' : 'Nenhuma publicação ainda.'}</p>
              <p className="text-xs">Compartilhe momentos no mural!</p>
            </div>
          ) : (
            [...displayedPosts].sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }).filter(p => {
              const pUser = users.find(u => u.id === p.userId);
              return pUser?.username !== 'jeff';
            }).map(post => {
              const hasLiked = currentUser ? (post.likes || []).includes(currentUser.id) : false;
              const postUser = users.find(u => u.id === post.userId);
              
              return (
                <div key={post.id} className={cn(
                  "w-full border-y md:border md:rounded-2xl flex flex-col transition-colors duration-500",
                  theme === 'dark' ? "bg-black/40 border-white/10" : "bg-white border-black/5"
                )}>
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-3 relative">
                    <div 
                      onClick={() => {
                        setViewingProfileUserId(post.userId);
                      }}
                      className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px]">
                        <img 
                          src={postUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"}
                          alt="User"
                          className={cn(
                            "w-full h-full object-cover rounded-full transition-colors duration-500",
                            theme === 'dark' ? "bg-black" : "bg-white"
                          )}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-bold md:font-semibold text-sm flex items-center gap-2 transition-colors duration-500",
                          theme === 'dark' ? "text-white" : "text-[#3d2723]"
                        )}>
                          {postUser?.name || postUser?.username || 'Usuário'}
                          {post.isPinned && <span className="text-[10px] text-[#c5a880] bg-[#c5a880]/10 px-1.5 py-0.5 rounded">Fixado</span>}
                        </span>
                      </div>
                    </div>
                    {currentUser?.id === post.userId && (
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                          className={cn(
                            "p-1 transition-colors duration-500",
                            theme === 'dark' ? "text-white/50 hover:text-white" : "text-[#3d2723]/50 hover:text-[#3d2723]"
                          )}
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {activeMenuId === post.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className={cn(
                              "absolute right-0 mt-2 w-48 border rounded-xl shadow-xl z-50 overflow-hidden transition-colors duration-500",
                              theme === 'dark' ? "bg-[#1a1412] border-white/10" : "bg-white border-black/10"
                            )}>
                              <button
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setEditCaption(post.caption);
                                  setActiveMenuId(null);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-3 text-sm transition-colors",
                                  theme === 'dark' ? "text-white hover:bg-white/5" : "text-[#3d2723] hover:bg-black/5"
                                )}
                              >
                                Editar publicação
                              </button>
                              <button
                                onClick={() => {
                                  pinGalleryPost(post.id);
                                  setActiveMenuId(null);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-3 text-sm transition-colors",
                                  theme === 'dark' ? "text-white hover:bg-white/5" : "text-[#3d2723] hover:bg-black/5"
                                )}
                              >
                                {post.isPinned ? 'Desfixar do topo' : 'Fixar no topo'}
                              </button>
                              <div className={cn("h-px w-full", theme === 'dark' ? "bg-white/10" : "bg-black/10")} />
                              <button
                                onClick={() => {
                                  deleteGalleryPost(post.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
                              >
                                Apagar publicação
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="w-full aspect-square bg-white/5 relative">
                      <img 
                        src={post.imageUrl} 
                        alt="Post" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => likeGalleryPost(post.id)}
                        className={cn("transition-transform active:scale-75", hasLiked ? "text-rose-500 fill-rose-500" : (theme === 'dark' ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700"))}
                      >
                        <Heart size={24} className={hasLiked ? "fill-rose-500" : ""} />
                      </button>
                      <button className={cn("transition-transform active:scale-75", theme === 'dark' ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700")}>
                        <MessageCircle size={24} />
                      </button>
                    </div>
                    <button className={cn("transition-transform active:scale-75", theme === 'dark' ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700")}>
                      <Bookmark size={24} />
                    </button>
                  </div>

                  {/* Post Details */}
                  <div className="px-3 pb-4 space-y-1">
                    <p 
                      className={cn(
                        "text-sm font-semibold cursor-pointer hover:underline transition-colors duration-500",
                        theme === 'dark' ? "text-white/95" : "text-[#3d2723]/95"
                      )}
                      onClick={() => setShowLikesModalForPostId(post.id)}
                    >
                      {(post.likes || []).length} curtidas
                    </p>
                    <div className="text-sm">
                      {editingPostId === post.id ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className={cn(
                              "text-sm w-full rounded-lg p-2 outline-none resize-none min-h-[60px] transition-colors duration-500",
                              theme === 'dark' ? "bg-white/10 text-white" : "bg-black/5 text-[#3d2723]"
                            )}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingPostId(null)}
                              className={cn(
                                "text-xs px-3 py-1.5 transition-colors duration-500",
                                theme === 'dark' ? "text-white/50" : "text-[#3d2723]/50"
                              )}
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => {
                                editGalleryPost(post.id, editCaption);
                                setEditingPostId(null);
                              }}
                              className="text-xs bg-[#c5a880] text-[#3d2723] font-bold px-3 py-1.5 rounded-full"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        post.imageUrl ? (
                          <>
                            <span className={cn(
                              "font-bold md:font-semibold mr-2 transition-colors duration-500",
                              theme === 'dark' ? "text-white" : "text-[#3d2723]"
                            )}>{postUser?.name || postUser?.username || 'Usuário'}</span>
                            <span className={cn(
                              "whitespace-pre-wrap break-words transition-colors duration-500",
                              theme === 'dark' ? "text-white/90" : "text-[#3d2723]/90"
                            )}>{post.caption}</span>
                          </>
                        ) : (
                          <div className="mt-1 mb-3">
                            <span className={cn(
                              "text-base md:text-lg font-medium whitespace-pre-wrap break-words leading-relaxed transition-colors duration-500",
                              theme === 'dark' ? "text-white" : "text-[#3d2723]"
                            )}>{post.caption}</span>
                          </div>
                        )
                      )}
                    </div>
                    <p className={cn(
                      "text-[10px] uppercase tracking-wide mt-1 mb-2 transition-colors duration-500",
                      theme === 'dark' ? "text-white/50" : "text-[#3d2723]/50"
                    )}>
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(post.createdAt))}
                    </p>

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {post.comments
                          .filter(c => {
                            const cUser = users.find(u => u.id === c.userId);
                            return cUser?.username !== 'jeff';
                          })
                          .map(comment => {
                          const commentUser = users.find(u => u.id === comment.userId);
                          const isMyComment = currentUser?.id === comment.userId;
                          
                          // Rule: Edit only after 5 minutes
                          const commentTime = new Date(comment.createdAt).getTime();
                          const fiveMinutesInMs = 5 * 60 * 1000;
                          const canEdit = isMyComment && (Date.now() - commentTime >= fiveMinutesInMs);
                          
                          return (
                            <div key={comment.id} className="group relative flex flex-col gap-1 bg-white/[0.06] md:bg-transparent p-2.5 md:p-0 rounded-xl md:rounded-none border border-white/10 md:border-none mb-1.5 md:mb-0">
                              <div className="flex items-start justify-between">
                                <div className="text-sm">
                                  <span className="font-bold md:font-semibold mr-2">{commentUser?.name || commentUser?.username || 'Usuário'}</span>
                                  {editingCommentId === comment.id ? (
                                    <div className="flex flex-col gap-2 mt-1">
                                      <textarea
                                        value={editCommentText}
                                        onChange={(e) => setEditCommentText(e.target.value)}
                                        className="w-full bg-black/40 border border-[#ebdcb9]/30 rounded-lg p-2 text-white text-sm outline-none focus:border-[#ebdcb9]"
                                        rows={2}
                                      />
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => {
                                            if (editCommentText.trim()) {
                                              editPostComment(post.id, comment.id, editCommentText);
                                              setEditingCommentId(null);
                                            }
                                          }}
                                          className="text-[10px] bg-[#ebdcb9] text-black px-2 py-1 rounded font-bold"
                                        >
                                          Salvar
                                        </button>
                                        <button 
                                          onClick={() => setEditingCommentId(null)}
                                          className="text-[10px] bg-white/10 text-white px-2 py-1 rounded font-bold"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-white/90 whitespace-pre-wrap break-words">{comment.text}</span>
                                  )}
                                </div>

                                {isMyComment && !editingCommentId && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {canEdit && (
                                      <button 
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditCommentText(comment.text);
                                        }}
                                        className="p-1 text-white/40 hover:text-[#ebdcb9]"
                                        title="Editar (Disponível após 5 min)"
                                      >
                                        <Edit3 size={14} />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => {
                                        if (window.confirm('Apagar comentário?')) {
                                          deletePostComment(post.id, comment.id);
                                        }
                                      }}
                                      className="p-1 text-white/40 hover:text-rose-500"
                                      title="Apagar"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] text-white/40">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <div className="w-7 h-7 rounded-full bg-black/40 overflow-hidden shrink-0">
                        <img src={currentUser?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Adicione um comentário..."
                        value={newComments[post.id] || ''}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="bg-transparent text-sm text-white flex-1 outline-none placeholder:text-white/40"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newComments[post.id]?.trim()) {
                            addPostComment(post.id, newComments[post.id].trim());
                            setNewComments(prev => ({ ...prev, [post.id]: '' }));
                          }
                        }}
                      />
                      {newComments[post.id]?.trim() && (
                        <button 
                          onClick={() => {
                            addPostComment(post.id, newComments[post.id].trim());
                            setNewComments(prev => ({ ...prev, [post.id]: '' }));
                          }}
                          className="text-[#c5a880] font-bold text-sm shrink-0"
                        >
                          Publicar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {viewingProfileUserId && (
        <div className="hidden md:block">
          <UserProfileGalleryModal 
            userId={viewingProfileUserId} 
            onClose={() => setViewingProfileUserId(null)} 
          />
        </div>
      )}

      {showLikesModalForPostId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a120e] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
              <h3 className="font-serif font-bold text-white text-base">Curtidas</h3>
              <button onClick={() => setShowLikesModalForPostId(null)} className="p-1 text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5 p-2">
              {galleryPosts.find(p => p.id === showLikesModalForPostId)?.likes?.map(userId => {
                const likedUser = users.find(u => u.id === userId);
                if (!likedUser || likedUser.username === 'jeff') return null;
                return (
                  <div key={userId} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer" onClick={() => { 
                      setShowLikesModalForPostId(null); 
                      setViewingProfileUserId(userId); 
                  }}>
                    <img src={likedUser.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20 bg-black" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white">{likedUser.name || likedUser.username}</span>
                      <span className="text-xs text-white/50">@{likedUser.username}</span>
                    </div>
                  </div>
                );
              })}
              {(!galleryPosts.find(p => p.id === showLikesModalForPostId)?.likes || galleryPosts.find(p => p.id === showLikesModalForPostId)?.likes?.length === 0) && (
                <div className="text-center py-8 text-white/50 text-sm">Nenhuma curtida ainda.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
