import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, Wrench, TrendingUp, Star, RefreshCw } from 'lucide-react';
import api from '../api/axios';

interface Stats {
  totalBudgets: number; pendingBudgets: number;
  completedBudgets: number; inProgressBudgets: number;
  totalRevenue: number; avgRating: number;
}
interface Budget {
  _id: string; serviceType: string; status: string; createdAt: string;
  area: number; estimatedPrice?: number; finalPrice?: number;
  client?: { name: string; email: string };
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', quoted: 'Orçado', approved: 'Aprovado',
  in_progress: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400', quoted: 'bg-blue-500/15 text-blue-400',
  approved: 'bg-purple-500/15 text-purple-400', in_progress: 'bg-indigo-500/15 text-indigo-400',
  completed: 'bg-green-500/15 text-green-400', cancelled: 'bg-red-500/15 text-red-400',
};
const SERVICE_LABEL: Record<string, string> = {
  internal: 'Pintura Interna', external: 'Pintura Externa', texture: 'Textura',
  lacquering: 'Laqueação', waterproofing: 'Impermeabilização', restoration: 'Restauração',
};

function fmt(n: number) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export function Dashboard() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [recent, setRecent]   = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/users/admin/stats');
      setStats(r.data.stats);
      setRecent(r.data.recentBudgets || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cards = stats ? [
    { label: 'Total de Orçamentos', value: stats.totalBudgets,       icon: FileText,     color: 'amber'  },
    { label: 'Pendentes',           value: stats.pendingBudgets,      icon: Clock,        color: 'yellow' },
    { label: 'Em Andamento',        value: stats.inProgressBudgets,   icon: Wrench,       color: 'blue'   },
    { label: 'Concluídos',          value: stats.completedBudgets,    icon: CheckCircle,  color: 'green'  },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Dashboard</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Visão geral da empresa</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-3 py-2 transition">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({length:4}).map((_,i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/3 animate-pulse" />
        )) : cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-[#111118] border border-white/5 rounded-2xl p-4`}>
            <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
              <Icon size={17} className={`text-${color}-400`} />
            </div>
            <p className={`text-3xl font-black text-${color}-400`}>{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Rating */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Faturamento Total</p>
              <p className="text-2xl font-black text-white">{fmt(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Star size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Avaliação Média</p>
              <p className="text-2xl font-black text-white">{stats.avgRating?.toFixed(1) || '—'} <span className="text-base text-amber-400">★</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Recent budgets */}
      <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Orçamentos Recentes</h3>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">Nenhum orçamento ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium">Serviço</th>
                  <th className="text-left px-5 py-3 font-medium">Área</th>
                  <th className="text-left px-5 py-3 font-medium">Valor</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-200 font-medium">{b.client?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{SERVICE_LABEL[b.serviceType] || b.serviceType}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{b.area} m²</td>
                    <td className="px-5 py-3.5 text-zinc-300">{b.finalPrice ? fmt(b.finalPrice) : b.estimatedPrice ? fmt(b.estimatedPrice) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[b.status] || 'bg-zinc-700 text-zinc-300'}`}>
                        {STATUS_LABEL[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">{new Date(b.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
