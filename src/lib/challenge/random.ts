export class GameSeedGenerator {
  private a!: number;
  private b!: number;
  private c!: number;
  private d!: number;

  constructor(seedString: string) {
    this.reseed(seedString);
  }

  /**
   * Hashes a string seed into four 32-bit state integers using MurmurHash3
   */
  private reseed(seedString: string): void {
    let h1 = 1779033703 ^ seedString.length;
    let h2 = 3024734711 ^ seedString.length;
    let h3 = 3362625948 ^ seedString.length;
    let h4 = 502494325 ^ seedString.length;

    for (let i = 0; i < seedString.length; i++) {
      const k = seedString.charCodeAt(i);
      h1 = Math.imul(h1 ^ k, 3432918353);
      h1 = (h1 << 15) | (h1 >>> 17);
      h2 = Math.imul(h2 ^ k, 461845907);
      h2 = (h2 << 13) | (h2 >>> 19);
      h3 = Math.imul(h3 ^ k, 239482938);
      h4 = Math.imul(h4 ^ k, 129382019);
    }

    this.a = (h1 ^ (h1 >>> 16)) >>> 0;
    this.b = (h2 ^ (h2 >>> 13)) >>> 0;
    this.c = (h3 ^ (h3 >>> 16)) >>> 0;
    this.d = (h4 ^ (h4 >>> 15)) >>> 0;
  }

  /**
   * Returns a deterministic float between 0.0 (inclusive) and 1.0 (exclusive)
   */
  public next(): number {
    this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
    let t = (this.a + this.b) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.d = (this.d + 1) | 0;
    t = (t + this.d) | 0;
    this.c = (this.c + t) | 0;
    return (t >>> 0) / 4294967296;
  }

  /**
   * Helper: Get a bounded integer between min and max (inclusive)
   */
  public randomRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Helper: Pick a random element from an array deterministically
   */
  public choose<T>(array: T[]): T {
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }
}
