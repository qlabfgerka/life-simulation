import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmartObjectsDialogRoutingModule } from './smart-objects-dialog-routing.module';
import { SmartObjectsDialogComponent } from './smart-objects-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [SmartObjectsDialogComponent],
  imports: [
    CommonModule,
    SmartObjectsDialogRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
})
export class SmartObjectsDialogModule {}
