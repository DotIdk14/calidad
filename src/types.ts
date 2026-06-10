export interface AuditRecord {
  fecha: string;
  semana: number;
  mes: string;
  coord: string;
  sup: string;
  agt?: string;
  nivel: string;
  ref: string | null;
  hib_aplica: boolean;
  hib_oferto: string | null;
  motiv_id: string | null;
  motiv_oc: string | null;
  av: string | null;
  evento: string | null;
  platzi: string | null;
  ac_has_data: boolean;
  ac_is_si: boolean;
  ac_canal: string | null;
  debate: string | null;
  obj_cats: string[];
}

export interface AuditData {
  fechas: string[];
  semanas: number[];
  meses: string[];
  niveles: string[];
  rows: AuditRecord[];
}
