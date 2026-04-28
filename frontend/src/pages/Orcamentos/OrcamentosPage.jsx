import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ clienteId: '', valorTotal: 0, dataValidade: '', observacoes: '', produtos: [] });

  const fetchData = async () => {
    try {
      const { data: res } = await api.get('/orcamentos', { params: { page, limit: 10 } });
      const items = Array.isArray(res.data) ? res.data : [];
      setOrcamentos(items);
      setTotal(res.pagination?.total || items.length);
    } catch {}
  };

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => { api.get('/clientes').then(r => { const items = Array.isArray(r.data.data) ? r.data.data : []; setClientes(items); }).catch(() => {}); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/orcamentos/${editing}`, form);
      else await api.post('/orcamentos', form);
      setShowPanel(false); setEditing(null); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
  };

  const handleStatus = async (id, status) => {
    try { await api.patch(`/orcamentos/${id}/status`, { status }); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Erro'); }
  };

  const handleDelete = async (id) => { if (!confirm('Excluir orçamento?')) return; try { await api.delete(`/orcamentos/${id}`); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Erro'); } };

  const handleConfirm = async (id) => {
    if (!window.confirm('Você tem certeza que deseja confirmar este orçamento? Ele será convertido em um evento automaticamente.')) return;
    try {
      await api.post(`/orcamentos/${id}/confirmar`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao confirmar orçamento');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Você tem certeza que deseja rejeitar este orçamento? Ele será marcado como reprovado e removido.')) return;
    try {
      await api.post(`/orcamentos/${id}/rejeitar`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao rejeitar orçamento');
    }
  };

  const statusBadge = (s) => {
    const m = { aprovado: 'bg-secondary-container text-on-secondary-container', pendente: 'bg-primary-container text-on-primary-container', rejeitado: 'bg-error-container text-on-error-container', reprovado: 'bg-error-container text-on-error-container' };
    return m[s] || 'bg-surface-container text-on-surface-variant';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '';

  return (
    <div>
      <section className="flex justify-between items-end mb-10">
        <div><h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">Orçamentos</h2><p className="text-on-surface-variant">Gerencie propostas e negociações festivas.</p></div>
        <button onClick={() => { setEditing(null); setForm({ clienteId: '', valorTotal: 0, dataValidade: '', observacoes: '', produtos: [] }); setShowPanel(true); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform">
          <span className="material-symbols-outlined">add</span> Novo Orçamento
        </button>
      </section>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Table */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">
          <h3 className="text-xl font-bold mb-6 font-headline">Listagem</h3>
          <table className="w-full text-left">
            <thead><tr className="text-on-surface-variant text-xs uppercase tracking-widest font-bold"><th className="pb-4 px-4">Cliente</th><th className="pb-4 px-4">Validade</th><th className="pb-4 px-4">Valor Total</th><th className="pb-4 px-4">Status</th><th className="pb-4 px-4 text-right">Ações</th></tr></thead>
            <tbody>
              {orcamentos.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-on-surface-variant">Nenhum orçamento.</td></tr>}
              {orcamentos.map((o) => (
                <tr key={o.id} className="group hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                  <td className="py-4 px-4 font-semibold text-sm">{o.cliente?.nome || o.Cliente?.nome || '—'}</td>
                  <td className="py-4 px-4 text-sm opacity-80">{formatDate(o.dataValidade)}</td>
                  <td className="py-4 px-4 font-bold text-sm">R$ {Number(o.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(o.status)}`}>{o.status}</span></td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      {o.status === 'pendente' && <><button onClick={e => { e.stopPropagation(); handleConfirm(o.id); }} className="p-1.5 text-secondary hover:bg-secondary/10 rounded-full" title="Aprovar e Confirmar"><span className="material-symbols-outlined text-lg">check</span></button><button onClick={e => { e.stopPropagation(); handleReject(o.id); }} className="p-1.5 text-error hover:bg-error/10 rounded-full" title="Rejeitar"><span className="material-symbols-outlined text-lg">close</span></button></>}
                      <button onClick={e => { e.stopPropagation(); handleDelete(o.id); }} className="p-1.5 text-on-surface-variant hover:text-error rounded-full"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {selected ? (
            <div className="bg-tertiary text-on-tertiary p-6 rounded-2xl relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Detalhes</h3>
                <p className="text-sm opacity-80 mb-6">{selected.Cliente?.nome || 'Cliente'}</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2"><span>Valor Total</span><span className="font-bold text-primary">R$ {Number(selected.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2"><span>Validade</span><span className="font-bold">{formatDate(selected.dataValidade)}</span></div>
                  <div className="flex justify-between text-sm"><span>Status</span><span className="font-bold uppercase">{selected.status}</span></div>
                </div>
                {selected.observacoes && <p className="mt-4 text-sm opacity-80 italic">{selected.observacoes}</p>}
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>
          ) : (
            <div className="bg-surface-container-high rounded-2xl p-8 text-center"><span className="material-symbols-outlined text-5xl text-outline/30 mb-4">request_quote</span><p className="text-sm text-on-surface-variant">Selecione um orçamento</p></div>
          )}
        </div>
      </div>

      {/* Panel */}
      {showPanel && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex justify-end fade-in" onClick={() => setShowPanel(false)}>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col slide-in-right rounded-l-3xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/30 flex justify-between"><div><h3 className="text-2xl font-headline font-extrabold">Novo Orçamento</h3></div><button onClick={() => setShowPanel(false)} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button></div>
            <div className="flex-1 overflow-y-auto p-8">
              <form id="orc-form" className="space-y-6" onSubmit={handleSave}>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Cliente</label><select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.clienteId} onChange={e => setForm({...form, clienteId: e.target.value})} required><option value="">Selecione...</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Valor Total</label><input type="number" step="0.01" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.valorTotal} onChange={e => setForm({...form, valorTotal: +e.target.value})} required /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Validade</label><input type="date" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.dataValidade} onChange={e => setForm({...form, dataValidade: e.target.value})} required /></div>
                </div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Observações</label><textarea className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-primary resize-none" rows={3} value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} /></div>
              </form>
            </div>
            <div className="p-8 bg-surface-container-low flex gap-4"><button onClick={() => setShowPanel(false)} className="flex-1 border-2 border-outline-variant text-on-surface-variant py-3.5 rounded-full font-bold">Cancelar</button><button type="submit" form="orc-form" className="flex-[2] bg-secondary text-on-secondary py-3.5 rounded-full font-bold shadow-lg shadow-secondary/20">Salvar & Enviar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
