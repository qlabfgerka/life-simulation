import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ObjectDTO } from 'src/app/shared/models/object/object.model';
import { PopulationDTO } from 'src/app/shared/models/population/population.model';
import { ObjectService } from 'src/app/shared/services/object/object.service';
import { ObjectsDialogComponent } from '../../../shared/dialogs/objects-dialog/objects-dialog.component';

@Component({
  selector: 'app-population-growth',
  templateUrl: './population-growth.component.html',
  styleUrls: ['./population-growth.component.scss'],
})
export class PopulationGrowthComponent {
  @ViewChild('lifeCanvas', { static: false })
  private lifeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas', { static: false })
  private chartCanvas!: ElementRef<HTMLCanvasElement>;

  public objects!: ObjectDTO[];
  public animationInterval!: NodeJS.Timer;
  public paused: boolean = false;
  public timer: number = 100;

  private timerSum: number = 0;
  private secondsPassed: number = 0;
  private seconds!: number[];
  private populations!: Array<PopulationDTO>;
  private currentIndex!: number;

  constructor(
    private readonly objectService: ObjectService,
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
    this.secondsPassed = 0;
    this.currentIndex = 0;
    this.seconds = Array.from({ length: 10 }, (_, i) => i + 1);
    this.populations = new Array<PopulationDTO>();

    const objectTypes = [
      ...new Set(this.objects.map((object: ObjectDTO) => object.typeId)),
    ];

    for (const typeId of objectTypes) {
      this.populations.push(
        new PopulationDTO(
          typeId,
          this.objects.find(
            (object: ObjectDTO) => object.typeId === typeId
          )!.color
        )
      );
    }

    this.drawGraph();
    this.drawObjects();
    this.initInterval();
  }

  private drawObjects(): void {
    const context = this.lifeCanvas.nativeElement.getContext('2d')!;
    const radius = 5;

    context.clearRect(
      0,
      0,
      this.lifeCanvas.nativeElement.clientWidth,
      this.lifeCanvas.nativeElement.clientHeight
    );

    this.lifeCanvas.nativeElement.width =
      this.lifeCanvas.nativeElement.clientWidth;
    this.lifeCanvas.nativeElement.height =
      this.lifeCanvas.nativeElement.clientHeight;

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
      this.timerSum += this.timer;

      if (this.timerSum % 1000 === 0) {
        ++this.secondsPassed;

        if (this.secondsPassed >= 10) {
          this.seconds[9] = this.secondsPassed;
          this.seconds.shift();
        }

        const objectTypes = [
          ...new Set(this.objects.map((object: ObjectDTO) => object.typeId)),
        ];

        for (const typeId of objectTypes) {
          let current = this.populations.find(
            (population: PopulationDTO) => population.typeId === typeId
          )!;
          let amount = this.objects.filter(
            (object: ObjectDTO) => object.typeId === typeId
          ).length;

          if (current?.population[this.currentIndex] === -1) {
            current.population[this.currentIndex] = amount;
            ++this.currentIndex;
          } else {
            current.population[this.currentIndex] = amount;
            current?.population.shift();
          }
        }

        this.drawGraph();
      }

      this.objectService.updatePositions(
        this.objects,
        this.lifeCanvas.nativeElement.clientWidth,
        this.lifeCanvas.nativeElement.clientHeight
      );
      this.objects = this.objectService.updateLife(this.objects);
      this.drawObjects();
    }, this.timer);
  }

  private drawGraph(): void {
    const context = this.chartCanvas.nativeElement.getContext('2d')!;
    const height = this.chartCanvas.nativeElement.clientHeight;
    const width = this.chartCanvas.nativeElement.clientWidth;
    const referenceLines = [0, 0.25, 0.5, 0.75];
    let currentValue;

    this.chartCanvas.nativeElement.width = width;
    this.chartCanvas.nativeElement.height = height;

    const GRAPH_TOP = 50;
    const GRAPH_BOTTOM = height - 50;
    const GRAPH_LEFT = 100;
    const GRAPH_RIGHT = width - 50;

    const GRAPH_HEIGHT = height - 100;
    const GRAPH_WIDTH = width - 150;

    const arrayLen = this.seconds.length;

    let largest = 0;
    for (const population of this.populations) {
      for (const value of population.population)
        if (value > largest) largest = value;
    }

    context.clearRect(0, 0, width, height);
    context.font = '12px Arial';

    // AXIS LINES
    context.beginPath();
    context.moveTo(GRAPH_LEFT, GRAPH_TOP);
    context.lineTo(GRAPH_LEFT, GRAPH_BOTTOM);
    context.lineTo(GRAPH_RIGHT, GRAPH_BOTTOM);
    context.stroke();

    //REFERENCE LINES
    for (let i = 0; i < 4; i++) {
      context.strokeStyle = '#BBB';
      context.beginPath();

      //LINE FROM START TO END
      context.moveTo(GRAPH_LEFT, GRAPH_HEIGHT * referenceLines[i] + GRAPH_TOP);
      context.lineTo(GRAPH_RIGHT, GRAPH_HEIGHT * referenceLines[i] + GRAPH_TOP);

      //CORRESPONDING TEXT
      context.fillText(
        (largest * (1 - referenceLines[i])).toString(),
        GRAPH_LEFT - 25,
        GRAPH_HEIGHT * referenceLines[i] + GRAPH_TOP
      );
      context.stroke();
    }

    //TITLES
    context.fillText('SECONDS', width / 2, GRAPH_BOTTOM + 45);
    context.fillText('POP.', GRAPH_LEFT - 95, height / 2);
    context.fillText('SIZE', GRAPH_LEFT - 95, height / 2 + 20);

    //DRAW SECONDS
    for (let i = 0; i < this.seconds.length; i++) {
      context.fillText(
        this.seconds[i].toString(),
        (GRAPH_WIDTH / this.seconds.length) * i + 100,
        GRAPH_BOTTOM + 25
      );
    }

    //DRAW LINES FOR POPULATIONS
    for (const population of this.populations) {
      context.strokeStyle = population.color;

      //DRAW FIRST VALUE OF CURRENT POPULATION
      currentValue =
        population.population[0] === -1 ? 0 : population.population[0];
      context.beginPath();
      context.moveTo(
        GRAPH_LEFT,
        GRAPH_HEIGHT - (currentValue / largest) * GRAPH_HEIGHT + GRAPH_TOP
      );

      //DRAW THE REST
      for (let i = 1; i < population.population.length; i++) {
        if (population.population[i] === -1) continue;
        context.lineTo(
          (GRAPH_WIDTH / arrayLen) * i + GRAPH_LEFT,
          GRAPH_HEIGHT -
            (population.population[i] / largest) * GRAPH_HEIGHT +
            GRAPH_TOP
        );
      }
      context.stroke();
    }
  }
}
