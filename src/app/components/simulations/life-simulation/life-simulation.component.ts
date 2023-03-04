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

  private objects!: ObjectDTO[];

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
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );

      this.drawObjects();
    });
  }

  private drawObjects(): void {
    const context = this.canvas.nativeElement.getContext('2d')!;
    const radius = 5;

    context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    for (const object of this.objects) {
      context.beginPath();
      context.arc(object.x, object.y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = object.color;
      context.fill();
    }
  }
}
