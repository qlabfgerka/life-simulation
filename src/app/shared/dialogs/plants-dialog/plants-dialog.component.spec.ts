import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantsDialogComponent } from './plants-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PlantsDialogComponent', () => {
  let component: PlantsDialogComponent;
  let fixture: ComponentFixture<PlantsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule],
      declarations: [PlantsDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
