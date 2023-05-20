import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlantsDialogRoutingModule } from './plants-dialog-routing.module';
import { PlantsDialogComponent } from './plants-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [PlantsDialogComponent],
  imports: [
    CommonModule,
    PlantsDialogRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
})
export class PlantsDialogModule {}
