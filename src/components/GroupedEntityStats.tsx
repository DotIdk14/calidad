import { useState, useMemo, useEffect } from 'react';
import { AuditRecord } from '../types';
import { DashboardKPIs } from './DashboardKPIs';
import { TablaAuditorias } from './TablaAuditorias';
import { WeeklyHeatmapTable } from './WeeklyHeatmapTable';

interface Props {
    data: AuditRecord[];
    entityType: 'coordinators' | 'supervisors' | 'agents';
}

export function GroupedEntityStats({ data, entityType }: Props) {
    const key = entityType === 'coordinators' ? 'coord' : entityType === 'supervisors' ? 'sup' : 'agt';
    
    // Grouping
    const grouped = data.reduce((acc, curr) => {
        const entity = curr[key as keyof AuditRecord] as string || 'Sin definir';
        if (!acc[entity]) acc[entity] = [];
        acc[entity].push(curr);
        return acc;
    }, {} as Record<string, AuditRecord[]>);

    const allWeeks = useMemo(() => {
        const weeks = new Set(data.map(r => r.semana));
        const sorted = Array.from(weeks).sort((a: number, b: number) => a-b);
        if (sorted.length === 0) return [];
        const min = sorted[0] as number;
        const max = sorted[sorted.length-1] as number;
        const result = [];
        for(let i=min; i<=max; i++) result.push(i);
        return result;
    }, [data]);
    
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'kpi' | 'table' | 'heatmap'>('kpi');

    useEffect(() => {
        if (selectedEntity && !grouped[selectedEntity]) {
            setSelectedEntity(null);
        }
    }, [grouped, selectedEntity]);

    const handleSelectEntity = (entity: string) => {
        setSelectedEntity(entity);
        setActiveTab('kpi');
    }

    return (
        <div className="grid grid-cols-4 gap-6 h-full">
            <div className="col-span-1 bg-[#111113] p-4 rounded-xl border border-white/5 overflow-y-auto max-h-[70vh]">
                <h3 className="text-sm font-semibold text-white mb-4 capitalize">{entityType}</h3>
                <div className="space-y-1">
                    {Object.keys(grouped).sort().map(entity => (
                        <button key={entity} onClick={() => handleSelectEntity(entity)} className={`w-full text-left px-3 py-2 text-sm rounded-md ${selectedEntity === entity ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {entity}
                        </button>
                    ))}
                </div>
            </div>
            <div className="col-span-3 overflow-y-auto max-h-[70vh]">
                {selectedEntity ? (
                    <>
                        <div className="flex gap-4 mb-6">
                            <button onClick={() => setActiveTab('kpi')} className={`pb-2 text-sm ${activeTab === 'kpi' ? 'text-white border-b-2 border-emerald-500 font-medium' : 'text-slate-500 hover:text-white'}`}>Métricas</button>
                            <button onClick={() => setActiveTab('table')} className={`pb-2 text-sm ${activeTab === 'table' ? 'text-white border-b-2 border-emerald-500 font-medium' : 'text-slate-500 hover:text-white'}`}>Tabla Detallada</button>
                        </div>
                        {activeTab === 'kpi' ? (
                             <DashboardKPIs data={grouped[selectedEntity] || []} entityType={entityType} weeks={allWeeks} />
                        ) : (
                             <TablaAuditorias data={grouped[selectedEntity] || []} />
                        )}
                    </>
                ) : (
                    <div className="text-center text-slate-500 mt-20 text-sm">Seleccione una entidad</div>
                )}
            </div>
        </div>
    );
}
