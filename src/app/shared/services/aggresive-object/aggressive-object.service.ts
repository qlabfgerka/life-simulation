import { Injectable } from '@angular/core';
import { FoodPairDTO } from '../../models/food-pair/food-pair.model';
import { ObjectDTO } from '../../models/object/object.model';
import { CommonService } from '../common/common.service';

@Injectable({
  providedIn: 'root',
})
export class AggressiveObjectService {
  constructor(private readonly commonService: CommonService) {}

  public generateObjects(
    amount: number,
    color: string,
    typeId: number,
    dieRate: number,
    spawnRate: number,
    constant: number,
    radius: number
  ): ObjectDTO[] {
    const objects: ObjectDTO[] = new Array<ObjectDTO>();

    for (let i = 0; i < amount; i++) {
      objects.push(
        new ObjectDTO(color, typeId, dieRate, spawnRate, constant, radius)
      );
    }

    return objects;
  }

  public initializePositions(objects: ObjectDTO[], size: number): void {
    for (const object of objects) this.initObject(object, size);
  }

  public assignFood(objects: ObjectDTO[], food: FoodPairDTO[]): void {
    const shuffled = objects.sort(() => Math.random() - 0.5);
    let currentFoodIndex: number = 0;
    let objectIndex: number = 0;

    for (const object of shuffled) {
      if (currentFoodIndex >= food.length) return;

      food[currentFoodIndex].objects[objectIndex] = object.id;

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
    }

    return objects;
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

  private initObject(object: ObjectDTO, size: number): void {
    const radius = object.radius / 2;
    if (Math.random() < 0.5) {
      object.y = this.commonService.getRandomIntInclusive(
        -size + radius,
        size - radius
      );
      if (Math.random() < 0.5) object.x = -size + radius;
      else object.x = size - radius;
    } else {
      object.x = this.commonService.getRandomIntInclusive(
        -size + radius,
        size - radius
      );
      if (Math.random() < 0.5) object.y = -size + radius;
      else object.y = size - radius;
    }
  }
}
