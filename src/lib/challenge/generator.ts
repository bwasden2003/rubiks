import type { Challenge } from './types';
import type { FaceName, Move } from '../cube/types';
import { GameSeedGenerator } from './random';
import { Cube } from '../cube/cube';

const MAX_DIFFICULTY = 8;
const MAX_ATTEMPTS = 100;

export function generateChallenge(seed: string, difficulty: number): Challenge {
    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > MAX_DIFFICULTY) {
        throw new RangeError(`Difficulty must be an integer between 1 and ${MAX_DIFFICULTY}`);
    }
    const rng = new GameSeedGenerator(seed);

    const startMoves = generateMoves(difficulty * 10, rng);
    const start = new Cube().applyAlg(startMoves);
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const referenceMoves = generateMoves(difficulty, rng);
        const target = start.applyAlg(referenceMoves);
        if (!start.equals(target)) {
            return {
                version: 1,
                seed,
                startMoves,
                referenceMoves
            };
        }
    }
    throw new Error(`Could not generate a distinct target after ${MAX_ATTEMPTS} attempts`);
}

function generateMoves(length: number, rng: GameSeedGenerator): Move[] {
    const faces: FaceName[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    const result: Move[] = [];
    let previousFace: FaceName | null = null;
    for (let i = 0; i < length; i++) {
        const availableFaces = faces.filter(face => face !== previousFace);
        const face = rng.choose(availableFaces);
        previousFace = face;
        let move: Move = face;
        const suffix = rng.randomRange(0, 2);
        if (suffix === 1) move += "'";
        else if (suffix === 2) move += "2";
        result.push(move as Move);
    }
    return result;
}
