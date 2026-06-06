import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { User, Shield, Key, Eye, EyeOff, UserPlus, Trash2, RefreshCw, AlertTriangle, Image, Check, LogOut, Upload } from 'lucide-react';
import { UserRole } from '../types';

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Masculino 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 2
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Masculino 3
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 4
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Masculino 5
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', // Feminino 6
];

export function Configuracoes() {
  const { users, logs, currentUser, addUser, removeUser, resetAllStockToZero, logout } = useInventory();
  
  // States for adding user
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('FUNCIONARIO_A');
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);

  // States for dangerous system reset
  const [confirmResetText, setConfirmResetText] = useState('');
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  // State for visual password display
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});

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

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanName = newName.trim();
    const cleanPassword = newPassword.trim();

    if (!cleanUsername || !cleanName || !cleanPassword) {
      setUserError('Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (cleanUsername === 'jeff') {
      setUserError('O login "jeff" é exclusivo do Mestre e não pode ser recriado.');
      return;
    }

    // Check if user already exists
    const exists = users.find(u => u.username === cleanUsername);
    if (exists) {
      setUserError(`O login de usuário "@${cleanUsername}" já está em uso.`);
      return;
    }

    const finalAvatar = customAvatarUrl.trim() ? customAvatarUrl.trim() : newAvatar;

    addUser({
      username: cleanUsername,
      name: cleanName,
      password: cleanPassword,
      role: newRole,
      avatarUrl: finalAvatar
    });

    setUserSuccess(`Usuário ${cleanName} cadastrado com sucesso!`);
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setCustomAvatarUrl('');
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
    MESTRE: 'Mestre da Confecção',
    ADM: 'Administrador (ADM)',
    LIDER: 'Líder de Equipe',
    FUNCIONARIO_A: 'Funcionário A',
    FUNCIONARIO_B: 'Funcionário B (Visualizador)',
  };

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-950/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-white p-6 md:p-8 space-y-8 min-h-[600px]">
      
      {/* Ocean twilight ambiance */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center tracking-normal opacity-10 mix-blend-overlay pointer-events-none"
      />
      <div className="absolute top-0 right-1/4 w-[400px] h-[350px] bg-purple-500/10 blur-[130px] rounded-full pointer-events-none -translate-y-20" />

      {/* Configurations Page Header */}
      <div className="relative bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-slate-950/40 rounded-[2.2rem] border border-white/5 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 backdrop-blur-xl shrink-0">
        <div>
          <span className="text-[10px] font-black tracking-[0.25em] text-purple-400 uppercase bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 shadow-sm inline-flex items-center gap-1.5 leading-none">
            🛡️ SISTEMA DE PERMISSÕES
          </span>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200 tracking-tight mt-2.5">
            Configurações e Usuários
          </h2>
          <p className="text-slate-400 text-xs mt-1.5">Gerenciador de acessos, perfis, senhas e integridade do banco de dados.</p>
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
              <span className="text-[9px] font-black bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full block uppercase tracking-wider w-fit">
                {currentUser.role}
              </span>
              <p className="text-sm font-bold text-white mt-0.5">{currentUser.name}</p>
            </div>
            <button
              onClick={() => logout()}
              className="text-slate-400 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Add User Form */}
        <div className="lg:col-span-1 rounded-[2.2rem] border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl relative flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <UserPlus className="w-5 h-5 text-purple-400 animate-pulse" />
              Adicionar Usuário
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {userError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl">
                  {userError}
                </div>
              )}
              {userSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-3 rounded-xl">
                  {userSuccess}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Ana Souza"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/10 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              {/* Login/Username */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Login / Usuário (Letras minúsculas)</label>
                <input
                  type="text"
                  placeholder="Ex: ana.souza"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/10 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Senha</label>
                <input
                  type="text"
                  placeholder="Insira a senha inicial"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/10 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              {/* Role Select Group */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Função / Nível de Acesso</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-white/10 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ADM">Administrador (ADM)</option>
                  <option value="LIDER">Líder (Tudo menos Configurações)</option>
                  <option value="FUNCIONARIO_A">Funcionário A (Tudo menos Configurações)</option>
                  <option value="FUNCIONARIO_B">Funcionário B (Somente Leitura)</option>
                </select>
                <p className="text-[10px] text-slate-500 leading-normal mt-1">
                  Nota: A função <strong>Mestre</strong> é restrita apenas ao criador Jefferson e está oculta do formulário.
                </p>
              </div>

              {/* Predefined Avatars Picker */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                  <Image size={12} className="text-purple-400" /> Escolha uma Foto de Perfil
                </label>

                {/* Active Photo Preview */}
                <div className="flex items-center gap-3.5 bg-slate-950/40 border border-white/5 rounded-2xl p-3 mb-3.5">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-purple-500/30 bg-slate-950/80 shrink-0">
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

                {/* Import options */}
                <div className="space-y-3">
                  {/* Option A: Import from Device */}
                  <div>
                    <label 
                      htmlFor="avatar-upload-file"
                      className="flex items-center justify-center gap-2 w-full bg-slate-950 hover:bg-slate-900 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-white font-bold text-[11px] py-2.5 px-3 rounded-xl cursor-pointer transition-all uppercase tracking-wider"
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

                  {/* Option C: Paste Custom Link */}
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
                      className="w-full bg-slate-950/70 border border-white/5 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 rounded-xl px-3 py-2.5 text-[11px] text-white placeholder-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs py-3 rounded-xl transition duration-200 tracking-wider uppercase shadow-md shadow-purple-500/10 cursor-pointer"
              >
                Cadastrar Usuário
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Manage Users Lists & Dangerous buttons */}
        <div className="lg:col-span-2 space-y-6">

          {/* Users List Box */}
          <div className="rounded-[2.2rem] border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between border-b border-white/5 pb-3">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Usuários Registrados
              </span>
              <span className="text-[10px] bg-purple-500/10 text-purple-300 font-mono px-2.5 py-0.5 rounded-full border border-purple-500/20">
                {users.length} ATIVOS
              </span>
            </h3>

            <div className="overflow-y-auto max-h-[350px] space-y-3 pr-2 custom-scrollbar">
              {users.map(u => {
                const isJeff = u.username === 'jeff';
                const isSelf = currentUser?.id === u.id;
                const canBeDeleted = !isJeff && !isSelf;
                const showPass = showPassMap[u.id] || false;

                return (
                  <div 
                    key={u.id}
                    className="p-4 rounded-2xl bg-white/[0.015] border border-white/5 hover:border-purple-500/20 transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <img 
                        src={u.avatarUrl || AVATARS[0]} 
                        alt={u.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white truncate max-w-[150px]">{u.name}</p>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase ${
                            u.role === 'MESTRE' 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : u.role === 'ADM'
                              ? 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                              : u.role === 'LIDER'
                              ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                              : u.role === 'FUNCIONARIO_A'
                              ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                              : 'bg-slate-700/20 border-slate-600/30 text-slate-400'
                          }`}>
                            {roleLabels[u.role] || u.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">@{u.username}</p>

                        {/* Show Credentials */}
                        <div className="flex items-center gap-2 mt-1 bg-[#09090b] border border-white/5 rounded-lg px-2 py-1 w-fit">
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

                    {/* Delete option */}
                    <div className="flex items-center sm:justify-end gap-2 text-right">
                      {isSelf && (
                        <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20 font-bold">
                          Sua Conta
                        </span>
                      )}
                      {isJeff && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 font-bold">
                          Imutável
                        </span>
                      )}

                      {canBeDeleted && (
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

          {/* Moved Option: Zerar Estoques e Dados Panel */}
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
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-3.5 rounded-xl animate-fade-in">
                Concluído: Todos os biquínis, aviamentos e histórico de relatórios foram reiniciados com sucesso!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
