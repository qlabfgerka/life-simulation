import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SmartObjectsDialogComponent } from 'src/app/shared/dialogs/smart-objects-dialog/smart-objects-dialog.component';
import { ThreeHelper } from 'src/app/shared/helpers/three/three.helper';
import { FoodDTO } from 'src/app/shared/models/food/food.model';
import { SmartObjectDTO } from 'src/app/shared/models/smart-object/smart-object.model';
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
  public scale: number = 25;
  public usePerlinNoise: boolean = false;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;

  private worldMatrix!: Array<Array<number>>;

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.reset();
  }

  constructor(
    private readonly worldGenerationService: WorldGenerationService,
    private readonly smartObjectService: SmartObjectService,
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

  public play(): void {}

  public pause(): void {
    this.paused = true;
  }

  public step(): void {}

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
      this.scale
    );

    this.smartObjectService.initializePositions(this.objects, this.size);

    ThreeHelper.drawObjects(this.objects, this.scene);
    /*this.spawnFood();*/

    this.renderer.render(this.scene, this.camera);
  }
}
