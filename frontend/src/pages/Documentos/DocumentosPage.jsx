import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function DocumentosPage() {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetchData = async () => {
    try {
      const { data: res } = await api.get('/documentos');
      const items = Array.isArray(res.data) ? res.data : [];
      setDocs(items);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('arquivo', file);
    setUploading(true);
    try {
      await api.post('/documentos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Erro no upload'); }
    finally { setUploading(false); }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/documentos/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'documento'; document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { alert('Erro ao baixar'); }
  };

  const handleDelete = async (id) => { if (!confirm('Excluir documento?')) return; try { await api.delete(`/documentos/${id}`); fetchData(); } catch (err) { alert(err.response?.data?.error || 'Erro'); } };

  const fileIcon = (tipo) => {
    if (tipo === 'pdf') return { icon: 'description', color: 'text-primary', bg: 'bg-primary/10' };
    if (tipo === 'jpg' || tipo === 'jpeg') return { icon: 'image', color: 'text-secondary', bg: 'bg-secondary/10' };
    return { icon: 'image', color: 'text-tertiary', bg: 'bg-tertiary/5' };
  };

  const typeBadgeColor = (tipo) => {
    if (tipo === 'pdf') return 'text-tertiary border-tertiary/20';
    if (tipo === 'jpg' || tipo === 'jpeg') return 'text-secondary border-secondary/20';
    return 'text-tertiary border-tertiary/20';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div><h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">Documentos</h2><p className="text-on-surface-variant">Gerencie contratos, orçamentos e arquivos de mídia.</p></div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-primary hover:bg-yellow-400 text-on-primary px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-60">
          <span className="material-symbols-outlined">upload</span> {uploading ? 'Enviando...' : 'Upload File'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined filled text-on-surface">picture_as_pdf</span></div>
          <div><p className="text-2xl font-bold">{docs.filter(d => d.tipoArquivo === 'pdf').length}</p><p className="text-xs text-on-surface-variant">Contratos PDF</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary"><span className="material-symbols-outlined filled">image</span></div>
          <div><p className="text-2xl font-bold">{docs.filter(d => d.tipoArquivo !== 'pdf').length}</p><p className="text-xs text-on-surface-variant">Mídias PNG/JPG</p></div>
        </div>
        <div className="md:col-span-2 bg-secondary-container p-6 rounded-xl border border-secondary/20 flex items-center justify-between">
          <div><h4 className="font-bold text-on-secondary-container">Total de Arquivos</h4><p className="text-xl font-bold text-on-secondary-container">{docs.length} documentos</p></div>
          <span className="material-symbols-outlined text-5xl text-secondary/30 filled">folder</span>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {docs.length === 0 && (
          <div className="col-span-full text-center py-12 text-on-surface-variant"><span className="material-symbols-outlined text-5xl text-outline/30 block mb-4">folder_off</span>Nenhum documento encontrado.</div>
        )}
        {docs.map((doc) => {
          const fi = fileIcon(doc.tipoArquivo);
          return (
            <div key={doc.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30">
              <div className={`aspect-[4/3] ${fi.bg} relative flex items-center justify-center overflow-hidden`}>
                <span className={`material-symbols-outlined text-6xl ${fi.color}`}>{fi.icon}</span>
                <div className="absolute bottom-3 left-3"><span className={`px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold ${typeBadgeColor(doc.tipoArquivo)} border uppercase`}>{doc.tipoArquivo}</span></div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-on-surface truncate mb-1">{doc.nomeArquivo}</h3>
                <div className="flex flex-col gap-1 mb-4">
                  {doc.Evento && <div className="flex items-center gap-2 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-sm">event</span><span>{doc.Evento.nome}</span></div>}
                  {doc.Cliente && <div className="flex items-center gap-2 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-sm">person</span><span>{doc.Cliente.nome}</span></div>}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDownload(doc.id)} className="p-2.5 hover:bg-primary/20 rounded-full text-tertiary transition-colors" title="Download"><span className="material-symbols-outlined">download</span></button>
                  </div>
                  <button onClick={() => handleDelete(doc.id)} className="p-2.5 hover:bg-error/10 rounded-full text-error transition-colors" title="Excluir"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drop Zone */}
      <div className="mt-16 bg-surface-container-low border-2 border-dashed border-primary/40 rounded-[2.5rem] p-12 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-primary/30">
          <span className="material-symbols-outlined text-4xl text-tertiary">upload_file</span>
        </div>
        <h3 className="text-xl font-bold mb-2 font-headline">Arraste arquivos aqui</h3>
        <p className="text-on-surface-variant max-w-sm mx-auto mb-8">Formatos aceitos: PDF, JPG, PNG (máx 10MB)</p>
        <button onClick={() => fileRef.current?.click()} className="bg-primary hover:bg-yellow-400 text-on-primary font-bold px-10 py-3 rounded-full shadow-lg shadow-primary/20 transition-all">Selecionar Arquivos</button>
      </div>
    </div>
  );
}
