import { afterEach, describe, expect, it, vi } from 'vitest'
import { Cube } from '../cube/cube'
import { isMove } from '../cube/notation'
import { generateChallenge } from './generator'

afterEach(() => vi.restoreAllMocks())

describe('generateChallenge', () => {
  it.each([0, -1, 1.5, NaN, Infinity, -Infinity, 9])(
    'rejects invalid difficulty %s', (difficulty) => {
      expect(() => generateChallenge('test', difficulty)).toThrow(RangeError)
    },
  )

  it('reproduces a challenge independently of other calls', () => {
    const first = generateChallenge('practice-1', 3)
    generateChallenge('other', 8)
    expect(generateChallenge('practice-1', 3)).toEqual(first)
  })

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    'generates valid, distinct states at difficulty %i', (difficulty) => {
      for (let i = 0; i < 25; i++) {
        const challenge = generateChallenge(`seed-${i}`, difficulty)
        expect(challenge.startMoves).toHaveLength(difficulty * 10)
        expect(challenge.referenceMoves).toHaveLength(difficulty)
        for (const sequence of [challenge.startMoves, challenge.referenceMoves]) {
          expect(sequence.every(isMove)).toBe(true)
          for (let j = 1; j < sequence.length; j++) {
            expect(sequence[j][0]).not.toBe(sequence[j - 1][0])
          }
        }
        const start = new Cube().applyAlg(challenge.startMoves)
        expect(start.equals(start.applyAlg(challenge.referenceMoves))).toBe(false)
      }
    },
  )

  it('continues generating after rejecting a target', () => {
    const first = generateChallenge('retry', 3)
    const equals = vi.spyOn(Cube.prototype, 'equals').mockReturnValueOnce(true)
    const retried = generateChallenge('retry', 3)
    expect(equals).toHaveBeenCalledTimes(2)
    expect(retried.startMoves).toEqual(first.startMoves)
    expect(retried.referenceMoves).not.toEqual(first.referenceMoves)
  })

  it('stops after the retry limit if every target is rejected', () => {
    const equals = vi.spyOn(Cube.prototype, 'equals').mockReturnValue(true)
    expect(() => generateChallenge('retry-limit', 3)).toThrow('after 100 attempts')
    expect(equals).toHaveBeenCalledTimes(100)
  })
})
