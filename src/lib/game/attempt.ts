import { Cube } from "../cube/cube"
import type { Challenge } from "../challenge/types"
import type { Move } from "../cube/types"
import { invertMove } from "../cube/notation"

export type AttemptStatus = 'ready' | 'playing' | 'completed'

export type AttemptState = {
    challenge: Challenge
    startCube: Cube
    targetCube: Cube
    currentCube: Cube
    moves: readonly Move[]
    status: AttemptStatus
    startedAt?: Date
    completedAt?: Date
}

export function createAttempt(challenge: Challenge): AttemptState {
    const startCube: Cube = new Cube().applyAlg(challenge.startMoves) /* initialize start cube */
    const targetCube: Cube = new Cube().applyAlg(challenge.startMoves.concat(challenge.referenceMoves)) /* initialize target cube */
    return {
        challenge,
        startCube,
        targetCube,
        currentCube: startCube,
        moves: [],
        status: 'ready',
        startedAt: undefined,
        completedAt: undefined
    }
}

export function applyMove(state: AttemptState, move: Move, now: Date): AttemptState {
    if (state.status === 'completed') {
        return state
    }
    const newCube = state.currentCube.move(move)
    const newMoves = [...state.moves, move]
    const isCompleted = newCube.equals(state.targetCube)
    return {
        ...state,
        currentCube: newCube,
        moves: newMoves,
        status: isCompleted ? 'completed' : 'playing',
        startedAt: state.startedAt ?? new Date(now),
        completedAt: isCompleted ? new Date(now) : undefined
    }
}

export function undoMove(state: AttemptState): AttemptState {
    if (state.status === 'completed' || state.moves.length === 0) {
        return state
    }
    const lastMove = state.moves[state.moves.length - 1]
    return {
        ...state,
        currentCube: state.currentCube.move(invertMove(lastMove)),
        moves: state.moves.slice(0, -1),
        status: 'playing',
        completedAt: undefined
    }
}

export function resetAttempt(state: AttemptState): AttemptState {
    return {
        ...state,
        currentCube: state.startCube,
        moves: [],
        status: 'ready',
        startedAt: undefined,
        completedAt: undefined
    }
}

export function getElapsedMs(state: AttemptState, now: Date): number {
    if (!state.startedAt) return 0
    const end = state.completedAt ?? now
    return end.getTime() - state.startedAt.getTime()
}
