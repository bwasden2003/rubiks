// src/lib/cube/cube.test.ts
import { describe, expect, it } from 'vitest'
import { Cube } from './cube'
import { cubeToFacelets } from './facelets'
import type { Move } from './types'

const faces = ['U', 'D', 'L', 'R', 'F', 'B'] as const
const solvedCornerOrient = [0, 0, 0, 0, 0, 0, 0, 0]
const solvedEdgeOrient = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const topRow = [0, 1, 2]
const rightColumn = [2, 5, 8]
const bottomRow = [6, 7, 8]
const leftColumn = [0, 3, 6]

function pick<T>(values: T[], indexes: number[]): T[] {
  return indexes.map((index) => values[index])
}

describe('Cube moves', () => {
  it('starts solved', () => {
    expect(new Cube().isSolved()).toBe(true)
  })

  it('single face move changes the cube', () => {
    expect(new Cube().move('R').isSolved()).toBe(false)
  })

  it('does not mutate the original cube', () => {
    const original = new Cube()
    const moved = original.move('R')

    expect(original.isSolved()).toBe(true)
    expect(original.equals(moved)).toBe(false)
  })

  it('four quarter turns return to solved', () => {
    for (const face of faces) {
      expect(new Cube().applyAlg([face, face, face, face]).isSolved()).toBe(true)
    }
  })

  it('move followed by inverse returns to solved', () => {
    for (const face of faces) {
      const inverse = `${face}'` as Move
      expect(new Cube().applyAlg([face, inverse]).isSolved()).toBe(true)
    }
  })

  it('two double turns return to solved', () => {
    for (const face of faces) {
      const double = `${face}2` as Move
      expect(new Cube().applyAlg([double, double]).isSolved()).toBe(true)
    }
  })

  it('a non-trivial commutator is not solved', () => {
    expect(new Cube().applyAlg(['R', 'U', "R'", "U'"]).isSolved()).toBe(false)
  })
})

describe('Cube orientation', () => {
  it('U and D moves do not change corner or edge orientation', () => {
    for (const move of ['U', "U'", 'U2', 'D', "D'", 'D2'] as Move[]) {
      const cube = new Cube().move(move)

      expect(cube.corner_orient).toEqual(solvedCornerOrient)
      expect(cube.edge_orient).toEqual(solvedEdgeOrient)
    }
  })

  it('R and L moves twist corners but do not flip edges', () => {
    for (const move of ['R', "R'", 'L', "L'"] as Move[]) {
      const cube = new Cube().move(move)

      expect(cube.corner_orient).not.toEqual(solvedCornerOrient)
      expect(cube.edge_orient).toEqual(solvedEdgeOrient)
    }
  })

  it('F and B moves twist corners and flip edges', () => {
    for (const move of ['F', "F'", 'B', "B'"] as Move[]) {
      const cube = new Cube().move(move)

      expect(cube.corner_orient).not.toEqual(solvedCornerOrient)
      expect(cube.edge_orient).not.toEqual(solvedEdgeOrient)
    }
  })

  it('half turns do not change orientation from solved', () => {
    for (const move of ['U2', 'D2', 'L2', 'R2', 'F2', 'B2'] as Move[]) {
      const cube = new Cube().move(move)

      expect(cube.corner_orient).toEqual(solvedCornerOrient)
      expect(cube.edge_orient).toEqual(solvedEdgeOrient)
    }
  })

  it('a move followed by its inverse restores orientation', () => {
    for (const face of faces) {
      const inverse = `${face}'` as Move
      const cube = new Cube().applyAlg([face, inverse])

      expect(cube.corner_orient).toEqual(solvedCornerOrient)
      expect(cube.edge_orient).toEqual(solvedEdgeOrient)
    }
  })
})

