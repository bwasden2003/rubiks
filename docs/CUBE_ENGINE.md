# Cube Engine Reference

This document records the conventions behind the cube engine. It is a
technical reference, not an implementation checklist. For project status and
planned work, see the [README](../README.md).

## Design

Keep the cube engine cubie-based and derive sticker state only for rendering.

Source of truth:

- `corner_perm`: which corner cubie occupies each corner position
- `corner_orient`: the twist of the cubie at each corner position
- `edge_perm`: which edge cubie occupies each edge position
- `edge_orient`: the flip of the cubie at each edge position

Derived view:

- `cube.toFacelets()` projects cubies into six 3x3 sticker faces for rendering

## Stable Conventions

Do not change these casually. Move tables and facelet projection depend on them.

### Cubie Position Indexing

Corners:

```txt
0: URF
1: UFL
2: ULB
3: UBR
4: DFR
5: DLF
6: DBL
7: DRB
```

Edges:

```txt
0: UR
1: UF
2: UL
3: UB
4: DR
5: DF
6: DL
7: DB
8: FR
9: FL
10: BL
11: BR
```

### Facelet Indexing

Every face uses:

```txt
0 1 2
3 4 5
6 7 8
```

Centers stay fixed at index `4`.

### Orientation Rules

- Corner orientation is modulo 3.
- Edge orientation is modulo 2.
- `U` and `D` only permute cubies.
- `R`, `L`, `F`, and `B` twist corners.
- `F` and `B` flip edges.

## Public Operations

- `new Cube()` creates a solved cube.
- `clone()` returns an independent copy.
- `move(move)` returns a moved copy without mutating the source cube.
- `applyAlg(moves)` applies a typed list of moves and returns the result.
- `equals(other)` compares complete cubie state.
- `isSolved()` checks the solved permutation and orientation.
- `toFacelets()` returns the sticker projection used by both renderers.
- `toString()` prints the four state arrays for debugging.

`Move` accepts each face, its prime form, and its double-turn form. Prime and
double moves are implemented as repeated clockwise quarter turns.

## Projection and Rendering

The rendering data flow is:

```text
Move[] -> Cube -> Cube.toFacelets() -> Cube3D or CubeNet
```

`facelets.ts` maps the cubie occupying each position, including its
orientation, to sticker slots. Centers are initialized directly and remain
fixed.

`Cube3D` renders one dark box and 54 colored sticker planes. Its explicit face
configuration defines a normal, up vector, right vector, and rotation for each
face. The renderer is a static state renderer; it does not animate slice
turns.

## Invariants

- A move returns a new cube and leaves its source unchanged.
- Four quarter turns, two double turns, or a move followed by its inverse
  restore that face's original state.
- Corner orientation sums are valid modulo 3.
- Edge orientation sums are valid modulo 2.
- Every projected state contains nine stickers of each color.
- Face centers remain fixed.

The Vitest suite covers these identities and invariants, along with exact
facelet strips for every single-face quarter turn.

## Files

```text
src/lib/cube/cube.ts       Cube state and public operations
src/lib/cube/moves.ts      Move tables and move helpers
src/lib/cube/facelets.ts   Cubie-to-facelet projection
src/lib/cube/types.ts      Cube-related types and colors
src/lib/cube/cube.test.ts  Cube and facelet tests
src/components/Cube3D.tsx  Static 3D renderer
src/components/CubeNet.tsx Flat debug renderer
```

## Safe Extension Points

- Add parsing or serialization around `Move[]`; keep move execution inside
  `Cube`.
- Compare challenge completion with `Cube.equals()` so alternate solutions
  are accepted.
- Keep renderers dependent on `Facelets`, not on internal cubie arrays.
- Preserve the indexing and orientation conventions above when adding
  algorithms, random-state generation, or animated rendering.
