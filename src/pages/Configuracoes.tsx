import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { cn } from '../lib/utils';
import { Shield, Key, Eye, EyeOff, UserPlus, Trash2, RefreshCw, AlertTriangle, Image, Check, LogOut, Upload, Edit2, UserCheck, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 1
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 2
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 3
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 4
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 5
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 6
];

export function Configuracoes() {
  const { users, currentUser, addUser, removeUser, resetAllStockToZero, logout, theme, isMobile } = useInventory();
  const isLight = theme === 'light';
  
  // Access control
  const isMestreCurrentUser = currentUser?.role === 'MESTRE' || currentUser?.username?.toLowerCase() === 'mestre' || currentUser?.username?.toLowerCase() === 'jeff';
  const isAdmOrMestre = isMestreCurrentUser || currentUser?.role === 'ADM';
  const isLiderOrAdmOrMestre = isAdmOrMestre || currentUser?.role === 'LIDER';

  // Mobile specific visibility rule: on mobile, non-admins only see "Edit My Profile"
  const shouldShowAdminSections = isLiderOrAdmOrMestre && !isMobile;
  // Master/ADM override for mobile: they still need access to admin tools if they are the boss
  const effectiveShowAdminSections = isMobile ? isAdmOrMestre : isLiderOrAdmOrMestre;

  // States for user form
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('FUNCIONARIO_A');
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // States for dangerous system reset
  const [confirmResetText, setConfirmResetText] = useState('');
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  // State for visual password display
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});

  const isEditingSelf = editingUserId === currentUser?.id;
  const targetUserObj = users.find(u => u.id === editingUserId);
  const isEditingMestre = targetUserObj ? (targetUserObj.role === 'MESTRE' || targetUserObj.username.toLowerCase() === 'jeff' || targetUserObj.id === 'user_jeff') : false;
  const canEditRoleField = isAdmOrMestre && !isEditingMestre;

  // Initialize or update form values for editing
  useEffect(() => {
    if (currentUser) {
      if (!isLiderOrAdmOrMestre || !editingUserId || editingUserId === currentUser.id) {
        setEditingUserId(currentUser.id);
        setNewUsername(currentUser.username);
        setNewName(currentUser.name);
        setNewPassword(currentUser.password || '');
        setNewRole(currentUser.role);
        if (AVATARS.includes(currentUser.avatarUrl)) {
          setNewAvatar(currentUser.avatarUrl);
          setCustomAvatarUrl('');
        } else {
          setCustomAvatarUrl(currentUser.avatarUrl || '');
          setNewAvatar('');
        }
      }
    }
  }, [currentUser?.id, currentUser?.avatarUrl, currentUser?.name, currentUser?.username, currentUser?.password, currentUser?.role, isLiderOrAdmOrMestre]);

  const togglePassVisibility = (id: string) => {
    setShowPassMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUserError('A imagem selecionada é muito grande. Escolha uma foto com menos de 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setCustomAvatarUrl(result);
        setNewAvatar('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    const cleanUsername = newUsername.trim();
    const cleanPassword = newPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setUserError('Por favor, preencha o login e a senha de acesso.');
      return;
    }

    const activeTargetId = (isLiderOrAdmOrMestre || isMobile) ? (editingUserId || undefined) : currentUser?.id;
    const existingTarget = users.find(u => u.id === activeTargetId);

    const cleanName = (isLiderOrAdmOrMestre || isMobile)
      ? newName.trim()
      : (existingTarget?.name || currentUser?.name || 'Usuário');

    let targetRole = (isLiderOrAdmOrMestre || isMobile)
      ? newRole
      : (existingTarget?.role || currentUser?.role || 'FUNCIONARIO_A');

    if (targetRole === 'MESTRE' && !isMestreCurrentUser) {
      targetRole = existingTarget?.role && existingTarget.role !== 'MESTRE' ? existingTarget.role : 'ADM';
    }

    if ((isLiderOrAdmOrMestre || isMobile) && !cleanName) {
      setUserError('Por favor, preencha o nome completo do usuário.');
      return;
    }

    const testLowerUser = cleanUsername.toLowerCase();
    if (testLowerUser === 'jeff' && activeTargetId !== 'user_jeff') {
      setUserError('O login "Jeff" é exclusivo do Mestre e não pode ser utilizado.');
      return;
    }

    // Check if user login already exists for a different user
    const exists = users.find(u => u.username.toLowerCase() === testLowerUser && u.id !== activeTargetId);
    if (exists) {
      setUserError(`O login de usuário "@${cleanUsername}" já está em uso por outra conta.`);
      return;
    }

    const finalAvatar = customAvatarUrl.trim() ? customAvatarUrl.trim() : newAvatar;

    addUser({
      id: activeTargetId,
      username: cleanUsername,
      name: cleanName,
      password: cleanPassword,
      role: targetRole,
      avatarUrl: finalAvatar
    } as any);

    if (isLiderOrAdmOrMestre && editingUserId && editingUserId !== currentUser?.id) {
      setUserSuccess(`Usuário ${cleanName} atualizado com sucesso!`);
      setEditingUserId(null);
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      setCustomAvatarUrl('');
      setNewRole('FUNCIONARIO_A');
    } else {
      setUserSuccess('Seu perfil foi atualizado com sucesso!');
    }
  };

  const handleResetStocks = () => {
    if (confirmResetText !== 'ZERAR') {
      alert('Por favor, digite ZERAR para confirmar o reset completo.');
      return;
    }
    resetAllStockToZero();
    setIsResetSuccess(true);
    setConfirmResetText('');
    setTimeout(() => {
      setIsResetSuccess(false);
    }, 4000);
  };

  const roleLabels: Record<UserRole, string> = {
    MESTRE: 'Mestre Desenvolvedor',
    ADM: 'Administrador (ADM)',
    LIDER: 'Líder de Equipe',
    FUNCIONARIO_A: 'Funcionário A',
    FUNCIONARIO_B: 'Funcionário B (Visualizador)',
  };

  const visibleUsers = users.filter(u => {
    const isJeff = u.username.toLowerCase() === 'jeff' || u.id === 'user_jeff';
    if (isJeff) return false; // Hide jeff from the list for everyone
    
    const isMestreUser = u.role === 'MESTRE' || u.username.toLowerCase() === 'jeff' || u.id === 'user_jeff';
    return currentUser?.role === 'MESTRE' || !isMestreUser;
  });

  return (
    <div className={cn(
      "relative md:rounded-[2.5rem] overflow-hidden md:border backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-4 md:p-8 space-y-6 md:space-y-8 min-h-full transition-colors duration-300",
      isLight ? "bg-white border-slate-200 text-black shadow-slate-200/50" : "bg-[#130d08]/75 border-[#ebdcb9]/15 text-white"
    )}>
      
      {/* Ocean twilight ambiance background */}
      {!isLight && (
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center tracking-normal opacity-[0.05] mix-blend-overlay pointer-events-none"
        />
      )}
      <div className={cn(
        "absolute top-0 right-1/4 w-[400px] h-[350px] blur-[130px] rounded-full pointer-events-none -translate-y-20",
        isLight ? "bg-blue-100/30" : "bg-[#ebdcb9]/5"
      )} />

      {/* Header Banner */}
      <div className={cn(
        "relative rounded-[2.2rem] border p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 backdrop-blur-xl shrink-0 transition-all",
        isLight 
          ? "bg-gradient-to-r from-amber-50 to-blue-50 border-slate-100" 
          : "bg-gradient-to-r from-[#ebdcb9]/10 via-[#c5a880]/5 to-black/40 border-white/5"
      )}>
        <div>
          <span className={cn(
            "text-[10px] font-black tracking-[0.25em] uppercase px-2.5 py-1 rounded-full border shadow-sm inline-flex items-center gap-1.5 leading-none",
            isLight 
              ? "text-amber-700 bg-amber-50 border-amber-200" 
              : "text-[#ebdcb9] bg-[#ebdcb9]/10 border-[#ebdcb9]/20"
          )}>
            {isLiderOrAdmOrMestre ? '🛡️ SISTEMA DE PERMISSÕES & GESTÃO' : '👤 PERFIL DE USUÁRIO'}
          </span>
          <h2 className={cn(
            "text-3xl font-serif tracking-wide mt-2.5",
            isLight ? "text-slate-900" : "text-[#fbf8f2]"
          )}>
            Painel de Configurações
          </h2>
          <p className={cn("text-xs mt-1.5", isLight ? "text-slate-600" : "text-slate-400")}>
            {isLiderOrAdmOrMestre 
              ? 'Gerenciador de acessos, perfis, senhas e integridade do banco de dados.'
              : 'Altere sua foto de perfil, login de acesso e senha de segurança.'}
          </p>
        </div>

        {/* Quick Logged Avatar Card */}
        {currentUser && (
          <div className="flex items-center gap-4 bg-white/[0.02]/30 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
            <img 
              src={currentUser.avatarUrl || AVATARS[0]} 
              alt={currentUser.name} 
              className="w-11 h-11 rounded-xl object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              {/* Only Líder, ADM and Mestre can see role tags */}
              {isLiderOrAdmOrMestre && (
                <span className="text-[9px] font-black bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full block uppercase tracking-wider w-fit">
                  {currentUser.role}
                </span>
              )}
              <p className={cn("text-sm font-bold mt-0.5", isLight ? "text-slate-900" : "text-white")}>{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</p>
            </div>
            <button
              onClick={() => logout()}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer",
                isLight ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              )}
              title="Sair da Conta"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div className={`grid grid-cols-1 ${effectiveShowAdminSections ? 'lg:grid-cols-3' : 'max-w-2xl mx-auto'} gap-8`}>
        
        {/* User Settings Form */}
        <div className={cn(
          `${effectiveShowAdminSections ? 'lg:col-span-1' : 'w-full'} rounded-[2.2rem] border p-6 backdrop-blur-xl relative flex flex-col justify-between transition-all duration-300`,
          isLight ? "bg-slate-50 border-slate-200 shadow-slate-200/50" : "border-[#ebdcb9]/15 bg-black/20"
        )}>
          <div>
            <h3 className={cn(
              "text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3",
              isLight ? "text-slate-900 border-slate-200" : "text-white border-white/5"
            )}>
              <UserPlus className="w-5 h-5 text-purple-400 animate-pulse" />
              {(!effectiveShowAdminSections || isEditingSelf)
                ? 'Editar Meu Perfil' 
                : (editingUserId ? 'Editar Usuário' : 'Adicionar Usuário')}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {userError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs p-3 rounded-xl">
                  {userError}
                </div>
              )}
              {userSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  {userSuccess}
                </div>
              )}

              {/* Nome Completo - Visível para Líder/ADM ou qualquer um no mobile */}
              {(isLiderOrAdmOrMestre || isMobile) && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Ana Souza"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={cn(
                      "w-full border rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-purple-500/10 focus:outline-none transition-all",
                      isLight 
                        ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400" 
                        : "bg-slate-950/70 border-white/10 text-white placeholder-slate-600 focus:border-purple-500/40"
                    )}
                  />
                </div>
              )}

              {/* Login/Username - Todos os usuários podem editar o próprio login */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Login / Usuário (Letras minúsculas)</label>
                <input
                  type="text"
                  placeholder="Ex: ana.souza"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className={cn(
                    "w-full border rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-purple-500/10 focus:outline-none transition-all",
                    isLight 
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400" 
                      : "bg-slate-950/70 border-white/10 text-white placeholder-slate-600 focus:border-purple-500/40"
                  )}
                />
              </div>

              {/* Senha - Todos os usuários podem editar a própria senha */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Senha de Acesso</label>
                <input
                  type="text"
                  placeholder="Insira a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(
                    "w-full border rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-purple-500/10 focus:outline-none transition-all",
                    isLight 
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400" 
                      : "bg-slate-950/70 border-white/10 text-white placeholder-slate-600 focus:border-purple-500/40"
                  )}
                />
              </div>

              {/* Função / Nível de Acesso - Visível para ADM/Mestre, ou se não for mobile para Líderes */}
              {(isAdmOrMestre || (!isMobile && isLiderOrAdmOrMestre)) && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Função / Nível de Acesso</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    disabled={!canEditRoleField}
                    className="w-full bg-slate-950 border border-white/10 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMestreCurrentUser && <option value="MESTRE">Mestre</option>}
                    <option value="ADM">Administrador (ADM)</option>
                    <option value="LIDER">Líder de Equipe</option>
                    <option value="FUNCIONARIO_A">Funcionário A</option>
                    <option value="FUNCIONARIO_B">Funcionário B (Visualizador)</option>
                  </select>
                </div>
              )}

              {/* Predefined Avatars & Device Upload Picker */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                  <Image size={12} className="text-purple-400" /> Escolha uma Foto de Perfil
                </label>

                {/* Active Photo Preview */}
                <div className={cn("flex items-center gap-3.5 border rounded-2xl p-3 mb-3.5", isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950/40 border-white/5")}>
                  <div className={cn("relative w-12 h-12 rounded-xl overflow-hidden border bg-slate-950/80 shrink-0", isLight ? "border-slate-200" : "border-purple-500/30")}>
                    <img 
                      src={customAvatarUrl || newAvatar} 
                      alt="Pré-visualização" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-black tracking-wider text-purple-400 uppercase bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      FOTO SELECIONADA
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">Escolha abaixo ou envie do seu celular/computador.</p>
                  </div>
                </div>

                {/* Upload & Gallery Picker */}
                <div className="space-y-3">
                  {/* Device Upload */}
                  <div>
                    <label 
                      htmlFor="avatar-upload-file"
                      className={cn(
                        "flex items-center justify-center gap-2 w-full border font-bold text-[11px] py-2.5 px-3 rounded-xl cursor-pointer transition-all uppercase tracking-wider",
                        isLight ? "bg-slate-900 text-white border-slate-800" : "bg-slate-950 hover:bg-slate-900 border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-white"
                      )}
                    >
                      <Upload size={14} className="animate-bounce" style={{ animationDuration: '3s' }} />
                      Importar do Dispositivo
                    </label>
                    <input
                      type="file"
                      id="avatar-upload-file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] bg-white/5 flex-1" />
                    <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase shrink-0">Ou Galeria</span>
                    <div className="h-[1px] bg-white/5 flex-1" />
                  </div>

                  {/* Predefined gallery */}
                  <div className="grid grid-cols-6 gap-2">
                    {AVATARS.map((url, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setNewAvatar(url);
                          setCustomAvatarUrl('');
                        }}
                        className={`relative w-9 h-9 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          newAvatar === url && !customAvatarUrl
                            ? 'border-purple-400 shadow-md shadow-purple-500/20'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {newAvatar === url && !customAvatarUrl && (
                          <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white font-bold" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom URL link */}
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Ou cole o link de uma foto da web"
                      value={customAvatarUrl.startsWith('data:') ? '' : customAvatarUrl}
                      onChange={(e) => {
                        setCustomAvatarUrl(e.target.value);
                        if (e.target.value) {
                          setNewAvatar('');
                        }
                      }}
                      className={cn(
                        "w-full border rounded-xl px-3 py-2.5 text-[11px] focus:ring-1 focus:ring-purple-500/10 focus:outline-none transition-all",
                        isLight 
                          ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400" 
                          : "bg-slate-950/70 border border-white/5 text-white placeholder-slate-600 focus:border-purple-500/40"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {isLiderOrAdmOrMestre && editingUserId && editingUserId !== currentUser?.id ? (
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUserId(currentUser?.id || null);
                        if (currentUser) {
                          setNewUsername(currentUser.username);
                          setNewName(currentUser.name);
                          setNewPassword(currentUser.password || '');
                          setNewRole(currentUser.role);
                        }
                        setUserSuccess(null);
                        setUserError(null);
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition duration-200 tracking-wider uppercase cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs py-3 rounded-xl transition duration-200 tracking-wider uppercase shadow-md shadow-purple-500/10 cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl transition duration-200 tracking-wider uppercase shadow-lg shadow-purple-500/15 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    Salvar Alterações
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Registered Users List & Admin Tools */}
        {effectiveShowAdminSections && (
          <div className="lg:col-span-2 space-y-6">

            {/* Registered Users List */}
            <div className={cn(
              "rounded-[2.2rem] border p-6 backdrop-blur-xl relative transition-all duration-300",
              isLight ? "bg-slate-50 border-slate-200 shadow-slate-200/50" : "bg-slate-900/40 border-white/10"
            )}>
              <h3 className={cn(
                "text-lg font-bold mb-4 flex items-center justify-between border-b pb-3",
                isLight ? "text-slate-900 border-slate-200" : "text-white border-white/5"
              )}>
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Usuários Registrados
                </span>
                <span className="text-[10px] bg-purple-500/10 text-purple-300 font-mono px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  {visibleUsers.length} ATIVOS
                </span>
              </h3>

              <div className="overflow-y-auto max-h-[350px] space-y-3 pr-2 custom-scrollbar">
                {visibleUsers.map(u => {
                  const isJeff = u.username.toLowerCase() === 'jeff' || u.role === 'MESTRE' || u.id === 'user_jeff';
                  const isSelf = currentUser?.id === u.id;
                  const canBeDeleted = !isJeff && !isSelf;
                  const showPass = showPassMap[u.id] || false;

                  return (
                    <div 
                      key={u.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                        isLight ? "bg-white border-slate-100 hover:border-purple-300" : "bg-white/[0.015] border-white/5 hover:border-purple-500/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={u.avatarUrl || AVATARS[0]} 
                          alt={u.name} 
                          className={cn("w-12 h-12 rounded-xl object-cover border", isLight ? "border-slate-200" : "border-white/10")}
                          referrerPolicy="no-referrer"
                        />
                        
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn("font-bold truncate max-w-[150px]", isLight ? "text-slate-900" : "text-white")}>{u.name}</p>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 font-medium">
                            @{u.username}
                          </p>

                          {/* Password view */}
                          <div className={cn("flex items-center gap-2 mt-1 border rounded-lg px-2 py-1 w-fit", isLight ? "bg-slate-100 border-slate-200" : "bg-[#09090b] border-white/5")}>
                            <Key size={10} className="text-slate-500 shrink-0" />
                            <span className="text-[10px] text-slate-400 font-mono select-all">
                              {showPass ? u.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePassVisibility(u.id)}
                              className="text-slate-500 hover:text-slate-400 cursor-pointer ml-1"
                              title="Mostrar Senha"
                            >
                              {showPass ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* User Actions */}
                      <div className="flex items-center sm:justify-end gap-2 text-right">
                        {isSelf && (
                          <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20 font-bold">
                            Sua Conta
                          </span>
                        )}
                        
                        {isJeff && !isSelf ? (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 font-bold">
                            Imutável
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setNewUsername(u.username);
                              setNewName(u.name);
                              setNewPassword(u.password || '');
                              setNewRole(u.role);
                              if (AVATARS.includes(u.avatarUrl)) {
                                setNewAvatar(u.avatarUrl);
                                setCustomAvatarUrl('');
                              } else {
                                setCustomAvatarUrl(u.avatarUrl);
                                setNewAvatar('');
                              }
                              setUserError(null);
                              setUserSuccess(null);
                            }}
                            className={`p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-white hover:bg-purple-500 rounded-xl transition duration-200 cursor-pointer ${
                              editingUserId === u.id ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-500/30' : ''
                            }`}
                            title="Editar Usuário"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}

                        {canBeDeleted && isAdmOrMestre && (
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza de que deseja deletar permanentemente o usuário ${u.name}?`)) {
                                removeUser(u.id);
                              }
                            }}
                            className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition duration-200 cursor-pointer"
                            title="Excluir Usuário"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dangerous Reset Panel (ADM & Mestre only) */}
            {isAdmOrMestre && (
              <div className="rounded-[2.2rem] border border-rose-500/20 bg-rose-950/10 p-6 backdrop-blur-xl relative space-y-4">
                <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  Zerar Estoques e Dados (Ação Destrutiva)
                </h3>
                <p className="text-xs text-rose-200/80 leading-normal max-w-xl">
                  Esta opção limpa permanentemente todo o histórico de vendas, redefine todos os estoques individuais de biquínis e aviamentos no banco de dados sincronizado para zero. <strong>Esta ação não pode ser desfeita.</strong>
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/70 border border-rose-500/20 p-3 rounded-2xl max-w-lg">
                  <input
                    type="text"
                    placeholder="Digite ZERAR para confirmar"
                    value={confirmResetText}
                    onChange={(e) => setConfirmResetText(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-rose-300 font-mono tracking-wider focus:outline-none px-3 py-2 flex-1 placeholder-red-950"
                  />
                  <button
                    type="button"
                    onClick={handleResetStocks}
                    disabled={confirmResetText !== 'ZERAR'}
                    className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-950/50 disabled:text-rose-900/60 font-bold text-white text-xs px-4 py-2.5 rounded-xl transition duration-200 tracking-wider uppercase shadow-md shadow-rose-900/20 shrink-0 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '6s' }} />
                    Zerar Todos os Dados
                  </button>
                </div>

                {isResetSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs p-3.5 rounded-xl animate-fade-in">
                    Concluído: Todos os biquínis, aviamentos e histórico de relatórios foram reiniciados com sucesso!
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
