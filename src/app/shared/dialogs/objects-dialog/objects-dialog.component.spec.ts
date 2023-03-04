import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectsDialogComponent } from './objects-dialog.component';

describe('ObjectsDialogComponent', () => {
  let component: ObjectsDialogComponent;
  let fixture: ComponentFixture<ObjectsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
