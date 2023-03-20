import { Injectable } from '@angular/core';
import { EvolvingObjectDTO } from '../../models/evolving-object/evolving-object.model';
import { FoodDTO } from '../../models/food/food.model';
import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';

@Injectable({
  providedIn: 'root',
})
export class EvolvingObjectService {
  constructor() {}

  public generateObjects(
    amount: number,
    typeId: number,
    energy: number,
    radius: number,
    velocity: number,
    perception: number
  ): EvolvingObjectDTO[] {
    const objects: EvolvingObjectDTO[] = new Array<EvolvingObjectDTO>();
    const color: string = CommonHelper.getRandomHexColor();

    for (let i = 0; i < amount; i++) {
      objects.push(
        new EvolvingObjectDTO(
          color,
          typeId,
          energy,
          radius,
          velocity,
          perception
        )
      );
    }

    return objects;
  }

  public initializePositions(objects: EvolvingObjectDTO[], size: number): void {
    for (const object of objects) this.initObject(object, size);
  }

  public updatePositions(
    objects: EvolvingObjectDTO[],
    food: FoodDTO[],
    scene: THREE.Scene,
    size: number
  ): void {
    let moved: boolean;
    let toSplice: Array<number> = [];

    for (let i = objects.length - 1; i >= 0; i--) {
      //If object is safe, don't decrease the energy
      if (objects[i].safe) continue;

      //Decrease the energy
      objects[i].energy -=
        Math.pow(objects[i].radius, 3) * Math.pow(objects[i].velocity, 2) +
        objects[i].perception;

      if (objects[i].energy < 0) {
        toSplice.push(i);
        continue;
      }

      moved = false;

      //Check for nearby food and move to it
      if (objects[i].foodFound < 2)
        moved = this.checkForFood(food, objects[i], scene);

      //Check if there are big objects nearby
      //or if it can consume a smaller object
      if (objects[i].foodFound < 2)
        moved = this.checkForObjects(objects, objects[i], toSplice, i);

      //Object has already moved, no need to move it again
      if (moved) continue;

      //If object has not found food, move it randomly
      //If object has found food, move it towards the safe area
      if (objects[i].foodFound < 2) this.moveRandom(objects[i], size);
      else this.moveToBase(objects[i], size);

      //If object is safe, don't decrease the energy
      if (objects[i].safe) continue;
    }

    toSplice = [...new Set(toSplice)];
    toSplice = toSplice.sort((a, b) => b - a);
    for (const index of toSplice) {
      // Kill the object, if it has depleted it's energy
      scene.remove(objects[index].mesh);
      objects.splice(index, 1);
    }
  }

  public newGeneration(
    objects: EvolvingObjectDTO[],
    size: number
  ): EvolvingObjectDTO[] {
    const newborns: EvolvingObjectDTO[] = [];
    const color: string = CommonHelper.getRandomHexColor();
    let mutate: boolean;
    let factor: number;
    let currentTypeId: number = Math.max(
      ...objects.map((object: EvolvingObjectDTO) => object.typeId)
    );
    let newborn: EvolvingObjectDTO;

    for (const object of objects) {
      if (object.foodFound >= 2) {
        mutate = Math.random() < 0.1;
        factor = Math.random() < 0.5 ? 2 : 0.5;
        newborn = new EvolvingObjectDTO(
          color,
          ++currentTypeId,
          object.initialEnergy,
          mutate ? object.radius : object.radius * factor,
          mutate ? object.velocity : object.velocity * factor,
          mutate ? object.perception : object.perception * factor
        );
        this.initObject(newborn, size);
        newborns.push(newborn);
      }

      object.safe = false;
      object.foodFound = 0;
      object.energy = object.initialEnergy;
    }

    return objects.concat(newborns);
  }

  private checkForFood(
    food: FoodDTO[],
    object: EvolvingObjectDTO,
    scene: THREE.Scene
  ): boolean {
    let foodPosition: THREE.Vector3;
    let moved: boolean = false;
    let objectPosition: THREE.Vector3 = object.mesh.position.clone();

    for (let j = food.length - 1; j >= 0; j--) {
      foodPosition = food[j].mesh.position.clone();

      if (
        objectPosition.distanceTo(foodPosition) <
        object.perception + object.radius
      ) {
        moved = true;
        if (this.moveToFood(object, food[j])) {
          ++object.foodFound;
          object.radius += food[j].value;
          object.mesh.geometry = new THREE.SphereGeometry(
            object.radius,
            object.radius,
            object.radius
          );
          scene.remove(food[j].mesh);
          food.splice(j, 1);
        }
      }
    }

    return moved;
  }

