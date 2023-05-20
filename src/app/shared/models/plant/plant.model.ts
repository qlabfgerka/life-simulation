import { nanoid } from 'nanoid';
import { PlantType } from './plant-type.enum';

export class PlantDTO {
  id: string;
  typeId: PlantType;
  size: number;
  maturity: number;
  growthRate: number;
  spreadRadius: number;
  value: number;
  seedOutput: number;
  variation: number;
  color: string;

  x: number;
  y: number;
  mesh: THREE.Mesh;

  constructor(
    typeId: PlantType,
    size: number,
    growthRate: number,
    spreadRadius: number,
    value: number,
    seedOutput: number,
    variation: number
  ) {
    this.id = nanoid();
    this.typeId = typeId;
    this.size = size;
    this.growthRate = growthRate;
    this.spreadRadius = spreadRadius;
    this.value = value;
    this.seedOutput = seedOutput;
    this.variation = variation;

    this.color = typeId === PlantType.land ? '#FFEB3B' : '#013220';

    this.maturity = 0;
    this.x = 0;
    this.y = 0;
    this.mesh = null!;
  }
}
