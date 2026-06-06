import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { AlertCircle, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  pinned?: boolean;
  urgency?: 'comum' | 'prioridade' | 'urgente';
}

export function GlobalPinnedAlerts() {
  const [pinnedAlerts, setPinnedAlerts] = useState<ChatMessage[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const chatRef = ref(rtdb, 'chat/messages');
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgs: ChatMessage[] = [];
        snapshot.forEach(child => {
          msgs.push({ id: child.key as string, ...child.val() });
        });
        
        const activeAlerts = msgs.filter(m => 
          m.pinned && 
          (m.urgency === 'urgente' || m.urgency === 'prioridade')
        );
        
        setPinnedAlerts(activeAlerts);
      } else {
        setPinnedAlerts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const visibleAlerts = pinnedAlerts.filter(a => !dismissedIds.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4">
      {visibleAlerts.map(alert => (
        <div 
          key={alert.id}
          className={`pointer-events-auto w-full max-w-2xl px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-3xl flex items-start gap-3 relative animate-slide-down ${
            alert.urgency === 'urgente' 
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-100 shadow-rose-900/20' 
              : 'bg-amber-950/80 border-amber-500/30 text-amber-100 shadow-amber-900/20'
          }`}
        >
          <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.urgency === 'urgente' ? 'text-rose-400' : 'text-amber-400'}`} />
          <div className="flex-1 min-w-0 pr-8">
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${alert.urgency === 'urgente' ? 'text-rose-400' : 'text-amber-400'}`}>
              AVISO {alert.urgency.toUpperCase()} - {alert.senderName}
            </h4>
            <p className="text-sm font-medium leading-snug whitespace-pre-wrap break-words">{alert.text}</p>
          </div>
          <button
            onClick={() => setDismissedIds(prev => new Set(prev).add(alert.id))}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors pointer-events-auto cursor-pointer"
          >
            <X size={14} className="opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}
