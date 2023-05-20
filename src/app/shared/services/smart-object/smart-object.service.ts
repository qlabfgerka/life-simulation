import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';
import { ThreeHelper } from '../../helpers/three/three.helper';
import { Aggression } from '../../models/aggression/aggression.enum';
import { SmartObjectDTO } from '../../models/smart-object/smart-object.model';
import { PlantDTO } from '../../models/plant/plant.model';

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
    plants: PlantDTO[],
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

        // Try to reproduce
        newborn = this.reproduce(objects[i], objects[j], size, world);
        if (newborn) newborns.push(newborn);

        // Try to eat object
        if (this.eatObject(objects[i], objects[j], size, world)) toSplice.push(j);
      }

      // Move the object
      this.moveObject(objects[i], objects, plants, world, size, scene);

      // If the object is near water, it can drink
      if (this.isNearWater(objects[i].y + size, objects[i].x + size, size, world) && objects[i].thirst > 0.5) {
        if (objects[i].typeId === Aggression.flying) objects[i].isFlying = false;
        objects[i].thirst -= 0.1;
      }

      // Update the values every interval (for example every second)
      if (intervalPassed) this.updateValues(objects[i], size, world);

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
    if (object.typeId === Aggression.aquatic) return this.spawnInWater(object, size, world);

    if (object.typeId === Aggression.flying) return this.spawnAnywhere(object, size, world);

    this.spawnOnEdge(object, size, world);
  }

  private spawnOnEdge(object: SmartObjectDTO, size: number, world: Array<Array<number>>): void {
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

  private spawnAnywhere(object: SmartObjectDTO, size: number, world: Array<Array<number>>): void {
    const radius = object.radius / 2;

    object.x = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
    object.y = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
  }

  private spawnInWater(object: SmartObjectDTO, size: number, world: Array<Array<number>>): void {
    const radius = object.radius / 2;

    do {
      object.x = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
      object.y = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
    } while (!this.isNearWater(object.y + size, object.x + size, size, world));
  }

  public isNearWater(y: number, x: number, size: number, world: Array<Array<number>>): boolean {
    if (world.length === 0 || world[0].length === 0) return false;

    let startY = Math.trunc(y) - 5;
    let startX = Math.trunc(x) - 5;

    if (startY < 0) startY = 0;
    if (startX < 0) startX = 0;

    let endY = startY + 5;
    let endX = startX + 5;

    if (endY > 2 * size - 1) endY = 2 * size - 1;
    if (endX > 2 * size - 1) endX = 2 * size - 1;

    // If bounding box includes water
    for (let i = startY; i < endY; i++) for (let j = startX; j < endX; j++) if (world[i][j] === 2) return true;

    return false;
  }

  public reproduce(
    first: SmartObjectDTO,
    second: SmartObjectDTO,
    size: number,
    world: Array<Array<number>>
  ): SmartObjectDTO | null {
    if (!first || !second) return null;

    // If they are not the same type (both prey or both predators), they cannot mutate
    // They also cannot mutate if they are the same gender
    if (first.typeId !== second.typeId || first.gender === second.gender) return null;

    // If either of the objects has a reproduction cooldown, they cannot reproduce
    if (first.reproductionCooldown !== 0 || second.reproductionCooldown !== 0) return null;

    // If objects don't overlap, they cant mutate
    if (!this.objectsOverlap(first, second)) return null;

    // Flying objects must be in forest and not flying
    if (first.typeId === Aggression.flying && second.typeId === Aggression.flying) {
      if (first.isFlying || second.isFlying) return null;

      if (world[first.y + size][first.x + size] !== 3) return null;
      if (world[second.y + size][second.x + size] !== 3) return null;
    }

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

  public eatObject(predator: SmartObjectDTO, prey: SmartObjectDTO, size: number, world: Array<Array<number>>): boolean {
    if (!predator || !prey) return false;

    // If object is not predator or flying, it can not eat objects
    if (predator.typeId !== Aggression.predator && predator.typeId !== Aggression.flying) return false;

    // If both objects are predators, they cannot eat eachother
    if (predator.typeId === prey.typeId) return false;

    // If objects don't overlap, they cant eat eachtoher
    if (!this.objectsOverlap(predator, prey)) return false;

    // Flying type predators cannot eat old prey
    if (predator.typeId === Aggression.flying && prey.currentAge > 20) return false;

    // Object must not be flying
    if (prey.isFlying) return false;

    // Flying objects cannot be eaten inside of the forest
    if (prey.typeId === Aggression.flying && world[prey.y + size][prey.x + size] === 3) return false;

    // Predator will eat prey, reset the hunger factor
    predator.hunger = 0;

    return true;
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

  public updateValues(object: SmartObjectDTO, size: number, world: Array<Array<number>>): void {
    if (!object) throw new Error('Object should not be null');

    // Countdown the reproduction counter
    // once the counter reaches zero, the object can reproduce
    if (object.reproductionCooldown > 0) object.reproductionCooldown -= 0.1;
    else object.reproductionCooldown = 0;

    // Age the object
    ++object.currentAge;

    if (object.typeId === Aggression.flying) object.energy -= 0.1;

    // Flying objects start to fly based on their energy and thirst
    if (object.typeId === Aggression.flying && object.energy > 0.5 && object.thirst <= 0.5) object.isFlying = true;

    // If flying objects have low energy or high thirst, they have to land
    if (object.typeId === Aggression.flying && (object.energy <= 0.5 || object.thirst > 0.5)) object.isFlying = false;

    if (object.typeId === Aggression.flying && !object.isFlying) {
      // Flying objects die in water if they're not flying
      if (world[object.y + size][object.x + size] === 2) object.currentAge = object.age + 1;
      // They gain energy quickly in forests if they're not flying
      else if (world[object.y + size][object.x + size] === 3) object.energy += 0.2;
      // They gain energy slowly on mountains if they're not flying
      else if (world[object.y + size][object.x + size] === 4) object.energy += 0.15;
    }

    // Get a new random target to move to
    object.getRandomTarget(size);

    // Update the thirst factor, update it faster if object is hungry
    if (object.thirst < 1) object.thirst += object.hunger === 1 ? 0.2 : 0.005 * object.radius;
    else object.thirst = 1;

    // Update the hunger factor
    if (object.hunger < 1) object.hunger += 0.005 / object.velocity;
    else object.hunger = 1;

    // Update the reproduction factor
    if (object.reproduction < 1) object.reproduction += 0.025;
    else object.reproduction = 1;
  }

  private moveObject(
    first: SmartObjectDTO,
    objects: SmartObjectDTO[],
    plants: PlantDTO[],
    world: Array<Array<number>>,
    size: number,
    scene: THREE.Scene
  ): void {
    let moved: boolean = false;

    // If the reproduction rate is the highest, try to find a partner
    if (first.reproduction > first.hunger && first.reproduction > first.thirst)
      moved = this.findPartner(first, objects, world, size, true);

    // If the thirst rate is the highest, try to find water
    if (first.thirst > first.reproduction && first.thirst > first.hunger)
      moved = this.findTerrain(first, objects, world, size, 2);

    // If the hunger rate is the highest, try to find plants if the object is prey
    // otherwise try to find a prey object
    if (first.hunger > first.reproduction && first.hunger > first.thirst)
      moved =
        first.typeId === Aggression.prey
          ? this.findPlant(first, objects, plants, world, size, scene)
          : this.findPartner(first, objects, world, size, false);

    // Flying objects should prefer to move towards forests
    if (!moved && first.typeId === Aggression.flying && first.energy < 0.52)
      moved = this.findTerrain(first, objects, world, size, 3);

    // If the object has not yet moved, move to a random target
    if (!moved) this.moveTowardsTarget(first, objects, first.target, world, size);
  }

  private moveTowardsTarget(
    object: SmartObjectDTO,
    objects: SmartObjectDTO[],
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

    if (object.typeId === Aggression.prey) direction = this.moveAwayFromPredators(object, objects, direction, size);

    // Get the new position after the move
    predicted = new THREE.Vector3().copy(object.mesh.position).add(direction.multiplyScalar(object.velocity));
    x = Math.trunc(predicted.x);
    y = Math.trunc(predicted.y);

    if (x < -size + 1) x = -size + 1;
    if (y < -size + 1) y = -size + 1;
    if (x > size - 1) x = size - 1;
    if (y > size - 1) y = size - 1;

    if (
      (object.typeId === Aggression.aquatic && world[y + size][x + size] !== 2) ||
      ((object.typeId === Aggression.predator || object.typeId === Aggression.prey) && world[y + size][x + size] === 2)
    ) {
      // Otherwise rotate the direction and move there
      direction = direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

      object.mesh.position.add(direction.multiplyScalar(10 * object.velocity));
    } else {
      object.mesh.position.x = predicted.x;
      object.mesh.position.y = predicted.y;
    }

    // Remove the decimals
    object.x = Math.trunc(object.mesh.position.x);
    object.y = Math.trunc(object.mesh.position.y);
  }

  private findPartner(
    object: SmartObjectDTO,
    objects: SmartObjectDTO[],
    world: Array<Array<number>>,
    size: number,
    partnering: boolean
  ): boolean {
    const possiblePartners: SmartObjectDTO[] = [];

    for (const other of objects) {
      if (object.id === other.id) continue;

      // If object is within perception, is the opposite gender and same type (prey or predator) and ready to reproduce
      // then add that object to the list of possible partners
      if (
        partnering &&
        object.mesh.position.distanceTo(other.mesh.position) < object.perception + object.radius &&
        object.gender !== other.gender &&
        object.typeId === other.typeId &&
        object.reproductionCooldown === 0 &&
        !object.isFlying &&
        !other.isFlying
      )
        possiblePartners.push(other);

      if (
        !partnering &&
        object.mesh.position.distanceTo(other.mesh.position) < object.perception + object.radius &&
        object.typeId !== other.typeId &&
        !other.isFlying
      ) {
        if (object.typeId === Aggression.flying && other.currentAge < 20) possiblePartners.push(other);
        else if (object.typeId !== Aggression.flying) possiblePartners.push(other);
      }
    }

    // No possible partners, return the object has not moved
    if (possiblePartners.length === 0) return false;

    // Sort the possible partners by size
    possiblePartners.sort((a, b) => b.radius - a.radius);

    // Move to the partner with the biggest size
    this.moveTowardsTarget(object, objects, possiblePartners[0].mesh.position, world, size);

    // Objeft has moved
    return true;
  }

  private findTerrain(
    object: SmartObjectDTO,
    objects: SmartObjectDTO[],
    world: Array<Array<number>>,
    size: number,
    terrain: number
  ): boolean {
    let startY: number;
    let startX: number;
    let endY: number;
    let endX: number;

    // Initialize a bounding box around the object based on perception
    [startY, endY, startX, endX] = this.getObjectBoundingBox(object, size);

    // Search for water in the bounding box
    for (let i = startY; i < endY; i++) {
      for (let j = startX; j < endX; j++) {
        if (world[i][j] !== terrain) continue;

        // If water is found, move to the water
        this.moveTowardsTarget(object, objects, new THREE.Vector3(i - size, j - size, 50), world, size);
        return true;
      }
    }

    return false;
  }

  private findPlant(
    object: SmartObjectDTO,
    objects: SmartObjectDTO[],
    plants: PlantDTO[],
    world: Array<Array<number>>,
    size: number,
    scene: THREE.Scene
  ): boolean {
    let box: THREE.Box3;
    let sphere: THREE.Sphere;
    let potentialFood: PlantDTO[] = [];

    for (let i = plants.length - 1; i >= 0; i--) {
      // Check if plant is within the perception of the object
      if (object.mesh.position.distanceTo(plants[i].mesh.position) < object.perception + object.radius) {
        box = new THREE.Box3().setFromObject(plants[i].mesh);
        sphere = new THREE.Sphere(object.mesh.position, object.radius);

        // If object intersects plant, it is already there
        // eat the plant and remove it from the scene
        if (box.intersectsSphere(sphere)) {
          // Decrease the hunger factor
          object.hunger -= plants[i].value;
          if (object.hunger < 0) object.hunger = 0;

          scene.remove(plants[i].mesh);
          plants.splice(i, 1);

          // Object has not moved, as it has already reached the plant
          return false;
        }

        potentialFood.push(plants[i]);
      }
    }

    // No possible plants, return the object has not moved
    if (potentialFood.length === 0) return false;

    // Sort the possible plants by maturity if the object is not too hungry
    if (object.hunger > 0.5) potentialFood.sort((a, b) => b.maturity - a.maturity);
    // Otherwise sort them by most nutritious
    else potentialFood.sort((a, b) => b.value - a.value);

    // Move to the partner with the biggest size
    this.moveTowardsTarget(object, objects, potentialFood[0].mesh.position, world, size);

    // Object has not moved
    return false;
  }

  private moveAwayFromPredators(
    prey: SmartObjectDTO,
    objects: SmartObjectDTO[],
    direction: THREE.Vector3,
    size: number
  ): THREE.Vector3 {
    // Get the predators
    const predators: Array<THREE.Vector3> = this.getNearbyPredators(prey, objects, size);

    // Number of search steps
    const steps = 20;

    // Find the direction with the least obstacles
    let minObstacles = Infinity;
    let bestDirection = new THREE.Vector3();

    let obstacles: number;
    let position: THREE.Vector3;

    for (let i = 0; i < steps; i++) {
      // Rotate the direction vector around the z-axis to sample different directions
      direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), (2 * Math.PI) / steps);

      // Count the number of obstacles in this direction up to the maximum search distance
      obstacles = 0;
      for (let j = 0; j < prey.perception; j++) {
        position = prey.mesh.position.clone().add(direction.clone().multiplyScalar(j));
        for (const predator of predators) {
          if (predator.distanceTo(position) < 1) {
            obstacles++;
            break;
          }
        }
      }

      // Update the best direction if this direction has fewer obstacles
      if (obstacles < minObstacles) {
        minObstacles = obstacles;
        bestDirection.copy(direction);
      }
    }

    return direction;
  }

  private getNearbyPredators(prey: SmartObjectDTO, objects: SmartObjectDTO[], size: number): Array<THREE.Vector3> {
    const predators: Array<THREE.Vector3> = [];
    let startY: number;
    let startX: number;
    let endY: number;
    let endX: number;
    let predator: SmartObjectDTO | undefined;

    // Initialize a bounding box around the object based on perception
    [startY, endY, startX, endX] = this.getObjectBoundingBox(prey, size);

    // Search for predators in the bounding box of the prey
    for (let i = startY; i < endY; i++) {
      for (let j = startX; j < endX; j++) {
        // Find predator at current [y, x]
        predator = objects.find((object: SmartObjectDTO) => object.y === i - size && object.x === j - size);

        // If object is predator add it to the predators array
        if (predator && predator.typeId === Aggression.predator)
          predators.push(new THREE.Vector3(predator.x, predator.y, 50));
      }
    }

    return predators;
  }

  private objectsOverlap(first: SmartObjectDTO, second: SmartObjectDTO): boolean {
    const sphere1 = new THREE.Sphere(first.mesh.position, first.radius);
    const sphere2 = new THREE.Sphere(second.mesh.position, second.radius);

    return sphere1.intersectsSphere(sphere2);
  }

  private getObjectBoundingBox(object: SmartObjectDTO, size: number): [number, number, number, number] {
    // Initialize a bounding box around the object based on perception
    let startY: number = Math.trunc(object.y + size - object.radius - object.perception);
    let startX: number = Math.trunc(object.x + size - object.radius - object.perception);

    if (startY < 0) startY = 0;
    if (startX < 0) startX = 0;

    let endY: number = Math.trunc(object.y + size + object.radius + object.perception);
    let endX: number = Math.trunc(object.x + size + object.radius + object.perception);

    if (endY > 2 * size - 1) endY = 2 * size - 1;
    if (endX > 2 * size - 1) endX = 2 * size - 1;

    return [startY, endY, startX, endX];
  }
}
