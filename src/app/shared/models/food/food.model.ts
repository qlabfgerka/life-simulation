export class FoodDTO {
  value: number;
  x: number;
  y: number;
  height: number;
  width: number;

  constructor(
    value: number,
    x: number,
    y: number,
    height: number,
    width: number
  ) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
  }
}
