import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolvingObjectsDialogComponent } from './evolving-objects-dialog.component';

describe('EvolvingObjectsDialogComponent', () => {
  let component: EvolvingObjectsDialogComponent;
  let fixture: ComponentFixture<EvolvingObjectsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvolvingObjectsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolvingObjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
