import { Component, ElementRef, ViewChild } from '@angular/core';
import { FoodDTO } from 'src/app/shared/models/food/food.model';
import { ObjectDTO } from 'src/app/shared/models/object/object.model';
import { ThreeService } from 'src/app/shared/services/three/three.service';
import * as THREE from 'three';

@Component({
  selector: 'app-aggresive-simulation',
  templateUrl: './aggresive-simulation.component.html',
  styleUrls: ['./aggresive-simulation.component.scss'],
})
export class AggresiveSimulationComponent {
  @ViewChild('frame', { static: false }) private readonly frame!: ElementRef;

  public objects!: ObjectDTO[];
  public food!: FoodDTO[];
  public paused: boolean = true;
  public foodAmount: number = 50;
  public foodSize: number = 10;
  public size: number = 250;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.OrthographicCamera;
  private id!: number;

  constructor(private readonly threeService: ThreeService) {}

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
    if (!this.objects || this.objects.length === 0) return;
    this.paused = true;

    this.frame.nativeElement.innerHTML = '';

    //this.evolvingObjectService.initializePositions(this.objects, this.size);

    this.renderer = this.threeService.initRenderer(this.frame);
    this.camera = this.threeService.initCamera(this.size);

    this.scene = new THREE.Scene();
    this.food = [];

    //this.drawObjects();
    //this.spawnFood();

    this.renderer.render(this.scene, this.camera);
  }
}
