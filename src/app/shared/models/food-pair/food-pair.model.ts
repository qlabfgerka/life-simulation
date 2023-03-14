import * as THREE from 'three';
import { FoodDTO } from '../food/food.model';
import { ObjectDTO } from '../object/object.model';

export class FoodPairDTO {
  food: [FoodDTO, FoodDTO];
  objects: [ObjectDTO?, ObjectDTO?];

  constructor(
    size: number,
    foodSize: number,
    first: ObjectDTO | undefined,
    second: ObjectDTO | undefined
  ) {
    const sizeChunk = size / 4;
    let x = this.getRandomIntInclusive(-size + sizeChunk, size - sizeChunk);
    let y = this.getRandomIntInclusive(-size + sizeChunk, size - sizeChunk);

    const firstFood = new FoodDTO(1, x, y, 5, 5, this.getMesh(foodSize, x, y));
    [x, y] = this.getSecondFoodPosition(x, y, size, 5);
    const secondFood = new FoodDTO(1, x, y, 5, 5, this.getMesh(foodSize, x, y));

    this.food = [firstFood, secondFood];
    this.objects = [first, second];
  }

  private getSecondFoodPosition(
    x: number,
    y: number,
    size: number,
    width: number
  ): [number, number] {
    let x2: number;

    if (x > size / 2) x2 = x - width - 5;
    else x2 = x + width + 5;

    return [x2, y];
  }

  private getMesh(foodSize: number, x: number, y: number): THREE.Mesh {
    let geometry = new THREE.BoxGeometry(foodSize, foodSize);
    let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x;
    mesh.position.y = y;

    return mesh;
  }

  private getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
