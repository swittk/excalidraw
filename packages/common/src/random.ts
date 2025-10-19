import { nanoid } from "nanoid";
import { isTestEnv } from "./utils";

class SeededRandom {
  constructor(private seed: number | null) {}

  public next() {
    if (this.seed) {
      this.seed = Math.imul(48271, this.seed);
      this.seed &= 2 ** 31 - 1;
      return this.seed / 2 ** 31;
    }

    return Math.random();
  }
}

let random = new SeededRandom(Date.now());
let testIdBase = 0;

export const randomInteger = () => Math.floor(random.next() * 2 ** 31);

export const reseed = (seed: number) => {
  random = new SeededRandom(seed);
  testIdBase = 0;
};

export const randomId = () => (isTestEnv() ? `id${testIdBase++}` : nanoid());
