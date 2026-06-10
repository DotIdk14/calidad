import { useState, useMemo } from 'react';
import { AuditRecord } from '../types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { AuditDetailsModal } from './AuditDetailsModal';

interface TableProps {
  data: AuditRecord[];
}

export function TablaAuditorias({ data = [] }: TableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);
  const rowsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(row => 
        row.coord.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.sup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.agt && row.agt.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);
  
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-9 pr-4 py-1.5 bg-[#09090B] border border-white/10 rounded-md w-full text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase text-slate-500 tracking-wider font-bold">
          <tr>
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3">Coord</th>
            <th className="px-6 py-3">Sup</th>
            <th className="px-6 py-3">Agt</th>
            <th className="px-6 py-3">Nivel</th>
          </tr>
        </thead>
        <tbody className="text-xs divide-y divide-white/[0.03] text-slate-300">
          {paginatedData.map((row, i) => (
            <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedAudit(row)}>
              <td className="px-6 py-3.5">{row.fecha}</td>
              <td className="px-6 py-3.5 text-slate-400">{row.coord}</td>
              <td className="px-6 py-3.5 text-slate-400">{row.sup}</td>
              <td className="px-6 py-3.5 text-slate-400">{row.agt || '-'}</td>
              <td className="px-6 py-3.5 text-white font-medium">{row.nivel}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="p-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <button className="flex items-center space-x-1 hover:text-white transition-colors" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={14}/> <span>Prev</span></button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className="flex items-center space-x-1 hover:text-white transition-colors" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><span>Next</span> <ChevronRight size={14}/></button>
      </div>
    </div>
    <AuditDetailsModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
    </>
  );
}
