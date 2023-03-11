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
  public paused: boolean = true;
  public foodAmount: number = 10;
  public foodSize: number = 10;
  public size: number = 250;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.reset();
  }

  constructor(
    private readonly evolvingObjectService: EvolvingObjectService,
    private readonly dialog: MatDialog
  ) {}

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
    this.paused = true;

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

      object.mesh = mesh;
      this.scene.add(mesh);
    }
  }

  private spawnFood(): void {
    let geometry: THREE.BoxGeometry;
    let material: THREE.MeshBasicMaterial;
    let mesh: THREE.Mesh;
    let x: number;
    let y: number;

    const sizeChunk = this.size / 4;

    for (let i = 0; i < this.foodAmount; i++) {
      x = this.evolvingObjectService.getRandomIntInclusive(
        -this.size + sizeChunk,
        this.size - sizeChunk
      );
      y = this.evolvingObjectService.getRandomIntInclusive(
        -this.size + sizeChunk,
        this.size - sizeChunk
      );

      geometry = new THREE.BoxGeometry(this.foodSize, this.foodSize);
      material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x;
      mesh.position.y = y;

      this.food.push(
        new FoodDTO(
          this.evolvingObjectService.getRandomIntInclusive(1, 5),
          x,
          y,
          5,
          5,
          mesh
        )
      );
      this.scene.add(mesh);
    }
  }

  private animate() {
    if (this.paused) return;

    this.id = requestAnimationFrame(() => this.animate());

    this.evolvingObjectService.updatePositions(
      this.objects,
      this.food,
      this.scene,
      this.size
    );

    this.renderer.render(this.scene, this.camera);
  }
}
