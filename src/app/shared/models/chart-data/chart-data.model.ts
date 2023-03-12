import { ChartDataset } from 'chart.js';

export class ChartDTO {
  datasets: Array<ChartDataset>;
  labels: Array<number>;
  title: string;

  constructor(
    labels: Array<number>,
    datasets: Array<ChartDataset>,
    title: string
  ) {
    this.datasets = datasets;
    this.labels = labels;
    this.title = title;
  }
}
