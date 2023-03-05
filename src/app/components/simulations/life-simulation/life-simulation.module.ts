import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LifeSimulationRoutingModule } from './life-simulation-routing.module';
import { LifeSimulationComponent } from './life-simulation.component';
import { MatButtonModule } from '@angular/material/button';
import { ObjectsDialogModule } from '../../../shared/dialogs/objects-dialog/objects-dialog.module';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [LifeSimulationComponent],
  imports: [
    CommonModule,
    LifeSimulationRoutingModule,
    MatButtonModule,
    ObjectsDialogModule,
    MatSliderModule,
  ],
})
export class LifeSimulationModule {}
