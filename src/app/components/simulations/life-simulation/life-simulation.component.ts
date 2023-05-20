import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlantsDialogComponent } from 'src/app/shared/dialogs/plants-dialog/plants-dialog.component';
import { SmartObjectsDialogComponent } from 'src/app/shared/dialogs/smart-objects-dialog/smart-objects-dialog.component';
import { ThreeHelper } from 'src/app/shared/helpers/three/three.helper';
import { Aggression } from 'src/app/shared/models/aggression/aggression.enum';
import { FoodDTO } from 'src/app/shared/models/food/food.model';
import { PerlinMethod } from 'src/app/shared/models/perlin-method/perlin-method.enum';
import { PlantDTO } from 'src/app/shared/models/plant/plant.model';
import { SmartObjectDTO } from 'src/app/shared/models/smart-object/smart-object.model';
import { FoodService } from 'src/app/shared/services/food/food.service';
import { PlantService } from 'src/app/shared/services/plant/plant.service';
import { SmartObjectService } from 'src/app/shared/services/smart-object/smart-object.service';
import { WorldGenerationService } from 'src/app/shared/services/world-generation/world-generation.service';
import * as THREE from 'three';

@Component({
  selector: 'app-life-simulation',
  templateUrl: './life-simulation.component.html',
  styleUrls: ['./life-simulation.component.scss'],
})
export class LifeSimulationComponent implements OnDestroy {
  @ViewChild('frame', { static: false }) private readonly frame!: ElementRef;

  public objects!: SmartObjectDTO[];
  public food!: FoodDTO[];
  public paused!: boolean;

  public plants!: PlantDTO[];

  public settingsVisible: boolean = true;
  public captureVisible: boolean = false;
  public capturePeriod: number = 1000;
  public foodAmount: number = 20;
  public foodSize: number = 10;
  public size: number = 250;
  public waters: number = 4;
  public scale: number = 80;
  public usePerlinNoise: boolean = false;
  public methods: PerlinMethod[] = [PerlinMethod.splitting, PerlinMethod.sorting];
  public selectedMethod: PerlinMethod = PerlinMethod.splitting;

  public captureInterval!: NodeJS.Timeout;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;
  private clock!: THREE.Clock;
  private delta!: number;
  private totalTime!: number;
  private interval!: number;
  private secondsPassed!: number;

  private worldMatrix!: Array<Array<number>>;

