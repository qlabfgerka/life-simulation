import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasicEvolutionRoutingModule } from './basic-evolution-routing.module';
import { BasicEvolutionComponent } from './basic-evolution.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { EvolvingObjectsDialogModule } from 'src/app/shared/dialogs/evolving-objects-dialog/evolving-objects-dialog.module';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [BasicEvolutionComponent],
  imports: [
    CommonModule,
    BasicEvolutionRoutingModule,
    MatButtonModule,
    MatSliderModule,
    EvolvingObjectsDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class BasicEvolutionModule {}
