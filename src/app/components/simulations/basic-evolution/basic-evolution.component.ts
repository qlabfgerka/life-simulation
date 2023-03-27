import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartDataset } from 'chart.js';
import { EvolvingObjectsDialogComponent } from 'src/app/shared/dialogs/evolving-objects-dialog/evolving-objects-dialog.component';
import { CommonHelper } from 'src/app/shared/helpers/common/common.helper';
import { ThreeHelper } from 'src/app/shared/helpers/three/three.helper';
import { ChartDTO } from 'src/app/shared/models/chart-data/chart-data.model';
import { EvolvingObjectDTO } from 'src/app/shared/models/evolving-object/evolving-object.model';
import { FoodDTO } from 'src/app/shared/models/food/food.model';
import { EvolvingObjectService } from 'src/app/shared/services/evolving-object/evolving-object.service';
import * as THREE from 'three';

@Component({
  selector: 'app-basic-evolution',
  templateUrl: './basic-evolution.component.html',
  styleUrls: ['./basic-evolution.component.scss'],
})
export class BasicEvolutionComponent {
  @ViewChild('frame', { static: false }) private readonly frame!: ElementRef;

  public objects!: EvolvingObjectDTO[];
  public food!: FoodDTO[];
  public paused: boolean = true;
  public foodAmount: number = 50;
  public foodSize: number = 10;
  public size: number = 250;

  public populationData!: ChartDTO;
  public velocityData!: ChartDTO;
  public radiusData!: ChartDTO;

  public percepionData!: ChartDTO;
  private labels: Array<number> = [];
  private populationDataset: Array<ChartDataset> = [];
  private velocityDataset: Array<ChartDataset> = [];
  private radiusDataset: Array<ChartDataset> = [];
  private perceptionDataset: Array<ChartDataset> = [];

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.reset();
  }

  constructor(private readonly evolvingObjectService: EvolvingObjectService, private readonly dialog: MatDialog) {}

  public openSettings(): void {
    const settingsDialogRef = this.dialog.open(EvolvingObjectsDialogComponent, {
      data: {
        objects: this.objects,
      },
    });

    settingsDialogRef.afterClosed().subscribe((data: any) => {
      if (!data) return;

      if (data.objects) this.objects = data.objects;

      this.reset();
    });
  }

  public play(): void {
    this.paused = false;

    this.animate();
  }

  public pause(): void {
    this.paused = true;
  }

  public reset(): void {
    if (this.id) cancelAnimationFrame(this.id);
    if (!this.objects || this.objects.length === 0) return;
    this.paused = true;

    this.frame.nativeElement.innerHTML = '';

    this.evolvingObjectService.initializePositions(this.objects, this.size);

    this.renderer = ThreeHelper.initRenderer(this.frame);
    this.camera = ThreeHelper.initCamera(this.size);

    this.populationDataset = [];
    this.velocityDataset = [];
    this.radiusDataset = [];
    this.perceptionDataset = [];
    this.scene = new THREE.Scene();
    this.food = [];
    this.labels = [1];
    this.prepareDatasets();

    ThreeHelper.drawObjects(this.objects, this.scene);
    this.spawnFood();

    this.renderer.render(this.scene, this.camera);
  }

  private spawnFood(): void {
    let geometry: THREE.BoxGeometry;
    let material: THREE.MeshBasicMaterial;
    let mesh: THREE.Mesh;
    let x: number;
    let y: number;

    const sizeChunk = this.size / 4;

    for (let i = 0; i < this.foodAmount; i++) {
      x = CommonHelper.getRandomIntInclusive(-this.size + sizeChunk, this.size - sizeChunk);
      y = CommonHelper.getRandomIntInclusive(-this.size + sizeChunk, this.size - sizeChunk);

      geometry = new THREE.BoxGeometry(this.foodSize, this.foodSize);
      material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x;
      mesh.position.y = y;

      this.food.push(new FoodDTO(0.5, x, y, 5, 5, mesh));
      this.scene.add(mesh);
    }
  }

  private animate() {
    if (this.objects && this.objects.length === 0) this.pause();
    if (this.paused) return;

    this.id = requestAnimationFrame(() => this.animate());

    let generationFinished: boolean = this.objects.every((object: EvolvingObjectDTO) => object.safe);

    if (generationFinished) {
      this.labels.push(this.labels[this.labels.length - 1] + 1);
      this.labels = [...this.labels];
      this.scene.clear();
      this.removeFood();
      this.objects = this.evolvingObjectService.newGeneration(this.objects, this.size);
      ThreeHelper.drawObjects(this.objects, this.scene);
      this.spawnFood();
      this.prepareDatasets();
    } else {
      this.evolvingObjectService.updatePositions(this.objects, this.food, this.scene, this.size);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private removeFood(): void {
    for (const food of this.food) {
      this.scene.remove(food.mesh);
    }

    this.food = [];
  }

  private prepareDatasets(): void {
    this.populationData = this.preparePopulationDataset(this.populationDataset);
    this.velocityData = this.prepareDataset(this.velocityDataset, 'velocity');
    this.radiusData = this.prepareDataset(this.radiusDataset, 'radius');
    this.percepionData = this.prepareDataset(this.perceptionDataset, 'perception');
  }

  private prepareDataset(datasets: Array<ChartDataset>, type: string): ChartDTO {
    const dataset = datasets[0];

    if (!dataset) {
      datasets.push({
        label: type,
        borderColor: 'red',
        data: [this.getData(type)],
      });
    } else {
      dataset.data.push(this.getData(type));
    }

    return new ChartDTO(this.labels, datasets, type);
  }

  private preparePopulationDataset(datasets: Array<ChartDataset>): ChartDTO {
    const colors = [...new Set(this.objects.map((object: EvolvingObjectDTO) => object.color))];
    let objects: EvolvingObjectDTO[];
    let dataset: ChartDataset;

    for (const color of colors) {
      objects = this.objects.filter((object: EvolvingObjectDTO) => object.color === color);
      dataset = datasets.find((dataset: ChartDataset) => dataset.label === color)!;

      if (!dataset) {
        dataset = {
          label: color,
          borderColor: objects[0].color,
          data: new Array(this.labels[this.labels.length - 1] - 1).fill(0),
        };
        dataset.data.push(objects.length);
        datasets.push(dataset);
      } else {
        dataset.data.push(objects.length);
      }
    }

    for (const dataset of datasets) {
      if (dataset.data.length !== this.labels.length) dataset.data.push(0);
    }

    return new ChartDTO(this.labels, datasets, 'population');
  }

  private getData(type: string): number {
    let array: Array<number>;
    switch (type) {
      case 'velocity':
        array = this.objects.map((object: EvolvingObjectDTO) => object.velocity);
        break;
      case 'radius':
        array = this.objects.map((object: EvolvingObjectDTO) => object.radius);
        break;
      case 'perception':
        array = this.objects.map((object: EvolvingObjectDTO) => object.perception);
        break;
      default:
        array = this.objects.map((object: EvolvingObjectDTO) => object.velocity);
        break;
    }

    return array.reduce((a, b) => a + b) / array.length;
  }
}