  private captureContent!: string;

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.reset();
  }

  constructor(
    private readonly worldGenerationService: WorldGenerationService,
    private readonly smartObjectService: SmartObjectService,
    private readonly plantService: PlantService,
    private readonly foodService: FoodService,
    private readonly dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    if (this.captureInterval) clearInterval(this.captureInterval);
  }

  public formatLabel(value: number): string {
    return `${value / 1000}s`;
  }

  public toggleSettings(): void {
    this.settingsVisible = !this.settingsVisible;

    if (this.settingsVisible) this.captureVisible = false;
  }

  public toggleCapture(): void {
    this.captureVisible = !this.captureVisible;

    if (this.captureVisible) this.settingsVisible = false;
  }

  public openSettings(): void {
    const settingsDialogRef = this.dialog.open(SmartObjectsDialogComponent, {
      data: {
        objects: this.objects,
      },
    });

    settingsDialogRef.afterClosed().subscribe((data: any) => {
      if (!data) return;

      if (data.objects) this.objects = data.objects;

      if (this.plants && this.plants.length > 0) this.reset();
    });
  }

  public openPlantSettings(): void {
    const settingsDialogRef = this.dialog.open(PlantsDialogComponent, {
      data: {
        plants: this.plants,
      },
    });

    settingsDialogRef.afterClosed().subscribe((data: any) => {
      if (!data) return;

      if (data.plants) this.plants = data.plants;

      if (this.objects && this.objects.length > 0) this.reset();
    });
  }

  public beginCapture(): void {
    if (this.captureInterval) clearInterval(this.captureInterval);
    this.captureContent = `sep=;\nType;Food amount;Population size;Average hunger;Max hunger;Min hunger;Average thirst;Max thirst;Min thirst;Average reproduction;Max reproduction;Min reproduction;Average age;Max age;Min age;Average perception;Max perception;Min perception;Average velocity;Max velocity;Min velocity;Average radius;Max radius;Min radius; Average variation;Max variation;Min variation\n`;

    this.captureInterval = setInterval(() => {
      this.captureContent += `${this.getData(Aggression.predator)}${this.getData(Aggression.prey)}`;
    }, this.capturePeriod);
  }

  public endCapture(): void {
    const link = document.createElement('a');
    const file = new Blob([this.captureContent], { type: 'text/plain' });

    link.href = URL.createObjectURL(file);
    link.download = 'export.csv';
    link.click();

    URL.revokeObjectURL(link.href);
  }

  public play(): void {
    this.paused = false;

    this.animate();
  }

  public pause(): void {
    this.paused = true;
  }

  public step(): void {
    const delta = this.clock.getDelta();
    this.delta += delta;
    this.totalTime += delta;

    [this.plants, this.scene] = this.plantService.update(
      this.plants,
      this.scene,
      this.size,
      this.worldMatrix,
      this.totalTime
    );

    [this.objects, this.scene] = this.smartObjectService.update(
      this.objects,
      this.food,
      this.scene,
      this.size,
      this.worldMatrix,
      this.delta > this.interval
    );

    if (this.delta > this.interval) {
      this.delta = this.delta % this.interval;
      ++this.secondsPassed;

      if (this.secondsPassed >= 5) {
        this.foodService.spawnFood(this.food, this.size, 1, this.foodSize, this.scene, this.worldMatrix);

        this.secondsPassed = 0;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  public reset(): void {
    if (!this.objects || this.objects.length === 0) return;

    if (this.id) cancelAnimationFrame(this.id);
    this.paused = true;

    this.frame.nativeElement.innerHTML = '';

    this.renderer = ThreeHelper.initRenderer(this.frame);
    this.camera = ThreeHelper.initCamera(this.size);

    this.scene = new THREE.Scene();
    this.food = [];

    this.worldMatrix = this.worldGenerationService.generateWorld(
      this.size,
      this.waters,
      Math.max(...this.objects.map((object: SmartObjectDTO) => object.radius)),
      this.scene,
      this.usePerlinNoise,
      this.scale,
      this.selectedMethod
    );

    this.clock = new THREE.Clock();
    this.delta = 0;
    this.totalTime = 0;
    this.interval = 1;
    this.secondsPassed = 0;

    this.smartObjectService.initializePositions(this.objects, this.size, this.worldMatrix);
    this.plantService.initializePositions(this.plants, this.size, this.worldMatrix);

    ThreeHelper.drawObjects(this.objects, this.scene);
    ThreeHelper.drawPlants(this.plants, this.scene);

    this.foodService.spawnFood(this.food, this.size, this.foodAmount, this.foodSize, this.scene, this.worldMatrix);

    this.renderer.render(this.scene, this.camera);
  }

  private animate() {
    if (this.objects && this.objects.length === 0) this.pause();
    if (this.paused) return;

    this.id = requestAnimationFrame(() => this.animate());

    this.step();
  }

  private getData(type: Aggression): string {
    const objects = this.objects.filter((object: SmartObjectDTO) => object.typeId === type);

    if (objects.length === 0) return '';

    const hunger = objects.map((object: SmartObjectDTO) => object.hunger);
    const thirst = objects.map((object: SmartObjectDTO) => object.thirst);
    const reproduction = objects.map((object: SmartObjectDTO) => object.reproduction);
    const age = objects.map((object: SmartObjectDTO) => object.age);
    const perception = objects.map((object: SmartObjectDTO) => object.perception);
    const velocity = objects.map((object: SmartObjectDTO) => object.velocity);
    const radius = objects.map((object: SmartObjectDTO) => object.radius);
    const variation = objects.map((object: SmartObjectDTO) => object.variation);

    return `${Aggression[type]};${this.food.length};${objects.length};${this.getParameterStats(
      hunger
    )};${this.getParameterStats(thirst)};${this.getParameterStats(reproduction)};${this.getParameterStats(
      age
    )};${this.getParameterStats(perception)};${this.getParameterStats(velocity)};${this.getParameterStats(
      radius
    )};${this.getParameterStats(variation)};\n`;
  }

  private getParameterStats(parameter: Array<number>): string {
    const sum = parameter.reduce((a, b) => a + b, 0);
    const avg = sum / parameter.length || 0;

    return `${avg.toFixed(2)};${Math.max(...parameter).toFixed(2)};${Math.min(...parameter).toFixed(2)}`;
  }
}
