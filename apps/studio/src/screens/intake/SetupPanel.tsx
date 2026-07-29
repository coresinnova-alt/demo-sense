import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  inspectionActions,
  logAudit,
  recordChange,
  uiActions,
  useAppDispatch,
} from '@sense/store'
import type { Inspection, PropertyMeta } from '@sense/core'
import { Button, Input } from '@sense/ui'

const FIELDS: {
  key: keyof PropertyMeta
  label: string
  placeholder?: string
  required?: boolean
}[] = [
  { key: 'name', label: 'Property name', placeholder: 'Bayview Professional Center', required: true },
  { key: 'addr', label: 'Address', placeholder: '1450 Brickell Avenue, Miami, FL', required: true },
  { key: 'type', label: 'Property type' },
  { key: 'client', label: 'Client (prepared for)', placeholder: 'Meridian Capital Partners' },
  { key: 'year', label: 'Year built', placeholder: '1998' },
  { key: 'gba', label: 'Gross building area (SF)', placeholder: '42,000' },
  { key: 'stories', label: 'Stories (e.g. four)', placeholder: 'four' },
  { key: 'constr', label: 'Construction' },
]

export const SetupPanel = ({ inspection }: { inspection: Inspection }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyMeta, string>>>({})

  const update = (key: keyof PropertyMeta, value: string) => {
    dispatch(inspectionActions.updateProperty({ id: inspection.id, patch: { [key]: value } }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const cont = () => {
    const next: Partial<Record<keyof PropertyMeta, string>> = {}
    if (!inspection.property.name.trim()) next.name = 'Give the property a name'
    if (!inspection.property.addr.trim()) next.addr = 'Add the property address'
    if (Object.keys(next).length) {
      setErrors(next)
      dispatch(uiActions.pushToast('Complete the required fields first', 'warn'))
      return
    }
    dispatch(inspectionActions.completeSetup(inspection.id))
    dispatch(logAudit('Inspection created', `${inspection.proj} · ${inspection.property.name}`))
    dispatch(recordChange(`Inspection created — ${inspection.property.name}`))
  }

  const cancel = () => {
    if (!inspection.setupDone) dispatch(inspectionActions.remove(inspection.id))
    navigate('/')
  }

  return (
    <div className="flex flex-1 flex-col p-7">
      <h2 className="text-[19px] font-extrabold tracking-tight text-ink">
        New inspection — property set-up
      </h2>
      <p className="mt-1 mb-6 text-[12.5px] text-ink-3">
        The report cover, executive summary and property description are assembled from these fields.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <Input
            key={f.key}
            label={f.label}
            required={f.required}
            placeholder={f.placeholder}
            error={errors[f.key]}
            value={inspection.property[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
          />
        ))}
      </div>

      <div className="flex-1" />

      <div className="mt-6 flex justify-end gap-2.5">
        <Button onClick={cancel}>Cancel</Button>
        <Button variant="primary" onClick={cont}>
          Start walking components →
        </Button>
      </div>
    </div>
  )
}
