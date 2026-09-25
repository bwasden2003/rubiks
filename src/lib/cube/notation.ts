import type { Move } from './types';

export function isMove (move: unknown): move is Move {
    return typeof move === 'string' && /^[UDLRFB](?:'|2)?$/.test(move);
}

export function parseAlgorithm(alg: string): Move[] {
    const trimmed = alg.trim();
    if (!trimmed) return [];
    const moves = trimmed.split(/\s+/);
    const validMoves: Move[] = [];
    for (const move of moves) {
        if (!isMove(move)) {
            throw new Error(`Invalid move: ${move}`);
        }
        validMoves.push(move);
    }
    return validMoves;
}

export function invertMove(move: Move): Move {
    if (move.endsWith("'")) {
        return move.slice(0, -1) as Move;
    } else if (move.endsWith("2")) {
        return move as Move;
    } else {
        return (move + "'") as Move;
    }
}

export function invertAlgorithm(alg: readonly Move[]): Move[] {
    const inverted: Move[] = [];
    for (let i = alg.length - 1; i >= 0; i--) {
        inverted.push(invertMove(alg[i]));
    }
    return inverted;
}
