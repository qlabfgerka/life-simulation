import { Injectable } from '@angular/core';
import { ObjectDTO } from '../../models/object/object.model';
import { CommonService } from '../common/common.service';

@Injectable({
  providedIn: 'root',
})
export class ObjectService {
  constructor(private readonly commonService: CommonService) {}

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
      object.x += this.commonService.getRandomIntInclusive(-2, 2);
      object.y += this.commonService.getRandomIntInclusive(-2, 2);

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
  }

  private initObject(object: ObjectDTO, width: number, height: number): void {
    object.x = this.commonService.getRandomIntInclusive(10, width - 10);
    object.y = this.commonService.getRandomIntInclusive(10, height - 10);
  }
}
