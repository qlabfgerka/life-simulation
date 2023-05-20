import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicEvolutionComponent } from './basic-evolution.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { BarChartModule } from 'src/app/shared/charts/bar-chart/bar-chart.module';

describe('BasicEvolutionComponent', () => {
  let component: BasicEvolutionComponent;
  let fixture: ComponentFixture<BasicEvolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        BarChartModule,
      ],
      declarations: [BasicEvolutionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicEvolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
