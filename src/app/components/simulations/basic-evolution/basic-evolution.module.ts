import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasicEvolutionRoutingModule } from './basic-evolution-routing.module';
import { BasicEvolutionComponent } from './basic-evolution.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { EvolvingObjectsDialogModule } from 'src/app/shared/dialogs/evolving-objects-dialog/evolving-objects-dialog.module';

@NgModule({
  declarations: [BasicEvolutionComponent],
  imports: [
    CommonModule,
    BasicEvolutionRoutingModule,
    MatButtonModule,
    MatSliderModule,
    EvolvingObjectsDialogModule,
  ],
})
export class BasicEvolutionModule {}
