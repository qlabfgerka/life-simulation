export class PopulationDTO {
  typeId: number;
  color: string;
  population: Array<number>;

  constructor(typeId: number, color: string) {
    this.typeId = typeId;
    this.color = color;
    this.population = new Array(10).fill(-1);
  }
}
