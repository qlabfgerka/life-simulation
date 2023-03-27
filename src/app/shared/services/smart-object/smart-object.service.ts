import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { CommonHelper } from '../../helpers/common/common.helper';
import { SmartObjectDTO } from '../../models/smart-object/smart-object.model';

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

  public generateWorld(size: number, waters: number, scene: THREE.Scene): void {
    size = size * 2;
    const geometry = new THREE.BoxGeometry(size, size, 1);
    const canvas = document.createElement('canvas');

    const colors = ['#f6d7b0', '#74ccf4'];

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d')!;

    const worldMatrix: Array<Array<number>> = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    for (let i = 0; i < waters; i++) this.addWater(worldMatrix, size);

    context.fillStyle = colors[0];
    context.fillRect(0, 0, size, size);

    const cellSize = size / worldMatrix.length;
    for (let row = 0; row < worldMatrix.length; row++) {
      for (let col = 0; col < worldMatrix[row].length; col++) {
        if (worldMatrix[row][col] === 0) continue;

        const x = col * cellSize;
        const y = row * cellSize;
        context.fillStyle = colors[worldMatrix[row][col]];
        context.fillRect(x, y, cellSize, cellSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
  }

  private addWater(matrix: Array<Array<number>>, size: number): void {
    const chunk = size / 3;

    let startRow = CommonHelper.getRandomIntInclusive(0, matrix.length);
    let endRow = startRow + CommonHelper.getRandomIntInclusive(10, chunk);
    let startColumn = CommonHelper.getRandomIntInclusive(0, matrix[0].length);
    let endColumn = startColumn + CommonHelper.getRandomIntInclusive(10, chunk);

    if (endRow >= matrix[0].length) endRow = matrix[0].length - 1;
    if (endColumn >= matrix[0].length) endColumn = matrix[0].length - 1;

    for (let i = startRow; i < endRow; i++) {
      for (let j = startColumn; j < endColumn; j++) matrix[i][j] = 1;
    }
  }
}
