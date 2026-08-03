import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Camera, X, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';
import { InstagramStoriesRow } from './InstagramMobileNav';

// @ts-ignore
import backgroundImage from '../assets/images/sol_mar_bg_1781047598977.png';

export function MainMenu({ onSelect, onlyMyPosts = false }: { onSelect: (tab: string) => void; onlyMyPosts?: boolean }) {
  const { galleryPosts, addGalleryPost, likeGalleryPost, deleteGalleryPost, currentUser, users, addPostComment, editGalleryPost, pinGalleryPost, logout } = useInventory();
  
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className="min-h-screen flex flex-col font-sans relative text-white bg-[#1a130c] pb-24 md:pb-0"
    >
      <div className="absolute inset-0 bg-black/90 md:bg-black/80 z-0 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col w-full max-w-md mx-auto h-full">
        {/* Inline Post Creator */}
        <div className="px-4 py-3">
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] to-[#bc1888] flex items-center justify-center p-[2px] shrink-0 mt-0.5">
                <img src={currentUser?.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover bg-black" />
              </div>
              
              <div className="flex-1 flex flex-col gap-2">
                {showCaptionInput ? (
                  <textarea
                    placeholder="Escreva algo..."
                    value={newPostCaption}
                    onChange={e => setNewPostCaption(e.target.value)}
                    className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/50 resize-none min-h-[40px]"
                    autoFocus
                  />
                ) : (
                  <div 
                    onClick={() => setShowCaptionInput(true)} 
                    className="text-sm text-white/50 cursor-pointer pt-1.5"
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

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Adicionar imagem"
                >
                  <Camera size={22} />
                </button>
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

        {/* Gallery Feed */}
        <div className="flex flex-col gap-6 pb-6">
          {onlyMyPosts && (
            <div className="px-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <img src={currentUser?.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#ebdcb9] bg-black" />
                  <div>
                    <h2 className="text-base font-bold text-white">@{currentUser?.username || currentUser?.name}</h2>
                    <p className="text-xs text-white/60">Suas publicações ({displayedPosts.length})</p>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
                  title="Sair da conta"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          )}

          {displayedPosts.length === 0 ? (
            <div className="text-center py-20 text-white/50 flex flex-col items-center">
              <Camera size={48} className="mb-4 opacity-20" />
              <p>{onlyMyPosts ? 'Você ainda não fez nenhuma publicação.' : 'Nenhuma publicação ainda.'}</p>
              <p className="text-xs">Compartilhe momentos no mural!</p>
            </div>
          ) : (
            [...displayedPosts].sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }).map(post => {
              const hasLiked = currentUser ? (post.likes || []).includes(currentUser.id) : false;
              const postUser = users.find(u => u.id === post.userId);
              
              return (
                <div key={post.id} className="w-full bg-black/40 border-y border-white/10 md:border md:rounded-2xl flex flex-col">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-3 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px]">
                        <img 
                          src={postUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"}
                          alt="User"
                          className="w-full h-full object-cover rounded-full bg-black"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-white flex items-center gap-2">
                          {postUser?.username || 'Usuário'}
                          {post.isPinned && <span className="text-[10px] text-[#c5a880] bg-[#c5a880]/10 px-1.5 py-0.5 rounded">Fixado</span>}
                        </span>
                      </div>
                    </div>
                    {currentUser?.id === post.userId && (
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                          className="text-white/50 hover:text-white p-1"
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {activeMenuId === post.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-[#1a1412] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                              <button
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setEditCaption(post.caption);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                              >
                                Editar publicação
                              </button>
                              <button
                                onClick={() => {
                                  pinGalleryPost(post.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                              >
                                {post.isPinned ? 'Desfixar do topo' : 'Fixar no topo'}
                              </button>
                              <div className="h-px bg-white/10 w-full" />
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
                        className={cn("transition-transform active:scale-75", hasLiked ? "text-rose-500 fill-rose-500" : "text-white hover:text-gray-300")}
                      >
                        <Heart size={24} className={hasLiked ? "fill-rose-500" : ""} />
                      </button>
                      <button className="text-white hover:text-gray-300 transition-transform active:scale-75">
                        <MessageCircle size={24} />
                      </button>
                    </div>
                    <button className="text-white hover:text-gray-300 transition-transform active:scale-75">
                      <Bookmark size={24} />
                    </button>
                  </div>

                  {/* Post Details */}
                  <div className="px-3 pb-4 space-y-1">
                    <p className="text-sm font-semibold">{(post.likes || []).length} curtidas</p>
                    <div className="text-sm">
                      {editingPostId === post.id ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="bg-white/10 text-sm text-white w-full rounded-lg p-2 outline-none resize-none min-h-[60px]"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingPostId(null)}
                              className="text-xs text-white/50 px-3 py-1.5"
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
                            <span className="font-semibold mr-2">{postUser?.username || 'Usuário'}</span>
                            <span className="text-white/90 whitespace-pre-wrap break-words">{post.caption}</span>
                          </>
                        ) : (
                          <div className="mt-1 mb-3">
                            <span className="text-white text-base md:text-lg font-medium whitespace-pre-wrap break-words leading-relaxed">{post.caption}</span>
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide mt-1 mb-2">
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(post.createdAt))}
                    </p>

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {post.comments.map(comment => {
                          const commentUser = users.find(u => u.id === comment.userId);
                          return (
                            <div key={comment.id} className="text-sm">
                              <span className="font-semibold mr-2">{commentUser?.username || 'Usuário'}</span>
                              <span className="text-white/90 whitespace-pre-wrap break-words">{comment.text}</span>
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
    </div>
  );
}
