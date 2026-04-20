import { useEffect, useState } from 'react';
import { RefreshCw, Shield, ShieldOff, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface User { _id: string; name: string; email: string; phone?: string; role: string; isActive: boolean; createdAt: string; avatar?: string }

export function Usuarios() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      // Busca via endpoint admin (orçamentos têm client populado — workaround para listar users)
      // Usa endpoint de stats que retorna budgets com clients, ou podemos tentar GET /users via admin
      const r = await api.get('/users/admin/list').catch(() => null);
      if (r) { setUsers(r.data.users || []); return; }
      // Fallback: extrai clientes únicos dos orçamentos
      const rb = await api.get('/budgets');
      const map = new Map<string, User>();
      (rb.data.budgets || []).forEach((b: any) => {
        if (b.client?._id) map.set(b.client._id, b.client);
      });
      setUsers(Array.from(map.values()));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setRole = async (email: string, role: 'admin'|'client') => {
    try {
      await api.patch('/users/admin/set-role', { email, role });
      toast.success(`${email} agora é ${role === 'admin' ? 'Admin' : 'Cliente'}.`);
      setUsers(u => u.map(x => x.email === email ? {...x, role} : x));
    } catch (e: any) { toast.error(e.response?.data?.message || 'Erro.'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Usuários</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{users.length} usuário(s) encontrado(s)</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-white/5 border border-white/5 rounded-xl px-3 py-2 transition">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full bg-[#111118] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-amber-500/30 transition" />
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? <div className="py-12 text-center text-zinc-500 text-sm">Carregando...</div>
        : filtered.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            {users.length === 0 ? 'Nenhum usuário encontrado. Os usuários aparecem após criarem orçamentos.' : 'Nenhum resultado para a busca.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Usuário</th>
                  <th className="text-left px-5 py-3 font-medium">E-mail</th>
                  <th className="text-left px-5 py-3 font-medium">Telefone</th>
                  <th className="text-left px-5 py-3 font-medium">Função</th>
                  <th className="text-left px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id || u.email} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {u.avatar
                          ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover"/>
                          : <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <span className="text-amber-400 font-bold text-sm">{u.name?.[0]?.toUpperCase() || '?'}</span>
                            </div>
                        }
                        <span className="font-medium text-zinc-200">{u.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">{u.email}</td>
                    <td className="px-5 py-3.5 text-zinc-500">{u.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role === 'admin' ? (
                        <button onClick={() => setRole(u.email, 'client')}
                          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-lg px-2.5 py-1.5 transition">
                          <ShieldOff size={12}/> Revogar admin
                        </button>
                      ) : (
                        <button onClick={() => setRole(u.email, 'admin')}
                          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 rounded-lg px-2.5 py-1.5 transition">
                          <Shield size={12}/> Tornar admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {users.length === 0 && !loading && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
          <p className="font-semibold mb-1">Como ver todos os usuários?</p>
          <p className="text-amber-300/70">Usuários aparecem aqui conforme realizam orçamentos. Para listar todos, adicione o endpoint <code className="bg-amber-500/20 px-1 rounded">GET /api/users/admin/list</code> no backend.</p>
        </div>
      )}
    </div>
  );
}
