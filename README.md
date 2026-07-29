# Sense Report Studio

AI-assisted **Property Condition Assessment** reporting for Sense Engineering — a demo MVP.

An inspector walks a building on a tablet, tapping through eight component systems.
Every selection is bound to an approved sentence, so the draft report writes itself
from Sense's own language rather than from a model's imagination. Costs are looked
up and multiplied — never generated. A reviewer edits, approves section by section,
and exports the deliverable.

Runs entirely on mock data. No backend, no network calls.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Sign in with any credentials — pick **Inspector**, **Reviewer** or **Admin** to see
the different capability sets.

```bash
npm run typecheck    # tsc across every workspace
npm run build        # production bundle -> apps/studio/dist
npm run preview      # serve the built bundle
```

---

## Monorepo layout

npm workspaces. Internal packages ship raw TypeScript and are compiled by the app's
bundler, so there is no build-order dance during development.

```
apps/
  studio/            React + Vite application — screens, routing, layout
packages/
  tokens/            Design tokens + Tailwind v4 theme (the only place hex lives)
  core/              Domain types, taxonomy, approved language, cost engine — pure, no React
  mock/              Seeded demo fixtures: inspections, users, audit log
  store/             Redux Toolkit — slices, selectors, thunks, persistence
  ui/                Component library — controls, layout primitives, charts
deploy/              nginx config + GCP setup and deploy scripts
```

**Dependency direction** is strictly one-way:

```
tokens ─┐
core ───┼─→ ui ────┐
mock ───┴─→ store ─┴─→ studio
```

`core` has no React and no Redux dependency, which is what makes the cost and
report logic testable in isolation and reusable if a real backend arrives.

---

## Architecture

### Domain layer (`@sense/core`)

The interesting decision: **the taxonomy is data, not code.** `taxonomy.ts` defines
the eight components, their selectable types, condition scale and observation
bullets. `language.ts` holds every approved sentence. `costbook.ts` holds unit costs
and expected useful life.

`engine.ts` turns field selections into a report:

- `computeCostLine()` — the single place a dollar figure is produced (`qty × unit cost`)
- `buildReportModel()` — assembles cost tables, the ten-year reserve schedule,
  the executive summary and the body sections, deterministically
- `buildPortfolioStats()` — cross-property roll-ups for the analytics screen

Every generated sentence carries a **snippet ref** (`SNIP-ROOF-TPO`,
`SNIP-COND-FAIR`, …) back to its source. The review screen renders those as
clickable provenance chips — click one and the approved source appears beneath
the editable text.

### State (`@sense/store`)

Six slices — `auth`, `inspections`, `content`, `connectivity`, `generation`, `ui`.
Derived data lives in memoised selectors that call the pure engine, so no computed
value is ever stored twice.

- `RootState` is inferred from the **reducer map**, not the store instance —
  inferring it from the store is circular once a middleware is typed against it.
- A debounced middleware persists a whitelist to `localStorage`; toasts and the
  generation stepper are deliberately excluded.
- Offline is `manualOffline || !navigator.onLine`. Anything that would hit a
  server calls `recordChange()`, which queues only when offline. Reconnecting
  flushes the queue and writes an audit row.

### Design system (`@sense/tokens` + `@sense/ui`)

Colours come from the actual Sense logo, sampled from the PNG: the concentric
blue rings (`#2095D2 → #0C51A1`) and the red dome (`#D81D24`).

Semantic tokens (`--srf-card`, `--ink-2`, `--cond-poor`) are raw CSS custom
properties mapped into Tailwind through `@theme inline`, which is what lets a
single `.dark` class re-point every token at runtime.

**Charts** follow a validated palette. The categorical ramp passes the full gate
in both themes — lightness band, chroma floor, colourblind separation (adjacent
ΔE 9.2 light / 9.8 dark) and contrast — and dark mode is a separately chosen set
of steps, not an automatic flip. Condition and bucket colours are ordered status
palettes and are always rendered beside a text label, so meaning never rests on
hue alone. The stacked bar ships a table view for the same reason.

---

## What the demo does

