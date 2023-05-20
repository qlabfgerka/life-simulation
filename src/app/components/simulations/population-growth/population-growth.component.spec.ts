import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopulationGrowthComponent } from './population-growth.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

describe('PopulationGrowthComponent', () => {
  let component: PopulationGrowthComponent;
  let fixture: ComponentFixture<PopulationGrowthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
      ],
      declarations: [PopulationGrowthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopulationGrowthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
