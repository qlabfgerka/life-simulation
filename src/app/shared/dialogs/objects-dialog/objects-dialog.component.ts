import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ObjectDTO } from '../../models/object/object.model';
import { ObjectService } from '../../services/object/object.service';

@Component({
  selector: 'app-objects-dialog',
  templateUrl: './objects-dialog.component.html',
  styleUrls: ['./objects-dialog.component.scss'],
})
export class ObjectsDialogComponent implements OnInit {
  public objects!: ObjectDTO[];
  public objectsForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private readonly dialogRef: MatDialogRef<ObjectsDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly objectService: ObjectService
  ) {
    if (!this.data) return;

    if (this.data.objects) this.objects = this.data.objects;
    else this.objects = new Array<ObjectDTO>();
  }

  ngOnInit(): void {
    this.initForm();
  }

  public get objectsArray(): FormArray {
    return this.objectsForm.controls['objects'] as FormArray;
  }

  public addObjectInput(): void {
    this.objectsArray.push(
      this.formBuilder.group({
        amount: ['', [Validators.required]],
        color: [
          '',
          [Validators.required, Validators.pattern(/^#[0-9a-f]{6}$/i)],
        ],
        spawnRate: [
          '',
          [Validators.required, Validators.min(0), Validators.max(1)],
        ],
        dieRate: [
          '',
          [Validators.required, Validators.min(0), Validators.max(1)],
        ],
      })
    );
  }

  public accept(): void {
    this.objects = new Array<ObjectDTO>();

    for (const object of this.objectsArray.controls) {
      if (!object.valid) continue;

      this.objects = this.objects.concat(
        this.objectService.generateObjects(
          object.get('amount')!.value,
          object.get('color')!.value,
          object.get('dieRate')!.value,
          object.get('spawnRate')!.value
        )
      );
    }

    this.dialogRef.close({
      objects: this.objects,
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public detectNewObject(i: number): void {
    if (this.objectsArray.length !== i + 1) return;

    if (
      this.objectsArray.controls[i].get('amount')?.valid &&
      this.objectsArray.controls[i].get('color')?.valid &&
      this.objectsArray.controls[i].get('spawnRate')?.valid &&
      this.objectsArray.controls[i].get('dieRate')?.valid
    ) {
      this.addObjectInput();
    }
  }

  private initForm(): void {
    this.objectsForm = this.formBuilder.group({
      objects: this.formBuilder.array([]),
    });

    this.addObjectInput();
  }
}
