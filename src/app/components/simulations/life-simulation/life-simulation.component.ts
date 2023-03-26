import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SmartObjectsDialogComponent } from 'src/app/shared/dialogs/smart-objects-dialog/smart-objects-dialog.component';
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

  public pause(): void {}

  public step(): void {}

  public reset(): void {}
}
