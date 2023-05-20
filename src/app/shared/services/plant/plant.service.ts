import { Injectable } from '@angular/core';
import { PlantType } from '../../models/plant/plant-type.enum';
import { PlantDTO } from '../../models/plant/plant.model';
import { CommonHelper } from '../../helpers/common/common.helper';
import { SmartObjectService } from '../smart-object/smart-object.service';

@Injectable({
  providedIn: 'root',
})
export class PlantService {
  constructor(private readonly smartObjectService: SmartObjectService) {}

  public generatePlants(
    amount: number,
    typeId: PlantType,
    size: number,
    growthRate: number,
    spreadRadius: number,
    value: number,
    seedOutput: number,
    variation: number
  ): PlantDTO[] {
    const plants: PlantDTO[] = new Array<PlantDTO>();

    for (let i = 0; i < amount; i++) {
      plants.push(new PlantDTO(typeId, size, growthRate, spreadRadius, value, seedOutput, variation));
    }

    return plants;
  }

  public initializePositions(plants: PlantDTO[], size: number, world: Array<Array<number>>): void {
    for (const plant of plants) this.initPlant(plant, size, world);
  }

  private initPlant(plant: PlantDTO, size: number, world: Array<Array<number>>): void {
    if (plant.typeId === PlantType.aquatic) return this.spawnInWater(plant, size, world);

    this.spawnOnLand(plant, size, world);
  }

  private spawnInWater(plant: PlantDTO, size: number, world: Array<Array<number>>): void {
    const plantSize = plant.size / 2;

    do {
      plant.x = CommonHelper.getRandomIntInclusive(-size + plantSize, size - plantSize);
      plant.y = CommonHelper.getRandomIntInclusive(-size + plantSize, size - plantSize);
    } while (!this.smartObjectService.isNearWater(plant.y + size, plant.x + size, size, world));
  }

  private spawnOnLand(plant: PlantDTO, size: number, world: Array<Array<number>>): void {
    const plantSize = plant.size / 2;

    do {
      plant.x = CommonHelper.getRandomIntInclusive(-size + plantSize, size - plantSize);
      plant.y = CommonHelper.getRandomIntInclusive(-size + plantSize, size - plantSize);
    } while (this.smartObjectService.isNearWater(plant.y + size, plant.x + size, size, world));
  }
}
