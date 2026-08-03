import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bikini, Thread, Sale, BikiniStockDivided, UserProfileClient, ActionLog, UserStory, GalleryPost } from '../types';
import { rtdb } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';

import { moderateContent } from '../lib/ai';

interface InventoryContextType {
  bikinis: Bikini[];
  threads: Thread[];
  sales: Sale[];
  users: UserProfileClient[];
  logs: ActionLog[];
  stories: UserStory[];
  galleryPosts: GalleryPost[];
  currentUser: UserProfileClient | null;
  addBikini: (b: Omit<Bikini, 'id'>) => void;
  addBikiniModel: (modelName: string) => Promise<void>;
  updateBikiniStock: (id: string, delta: number) => void;
  setBikiniStock: (id: string, stock: number) => void;
  updateBikiniDividedStock: (id: string, divided: BikiniStockDivided) => void;
  removeBikini: (id: string) => void;
  removeBikiniModel: (modelName: string) => void;
  addThread: (t: Omit<Thread, 'id'>) => void;
  updateThreadStock: (id: string, delta: number) => void;
  setThreadStock: (id: string, stock: number) => void;
  updateThreadColorCode: (colorName: string, colorCode: string) => void;
  removeThread: (id: string) => void;
  registerSale: (s: Omit<Sale, 'id'>) => void;
  resetAllStockToZero: () => void;
  lowStockItemsCount: number;
  unreadMessagesCount: number;
  groupUnreadCounts: Record<string, number>;

  // New Authentication & User Management operations
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<UserProfileClient, 'id'> & { id?: string }) => Promise<void>;
  removeUser: (id: string) => void;
  addStory: (story: Omit<UserStory, 'id' | 'createdAt'>) => Promise<void>;
  deleteStory: (id: string) => void;
  addGalleryPost: (post: Omit<GalleryPost, 'id' | 'createdAt' | 'likes'>) => Promise<void>;
  likeGalleryPost: (id: string) => void;
  deleteGalleryPost: (id: string) => void;
  editGalleryPost: (id: string, caption: string) => Promise<void>;
  pinGalleryPost: (id: string) => void;
  addPostComment: (postId: string, text: string) => Promise<void>;
  deletePostComment: (postId: string, commentId: string) => void;
  editPostComment: (postId: string, commentId: string, text: string) => Promise<void>;
  clearNotifications: () => void;
  clearAllGalleryPosts: () => void;
  clearAllStories: () => void;
  restoreAllGalleryPosts: () => void;
  galleryPostsBackup: GalleryPost[];
  isReadOnly: boolean;
  theme: 'dark' | 'light';
  isMobile: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

function cleanData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

let globalAudioCtx: AudioContext | null = null;

const getGlobalAudioContext = () => {
  if (!globalAudioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    getGlobalAudioContext();
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('click', unlockAudio);
  };
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('click', unlockAudio, { once: true });
}

export const playMobileMessageSound = () => {
  try {
    const ctx = getGlobalAudioContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.08); // B5
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
};


const MODELS = [
  'NORONHA BASICO',
  'MALI',
  'OASIS DE ARGOLA',
  'OASIS DE SOL',
  'NORONHA PEDRA GRANDE',
  'TOP DE NOZINHO',
  'NORONHA PEDRA PEQUENA'
];