| Screen | What it shows |
|---|---|
| **Login** | Three personas with different capabilities |
| **Dashboard** | KPIs, search / filter / sort, per-component condition strip, progress |
| **Portfolio** | Cross-property analytics — condition mix, spend by bucket and system, ten-year reserve profile |
| **Field intake** | Tablet-framed guided walk: type → condition → recommendation → cost line → observations → media |
| **Flag summary** | Red/yellow roll-up before drafting |
| **Draft review** | Editable narrative with provenance chips, per-section approval, live expenditure table |
| **Report** | The ASTM E2018 deliverable — print-ready, exports to Word and CSV |
| **Admin** | Approved-language editor, cost book, audit log |

Beyond the original prototype: portfolio analytics, command palette (`⌘K`), dark
mode, keyboard-driven intake, search/filter/sort, role-based navigation, CSV
export, field notes, and eight components across four report groups instead of
five.

### Field media

Inspectors capture three kinds of evidence, all on one record shape
(`MediaAsset`) and one placement path into the report:

- **Photos** — stills, auto-tagged to the section being walked.
- **Video clips** — walk-through footage with a runtime badge.
- **Voice notes** — spoken observations with a mock transcript, generated from
  the selections already on the record so it stays consistent with what the
  inspector chose. Real capture would post the audio to a transcription service;
  nothing around it would change.

Every asset can be re-captioned or deleted, and transcripts are editable —
correcting speech-to-text, not writing from scratch. Captions flow into the
report's figure captions; voice notes are surfaced in full to the reviewer and
*cited* in the report rather than embedded, because a transcript is field
evidence, not report copy. Placeholders are deterministic: photos and video
render a seeded abstract scene, audio renders a seeded waveform, so the same
asset always looks the same.

### Keyboard

| Key | Action |
|---|---|
| `⌘ K` | Command palette |
| `?` | Shortcut cheat sheet |
| `G` `D` / `G` `P` | Dashboard / Portfolio |
| `←` `→` | Previous / next component (intake) |
| `1`–`4` | Set condition (intake) |
| `P` / `V` / `R` | Capture photo · video clip · voice note (intake) |
| `S` | Save and exit (intake) |
| `↑` `↓` / `A` | Navigate / approve section (review) |

---

## Deployment — Cloud Run on GCP

Project `portal-503823`, region `us-central1`, service `demo-sense`.

**Live:** <https://demo-sense-ktoaf4fzqa-uc.a.run.app>

A multi-stage `Dockerfile` builds the bundle on `node:22-alpine` (failing the
build on a type error) and serves it from `nginx:1.27-alpine` — a 76 MB image.
nginx handles SPA fallback, immutable asset caching, a no-cache shell, gzip and
baseline security headers.

### One-time setup

```bash
./deploy/setup-gcp.sh       # APIs, Artifact Registry, Cloud Build IAM
./deploy/setup-trigger.sh   # push-to-main trigger (needs GitHub connected first)
```

`setup-trigger.sh` prints the console link if the GitHub↔Cloud Build connection
has not been authorised yet — that handshake is browser-only, once per account.

### Deploy

```bash
./deploy/deploy.sh          # builds + deploys, tags the image with the commit SHA
```

Or automatically: every push to `main` runs `cloudbuild.yaml`, which pulls the
previous image as a layer cache, builds, pushes to Artifact Registry and rolls
out a new Cloud Run revision.

### Access note

The organisation enforces `constraints/iam.allowedPolicyMemberDomains`, which
rejects an `allUsers` IAM binding — so `--allow-unauthenticated` is silently
dropped and is deliberately **not** used in `cloudbuild.yaml`.

The service is public through `run.googleapis.com/invoker-iam-disabled=true`
instead, which bypasses the IAM invoker check rather than granting `allUsers`.
It is set once on the service and preserved across deploys. Access is therefore
governed by that annotation, not by the service IAM policy — which is why
`get-iam-policy` shows no bindings on a publicly reachable service.

---

## Notes and limitations

- All data is mock. Refreshing keeps state via `localStorage`; clear it with
  `localStorage.removeItem('senseReportStudio.v2')`.
- The "AI drafting" run is a simulated retrieval pass over the approved-language
  library. It is deliberately not a model call — the point of the demo is that
  the narrative is grounded and auditable.
- Approved language is placeholder copy and needs review by a Sense engineer.
- Cost data is a static RSMeans-style seed; a live cost source is the obvious
  next integration.
