import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ObjectDTO } from 'src/app/shared/models/object/object.model';
import { ObjectService } from 'src/app/shared/services/object/object.service';
import { ObjectsDialogComponent } from '../../../shared/dialogs/objects-dialog/objects-dialog.component';

@Component({
  selector: 'app-life-simulation',
  templateUrl: './life-simulation.component.html',
  styleUrls: ['./life-simulation.component.scss'],
})
export class LifeSimulationComponent {
  @ViewChild('lifeCanvas', { static: false })
  private canvas!: ElementRef<HTMLCanvasElement>;

  public objects!: ObjectDTO[];
  public animationInterval!: NodeJS.Timer;
  public paused: boolean = false;

  constructor(
    private readonly objectService: ObjectService,
    private readonly dialog: MatDialog
  ) {}

  public openSettings(): void {
    const settingsDialogRef = this.dialog.open(ObjectsDialogComponent, {
      data: {
        objects: this.objects,
      },
    });

    settingsDialogRef.afterClosed().subscribe((data: any) => {
      if (!data) return;

      if (data.objects) this.objects = data.objects;

      this.objectService.initializePositions(
        this.objects,
        this.canvas.nativeElement.clientWidth,
        this.canvas.nativeElement.clientHeight
      );

      this.initScene();
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

  private initScene(): void {
    this.drawObjects();
    this.initInterval();
  }

  private drawObjects(): void {
    const context = this.canvas.nativeElement.getContext('2d')!;
    const radius = 5;

    context.clearRect(
      0,
      0,
      this.canvas.nativeElement.clientWidth,
      this.canvas.nativeElement.clientHeight
    );

    this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth;
    this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight;

    for (const object of this.objects) {
      context.beginPath();
      context.arc(object.x, object.y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = object.color;
      context.fill();
    }
  }

  private initInterval(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);

    this.animationInterval = setInterval(() => {
      this.objectService.updatePositions(
        this.objects,
        this.canvas.nativeElement.clientWidth,
        this.canvas.nativeElement.clientHeight
      );
      this.drawObjects();
    }, 10);
  }
}
