import { Injectable } from '@angular/core';
import { CommonHelper } from '../../helpers/common/common.helper';
import { SmartObjectDTO } from '../../models/smart-object/smart-object.model';

@Injectable({
  providedIn: 'root',
})
export class SmartObjectService {
  public generateObjects(
    amount: number,
    colors: Array<string>,
    typeId: number,
    hunger: number,
    thirst: number,
    reproduction: number,
    age: number,
    perception: number,
    velocity: number,
    radius: number,
    variation: number
  ): SmartObjectDTO[] {
    const objects: SmartObjectDTO[] = new Array<SmartObjectDTO>();
    let gender: boolean;

    for (let i = 0; i < amount; i++) {
      gender = Math.random() > 0.5;

      objects.push(
        new SmartObjectDTO(
          colors[+gender],
          typeId,
          radius,
          hunger,
          thirst,
          reproduction,
          age,
          perception,
          gender,
          velocity,
          variation
        )
      );
    }

    return objects;
  }

  public initializePositions(objects: SmartObjectDTO[], size: number, world: Array<Array<number>>): void {
    for (const object of objects) this.initObject(object, size, world);
  }

  private initObject(object: SmartObjectDTO, size: number, world: Array<Array<number>>): void {
    const radius = object.radius / 2;

    do {
      if (Math.random() < 0.5) {
        object.y = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
        if (Math.random() < 0.5) object.x = -size + radius;
        else object.x = size - radius;
      } else {
        object.x = CommonHelper.getRandomIntInclusive(-size + radius, size - radius);
        if (Math.random() < 0.5) object.y = -size + radius;
        else object.y = size - radius;
      }
    } while (this.isNearWater(object.y, object.x, size, world));
  }

  private isNearWater(y: number, x: number, size: number, world: Array<Array<number>>): boolean {
    let startY = y - 5;
    let endY = y + 5;
    let startX = x - 5;
    let endX = x + 5;

    if (startY < 0) startY = 0;
    if (startX < 0) startX = 0;
    if (endY > size - 1) endY = size - 1;
    if (endX > size - 1) endX = size - 1;

    for (let y = startY; y < endY; y++) for (let x = startX; x < endX; x++) if (world[y][x] === 2) return true;

    return false;
  }
}
