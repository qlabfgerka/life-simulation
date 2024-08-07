import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LifeSimulationRoutingModule } from './life-simulation-routing.module';
import { LifeSimulationComponent } from './life-simulation.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BarChartModule } from 'src/app/shared/charts/bar-chart/bar-chart.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SmartObjectsDialogModule } from 'src/app/shared/dialogs/smart-objects-dialog/smart-objects-dialog.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [LifeSimulationComponent],
  imports: [
    CommonModule,
    LifeSimulationRoutingModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    BarChartModule,
    MatCheckboxModule,
    SmartObjectsDialogModule,
    MatSliderModule,
    MatSelectModule,
  ],
})
export class LifeSimulationModule {}
