import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EvolvingObjectDTO } from 'src/app/shared/models/evolving-object/evolving-object.model';
import { FoodDTO } from 'src/app/shared/models/food/food.model';

@Component({
  selector: 'app-aggresive-simulation',
  templateUrl: './aggresive-simulation.component.html',
  styleUrls: ['./aggresive-simulation.component.scss'],
})
export class AggresiveSimulationComponent {
  @ViewChild('frame', { static: false }) private readonly frame!: ElementRef;

  public objects!: EvolvingObjectDTO[];
  public food!: FoodDTO[];
  public paused: boolean = true;
  public foodAmount: number = 50;
  public foodSize: number = 10;
  public size: number = 250;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;

  constructor() {}

  public openSettings(): void {
    /*const settingsDialogRef = this.dialog.open(EvolvingObjectsDialogComponent, {
      data: {
        objects: this.objects,
      },
    });

    settingsDialogRef.afterClosed().subscribe((data: any) => {
      if (!data) return;

      if (data.objects) this.objects = data.objects;

      this.reset();
    });*/
  }

  public play(): void {
    this.paused = false;

    //this.animate();
  }

  public pause(): void {
    this.paused = true;
  }

  public step(): void {}

  public reset(): void {
    /*if (this.id) cancelAnimationFrame(this.id);
    if (!this.objects || this.objects.length === 0) return;
    this.paused = true;

    this.frame.nativeElement.innerHTML = '';

    this.evolvingObjectService.initializePositions(this.objects, this.size);

    this.initRenderer();
    this.initCamera();

    this.populationDataset = [];
    this.velocityDataset = [];
    this.radiusDataset = [];
    this.perceptionDataset = [];
    this.scene = new THREE.Scene();
    this.food = [];
    this.labels = [1];
    this.prepareDatasets();

    this.drawObjects();
    this.spawnFood();

    this.renderer.render(this.scene, this.camera);*/
  }
}
