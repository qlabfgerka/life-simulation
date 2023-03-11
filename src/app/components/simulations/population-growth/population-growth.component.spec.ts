import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopulationGrowthComponent } from './population-growth.component';

describe('PopulationGrowthComponent', () => {
  let component: PopulationGrowthComponent;
  let fixture: ComponentFixture<PopulationGrowthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
