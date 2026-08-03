import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ArrowUpFromLine, PlusSquare, Sparkles, Check, ChevronRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isReadyToInstall, setIsReadyToInstall] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  const [deviceOS, setDeviceOS] = useState<'android' | 'ios' | 'other'>('other');
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileOrTablet) return;

    // 1. Detectar se o app já roda como Standalone (se já foi instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsAlreadyInstalled(true);
      return;
    }

    // Verificar se já foi exibido uma vez ao entrar no link
    const hasShownOnce = localStorage.getItem('pwa_installer_shown_once');
    if (hasShownOnce) {
      return;
    }

    // 2. Detectar sistema operacional para dar instruções corretas
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceOS('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceOS('android');
    }

    // 3. Mostrar exatamente uma vez após 3 segundos do carregamento ao entrar no link
    const timer = setTimeout(() => {
      localStorage.setItem('pwa_installer_shown_once', 'true');
      setShowInstaller(true);
    }, 3000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsReadyToInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [isMobileOrTablet]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Escolha do usuário sobre instalação: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsReadyToInstall(false);
    setShowInstaller(false);
  };

  const handleClose = () => {
    setShowInstaller(false);
  };

  // Se não for dispositivo móvel/tablet, ou se já foi instalado, ou se já foi exibido uma vez, não renderiza nada (nem o botão flutuante)
  if (!isMobileOrTablet || isAlreadyInstalled || localStorage.getItem('pwa_installer_shown_once') === 'true' && !showInstaller) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-[10000] flex items-end sm:items-center justify-center p-3 transition-opacity">
      <div 
        className="w-full max-w-sm bg-[#09090b] border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(236,72,153,0.15)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
        id="pwa-install-dialog"
      >
        {/* Glowing backgrounds */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[40px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-white/5 active:scale-95 transition-all cursor-pointer border border-white/5"
          aria-label="Fechar instalador"
        >
          <X size={14} />
        </button>

        {/* Logo and title */}
        <div className="flex items-center gap-3 mb-5 mt-1">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-pink-500/30 shadow-lg shadow-pink-500/10 shrink-0 bg-slate-950">
            <img 
              src="https://i.postimg.cc/FzSYTZHv/sol.jpg" 
              alt="Logo Sol & Mar" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black tracking-widest bg-gradient-to-r from-pink-400 to-amber-400 text-transparent bg-clip-text uppercase">
                SOL & MAR OFICIAL
              </span>
              <Sparkles size={10} className="text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-black text-white tracking-tight uppercase leading-tight mt-0.5">
              Instalar o Aplicativo
            </h3>
            <p className="text-[10px] text-pink-300/80 font-bold tracking-wide uppercase leading-none m-0">
              Formato Leve & Rápido
            </p>
          </div>
        </div>

        {/* Explanation text */}
        <p className="text-[11px] text-slate-300 leading-relaxed mb-4 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
          Tenha acesso rápido ao estoque de biquínis, controle de insumos e lançamentos diretamente da tela inicial do seu celular. Nosso 
          aplicativo funciona como um <strong>APK Nativo</strong>: ocupa menos de 1MB, inicia em milissegundos e atualiza automaticamente!
        </p>

        {/* Platform dynamic instructions */}
        <div className="space-y-3 mb-5">
          <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase block border-b border-white/5 pb-1 select-none">
            Como instalar no seu celular:
          </span>

          {deviceOS === 'ios' ? (
            /* Apple iOS Instructions */
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                  <ArrowUpFromLine size={12} className="text-pink-400" />
                </div>
                <p className="text-[11px] text-slate-300">
                  1. Toque no botão de <strong>Compartilhar</strong> (abaixo na barra do Safari).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                  <PlusSquare size={12} className="text-amber-400" />
                </div>
                <p className="text-[11px] text-slate-300">
                  2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-4 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-emerald-400 font-bold" />
                </div>
                <p className="text-[11px] text-slate-300">
                  3. Confirme e o ícone do <strong>SOL & MAR</strong> aparecerá junto com seus outros apps!
                </p>
              </div>
            </div>
          ) : isReadyToInstall ? (
            /* Direct auto installer (mostly Android/Chrome and PC) */
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone size={16} className="animate-pulse" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] font-black tracking-wider text-emerald-400 block uppercase">DISPOSITIVO SUPORTADO</span>
                <p className="text-[10px] text-slate-300 m-0">Instalação de 1 clique habilitada para seu navegador.</p>
              </div>
            </div>
          ) : (
            /* General android/manually add instructions */
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-4 flex items-center justify-center shrink-0">
                  <ChevronRight size={13} className="text-pink-400" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Abra o menu do seu navegador (os <strong>três pontinhos</strong> no canto superior direito).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-4 flex items-center justify-center shrink-0">
                  <ChevronRight size={13} className="text-amber-400" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[11px] py-3 rounded-2xl uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            Depois
          </button>
          
          {isReadyToInstall ? (
            <button
              onClick={handleInstallClick}
              className="flex-[1.5] text-white font-black text-[11px] py-3 rounded-2xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={13} />
              Instalar Agora
            </button>
          ) : deviceOS !== 'ios' ? (
            <button
              disabled
              className="flex-[1.5] text-slate-500 bg-slate-800/50 border border-white/5 font-black text-[11px] py-3 rounded-2xl uppercase tracking-wider cursor-not-allowed opacity-50 flex items-center justify-center gap-1.5"
            >
              Aguardando...
            </button>
          ) : null}
        </div>

        {/* Small warning about compatibility */}
        <div className="mt-3 text-center">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest select-none">
            Totalmente seguro • Sem vírus ou anúncios
          </span>
        </div>
      </div>
    </div>
  );
}
