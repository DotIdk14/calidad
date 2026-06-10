import { AuditRecord } from '../types';

interface Props {
  audit: AuditRecord | null;
  onClose: () => void;
}

export function AuditDetailsModal({ audit, onClose }: Props) {
  if (!audit) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#111113] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Detalle de Auditoría</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Cerrar</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
           {Object.entries(audit).map(([key, value]) => (
               <div key={key} className="border-b border-white/5 pb-2">
                   <div className="text-[10px] uppercase text-slate-500 font-bold">{key}</div>
                   <div className="font-medium text-white">{Array.isArray(value) ? value.join(', ') : String(value)}</div>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
}
