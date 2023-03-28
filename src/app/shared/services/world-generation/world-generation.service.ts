import { Injectable } from '@angular/core';
import * as Noise from 'noisejs';
import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';
import { TerrainDTO } from '../../models/terrain/terrain.model';

@Injectable({
  providedIn: 'root',
})
export class WorldGenerationService {
  public generateWorld(
    size: number,
    waters: number,
    radius: number,
    scene: THREE.Scene,
    usePerlin: boolean,
    scale: number
  ): Array<Array<number>> {
    size = size * 2;
    const geometry = new THREE.BoxGeometry(size, size, 0);
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d')!;

    const terrains = TerrainDTO.getTerrains();

    // Terrain is random either sand or grass
    let terrain = Math.random() < 0.5 ? 0 : 1;

    let worldMatrix: Array<Array<number>>;

    if (!usePerlin) {
      worldMatrix = Array(size)
        .fill(terrain)
        .map(() => Array(size).fill(terrain));

      for (let i = 0; i < waters; i++) this.addWater(worldMatrix, size, radius);
    } else worldMatrix = this.getPerlinNoise(size, scale);

    context.fillStyle = terrains[terrain].color;
    context.fillRect(0, 0, size, size);

    const cellSize = size / worldMatrix.length;
    for (let row = 0; row < worldMatrix.length; row++) {
      for (let col = 0; col < worldMatrix[row].length; col++) {
        if (worldMatrix[row][col] === 0) continue;

        const x = col * cellSize;
        const y = row * cellSize;
        context.fillStyle = terrains[worldMatrix[row][col]].color;
        context.fillRect(x, y, cellSize, cellSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);

    return worldMatrix;
  }

  private addWater(matrix: Array<Array<number>>, size: number, radius: number): void {
    const chunk = size / 3;
    radius = radius + 10;

    let startRow = CommonHelper.getRandomIntInclusive(radius, matrix.length - radius - 10);
    let endRow = startRow + CommonHelper.getRandomIntInclusive(10, chunk);
    let startColumn = CommonHelper.getRandomIntInclusive(radius, matrix[0].length - radius - 10);
    let endColumn = startColumn + CommonHelper.getRandomIntInclusive(10, chunk);

    if (endRow >= matrix[0].length - radius) endRow = matrix[0].length - radius;
    if (endColumn >= matrix[0].length - radius) endColumn = matrix[0].length - radius;

    for (let i = startRow; i < endRow; i++) {
      for (let j = startColumn; j < endColumn; j++) matrix[i][j] = 2;
    }
  }

  private getPerlinNoise(size: number, scale: number): Array<Array<number>> {
    const matrix: Array<Array<number>> = [];
    const noise = new Noise.Noise(Math.random());

    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        const noiseValue = noise.perlin2(i / scale, j / scale);
        matrix[i][j] = this.transformValue(noiseValue);
      }
    }

    return matrix;
  }

  private transformValue(value: number): number {
    if (value < -0.2) return 2;
    if (value >= -0.2 && value < 0.5) return 1;
    if (value >= 0.5 && value < 0.8) return 3;
    if (value >= 0.8 && value < 0.85) return 0;
    if (value >= 0.85 && value < 0.9) return 5;
    if (value > 0.9) return 4;

    return 2;
  }
}
