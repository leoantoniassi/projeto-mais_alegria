import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', funcao: '' });

  const fetchData = async () => {
    try {
      const { data: res } = await api.get('/funcionarios', { params: { page, limit: 10, busca: search } });
      const items = Array.isArray(res.data) ? res.data : [];
      setFuncionarios(items);
      setTotal(res.pagination?.total || items.length);
    } catch {}
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/funcionarios/${editing}`, form);
      else await api.post('/funcionarios', form);
      setShowPanel(false); setEditing(null); setForm({ nome: '', email: '', telefone: '', funcao: '' }); fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Erro ao salvar'); }
  };

  const handleEdit = (f) => { setForm({ nome: f.nome, email: f.email, telefone: f.telefone, funcao: f.funcao }); setEditing(f.id); setShowPanel(true); };
  const handleDelete = async (id) => { if (!confirm('Excluir funcionário?')) return; try { await api.delete(`/funcionarios/${id}`); fetchData(); } catch (err) { alert(err.response?.data?.message || 'Erro'); } };
  const initials = (n) => (n || 'NA').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();

  const funcaoColor = (f) => {
    const m = { Recreador: 'bg-secondary/20 text-secondary', 'Garçom': 'bg-tertiary/10 text-tertiary', Cozinheiro: 'bg-primary/20 text-on-primary', 'Segurança': 'bg-error-container/30 text-error' };
    return m[f] || 'bg-surface-container text-on-surface-variant';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Colaboradores</h2>
          <p className="text-on-surface-variant font-medium">Gerencie sua equipe de festas e eventos.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ nome: '', email: '', telefone: '', funcao: '' }); setShowPanel(true); }} className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined">person_add</span> Novo Colaborador
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pesquisar</p>
            <input className="w-full bg-white border-none rounded-full py-3 px-5 focus:ring-2 focus:ring-primary text-sm" placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="bg-tertiary p-6 rounded-xl text-on-tertiary relative overflow-hidden shadow-lg shadow-tertiary/20">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Status do Time</p>
              <h3 className="text-4xl font-black mt-2">{total}</h3>
              <p className="text-sm font-medium mt-1">Colaboradores Ativos</p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10">celebration</span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white border border-surface-container-high rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome & Perfil</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Contato</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Função</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {funcionarios.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">Nenhum colaborador encontrado.</td></tr>}
                  {funcionarios.map((f) => (
                    <tr key={f.id} className="group hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-on-primary-container ring-2 ring-primary/20">{initials(f.nome)}</div>
                          <div><p className="font-bold text-on-surface">{f.nome}</p><p className="text-xs text-on-surface-variant">ID: #{String(f.id).slice(0, 8)}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><p className="text-sm font-medium text-on-surface">{f.email}</p><p className="text-xs text-on-surface-variant">{f.telefone}</p></td>
                      <td className="px-6 py-5"><span className={`px-3 py-1 ${funcaoColor(f.funcao)} text-xs font-bold rounded-full uppercase tracking-tight`}>{f.funcao}</span></td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleEdit(f)} className="p-2 text-on-surface-variant hover:text-tertiary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                        <button onClick={() => handleDelete(f.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-surface-container-low/30 flex items-center justify-between border-t border-surface-container-high">
              <p className="text-xs text-on-surface-variant font-medium">Mostrando {funcionarios.length} de {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-full bg-white border border-surface-container-high hover:bg-primary/10 transition-colors disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <button onClick={() => setPage(page + 1)} disabled={funcionarios.length < 10} className="p-2 rounded-full bg-white border border-surface-container-high hover:bg-primary/10 transition-colors disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPanel && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex justify-end fade-in" onClick={() => setShowPanel(false)}>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col slide-in-right rounded-l-3xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/30 flex justify-between items-start">
              <div><h3 className="text-2xl font-headline font-extrabold">{editing ? 'Editar' : 'Novo'} Colaborador</h3></div>
              <button onClick={() => setShowPanel(false)} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <form id="func-form" className="space-y-6" onSubmit={handleSave}>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Nome</label><input className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Email</label><input type="email" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Telefone</label><input className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Função</label>
                  <select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.funcao} onChange={e => setForm({...form, funcao: e.target.value})} required>
                    <option value="">Selecione...</option>
                    <option value="Recreador">Recreador</option>
                    <option value="Garçom">Garçom</option>
                    <option value="Cozinheiro">Cozinheiro</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Decorador">Decorador</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="p-8 bg-surface-container-low flex gap-4"><button onClick={() => setShowPanel(false)} className="flex-1 border-2 border-outline-variant text-on-surface-variant py-3.5 rounded-full font-bold">Cancelar</button><button type="submit" form="func-form" className="flex-[2] bg-primary text-on-primary py-3.5 rounded-full font-bold shadow-xl shadow-primary/30">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
