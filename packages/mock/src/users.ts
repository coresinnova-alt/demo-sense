import type { RoleId, User } from '@sense/core'

/** Demo personas. Signing in as any of them is unauthenticated by design. */
export const ROLE_USERS: Record<RoleId, User> = {
  inspector: {
    role: 'inspector',
    label: 'Inspector',
    name: 'Marco Torres',
    title: 'Inspecting Engineer',
    initials: 'MT',
    desc: 'Field intake on tablet · runs inspections',
    email: 'mtorres@sense-eng.com',
  },
  reviewer: {
    role: 'reviewer',
    label: 'Reviewer',
    name: 'Ethos Delgado',
    title: 'Office Lead · Reviewer',
    initials: 'ED',
    desc: 'Reviews drafts · approves deliverables',
    email: 'edelgado@sense-eng.com',
  },
  admin: {
    role: 'admin',
    label: 'Admin',
    name: 'Naxis Prado',
    title: 'Product / Content Admin',
    initials: 'NP',
    desc: 'Approved language · cost book · audit log',
    email: 'nprado@sense-eng.com',
  },
}

export const ROLE_ORDER: RoleId[] = ['inspector', 'reviewer', 'admin']

/** Which top-level destinations each role can reach. */
export const ROLE_CAPABILITIES: Record<RoleId, { admin: boolean; approve: boolean; intake: boolean }> = {
  inspector: { admin: false, approve: false, intake: true },
  reviewer: { admin: false, approve: true, intake: true },
  admin: { admin: true, approve: true, intake: true },
}
