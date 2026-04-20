import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Star, Image as ImageIcon, RefreshCw, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface PortItem {
  _id: string; title: string; description?: string; serviceType: string;
  beforeImage?: { url: string }; afterImage?: { url: string };
  area?: number; duration?: string; location?: string; featured: boolean;
}
const SERVICES = [
  {v:'internal',l:'Pintura Interna'},{v:'external',l:'Pintura Externa'},{v:'texture',l:'Textura'},
  {v:'lacquering',l:'Laqueação'},{v:'waterproofing',l:'Impermeabilização'},{v:'restoration',l:'Restauração'},
];
const SVC_COLOR: Record<string,string> = {
  internal:'amber', external:'blue', texture:'orange',
  lacquering:'purple', waterproofing:'cyan', restoration:'yellow',
};
const EMPTY = { title:'', description:'', serviceType:'internal', area:'', duration:'', location:'', featured:false };

function ImgPicker({ label, preview, existing, onFile }: { label:string; preview:string|null; existing?:string; onFile:(f:File)=>void }) {
  const ref = useRef<HTMLInputElement>(null);
  const src = preview || existing;
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">{label}</p>
      <div onClick={() => ref.current?.click()}
        className="relative h-32 rounded-xl border-2 border-dashed border-white/10 hover:border-amber-500/40 bg-white/3 cursor-pointer overflow-hidden transition group">
        {src ? <img src={src} alt={label} className="w-full h-full object-cover" /> :
          <div className="flex flex-col items-center justify-center h-full gap-1.5 text-zinc-600 group-hover:text-zinc-400 transition">
            <Upload size={22}/><span className="text-xs">Clique para enviar</span>
          </div>}
        {src && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
          <Upload size={20} className="text-white"/>
        </div>}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>
    </div>
  );
}

