import type { FaceName, Move } from './types'
import { addOrientation, cycleValues, MOVE_TABLES } from './moves'
import { cubeToFacelets } from './facelets'
import type { Facelets } from './types'

const corner_perm: number[] = [0, 1, 2, 3, 4, 5, 6, 7]
const corner_orient: number[] = [0, 0, 0, 0, 0, 0, 0, 0]

const edge_perm: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const edge_orient: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

export class Cube {
    constructor() {
        this.corner_perm = corner_perm.slice()
        this.corner_orient = corner_orient.slice()
        this.edge_perm = edge_perm.slice()
        this.edge_orient = edge_orient.slice()
    }

    private corner_perm: number[]
    private corner_orient: number[]
    private edge_perm: number[]
    private edge_orient: number[]

    clone(): Cube {
        const newCube = new Cube()
        newCube.corner_perm = this.corner_perm.slice()
        newCube.corner_orient = this.corner_orient.slice()
        newCube.edge_perm = this.edge_perm.slice()
        newCube.edge_orient = this.edge_orient.slice()
        return newCube
    }

    equals(other: Cube): boolean {
        for (let i = 0; i < 8; i++) {
            if (this.corner_perm[i] !== other.corner_perm[i] || this.corner_orient[i] !== other.corner_orient[i]) {
                return false
            }
        }
        for (let i = 0; i < 12; i++) {
            if (this.edge_perm[i] !== other.edge_perm[i] || this.edge_orient[i] !== other.edge_orient[i]) {
                return false
            }
        }
        return true
    }

    move(move: Move): Cube {
        const newCube = this.clone()
        newCube.moveInPlace(move)
        return newCube
    }

    private moveInPlace(move: Move): void {
        const face = move[0] as FaceName
        const turns = move.length === 1 ? 1 : move[1] === '2' ? 2 : 3

        for (let i = 0; i < turns; i++) {
            const table = MOVE_TABLES[face]
            cycleValues(this.corner_perm, table.cornerCycle)
            cycleValues(this.corner_orient, table.cornerCycle)

            cycleValues(this.edge_perm, table.edgeCycle)
            cycleValues(this.edge_orient, table.edgeCycle)

            if (table.cornerOrientDelta) {
                addOrientation(this.corner_orient, table.cornerOrientDelta, 3)
            }
            if (table.edgeOrientDelta) {
                addOrientation(this.edge_orient, table.edgeOrientDelta, 2)
            }
        }
    }

    applyAlg(alg: Move[]): Cube {
        let cube: Cube = this.clone()
        for (const move of alg) {
            cube = cube.move(move)
        }
        return cube
    }

    isSolved(): boolean {
        for (let i = 0; i < 8; i++) {
            if (this.corner_perm[i] !== i || this.corner_orient[i] !== 0) {
                return false
            }
        }
        for (let i = 0; i < 12; i++) {
            if (this.edge_perm[i] !== i || this.edge_orient[i] !== 0) {
                return false
            }
        }
        return true
    }

    toString(): string {
        return [
            `corner_perm:   [${this.corner_perm.join(', ')}]`,
            `corner_orient: [${this.corner_orient.join(', ')}]`,
            `edge_perm:     [${this.edge_perm.join(', ')}]`,
            `edge_orient:   [${this.edge_orient.join(', ')}]`,
        ].join('\n')
    }

    toFacelets(): Facelets {
        return cubeToFacelets(this)
    }

    // public methods for reading cube data now that state is private
    public get cornerPerm(): number[] {
        return [...this.corner_perm]
    }
    public get cornerOrient(): number[] {
        return [...this.corner_orient]
    }
    public get edgePerm(): number[] {
        return [...this.edge_perm]
    }
    public get edgeOrient(): number[] {
        return [...this.edge_orient]
    }
}
