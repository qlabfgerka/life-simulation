import { ElementRef, Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class ThreeService {
  constructor() {}

  public initCamera(size: number): THREE.OrthographicCamera {
    const camera = new THREE.OrthographicCamera(-size, size, -size, size);
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  public initRenderer(
    frame: ElementRef<HTMLCanvasElement>
  ): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      frame.nativeElement.offsetWidth,
      frame.nativeElement.offsetHeight
    );
    renderer.setClearColor(0xfafafa);
    frame.nativeElement.appendChild(renderer.domElement);

    return renderer;
  }
}
