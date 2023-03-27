import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SmartObjectsDialogComponent } from 'src/app/shared/dialogs/smart-objects-dialog/smart-objects-dialog.component';
import { ThreeHelper } from 'src/app/shared/helpers/three/three.helper';
import { FoodDTO } from 'src/app/shared/models/food/food.model';
import { SmartObjectDTO } from 'src/app/shared/models/smart-object/smart-object.model';
import { SmartObjectService } from 'src/app/shared/services/smart-object/smart-object.service';
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
  public usePerlinNoise: boolean = false;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;

  constructor(
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
    if (this.id) cancelAnimationFrame(this.id);
    this.paused = true;

    this.frame.nativeElement.innerHTML = '';

    //this.initObjects();
    //this.aggressiveObjectService.initializePositions(this.objects, this.size);

    this.renderer = ThreeHelper.initRenderer(this.frame);
    this.camera = ThreeHelper.initCamera(this.size);

    this.scene = new THREE.Scene();
    this.food = [];

    this.smartObjectService.generateWorld(this.size, this.waters, this.scene);

    /*this.drawObjects();
    this.spawnFood();
    this.populationData = this.prepareDataset();

    this.aggressiveObjectService.assignFood(this.objects, this.food);

    this.currentStep = (this.currentStep + 1) % this.stepModulo;*/

    this.renderer.render(this.scene, this.camera);
  }
}
