import { ObjectDTO } from '../object/object.model';

export class SmartObjectDTO extends ObjectDTO {
  hunger: number;
  thirst: number;
  reproduction: number;
  age: number;
  perception: number;
  gender: boolean;
  velocity: number;
  variation: number;

  reproductionCooldown: number;
  currentAge: number;

  constructor(
    color: string,
    typeId: number,
    radius: number,
    hunger: number,
    thirst: number,
    reproduction: number,
    age: number,
    perception: number,
    gender: boolean,
    velocity: number,
    variation: number
  ) {
    super(color, typeId, 0, 0, 0, radius);

    this.hunger = hunger;
    this.thirst = thirst;
    this.reproduction = reproduction;
    this.age = age;
    this.perception = perception;
    this.gender = gender;
    this.velocity = velocity;
    this.variation = variation;

    this.currentAge = 0;
    this.reproductionCooldown = reproduction;
  }
}
