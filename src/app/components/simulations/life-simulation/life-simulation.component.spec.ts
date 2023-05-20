import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeSimulationComponent } from './life-simulation.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LifeSimulationComponent', () => {
  let component: LifeSimulationComponent;
  let fixture: ComponentFixture<LifeSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatInputModule,
        MatDialogModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSliderModule,
      ],
      declarations: [LifeSimulationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LifeSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
