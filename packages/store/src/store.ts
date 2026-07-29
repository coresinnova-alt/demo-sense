import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { seedAudit, seedInspections } from '@sense/mock'
import auth from './slices/authSlice'
import connectivity from './slices/connectivitySlice'
import content from './slices/contentSlice'
import generation from './slices/generationSlice'
import inspections from './slices/inspectionsSlice'
import ui from './slices/uiSlice'
import { createPersistMiddleware, loadPersisted } from './persist'
import type { PersistedState } from './persist'

const rootReducer = combineReducers({
  auth,
  connectivity,
  content,
  generation,
  inspections,
  ui,
})

/**
 * Derived from the reducer map rather than from the store instance. Inferring
 * it from the store would be circular: the persist middleware is typed against
 * RootState, and the store's type depends on its middleware.
 */
export type RootState = ReturnType<typeof rootReducer>

/** Preferred colour scheme, used only when nothing was persisted. */
const systemTheme = (): 'light' | 'dark' =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

const buildPreloadedState = () => {
  const saved = loadPersisted()

  return {
    auth: {
      user: saved?.user ?? null,
      pickedRole: saved?.user?.role ?? ('inspector' as const),
    },
    inspections: {
      items: saved?.inspections?.length ? saved.inspections : seedInspections(),
      activeId: null,
      compIdx: 0,
      query: '',
      statusFilter: 'all' as const,
      sort: 'updated' as const,
    },
    content: {
      snippets: saved?.snippets ?? {},
      costs: saved?.costs ?? {},
      euls: saved?.euls ?? {},
      audit: saved?.audit?.length ? saved.audit : seedAudit(),
      adminTab: 'lang' as const,
      adminFilter: 'roof',
    },
    connectivity: {
      manualOffline: saved?.manualOffline ?? false,
      netOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
      syncing: false,
      queue: saved?.queue ?? [],
      lastSyncedAt: null,
    },
    ui: {
      theme: saved?.theme ?? systemTheme(),
      toasts: [],
      commandOpen: false,
      shortcutsOpen: false,
    },
    generation: {
      running: false,
      steps: [],
      modeLabel: '',
      inspectionId: null,
    },
  }
}

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    preloadedState: buildPreloadedState(),
    middleware: (getDefault) =>
      getDefault({
        // The fixtures are plain JSON, so the default checks stay on — they are
        // what would catch a Date or a class instance sneaking into state.
        serializableCheck: { warnAfter: 128 },
        immutableCheck: { warnAfter: 128 },
      }).concat(
        createPersistMiddleware((state: unknown) => {
          const s = state as RootState
          return {
            user: s.auth.user,
            inspections: s.inspections.items,
            audit: s.content.audit,
            snippets: s.content.snippets,
            costs: s.content.costs,
            euls: s.content.euls,
            manualOffline: s.connectivity.manualOffline,
            queue: s.connectivity.queue,
            theme: s.ui.theme,
          } satisfies PersistedState
        }),
      ),
  })

export const store = makeStore()

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
