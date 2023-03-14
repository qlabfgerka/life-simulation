import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Aggression } from 'src/app/shared/models/aggression/aggression.enum';
import { FoodDTO } from 'src/app/shared/models/food/food.model';
import { ObjectDTO } from 'src/app/shared/models/object/object.model';
import { AggressiveObjectService } from 'src/app/shared/services/aggresive-object/aggressive-object.service';
import { CommonService } from 'src/app/shared/services/common/common.service';
import { ThreeService } from 'src/app/shared/services/three/three.service';
import * as THREE from 'three';

@Component({
  selector: 'app-aggresive-simulation',
  templateUrl: './aggresive-simulation.component.html',
  styleUrls: ['./aggresive-simulation.component.scss'],
})
export class AggresiveSimulationComponent implements AfterViewInit {
  @ViewChild('frame', { static: false }) private readonly frame!: ElementRef;

  public objects!: ObjectDTO[];
  public food!: FoodDTO[];
  public paused!: boolean;

  public aggressiveAmount: number = 5;
  public nonaggressiveAmount: number = 5;
  public objectSize: number = 5;
  public foodAmount: number = 50;
  public foodSize: number = 10;
  public size: number = 250;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;

  constructor(
    private readonly threeService: ThreeService,
    private readonly aggressiveObjectService: AggressiveObjectService,
    private readonly commonService: CommonService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.reset();
    }, 0);
  }

  public get types(): number[] {
    return [...new Set(this.objects.map((object: ObjectDTO) => object.typeId))];
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

  public getBackgroundColor(type: number): string {
    return this.objects.find((object: ObjectDTO) => object.typeId === type)!
      .color;
  }

  public getForegroundColor(type: number): string {
    let background = this.objects.find(
      (object: ObjectDTO) => object.typeId === type
    )!.color;

    background =
      background.charAt(0) === '#' ? background.substring(1, 7) : background;
    const r = parseInt(background.substring(0, 2), 16);
    const g = parseInt(background.substring(2, 4), 16);
    const b = parseInt(background.substring(4, 6), 16);

    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#ffffff';
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
    if (this.id) cancelAnimationFrame(this.id);
    this.paused = true;

    this.frame.nativeElement.innerHTML = '';

    this.initObjects();
    this.aggressiveObjectService.initializePositions(this.objects, this.size);

    this.renderer = this.threeService.initRenderer(this.frame);
    this.camera = this.threeService.initCamera(this.size);

    this.scene = new THREE.Scene();
    this.food = [];

    this.drawObjects();
    //this.spawnFood();

    this.renderer.render(this.scene, this.camera);
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

  private initObjects(): void {
    this.objects = this.aggressiveObjectService.generateObjects(
      this.aggressiveAmount,
      this.commonService.getRandomHexColor(),
      Aggression.aggressive,
      0,
      0,
      0,
      this.objectSize
    );

    this.objects = this.objects.concat(
      this.aggressiveObjectService.generateObjects(
        this.nonaggressiveAmount,
        this.commonService.getRandomHexColor(),
        Aggression.nonaggressive,
        0,
        0,
        0,
        this.objectSize
      )
    );
  }
}
