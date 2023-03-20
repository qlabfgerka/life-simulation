import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';
import { Aggression } from '../../models/aggression/aggression.enum';
import { FoodPairDTO } from '../../models/food-pair/food-pair.model';
import { ObjectDTO } from '../../models/object/object.model';

@Injectable({
  providedIn: 'root',
})
export class AggressiveObjectService {
  constructor() {}

  public generateObjects(
    amount: number,
    color: string,
    typeId: number,
    radius: number
  ): ObjectDTO[] {
    const objects: ObjectDTO[] = new Array<ObjectDTO>();

    for (let i = 0; i < amount; i++) {
      objects.push(new ObjectDTO(color, typeId, 0, 0, 0, radius));
    }

    return objects;
  }

  public initializePositions(objects: ObjectDTO[], size: number): void {
    for (const object of objects) this.initObject(object, size);
  }

  public assignFood(objects: ObjectDTO[], food: FoodPairDTO[]): void {
    let shuffled = JSON.parse(JSON.stringify(objects));
    let currentFoodIndex: number = 0;
    let objectIndex: number = 0;

    if (shuffled.length < food.length * 2)
      shuffled = shuffled.concat(new Array(food.length * 2 - shuffled.length));

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (const object of shuffled) {
      if (currentFoodIndex >= food.length) return;

      if (object) food[currentFoodIndex].objects[objectIndex] = object.id;

      objectIndex = (objectIndex + 1) % 2;
      if (objectIndex === 0) ++currentFoodIndex;
    }
  }

  public moveToFood(objects: ObjectDTO[], foods: FoodPairDTO[]): ObjectDTO[] {
    let first: ObjectDTO;
    let second: ObjectDTO;

    for (const food of foods) {
      first = objects.find(
        (object: ObjectDTO) => object.id === food.objects[0]
      )!;
      second = objects.find(
        (object: ObjectDTO) => object.id === food.objects[1]
      )!;

      if (first) {
        first.x = food.food[0].x + 10;
        first.y = food.food[0].y + 10;
        first.mesh.position.x = first.x;
        first.mesh.position.y = first.y;
      }

      if (second) {
        second.x = food.food[1].x - 10;
        second.y = food.food[1].y - 10;
        second.mesh.position.x = second.x;
        second.mesh.position.y = second.y;
      }

      if (!first && !second) continue;

      if (first && !second) first.foodFound += 2;
      else if (!first && second) second.foodFound += 2;
      else if (
        first.typeId === Aggression.nonaggressive &&
        second.typeId === Aggression.nonaggressive
      ) {
        ++first.foodFound;
        ++second.foodFound;
      } else if (
        first.typeId === Aggression.nonaggressive &&
        second.typeId === Aggression.aggressive
      ) {
        first.foodFound += 0.5;
        second.foodFound += 1.5;
      } else if (
        first.typeId === Aggression.aggressive &&
        second.typeId === Aggression.nonaggressive
      ) {
        first.foodFound += 1.5;
        second.foodFound += 0.5;
      }
    }

    return objects;
  }

  public update(
    objects: ObjectDTO[],
    size: number,
    scene: THREE.Scene
  ): [ObjectDTO[], THREE.Scene] {
    const newborns: ObjectDTO[] = [];
    let newborn: ObjectDTO;
    let toSplice: Array<number> = [];

    for (let i = objects.length - 1; i >= 0; i--) {
      if (
        objects[i].foodFound === 0 ||
        (objects[i].foodFound === 0.5 && Math.random() > 0.5)
      ) {
        toSplice.push(i);
      } else if (
        (objects[i].foodFound === 1.5 && Math.random() > 0.5) ||
        objects[i].foodFound === 2
      ) {
        newborn = new ObjectDTO(
          objects[i].color,
          objects[i].typeId,
          objects[i].dieRate,
          objects[i].spawnRate,
          objects[i].constant,
          objects[i].radius
        );
        this.initObject(newborn, size);
        this.getMesh(newborn);
        newborns.push(newborn);
      }

      if (objects[i]) objects[i].foodFound = 0;
    }

    toSplice = [...new Set(toSplice)];
    toSplice = toSplice.sort((a, b) => b - a);
    for (const index of toSplice) {
      // Kill the object, if it has depleted it's energy
      scene.remove(objects[index].mesh);
      objects.splice(index, 1);
    }

    for (const newborn of newborns) scene.add(newborn.mesh);

    return [objects.concat(newborns), scene];
  }

  public removeEaten(food: FoodPairDTO[], scene: THREE.Scene): FoodPairDTO[] {
    for (let i = food.length - 1; i >= 0; i--) {
      if (food[i].objects[0] || food[i].objects[1]) {
        scene.remove(food[i].food[0].mesh);
        scene.remove(food[i].food[1].mesh);
        food.splice(i, 1);
      }
    }

    return food;
  }

  public removeFood(food: FoodPairDTO[], scene: THREE.Scene): FoodPairDTO[] {
    for (let i = food.length - 1; i >= 0; i--) {
      scene.remove(food[i].food[0].mesh);
      scene.remove(food[i].food[1].mesh);
      food.splice(i, 1);
    }

    return food;
  }

  public returnToBase(objects: ObjectDTO[], size: number): ObjectDTO[] {
    for (const object of objects) {
      this.initObject(object, size);
      object.mesh.position.x = object.x;
      object.mesh.position.y = object.y;
    }

    return objects;
  }

  public getMesh(object: ObjectDTO): void {
    const geometry = new THREE.SphereGeometry(
      object.radius,
      object.radius,
      object.radius
    );
    const material = new THREE.MeshBasicMaterial({ color: object.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = object.x;
    mesh.position.y = object.y;
    object.mesh = mesh;
  }

  private initObject(object: ObjectDTO, size: number): void {
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
}
