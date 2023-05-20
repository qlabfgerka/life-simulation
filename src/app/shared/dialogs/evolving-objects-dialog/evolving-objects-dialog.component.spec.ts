import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolvingObjectsDialogComponent } from './evolving-objects-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EvolvingObjectsDialogComponent', () => {
  let component: EvolvingObjectsDialogComponent;
  let fixture: ComponentFixture<EvolvingObjectsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule],
      declarations: [EvolvingObjectsDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EvolvingObjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
