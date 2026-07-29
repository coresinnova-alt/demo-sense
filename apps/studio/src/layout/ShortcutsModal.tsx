import { uiActions, useAppDispatch, useAppSelector } from '@sense/store'
import { Modal } from '@sense/ui'

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Anywhere',
    items: [
      ['⌘ K', 'Open the command palette'],
      ['?', 'Show this cheat sheet'],
      ['G then D', 'Go to the dashboard'],
      ['G then P', 'Go to portfolio analytics'],
    ],
  },
  {
    title: 'Field intake',
    items: [
      ['← / →', 'Previous / next component'],
      ['1 – 4', 'Set condition: Good, Fair, Poor, Failed'],
      ['P', 'Capture a photo'],
      ['V', 'Record a video clip'],
      ['R', 'Record a voice note'],
      ['S', 'Save and exit'],
    ],
  },
  {
    title: 'Draft review',
    items: [
      ['↑ / ↓', 'Previous / next section'],
      ['A', 'Approve the current section'],
    ],
  },
]

export const ShortcutsModal = () => {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.ui.shortcutsOpen)

  return (
    <Modal
      open={open}
      onClose={() => dispatch(uiActions.setShortcutsOpen(false))}
      title="Keyboard shortcuts"
      description="The field flow is built to be driven without a mouse."
      size="md"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
              {group.title}
            </h3>
            <dl className="flex flex-col gap-1.5">
              {group.items.map(([keys, description]) => (
                <div key={keys} className="flex items-center gap-3">
                  <dt className="shrink-0">
                    <kbd className="rounded border border-line-2 bg-subtle px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-2">
                      {keys}
                    </kbd>
                  </dt>
                  <dd className="text-[12px] text-ink-2">{description}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Modal>
  )
}
