import { TestBed } from '@angular/core/testing';

import { WorldGenerationService } from './world-generation.service';

describe('WorldGenerationService', () => {
  let service: WorldGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorldGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add water', () => {
    const size: number = 50;
    const radius: number = 5;
    let matrix: Array<Array<number>>;

    matrix = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    service.addWater(matrix, size, radius);

    //Matrix size should not change
    expect(matrix.length).toBe(size);
    expect(matrix[0].length).toBe(size);

    //Matrix should contain water
    expect(matrix.some((value: number[]) => value.includes(2))).toBeTrue();
  });

  it('should not add water', () => {
    const size: number = 1;
    const radius: number = 5;
    let matrix: Array<Array<number>>;

    matrix = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    service.addWater(matrix, size, radius);

    //Matrix size should not change
    expect(matrix.length).toBe(size);
    expect(matrix[0].length).toBe(size);

    //Matrix should NOT contain water as it is too small
    expect(matrix.some((value: number[]) => value.includes(2))).toBeFalse();
  });

  it('should get value', () => {
    const length = 100;

    let index = 0;
    let value = service.getValue(length, index);

    expect(value).toBe(2);

    index = 41;
    value = service.getValue(length, index);

    expect(value).toBe(0);

    index = 76;
    value = service.getValue(length, index);

    expect(value).toBe(1);

    index = 91;
    value = service.getValue(length, index);

    expect(value).toBe(3);

    index = 93;
    value = service.getValue(length, index);

    expect(value).toBe(5);

    index = 96;
    value = service.getValue(length, index);

    expect(value).toBe(4);
  });

  it('should not get value', () => {
    const length = -5123;

    let index = 2;
    let value = service.getValue(length, index);

    expect(value).toBe(-1);
  });
});