  private checkForObjects(
    objects: EvolvingObjectDTO[],
    object: EvolvingObjectDTO,
    toSplice: Array<number>,
    index: number
  ): boolean {
    let sphere1: THREE.Sphere;
    let sphere2: THREE.Sphere;
    let moved: boolean = false;

    for (let j = objects.length - 1; j >= 0; j--) {
      if (j == index) continue;
      if (
        object.radius < objects[j].radius * 0.8 &&
        object.mesh.position.distanceTo(objects[j].mesh.position) <
          object.perception + object.radius
      ) {
        this.moveFromObject(object, objects[j]);
        moved = true;
        break;
      } else if (object.radius * 0.8 >= objects[j].radius) {
        sphere1 = new THREE.Sphere(object.mesh.position, object.radius);
        sphere2 = new THREE.Sphere(objects[j].mesh.position, objects[j].radius);

        if (!sphere1.intersectsSphere(sphere2)) continue;

        object.radius += objects[j].radius * 0.2;

        toSplice.push(j);
      }
    }

    return moved;
  }

  private moveRandom(object: EvolvingObjectDTO, size: number): void {
    object.x += CommonHelper.getRandomIntInclusive(
      -object.radius,
      object.radius
    );
    object.y += CommonHelper.getRandomIntInclusive(
      -object.radius,
      object.radius
    );

    if (
      object.x > size ||
      object.x < -size ||
      object.y > size ||
      object.y < -size
    )
      this.initObject(object, size);

    object.mesh.position.x = object.x;
    object.mesh.position.y = object.y;
  }

  private moveToBase(object: EvolvingObjectDTO, size: number): void {
    const direction = this.getDirectionToClosestEdge(object, size);

    object.mesh.position.add(direction.multiplyScalar(object.velocity));
    object.x = object.mesh.position.x;
    object.y = object.mesh.position.y;

    if (this.checkIfSafe(object, size)) object.safe = true;
  }

  private moveToFood(object: EvolvingObjectDTO, food: FoodDTO): boolean {
    const direction = new THREE.Vector3()
      .subVectors(food.mesh.position, object.mesh.position)
      .normalize();

    object.mesh.position.add(direction.multiplyScalar(object.velocity));
    object.x = object.mesh.position.x;
    object.y = object.mesh.position.y;

    const box = new THREE.Box3().setFromObject(food.mesh);
    const sphere = new THREE.Sphere(object.mesh.position, object.radius);

    return box.intersectsSphere(sphere);
  }

  private moveFromObject(
    first: EvolvingObjectDTO,
    second: EvolvingObjectDTO
  ): void {
    const direction = new THREE.Vector3()
      .subVectors(second.mesh.position, first.mesh.position)
      .normalize();

    first.mesh.position.add(direction.multiplyScalar(-first.velocity));
    first.x = first.mesh.position.x;
    first.y = first.mesh.position.y;
  }

  private initObject(object: EvolvingObjectDTO, size: number): void {
    const radius = object.radius / 2;
    if (Math.random() < 0.5) {
      object.y = CommonHelper.getRandomIntInclusive(
        -size + radius,
        size - radius
      );
      if (Math.random() < 0.5) object.x = -size + radius;
      else object.x = size - radius;
    } else {
      object.x = CommonHelper.getRandomIntInclusive(
        -size + radius,
        size - radius
      );
      if (Math.random() < 0.5) object.y = -size + radius;
      else object.y = size - radius;
    }
  }

  private checkIfSafe(object: EvolvingObjectDTO, size: number): boolean {
    const radius: number = object.radius / 2;
    if (object.x < -size + radius || object.x > size - radius) return true;
    if (object.y < -size + radius || object.y > size - radius) return true;
    return false;
  }

  private getDirectionToClosestEdge(
    object: EvolvingObjectDTO,
    size: number
  ): THREE.Vector3 {
    const spherePosition = object.mesh.position.clone();

    //Calculate the distance between the sphere's position and the edges of the rectangle
    const distanceToLeftEdge = spherePosition.x + size;
    const distanceToRightEdge = size - spherePosition.x;
    const distanceToTopEdge = size - spherePosition.y;
    const distanceToBottomEdge = spherePosition.y + size;

    //Determine the closest edge
    const minDistance = Math.min(
      distanceToLeftEdge,
      distanceToRightEdge,
      distanceToTopEdge,
      distanceToBottomEdge
    );

    //Return the direction to the closest point on the edge
    if (minDistance === distanceToLeftEdge) {
      return new THREE.Vector3(-1, 0, 0);
    } else if (minDistance === distanceToRightEdge) {
      return new THREE.Vector3(1, 0, 0);
    } else if (minDistance === distanceToTopEdge) {
      return new THREE.Vector3(0, 1, 0);
    } else {
      return new THREE.Vector3(0, -1, 0);
    }
  }
}
