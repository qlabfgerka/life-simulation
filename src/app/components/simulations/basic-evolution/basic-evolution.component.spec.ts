import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicEvolutionComponent } from './basic-evolution.component';

describe('BasicEvolutionComponent', () => {
  let component: BasicEvolutionComponent;
  let fixture: ComponentFixture<BasicEvolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicEvolutionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicEvolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
