import { Injectable } from '@angular/core';
import { ObjectDTO } from '../../models/object/object.model';

@Injectable({
  providedIn: 'root',
})
export class ObjectService {
  constructor() {}

  public generateObjects(
    amount: number,
    color: string,
    typeId: number,
    dieRate: number,
    spawnRate: number,
    constant: number
  ): ObjectDTO[] {
    const objects: ObjectDTO[] = new Array<ObjectDTO>();

    for (let i = 0; i < amount; i++) {
      objects.push(new ObjectDTO(color, typeId, dieRate, spawnRate, constant));
    }

    return objects;
  }

  public initializePositions(
    objects: ObjectDTO[],
    width: number,
    height: number
  ): void {
    for (const object of objects) {
      this.initObject(object, width, height);
    }
  }

  public updatePositions(
    objects: ObjectDTO[],
    width: number,
    height: number
  ): void {
    for (const object of objects) {
      object.x += this.getRandomIntInclusive(-2, 2);
      object.y += this.getRandomIntInclusive(-2, 2);

      if (object.x > width || object.x < 0 || object.y > height || object.y < 0)
        this.initObject(object, width, height);
    }
  }

  public updateLife(objects: ObjectDTO[]): void {
    const newborns: ObjectDTO[] = new Array<ObjectDTO>();
    for (let i = objects.length - 1; i >= 0; i--) {
      const randomLife = Math.random();
      const randomDeath = Math.random();
      const popSize = objects.filter(
        (object: ObjectDTO) => object.typeId === objects[i].typeId
      ).length;

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
  }

  private getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private initObject(object: ObjectDTO, width: number, height: number): void {
    object.x = this.getRandomIntInclusive(10, width - 10);
    object.y = this.getRandomIntInclusive(10, height - 10);
  }
}
