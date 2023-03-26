import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartObjectsDialogComponent } from './smart-objects-dialog.component';

describe('SmartObjectsDialogComponent', () => {
  let component: SmartObjectsDialogComponent;
  let fixture: ComponentFixture<SmartObjectsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartObjectsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartObjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
