import { Injectable } from '@angular/core';
import { PlantType } from '../../models/plant/plant-type.enum';
import { PlantDTO } from '../../models/plant/plant.model';
import { CommonHelper } from '../../helpers/common/common.helper';
import { SmartObjectService } from '../smart-object/smart-object.service';
import * as THREE from 'three';
import { ThreeHelper } from '../../helpers/three/three.helper';

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

  public update(
    plants: PlantDTO[],
    scene: THREE.Scene,
    size: number,
    world: Array<Array<number>>,
    totalTime: number
  ): [PlantDTO[], THREE.Scene] {
    let newborns: PlantDTO[] = [];
    let delta: number;
    let moveDelta: number;

    for (const plant of plants) {
      delta = +totalTime.toFixed(2) % plant.growthRate;
      moveDelta = +totalTime.toFixed(2) % 1;

      if (moveDelta === 0 && totalTime > 0 && plant.typeId === PlantType.aquatic) this.moveRandom(plant, size, world);

      if (delta === 0 && totalTime > 0) newborns = newborns.concat(this.updateValues(plant, size, world));
    }

    // Initialize newborn objects
    for (const newPlant of newborns) {
      ThreeHelper.getPlantMesh(newPlant);
      plants.push(newPlant);
      scene.add(newPlant.mesh);
    }

    return [plants, scene];
  }

  private updateValues(plant: PlantDTO, size: number, world: Array<Array<number>>): PlantDTO[] {
    let newborns: PlantDTO[] = [];

    if (plant.maturity >= 1) plant.maturity = 1;
    else {
      plant.maturity += 0.25;

      const plantSize = (plant.maturity + 1) * plant.size;
      plant.mesh.geometry = new THREE.BoxGeometry(plantSize, plantSize, plantSize);

      if (Math.random() < plant.maturity) newborns = this.reproduce(plant, size, world);
    }

    return newborns;
  }

  private moveRandom(plant: PlantDTO, size: number, world: Array<Array<number>>): void {
    do {
      plant.x += CommonHelper.getRandomIntInclusive(-plant.size, plant.size);
      plant.y += CommonHelper.getRandomIntInclusive(-plant.size, plant.size);
    } while (!this.smartObjectService.isNearWater(plant.y + size, plant.x + size, size, world));

    plant.mesh.position.x = plant.x;
    plant.mesh.position.y = plant.y;
  }

  private reproduce(plant: PlantDTO, size: number, world: Array<Array<number>>): PlantDTO[] {
    const newborns: PlantDTO[] = [];
    const amount: number = CommonHelper.getRandomIntInclusive(0, Math.round(plant.seedOutput));
    let newborn: PlantDTO;

    for (let i = 0; i < amount; i++) {
      newborn = new PlantDTO(
        plant.typeId,
        this.mutate(plant.size, plant.variation, 2, 15),
        Math.round(this.mutate(plant.growthRate, plant.variation, 0, 100)),
        this.mutate(plant.spreadRadius, plant.variation, 1, 10),
        this.mutate(plant.value, plant.variation, 0, 1),
        this.mutate(plant.seedOutput, plant.variation, 0, 20),
        plant.variation
      );

      if (plant.typeId === PlantType.aquatic) this.spawnNearbyWater(plant, newborn, size, world);
      else this.spawnNearby(plant, newborn, size, world);

      newborns.push(newborn);
    }

    return newborns;
  }

  private mutate(first: number, variation: number, min: number, max: number): number {
    variation = Math.random() > 0.5 ? 1 - variation : 1 + variation;

    let value = first * variation;

    if (value < min) value = min;
    if (value > max) value = max;

    return value;
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

  private spawnNearbyWater(original: PlantDTO, newborn: PlantDTO, size: number, world: Array<Array<number>>): void {
    let maxIter: number = 50;
    let iter: number = 0;
    const spread: number = original.spreadRadius;

    do {
      newborn.x = CommonHelper.getRandomIntInclusive(original.x - size - spread, original.x + size + spread);
      newborn.y = CommonHelper.getRandomIntInclusive(original.y - size - spread, original.y + size + spread);
      iter++;
    } while (!this.smartObjectService.isNearWater(newborn.y + size, newborn.x + size, size, world) && iter < maxIter);
  }

  private spawnNearby(original: PlantDTO, newborn: PlantDTO, size: number, world: Array<Array<number>>): void {
    let maxIter: number = 50;
    let iter: number = 0;
    const spread: number = original.spreadRadius;

    do {
      newborn.x = CommonHelper.getRandomIntInclusive(original.x - size - spread, original.x + size + spread);
      newborn.y = CommonHelper.getRandomIntInclusive(original.y - size - spread, original.y + size + spread);
      iter++;
    } while (this.smartObjectService.isNearWater(newborn.y + size, newborn.x + size, size, world) && iter < maxIter);
  }
}
