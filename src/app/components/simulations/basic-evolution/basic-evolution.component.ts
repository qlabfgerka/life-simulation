import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EvolvingObjectsDialogComponent } from 'src/app/shared/dialogs/evolving-objects-dialog/evolving-objects-dialog.component';
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
  public animationInterval!: NodeJS.Timer;
  public paused: boolean = false;
  public timer: number = 100;
  public foodAmount: number = 10;
  public foodSize: number = 10;
  public size: number = 250;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.reset();
  }

  constructor(
    private readonly evolvingObjectService: EvolvingObjectService,
    private readonly dialog: MatDialog
  ) {}

  public formatLabel(value: number): string {
    return `${value}ms`;
  }

  public timerChange(event: Event): void {
    this.timer = +(event.target as HTMLInputElement).value;

    if (!this.objects || this.objects.length === 0) return;
    this.play();
  }

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
    this.initInterval();
    this.paused = false;
  }

  public pause(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);
    this.paused = true;
  }

  public reset(): void {
    this.pause();

    this.frame.nativeElement.innerHTML = '';

    this.evolvingObjectService.initializePositions(this.objects, this.size);

    this.initRenderer();
    this.initCamera();

    this.scene = new THREE.Scene();
    this.food = [];

    this.drawObjects();
    this.spawnFood();

    this.renderer.render(this.scene, this.camera);
  }

  private initCamera(): void {
    this.camera = new THREE.OrthographicCamera(
      -this.size,
      this.size,
      -this.size,
      this.size
    );
    this.camera.position.set(0, 0, 500);
    this.camera.lookAt(0, 0, 0);
  }

  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(
      this.frame.nativeElement.offsetWidth,
      this.frame.nativeElement.offsetHeight
    );
    this.renderer.setClearColor(0xfafafa);
    this.frame.nativeElement.appendChild(this.renderer.domElement);
  }

  private initInterval(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);

    this.animationInterval = setInterval(() => {
      /*this.evolvingObjectService.updatePositions(
        this.objects,
        this.lifeCanvas.nativeElement.clientWidth,
        this.lifeCanvas.nativeElement.clientHeight
      );
      this.objects = this.objectService.updateLife(this.objects);*/
      this.drawObjects();
      this.spawnFood();
    }, this.timer);
  }

  private drawObjects(): void {
    let geometry: THREE.SphereGeometry;
    let material: THREE.MeshBasicMaterial;
    let mesh: THREE.Mesh;

    for (const object of this.objects) {
      geometry = new THREE.SphereGeometry(
        object.radius,
        object.radius,
        object.radius
      );
      material = new THREE.MeshBasicMaterial({ color: object.color });

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = object.x;
      mesh.position.y = object.y;

      this.scene.add(mesh);
    }
  }

  private spawnFood(): void {
    let geometry: THREE.BoxGeometry;
    let material: THREE.MeshBasicMaterial;
    let mesh: THREE.Mesh;
    let x: number;
    let y: number;

    const halfSize = this.size / 2;

    for (let i = 0; i < this.foodAmount; i++) {
      x = this.evolvingObjectService.getRandomIntInclusive(
        -this.size + halfSize,
        this.size - halfSize
      );
      y = this.evolvingObjectService.getRandomIntInclusive(
        -this.size + halfSize,
        this.size - halfSize
      );

      this.food.push(new FoodDTO(1, x, y, 5, 5));

      geometry = new THREE.BoxGeometry(this.foodSize, this.foodSize);
      material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x;
      mesh.position.y = y;

      this.scene.add(mesh);
    }
  }
}
