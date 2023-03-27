import { Terrain } from './terrain.enum';

export class TerrainDTO {
  color: string;
  description: Terrain;

  constructor(color: string, description: Terrain) {
    this.color = color;
    this.description = description;
  }

  public static getTerrains(): TerrainDTO[] {
    const terrains: TerrainDTO[] = [];

    terrains.push(new TerrainDTO('#f6d7b0', Terrain.sand));
    terrains.push(new TerrainDTO('#41980a', Terrain.grass));
    terrains.push(new TerrainDTO('#74ccf4', Terrain.water));
    terrains.push(new TerrainDTO('#22311d', Terrain.forest));
    terrains.push(new TerrainDTO('#272727', Terrain.mountain));
    terrains.push(new TerrainDTO('#F7F5EB', Terrain.peak));

    return terrains;
  }
}
