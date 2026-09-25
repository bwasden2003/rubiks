import { describe, expect, it } from 'vitest'
import { Cube } from './cube'
import { invertAlgorithm, invertMove, isMove, parseAlgorithm } from './notation'
import type { Move } from './types'

const moves: Move[] = [
  'U', "U'", 'U2', 'D', "D'", 'D2', 'L', "L'", 'L2',
  'R', "R'", 'R2', 'F', "F'", 'F2', 'B', "B'", 'B2',
]

describe('isMove', () => {
  it.each(moves)('accepts %s', (move) => {
    expect(isMove(move)).toBe(true)
  })

  it.each([
    '', 'r', 'X', 'R3', "R2'", "R''", 'RR', 'R U', ' R', 'R ',
    'R\n', null, undefined, 42, true, {}, ['R'],
  ])('rejects %j', (value) => {
    expect(isMove(value)).toBe(false)
  })
})

describe('parseAlgorithm', () => {
  it('parses all supported moves in order', () => {
    expect(parseAlgorithm(moves.join(' '))).toEqual(moves)
  })

  it.each(["R U R' U2", "  R   U\tR'\r\nU2  "])(
    'parses whitespace-separated notation: %j',
    (text) => {
      expect(parseAlgorithm(text)).toEqual(['R', 'U', "R'", 'U2'])
    },
  )

  it.each(['', ' ', '\t\r\n'])('returns no moves for %j', (text) => {
    expect(parseAlgorithm(text)).toEqual([])
  })

  it.each(['r', 'R3', "U2'", 'RU', 'R,U', 'X'])(
    'rejects an algorithm containing %s and identifies the token',
    (token) => {
      expect(() => parseAlgorithm(`F ${token} B`)).toThrow(`Invalid move: ${token}`)
    },
  )
})

describe('invertMove', () => {
  it.each(['U', 'D', 'L', 'R', 'F', 'B'] as const)(
    'inverts all three forms of %s',
    (face) => {
      expect(invertMove(face)).toBe(`${face}'`)
      expect(invertMove(`${face}'`)).toBe(face)
      expect(invertMove(`${face}2`)).toBe(`${face}2`)
    },
  )

  it.each(moves)('undoes %s on a scrambled cube', (move) => {
    const original = new Cube().applyAlg(['F', 'R', 'U2'])
    expect(original.move(move).move(invertMove(move)).equals(original)).toBe(true)
  })
})

describe('invertAlgorithm', () => {
  it('reverses order and inverts moves without changing the input', () => {
    const algorithm = Object.freeze(['R', 'U', "R'", 'U2'] as const)
    expect(invertAlgorithm(algorithm)).toEqual(['U2', 'R', "U'", "R'"])
    expect(algorithm).toEqual(['R', 'U', "R'", 'U2'])
  })

  it('handles an empty algorithm', () => {
    expect(invertAlgorithm([])).toEqual([])
  })

  it('inverting twice restores the sequence', () => {
    expect(invertAlgorithm(invertAlgorithm(moves))).toEqual(moves)
  })

  it.each(['', "R U R' U2", "F2 D B' L U2 R'", moves.join(' ')])(
    'restores the original scrambled cube after %j and its inverse',
    (text) => {
      const original = new Cube().applyAlg(['B', 'L2', "D'", 'F'])
      const algorithm = parseAlgorithm(text)
      const restored = original.applyAlg(algorithm).applyAlg(invertAlgorithm(algorithm))
      expect(restored.equals(original)).toBe(true)
    },
  )
})
