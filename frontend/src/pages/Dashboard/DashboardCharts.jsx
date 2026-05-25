import { useState, useEffect } from 'react';
import { 
  ScatterChart, Scatter, 
  AreaChart, Area, 
  BarChart, Bar, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';

const PIE_COLORS = ['#FEDC57', '#4F46E5', '#10B981', '#F43F5E', '#8B5CF6'];

export default function DashboardCharts() {
  const [data, setData] = useState({ scatter: [], timeSeries: [], infra: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/charts').then(res => {
      setData(res.data?.data || { scatter: [], timeSeries: [], infra: [] });
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-on-surface-variant">Carregando gráficos...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Gráfico Temporal (Sazonalidade) */}
      <div className="bg-white p-6 rounded-3xl editorial-shadow border border-outline-variant/10 w-full h-[350px]">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Sazonalidade Anual</h3>
        {data.timeSeries.length === 0 ? (
          <div className="flex h-full items-center justify-center text-on-surface-variant">Sem dados para exibir</div>
        ) : (
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEventos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="mes" tick={{fill: '#71717A', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#71717A', fontSize: 12}} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="eventos" name="Eventos" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorEventos)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 2. Gráfico de Barras (Uso da Infraestrutura) */}
      <div className="bg-white p-6 rounded-3xl editorial-shadow border border-outline-variant/10 w-full h-[350px]">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Uso da Infraestrutura</h3>
        {data.infra.length === 0 ? (
          <div className="flex h-full items-center justify-center text-on-surface-variant">Sem dados para exibir</div>
        ) : (
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data.infra} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{fill: '#71717A', fontSize: 11}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#71717A', fontSize: 12}} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                formatter={(value) => [`${value} eventos`, 'Quantidade']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" name="Quantidade" radius={[8, 8, 0, 0]}>
                {data.infra.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 3. Gráfico de Dispersão (Convidados x Custo) */}
      <div className="bg-white p-6 rounded-3xl editorial-shadow border border-outline-variant/10 w-full h-[350px]">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Correlação: Convidados x Custo Total</h3>
        {data.scatter.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-on-surface-variant p-6 text-center">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">link_off</span>
            <p className="text-sm">Para exibir este gráfico, certifique-se de cadastrar eventos preenchendo a <b>quantidade de pessoas</b> e vinculando a um <b>orçamento</b>.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="80%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis type="number" dataKey="convidados" name="Convidados" tick={{fill: '#71717A', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis type="number" dataKey="custo" name="Custo Total" unit=" R$" tick={{fill: '#71717A', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-surface-container-highest text-on-surface p-3 rounded-xl shadow-lg border border-outline-variant/20">
                        <p className="font-bold">{d.nome}</p>
                        <p className="text-sm">Convidados: {d.convidados}</p>
                        <p className="text-sm text-primary font-bold">Custo: R$ {d.custo.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Festas" data={data.scatter} fill="#FEDC57" fillOpacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
