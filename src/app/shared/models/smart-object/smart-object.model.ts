import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';
import { ObjectDTO } from '../object/object.model';
import { Aggression } from '../aggression/aggression.enum';

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
  target: THREE.Vector3;

  isFlying: boolean;
  energy: number;

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
    this.target = new THREE.Vector3(0, 0, 50);

    this.isFlying = typeId === Aggression.flying;
    this.energy = 1;
  }

  public getRandomTarget(size: number) {
    this.target.x = CommonHelper.getRandomIntInclusive(-size + 10, size - 10);
    this.target.y = CommonHelper.getRandomIntInclusive(-size + 10, size - 10);
  }
}
