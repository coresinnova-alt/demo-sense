import type { AuditEntry } from '@sense/core'

let seq = 0
const entry = (
  ts: string,
  user: string,
  action: string,
  detail: string,
  off = false,
): AuditEntry => ({ id: `seed-${++seq}`, ts, user, action, detail, off })

/** Seeded history so the audit log is not empty on first run. */
export const seedAudit = (): AuditEntry[] => [
  entry('Jul 3 · 9:05 AM', 'Marco Torres', 'Draft generated', 'SE-2026-0157 · grounded (RAG) · 3m 05s'),
  entry('Jul 2 · 3:38 PM', 'Marco Torres', 'Intake completed', 'SE-2026-0157 · 8 components, 11 photos'),
  entry('Jul 2 · 1:02 PM', 'Marco Torres', 'Inspection created', 'SE-2026-0157 · Coral Gables Medical Plaza'),
  entry('Jul 1 · 4:44 PM', 'Naxis Prado', 'Cost item updated', 'roof|TPO · unit cost 11.40 -> 12.00'),
  entry('Jun 30 · 4:12 PM', 'Ethos Delgado', 'Report approved', 'SE-2026-0142 · Bayview Professional Center'),
  entry('Jun 26 · 10:21 AM', 'Ethos Delgado', 'Section edited', 'SE-2026-0142 · 4.1 Roofing'),
  entry('Jun 24 · 11:50 AM', 'Marco Torres', 'Draft generated', 'SE-2026-0142 · grounded (RAG) · 2m 41s', true),
  entry('Jun 24 · 11:47 AM', 'Marco Torres', 'Intake completed', 'SE-2026-0142 · 8 components, 12 photos', true),
  entry('Jun 24 · 9:12 AM', 'Marco Torres', 'Inspection created', 'SE-2026-0142 · Bayview Professional Center'),
  entry('May 28 · 2:05 PM', 'Ethos Delgado', 'Report approved', 'SE-2026-0129 · Doral Logistics Park — Building C'),
]
