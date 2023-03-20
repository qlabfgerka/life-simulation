import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AggresiveSimulationRoutingModule } from './aggresive-simulation-routing.module';
import { AggresiveSimulationComponent } from './aggresive-simulation.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BarChartModule } from 'src/app/shared/charts/bar-chart/bar-chart.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [AggresiveSimulationComponent],
  imports: [
    CommonModule,
    AggresiveSimulationRoutingModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    BarChartModule,
  ],
})
export class AggresiveSimulationModule {}
