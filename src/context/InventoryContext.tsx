import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bikini, Thread, Sale, BikiniStockDivided } from '../types';
import { rtdb } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';

interface InventoryContextType {
  bikinis: Bikini[];
  threads: Thread[];
  sales: Sale[];
  addBikini: (b: Omit<Bikini, 'id'>) => void;
  updateBikiniStock: (id: string, delta: number) => void;
  setBikiniStock: (id: string, stock: number) => void;
  updateBikiniDividedStock: (id: string, divided: BikiniStockDivided) => void;
  removeBikini: (id: string) => void;
  addThread: (t: Omit<Thread, 'id'>) => void;
  updateThreadStock: (id: string, delta: number) => void;
  setThreadStock: (id: string, stock: number) => void;
  removeThread: (id: string) => void;
  registerSale: (s: Omit<Sale, 'id'>) => void;
  lowStockItemsCount: number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);


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
      stock: 100,
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
    stock: 50,
    minStockAlert: 20
  }))
);

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

  // Sync with Realtime Database
  useEffect(() => {
    const inventoryRef = ref(rtdb, 'inventory');
    
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.bikinis) setBikinis(data.bikinis);
        if (data.threads) setThreads(data.threads);
        setSales(data.sales || []);
      } else {
        // Uninitialized cloud database: migrate local storage or INITIAL data to server
        const initialData = {
          bikinis: bikinis.length > 0 ? bikinis : INITIAL_BIKINIS,
          threads: threads.length > 0 ? threads : INITIAL_THREADS,
          sales: sales
        };
        set(inventoryRef, initialData);
      }
    }, (error) => {
      console.error('Realtime Database sync error:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('acqualog_bikinis_v4', JSON.stringify(bikinis));
  }, [bikinis]);

  useEffect(() => {
    localStorage.setItem('acqualog_threads_v3', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('acqualog_sales', JSON.stringify(sales));
  }, [sales]);

  const addBikini = (b: Omit<Bikini, 'id'>) => {
    const newBikini = { ...b, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...bikinis, newBikini];
    set(ref(rtdb, 'inventory/bikinis'), updated);
  };

  const updateBikiniStock = (id: string, delta: number) => {
    const updated = bikinis.map(b => b.id === id ? { ...b, stock: Math.max(0, b.stock + delta) } : b);
    set(ref(rtdb, 'inventory/bikinis'), updated);
  };

  const setBikiniStock = (id: string, stock: number) => {
    const updated = bikinis.map(b => b.id === id ? { ...b, stock: Math.max(0, stock) } : b);
    set(ref(rtdb, 'inventory/bikinis'), updated);
  };

  const updateBikiniDividedStock = (id: string, dividedStock: BikiniStockDivided) => {
    const updated = bikinis.map(b => b.id === id ? { ...b, dividedStock } : b);
    set(ref(rtdb, 'inventory/bikinis'), updated);
  };

  const removeBikini = (id: string) => {
    const updated = bikinis.filter(b => b.id !== id);
    set(ref(rtdb, 'inventory/bikinis'), updated);
  };

  const addThread = (t: Omit<Thread, 'id'>) => {
    const newThread = { ...t, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...threads, newThread];
    set(ref(rtdb, 'inventory/threads'), updated);
  };

  const updateThreadStock = (id: string, delta: number) => {
    const updated = threads.map(t => t.id === id ? { ...t, stock: Math.max(0, t.stock + delta) } : t);
    set(ref(rtdb, 'inventory/threads'), updated);
  };

  const setThreadStock = (id: string, stock: number) => {
    const updated = threads.map(t => t.id === id ? { ...t, stock: Math.max(0, stock) } : t);
    set(ref(rtdb, 'inventory/threads'), updated);
  };

  const removeThread = (id: string) => {
    const updated = threads.filter(b => b.id !== id);
    set(ref(rtdb, 'inventory/threads'), updated);
  };

  const registerSale = (s: Omit<Sale, 'id'>) => {
    const newSale = { ...s, id: Math.random().toString(36).substr(2, 9) };
    const updatedSales = [...sales, newSale];

    // Deduct stock based on sale items
    const updatedBikinis = bikinis.map(b => {
      const item = s.items.find(pi => pi.productId === b.id && pi.type === 'bikini');
      return item ? { ...b, stock: Math.max(0, b.stock - item.quantity) } : b;
    });

    const updatedThreads = threads.map(t => {
      const item = s.items.find(pi => pi.productId === t.id && pi.type === 'thread');
      return item ? { ...t, stock: Math.max(0, t.stock - item.quantity) } : t;
    });

    update(ref(rtdb, 'inventory'), {
      sales: updatedSales,
      bikinis: updatedBikinis,
      threads: updatedThreads
    });
  };

  const lowStockItemsCount = bikinis.filter(b => b.stock <= b.minStockAlert).length +
                             threads.filter(t => t.stock <= t.minStockAlert).length;

  return (
    <InventoryContext.Provider value={{
      bikinis, threads, sales,
      addBikini, updateBikiniStock, setBikiniStock, updateBikiniDividedStock, removeBikini,
      addThread, updateThreadStock, setThreadStock, removeThread,
      registerSale, lowStockItemsCount
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within a InventoryProvider');
  }
  return context;
}
