import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggresiveSimulationComponent } from './aggresive-simulation.component';

describe('AggresiveSimulationComponent', () => {
  let component: AggresiveSimulationComponent;
  let fixture: ComponentFixture<AggresiveSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AggresiveSimulationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AggresiveSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
