import { ObjectDTO } from '../object/object.model';

export class EvolvingObjectDTO extends ObjectDTO {
  initialEnergy: number;
  energy: number;
  radius: number;
  velocity: number;
  perception: number;
  mesh: THREE.Mesh;
  foodFound: number;
  safe: boolean;

  constructor(
    color: string,
    typeId: number,
    energy: number,
    radius: number,
    velocity: number,
    perception: number
  ) {
    super(color, typeId, 0, 0, 0);
    this.initialEnergy = energy;
    this.energy = energy;
    this.radius = radius;
    this.velocity = velocity;
    this.perception = perception;
    this.mesh = null!;
    this.foodFound = 0;
    this.safe = false;
  }
}
