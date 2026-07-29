import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { inspectionActions, selectActiveInspection, useAppDispatch, useAppSelector } from '@sense/store'
import type { Inspection } from '@sense/core'

/**
 * Binds the `:id` route param to the store's active inspection, so a deep link
 * or a refresh lands on the right record without a separate loading path.
 */
export const useActiveInspection = (): Inspection | null => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const activeId = useAppSelector((s) => s.inspections.activeId)
  const inspection = useAppSelector(selectActiveInspection)
  const exists = useAppSelector((s) => s.inspections.items.some((i) => i.id === id))

  useEffect(() => {
    if (id && exists && id !== activeId) dispatch(inspectionActions.setActive({ id, compIdx: 0 }))
  }, [id, exists, activeId, dispatch])

  return inspection?.id === id ? inspection : null
}
