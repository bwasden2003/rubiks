import { Cube } from '../cube/cube';
import type { Challenge } from '../challenge/types';
import { generateChallenge } from '../challenge/generator';

export class Game {
    private challenge: Challenge;
    private cube: Cube;
    private difficulty: number;
    constructor(seed: string) {
        this.difficulty = 3; // default difficulty
        // Generate the initial challenge based on the seed and a default difficulty of 3
        // need to turn easy, medium, hard into difficulty values
        this.challenge = generateChallenge(seed, this.difficulty);
        this.cube = new Cube().applyAlg(this.challenge.startMoves);
    }

    get currentCube(): Cube {
        return this.cube.clone();
    }
}
