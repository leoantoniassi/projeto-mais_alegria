import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';

/* ─── Configuração das tabelas básicas ──────────────────────── */
const TABLES = [
  {
    key: 'funcoes',
    label: 'Funções',
    icon: 'engineering',
    color: 'tertiary',
    endpoint: '/lookup/funcoes',
    description: 'Cargos e funções dos colaboradores',
    placeholder: 'Ex: Recreador, Garçom, Cozinheiro...',
  },
  {
    key: 'categorias-fornecedor',
    label: 'Categorias de Fornecedor',
    icon: 'category',
    color: 'secondary',
    endpoint: '/lookup/categorias-fornecedor',
    description: 'Tipos de fornecedores parceiros',
    placeholder: 'Ex: Alimentos, Bebidas, Decoração...',
  },
  {
    key: 'categorias-produto',
    label: 'Categorias de Produto',
    icon: 'inventory_2',
    color: 'primary',
    endpoint: '/lookup/categorias-produto',
    description: 'Tipos de itens do estoque',
    placeholder: 'Ex: Alimento, Bebida, Descartável...',
  },
];

/* ─── Mapa de cores por tabela ──────────────────────────────── */
const colorMap = {
  tertiary:  { bg: 'bg-tertiary',   text: 'text-on-tertiary',   light: 'bg-tertiary/10',   textDark: 'text-tertiary',   shadow: 'shadow-tertiary/20',   ring: 'ring-tertiary/30',   border: 'border-tertiary/20' },
  secondary: { bg: 'bg-secondary',  text: 'text-on-secondary',  light: 'bg-secondary/10',  textDark: 'text-secondary',  shadow: 'shadow-secondary/20',  ring: 'ring-secondary/30',  border: 'border-secondary/20' },
  primary:   { bg: 'bg-primary',    text: 'text-on-primary',    light: 'bg-primary/10',    textDark: 'text-on-primary-container', shadow: 'shadow-primary/20', ring: 'ring-primary/30', border: 'border-primary/20' },
};

