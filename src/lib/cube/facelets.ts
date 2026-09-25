import { Cube } from "./cube";
import type { Facelets, FaceName, FaceletSlot } from "./types";

// indexing
// 0 1 2
// 3 4 5
// 6 7 8

const CORNER_COLORS = [
    ['U', 'R', 'F'], // URF cubie
    ['U', 'F', 'L'], // UFL cubie
    ['U', 'L', 'B'], // ULB cubie
    ['U', 'B', 'R'], // UBR cubie
    ['D', 'F', 'R'], // DFR cubie
    ['D', 'L', 'F'], // DLF cubie
    ['D', 'B', 'L'], // DBL cubie
    ['D', 'R', 'B'], // DRB cubie
]

const EDGE_COLORS = [
    ['U', 'R'], // UR
    ['U', 'F'], // UF
    ['U', 'L'], // UL
    ['U', 'B'], // UB
    ['D', 'R'], // DR
    ['D', 'F'], // DF
    ['D', 'L'], // DL
    ['D', 'B'], // DB
    ['F', 'R'], // FR
    ['F', 'L'], // FL
    ['B', 'L'], // BL
    ['B', 'R'], // BR
]

const CORNER_FACELETS: FaceletSlot[][] = [
    [['U', 8], ['R', 0], ['F', 2]], // URF
    [['U', 6], ['F', 0], ['L', 2]], // UFL
    [['U', 0], ['L', 0], ['B', 2]], // ULB
    [['U', 2], ['B', 0], ['R', 2]], // UBR
    [['D', 2], ['F', 8], ['R', 6]], // DFR
    [['D', 0], ['L', 8], ['F', 6]], // DLF
    [['D', 6], ['B', 8], ['L', 6]], // DBL
    [['D', 8], ['R', 8], ['B', 6]], // DRB
]

// NEED TO DOUBLE CHECK
const EDGE_FACELETS: FaceletSlot[][] = [
    [['U', 5], ['R', 1]], // UR
    [['U', 7], ['F', 1]], // UF
    [['U', 3], ['L', 1]], // UL
    [['U', 1], ['B', 1]], // UB
    [['D', 5], ['R', 7]], // DR
    [['D', 1], ['F', 7]], // DF
    [['D', 3], ['L', 7]], // DL
    [['D', 7], ['B', 7]], // DB
    [['F', 5], ['R', 3]], // FR
    [['F', 3], ['L', 5]], // FL
    [['B', 5], ['L', 3]], // BL
    [['B', 3], ['R', 5]], // BR
]

export function cubeToFacelets(cube: Cube): Facelets {
    const facelets: Facelets = {
        U: Array(9).fill('U'),
        R: Array(9).fill('R'),
        F: Array(9).fill('F'),
        D: Array(9).fill('D'),
        L: Array(9).fill('L'),
        B: Array(9).fill('B')
    };

    for (let i = 0; i < cube.cornerPerm.length; i++) {
        const corner = cube.cornerPerm[i]
        const orient = cube.cornerOrient[i]
        const colors = CORNER_COLORS[corner]
        for (let j = 0; j < 3; j++) {
            const [targetFace, targetIndex] = CORNER_FACELETS[i][(j + orient) % 3]
            const color = colors[j]
            facelets[targetFace as FaceName][targetIndex] = color as FaceName
        }
    }

    for (let i = 0; i < cube.edgePerm.length; i++) {
        const edge = cube.edgePerm[i]
        const orient = cube.edgeOrient[i]
        const colors = EDGE_COLORS[edge]
        for (let j = 0; j < 2; j++) {
            const [targetFace, targetIndex] = EDGE_FACELETS[i][(j + orient) % 2]
            const color = colors[j]
            facelets[targetFace as FaceName][targetIndex] = color as FaceName
        }
    }

    // Implementation for converting cube to facelets would go here
    return facelets;
}
