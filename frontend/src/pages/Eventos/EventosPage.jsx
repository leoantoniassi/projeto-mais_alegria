import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState(null);
  
  // 1. Estado do filtro adicionado
  const [filtroLocal, setFiltroLocal] = useState('');
  const [form, setForm] = useState({ nome: '', dataEvento: '', local: '', clienteId: '', orcamentoId: '', qtdPessoas: 0, qtdAdultos: 0, qtdCriancas: 0, qtdBebes: 0, observacoes: '' });

  const fetchData = async () => {
    try {
      // 2. Parâmetro local adicionado à requisição
      const params = { page, limit: 10 };
      if (filtroLocal) params.local = filtroLocal;

      const { data: res } = await api.get('/eventos', { params });
      const items = Array.isArray(res.data) ? res.data : [];
      setEventos(items);
      setTotal(res.pagination?.total || items.length);
    } catch {}
  };

  // 3. fetchData agora reage a mudanças no filtroLocal
  useEffect(() => { fetchData(); }, [page, filtroLocal]);
  
  useEffect(() => {
    api.get('/clientes').then(r => { const items = Array.isArray(r.data.data) ? r.data.data : []; setClientes(items); }).catch(() => {});
    api.get('/orcamentos').then(r => { const items = Array.isArray(r.data.data) ? r.data.data : []; setOrcamentos(items); }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/eventos/${editing}`, form);
      else await api.post('/eventos', form);
      setShowPanel(false); setEditing(null); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
  };

  const handleDelete = async (id) => { if (!confirm('Excluir evento?')) return; try { await api.delete(`/eventos/${id}`); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Erro'); } };

  const statusBadge = (s) => {
    const m = { confirmado: 'bg-secondary-container text-on-secondary-container', pendente: 'bg-primary-container text-on-primary-container', planejamento: 'bg-primary-container text-on-primary-container', cancelado: 'bg-error-container text-on-error-container' };
    return m[s] || 'bg-surface-container-highest text-on-surface-variant';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <div><h2 className="text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Eventos</h2><p className="text-on-surface-variant max-w-lg">Gerencie a programação dos eventos e aloque equipes.</p></div>
        <button onClick={() => { setEditing(null); setForm({ nome: '', dataEvento: '', local: '', clienteId: '', orcamentoId: '', qtdPessoas: 0, qtdAdultos: 0, qtdCriancas: 0, qtdBebes: 0, observacoes: '' }); setShowPanel(true); }} className="flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
          <span className="material-symbols-outlined">add</span> Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Table */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl p-8 overflow-hidden shadow-sm">
            
            {/* Header e Filtro de Local */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-bold font-headline">Agenda de Eventos</h3>
              <select 
                className="bg-surface-container-low border-none rounded-full py-2 px-4 focus:ring-2 focus:ring-primary text-sm font-medium outline-none"
                value={filtroLocal}
                onChange={(e) => setFiltroLocal(e.target.value)}
              >
                <option value="">Todos os locais</option>
                <option value="salão 1">Salão 1</option>
                <option value="salão 2">Salão 2</option>
                <option value="externo">Externo</option>
              </select>
            </div>
            
            {/* Wrapper adicionado para responsividade no mobile (scroll horizontal) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-on-surface-variant text-[11px] uppercase tracking-widest border-b border-outline-variant">
                    <th className="pb-4 font-semibold px-2">Evento</th>
                    <th className="pb-4 font-semibold px-2">Data & Hora</th>
                    <th className="pb-4 font-semibold px-2">Local</th>
                    <th className="pb-4 font-semibold px-2">Cliente</th>
                    <th className="pb-4 font-semibold px-2">Status</th>
                    <th className="pb-4 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">Nenhum evento.</td></tr>}
                  {eventos.map((evt) => (
                    <tr key={evt.id} className="group hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => setSelectedEvento(evt)}>
                      <td className="py-5 px-2 font-bold text-on-surface">{evt.nome}</td>
                      <td className="py-5 px-2 text-sm">{formatDate(evt.dataEvento)} <span className="text-outline block text-[11px]">{formatTime(evt.dataEvento)}</span></td>
                      <td className="py-5 px-2 text-sm italic capitalize">{evt.local || '—'}</td>
                      <td className="py-5 px-2 text-sm">{evt.cliente?.nome || evt.Cliente?.nome || '—'}</td>
                      <td className="py-5 px-2"><span className={`px-3 py-1 ${statusBadge(evt.status)} rounded-full text-xs font-bold uppercase`}>{evt.status}</span></td>
                      <td className="py-5 px-2">
                        {/* Container Flex com Gap para espaçamento responsivo */}
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditing(evt.id); 
                            setForm({
                              nome: evt.nome || '',
                              dataEvento: evt.dataEvento ? new Date(new Date(evt.dataEvento).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
                              local: evt.local || '',
                              clienteId: evt.clienteId || '',
                              orcamentoId: evt.orcamentoId || '',
                              qtdPessoas: evt.qtdPessoas || 0,
                              qtdAdultos: evt.qtdAdultos || 0,
                              qtdCriancas: evt.qtdCriancas || 0,
                              qtdBebes: evt.qtdBebes || 0,
                              observacoes: evt.observacoes || ''
                            });
                            setShowPanel(true);
                          }} className="text-outline hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(evt.id); }} className="text-outline hover:text-error transition-colors">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {selectedEvento ? (
            <div className="bg-tertiary text-on-tertiary rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2 block">Evento Selecionado</span>
                <h3 className="text-3xl font-extrabold leading-tight mb-4">{selectedEvento.nome}</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary filled">location_on</span><p className="text-sm font-medium capitalize">{selectedEvento.local || '—'}</p></div>
                  <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary filled">calendar_today</span><p className="text-sm font-medium">{formatDate(selectedEvento.dataEvento)} • {formatTime(selectedEvento.dataEvento)}</p></div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-70">Público</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center"><p className="text-2xl font-black">{selectedEvento.qtdAdultos || 0}</p><p className="text-[10px] opacity-80">Adultos</p></div>
                    <div className="text-center border-x border-white/20"><p className="text-2xl font-black text-primary">{selectedEvento.qtdCriancas || 0}</p><p className="text-[10px] opacity-80">Crianças</p></div>
                    <div className="text-center"><p className="text-2xl font-black">{selectedEvento.qtdBebes || 0}</p><p className="text-[10px] opacity-80">Bebês</p></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full" />
            </div>
          ) : (
            <div className="bg-surface-container-high rounded-3xl p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-outline/30 mb-4">event</span>
              <p className="text-sm text-on-surface-variant">Clique em um evento para ver detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel */}
      {showPanel && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex justify-end fade-in" onClick={() => setShowPanel(false)}>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col slide-in-right rounded-l-3xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/30 flex justify-between"><div><h3 className="text-2xl font-headline font-extrabold">{editing ? 'Editar Evento' : 'Novo Evento'}</h3></div><button onClick={() => setShowPanel(false)} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button></div>
            <div className="flex-1 overflow-y-auto p-8">
              <form id="evt-form" className="space-y-5" onSubmit={handleSave}>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Nome do Evento</label><input className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Data e Hora</label><input type="datetime-local" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.dataEvento} onChange={e => setForm({...form, dataEvento: e.target.value})} required /></div>
                  
                  {/* Seleção de Local */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Local</label>
                    <select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.local} onChange={e => setForm({...form, local: e.target.value})} required>
                      <option value="">Selecione o local...</option>
                      <option value="salão 1">Salão 1</option>
                      <option value="salão 2">Salão 2</option>
                      <option value="externo">Externo</option>
                    </select>
                  </div>

                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Cliente</label><select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.clienteId} onChange={e => setForm({...form, clienteId: e.target.value})} required><option value="">Selecione...</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Orçamento</label><select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.orcamentoId} onChange={e => setForm({...form, orcamentoId: e.target.value})}><option value="">Nenhum</option>{orcamentos.map(o => <option key={o.id} value={o.id}>R$ {o.valorTotal} - {o.status}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Total</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdPessoas || ''} onChange={e => setForm({...form, qtdPessoas: e.target.value ? Number(e.target.value) : 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Adultos</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdAdultos || ''} onChange={e => setForm({...form, qtdAdultos: e.target.value ? Number(e.target.value) : 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Crianças</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdCriancas || ''} onChange={e => setForm({...form, qtdCriancas: e.target.value ? Number(e.target.value) : 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Bebês</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdBebes || ''} onChange={e => setForm({...form, qtdBebes: e.target.value ? Number(e.target.value) : 0})} />
                  </div>
                </div>
                
                {/* Observações Dinâmicas */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">
                    Observações {form.local === 'externo' && '(Digite o endereço do local externo)'}
                  </label>
                  <textarea 
                    className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-primary resize-none" 
                    rows={3} 
                    placeholder={form.local === 'externo' ? "Ex: Rua das Flores, 123..." : ""}
                    value={form.observacoes} 
                    onChange={e => setForm({...form, observacoes: e.target.value})} 
                  />
                </div>
                
              </form>
            </div>
            <div className="p-8 bg-surface-container-low flex gap-4"><button onClick={() => setShowPanel(false)} className="flex-1 border-2 border-outline-variant text-on-surface-variant py-3.5 rounded-full font-bold">Cancelar</button><button type="submit" form="evt-form" className="flex-[2] bg-primary text-on-primary py-3.5 rounded-full font-bold shadow-xl shadow-primary/30">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}