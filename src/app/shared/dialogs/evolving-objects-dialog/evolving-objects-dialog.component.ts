import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EvolvingObjectDTO } from '../../models/evolving-object/evolving-object.model';
import { EvolvingObjectService } from '../../services/evolving-object/evolving-object.service';

@Component({
  selector: 'app-evolving-objects-dialog',
  templateUrl: './evolving-objects-dialog.component.html',
  styleUrls: ['./evolving-objects-dialog.component.scss'],
})
export class EvolvingObjectsDialogComponent {
  public objects!: EvolvingObjectDTO[];
  public objectsForm!: FormGroup;

  private typeId: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private readonly dialogRef: MatDialogRef<EvolvingObjectsDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly evolvingObjectService: EvolvingObjectService
  ) {
    if (!this.data) return;

    if (this.data.objects) this.objects = this.data.objects;
    else this.objects = new Array<EvolvingObjectDTO>();
  }

  ngOnInit(): void {
    this.initForm();
  }

  public get objectsArray(): FormArray {
    return this.objectsForm.controls['objects'] as FormArray;
  }

  public addObjectInput(
    amount: number | string = '',
    energy: string = '',
    radius: string = '',
    velocity: string = '',
    perception: string = ''
  ): void {
    this.objectsArray.push(
      this.formBuilder.group({
        amount: [amount, [Validators.required]],
        energy: [energy, [Validators.required, Validators.min(10), Validators.max(10000000)]],
        radius: [radius, [Validators.required, Validators.min(5), Validators.max(20)]],
        velocity: [velocity, [Validators.required, Validators.min(1), Validators.max(100)]],
        perception: [perception, [Validators.required, Validators.min(1), Validators.max(100)]],
      })
    );
  }

  public accept(): void {
    this.typeId = 0;
    this.objects = new Array<EvolvingObjectDTO>();

    for (const object of this.objectsArray.controls) {
      if (!object.valid) continue;

      this.objects = this.objects.concat(
        this.evolvingObjectService.generateObjects(
          object.get('amount')!.value,
          this.typeId++,
          object.get('energy')!.value,
          object.get('radius')!.value,
          object.get('velocity')!.value,
          object.get('perception')!.value
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
      this.objectsArray.controls[i].get('energy')?.valid &&
      this.objectsArray.controls[i].get('radius')?.valid &&
      this.objectsArray.controls[i].get('velocity')?.valid &&
      this.objectsArray.controls[i].get('perception')?.valid
    ) {
      this.addObjectInput();
    }
  }

  private initForm(): void {
    this.objectsForm = this.formBuilder.group({
      objects: this.formBuilder.array([]),
    });

    if (this.objects && this.objects.length > 0) this.patchValues();

    this.addObjectInput();
  }

  private patchValues(): void {
    const groups = this.objects.reduce((acc: any, item: EvolvingObjectDTO) => {
      if (!acc[item.typeId]) acc[item.typeId] = [];

      acc[item.typeId].push(item);
      return acc;
    }, {});

    for (const key in groups) {
      this.addObjectInput(
        groups[key].length,
        groups[key][0].energy,
        groups[key][0].radius,
        groups[key][0].velocity,
        groups[key][0].perception
      );
    }
  }
}
