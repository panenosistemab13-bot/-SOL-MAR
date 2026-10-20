import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types';
import { 
  User, 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Trash2, 
  AlertTriangle, 
  Check, 
  LogOut, 
  Edit2
} from 'lucide-react';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
];

export function MobileConfiguracoes() {
  const { users, currentUser, addUser, removeUser, resetAllStockToZero, logout } = useInventory();

  // User form states
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('FUNCIONARIO_A');
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isAddingUserMode, setIsAddingUserMode] = useState(false);

  // Reset zone
  const [confirmResetText, setConfirmResetText] = useState('');
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const isAdmOrMestre = currentUser?.role === 'MESTRE' || currentUser?.role === 'ADM';

  const handleStartEdit = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    setEditingUserId(target.id);
    setNewUsername(target.username);
    setNewName(target.name);
    setNewPassword(target.password || '');
    setNewRole(target.role);
    setNewAvatar(target.avatarUrl || AVATARS[0]);
    setIsAddingUserMode(true);
    setUserError(null);
    setUserSuccess(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    if (!newUsername.trim() || !newName.trim()) {
      setUserError('Preencha nome e login.');
      return;
    }

    try {
      addUser({
        id: editingUserId || undefined,
        username: newUsername.trim().toLowerCase(),
        name: newName.trim(),
        role: newRole,
        avatarUrl: newAvatar,
        password: newPassword.trim() || undefined
      });

      setUserSuccess(editingUserId ? 'Perfil atualizado com sucesso!' : 'Usuário criado com sucesso!');
      setEditingUserId(null);
      setIsAddingUserMode(false);
      setNewUsername('');
      setNewName('');
      setNewPassword('');
    } catch (err: any) {
      setUserError(err.message || 'Erro ao salvar usuário.');
    }
  };

  const handleExecuteReset = () => {
    if (confirmResetText !== 'ZERAR ESTOQUE') {
      alert('Digite exatamente "ZERAR ESTOQUE" para confirmar.');
      return;
    }
    resetAllStockToZero();
    setIsResetSuccess(true);
    setConfirmResetText('');
    setTimeout(() => setIsResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 pb-6 select-none font-sans">
      {/* Title */}
      <div className="px-1">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#D6AD62] uppercase block">
          MINHA CONTA & AJUSTES
        </span>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Perfil de Acesso
        </h2>
      </div>

      {/* Current User Profile Card in Black & Gold */}
      <div className="p-4 rounded-2xl bg-[#171511] border border-[#D6AD62]/30 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D6AD62] shadow-md shrink-0">
            <img 
              src={currentUser?.avatarUrl || AVATARS[0]} 
              alt={currentUser?.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white truncate">
                {currentUser?.name}
              </span>
              <span className="text-[9px] font-bold text-[#D6AD62] bg-[#D6AD62]/15 border border-[#D6AD62]/30 px-1.5 py-0.5 rounded-md shrink-0">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-[11px] text-[#F5F0E7]/70 font-mono mt-0.5">
              @{currentUser?.username}
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="p-2.5 rounded-xl bg-black/40 text-[#D6AD62] border border-[#D6AD62]/30 hover:text-white hover:border-white transition-all active:scale-95 shrink-0"
          title="Desconectar"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Edit Profile / Change Password Trigger */}
      <div className="p-4 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-black/40 border border-[#D6AD62]/30 flex items-center justify-center text-[#D6AD62]">
              <Key size={14} />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Credenciais & Senha
            </h2>
          </div>
          <button
            onClick={() => currentUser && handleStartEdit(currentUser.id)}
            className="text-xs font-bold text-[#D6AD62] flex items-center gap-1 hover:underline"
          >
            <Edit2 size={12} /> Editar Perfil
          </button>
        </div>
      </div>

      {/* User Management Section (For Admins) */}
      {isAdmOrMestre && (
        <div className="p-4 rounded-2xl bg-[#171511] border border-[#D6AD62]/20 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-black/40 border border-[#D6AD62]/30 flex items-center justify-center text-[#D6AD62]">
                <Shield size={14} />
              </div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Equipe Sol & Mar ({users.length})
              </h2>
            </div>
            <button
              onClick={() => {
                setEditingUserId(null);
                setNewUsername('');
                setNewName('');
                setNewPassword('');
                setNewRole('FUNCIONARIO_A');
                setIsAddingUserMode(!isAddingUserMode);
              }}
              className="text-xs font-bold text-[#D6AD62] flex items-center gap-1 hover:underline"
            >
              <UserPlus size={13} /> {isAddingUserMode ? 'Fechar' : 'Novo'}
            </button>
          </div>

          {/* User Form (Drawer) */}
          {isAddingUserMode && (
            <form onSubmit={handleSaveUser} className="p-4 rounded-2xl bg-black/50 border border-[#D6AD62]/30 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {editingUserId ? 'Editar Usuário' : 'Cadastrar Novo Membro'}
              </span>

              {userError && (
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                  {userError}
                </div>
              )}
              {userSuccess && (
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                  {userSuccess}
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-[#D6AD62] uppercase font-bold block mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full bg-[#171511] border border-[#D6AD62]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#F5F0E7]/30 focus:outline-none focus:border-[#D6AD62]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#D6AD62] uppercase font-bold block mb-1">
                    Login de Acesso
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Ex: maria"
                    className="w-full bg-[#171511] border border-[#D6AD62]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#F5F0E7]/30 focus:outline-none focus:border-[#D6AD62]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#D6AD62] uppercase font-bold block mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Deixe em branco para manter atual"
                      className="w-full bg-[#171511] border border-[#D6AD62]/30 rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder-[#F5F0E7]/30 focus:outline-none focus:border-[#D6AD62]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#D6AD62]"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {currentUser?.role === 'MESTRE' && (
                  <div>
                    <label className="text-[10px] text-[#D6AD62] uppercase font-bold block mb-1">
                      Cargo / Função
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full bg-[#171511] border border-[#D6AD62]/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D6AD62]"
                    >
                      <option value="FUNCIONARIO_A">Funcionário(a) Padrão</option>
                      <option value="FUNCIONARIO_B">Apenas Leitura</option>
                      <option value="LIDER">Líder de Equipe</option>
                      <option value="ADM">Administrador</option>
                      <option value="MESTRE">Mestre do Sistema</option>
                    </select>
                  </div>
                )}

                {/* Avatar Choice */}
                <div>
                  <label className="text-[10px] text-[#D6AD62] uppercase font-bold block mb-1">
                    Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setNewAvatar(av)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition-all ${
                          newAvatar === av ? 'border-[#D6AD62] scale-110 shadow-md' : 'border-white/20 opacity-60'
                        }`}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUserMode(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#D6AD62]/30 text-[#F5F0E7] text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D6AD62] to-[#F3D99B] text-[#0B0A08] text-xs font-bold shadow"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          {/* User List */}
          <div className="divide-y divide-[#D6AD62]/10">
            {users.map(u => {
              const isSelf = u.id === currentUser?.id;
              return (
                <div key={u.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={u.avatarUrl || AVATARS[0]} 
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#D6AD62]/40 shrink-0" 
                    />
                    <div className="truncate">
                      <p className="text-white font-bold truncate leading-tight">
                        {u.name} {isSelf && <span className="text-[9px] text-[#D6AD62]">(Você)</span>}
                      </p>
                      <p className="text-[10px] text-[#F5F0E7]/60 font-mono">
                        @{u.username} • <span className="text-[#D6AD62]">{u.role}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(u.id)}
                      className="p-1.5 text-[#D6AD62] hover:text-white"
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    {!isSelf && u.role !== 'MESTRE' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Excluir o usuário ${u.name}?`)) {
                            removeUser(u.id);
                          }
                        }}
                        className="p-1.5 text-red-400 hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dangerous Reset Zone (For Mestre) */}
      {currentUser?.role === 'MESTRE' && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-400" />
            <h2 className="text-xs font-bold text-red-200 tracking-wide uppercase">
              Zona de Perigo: Zerar Estoque
            </h2>
          </div>
          <p className="text-[11px] text-red-200/80 leading-relaxed">
            Esta ação zera imediatamente todas as quantidades de estoque de biquínis e insumos no banco de dados.
          </p>

          {isResetSuccess && (
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
              Estoque zerado com sucesso!
            </div>
          )}

          <div className="space-y-2">
            <input
              type="text"
              value={confirmResetText}
              onChange={(e) => setConfirmResetText(e.target.value)}
              placeholder="Digite: ZERAR ESTOQUE"
              className="w-full bg-black/60 border border-red-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-red-300/30 focus:outline-none focus:border-red-400"
            />
            <button
              onClick={handleExecuteReset}
              disabled={confirmResetText !== 'ZERAR ESTOQUE'}
              className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow"
            >
              Confirmar Reinicialização de Estoque
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
