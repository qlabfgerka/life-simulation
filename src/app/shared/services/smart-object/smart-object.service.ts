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

      // Move the object
      this.moveObject(objects[i], objects, food, world, size, scene);

      // If the object is near water, it can drink
      if (this.isNearWater(objects[i].y + size, objects[i].x + size, size, world)) objects[i].thirst = 0;

      // Update the values every interval (for example every second)
      if (intervalPassed) this.updateValues(objects[i], size);

      // Object has aged, kill it
      if (objects[i].currentAge > objects[i].age) toSplice.push(i);

      // Object has dehydrated, kill it
      if (objects[i].thirst >= 1) toSplice.push(i);

      // Just to make sure the object stays in the same 2D plane
      objects[i].mesh.position.z = 50;
    }

    // Remove duplicates and sort them
    toSplice = [...new Set(toSplice)];
    toSplice = toSplice.sort((a, b) => b - a);
    for (const index of toSplice) {
      // Kill the object
      scene.remove(objects[index].mesh);
      objects.splice(index, 1);
    }

    // Initialize newborn objects
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
    let startY = Math.trunc(y) - 5;
    let startX = Math.trunc(x) - 5;

    if (startY < 0) startY = 0;
    if (startX < 0) startX = 0;

    let endY = Math.trunc(y) + 5;
    let endX = Math.trunc(x) + 5;

    if (endY > 2 * size - 1) endY = 2 * size - 1;
    if (endX > 2 * size - 1) endX = 2 * size - 1;

    for (let i = startY; i < endY; i++) for (let j = startX; j < endX; j++) if (world[i][j] === 2) return true;

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

  private updateValues(object: SmartObjectDTO, size: number): void {
    // Countdown the reproduction counter
    // once the counter reaches zero, the object can reproduce
    if (object.reproductionCooldown > 0) object.reproductionCooldown -= 0.1;
    else object.reproductionCooldown = 0;

    // Age the object
    ++object.currentAge;

    // Get a new random target to move to
    object.getRandomTarget(size);

    // Update the thirst factor, update it faster if object is hungry
    if (object.thirst < 1) object.thirst += object.hunger === 1 ? 0.2 : 0.05;
    else object.thirst = 1;

    // Update the hunger factor
    if (object.hunger < 1) object.hunger += 0.1;
    else object.hunger = 1;

    // Update the reproduction factor
    if (object.reproduction < 1) object.reproduction += 0.025;
    else object.reproduction = 1;
  }

  private moveObject(
    first: SmartObjectDTO,
    objects: SmartObjectDTO[],
    food: FoodDTO[],
    world: Array<Array<number>>,
    size: number,
    scene: THREE.Scene
  ): void {
    let moved: boolean = false;

    // If the reproduction rate is the highest, try to find a partner
    if (first.reproduction > first.hunger && first.reproduction > first.thirst)
      moved = this.findPartner(first, objects, world, size);

    // If the thirst rate is the highest, try to find water
    if (first.thirst > first.reproduction && first.thirst > first.hunger) moved = this.findWater(first, world, size);

    // If the hunger rate is the highest, try to find food
    if (first.hunger > first.reproduction && first.hunger > first.thirst)
      moved = this.findFood(first, food, world, size, scene);

    // If the object has not yet moved, move to a random target
    if (!moved) this.moveTowardsTarget(first, first.target, world, size);
  }

  private moveTowardsTarget(
    object: SmartObjectDTO,
    target: THREE.Vector3,
    world: Array<Array<number>>,
    size: number
  ): void {
    target.x = Math.trunc(target.x);
    target.y = Math.trunc(target.y);

    let direction = new THREE.Vector3().copy(target).sub(object.mesh.position).normalize();
    let predicted: THREE.Vector3;
    let x: number;
    let y: number;

    // Get the new position after the move
    predicted = new THREE.Vector3().copy(object.mesh.position).add(direction.multiplyScalar(object.velocity));
    x = Math.trunc(predicted.x);
    y = Math.trunc(predicted.y);

    // If the new position is not water, move to there
    if (world[y + size][x + size] !== 2) {
      object.mesh.position.x = predicted.x;
      object.mesh.position.y = predicted.y;
    } else {
      // Otherwise rotate the direction and move there
      direction = direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

      object.mesh.position.add(direction.multiplyScalar(10 * object.velocity));
    }

    object.x = Math.trunc(object.mesh.position.x);
    object.y = Math.trunc(object.mesh.position.y);
  }

  private findPartner(
    object: SmartObjectDTO,
    objects: SmartObjectDTO[],
    world: Array<Array<number>>,
    size: number
  ): boolean {
    const possiblePartners: SmartObjectDTO[] = [];

    for (const other of objects) {
      if (object.id === other.id) continue;

      // If object is within perception, is the opposite gender and same type (prey or predator)
      // then add that object to the list of possible partners
      if (
        object.mesh.position.distanceTo(other.mesh.position) < object.perception + object.radius &&
        object.gender !== other.gender &&
        object.typeId === other.typeId
      )
        possiblePartners.push(other);
    }

    // No possible partners, return the object has not moved
    if (possiblePartners.length === 0) return false;

    // Sort the possible partners by size
    possiblePartners.sort((a, b) => b.radius - a.radius);

    // Move to the partner with the biggest size
    this.moveTowardsTarget(object, possiblePartners[0].mesh.position, world, size);

    // Objeft has moved
    return true;
  }

  private findWater(object: SmartObjectDTO, world: Array<Array<number>>, size: number): boolean {
    // Initialize a bounding box around the object based on perception
    let startY: number = Math.trunc(object.y + size - object.radius - object.perception);
    let startX: number = Math.trunc(object.x + size - object.radius - object.perception);

    if (startY < 0) startY = 0;
    if (startX < 0) startX = 0;

    let endY: number = Math.trunc(object.y + size + object.radius + object.perception);
    let endX: number = Math.trunc(object.x + size + object.radius + object.perception);

    if (endY > 2 * size - 1) endY = 2 * size - 1;
    if (endX > 2 * size - 1) endX = 2 * size - 1;

    // Search for water in the bounding box
    for (let i = startY; i < endY; i++) {
      for (let j = startX; j < endX; j++) {
        if (world[i][j] !== 2) continue;

        // If water is found, move to the water
        this.moveTowardsTarget(object, new THREE.Vector3(i - size, j - size, 50), world, size);
        return true;
      }
    }

    return false;
  }

  private findFood(
    object: SmartObjectDTO,
    food: FoodDTO[],
    world: Array<Array<number>>,
    size: number,
    scene: THREE.Scene
  ): boolean {
    let box: THREE.Box3;
    let sphere: THREE.Sphere;

    for (let i = food.length - 1; i >= 0; i--) {
      // Check if food is within the perception of the object
      if (object.mesh.position.distanceTo(food[i].mesh.position) < object.perception + object.radius) {
        box = new THREE.Box3().setFromObject(food[i].mesh);
        sphere = new THREE.Sphere(object.mesh.position, object.radius);

        // If object intersects food, it is already there
        // eat the food and remove it from the scene
        if (box.intersectsSphere(sphere)) {
          // Decrease the hunger factor
          object.hunger -= food[i].value;
          if (object.hunger < 0) object.hunger = 0;

          scene.remove(food[i].mesh);
          food.splice(i, 1);

          // Object has not moved, as it has already reached the food
          return false;
        }

        // Move toward the food
        this.moveTowardsTarget(object, food[i].mesh.position, world, size);
        return true;
      }
    }

    // Object has not moved
    return false;
  }

  private objectsOverlap(first: SmartObjectDTO, second: SmartObjectDTO): boolean {
    const sphere1 = new THREE.Sphere(first.mesh.position, first.radius);
    const sphere2 = new THREE.Sphere(second.mesh.position, second.radius);

    return sphere1.intersectsSphere(sphere2);
  }
}
