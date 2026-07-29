import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  connectivityActions,
  syncNow,
  uiActions,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import { Toaster } from '@sense/ui'
import { AppShell } from './layout/AppShell'
import { LoginScreen } from './screens/LoginScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { PortfolioScreen } from './screens/PortfolioScreen'
import { IntakeScreen } from './screens/IntakeScreen'
import { FlagsScreen } from './screens/FlagsScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { ReportScreen } from './screens/ReportScreen'
import { AdminScreen } from './screens/AdminScreen'

export const App = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const theme = useAppSelector((s) => s.ui.theme)
  const toasts = useAppSelector((s) => s.ui.toasts)

  /* Theme is a class on <html> so print styles and portals inherit it too. */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  /* Track real connectivity; coming back online flushes the queue. */
  useEffect(() => {
    const goOnline = () => {
      dispatch(connectivityActions.setNetOnline(true))
      void dispatch(syncNow())
    }
    const goOffline = () => dispatch(connectivityActions.setNetOnline(false))
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [dispatch])

  if (!user) return <LoginScreen />

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardScreen />} />
          <Route path="portfolio" element={<PortfolioScreen />} />
          <Route path="admin" element={<AdminScreen />} />
          <Route path="inspection/:id/intake" element={<IntakeScreen />} />
          <Route path="inspection/:id/flags" element={<FlagsScreen />} />
          <Route path="inspection/:id/review" element={<ReviewScreen />} />
          <Route path="inspection/:id/report" element={<ReportScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster toasts={toasts} onDismiss={(id) => dispatch(uiActions.dismissToast(id))} />
    </>
  )
}
