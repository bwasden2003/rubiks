# Rubik's Challenge

An early-stage Rubik's Cube challenge game built with React, TypeScript, Vite,
and React Three Fiber. The repository currently contains a tested cubie-based
cube engine, facelet projection, a flat debug renderer, and a static 3D
renderer.

The app is still a prototype: it displays a cube and accepts keyboard moves,
but it does not yet expose the planned challenge, timer, history, or
persistence UI.

## Current Features

- Immutable `Cube` operations for all 18 face turns:
  `U D L R F B`, prime turns, and double turns
- Cubie permutation and orientation tracking
- Projection from cubie state to six 3x3 sticker faces
- Static 3D rendering with `@react-three/fiber`
- Flat cube-net components for visual debugging
- Keyboard input:
  - `U`, `D`, `L`, `R`, `F`, or `B` applies a clockwise turn
  - Hold `Shift` for a counterclockwise turn
  - `Backspace` undoes the most recent move
- 23 unit tests covering move identities, orientation, and facelet projection

## Getting Started

Requires a current Node.js release and npm.

```sh
npm install
npm run dev
```

Vite prints the local development URL after startup.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check the source with ESLint |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |

## Project Structure

```text
src/
|-- components/
|   |-- Cube3D.tsx          Static React Three Fiber renderer
|   |-- CubeNet.tsx         Flat cube-net debug renderer
|   `-- CubeFace.tsx        One 3x3 face
|-- lib/cube/
|   |-- cube.ts             Cube state and public operations
|   |-- moves.ts            Face-turn tables and helpers
|   |-- facelets.ts         Cubie-to-sticker projection
|   |-- types.ts            Cube types and display colors
|   `-- cube.test.ts        Cube and projection tests
|-- App.tsx
`-- main.tsx
```

See [Cube engine reference](docs/CUBE_ENGINE.md) before changing cubie
indexing, orientation rules, or facelet layout.

## Current Status

As of July 27, 2026:

- `npm run test` passes: 1 test file, 23 tests.
- `npm run lint` fails on unused prototype imports/constants and the
  `no-this-alias` rule in `Cube.applyAlg`.
- `npm run build` fails on the same unused imports/constants.

The current engine is implemented locally and does not depend on an external
cube engine.

## Roadmap

### 1. Restore the quality gates

- Remove or connect unused prototype code.
- Refactor `Cube.applyAlg` to satisfy ESLint.
- Keep tests, lint, and production build passing together.

### 2. Complete the playable local challenge

- Add visible buttons for all 18 moves.
- Show the target cube, move history, move count, and elapsed time.
- Add undo, reset, and new-challenge controls.
- Detect completion by comparing cube states, not algorithm strings.
- Make keyboard and button controls discoverable and accessible.

### 3. Generate challenges

- Generate deterministic challenges from a seed.
- Produce a randomized start state and a reachable target state.
- Begin with hidden reference paths of roughly 3-8 moves.
- Keep challenge data immutable and test determinism and reachability.

### 4. Model and persist attempts

- Move attempt state out of React components into a framework-independent
  model.
- Represent an attempt as a replayable move stream.
- Persist in-progress and best completed attempts with versioned local-storage
  keys such as `rubiks:v1:*`.
- Handle stale or invalid stored data defensively.

### 5. Polish and future modes

- Verify responsive desktop and mobile layouts.
- Add daily seeds and shareable challenge IDs.
- Add animated slice turns only after the static renderer and game loop are
  stable.
- Leave multiplayer and leaderboards outside the initial version.
