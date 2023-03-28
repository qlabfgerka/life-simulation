import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SmartObjectsDialogComponent } from 'src/app/shared/dialogs/smart-objects-dialog/smart-objects-dialog.component';
import { ThreeHelper } from 'src/app/shared/helpers/three/three.helper';
import { FoodDTO } from 'src/app/shared/models/food/food.model';
import { PerlinMethod } from 'src/app/shared/models/perlin-method/perlin-method.enum';
import { SmartObjectDTO } from 'src/app/shared/models/smart-object/smart-object.model';
import { FoodService } from 'src/app/shared/services/food/food.service';
import { SmartObjectService } from 'src/app/shared/services/smart-object/smart-object.service';
import { WorldGenerationService } from 'src/app/shared/services/world-generation/world-generation.service';
import * as THREE from 'three';

@Component({
  selector: 'app-life-simulation',
  templateUrl: './life-simulation.component.html',
  styleUrls: ['./life-simulation.component.scss'],
})
export class LifeSimulationComponent {
  @ViewChild('frame', { static: false }) private readonly frame!: ElementRef;

  public objects!: SmartObjectDTO[];
  public food!: FoodDTO[];
  public paused!: boolean;

  public foodAmount: number = 20;
  public foodSize: number = 10;
  public size: number = 250;
  public waters: number = 4;
  public scale: number = 80;
  public usePerlinNoise: boolean = false;
  public methods: PerlinMethod[] = [PerlinMethod.splitting, PerlinMethod.sorting];
  public selectedMethod: PerlinMethod = PerlinMethod.splitting;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;
  private clock!: THREE.Clock;
  private delta!: number;
  private interval!: number;

  private worldMatrix!: Array<Array<number>>;

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.reset();
  }

  constructor(
    private readonly worldGenerationService: WorldGenerationService,
    private readonly smartObjectService: SmartObjectService,
    private readonly foodService: FoodService,
    private readonly dialog: MatDialog
  ) {}

  public openSettings(): void {
    const settingsDialogRef = this.dialog.open(SmartObjectsDialogComponent, {
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

  public step(): void {
    this.delta += this.clock.getDelta();
    [this.objects, this.scene] = this.smartObjectService.update(
      this.objects,
      this.food,
      this.scene,
      this.size,
      this.worldMatrix,
      this.delta > this.interval
    );

    if (this.delta > this.interval) this.delta = this.delta % this.interval;

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
    this.interval = 1;

    this.smartObjectService.initializePositions(this.objects, this.size, this.worldMatrix);

    ThreeHelper.drawObjects(this.objects, this.scene);
    this.foodService.spawnFood(this.food, this.size, this.foodAmount, this.foodSize, this.scene, this.worldMatrix);

    this.renderer.render(this.scene, this.camera);
  }

  private animate() {
    if (this.objects && this.objects.length === 0) this.pause();
    if (this.paused) return;

    this.id = requestAnimationFrame(() => this.animate());

    this.step();
  }
}
