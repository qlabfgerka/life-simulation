import { Injectable } from '@angular/core';
import { EvolvingObjectDTO } from '../../models/evolving-object/evolving-object.model';

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

  /*public updatePositions(
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

  public updateLife(objects: ObjectDTO[]): ObjectDTO[] {
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