const COLORS = [
  { name: 'Amarelo', hex: '#FACC15' },
  { name: 'Vermelho Borgonha', hex: '#800020' },
  { name: 'Preto', hex: '#000000' },
  { name: 'Rosa Bebê', hex: '#FBCFE8' },
  { name: 'Rosa Pink', hex: '#EC4899' },
  { name: 'Azul Claro', hex: '#93C5FD' },
  { name: 'Azul Marinho', hex: '#1E3A8A' },
  { name: 'Roxo Escuro', hex: '#4C1D95' },
  { name: 'Roxo Claro', hex: '#C4B5FD' },
  { name: 'Marrom Claro', hex: '#C19A6B' },
  { name: 'Marrom Escuro', hex: '#654321' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Laranja', hex: '#F97316' },
  { name: 'Verde', hex: '#22C55E' }
];

const INITIAL_BIKINIS: Bikini[] = MODELS.flatMap((model, i) => 
  COLORS.flatMap((color, j) => 
    ['P', 'M', 'G'].map((size) => ({
      id: `m_${i}_c_${j}_s_${size}`,
      model: model,
      colorName: color.name,
      colorHex: color.hex,
      size: size as any,
      stock: 0,
      minStockAlert: 30
    }))
  )
);

const INITIAL_THREADS: Thread[] = ['FIO', 'RETA'].flatMap((name, i) =>
  COLORS.map((color, j) => ({
    id: `t_${name}_${j}`,
    name: name,
    colorName: color.name,
    colorHex: color.hex,
    stock: 0,
    minStockAlert: 20
  }))
);

const DEFAULT_USERS: UserProfileClient[] = [
  {
    id: 'user_jeff',
    username: 'Jeff',
    name: 'Jefferson',
    role: 'MESTRE',
    avatarUrl: 'https://i.postimg.cc/dVfY4TLn/Whats-App-Image-2026-06-06-at-02-34-52.jpg',
    password: '#trescafe28'
  }
];

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [bikinis, setBikinis] = useState<Bikini[]>(() => {
    const saved = localStorage.getItem('acqualog_bikinis_v4');
    return saved ? JSON.parse(saved) : INITIAL_BIKINIS;
  });

  const [threads, setThreads] = useState<Thread[]>(() => {
    const saved = localStorage.getItem('acqualog_threads_v3');
    return saved ? JSON.parse(saved) : INITIAL_THREADS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('acqualog_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<UserProfileClient[]>(() => {
    const saved = localStorage.getItem('sol_mar_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [galleryPosts, setGalleryPosts] = useState<GalleryPost[]>([]);
  const [galleryPostsBackup, setGalleryPostsBackup] = useState<GalleryPost[]>([]);

  const [currentUser, setCurrentUser] = useState<UserProfileClient | null>(() => {
    const saved = localStorage.getItem('sol_mar_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const isReadOnly = currentUser?.role === 'FUNCIONARIO_B';

  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [groupUnreadCounts, setGroupUnreadCounts] = useState<Record<string, number>>({});
  const isInitialLoadRef = React.useRef(true);
  const prevUnreadMsgIdsRef = React.useRef<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [themeState, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`sol_mar_theme_${currentUser.id}`);
      if (saved) {
        setThemeState(saved as 'dark' | 'light');
      } else {
        setThemeState('dark');
      }
    } else {
      setThemeState('dark');
    }
  }, [currentUser]);

  const theme = isMobile ? themeState : 'dark';

  const setTheme = (newTheme: 'dark' | 'light') => {
    if (!isMobile) return;
    setThemeState(newTheme);
    if (currentUser) {
      localStorage.setItem(`sol_mar_theme_${currentUser.id}`, newTheme);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setUnreadMessagesCount(0);
      setGroupUnreadCounts({});
      prevUnreadMsgIdsRef.current = new Set();
      isInitialLoadRef.current = true;
      return;
    }

    const groupsRef = ref(rtdb, 'chat/groups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      if (snapshot.exists()) {
        const groupsData = snapshot.val();
        let totalUnread = 0;
        const countsByGroup: Record<string, number> = {};
        const currentUnreadIds = new Set<string>();

        Object.entries(groupsData).forEach(([groupId, groupObj]: [string, any]) => {
          let groupUnread = 0;
          const messages = groupObj?.messages;
          if (messages) {
            Object.entries(messages).forEach(([msgId, msg]: [string, any]) => {
              const isMine = msg.senderId === currentUser.id || msg.senderName === currentUser.name;
              const views = msg.views || {};
              const viewed = Boolean(views[currentUser.username]);

              if (!isMine && !viewed) {
                groupUnread++;
                totalUnread++;
                currentUnreadIds.add(`${groupId}_${msgId}`);
              }
            });
          }
          countsByGroup[groupId] = groupUnread;
        });

        // Detect if new unread incoming message arrived
        let hasNewIncoming = false;
        currentUnreadIds.forEach((id) => {
          if (!prevUnreadMsgIdsRef.current.has(id)) {
            hasNewIncoming = true;
          }
        });

        if (!isInitialLoadRef.current && hasNewIncoming && isMobile) {
          playMobileMessageSound();
        }

        prevUnreadMsgIdsRef.current = currentUnreadIds;
        isInitialLoadRef.current = false;

        setUnreadMessagesCount(totalUnread);
        setGroupUnreadCounts(countsByGroup);
      } else {
        setUnreadMessagesCount(0);
        setGroupUnreadCounts({});
        prevUnreadMsgIdsRef.current = new Set();
        isInitialLoadRef.current = false;
      }
    }, () => {
      setUnreadMessagesCount(0);
      setGroupUnreadCounts({});
    });

    return () => unsubscribe();
  }, [currentUser, isMobile]);

  // Sync with Realtime Database
  useEffect(() => {
    const inventoryRef = ref(rtdb, 'inventory');
    
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.bikinis) setBikinis(data.bikinis);
        if (data.threads) setThreads(data.threads);
        setSales(data.sales || []);
        if (data.users) {
          const loadedUsers = data.users as UserProfileClient[];
          const jeffIndex = loadedUsers.findIndex(u => u.username.toLowerCase() === 'jeff');
          if (jeffIndex !== -1 && (
            loadedUsers[jeffIndex].password !== '#trescafe28' || 
            loadedUsers[jeffIndex].username !== 'Jeff' ||
            !loadedUsers[jeffIndex].avatarUrl
          )) {
            const updatedUsers = [...loadedUsers];
            updatedUsers[jeffIndex] = {
              ...updatedUsers[jeffIndex],
              username: 'Jeff',
              password: '#trescafe28',
              avatarUrl: loadedUsers[jeffIndex].avatarUrl || 'https://i.postimg.cc/dVfY4TLn/Whats-App-Image-2026-06-06-at-02-34-52.jpg'
            };
            set(ref(rtdb, 'inventory/users'), updatedUsers).catch(err => console.warn('Users sync notice:', err?.message));
            setUsers(updatedUsers);
            localStorage.setItem('sol_mar_users', JSON.stringify(updatedUsers));
          } else {
            setUsers(loadedUsers);
            localStorage.setItem('sol_mar_users', JSON.stringify(loadedUsers));
          }
          // If our current user was updated, keep it in sync
          setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const fresh = (data.users as UserProfileClient[]).find(u => u.id === prevUser.id || u.username.toLowerCase() === prevUser.username.toLowerCase());
            if (fresh) {
              localStorage.setItem('sol_mar_currentUser', JSON.stringify(fresh));
              return fresh;
            } else {
              localStorage.removeItem('sol_mar_currentUser');
              return null;
            }
          });
        } else {
          set(ref(rtdb, 'inventory/users'), DEFAULT_USERS).catch(err => console.warn('Default users sync notice:', err?.message));
        }
        setLogs(data.logs || []);
        
        // Cleanup expired stories (older than 24h)
        const loadedStories = (data.stories || []) as UserStory[];
        const now = Date.now();
        const activeStories = loadedStories.filter(s => {
          const storyTime = new Date(s.createdAt).getTime();
          return now - storyTime < 24 * 60 * 60 * 1000;
        });
        
        if (loadedStories.length !== activeStories.length) {
          set(ref(rtdb, 'inventory/stories'), activeStories).catch(err => console.warn('Stories cleanup notice:', err?.message));
        }
        setStories(activeStories);
        setGalleryPosts(data.galleryPosts || []);
        setGalleryPostsBackup(data.galleryPostsBackup || []);
      } else {
        // Uninitialized cloud database
        const initialData = {
          bikinis: bikinis.length > 0 ? bikinis : INITIAL_BIKINIS,
          threads: threads.length > 0 ? threads : INITIAL_THREADS,
          sales: sales,
          users: DEFAULT_USERS,
          logs: [],
          stories: [],
          galleryPosts: []
        };
        set(inventoryRef, cleanData(initialData)).catch(err => console.warn('Initial data sync notice:', err?.message));
      }
    }, (error) => {
      console.warn('Realtime Database read notice:', error?.message || error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('acqualog_bikinis_v4', JSON.stringify(bikinis));
  }, [bikinis]);

  useEffect(() => {
    localStorage.setItem('acqualog_threads_v3', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('acqualog_sales', JSON.stringify(sales));
  }, [sales]);

  const pushLogWithUser = (user: UserProfileClient, actionText: string) => {
    const newLog: ActionLog = {
      id: Math.random().toString(36).substr(2, 9),
      username: user.username,
      workerName: user.name,
      action: actionText,
      timestamp: new Date().toISOString()
    };
    const updated = [newLog, ...logs].slice(0, 100);
    setLogs(updated);
    set(ref(rtdb, 'inventory/logs'), cleanData(updated)).catch(err => console.warn('Log sync notice:', err?.message));
  };

  const pushLog = (actionText: string) => {
    if (!currentUser) return;
    pushLogWithUser(currentUser, actionText);
  };

  const login = (username: string, password: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    
    const found = users.find(u => u.username.toLowerCase() === cleanUser && u.password === cleanPass);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('sol_mar_currentUser', JSON.stringify(found));
      pushLogWithUser(found, "Entrou no sistema");
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      pushLogWithUser(currentUser, "Saiu do sistema");
    }
    setCurrentUser(null);
    localStorage.removeItem('sol_mar_currentUser');
  };

  const addUser = async (newUser: Omit<UserProfileClient, 'id'> & { id?: string }) => {
    if (isReadOnly && newUser.id !== currentUser?.id) return;

    if (newUser.name) {
      const safety = await moderateContent(newUser.name);
      if (!safety.isSafe) {
        alert(`Nome de usuário impróprio detectado: ${safety.reason}`);
        return;
      }
    }

    const cleanUsername = newUser.username.trim();
    
    let formattedUsername = cleanUsername;
    if (cleanUsername.toLowerCase() === 'jeff') {
      formattedUsername = 'Jeff';
    } else {
      formattedUsername = cleanUsername.toLowerCase();
    }
    
    const createdUser: UserProfileClient = {
      ...newUser,
      id: newUser.id || ('user_' + Math.random().toString(36).substr(2, 9)),
      username: formattedUsername
    };
    
    if (formattedUsername === 'Jeff') {
      createdUser.role = 'MESTRE';
    } else {
      if (createdUser.role === 'MESTRE') {
        createdUser.role = 'ADM';
      }
    }

    const updated = [
      ...users.filter(u => u.id !== createdUser.id && u.username.toLowerCase() !== formattedUsername.toLowerCase()),
      createdUser
    ];
    setUsers(updated);
    localStorage.setItem('sol_mar_users', JSON.stringify(updated));

    if (currentUser && (createdUser.id === currentUser.id || createdUser.username.toLowerCase() === currentUser.username.toLowerCase())) {
      setCurrentUser(createdUser);
      localStorage.setItem('sol_mar_currentUser', JSON.stringify(createdUser));
    }

    set(ref(rtdb, 'inventory/users'), cleanData(updated)).catch(err => console.warn('User sync notice:', err?.message));
    pushLog(`${newUser.id ? 'Editou' : 'Criou/atualizou'} usuário: ${createdUser.name} (${createdUser.role})`);
  };

  const removeUser = (id: string) => {
    if (isReadOnly) return;
    const found = users.find(u => u.id === id);
    if (!found) return;
    if (found.username.toLowerCase() === 'jeff') {
      return; 
    }
    if (currentUser?.id === id) {
      return; 
    }
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    set(ref(rtdb, 'inventory/users'), cleanData(updated)).catch(err => console.warn('User remove notice:', err?.message));
    pushLog(`Excluiu o usuário: ${found.name} (${found.role})`);
  };

  const addBikini = (b: Omit<Bikini, 'id'>) => {
    if (isReadOnly) return;
    const newBikini = { ...b, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...bikinis, newBikini];
    setBikinis(updated);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated)).catch(err => console.warn('Bikini sync notice:', err?.message));
    pushLog(`Adicionou biquíni: ${b.model} (${b.colorName} / ${b.size})`);
  };

  const addBikiniModel = async (modelName: string) => {
    if (isReadOnly) return;
    const cleanName = modelName.trim().toUpperCase();
    if (!cleanName) return;

    const safety = await moderateContent(cleanName);
    if (!safety.isSafe) {
      alert(`Nome de modelo impróprio detectado: ${safety.reason}`);
      return;
    }

    if (bikinis.some(b => b.model.toUpperCase() === cleanName)) {
      return;
    }

    const newVariations: Bikini[] = COLORS.flatMap((color, j) => 
      ['P', 'M', 'G'].map((size) => ({
        id: `m_${cleanName.replace(/\s+/g, '_')}_c_${j}_s_${size}_${Math.random().toString(36).substr(2, 5)}`,
        model: cleanName,
        colorName: color.name,
        colorHex: color.hex,
        size: size as any,
        stock: 0,
        minStockAlert: 30
      }))
    );

    const updated = [...bikinis, ...newVariations];
    setBikinis(updated);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated)).catch(err => console.warn('Model sync notice:', err?.message));
    pushLog(`Criou novo modelo de biquíni: ${cleanName}`);
  };

  const updateBikiniStock = (id: string, delta: number) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    const updated = bikinis.map(b => b.id === id ? { ...b, stock: newStock } : b);
    setBikinis(updated);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated)).catch(err => console.warn('Stock update notice:', err?.message));
    pushLog(`Alterou estoque de ${item.model} (${item.colorName} / ${item.size}): ${item.stock} para ${newStock} (${delta > 0 ? '+' : ''}${delta})`);
  };

  const setBikiniStock = (id: string, stock: number) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const targetStock = Math.max(0, stock);
    const updated = bikinis.map(b => b.id === id ? { ...b, stock: targetStock } : b);
    setBikinis(updated);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated)).catch(err => console.warn('Set stock notice:', err?.message));
    pushLog(`Definiu o estoque de ${item.model} (${item.colorName} / ${item.size}) de ${item.stock} para ${targetStock}`);
  };

  const updateBikiniDividedStock = (id: string, dividedStock: BikiniStockDivided) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const updated = bikinis.map(b => b.id === id ? { ...b, dividedStock } : b);
    setBikinis(updated);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated)).catch(err => console.warn('Divided stock notice:', err?.message));
    pushLog(`Dividiu lote de ${item.model} (${item.colorName} / ${item.size})`);
  };

  const removeBikini = (id: string) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const updated = bikinis.filter(b => b.id !== id);
    setBikinis(updated);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated)).catch(err => console.warn('Remove bikini notice:', err?.message));
    pushLog(`Removeu biquíni: ${item.model} (${item.colorName} / ${item.size})`);
  };

  const removeBikiniModel = (modelName: string) => {
    if (isReadOnly) return;
    const cleanName = modelName.trim().toUpperCase();
    const updated = bikinis.filter(b => b.model.toUpperCase() !== cleanName);
    setBikinis(updated);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated)).catch(err => console.warn('Remove model notice:', err?.message));
    pushLog(`Removeu o modelo de biquíni: ${cleanName}`);
  };

  const addThread = (t: Omit<Thread, 'id'>) => {
    if (isReadOnly) return;
    
    const newThread = { ...t, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...threads, newThread];

    setThreads(updated);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated)).catch(err => console.warn('Add thread notice:', err?.message));
    pushLog(`Adicionou insumo: ${t.name} (${t.colorName}${t.colorCode ? ` - Nº/Cód: ${t.colorCode}` : ''})`);
  };

  const updateThreadStock = (id: string, delta: number) => {
    if (isReadOnly) return;
    const item = threads.find(t => t.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    const updated = threads.map(t => t.id === id ? { ...t, stock: newStock } : t);
    setThreads(updated);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated)).catch(err => console.warn('Thread stock notice:', err?.message));
    pushLog(`Alterou estoque de ${item.name} (${item.colorName}): ${item.stock} para ${newStock} (${delta > 0 ? '+' : ''}${delta})`);
  };

  const setThreadStock = (id: string, stock: number) => {
    if (isReadOnly) return;
    const item = threads.find(t => t.id === id);
    if (!item) return;
    const targetStock = Math.max(0, stock);
    const updated = threads.map(t => t.id === id ? { ...t, stock: targetStock } : t);
    setThreads(updated);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated)).catch(err => console.warn('Set thread stock notice:', err?.message));
    pushLog(`Definiu o estoque de ${item.name} (${item.colorName}) de ${item.stock} para ${targetStock}`);
  };

  const updateThreadColorCode = (idOrColorName: string, colorCode: string) => {
    if (isReadOnly) return;
    const hasExactId = threads.some(t => t.id === idOrColorName);
    const updated = threads.map(t => {
      if (hasExactId) {
        return t.id === idOrColorName ? { ...t, colorCode: colorCode } : t;
      }
      if (t.colorName.toLowerCase() === idOrColorName.toLowerCase()) {
        return { ...t, colorCode: colorCode };
      }
      return t;
    });
    setThreads(updated);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated)).catch(err => console.warn('Thread color code notice:', err?.message));
    pushLog(`Atualizou código/número: ${colorCode}`);
  };

  const removeThread = (id: string) => {
    if (isReadOnly) return;
    const item = threads.find(t => t.id === id);
    if (!item) return;
    const updated = threads.filter(b => b.id !== id);
    setThreads(updated);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated)).catch(err => console.warn('Remove thread notice:', err?.message));
    pushLog(`Removeu insumo: ${item.name} (${item.colorName})`);
  };

  const registerSale = (s: Omit<Sale, 'id'>) => {
    if (isReadOnly) return;
    const newSale = { ...s, id: Math.random().toString(36).substr(2, 9) };
    const updatedSales = [...sales, newSale];

    const updatedBikinis = bikinis.map(b => {
      const item = s.items.find(pi => pi.productId === b.id && pi.type === 'bikini');
      return item ? { ...b, stock: Math.max(0, b.stock - item.quantity) } : b;
    });

    const updatedThreads = threads.map(t => {
      const item = s.items.find(pi => pi.productId === t.id && pi.type === 'thread');
      return item ? { ...t, stock: Math.max(0, t.stock - item.quantity) } : t;
    });

    setSales(updatedSales);
    setBikinis(updatedBikinis);
    setThreads(updatedThreads);

    update(ref(rtdb, 'inventory'), cleanData({
      sales: updatedSales,
      bikinis: updatedBikinis,
      threads: updatedThreads
    })).catch(err => console.warn('Register sale notice:', err?.message));
    pushLog(`Vendeu ${s.items.reduce((acc, current) => acc + current.quantity, 0)} itens - R$ ${s.total.toFixed(2)}`);
  };

  const resetAllStockToZero = () => {
    if (isReadOnly) return;
    const clearedBikinis = bikinis.map(b => {
      const { dividedStock, ...rest } = b;
      return {
        ...rest,
        stock: 0
      };
    });
    const clearedThreads = threads.map(t => ({
      ...t,
      stock: 0
    }));

    set(ref(rtdb, 'inventory'), cleanData({
      bikinis: clearedBikinis,
      threads: clearedThreads,
      sales: [],
      users: users,
      logs: logs
    }));

    localStorage.removeItem('acqualog_bikinis_v4');
    localStorage.removeItem('acqualog_threads_v3');
    localStorage.removeItem('acqualog_sales');

    setBikinis(clearedBikinis);
    setThreads(clearedThreads);
    setSales([]);
    pushLog('Zeru todos os estoques e dados de teste do sistema');
  };

  const addStory = async (storyData: Omit<UserStory, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    
    // Moderation for text stories
    if (storyData.type === 'text' && storyData.content) {
      const safety = await moderateContent(storyData.content);
      if (!safety.isSafe) {
        alert(`Conteúdo impróprio detectado: ${safety.reason || 'Siga as diretrizes do SOL & MAR.'}`);
        return;
      }
    }

    const newStory: UserStory = {
      ...storyData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const updated = [...stories, newStory];
    setStories(updated);
    set(ref(rtdb, 'inventory/stories'), cleanData(updated)).catch(err => console.warn('Story sync notice:', err?.message));
  };

  const addGalleryPost = async (postData: Omit<GalleryPost, 'id' | 'createdAt' | 'likes'>) => {
    if (!currentUser) return;

    if (postData.caption) {
      const safety = await moderateContent(postData.caption);
      if (!safety.isSafe) {
        alert(`Legenda imprópria detectada: ${safety.reason || 'Siga as diretrizes do SOL & MAR.'}`);
        return;
      }
    }

    const newPost: GalleryPost = {
      ...postData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      likes: []
    };
    const updated = [newPost, ...galleryPosts];
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost sync notice:', err?.message));
  };

  const addPostComment = async (postId: string, text: string) => {
    if (!currentUser) return;

    const safety = await moderateContent(text);
    if (!safety.isSafe) {
      alert(`Comentário impróprio detectado: ${safety.reason || 'Siga as diretrizes do SOL & MAR.'}`);
      return;
    }

    const updated = galleryPosts.map(post => {
      if (post.id === postId) {
        const comments = post.comments || [];
        return {
          ...post,
          comments: [...comments, {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser.id,
            text,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return post;
    });
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost comment notice:', err?.message));
  };

  const editPostComment = async (postId: string, commentId: string, text: string) => {
    if (!currentUser) return;

    const safety = await moderateContent(text);
    if (!safety.isSafe) {
      alert(`Conteúdo impróprio detectado: ${safety.reason || 'Siga as diretrizes do SOL & MAR.'}`);
      return;
    }

    const updated = galleryPosts.map(post => {
      if (post.id === postId && post.comments) {
        return {
          ...post,
          comments: post.comments.map(c => c.id === commentId ? { ...c, text } : c)
        };
      }
      return post;
    });
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost comment edit notice:', err?.message));
  };

  const deleteStory = (id: string) => {
    if (!currentUser) return;
    const updated = stories.filter(s => s.id !== id);
    setStories(updated);
    set(ref(rtdb, 'inventory/stories'), cleanData(updated)).catch(err => console.warn('Story remove notice:', err?.message));
  };

  const clearAllStories = () => {
    if (!currentUser || currentUser.role !== 'mestre') return;
    setStories([]);
    set(ref(rtdb, 'inventory/stories'), []).catch(err => console.warn('Clear stories notice:', err?.message));
  };

  const likeGalleryPost = (id: string) => {
    if (!currentUser) return;
    const updated = galleryPosts.map(post => {
      if (post.id === id) {
        const likes = post.likes || [];
        const hasLiked = likes.includes(currentUser.id);
        return {
          ...post,
          likes: hasLiked ? likes.filter(userId => userId !== currentUser.id) : [...likes, currentUser.id]
        };
      }
      return post;
    });
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost like notice:', err?.message));
  };


  const pinGalleryPost = (id: string) => {
    if (!currentUser) return;
    const updated = galleryPosts.map(p => {
      if (p.id === id) {
        return { ...p, isPinned: !p.isPinned };
      }
      return p;
    });
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost pin notice:', err?.message));
  };

  const deletePostComment = (postId: string, commentId: string) => {
    if (!currentUser) return;
    const updated = galleryPosts.map(post => {
      if (post.id === postId && post.comments) {
        return {
          ...post,
          comments: post.comments.filter(c => c.id !== commentId)
        };
      }
      return post;
    });
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost comment delete notice:', err?.message));
  };


  const editGalleryPost = async (id: string, caption: string) => {
    if (!currentUser) return;

    if (caption) {
      const safety = await moderateContent(caption);
      if (!safety.isSafe) {
        alert(`Legenda imprópria detectada: ${safety.reason || 'Siga as diretrizes do SOL & MAR.'}`);
        return;
      }
    }

    const updated = galleryPosts.map(p => {
      if (p.id === id) {
        return { ...p, caption };
      }
      return p;
    });
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost edit notice:', err?.message));
  };

  const clearNotifications = () => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, lastNotificationsClear: now } : u);
    set(ref(rtdb, 'inventory/users'), cleanData(updatedUsers)).catch(err => console.warn('Clear notifications notice:', err?.message));
  };

  const deleteGalleryPost = (id: string) => {
    if (!currentUser) return;
    const post = galleryPosts.find(p => p.id === id);
    if (!post) return;
    const author = users.find(u => u.id === post.userId);
    // Restriction: only on mobile, mestre posts cannot be deleted
    if (isMobile && author?.role === 'MESTRE') return;
    
    const updated = galleryPosts.filter(p => p.id !== id);
    setGalleryPosts(updated);
    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(updated)).catch(err => console.warn('GalleryPost remove notice:', err?.message));
  };

  const clearAllGalleryPosts = () => {
    if (currentUser?.role !== 'MESTRE') return;
    
    // Restriction: on mobile, keep mestre posts
    const postsToKeep = isMobile 
      ? galleryPosts.filter(p => {
          const author = users.find(u => u.id === p.userId);
          return author?.role === 'MESTRE';
        })
      : [];
      
    const postsToDelete = isMobile
      ? galleryPosts.filter(p => {
          const author = users.find(u => u.id === p.userId);
          return author?.role !== 'MESTRE';
        })
      : galleryPosts;

    if (postsToDelete.length === 0) return;

    const backup = [...postsToDelete];
    setGalleryPostsBackup(backup);
    setGalleryPosts(postsToKeep);

    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(postsToKeep)).catch(err => console.warn('Clear posts notice:', err?.message));
    set(ref(rtdb, 'inventory/galleryPostsBackup'), cleanData(backup)).catch(err => console.warn('Backup posts notice:', err?.message));
  };

  const restoreAllGalleryPosts = () => {
    if (currentUser?.role !== 'MESTRE') return;
    if (galleryPostsBackup.length === 0) return;

    const restored = [...galleryPostsBackup];
    setGalleryPosts(restored);
    setGalleryPostsBackup([]);

    set(ref(rtdb, 'inventory/galleryPosts'), cleanData(restored)).catch(err => console.warn('Restore posts notice:', err?.message));
    set(ref(rtdb, 'inventory/galleryPostsBackup'), []).catch(err => console.warn('Clear backup posts notice:', err?.message));
  };

  const lowStockItemsCount = bikinis.filter(b => b.stock <= b.minStockAlert).length +
                             threads.filter(t => t.stock <= t.minStockAlert).length;

  return (
    <InventoryContext.Provider value={{
      bikinis, threads, sales, users, logs, stories, galleryPosts, galleryPostsBackup, currentUser,
      addBikini, addBikiniModel, updateBikiniStock, setBikiniStock, updateBikiniDividedStock, removeBikini, removeBikiniModel,
      addThread, updateThreadStock, setThreadStock, updateThreadColorCode, removeThread,
      registerSale, resetAllStockToZero, lowStockItemsCount, unreadMessagesCount, groupUnreadCounts,
      login, logout, addUser, removeUser, addStory, deleteStory, clearAllStories, addGalleryPost, likeGalleryPost, deleteGalleryPost, editGalleryPost, pinGalleryPost, addPostComment, deletePostComment, editPostComment, clearNotifications, clearAllGalleryPosts, restoreAllGalleryPosts, isReadOnly,
      theme, setTheme, isMobile
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
