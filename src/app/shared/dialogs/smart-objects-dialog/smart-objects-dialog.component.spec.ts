import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartObjectsDialogComponent } from './smart-objects-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SmartObjectsDialogComponent', () => {
  let component: SmartObjectsDialogComponent;
  let fixture: ComponentFixture<SmartObjectsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatFormFieldModule],
      declarations: [SmartObjectsDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SmartObjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
