import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bikini, Thread, Sale, BikiniStockDivided, UserProfileClient, ActionLog } from '../types';
import { rtdb } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';

interface InventoryContextType {
  bikinis: Bikini[];
  threads: Thread[];
  sales: Sale[];
  users: UserProfileClient[];
  logs: ActionLog[];
  currentUser: UserProfileClient | null;
  addBikini: (b: Omit<Bikini, 'id'>) => void;
  addBikiniModel: (modelName: string) => void;
  updateBikiniStock: (id: string, delta: number) => void;
  setBikiniStock: (id: string, stock: number) => void;
  updateBikiniDividedStock: (id: string, divided: BikiniStockDivided) => void;
  removeBikini: (id: string) => void;
  removeBikiniModel: (modelName: string) => void;
  addThread: (t: Omit<Thread, 'id'>) => void;
  updateThreadStock: (id: string, delta: number) => void;
  setThreadStock: (id: string, stock: number) => void;
  removeThread: (id: string) => void;
  registerSale: (s: Omit<Sale, 'id'>) => void;
  resetAllStockToZero: () => void;
  lowStockItemsCount: number;
  unreadMessagesCount: number;

  // New Authentication & User Management operations
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<UserProfileClient, 'id'>) => void;
  removeUser: (id: string) => void;
  isReadOnly: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

