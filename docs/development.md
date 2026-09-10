# Development guide

Use Node 22.12 or newer and install the locked dependencies with `npm ci`.

## Daily commands

| Command                | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Start the local Vite server                                  |
| `npm run format`       | Format source, styles, and documentation with Oxfmt          |
| `npm run format:check` | Check formatting without changing files                      |
| `npm run lint`         | Run Oxlint, treating warnings as failures                    |
| `npm run lint:fix`     | Apply safe Oxlint fixes                                      |
| `npm run typecheck`    | Check TypeScript without producing output                    |
| `npm test`             | Run all colocated `src/*.test.ts` engine tests               |
| `npm run check`        | Run formatting, lint, types, tests, and the production build |

Oxlint checks React hooks, effect dependencies, Fast Refresh component exports, TypeScript, and import cycles. Oxfmt is the only formatter. Import sorting is disabled because stylesheet order matters.

## Responsibilities

| Location                 | Responsibility                                                |
| ------------------------ | ------------------------------------------------------------- |
| `src/App.tsx`            | Compose pages, navigation, and the active quest               |
| `src/app/`               | Header, sidebar, dialog routing, and browser persistence      |
| `src/app/dialogs/`       | Dialog content and local form/tab state                       |
| `src/features/`          | Adventure, practice, backpack, and progress pages             |
| `src/components/`        | Shared visual components, including characters and math props |
| `src/game/`              | Arithmetic generation, mission definitions, and domain types  |
| `src/game.ts`            | Public game exports, save migration, and progression          |
| `src/saveReducer.ts`     | Pure, typed saved-progress actions                            |
| `src/dailyQuests.ts`     | Shared daily challenge definitions and reward eligibility     |
| `src/learning.ts`        | Persistent skill memory and spaced review                     |
| `src/hooks/useLatest.ts` | Latest committed values for long-lived animation callbacks    |

Keep UI state near the component that owns it. Profile drafts and dialog tabs stay inside their dialogs; durable progress changes go through `useGameSave` actions. Reducers and learning models do not play audio, access browser storage, or mutate existing saves. Duplicate run, learning, purchase, and reward actions remain safe to replay.

The adventure map is keyed by grade and current chapter, so chapter selection resets when the learning context changes without an effect copying props into state. Shared props live outside the activities that use them. Internal arithmetic and learning modules import their direct dependencies instead of the public game barrel, preventing runtime cycles.

## Animation and styling

Each chapter scene is composed by `src/playgrounds/createPlayground.ts`. Landmark builders own their objects and update functions; `Meadow` owns the renderer, frame loop, input, observers, and cleanup. Progress comes from the question engine through `restore(count)` and never awards rewards inside the scene. Materials and geometry are shared and disposed when the chapter closes. Reduced-motion updates show all earned pieces without decorative movement.

Each discovery owns its animation timeline. Sound and solved-state callbacks read committed values through `useLatest`; muting does not rebuild the Three.js scene or restart a demonstration. Clean up animation frames, timers, observers, listeners, and narration when an activity closes. React state drives rendered feedback; refs hold imperative handles and immediate event guards.

Two narrow lint exceptions synchronize UI with external systems: reporting browser storage failures and reporting unavailable WebGL after renderer creation. They include inline explanations. Do not suppress effect dependencies to make a timeline run once.

Keep the stylesheet imports in `src/main.tsx` in their documented order. Base styles load first, then the playful theme and arena layers, followed by the home layout and scoped chapter playground styles. Preserve class names and DOM relationships when extracting components: the responsive CSS relies on them. Test the home page and bridge on small screens after layout changes, including after adding a plank and after a correct answer.

## Commits

Keep formatting separate from behavior and structural changes. Run `npm run check` before committing a completed change. The initial formatting commit is listed in `.git-blame-ignore-revs`; enable it locally with `git config blame.ignoreRevsFile .git-blame-ignore-revs` when tracing history.
