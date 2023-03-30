import { ObjectDTO } from '../object/object.model';

export class EvolvingObjectDTO extends ObjectDTO {
  initialEnergy: number;
  energy: number;
  velocity: number;
  perception: number;
  safe: boolean;

  constructor(color: string, typeId: number, energy: number, radius: number, velocity: number, perception: number) {
    super(color, typeId, 0, 0, 0, radius);
    this.initialEnergy = energy;
    this.energy = energy;
    this.velocity = velocity;
    this.perception = perception;
    this.safe = false;
  }
}
