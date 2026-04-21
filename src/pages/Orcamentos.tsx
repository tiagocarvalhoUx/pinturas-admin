import { useEffect, useState } from 'react';
import { RefreshCw, X, ChevronDown, MapPin, Ruler, Calendar, DollarSign, MessageSquare, Image as ImgIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Budget {
  _id: string; serviceType: string; status: string; description: string;
  area: number; phone?: string; estimatedPrice?: number; finalPrice?: number;
  scheduledDate?: string; completedDate?: string; adminNotes?: string;
  createdAt: string; photos?: { url: string }[];
  address: { street?: string; city: string; state: string; zipCode?: string };
  client?: { name: string; email: string; phone?: string };
  rating?: { stars: number; comment?: string };
}

const STATUSES = [
  { v: 'pending',     l: 'Pendente',      c: 'yellow' },
  { v: 'quoted',      l: 'Orçado',        c: 'blue'   },
  { v: 'approved',    l: 'Aprovado',      c: 'purple' },
  { v: 'in_progress', l: 'Em andamento',  c: 'indigo' },
  { v: 'completed',   l: 'Concluído',     c: 'green'  },
  { v: 'cancelled',   l: 'Cancelado',     c: 'red'    },
];
const SVC: Record<string,string> = {
  internal:'Pintura Interna', external:'Pintura Externa', texture:'Textura',
  lacquering:'Laqueação', waterproofing:'Impermeabilização', restoration:'Restauração',
};
const SC: Record<string,string> = {
  pending:'bg-yellow-500/15 text-yellow-400', quoted:'bg-blue-500/15 text-blue-400',
  approved:'bg-purple-500/15 text-purple-400', in_progress:'bg-indigo-500/15 text-indigo-400',
  completed:'bg-green-500/15 text-green-400', cancelled:'bg-red-500/15 text-red-400',
};
function fmt(n: number) { return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

export function Orcamentos() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [selected, setSelected] = useState<Budget|null>(null);
  const [saving, setSaving]   = useState(false);
  const [patch, setPatch]     = useState<{ status: string; finalPrice: string; adminNotes: string; scheduledDate: string }>({
    status:'', finalPrice:'', adminNotes:'', scheduledDate:''
  });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/budgets'); setBudgets(r.data.budgets||[]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const open = (b: Budget) => {
    setSelected(b);
    setPatch({ status: b.status, finalPrice: String(b.finalPrice||''), adminNotes: b.adminNotes||'', scheduledDate: b.scheduledDate ? b.scheduledDate.slice(0,10) : '' });
  };

  const remove = async () => {
    if (!selected) return;
    if (!confirm(`Excluir o orçamento de "${selected.client?.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/budgets/${selected._id}`);
      toast.success('Orçamento excluído.');
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Erro ao excluir.'); }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const body: any = { status: patch.status, adminNotes: patch.adminNotes };
      if (patch.finalPrice) body.finalPrice = Number(patch.finalPrice);
      if (patch.scheduledDate) body.scheduledDate = patch.scheduledDate;
      await api.patch(`/budgets/${selected._id}`, body);
      toast.success('Orçamento atualizado!');
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Erro.'); }
    finally { setSaving(false); }
  };

  const filtered = filter === 'all' ? budgets : budgets.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Orçamentos</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{filtered.length} resultado(s)</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-300 outline-none cursor-pointer">
            <option value="all">Todos</option>
            {STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
          <button onClick={load} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-white/5 border border-white/5 rounded-xl px-3 py-2 transition">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? <div className="py-12 text-center text-zinc-500 text-sm">Carregando...</div>
        : filtered.length === 0 ? <div className="py-12 text-center text-zinc-500 text-sm">Nenhum orçamento encontrado.</div>
        : (
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
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b._id} className="border-b border-white/3 hover:bg-white/2 transition-colors cursor-pointer" onClick={() => open(b)}>
                    <td className="px-5 py-3.5 font-medium text-zinc-200">{b.client?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{SVC[b.serviceType] || b.serviceType}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{b.area} m²</td>
                    <td className="px-5 py-3.5 text-zinc-300">{b.finalPrice ? fmt(b.finalPrice) : b.estimatedPrice ? fmt(b.estimatedPrice) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SC[b.status]||'bg-zinc-700 text-zinc-300'}`}>
                        {STATUSES.find(s=>s.v===b.status)?.l||b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">{new Date(b.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3.5 text-zinc-600"><ChevronDown size={14} className="-rotate-90"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-[#111118] border border-white/5 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#111118] z-10">
              <div>
                <h3 className="font-bold text-white">{SVC[selected.serviceType]} — {selected.client?.name}</h3>
                <p className="text-xs text-zinc-500">#{selected._id.slice(-8)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Ruler, label:'Área', val:`${selected.area} m²` },
                  { icon: MapPin, label:'Local', val:`${selected.address.city}, ${selected.address.state}` },
                  { icon: DollarSign, label:'Estimativa', val: selected.estimatedPrice ? fmt(selected.estimatedPrice) : '—' },
                  { icon: Calendar, label:'Data', val: new Date(selected.createdAt).toLocaleDateString('pt-BR') },
                ].map(({icon:Icon,label,val}) => (
                  <div key={label} className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500"><Icon size={12}/><span className="text-[10px] uppercase font-semibold tracking-wide">{label}</span></div>
                    <p className="text-sm font-semibold text-zinc-200">{val}</p>
                  </div>
                ))}
              </div>

              {/* Descrição */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2 text-zinc-500"><MessageSquare size={12}/><span className="text-[10px] uppercase font-semibold tracking-wide">Descrição do cliente</span></div>
                <p className="text-sm text-zinc-300 leading-relaxed">{selected.description}</p>
              </div>

              {/* Fotos */}
              {selected.photos && selected.photos.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-zinc-500"><ImgIcon size={12}/><span className="text-[10px] uppercase font-semibold tracking-wide">Fotos ({selected.photos.length})</span></div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selected.photos.map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noreferrer" className="shrink-0">
                        <img src={p.url} alt="" className="h-20 w-20 rounded-xl object-cover border border-white/10 hover:border-amber-500/40 transition" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              {selected.rating?.stars && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-400 mb-1">Avaliação do cliente</p>
                  <div className="flex gap-0.5 mb-1">{Array.from({length:5}).map((_,i)=><span key={i} className={i<selected.rating!.stars?'text-amber-400':'text-zinc-700'}>★</span>)}</div>
                  {selected.rating.comment && <p className="text-sm text-zinc-300">{selected.rating.comment}</p>}
                </div>
              )}

              {/* Edit fields */}
              <div className="border-t border-white/5 pt-5 space-y-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Atualizar orçamento</p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Status</label>
                  <select value={patch.status} onChange={(e) => setPatch(p=>({...p,status:e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 transition">
                    {STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Valor Final (R$)</label>
                    <input type="number" value={patch.finalPrice} onChange={(e) => setPatch(p=>({...p,finalPrice:e.target.value}))}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/40 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Data Agendada</label>
                    <input type="date" value={patch.scheduledDate} onChange={(e) => setPatch(p=>({...p,scheduledDate:e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 transition [color-scheme:dark]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Notas internas</label>
                  <textarea value={patch.adminNotes} onChange={(e) => setPatch(p=>({...p,adminNotes:e.target.value}))}
                    placeholder="Observações, detalhes do serviço..."
                    rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/40 transition resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={remove}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl px-4 py-3 transition">
                    <Trash2 size={15}/> Excluir
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition">
                    {saving ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : null}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
