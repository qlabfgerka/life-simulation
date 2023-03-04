import { nanoid } from 'nanoid';

export class ObjectDTO {
  id: string;
  color: string;
  dieRate: number;
  spawnRate: number;
  x: number;
  y: number;

  /**
   *
   */
  constructor(color: string, dieRate: number, spawnRate: number) {
    this.id = nanoid();
    this.color = color;
    this.dieRate = dieRate;
    this.spawnRate = spawnRate;
    this.x = 0;
    this.y = 0;
  }
}
