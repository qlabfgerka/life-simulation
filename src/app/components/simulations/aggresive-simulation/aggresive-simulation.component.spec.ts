import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggresiveSimulationComponent } from './aggresive-simulation.component';
import { BarChartModule } from 'src/app/shared/charts/bar-chart/bar-chart.module';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AggresiveSimulationComponent', () => {
  let component: AggresiveSimulationComponent;
  let fixture: ComponentFixture<AggresiveSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, BarChartModule, FormsModule, MatFormFieldModule, MatInputModule],
      declarations: [AggresiveSimulationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AggresiveSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
