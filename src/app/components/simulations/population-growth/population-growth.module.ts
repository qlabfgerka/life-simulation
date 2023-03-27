import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopulationGrowthRoutingModule } from './population-growth-routing.module';
import { PopulationGrowthComponent } from './population-growth.component';
import { MatButtonModule } from '@angular/material/button';
import { ObjectsDialogModule } from '../../../shared/dialogs/objects-dialog/objects-dialog.module';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [PopulationGrowthComponent],
  imports: [CommonModule, PopulationGrowthRoutingModule, MatButtonModule, ObjectsDialogModule, MatSliderModule],
})
export class PopulationGrowthModule {}
