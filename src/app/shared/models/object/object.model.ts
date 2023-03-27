import { nanoid } from 'nanoid';

export class ObjectDTO {
  id: string;
  typeId: number;
  color: string;
  dieRate: number;
  spawnRate: number;
  constant: number;
  x: number;
  y: number;
  radius: number;
  mesh: THREE.Mesh;
  foodFound: number;

  /**
   *
   */
  constructor(color: string, typeId: number, dieRate: number, spawnRate: number, constant: number, radius: number = 5) {
    this.id = nanoid();
    this.typeId = typeId;
    this.color = color;
    this.dieRate = dieRate;
    this.spawnRate = spawnRate;
    this.constant = constant;
    this.x = 0;
    this.y = 0;
    this.radius = radius;
    this.foodFound = 0;
    this.mesh = null!;
  }
}
