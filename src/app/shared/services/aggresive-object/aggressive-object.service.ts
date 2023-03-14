import { Injectable } from '@angular/core';
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