export default function CadastrosPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState(TABLES[0].key);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState({});
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [search, setSearch] = useState('');

  const activeTable = TABLES.find(t => t.key === activeTab);
  const colors = colorMap[activeTable.color];

  /* ─── Fetch items for a table ─────────────────────────────── */
  const fetchItems = useCallback(async (tableKey) => {
    const table = TABLES.find(t => t.key === tableKey);
    if (!table) return;
    setLoading(prev => ({ ...prev, [tableKey]: true }));
    try {
      const { data: res } = await api.get(table.endpoint);
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(prev => ({ ...prev, [tableKey]: list }));
    } catch {
      setItems(prev => ({ ...prev, [tableKey]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [tableKey]: false }));
    }
  }, []);

  /* ─── Fetch all tables on mount ───────────────────────────── */
  useEffect(() => {
    TABLES.forEach(t => fetchItems(t.key));
  }, [fetchItems]);

  /* ─── Save (create or update) ─────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`${activeTable.endpoint}/${editing}`, form);
      } else {
        await api.post(activeTable.endpoint, form);
      }
      setShowPanel(false);
      setEditing(null);
      setForm({ nome: '', descricao: '' });
      fetchItems(activeTab);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar');
    }
  };

  /* ─── Edit ────────────────────────────────────────────────── */
  const handleEdit = (item) => {
    setForm({ nome: item.nome, descricao: item.descricao || '' });
    setEditing(item.id);
    setShowPanel(true);
  };

  /* ─── Delete ──────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!(await confirm('Excluir este registro? Essa ação não pode ser desfeita.'))) return;
    try {
      await api.delete(`${activeTable.endpoint}/${id}`);
      fetchItems(activeTab);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao excluir. O registro pode estar em uso.');
    }
  };

  /* ─── Filter items by search ──────────────────────────────── */
  const currentItems = (items[activeTab] || []).filter(item =>
    item.nome?.toLowerCase().includes(search.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(search.toLowerCase())
  );

  /* ─── Open new panel ──────────────────────────────────────── */
  const openNew = () => {
    setEditing(null);
    setForm({ nome: '', descricao: '' });
    setShowPanel(true);
  };

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">Cadastros</h2>
          <p className="text-on-surface-variant font-medium">Gerencie as tabelas básicas do sistema.</p>
        </div>
        <button
          onClick={openNew}
          className={`inline-flex items-center gap-2 px-8 py-4 ${colors.bg} ${colors.text} rounded-full font-bold shadow-lg ${colors.shadow} hover:scale-[1.02] active:scale-[0.98] transition-all`}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Novo Registro
        </button>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────── */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-1 px-1">
        {TABLES.map(table => {
          const tc = colorMap[table.color];
          const isActive = activeTab === table.key;
          const count = (items[table.key] || []).length;
          return (
            <button
              key={table.key}
              onClick={() => { setActiveTab(table.key); setSearch(''); }}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? `${tc.bg} ${tc.text} shadow-lg ${tc.shadow}`
                  : 'bg-white border border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'filled' : ''}`}>{table.icon}</span>
              <span>{table.label}</span>
              <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                isActive ? 'bg-white/25' : 'bg-surface-container text-on-surface-variant'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Content Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-8">
        {/* ─── Sidebar ────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pesquisar</p>
            <input
              className="w-full bg-white border-none rounded-full py-3 px-5 focus:ring-2 focus:ring-primary text-sm"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={`${colors.bg} p-6 rounded-xl ${colors.text} relative overflow-hidden shadow-lg ${colors.shadow}`}>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">{activeTable.label}</p>
              <h3 className="text-4xl font-black mt-2">{currentItems.length}</h3>
              <p className="text-sm font-medium mt-1">Registros Cadastrados</p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10">{activeTable.icon}</span>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sobre</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">{activeTable.description}</p>
          </div>
        </div>

        {/* ─── Table ──────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white border border-surface-container-high rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Descrição</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {loading[activeTab] && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                        Carregando...
                      </td>
                    </tr>
                  )}
                  {!loading[activeTab] && currentItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-on-surface-variant">
                        <div className="flex flex-col items-center gap-3">
                          <span className={`material-symbols-outlined text-4xl ${colors.textDark} opacity-40`}>{activeTable.icon}</span>
                          <p>Nenhum registro encontrado.</p>
                          <button onClick={openNew} className={`text-sm font-bold ${colors.textDark} hover:underline`}>
                            + Adicionar primeiro registro
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading[activeTab] && currentItems.map(item => (
                    <tr key={item.id} className="group hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${colors.light} flex items-center justify-center ${colors.textDark} ring-2 ${colors.ring}`}>
                            <span className="material-symbols-outlined text-lg">{activeTable.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{item.nome}</p>
                            <p className="text-xs text-on-surface-variant">ID: #{String(item.id).slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface-variant">{item.descricao || '—'}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-on-surface-variant hover:text-tertiary transition-colors rounded-full hover:bg-tertiary/10"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          {user?.role !== 'operador' && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error/10"
                              title="Excluir"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-surface-container-low/30 flex items-center justify-between border-t border-surface-container-high">
              <p className="text-xs text-on-surface-variant font-medium">
                {currentItems.length} registro{currentItems.length !== 1 ? 's' : ''} encontrado{currentItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Slide-in Panel ──────────────────────────────────── */}
      {showPanel && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex justify-end fade-in" onClick={() => setShowPanel(false)}>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col slide-in-right rounded-l-3xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/30 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-headline font-extrabold">{editing ? 'Editar' : 'Novo'} Registro</h3>
                <p className="text-sm text-on-surface-variant mt-1">{activeTable.label}</p>
              </div>
              <button onClick={() => setShowPanel(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <form id="cadastro-form" className="space-y-6" onSubmit={handleSave}>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Nome *</label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    placeholder={activeTable.placeholder}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Descrição</label>
                  <textarea
                    className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-primary resize-none min-h-[120px]"
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    placeholder="Descrição opcional..."
                    rows={4}
                  />
                </div>
              </form>
            </div>
            <div className="p-8 bg-surface-container-low flex gap-4">
              <button onClick={() => setShowPanel(false)} className="flex-1 border-2 border-outline-variant text-on-surface-variant py-3.5 rounded-full font-bold">
                Cancelar
              </button>
              <button type="submit" form="cadastro-form" className={`flex-[2] ${colors.bg} ${colors.text} py-3.5 rounded-full font-bold shadow-xl ${colors.shadow}`}>
                {editing ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
