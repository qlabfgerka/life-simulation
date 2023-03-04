import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObjectsDialogRoutingModule } from './objects-dialog-routing.module';
import { ObjectsDialogComponent } from './objects-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ObjectsDialogComponent],
  imports: [
    CommonModule,
    ObjectsDialogRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
})
export class ObjectsDialogModule {}
