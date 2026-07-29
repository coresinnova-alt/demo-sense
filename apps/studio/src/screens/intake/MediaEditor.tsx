import { useEffect, useState } from 'react'
import { inspectionActions, recordChange, uiActions, useAppDispatch } from '@sense/store'
import type { ComponentId, MediaAsset } from '@sense/core'
import { Button, Input, MediaThumb, Modal, Textarea, formatDuration } from '@sense/ui'

export interface MediaEditorProps {
  inspectionId: string
  compId: ComponentId
  asset: MediaAsset | null
  onClose: () => void
}

const KIND_TITLE = {
  photo: 'Edit photo',
  video: 'Edit video clip',
  audio: 'Edit voice note',
} as const

/**
 * Caption and transcript editing for a captured asset. Transcripts are shown
 * only for audio, where the inspector is correcting speech-to-text rather than
 * writing from scratch.
 */
export const MediaEditor = ({ inspectionId, compId, asset, onClose }: MediaEditorProps) => {
  const dispatch = useAppDispatch()
  const [label, setLabel] = useState('')
  const [transcript, setTranscript] = useState('')

  // Re-seed the form whenever a different asset is opened.
  useEffect(() => {
    if (!asset) return
    setLabel(asset.label)
    setTranscript(asset.transcript ?? '')
  }, [asset])

  if (!asset) return null

  const save = () => {
    dispatch(
      inspectionActions.updateMedia({
        id: inspectionId,
        compId,
        assetId: asset.id,
        patch: {
          label: label.trim() || asset.label,
          ...(asset.kind === 'audio' ? { transcript } : {}),
        },
      }),
    )
    dispatch(recordChange(`Media caption edited — ${asset.name}`))
    dispatch(uiActions.pushToast('Caption updated', 'success', asset.name))
    onClose()
  }

  const remove = () => {
    dispatch(inspectionActions.removeMedia({ id: inspectionId, compId, assetId: asset.id }))
    dispatch(recordChange(`Media deleted — ${asset.name}`))
    dispatch(uiActions.pushToast('Deleted', 'default', asset.name))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={KIND_TITLE[asset.kind]}
      description={
        <span className="font-mono">
          {asset.name}
          {asset.durationSec !== undefined ? ` · ${formatDuration(asset.durationSec)}` : ''}
          {asset.capturedOffline ? ' · captured offline' : ''}
        </span>
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={remove} className="mr-auto text-danger">
            Delete
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
        <MediaThumb
          kind={asset.kind}
          name={asset.name}
          label={asset.label}
          seed={asset.seed}
          durationSec={asset.durationSec}
          offline={asset.capturedOffline}
          size="lg"
          showCaption={false}
        />
        <div className="flex flex-col gap-3">
          <Input
            label="Caption"
            hint="Appears under the figure in the report."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          {asset.kind === 'audio' ? (
            <Textarea
              label="Transcript"
              hint="Auto-transcribed on capture. Correct it here; it is not inserted into the narrative."
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
