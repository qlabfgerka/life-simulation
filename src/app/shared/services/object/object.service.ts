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
}
