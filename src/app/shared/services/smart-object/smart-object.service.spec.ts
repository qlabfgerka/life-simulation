import { TestBed } from '@angular/core/testing';

import { SmartObjectService } from './smart-object.service';
import { SmartObjectDTO } from '../../models/smart-object/smart-object.model';
import * as THREE from 'three';
import { Aggression } from '../../models/aggression/aggression.enum';

describe('SmartObjectService', () => {
  let service: SmartObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate objects', () => {
    const amount = 10;
    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff'];

    const objects = service.generateObjects(amount, colors, 0, 1, 1, 1, 1, 1, 1, 1, 1);

    expect(objects).toBeDefined();
    expect(objects.length).toBe(10);
  });

  it('should not generate objects', () => {
    const amount = -1;
    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff'];

    const objects = service.generateObjects(amount, colors, 0, 1, 1, 1, 1, 1, 1, 1, 1);

    expect(objects).toBeDefined();
    expect(objects.length).toBe(0);
  });

  it('should initialize positions', () => {
    const amount = 10;
    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff'];
    const size = 100;
    let matrix: Array<Array<number>>;

    matrix = Array(size * 2)
      .fill(0)
      .map(() => Array(size * 2).fill(0));

    const objects = service.generateObjects(amount, colors, 0, 1, 1, 1, 1, 1, 1, 1, 1);

    for (const object of objects) {
      expect(object.x).toBe(0);
      expect(object.y).toBe(0);
    }

    service.initializePositions(objects, size, matrix);

    for (const object of objects) {
      expect(object.x).not.toBe(0);
      expect(object.y).not.toBe(0);
    }
  });

  it('should not initialize positions', () => {
    const amount = 10;
    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff'];
    const size = 0;
    let matrix: Array<Array<number>>;

    matrix = Array(size * 2)
      .fill(0)
      .map(() => Array(size * 2).fill(0));

    const objects = service.generateObjects(amount, colors, 0, 1, 1, 1, 1, 1, 1, 1, 1);

    for (const object of objects) {
      expect(object.x).toBe(0);
      expect(object.y).toBe(0);
    }

    service.initializePositions(objects, size, matrix);

    for (const object of objects) {
      expect([-0.5, 0.5, 0].includes(object.x)).toEqual(true);
      expect([-0.5, 0.5, 0].includes(object.y)).toEqual(true);
    }
  });

  it('should reproduce', () => {
    const first = new SmartObjectDTO('#000000', 0, 1, 1, 1, 1, 1, 1, true, 1, 1);
    const second = new SmartObjectDTO('#000000', 0, 1, 1, 1, 1, 1, 1, false, 1, 1);

    first.reproductionCooldown = 0;
    second.reproductionCooldown = 0;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);

    first.mesh = mesh;
    second.mesh = mesh;

    expect(service.reproduce(first, second)).not.toBeNull();

    first.reproductionCooldown = 0;
    second.reproductionCooldown = 0;

    expect(service.reproduce(second, first)).not.toBeNull();
  });

  it('should not reproduce', () => {
    const first = new SmartObjectDTO('#000000', 0, 1, 1, 1, 1, 1, 1, true, 1, 1);
    const second = new SmartObjectDTO('#000000', 0, 1, 1, 1, 1, 1, 1, false, 1, 1);

    first.reproductionCooldown = 0;
    second.reproductionCooldown = 0;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);

    first.mesh = mesh;
    second.mesh = mesh;

    expect(service.reproduce(null!, null!)).toBeNull();
    expect(service.reproduce(null!, second)).toBeNull();
    expect(service.reproduce(first, null!)).toBeNull();

    second.gender = true;

    expect(service.reproduce(first, second)).toBeNull();

    second.gender = false;
    second.typeId = first.typeId + 1;

    expect(service.reproduce(first, second)).toBeNull();

    first.reproductionCooldown = 1;

    expect(service.reproduce(first, second)).toBeNull();

    first.reproductionCooldown = 0;
    second.reproductionCooldown = 1;

    expect(service.reproduce(first, second)).toBeNull();
  });

  it('should eat object', () => {
    const predator = new SmartObjectDTO('#000000', Aggression.predator, 1, 1, 1, 1, 1, 1, true, 1, 1);
    const prey = new SmartObjectDTO('#000000', Aggression.prey, 1, 1, 1, 1, 1, 1, true, 1, 1);

    predator.reproductionCooldown = 0;
    prey.reproductionCooldown = 0;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);

    predator.mesh = mesh;
    prey.mesh = mesh;

    expect(service.eatObject(predator, prey)).toBeTrue();
    expect(predator.hunger).toBe(0);
  });

  it('should not eat object', () => {
    const predator = new SmartObjectDTO('#000000', Aggression.predator, 1, 1, 1, 1, 1, 1, true, 1, 1);
    const prey = new SmartObjectDTO('#000000', Aggression.prey, 1, 1, 1, 1, 1, 1, true, 1, 1);

    predator.reproductionCooldown = 0;
    prey.reproductionCooldown = 0;

    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);

    predator.mesh = mesh;
    prey.mesh = mesh;

    expect(service.eatObject(null!, null!)).toBeFalse();
    expect(service.eatObject(null!, prey)).toBeFalse();
    expect(service.eatObject(predator, null!)).toBeFalse();
    expect(service.eatObject(prey, null!)).toBeFalse();
    expect(service.eatObject(null!, predator)).toBeFalse();

    expect(service.eatObject(predator, predator)).toBeFalse();
    expect(service.eatObject(prey, prey)).toBeFalse();

    expect(service.eatObject(prey, predator)).toBeFalse();

    predator.typeId = Aggression.prey;

    expect(service.eatObject(predator, prey)).toBeFalse();

    predator.typeId = Aggression.predator;
    prey.typeId = Aggression.predator;

    expect(service.eatObject(predator, prey)).toBeFalse();
  });

  it('should be near water', () => {
    const size: number = 50;
    let matrix: Array<Array<number>>;

    matrix = Array(size * 2)
      .fill(0)
      .map(() => Array(size * 2).fill(0));

    matrix[4][4] = 2;

    expect(service.isNearWater(0, 0, size, matrix)).toBeTrue();
    expect(service.isNearWater(-1, -1, size, matrix)).toBeTrue();
  });

  it('should not be near water', () => {
    const size: number = 50;
    let matrix: Array<Array<number>>;

    matrix = Array(size * 2)
      .fill(0)
      .map(() => Array(size * 2).fill(0));

    matrix[5][5] = 2;

    expect(service.isNearWater(0, 0, size, matrix)).toBeFalse();
    expect(service.isNearWater(0, 0, size, [])).toBeFalse();
  });

  it('should update values', () => {
    const object = new SmartObjectDTO('#000000', 0, 1, 0, 0, 0, 1, 1, true, 1, 1);
    const size = 100;

    service.updateValues(object, size);

    expect(object.reproductionCooldown).toBe(0);
    expect(object.currentAge).toBe(1);
    expect(object.thirst).toBe(0.005);
    expect(object.hunger).toBe(0.005);
    expect(object.reproduction).toBe(0.025);
  });

  it('should not update values', () => {
    expect(function () {
      service.updateValues(null!, -1);
    }).toThrow(new Error('Object should not be null'));
  });
});
