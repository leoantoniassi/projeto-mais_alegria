import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useConfirm } from "../../contexts/ConfirmContext";

export default function EventosPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState(null);

  // Filtros
  const [filtroLocal, setFiltroLocal] = useState("");
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    dataEvento: "",
    localId: "",
    clienteId: "",
    orcamentoId: "",
    orcamento: "",
    qtdPessoas: 0,
    qtdAdultos: 0,
    qtdCriancas: 0,
    qtdBebes: 0,
    observacoes: "",
  });

  const fetchData = async () => {
    try {
      const params = { page, limit: 10 };
      if (filtroLocal) params.localId = filtroLocal;
      if (mostrarConcluidos) params.incluirConcluidos = "true";

      const { data: res } = await api.get("/eventos", { params });
      const items = Array.isArray(res.data) ? res.data : [];
      setEventos(items);
      setTotal(res.pagination?.total || items.length);
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, [page, filtroLocal, mostrarConcluidos]);

  useEffect(() => {
    api
      .get("/clientes")
      .then((r) => {
        const items = Array.isArray(r.data.data) ? r.data.data : [];
        setClientes(items);
      })
      .catch(() => {});
    api
      .get("/orcamentos")
      .then((r) => {
        const items = Array.isArray(r.data.data) ? r.data.data : [];
        setOrcamentos(items);
      })
      .catch(() => {});
    api
      .get("/locais?limit=100")
      .then((r) => {
        const items = Array.isArray(r.data.data) ? r.data.data : [];
        setLocais(items);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/eventos/${editing}`, form);
      else await api.post("/eventos", form);
      setShowPanel(false);
      setEditing(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Erro");
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm("Excluir evento?"))) return;
    try {
      await api.delete(`/eventos/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Erro");
    }
  };

  const handleWhatsApp = async (id) => {
    try {
      const { data: res } = await api.get(`/eventos/${id}/whatsapp`);
      window.open(res.data?.link || res.url, '_blank');
    } catch (err) {
      alert('Erro ao abrir o WhatsApp');
    }
  };

  const statusBadge = (s) => {
    const m = {
      confirmado: "bg-secondary-container text-on-secondary-container",
      pendente: "bg-primary-container text-on-primary-container",
      planejamento: "bg-primary-container text-on-primary-container",
      cancelado: "bg-error-container text-on-error-container",
      concluido: "bg-secondary-container text-on-secondary-container",
    };
    return m[s] || "bg-surface-container text-on-surface-variant";
  };

  const parseDate = (d) => {
    if (!d) return null;
    // Para datas DATEONLY (ex: "2026-05-02"), evita deslocamento de fuso
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [year, month, day] = d.split('-');
      return new Date(year, month - 1, day);
    }
    return new Date(d);
  };

  const formatDate = (d) => {
    const date = parseDate(d);
    return date
      ? date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";
  };
  const formatTime = (d) => {
    const date = parseDate(d);
    return date
      ? date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  };

  return (
    <div>
      <section className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            Eventos
          </h2>
          <p className="text-on-surface-variant">
            Gerencie a programação dos eventos e aloque equipes.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              nome: "",
              dataEvento: "",
              localId: "",
              clienteId: "",
              orcamentoId: "",
              orcamento: "",
              qtdPessoas: 0,
              qtdAdultos: 0,
              qtdCriancas: 0,
              qtdBebes: 0,
              observacoes: "",
            });
            setShowPanel(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform"
        >
          <span className="material-symbols-outlined">add</span> Novo Evento
        </button>
      </section>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Table */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30">

          {/* Header e Filtros */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-bold font-headline">Agenda de Eventos</h3>
            <div className="flex items-center gap-3">
              {/* Filtro de concluídos */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mostrarConcluidos}
                  onChange={(e) => setMostrarConcluidos(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm font-medium text-on-surface-variant">Concluídos</span>
              </label>
              <select
                className="bg-surface-container-low border-none rounded-full py-2 px-4 focus:ring-2 focus:ring-primary text-sm font-medium outline-none"
                value={filtroLocal}
                onChange={(e) => setFiltroLocal(e.target.value)}
              >
                <option value="">Todos os locais</option>
                {locais.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(loc => <option key={loc.id} value={loc.id}>{loc.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">
                  <th className="pb-4 px-4">Evento</th>
                  <th className="pb-4 px-4">Data & Hora</th>
                  <th className="pb-4 px-4">Local</th>
                  <th className="pb-4 px-4">Cliente</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {eventos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      Nenhum evento.
                    </td>
                  </tr>
                )}
                {eventos.map((evt) => (
                  <tr
                    key={evt.id}
                    className="group hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => setSelectedEvento(evt)}
                  >
                    <td className="py-4 px-4 font-semibold text-sm">{evt.nome}</td>
                    <td className="py-4 px-4 text-sm">
                      {formatDate(evt.dataEvento)}{" "}
                      <span className="text-outline block text-[11px]">
                        {formatTime(evt.dataEvento)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm capitalize">{evt.local?.nome || evt.local || "—"}</td>
                    <td className="py-4 px-4 text-sm">{evt.cliente?.nome || evt.Cliente?.nome || "—"}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(evt.status)}`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsApp(evt.id);
                          }}
                          className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:scale-110 transition-all shadow-md shadow-secondary/20 mr-1"
                          title="WhatsApp"
                        >
                          <span className="material-symbols-outlined text-sm filled">chat</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(evt.id);
                            setForm({
                              nome: evt.nome || "",
                              dataEvento: evt.dataEvento
                                ? new Date(
                                    new Date(evt.dataEvento).getTime() -
                                      new Date().getTimezoneOffset() * 60000,
                                  )
                                    .toISOString()
                                    .slice(0, 16)
                                : "",
                              localId: evt.localId || evt.local?.id || "",
                              clienteId: evt.clienteId || "",
                              orcamentoId: evt.orcamentoId || "",
                              orcamento: evt.valorOrcamento || "",
                              qtdPessoas: evt.qtdPessoas || 0,
                              qtdAdultos: evt.qtdAdultos || 0,
                              qtdCriancas: evt.qtdCriancas || 0,
                              qtdBebes: evt.qtdBebes || 0,
                              observacoes: evt.observacoes || "",
                            });
                            setShowPanel(true);
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-full transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        {user?.role !== "operador" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(evt.id);
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-error rounded-full"
                            title="Excluir"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {selectedEvento ? (
            <div className="bg-tertiary text-on-tertiary p-6 rounded-2xl relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Detalhes do Evento</h3>
                <p className="text-sm opacity-80 mb-6">{selectedEvento.nome}</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span>Local</span>
                    <span className="font-bold capitalize">{selectedEvento.local?.nome || selectedEvento.local || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span>Data</span>
                    <span className="font-bold">
                      {formatDate(selectedEvento.dataEvento)} • {formatTime(selectedEvento.dataEvento)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span>Cliente</span>
                    <span className="font-bold">{selectedEvento.cliente?.nome || selectedEvento.Cliente?.nome || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                    <span>Status</span>
                    <span className="font-bold uppercase">{selectedEvento.status}</span>
                  </div>
                  {selectedEvento.valorOrcamento > 0 && (
                    <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                      <span>Orçamento</span>
                      <span className="font-bold text-primary">
                        R$ {Number(selectedEvento.valorOrcamento).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Público</span>
                    <span className="font-bold">
                      {(selectedEvento.qtdAdultos || 0) + (selectedEvento.qtdCriancas || 0) + (selectedEvento.qtdBebes || 0)} pessoas
                    </span>
                  </div>
                </div>
                {selectedEvento.observacoes && (
                  <p className="mt-4 text-sm opacity-80 italic">{selectedEvento.observacoes}</p>
                )}
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>
          ) : (
            <div className="bg-surface-container-high rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-outline/30 mb-4">event</span>
              <p className="text-sm text-on-surface-variant">Selecione um evento</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel */}
      {showPanel && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex justify-end fade-in" onClick={() => setShowPanel(false)}>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col slide-in-right rounded-l-3xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/30 flex justify-between">
              <div><h3 className="text-2xl font-headline font-extrabold">{editing ? "Editar Evento" : "Novo Evento"}</h3></div>
              <button onClick={() => setShowPanel(false)} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <form id="evt-form" className="space-y-6" onSubmit={handleSave}>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Nome do Evento</label>
                  <input className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Data e Hora</label>
                    <input type="datetime-local" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.dataEvento} onChange={e => setForm({ ...form, dataEvento: e.target.value })} required />
                  </div>

                  {/* Seleção de Local */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Local</label>
                    <select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.localId} onChange={e => setForm({ ...form, localId: e.target.value })} required>
                      <option value="">Selecione o local...</option>
                      {locais.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(loc => <option key={loc.id} value={loc.id}>{loc.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Cliente</label>
                    <select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })} required>
                      <option value="">Selecione...</option>
                      {clientes.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Orçamento (R$)</label>
                    <input type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.orcamento} onChange={e => setForm({ ...form, orcamento: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Vincular Orçamento (opcional)</label>
                  <select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.orcamentoId} onChange={e => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                      const orc = orcamentos.find(o => o.id === selectedId);
                      setForm({ ...form, orcamentoId: selectedId, orcamento: orc ? orc.valorTotal : form.orcamento });
                    } else {
                      setForm({ ...form, orcamentoId: "" });
                    }
                  }}>
                    <option value="">Nenhum</option>
                    {orcamentos.slice().sort((a, b) => Number(a.valorTotal) - Number(b.valorTotal)).map(o => <option key={o.id} value={o.id}>R$ {o.valorTotal} - {o.status}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Total</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdPessoas || ""} onChange={e => setForm({ ...form, qtdPessoas: e.target.value ? Number(e.target.value) : 0 })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Adultos</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdAdultos || ""} onChange={e => setForm({ ...form, qtdAdultos: e.target.value ? Number(e.target.value) : 0 })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Crianças</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdCriancas || ""} onChange={e => setForm({ ...form, qtdCriancas: e.target.value ? Number(e.target.value) : 0 })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Bebês</label>
                    <input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3 px-4 focus:ring-2 focus:ring-primary text-center" placeholder="0" value={form.qtdBebes || ""} onChange={e => setForm({ ...form, qtdBebes: e.target.value ? Number(e.target.value) : 0 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Observações</label>
                  <textarea className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-primary resize-none" rows={3} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="p-8 bg-surface-container-low flex gap-4">
              <button type="button" onClick={() => setShowPanel(false)} className="flex-1 border-2 border-outline-variant text-on-surface-variant py-3.5 rounded-full font-bold">Cancelar</button>
              <button type="submit" form="evt-form" className="flex-[2] bg-primary text-on-primary py-3.5 rounded-full font-bold shadow-lg shadow-primary/20">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
