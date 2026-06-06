import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registrar Service Worker para PWA (Instalar no formato aplicativo/APK)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registrado com sucesso:', reg.scope))
      .catch((err) => console.error('Erro ao registrar Service Worker:', err));
  });
} else if ('serviceWorker' in navigator) {
  // Em desenvolvimento, registre também para testes fáceis se desejado
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Forçamento Global Bruto: Garante que o título permaneça "Sol & Mar"
// contra qualquer sobrescrita dinâmica de roteadores, bibliotecas ou caches.
if (typeof document !== 'undefined') {
  document.title = "Sol & Mar";
  const targetTitle = "Sol & Mar";
  
  // Utiliza MutationObserver para monitorar mudanças na tag <title> do <head>
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && document.title !== targetTitle) {
        document.title = targetTitle;
      }
    });
  });

  const titleNode = document.querySelector('title');
  if (titleNode) {
    observer.observe(titleNode, { childList: true });
  }

  // Backup periódico preventivo
  setInterval(() => {
    if (document.title !== targetTitle) {
      document.title = targetTitle;
    }
  }, 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
