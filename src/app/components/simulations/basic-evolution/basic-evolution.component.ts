import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EvolvingObjectsDialogComponent } from 'src/app/shared/dialogs/evolving-objects-dialog/evolving-objects-dialog.component';
import { EvolvingObjectDTO } from 'src/app/shared/models/evolving-object/evolving-object.model';
import { EvolvingObjectService } from 'src/app/shared/services/evolving-object/evolving-object.service';

@Component({
  selector: 'app-basic-evolution',
  templateUrl: './basic-evolution.component.html',
  styleUrls: ['./basic-evolution.component.scss'],
})
export class BasicEvolutionComponent {
  @ViewChild('lifeCanvas', { static: false })
  private lifeCanvas!: ElementRef<HTMLCanvasElement>;

  public objects!: EvolvingObjectDTO[];
  public animationInterval!: NodeJS.Timer;
  public paused: boolean = false;
  public timer: number = 100;

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

      this.evolvingObjectService.initializePositions(
        this.objects,
        this.lifeCanvas.nativeElement.clientWidth,
        this.lifeCanvas.nativeElement.clientHeight
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
    this.paused = false;

    this.drawObjects();
    this.initInterval();
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
    }, this.timer);
  }

  private drawObjects(): void {
    const context = this.lifeCanvas.nativeElement.getContext('2d')!;
    const width = this.lifeCanvas.nativeElement.clientWidth;
    const height = this.lifeCanvas.nativeElement.clientHeight;

    context.clearRect(0, 0, width, height);

    this.lifeCanvas.nativeElement.width = width;
    this.lifeCanvas.nativeElement.height = height;

    for (const object of this.objects) {
      context.beginPath();
      context.arc(object.x, object.y, object.radius, 0, 2 * Math.PI, false);
      context.fillStyle = object.color;
      context.fill();
    }
  }
}
