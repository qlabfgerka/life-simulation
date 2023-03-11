import { Injectable } from '@angular/core';
import { EvolvingObjectDTO } from '../../models/evolving-object/evolving-object.model';
import { FoodDTO } from '../../models/food/food.model';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class EvolvingObjectService {
  constructor() {}

  public getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public generateObjects(
    amount: number,
    typeId: number,
    energy: number,
    radius: number,
    velocity: number,
    perception: number
  ): EvolvingObjectDTO[] {
    const objects: EvolvingObjectDTO[] = new Array<EvolvingObjectDTO>();
    const color: string = '#' + ((Math.random() * 0xffffff) << 0).toString(16);

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

    for (let i = objects.length - 1; i >= 0; i--) {
      moved = false;

      //Check for nearby food and move to it
      moved = this.checkForFood(food, objects[i], scene);

      // Check if there are big objects nearby
      // or if it can consume a smaller object
      moved = this.checkForObjects(objects, objects[i], scene, i);

      //Move randomly if no food found or if not running away
      if (moved) continue;

      this.moveRandom(objects[i], size);

      objects[i].energy -=
        Math.pow(objects[i].radius, 3) * Math.pow(objects[i].velocity, 2) +
        objects[i].perception;

      if (objects[i].energy > 0) continue;

      scene.remove(objects[i].mesh);
      objects.splice(i, 1);
    }
  }

  /*public updateLife(objects: ObjectDTO[]): ObjectDTO[] {
    const newborns: ObjectDTO[] = new Array<ObjectDTO>();
    const objectTypes = [
      ...new Set(objects.map((object: ObjectDTO) => object.typeId)),
    ];
    let popSizes: { [key: string]: number } = {};

    for (const typeId of objectTypes) {
      popSizes[typeId] = objects.filter(
        (object: ObjectDTO) => object.typeId === typeId
      ).length;
    }

    for (let i = objects.length - 1; i >= 0; i--) {
      const randomLife = Math.random();
      const randomDeath = Math.random();
      const popSize = popSizes[objects[i].typeId];

      if (randomLife < objects[i].spawnRate) {
        newborns.push(
          new ObjectDTO(
            objects[i].color,
            objects[i].typeId,
            objects[i].dieRate,
            objects[i].spawnRate,
            objects[i].constant
          )
        );
      }

      if (randomDeath < objects[i].dieRate + objects[i].constant * popSize) {
        objects.splice(i, 1);
      }
    }

    objects = objects.concat(newborns);

    return objects;
  }*/

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
          object.radius += food[j].value;
          object.mesh.geometry = new THREE.SphereGeometry(
            object.radius,
            object.radius,
            object.radius
          );
          scene.remove(food[j].mesh);
          food.splice(j, 1);
        }
        break;
      }
    }

    return moved;
  }

  private checkForObjects(
    objects: EvolvingObjectDTO[],
    object: EvolvingObjectDTO,
    scene: THREE.Scene,
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

        scene.remove(objects[j].mesh);
        objects.splice(j, 1);
      }
    }

    return moved;
  }

  private moveRandom(object: EvolvingObjectDTO, size: number): void {
    object.x += this.getRandomIntInclusive(-object.radius, object.radius);
    object.y += this.getRandomIntInclusive(-object.radius, object.radius);

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
      object.y = this.getRandomIntInclusive(-size + radius, size - radius);
      if (Math.random() < 0.5) object.x = -size + radius;
      else object.x = size - radius;
    } else {
      object.x = this.getRandomIntInclusive(-size + radius, size - radius);
      if (Math.random() < 0.5) object.y = -size + radius;
      else object.y = size - radius;
    }
  }
}
