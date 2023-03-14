import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvolvingObjectsDialogRoutingModule } from './evolving-objects-dialog-routing.module';
import { EvolvingObjectsDialogComponent } from './evolving-objects-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EvolvingObjectsDialogComponent],
  imports: [
    CommonModule,
    EvolvingObjectsDialogRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
})
export class EvolvingObjectsDialogModule {}
