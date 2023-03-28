import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';
import { ThreeHelper } from '../../helpers/three/three.helper';
import { FoodDTO } from '../../models/food/food.model';
import { SmartObjectDTO } from '../../models/smart-object/smart-object.model';

@Injectable({
  providedIn: 'root',
})
export class SmartObjectService {
  public generateObjects(
    amount: number,
    colors: Array<string>,
    typeId: number,
    hunger: number,
    thirst: number,
    reproduction: number,
    age: number,
    perception: number,
    velocity: number,
    radius: number,
    variation: number
  ): SmartObjectDTO[] {
    const objects: SmartObjectDTO[] = new Array<SmartObjectDTO>();
    let gender: boolean;

    for (let i = 0; i < amount; i++) {
      gender = Math.random() > 0.5;

      objects.push(
        new SmartObjectDTO(
          colors[+gender],
          typeId,
          radius,
          hunger,
          thirst,
          reproduction,
          age,
          perception,
          gender,
          velocity,
          variation
        )
      );
    }

    return objects;
  }

  public initializePositions(objects: SmartObjectDTO[], size: number, world: Array<Array<number>>): void {
    for (const object of objects) this.initObject(object, size, world);
  }

  public update(
    objects: SmartObjectDTO[],
    food: FoodDTO[],
    scene: THREE.Scene,
    size: number,
    world: Array<Array<number>>,
    intervalPassed: boolean
  ): [SmartObjectDTO[], THREE.Scene] {
    let newborn: SmartObjectDTO | null;
    let newborns: Array<SmartObjectDTO> = [];

    let toSplice: Array<number> = [];

    for (let i = 0; i < objects.length; i++) {
      for (let j = 0; j < objects.length; j++) {
        if (i === j) continue;

        newborn = this.reproduce(objects[i], objects[j]);
        if (newborn) newborns.push(newborn);
      }

      // Update the values every interval (for example every second)
      if (intervalPassed) this.updateValues(objects[i]);

      if (objects[i].currentAge > objects[i].age) toSplice.push(i);
    }

    toSplice = [...new Set(toSplice)];
    toSplice = toSplice.sort((a, b) => b - a);
    for (const index of toSplice) {
      // Kill the object
      scene.remove(objects[index].mesh);
      objects.splice(index, 1);
    }

    for (const newObject of newborns) {
      this.initObject(newObject, size, world);
      ThreeHelper.getMesh(newObject);
      objects.push(newObject);
      scene.add(newObject.mesh);
    }

    return [objects.concat(newborns), scene];
  }

  private initObject(object: SmartObjectDTO, size: number, world: Array<Array<number>>): void {
    const radius = object.radius / 2;

    do {
      if (Math.random() < 0.5) {
        object.y = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
        if (Math.random() < 0.5) object.x = -size + radius;
        else object.x = size - radius;
      } else {
        object.x = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
        if (Math.random() < 0.5) object.y = -size + radius;
        else object.y = size - radius;
      }
    } while (this.isNearWater(object.y + size, object.x + size, size, world));
  }

  private isNearWater(y: number, x: number, size: number, world: Array<Array<number>>): boolean {
    let startY = y - 5;
    let endY = y + 5;
    let startX = x - 5;
    let endX = x + 5;

    if (startY < 0) startY = 0;
    if (startX < 0) startX = 0;
    if (endY > size - 1) endY = size - 1;
    if (endX > size - 1) endX = size - 1;

    for (let y = startY; y < endY; y++) for (let x = startX; x < endX; x++) if (world[y][x] === 2) return true;

    return false;
  }

  private reproduce(first: SmartObjectDTO, second: SmartObjectDTO): SmartObjectDTO | null {
    // If they are not the same type (both prey or both predators), they cannot mutate
    // They also cannot mutate if they are the same gender
    if (first.typeId !== second.typeId || first.gender === second.gender) return null;

    // If either of the objects has a reproduction cooldown, they cannot reproduce
    if (first.reproductionCooldown !== 0 || second.reproductionCooldown !== 0) return null;

    // If objects don't overlap, they cant mutate
    if (!this.objectsOverlap(first, second)) return null;

    // Decide the gender
    const genderDecision = Math.random() > 0.5;

    // Reset the reproduction cooldown for both
    first.reproductionCooldown = first.reproduction;
    second.reproductionCooldown = second.reproduction;

    // Create a newborn with mutated properties
    const newborn: SmartObjectDTO = new SmartObjectDTO(
      genderDecision ? first.color : second.color,
      first.typeId,
      this.mutate(first.radius, second.radius, first.variation, second.variation),
      this.mutate(first.hunger, second.hunger, first.variation, second.variation),
      this.mutate(first.thirst, second.thirst, first.variation, second.variation),
      this.mutate(first.reproduction, second.reproduction, first.variation, second.variation),
      this.mutate(first.age, second.age, first.variation, second.variation),
      this.mutate(first.perception, second.perception, first.variation, second.variation),
      genderDecision ? first.gender : second.gender,
      this.mutate(first.velocity, second.velocity, first.variation, second.variation),
      this.mutate(first.variation, second.variation, first.variation, second.variation)
    );

    return newborn;
  }

  private mutate(first: number, second: number, firstVariation: number, secondVariation: number): number {
    // 50% chance to pick either of the parents' variations
    const variation: number = Math.random() > 0.5 ? firstVariation : secondVariation;

    // 50% chance to pick either first or second parent
    const value: number = Math.random() > 0.5 ? first : second;

    // Value will either be 1 + variation or 1 - variation
    // Example: variation = 0.05 -> factor is either 1.05 or 0.95
    const factor: number = Math.random() > 0.5 ? 1 - variation : 1 + variation;

    // Second variation is either 20% more or 20% less
    const thirdVariation: number = Math.random() > 0.5 ? 0.8 : 1.2;

    // Low chance of another factor
    const secondFactor: number = Math.random() < 0.1 ? thirdVariation : 1;

    return value * factor * secondFactor;
  }

  private updateValues(object: SmartObjectDTO): void {
    // Countdown the reproduction counter
    // once the counter reaches zero, the object can reproduce
    if (object.reproductionCooldown > 0) object.reproductionCooldown -= 0.1;
    else object.reproductionCooldown = 0;

    // Age the object
    ++object.currentAge;
  }

  private objectsOverlap(first: SmartObjectDTO, second: SmartObjectDTO): boolean {
    const sphere1 = new THREE.Sphere(first.mesh.position, first.radius);
    const sphere2 = new THREE.Sphere(second.mesh.position, second.radius);

    return sphere1.intersectsSphere(sphere2);
  }
}
