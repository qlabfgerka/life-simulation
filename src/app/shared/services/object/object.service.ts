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
    dieRate: number,
    spawnRate: number
  ): ObjectDTO[] {
    const objects: ObjectDTO[] = new Array<ObjectDTO>();

    for (let i = 0; i < amount; i++) {
      objects.push(new ObjectDTO(color, dieRate, spawnRate));
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
