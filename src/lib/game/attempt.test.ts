import { describe, expect, it } from 'vitest'
import { Cube } from '../cube/cube'
import type { Challenge } from '../challenge/types'
import type { Move } from '../cube/types'
import { applyMove, createAttempt, getElapsedMs, resetAttempt, undoMove } from './attempt'

const challenge: Challenge = {
  version: 1,
  seed: 'attempt-test',
  startMoves: ['F', 'U2'],
  referenceMoves: ['R', 'U'],
}

const at = (milliseconds: number) => new Date(milliseconds)

function completedAttempt() {
  const first = applyMove(createAttempt(challenge), 'R', at(1000))
  return applyMove(first, 'U', at(2500))
}

describe('attempt initialization', () => {
  it('constructs the start and target and waits for the first move', () => {
    const state = createAttempt(challenge)
    const start = new Cube().applyAlg(challenge.startMoves)
    expect(state.startCube.equals(start)).toBe(true)
    expect(state.currentCube.equals(start)).toBe(true)
    expect(state.targetCube.equals(start.applyAlg(challenge.referenceMoves))).toBe(true)
    expect(state.moves).toEqual([])
    expect(state.status).toBe('ready')
    expect(state.startedAt).toBeUndefined()
    expect(state.completedAt).toBeUndefined()
    expect(getElapsedMs(state, at(5000))).toBe(0)
  })
})

describe('applying moves', () => {
  it('updates cube and history without changing the previous state', () => {
    const before = createAttempt(challenge)
    Object.freeze(before.moves)
    Object.freeze(before)
    const state = applyMove(before, 'R', at(1000))
    expect(state.currentCube.equals(before.currentCube.move('R'))).toBe(true)
    expect(state.moves).toEqual(['R'])
    expect(state.status).toBe('playing')
    expect(state.startedAt).toEqual(at(1000))
    expect(state.completedAt).toBeUndefined()
    expect(before.currentCube.equals(before.startCube)).toBe(true)
    expect(before.moves).toEqual([])
    expect(before.status).toBe('ready')
    expect(before.startedAt).toBeUndefined()
  })

  it('keeps the original start time on subsequent moves', () => {
    const first = applyMove(createAttempt(challenge), 'F', at(1000))
    const second = applyMove(first, 'B', at(2000))
    expect(second.startedAt).toEqual(at(1000))
    expect(getElapsedMs(second, at(3500))).toBe(2500)
  })

  it('copies the supplied timestamp', () => {
    const now = at(1000)
    const state = applyMove(createAttempt(challenge), 'F', now)
    now.setTime(9000)
    expect(state.startedAt).toEqual(at(1000))
  })
})

describe('undo', () => {
  it.each(['F', "F'", 'F2'] as const)('undoes %s with its inverse', (move) => {
    const initial = createAttempt(challenge)
    const moved = applyMove(initial, move, at(1000))
    const undone = undoMove(moved)
    expect(undone.currentCube.equals(initial.currentCube)).toBe(true)
    expect(undone.moves).toEqual([])
    expect(undone.status).toBe('playing')
    expect(undone.startedAt).toEqual(at(1000))
    expect(getElapsedMs(undone, at(2000))).toBe(1000)
    expect(moved.moves).toEqual([move])
    expect(moved.currentCube.equals(initial.currentCube)).toBe(false)
  })

  it('removes only the last move and restores the preceding cube', () => {
    const first = applyMove(createAttempt(challenge), 'F', at(1000))
    const second = applyMove(first, 'B2', at(2000))
    const undone = undoMove(second)
    expect(undone.currentCube.equals(first.currentCube)).toBe(true)
    expect(undone.moves).toEqual(first.moves)
    expect(second.moves).toEqual(['F', 'B2'])
  })

  it('does nothing for an empty history before and after play', () => {
    const initial = createAttempt(challenge)
    expect(undoMove(initial)).toBe(initial)
    const emptied = undoMove(applyMove(initial, 'F', at(1000)))
    expect(undoMove(emptied)).toBe(emptied)
    const resumed = applyMove(emptied, 'B', at(5000))
    expect(resumed.startedAt).toEqual(at(1000))
  })
})

describe('completion', () => {
  it('records completion and freezes elapsed time at the winning move', () => {
    const state = completedAttempt()
    expect(state.currentCube.equals(state.targetCube)).toBe(true)
    expect(state.status).toBe('completed')
    expect(state.moves).toEqual(['R', 'U'])
    expect(state.startedAt).toEqual(at(1000))
    expect(state.completedAt).toEqual(at(2500))
    expect(getElapsedMs(state, at(10000))).toBe(1500)
    expect(getElapsedMs(state, at(20000))).toBe(1500)
  })

  it('accepts an alternate solution by comparing cube states', () => {
    let state = createAttempt(challenge)
    const alternate: Move[] = ["R'", 'R2', 'U']
    alternate.forEach((move, index) => {
      state = applyMove(state, move, at(1000 + index * 500))
    })
    expect(state.moves).not.toEqual(challenge.referenceMoves)
    expect(state.currentCube.equals(state.targetCube)).toBe(true)
    expect(state.status).toBe('completed')
  })

  it('ignores further moves and undo without overwriting completion time', () => {
    const state = completedAttempt()
    expect(applyMove(state, 'F', at(9000))).toBe(state)
    expect(undoMove(state)).toBe(state)
    expect(state.completedAt).toEqual(at(2500))
  })

  it('can start and finish on the same move, including timestamp zero', () => {
    const state = applyMove(createAttempt({ ...challenge, referenceMoves: ['R'] }), 'R', at(0))
    expect(state.status).toBe('completed')
    expect(state.startedAt).toEqual(at(0))
    expect(state.completedAt).toEqual(at(0))
    expect(getElapsedMs(state, at(5000))).toBe(0)
  })
})

describe('reset', () => {
  it.each(['ready', 'playing', 'completed'] as const)(
    'resets a %s attempt and waits for the next first move', (status) => {
      const initial = createAttempt(challenge)
      const previous = status === 'ready' ? initial
        : status === 'playing' ? applyMove(initial, 'F', at(1000))
          : completedAttempt()
      const beforeCube = previous.currentCube.clone()
      const beforeMoves = [...previous.moves]
      const reset = resetAttempt(previous)
      expect(reset.currentCube.equals(initial.startCube)).toBe(true)
      expect(reset.targetCube.equals(initial.targetCube)).toBe(true)
      expect(reset.challenge).toBe(challenge)
      expect(reset.moves).toEqual([])
      expect(reset.status).toBe('ready')
      expect(reset.startedAt).toBeUndefined()
      expect(reset.completedAt).toBeUndefined()
      expect(getElapsedMs(reset, at(10000))).toBe(0)
      expect(previous.currentCube.equals(beforeCube)).toBe(true)
      expect(previous.moves).toEqual(beforeMoves)
      expect(previous.status).toBe(status)
      expect(applyMove(reset, 'F', at(15000)).startedAt).toEqual(at(15000))
    },
  )
})

describe('replay', () => {
  it('reconstructs the current cube from retained moves after undo', () => {
    let state = createAttempt(challenge)
    const sequence: Move[] = ['F', 'B2', "L'", 'D']
    sequence.forEach((move, index) => {
      state = applyMove(state, move, at(1000 + index * 500))
    })
    state = undoMove(state)
    state = applyMove(state, 'U2', at(4000))
    const replayed = new Cube().applyAlg(challenge.startMoves).applyAlg(state.moves)
    expect(replayed.equals(state.currentCube)).toBe(true)
  })
})
