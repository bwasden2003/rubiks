import type { FaceName, MoveTable } from './types'

// Corners
// 0: URF
// 1: UFL
// 2: ULB
// 3: UBR
// 4: DFR
// 5: DLF
// 6: DBL
// 7: DRB

// Edges
// 0: UR
// 1: UF
// 2: UL
// 3: UB
// 4: DR
// 5: DF
// 6: DL
// 7: DB
// 8: FR
// 9: FL
// 10: BL
// 11: BR

export const MOVE_TABLES: Record<FaceName, MoveTable> = {
  U: {
    cornerCycle: [0, 1, 2, 3],
    edgeCycle: [0, 1, 2, 3],
  },
  D: {
    cornerCycle: [4, 7, 6, 5],
    edgeCycle: [4, 7, 6, 5],
  },
  R: {
    cornerCycle: [0, 3, 7, 4],
    edgeCycle: [0, 11, 4, 8],
    cornerOrientDelta: { 0: 2, 3: 1, 7: 2, 4: 1 },
  },
  L: {
    cornerCycle: [1, 5, 6, 2],
    edgeCycle: [2, 9, 6, 10],
    cornerOrientDelta: { 1: 1, 5: 2, 6: 1, 2: 2 },
  },
  F: {
    cornerCycle: [0, 4, 5, 1],
    edgeCycle: [1, 8, 5, 9],
    cornerOrientDelta: { 0: 1, 4: 2, 5: 1, 1: 2 },
    edgeOrientDelta: { 1: 1, 8: 1, 5: 1, 9: 1 },
  },
  B: {
    cornerCycle: [3, 2, 6, 7],
    edgeCycle: [3, 10, 7, 11],
    cornerOrientDelta: { 3: 2, 2: 1, 6: 2, 7: 1 },
    edgeOrientDelta: { 3: 1, 10: 1, 7: 1, 11: 1 },
  },
}

export function cycleValues<T>(values: T[], cycle: number[]): void {
    const last = values[cycle[cycle.length - 1]];
    for (let i = cycle.length - 1; i > 0; i--) {
        values[cycle[i]] = values[cycle[i - 1]];
    }
    values[cycle[0]] = last;
}

export function addOrientation(values: number[], deltas: Record<number, number>, modulo: number): void {
    for (const [indexText, delta] of Object.entries(deltas)) {
        const index = Number(indexText)
        values[index] = (values[index] + delta) % modulo;
    }
}