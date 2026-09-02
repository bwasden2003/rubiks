# Rubik's Challenge Roadmap

## Product Direction

Build a polished, local-first game in which the player transforms a starting
cube into a target cube. Complete this core loop before adding accounts,
leaderboards, multiplayer, or advanced move animation.

## Current Assessment

### What Works

- Cubie-based support for all 18 face turns.
- Cubie-to-facelet projection.
- Static 3D and flat-net renderers.
- Keyboard moves and basic undo.
- 23 passing engine and projection tests.
- Documented cube indexing and orientation conventions in
  [CUBE_ENGINE.md](./CUBE_ENGINE.md).

### What Blocks an MVP

- The production build currently fails with TypeScript errors from unused
  prototype code.
- ESLint currently reports errors.
- The challenge constants in `CubeChallenge.tsx` are not connected to the UI.
- There is no visible target cube, timer, completion state, move history,
  control panel, or persistence.
- The fixed 3D camera only exposes three faces, so it cannot communicate a
  complete cube state by itself.
- Global keyboard handling can interfere with form fields and browser
  Backspace behavior.
- The cube's internal state arrays are publicly mutable despite the engine's
  immutability contract.
- There are no UI, accessibility, or integration tests.
- The earlier unused `cubing` dependency has been removed in favor of the
  local cube engine.
- The `rubiks` directory currently resolves to the parent `Coding` Git
  repository instead of being tracked as its own project.

## Phase 0: Stabilize the Foundation

**Estimated effort:** 0.5-1 day

- Decide whether `rubiks` should be a standalone repository or intentionally
  belong to the parent repository.
- Fix all TypeScript build and ESLint errors.
- Remove or connect unused prototype code and assets.
- Keep npm as the single package manager and commit `package-lock.json`.
- Add CI that runs tests, lint, and the production build on every change.

### Exit Criteria

```text
npm run test   passes
npm run lint   passes
npm run build  passes
```

## Phase 1: Define the Challenge Domain

**Estimated effort:** 1-2 days

Introduce framework-independent challenge and attempt types. A starting point:

```ts
type Challenge = {
  version: 1;
  id: string;
  seed: string;
  startMoves: Move[];
  targetMoves: Move[];
};

type Attempt = {
  challengeId: string;
  moves: Move[];
  status: "playing" | "completed";
  startedAt: number;
  completedAt?: number;
};
```

- Add shared move parsing, formatting, inversion, and validation.
- Add a deterministic seeded challenge generator.
- Avoid immediate cancellations and repeated moves of the same face when
  generating paths.
- Detect completion by comparing cube states with `Cube.equals()` so alternate
  solutions are accepted.
- Add cube serialization and defensive validation.
- Test deterministic generation, reachability, serialization, and alternate
  valid solutions.
- Begin with hidden reference paths of roughly 3-8 moves. Do not require a full
  cube solver for the MVP.

### Exit Criteria

- The same seed always produces the same challenge.
- Every generated target is reachable from its starting state.
- Challenge generation and completion detection work without React.
- Invalid serialized data is rejected safely.

## Phase 2: Build a Replayable Game Model

**Estimated effort:** 1-2 days

Move gameplay behavior out of React components and into a pure reducer or
attempt model.

- Apply a move.
- Undo the most recent move.
- Reset an attempt.
- Start a new challenge.
- Detect and record completion.
- Track move count and elapsed time.
- Replay an attempt deterministically from its move stream.
- Maintain the current cube incrementally rather than rebuilding it from the
  solved state after every render as histories become longer.

### Exit Criteria

- The game model has unit tests for all state transitions.
- Timer and completion transitions are idempotent.
- A recorded move stream reproduces the same final state.
- UI components can render the model without owning game rules.

## Phase 3: Deliver the Playable MVP

**Estimated effort:** 3-5 days

Build a complete challenge screen containing:

- The player's current cube.
- The complete target state, preferably displayed as a cube net.
- Buttons for all 18 moves.
- Undo, reset, and new-challenge controls.
- Move history and move count.
- An elapsed-time display.
- A completion panel.
- Discoverable keyboard instructions.
- Responsive mobile and desktop layouts.

### Interaction and Accessibility Requirements

- Ignore cube shortcuts while the user is typing in an input or editable
  element.
- Prevent the browser's default Backspace behavior when Backspace performs an
  undo.
- Give every interactive control an accessible name and visible focus style.
- Add orbit controls or keep the cube net visible so all six faces can be
  inspected.
- Support keyboard-only play and touch input.
- Respect reduced-motion preferences before adding visual transitions.
- Provide a flat-net fallback if WebGL is unavailable.

### Exit Criteria

- A first-time user can understand and complete a challenge without reading
  the README.
- The full game is usable with a keyboard and on a narrow touch screen.
- Completion is based on cube state rather than matching a prescribed move
  sequence.

## Phase 4: Persistence and Sharing

**Estimated effort:** 2-3 days

- Persist the active attempt with versioned local-storage keys such as
  `rubiks:v1:*`.
- Save personal bests by challenge ID.
- Restore an in-progress attempt after refresh.
- Reject stale, malformed, or incompatible stored data safely.
- Encode the challenge ID or seed in the URL.
- Add a daily challenge derived from a date-based seed.
- Add a copyable result summary.

### Exit Criteria

- Refreshing does not lose an active attempt.
- A shared challenge URL produces the same start and target states.
- Corrupt local data cannot prevent the application from loading.
- The daily challenge is stable for a given calendar day.

## Phase 5: Release Quality

**Estimated effort:** 2-4 days

- Add component tests for controls, history, and status transitions.
- Add browser tests for solving, undoing, resetting, refreshing, and keyboard
  input.
- Test touch layouts and narrow screens.
- Perform keyboard-only and screen-reader checks.
- Add error handling around 3D renderer initialization.
- Measure bundle size and remove unused dependencies.
- Deploy a production preview and conduct a short usability test.

### Exit Criteria

- Tests, lint, and production builds pass in CI.
- Critical game flows have browser-level coverage.
- The application remains playable without WebGL.
- No critical accessibility issues remain from keyboard and screen-reader
  testing.

## Later Backlog

Consider these only after the local game loop has proven useful and fun:

- Animated slice turns.
- Difficulty tiers.
- Hints and optimal-path comparisons.
- Statistics and streaks.
- User accounts and cloud synchronization.
- Global leaderboards.
- Multiplayer races.
- Fully random legal states and a full cube solver.

## Milestones

| Milestone | Outcome                              | Estimated effort |
| --------- | ------------------------------------ | ---------------: |
| M0        | Green repository and CI              |            1 day |
| M1        | Deterministic, tested challenges     |         2-3 days |
| M2        | Complete local gameplay loop         |         4-6 days |
| M3        | Persistence and shareable challenges |         2-3 days |
| M4        | Accessible, tested release candidate |         3-5 days |

A realistic solo-development target is approximately two focused weeks for a
strong local MVP, or three weeks for a release-quality version. The immediate
implementation sequence should be Phase 0 followed by the pure challenge and
attempt models, since those establish the foundation for every visible
feature.
