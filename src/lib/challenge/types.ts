import type { Move } from '../cube/types';

export type Challenge = {
    version: 1
    seed: string
    startMoves: readonly Move[]
    referenceMoves: readonly Move[]
}