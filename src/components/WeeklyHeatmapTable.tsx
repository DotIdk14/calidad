import { useMemo } from 'react';
import { AuditRecord } from '../types';

interface Props {
  data: AuditRecord[];
  entityType: 'coordinators' | 'supervisors' | 'agents';
  weeks?: number[];
}

export function WeeklyHeatmapTable({ data = [], entityType, weeks: overrideWeeks }: Props) {
  const entityKey = entityType === 'coordinators' ? 'coord' : entityType === 'supervisors' ? 'sup' : 'agt';

  const { entities, weeks, dataMap } = useMemo(() => {
    const dataMap: Record<string, Record<number, { ok: number, total: number }>> = {};
    const entitiesSet = new Set<string>();
    let minWeek = Infinity;
    let maxWeek = -Infinity;

    data.forEach(row => {
      const entity = row[entityKey] || 'Sin definir';
      const week = row.semana;
      entitiesSet.add(entity);
      
      if (week < minWeek) minWeek = week;
      if (week > maxWeek) maxWeek = week;

      if (!dataMap[entity]) dataMap[entity] = {};
      if (!dataMap[entity][week]) dataMap[entity][week] = { ok: 0, total: 0 };

      dataMap[entity][week].total += 1;
      if (row.obj_cats.includes('Sin objeciones detectadas')) {
        dataMap[entity][week].ok += 1;
      }
    });

    let allWeeks: number[] = [];
    if (overrideWeeks) {
      allWeeks = overrideWeeks;
    } else if (minWeek !== Infinity) {
      for (let i = minWeek; i <= maxWeek; i++) {
        allWeeks.push(i);
      }
    }

    return {
      entities: Array.from(entitiesSet).sort(),
      weeks: allWeeks,
      dataMap
    };
  }, [data, entityKey, overrideWeeks]);

  return (
    <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-white/5 text-slate-400">
          <tr>
            <th className="px-4 py-3 sticky left-0 bg-[#151518] z-10">Agente</th>
            {weeks.map(week => (
              <th key={week} className="px-2 py-3 text-center min-w-[50px]">SEM {week}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03] text-slate-300">
          {entities.map(entity => (
            <tr key={entity} className="hover:bg-white/[0.02]">
              <td className="px-4 py-2 sticky left-0 bg-[#111113] font-medium text-white truncate max-w-[200px]">{entity}</td>
              {weeks.map(week => {
                const stat = dataMap[entity][week];
                const effectiveness = stat ? (stat.ok / stat.total) * 100 : null;
                
                let bgColor = 'bg-transparent';
                if (effectiveness !== null) {
                   bgColor = effectiveness >= 60 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300';
                }

                return (
                  <td key={week} className={`px-2 py-2 text-center text-xs ${bgColor}`}>
                    {effectiveness !== null ? `${effectiveness.toFixed(0)}%` : 'Sin auditoría'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