describe('Cube facelets', () => {
  it('projects a solved cube to solid faces', () => {
    const facelets = cubeToFacelets(new Cube())

    for (const face of faces) {
      expect(facelets[face]).toEqual(Array(9).fill(face))
    }
  })

  it('rotates corner colors onto facelet slots for corner orientation', () => {
    const cube = new Cube()
    cube.corner_orient[0] = 1

    const facelets = cubeToFacelets(cube)

    expect(facelets.R[0]).toBe('U')
    expect(facelets.F[2]).toBe('R')
    expect(facelets.U[8]).toBe('F')
  })

  it('swaps edge colors onto facelet slots for edge orientation', () => {
    const cube = new Cube()
    cube.edge_orient[1] = 1

    const facelets = cubeToFacelets(cube)

    expect(facelets.F[1]).toBe('U')
    expect(facelets.U[7]).toBe('F')
  })

  it('projects a U move onto the top rows of the side faces', () => {
    const facelets = cubeToFacelets(new Cube().move('U'))

    expect(facelets.U).toEqual(Array(9).fill('U'))
    expect(pick(facelets.F, topRow)).toEqual(['R', 'R', 'R'])
    expect(pick(facelets.R, topRow)).toEqual(['B', 'B', 'B'])
    expect(pick(facelets.B, topRow)).toEqual(['L', 'L', 'L'])
    expect(pick(facelets.L, topRow)).toEqual(['F', 'F', 'F'])
  })

  it('projects a D move onto the bottom rows of the side faces', () => {
    const facelets = cubeToFacelets(new Cube().move('D'))

    expect(facelets.D).toEqual(Array(9).fill('D'))
    expect(pick(facelets.F, bottomRow)).toEqual(['L', 'L', 'L'])
    expect(pick(facelets.R, bottomRow)).toEqual(['F', 'F', 'F'])
    expect(pick(facelets.B, bottomRow)).toEqual(['R', 'R', 'R'])
    expect(pick(facelets.L, bottomRow)).toEqual(['B', 'B', 'B'])
  })

  it('projects an F move onto the adjacent U and D rows', () => {
    const facelets = cubeToFacelets(new Cube().move('F'))

    expect(facelets.F).toEqual(Array(9).fill('F'))
    expect(pick(facelets.U, bottomRow)).toEqual(['L', 'L', 'L'])
    expect(pick(facelets.R, leftColumn)).toEqual(['U', 'U', 'U'])
    expect(pick(facelets.D, topRow)).toEqual(['R', 'R', 'R'])
    expect(pick(facelets.L, rightColumn)).toEqual(['D', 'D', 'D'])
  })

  it('projects a B move onto the adjacent U and D rows', () => {
    const facelets = cubeToFacelets(new Cube().move('B'))

    expect(facelets.B).toEqual(Array(9).fill('B'))
    expect(pick(facelets.U, topRow)).toEqual(['R', 'R', 'R'])
    expect(pick(facelets.R, rightColumn)).toEqual(['D', 'D', 'D'])
    expect(pick(facelets.D, bottomRow)).toEqual(['L', 'L', 'L'])
    expect(pick(facelets.L, leftColumn)).toEqual(['U', 'U', 'U'])
  })

  it('projects an R move onto the adjacent side columns', () => {
    const facelets = cubeToFacelets(new Cube().move('R'))

    expect(facelets.R).toEqual(Array(9).fill('R'))
    expect(pick(facelets.U, rightColumn)).toEqual(['F', 'F', 'F'])
    expect(pick(facelets.F, rightColumn)).toEqual(['D', 'D', 'D'])
    expect(pick(facelets.D, rightColumn)).toEqual(['B', 'B', 'B'])
    expect(pick(facelets.B, leftColumn)).toEqual(['U', 'U', 'U'])
  })

  it('projects an L move onto the adjacent side columns', () => {
    const facelets = cubeToFacelets(new Cube().move('L'))

    expect(facelets.L).toEqual(Array(9).fill('L'))
    expect(pick(facelets.U, leftColumn)).toEqual(['B', 'B', 'B'])
    expect(pick(facelets.F, leftColumn)).toEqual(['U', 'U', 'U'])
    expect(pick(facelets.D, leftColumn)).toEqual(['F', 'F', 'F'])
    expect(pick(facelets.B, rightColumn)).toEqual(['D', 'D', 'D'])
  })

  it('keeps face centers fixed after a move sequence', () => {
    const facelets = cubeToFacelets(new Cube().applyAlg(['R', 'U', "R'", "U'", 'F2']))

    for (const face of faces) {
      expect(facelets[face][4]).toBe(face)
    }
  })

  it('preserves nine stickers of each color after a move sequence', () => {
    const facelets = cubeToFacelets(new Cube().applyAlg(['R', 'U', "R'", "U'", 'F2']))
    const colors = Object.values(facelets).flat()

    for (const face of faces) {
      expect(colors.filter((color) => color === face)).toHaveLength(9)
    }
  })
})
