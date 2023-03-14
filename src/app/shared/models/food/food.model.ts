export class FoodDTO {
  value: number;
  x: number;
  y: number;
  height: number;
  width: number;
  mesh: THREE.Mesh;

  constructor(
    value: number,
    x: number,
    y: number,
    height: number,
    width: number,
    mesh: THREE.Mesh
  ) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.mesh = mesh;
  }
}