function cleanData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}


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
    username: 'jeff',
    name: 'Jefferson',
    role: 'MESTRE',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
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

  const [users, setUsers] = useState<UserProfileClient[]>(DEFAULT_USERS);
  const [logs, setLogs] = useState<ActionLog[]>([]);

  const [currentUser, setCurrentUser] = useState<UserProfileClient | null>(() => {
    const saved = localStorage.getItem('sol_mar_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const isReadOnly = currentUser?.role === 'FUNCIONARIO_B';

  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadMessagesCount(0);
      return;
    }

    const messagesRef = ref(rtdb, 'chat/messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let unread = 0;
        Object.values(data).forEach((msg: any) => {
          const views = msg.views || {};
          if (!views[currentUser.username]) {
            unread++;
          }
        });
        setUnreadMessagesCount(unread);
      } else {
        setUnreadMessagesCount(0);
      }
    }, () => {
      setUnreadMessagesCount(0);
    });

    return () => unsubscribe();
  }, [currentUser]);

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
          const jeffIndex = loadedUsers.findIndex(u => u.username === 'jeff');
          if (jeffIndex !== -1 && loadedUsers[jeffIndex].password !== '#trescafe28') {
            const updatedUsers = [...loadedUsers];
            updatedUsers[jeffIndex] = {
              ...updatedUsers[jeffIndex],
              password: '#trescafe28'
            };
            set(ref(rtdb, 'inventory/users'), updatedUsers);
            setUsers(updatedUsers);
          } else {
            setUsers(loadedUsers);
          }
          // If our current user was updated, keep it in sync
          if (currentUser) {
            const fresh = (data.users as UserProfileClient[]).find(u => u.id === currentUser.id);
            if (fresh) {
              if (JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
                setCurrentUser(fresh);
                localStorage.setItem('sol_mar_currentUser', JSON.stringify(fresh));
              }
            } else {
              // Deleted
              setCurrentUser(null);
              localStorage.removeItem('sol_mar_currentUser');
            }
          }
        } else {
          set(ref(rtdb, 'inventory/users'), DEFAULT_USERS);
        }
        setLogs(data.logs || []);
      } else {
        // Uninitialized cloud database
        const initialData = {
          bikinis: bikinis.length > 0 ? bikinis : INITIAL_BIKINIS,
          threads: threads.length > 0 ? threads : INITIAL_THREADS,
          sales: sales,
          users: DEFAULT_USERS,
          logs: []
        };
        set(inventoryRef, cleanData(initialData));
      }
    }, (error) => {
      console.error('Realtime Database sync error:', error);
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
    set(ref(rtdb, 'inventory/logs'), cleanData(updated));
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

  const addUser = (newUser: Omit<UserProfileClient, 'id'>) => {
    if (isReadOnly) return;
    const cleanUsername = newUser.username.trim().toLowerCase();
    
    const createdUser: UserProfileClient = {
      ...newUser,
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      username: cleanUsername
    };
    
    if (cleanUsername === 'jeff') {
      createdUser.role = 'MESTRE';
    } else {
      if (createdUser.role === 'MESTRE') {
        createdUser.role = 'ADM';
      }
    }

    const updated = [...users.filter(u => u.username !== cleanUsername), createdUser];
    set(ref(rtdb, 'inventory/users'), cleanData(updated));
    pushLog(`Criou/atualizou usuário: ${createdUser.name} (${createdUser.role})`);
  };

  const removeUser = (id: string) => {
    if (isReadOnly) return;
    const found = users.find(u => u.id === id);
    if (!found) return;
    if (found.username === 'jeff') {
      return; 
    }
    if (currentUser?.id === id) {
      return; 
    }
    const updated = users.filter(u => u.id !== id);
    set(ref(rtdb, 'inventory/users'), cleanData(updated));
    pushLog(`Excluiu o usuário: ${found.name} (${found.role})`);
  };

  const addBikini = (b: Omit<Bikini, 'id'>) => {
    if (isReadOnly) return;
    const newBikini = { ...b, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...bikinis, newBikini];
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated));
    pushLog(`Adicionou biquíni: ${b.model} (${b.colorName} / ${b.size})`);
  };

  const addBikiniModel = (modelName: string) => {
    if (isReadOnly) return;
    const cleanName = modelName.trim().toUpperCase();
    if (!cleanName) return;

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
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated));
    pushLog(`Criou novo modelo de biquíni: ${cleanName}`);
  };

  const updateBikiniStock = (id: string, delta: number) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    const updated = bikinis.map(b => b.id === id ? { ...b, stock: newStock } : b);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated));
    pushLog(`Alterou estoque de ${item.model} (${item.colorName} / ${item.size}): ${item.stock} para ${newStock} (${delta > 0 ? '+' : ''}${delta})`);
  };

  const setBikiniStock = (id: string, stock: number) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const targetStock = Math.max(0, stock);
    const updated = bikinis.map(b => b.id === id ? { ...b, stock: targetStock } : b);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated));
    pushLog(`Definiu o estoque de ${item.model} (${item.colorName} / ${item.size}) de ${item.stock} para ${targetStock}`);
  };

  const updateBikiniDividedStock = (id: string, dividedStock: BikiniStockDivided) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const updated = bikinis.map(b => b.id === id ? { ...b, dividedStock } : b);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated));
    pushLog(`Dividiu lote de ${item.model} (${item.colorName} / ${item.size})`);
  };

  const removeBikini = (id: string) => {
    if (isReadOnly) return;
    const item = bikinis.find(b => b.id === id);
    if (!item) return;
    const updated = bikinis.filter(b => b.id !== id);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated));
    pushLog(`Removeu biquíni: ${item.model} (${item.colorName} / ${item.size})`);
  };

  const removeBikiniModel = (modelName: string) => {
    if (isReadOnly) return;
    const cleanName = modelName.trim().toUpperCase();
    const updated = bikinis.filter(b => b.model.toUpperCase() !== cleanName);
    set(ref(rtdb, 'inventory/bikinis'), cleanData(updated));
    pushLog(`Removeu o modelo de biquíni: ${cleanName}`);
  };

  const addThread = (t: Omit<Thread, 'id'>) => {
    if (isReadOnly) return;
    const newThread = { ...t, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...threads, newThread];
    set(ref(rtdb, 'inventory/threads'), cleanData(updated));
    pushLog(`Adicionou insumo: ${t.name} (${t.colorName})`);
  };

  const updateThreadStock = (id: string, delta: number) => {
    if (isReadOnly) return;
    const item = threads.find(t => t.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    const updated = threads.map(t => t.id === id ? { ...t, stock: newStock } : t);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated));
    pushLog(`Alterou estoque de ${item.name} (${item.colorName}): ${item.stock} para ${newStock} (${delta > 0 ? '+' : ''}${delta})`);
  };

  const setThreadStock = (id: string, stock: number) => {
    if (isReadOnly) return;
    const item = threads.find(t => t.id === id);
    if (!item) return;
    const targetStock = Math.max(0, stock);
    const updated = threads.map(t => t.id === id ? { ...t, stock: targetStock } : t);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated));
    pushLog(`Definiu o estoque de ${item.name} (${item.colorName}) de ${item.stock} para ${targetStock}`);
  };

  const removeThread = (id: string) => {
    if (isReadOnly) return;
    const item = threads.find(t => t.id === id);
    if (!item) return;
    const updated = threads.filter(b => b.id !== id);
    set(ref(rtdb, 'inventory/threads'), cleanData(updated));
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

    update(ref(rtdb, 'inventory'), cleanData({
      sales: updatedSales,
      bikinis: updatedBikinis,
      threads: updatedThreads
    }));
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

  const lowStockItemsCount = bikinis.filter(b => b.stock <= b.minStockAlert).length +
                             threads.filter(t => t.stock <= t.minStockAlert).length;

  return (
    <InventoryContext.Provider value={{
      bikinis, threads, sales, users, logs, currentUser,
      addBikini, addBikiniModel, updateBikiniStock, setBikiniStock, updateBikiniDividedStock, removeBikini, removeBikiniModel,
      addThread, updateThreadStock, setThreadStock, removeThread,
      registerSale, resetAllStockToZero, lowStockItemsCount, unreadMessagesCount,
      login, logout, addUser, removeUser, isReadOnly
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
