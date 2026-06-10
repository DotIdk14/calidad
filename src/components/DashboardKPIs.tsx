import { AuditRecord } from '../types';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line
} from 'recharts';
import { WeeklyHeatmapTable } from './WeeklyHeatmapTable';

interface KPIProps {
  data?: AuditRecord[];
  entityType: 'coordinators' | 'supervisors' | 'agents';
  weeks?: number[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function DashboardKPIs({ data = [], entityType, weeks }: KPIProps) {
  const totalAudits = data.length;
  
  // Calculate metrics
  const referidos = data.filter(r => r.ref === 'Si').length;
  const hibridoAplica = data.filter(r => r.hib_aplica).length;
  const motivadorIdentificado = data.filter(r => r.motiv_id === 'Si').length;
  
  const pctReferidos = totalAudits > 0 ? (referidos / totalAudits) * 100 : 0;
  const pctHibrido = hibridoAplica > 0 ? (data.filter(r => r.hib_oferto === 'Si').length / hibridoAplica) * 100 : 0;
  const pctMotivador = totalAudits > 0 ? (motivadorIdentificado / totalAudits) * 100 : 0;

  const nivelesCount = data.reduce((acc, curr) => {
    acc[curr.nivel] = (acc[curr.nivel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const nivelesData = Object.entries(nivelesCount).map(([name, value]) => ({ name, value }));

  const canalCount = data.reduce((acc, curr) => {
      const canal = curr.ac_canal || 'No definido';
      acc[canal] = (acc[canal] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);
  const canalData = Object.entries(canalCount).map(([name, value]) => ({ name, value }));

  const statusCount = data.reduce((acc, curr) => {
    const cats = curr.obj_cats || [];
    const status = cats.length > 0 && cats[0] !== 'Sin objeciones detectadas' ? 'Objetada' : 'Aprobada';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  const weeklyDataMap = data.reduce((acc, curr) => {
      const cats = curr.obj_cats || [];
      if(!acc[curr.semana]) acc[curr.semana] = { semana: curr.semana, total: 0, ok: 0 };
      acc[curr.semana].total += 1;
      if(cats.includes('Sin objeciones detectadas')) acc[curr.semana].ok += 1;
      return acc;
  }, {} as Record<number, { semana: number, total: number, ok: number }>);
  
  const weeklyData = Object.values(weeklyDataMap).map(d => ({
      ...d,
      efectividad: (d.ok / d.total) * 100
  })).sort((a,b) => a.semana - b.semana);

  const kpiCard = (title: string, value: string, sub: string = "") => (
    <div className="bg-[#111113] p-5 rounded-xl border border-white/5">
        <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{title}</h3>
        <p className="text-3xl font-light text-white leading-none">{value}</p>
        {sub && <p className="mt-2 text-[10px] text-slate-400 font-medium">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCard("Total Auditorías", totalAudits.toString())}
        {kpiCard("% Referidos", `${pctReferidos.toFixed(1)}%`, `${referidos} auditados`)}
        {kpiCard("% Híbrido", `${pctHibrido.toFixed(1)}%`, `${data.filter(r => r.hib_oferto === 'Si').length} ofertas`)}
        {kpiCard("% Motivador", `${pctMotivador.toFixed(1)}%`, `${motivadorIdentificado} casos`)}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111113] p-5 rounded-xl border border-white/5 h-64">
           <h3 className="text-sm font-semibold text-white mb-4">Estatus Auditoría</h3>
           <ResponsiveContainer width="100%" height="80%">
             <PieChart>
               <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                 {statusData.map((_, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />)}
               </Pie>
               <Tooltip contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
               <Legend wrapperStyle={{ fontSize: '10px' }} />
             </PieChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-[#111113] p-5 rounded-xl border border-white/5 h-64">
           <h3 className="text-sm font-semibold text-white mb-4">Canal de Contacto</h3>
           <ResponsiveContainer width="100%" height="80%">
             <BarChart data={canalData}>
               <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} />
               <YAxis stroke="#64748b" fontSize={10} axisLine={false} />
               <Tooltip contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
               <Bar dataKey="value" fill="#06b6d4" />
             </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-[#111113] p-5 rounded-xl border border-white/5 h-64">
           <h3 className="text-sm font-semibold text-white mb-4">Auditorías por Nivel</h3>
           <ResponsiveContainer width="100%" height="80%">
             <PieChart>
               <Pie data={nivelesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={false}>
                 {nivelesData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
               </Pie>
               <Tooltip contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
             </PieChart>
           </ResponsiveContainer>
        </div>

        <div className="col-span-1 lg:col-span-3 bg-[#111113] p-5 rounded-xl border border-white/5 h-64">
           <h3 className="text-sm font-semibold text-white mb-4">Tendencia Semanal de Efectividad</h3>
           <ResponsiveContainer width="100%" height="80%">
             <ComposedChart data={weeklyData}>
               <XAxis dataKey="semana" stroke="#64748b" fontSize={10} />
               <YAxis stroke="#64748b" fontSize={10} />
               <Tooltip contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
               <Bar dataKey="total" fill="#334155" />
               <Line type="monotone" dataKey="efectividad" stroke="#10b981" strokeWidth={2} dot={false} />
             </ComposedChart>
           </ResponsiveContainer>
        </div>
        
        <div className="col-span-1 lg:col-span-3">
           <h3 className="text-sm font-semibold text-white mb-4">Mapa de Calor Semanal</h3>
           <WeeklyHeatmapTable data={data} entityType={entityType} weeks={weeks} />
        </div>
      </div>
    </div>
  );
}
