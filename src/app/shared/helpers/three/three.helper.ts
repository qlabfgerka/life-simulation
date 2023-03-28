import { ElementRef } from '@angular/core';
import * as THREE from 'three';
import { ObjectDTO } from '../../models/object/object.model';

export class ThreeHelper {
  public static initCamera(size: number): THREE.OrthographicCamera {
    const camera = new THREE.OrthographicCamera(-size, size, -size, size);
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  public static initRenderer(frame: ElementRef<HTMLCanvasElement>): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(frame.nativeElement.offsetWidth, frame.nativeElement.offsetHeight);
    renderer.setClearColor(0xfafafa);
    frame.nativeElement.appendChild(renderer.domElement);

    return renderer;
  }

  public static getMesh(object: ObjectDTO): void {
    const geometry = new THREE.SphereGeometry(object.radius, object.radius, object.radius);
    const material = new THREE.MeshBasicMaterial({ color: object.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = object.x;
    mesh.position.y = object.y;
    mesh.position.z = 50;
    object.mesh = mesh;
  }

  public static drawObjects(objects: ObjectDTO[], scene: THREE.Scene): void {
    for (const object of objects) {
      this.getMesh(object);

      scene.add(object.mesh);
    }
  }
}