export function Portfolio() {
  const [items, setItems]     = useState<PortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState<PortItem|null>(null);
  const [form, setForm]       = useState({...EMPTY});
  const [beforeFile, setBeforeFile] = useState<File|null>(null);
  const [afterFile, setAfterFile]   = useState<File|null>(null);
  const [beforePrev, setBeforePrev] = useState<string|null>(null);
  const [afterPrev, setAfterPrev]   = useState<string|null>(null);

  const load = async () => { setLoading(true); try { const r = await api.get('/portfolio'); setItems(r.data.portfolio||[]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({...EMPTY}); setBeforeFile(null); setAfterFile(null); setBeforePrev(null); setAfterPrev(null); setModal(true); };
  const openEdit   = (item: PortItem) => {
    setEditing(item);
    setForm({ title:item.title, description:item.description||'', serviceType:item.serviceType, area:String(item.area||''), duration:item.duration||'', location:item.location||'', featured:item.featured });
    setBeforeFile(null); setAfterFile(null); setBeforePrev(null); setAfterPrev(null);
    setModal(true);
  };

  const pickFile = (type:'before'|'after', f:File) => {
    const url = URL.createObjectURL(f);
    if (type==='before') { setBeforeFile(f); setBeforePrev(url); }
    else                 { setAfterFile(f);  setAfterPrev(url);  }
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Informe o título.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, String(v)));
      if (beforeFile) fd.append('before', beforeFile);
      if (afterFile)  fd.append('after',  afterFile);
      if (editing) await api.patch(`/portfolio/${editing._id}`, fd);
      else         await api.post('/portfolio', fd);
      toast.success(editing ? 'Item atualizado!' : 'Item criado!');
      setModal(false); load();
    } catch (e:any) { toast.error(e.response?.data?.message || 'Erro ao salvar.'); }
    finally { setSaving(false); }
  };

  const remove = async (item: PortItem) => {
    if (!confirm(`Excluir "${item.title}"?`)) return;
    try { await api.delete(`/portfolio/${item._id}`); toast.success('Excluído.'); load(); }
    catch { toast.error('Erro ao excluir.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Portfólio</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{items.length} projeto(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-white/5 border border-white/5 rounded-xl px-3 py-2 transition">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl px-4 py-2 text-sm transition">
            <Plus size={16} /> Novo item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:3}).map((_,i) => <div key={i} className="h-52 rounded-2xl bg-white/3 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111118] border border-white/5 rounded-2xl gap-3">
          <ImageIcon size={40} className="text-zinc-600" />
          <p className="text-zinc-400">Nenhum item no portfólio.</p>
          <button onClick={openCreate} className="bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl px-5 py-2.5 text-sm transition">Criar primeiro item</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const color = SVC_COLOR[item.serviceType] || 'amber';
            const thumb = item.afterImage?.url || item.beforeImage?.url;
            return (
              <div key={item._id} className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden group">
                <div className="relative h-36 bg-zinc-900">
                  {thumb ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="flex items-center justify-center h-full text-zinc-700"><ImageIcon size={32}/></div>}
                  {item.featured && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 rounded-full px-2 py-0.5 text-[10px] font-bold text-black">
                      <Star size={9} fill="currentColor"/> DESTAQUE
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-black/70 flex items-center justify-center hover:bg-white/20 transition">
                      <Pencil size={13} className="text-white"/>
                    </button>
                    <button onClick={() => remove(item)} className="w-8 h-8 rounded-lg bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition">
                      <Trash2 size={13} className="text-white"/>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <span className={`text-[10px] font-bold text-${color}-400 bg-${color}-500/10 px-2 py-0.5 rounded-full`}>
                    {SERVICES.find(s=>s.v===item.serviceType)?.l || item.serviceType}
                  </span>
                  <p className="font-bold text-white mt-2 leading-tight">{item.title}</p>
                  <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                    {item.area && <span>{item.area} m²</span>}
                    {item.duration && <span>{item.duration}</span>}
                    {item.location && <span>{item.location}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-xl bg-[#111118] border border-white/5 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#111118] z-10">
              <h3 className="font-bold text-white">{editing ? 'Editar Item' : 'Novo Item'}</h3>
              <button onClick={() => setModal(false)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Fotos */}
              <div className="grid grid-cols-2 gap-3">
                <ImgPicker label="Foto Antes" preview={beforePrev} existing={editing?.beforeImage?.url} onFile={(f) => pickFile('before', f)} />
                <ImgPicker label="Foto Depois" preview={afterPrev} existing={editing?.afterImage?.url} onFile={(f) => pickFile('after', f)} />
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Título *</label>
                <input value={form.title} onChange={(e) => setForm(f=>({...f,title:e.target.value}))}
                  placeholder="Ex: Sala de Estar Moderna"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/40 transition" />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm(f=>({...f,description:e.target.value}))}
                  placeholder="Descreva o projeto..." rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/40 transition resize-none" />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Tipo de Serviço *</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map(s => (
                    <button key={s.v} type="button" onClick={() => setForm(f=>({...f,serviceType:s.v}))}
                      className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition
                        ${form.serviceType===s.v ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/10 text-zinc-400 hover:border-white/20'}`}>
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-3 gap-3">
                {[{k:'area',l:'Área (m²)',p:'45'},{k:'duration',l:'Duração',p:'3 dias'},{k:'location',l:'Local',p:'Araçatuba, SP'}].map(f=>(
                  <div key={f.k}>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">{f.l}</label>
                    <input value={(form as any)[f.k]} onChange={(e) => setForm(fm=>({...fm,[f.k]:e.target.value}))}
                      placeholder={f.p}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/40 transition" />
                  </div>
                ))}
              </div>

              {/* Destaque */}
              <label className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl px-4 py-3 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-white">Marcar como Destaque</p>
                  <p className="text-xs text-zinc-500">Aparece em evidência na home do app</p>
                </div>
                <div onClick={() => setForm(f=>({...f,featured:!f.featured}))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>

              {/* Save */}
              <button onClick={save} disabled={saving}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition">
                {saving ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : null}
                {saving ? 'Salvando...' : (editing ? 'Atualizar Item' : 'Criar Item')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
