import { Injectable } from '@angular/core';
import { CommonHelper } from '../../helpers/common/common.helper';
import { SmartObjectDTO } from '../../models/smart-object/smart-object.model';
import { Terrain } from '../../models/terrain/terrain.enum';
import { TerrainDTO } from '../../models/terrain/terrain.model';

@Injectable({
  providedIn: 'root',
})
export class SmartObjectService {
  public generateObjects(
    amount: number,
    color: string,
    typeId: number,
    hunger: number,
    thirst: number,
    reproduction: number,
    age: number,
    perception: number,
    gender: boolean,
    velocity: number,
    radius: number,
    variation: number
  ): SmartObjectDTO[] {
    const objects: SmartObjectDTO[] = new Array<SmartObjectDTO>();

    for (let i = 0; i < amount; i++) {
      objects.push(
        new SmartObjectDTO(
          color,
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

  public initializePositions(objects: SmartObjectDTO[], size: number): void {
    for (const object of objects) this.initObject(object, size);
  }

  private initObject(object: SmartObjectDTO, size: number): void {
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
