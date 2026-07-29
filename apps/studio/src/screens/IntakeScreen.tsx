import { Navigate } from 'react-router-dom'
import { useActiveInspection } from '../lib/useActiveInspection'
import { DeviceFrame } from './intake/DeviceFrame'
import { SetupPanel } from './intake/SetupPanel'
import { WalkPanel } from './intake/WalkPanel'

export const IntakeScreen = () => {
  const inspection = useActiveInspection()
  if (!inspection) return <Navigate to="/" replace />

  return (
    <div className="animate-rise flex justify-center px-5 py-6 pb-14">
      <DeviceFrame
        title={inspection.setupDone ? 'SENSE FIELD · PCA INTAKE' : 'SENSE FIELD · PROPERTY SET-UP'}
        className="max-w-[1060px]"
      >
        {inspection.setupDone ? (
          <WalkPanel inspection={inspection} />
        ) : (
          <SetupPanel inspection={inspection} />
        )}
      </DeviceFrame>
    </div>
  )
}
