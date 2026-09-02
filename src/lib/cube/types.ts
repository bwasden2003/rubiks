export type FaceName = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

export type Move = FaceName | `${FaceName}'` | `${FaceName}2`

export type MoveTable = {
    cornerCycle: number[]
    edgeCycle: number[]
    cornerOrientDelta?: Record<number, number>
    edgeOrientDelta?: Record<number, number>
}

export type Facelets = Record<FaceName, FaceName[]>

export type FaceletSlot = [face: FaceName, index: number]

export const FACE_COLORS = {
    U: 'white',
    R: 'red',
    F: 'green',
    D: 'yellow',
    L: 'orange',
    B: 'blue',
}