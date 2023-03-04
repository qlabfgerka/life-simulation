import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeSimulationComponent } from './life-simulation.component';

describe('LifeSimulationComponent', () => {
  let component: LifeSimulationComponent;
  let fixture: ComponentFixture<LifeSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeSimulationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
