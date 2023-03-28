import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';
import { FoodPairDTO } from '../../models/food-pair/food-pair.model';
import { FoodDTO } from '../../models/food/food.model';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  public spawnFood(
    food: FoodDTO[],
    size: number,
    amount: number,
    foodSize: number,
    scene: THREE.Scene,
    world: Array<Array<number>> | null = null
  ): void {
    let geometry: THREE.BoxGeometry;
    let material: THREE.MeshBasicMaterial;
    let mesh: THREE.Mesh;
    let x: number = 0;
    let y: number = 0;

    const sizeChunk = size / 4;

    for (let i = 0; i < amount; i++) {
      if (world) {
        do {
          x = CommonHelper.getRandomIntInclusive(-size + sizeChunk, size - sizeChunk);
          y = CommonHelper.getRandomIntInclusive(-size + sizeChunk, size - sizeChunk);
        } while (world[y + size][x + size] === 2);
      } else {
        x = CommonHelper.getRandomIntInclusive(-size + sizeChunk, size - sizeChunk);
        y = CommonHelper.getRandomIntInclusive(-size + sizeChunk, size - sizeChunk);
      }

      geometry = new THREE.BoxGeometry(foodSize, foodSize, foodSize);
      material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.position.z = 10;

      food.push(new FoodDTO(0.5, x, y, 5, 5, mesh));
      scene.add(mesh);
    }
  }

  public spawnFoodPairs(
    foods: FoodPairDTO[],
    size: number,
    amount: number,
    foodSize: number,
    scene: THREE.Scene
  ): void {
    let food: FoodPairDTO;
    for (let i = 0; i < amount; i++) {
      food = new FoodPairDTO(size, foodSize);
      scene.add(food.food[0].mesh);
      scene.add(food.food[1].mesh);

      foods.push(food);
    }
  }
}
