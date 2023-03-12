import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ChartDTO } from '../../models/chart-data/chart-data.model';

Chart.register(...registerables);

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('chartCanvas', { static: false })
  private chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() public set chartData(value: ChartDTO) {
    if (!value || !this.chartCanvas) return;

    this._chartData = value;
    this.initChart();
  }

  private _chartData!: ChartDTO;

  public chart!: any;

  ngAfterViewInit() {
    this.initChart();
  }

  private initChart(): void {
    if (this.chart) this.chart.destroy();
    if (!this._chartData) return;
    const context = this.chartCanvas.nativeElement.getContext('2d')!;

    this.chart = new Chart(context, {
      type: 'line', //this denotes tha type of chart
      data: {
        // values on X-Axis
        labels: this._chartData.labels,
        datasets: this._chartData.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            text: this._chartData.title,
          },
        },
      },
    });
  }
}
