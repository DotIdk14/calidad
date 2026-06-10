/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import data from './data/auditorias.json';
import { AuditData } from './types';
import { DashboardKPIs } from './components/DashboardKPIs';
import { TablaAuditorias } from './components/TablaAuditorias';
import { GroupedEntityStats } from './components/GroupedEntityStats';

const rawData = data as AuditData;

export default function App() {
  const [selectedCoord, setSelectedCoord] = useState<string>('All');
  const [selectedSup, setSelectedSup] = useState<string>('All');
  const [selectedAgt, setSelectedAgt] = useState<string>('All');

  const filteredData = useMemo(() => {
    return rawData.rows.filter(row => {
      const matchCoord = selectedCoord === 'All' || row.coord === selectedCoord;
      const matchSup = selectedSup === 'All' || row.sup === selectedSup;
      const matchAgt = selectedAgt === 'All' || (row.agt && row.agt === selectedAgt);
      return matchCoord && matchSup && matchAgt;
    });
  }, [selectedCoord, selectedSup, selectedAgt]);

  const uniqueCoords = useMemo(() => ['All', ...Array.from(new Set(rawData.rows.map(r => r.coord)))], []);
  const uniqueSups = useMemo(() => {
    const sups = selectedCoord === 'All' 
        ? rawData.rows.map(r => r.sup)
        : rawData.rows.filter(r => r.coord === selectedCoord).map(r => r.sup);
    return ['All', ...Array.from(new Set(sups))];
  }, [selectedCoord]);
  
  const uniqueAgts = useMemo(() => {
    const agts = selectedSup === 'All'
        ? (selectedCoord === 'All' ? rawData.rows.map(r => r.agt).filter(Boolean) : rawData.rows.filter(r => r.coord === selectedCoord).map(r => r.agt).filter(Boolean))
        : rawData.rows.filter(r => r.sup === selectedSup).map(r => r.agt).filter(Boolean);
    return ['All', ...Array.from(new Set(agts))];
  }, [selectedCoord, selectedSup]);

  const [activeTab, setActiveTab] = useState<'kpi' | 'table'>('kpi');
  const [viewMode, setViewMode] = useState<'dashboard' | 'coordinators' | 'supervisors' | 'agents'>('dashboard');

  const allWeeks = useMemo(() => {
     const weeks = new Set(filteredData.map(r => r.semana));
     const sorted = Array.from(weeks).sort((a: number, b: number) => a-b);
     if (sorted.length === 0) return [];
     const min = sorted[0] as number;
     const max = sorted[sorted.length-1] as number;
     const result = [];
     for(let i=min; i<=max; i++) result.push(i);
     return result;
  }, [filteredData]);
  
  return (
    <div className="flex h-screen bg-[#09090B] text-slate-300 font-sans overflow-hidden">
      <aside className="w-64 bg-[#020617] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-emerald-500 mb-8">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
            <span className="font-bold tracking-tight text-white text-lg">AUDIT PRO</span>
          </div>
          <nav className="space-y-6">
             <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 ml-2">Menú</div>
                <div className="space-y-1">
                    {(['dashboard', 'coordinators', 'supervisors', 'agents'] as const).map(mode => (
                        <button key={mode} onClick={() => setViewMode(mode)} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md capitalize ${viewMode === mode ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-white'}`}>
                            {mode}
                        </button>
                    ))}
                </div>
             </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090B]">
          <h1 className="text-xl font-light text-white tracking-tight">Auditorías de Calidad <span className="text-slate-500">UTEL 2026</span></h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <select value={selectedCoord} onChange={e => { setSelectedCoord(e.target.value); setSelectedSup('All'); setSelectedAgt('All'); }} className="bg-[#18181B] border border-white/10 text-xs px-3 py-1.5 rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  {uniqueCoords.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedSup} onChange={e => { setSelectedSup(e.target.value); setSelectedAgt('All'); }} className="bg-[#18181B] border border-white/10 text-xs px-3 py-1.5 rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  {uniqueSups.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={selectedAgt} onChange={e => setSelectedAgt(e.target.value)} className="bg-[#18181B] border border-white/10 text-xs px-3 py-1.5 rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  {uniqueAgts.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {viewMode === 'dashboard' ? (
            <>
              <div className="flex gap-4 mb-6">
                <button onClick={() => setActiveTab('kpi')} className={`pb-2 text-sm ${activeTab === 'kpi' ? 'text-white border-b-2 border-emerald-500 font-medium' : 'text-slate-500 hover:text-white'}`}>Métricas</button>
                <button onClick={() => setActiveTab('table')} className={`pb-2 text-sm ${activeTab === 'table' ? 'text-white border-b-2 border-emerald-500 font-medium' : 'text-slate-500 hover:text-white'}`}>Tabla Detallada</button>
              </div>

              {activeTab === 'kpi' ? (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-white mb-4">Métricas (Total: {filteredData.length})</h2>
                  <DashboardKPIs data={filteredData} entityType="agents" weeks={allWeeks} />
                </div>
              ) : (
                <TablaAuditorias data={filteredData} />
              )}
            </>
          ) : (
              <GroupedEntityStats data={filteredData} entityType={viewMode as 'coordinators' | 'supervisors' | 'agents'} />
          )}
        </div>
      </main>
    </div>
  );
}
