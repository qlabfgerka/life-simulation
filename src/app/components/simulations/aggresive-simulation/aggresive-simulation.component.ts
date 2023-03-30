import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ChartDataset } from 'chart.js';
import { CommonHelper } from 'src/app/shared/helpers/common/common.helper';
import { ThreeHelper } from 'src/app/shared/helpers/three/three.helper';
import { Aggression } from 'src/app/shared/models/aggression/aggression.enum';
import { ChartDTO } from 'src/app/shared/models/chart-data/chart-data.model';
import { FoodPairDTO } from 'src/app/shared/models/food-pair/food-pair.model';
import { ObjectDTO } from 'src/app/shared/models/object/object.model';
import { AggressiveObjectService } from 'src/app/shared/services/aggresive-object/aggressive-object.service';
import { FoodService } from 'src/app/shared/services/food/food.service';
import * as THREE from 'three';

@Component({
  selector: 'app-aggresive-simulation',
  templateUrl: './aggresive-simulation.component.html',
  styleUrls: ['./aggresive-simulation.component.scss'],
})
export class AggresiveSimulationComponent implements AfterViewInit {
  @ViewChild('frame', { static: false }) private readonly frame!: ElementRef;

  public objects!: ObjectDTO[];
  public food!: FoodPairDTO[];
  public paused!: boolean;

  public aggressiveAmount: number = 5;
  public nonaggressiveAmount: number = 5;
  public objectSize: number = 10;
  public foodAmount: number = 20;
  public foodSize: number = 10;
  public size: number = 250;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;
  private clock!: THREE.Clock;
  private delta!: number;
  private interval!: number;

  public populationData!: ChartDTO;
  private populationDataset: Array<ChartDataset> = [];
  private labels: Array<number> = [];

  private currentStep!: number;
  private readonly stepModulo: number = 5;

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.reset();
  }

  constructor(
    private readonly aggressiveObjectService: AggressiveObjectService,
    private readonly foodService: FoodService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.reset();
    }, 0);
  }

  public get types(): number[] {
    return [...new Set(this.objects.map((object: ObjectDTO) => object.typeId))].sort((a, b) => a - b);
  }

  public getAggression(type: number): string {
    switch (type) {
      case 0:
        return 'AGGRESSIVE';
      case 1:
        return 'NON AGGRESSIVE';
      default:
        return '';
    }
  }

  public getAmount(type: number): number {
    return this.objects.filter((object: ObjectDTO) => object.typeId === type).length;
  }

  public getBackgroundColor(type: number): string {
    return this.objects.find((object: ObjectDTO) => object.typeId === type)!.color;
  }

  public getForegroundColor(type: number): string {
    let background = this.objects.find((object: ObjectDTO) => object.typeId === type)!.color;

    background = background.charAt(0) === '#' ? background.substring(1, 7) : background;
    const r = parseInt(background.substring(0, 2), 16);
    const g = parseInt(background.substring(2, 4), 16);
    const b = parseInt(background.substring(4, 6), 16);

    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#ffffff';
  }

  public play(): void {
    this.paused = false;

    this.animate();
  }

  public pause(): void {
    this.paused = true;
  }

  public step(): void {
    if (this.currentStep === 0) {
      [this.objects, this.scene] = this.aggressiveObjectService.update(this.objects, this.size, this.scene);
      this.foodService.spawnFoodPairs(this.food, this.size, this.foodAmount, this.foodSize, this.scene);
      this.aggressiveObjectService.assignFood(this.objects, this.food);
      this.labels.push(this.labels[this.labels.length - 1] + 1);
      this.labels = [...this.labels];
      this.populationData = this.prepareDataset();
    } else if (this.currentStep === 1) this.objects = this.aggressiveObjectService.moveToFood(this.objects, this.food);
    else if (this.currentStep === 2) this.food = this.aggressiveObjectService.removeEaten(this.food, this.scene);
    else if (this.currentStep === 3) this.objects = this.aggressiveObjectService.returnToBase(this.objects, this.size);
    else if (this.currentStep === 4) this.food = this.aggressiveObjectService.removeFood(this.food, this.scene);

    this.currentStep = (this.currentStep + 1) % this.stepModulo;
    this.renderer.render(this.scene, this.camera);

    return;
  }

  public reset(): void {
    if (this.id) cancelAnimationFrame(this.id);
    this.paused = true;

    this.frame.nativeElement.innerHTML = '';

    this.initObjects();
    this.aggressiveObjectService.initializePositions(this.objects, this.size);

    this.renderer = ThreeHelper.initRenderer(this.frame);
    this.camera = ThreeHelper.initCamera(this.size);

    this.currentStep = 0;
    this.scene = new THREE.Scene();
    this.food = [];
    this.labels = [1];
    this.clock = new THREE.Clock();
    this.delta = 0;
    this.interval = 1;
    this.populationDataset = [];
    this.populationData = null!;

    ThreeHelper.drawObjects(this.objects, this.scene);
    this.foodService.spawnFoodPairs(this.food, this.size, this.foodAmount, this.foodSize, this.scene);
    this.populationData = this.prepareDataset();

    this.aggressiveObjectService.assignFood(this.objects, this.food);

    this.currentStep = (this.currentStep + 1) % this.stepModulo;

    this.renderer.render(this.scene, this.camera);
  }

  private initObjects(): void {
    this.objects = this.aggressiveObjectService.generateObjects(
      this.aggressiveAmount,
      CommonHelper.getRandomHexColor(),
      Aggression.aggressive,
      this.objectSize
    );

    this.objects = this.objects.concat(
      this.aggressiveObjectService.generateObjects(
        this.nonaggressiveAmount,
        CommonHelper.getRandomHexColor(),
        Aggression.nonaggressive,
        this.objectSize
      )
    );
  }

  private prepareDataset(): ChartDTO {
    const typeIds = [...new Set(this.objects.map((object: ObjectDTO) => object.typeId))];
    let objects: ObjectDTO[];
    let dataset: ChartDataset;

    for (const type of typeIds) {
      objects = this.objects.filter((object: ObjectDTO) => object.typeId === type);
      dataset = this.populationDataset.find((dataset: ChartDataset) => dataset.label === type.toString())!;

      if (!dataset) {
        dataset = {
          label: type.toString(),
          borderColor: objects[0].color,
          data: new Array(this.labels[this.labels.length - 1] - 1).fill(0),
        };
        dataset.data.push(objects.length);
        this.populationDataset.push(dataset);
      } else {
        dataset.data.push(objects.length);
      }
    }

    for (const dataset of this.populationDataset) {
      if (dataset.data.length !== this.labels.length) dataset.data.push(0);
    }

    return new ChartDTO(this.labels, this.populationDataset, 'population');
  }

  private animate(): void {
    if (this.objects && this.objects.length === 0) this.pause();
    if (this.paused) return;

    this.id = requestAnimationFrame(() => this.animate());

    this.delta += this.clock.getDelta();

    if (this.delta > this.interval) {
      this.step();

      this.delta = this.delta % this.interval;
    }
  }
}
