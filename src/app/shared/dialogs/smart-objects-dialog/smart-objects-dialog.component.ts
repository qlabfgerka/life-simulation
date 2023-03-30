import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Aggression } from '../../models/aggression/aggression.enum';
import { SmartObjectDTO } from '../../models/smart-object/smart-object.model';
import { SmartObjectService } from '../../services/smart-object/smart-object.service';

@Component({
  selector: 'app-smart-objects-dialog',
  templateUrl: './smart-objects-dialog.component.html',
  styleUrls: ['./smart-objects-dialog.component.scss'],
})
export class SmartObjectsDialogComponent {
  public objects!: SmartObjectDTO[];
  public objectsForm!: FormGroup;

  public names = ['Prey', 'Predators'];
  public colors = ['#7D2CB3', '#45007D', '#FF614E', '#D31F1F'];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private readonly dialogRef: MatDialogRef<SmartObjectsDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly smartObjectService: SmartObjectService
  ) {
    if (!this.data) return;

    if (this.data.objects) this.objects = this.data.objects;
    else this.objects = new Array<SmartObjectDTO>();
  }

  ngOnInit(): void {
    this.initForm();
  }

  public get objectsArray(): FormArray {
    return this.objectsForm.controls['objects'] as FormArray;
  }

  public addObjectInput(
    amount: number | string = '',
    hunger: number = 0.3,
    thirst: number = 0,
    reproduction: number = 0.2,
    age: number = 100,
    perception: number = 50,
    velocity: number = 0.4,
    radius: number = 10,
    variation: number = 0.05
  ): void {
    this.objectsArray.push(
      this.formBuilder.group({
        amount: [amount, [Validators.required]],
        hunger: [hunger, [Validators.required, Validators.min(0), Validators.max(1)]],
        thirst: [thirst, [Validators.required, Validators.min(0), Validators.max(1)]],
        reproduction: [reproduction, [Validators.required, Validators.min(0), Validators.max(1)]],
        age: [age, [Validators.required, Validators.min(1), Validators.max(100)]],
        perception: [perception, [Validators.required, Validators.min(1), Validators.max(100)]],
        velocity: [velocity, [Validators.required, Validators.min(0), Validators.max(1)]],
        radius: [radius, [Validators.required, Validators.min(5), Validators.max(20)]],
        variation: [variation, [Validators.required, Validators.min(0), Validators.max(1)]],
      })
    );
  }

  public accept(): void {
    const types = [Aggression.prey, Aggression.predator];
    this.objects = new Array<SmartObjectDTO>();
    let counter: number = 0;
    let typeCounter: number = 0;

    for (const object of this.objectsArray.controls) {
      if (!object.valid) continue;

      this.objects = this.objects.concat(
        this.smartObjectService.generateObjects(
          object.get('amount')!.value,
          [this.colors[counter++], this.colors[counter++]],
          +types[typeCounter++],
          object.get('hunger')!.value,
          object.get('thirst')!.value,
          object.get('reproduction')!.value,
          object.get('age')!.value,
          object.get('perception')!.value,
          object.get('velocity')!.value,
          object.get('radius')!.value,
          object.get('variation')!.value
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

  private initForm(): void {
    this.objectsForm = this.formBuilder.group({
      objects: this.formBuilder.array([]),
    });

    if (this.objects && this.objects.length > 0) this.patchValues();
    else for (let i = 0; i < 2; i++) this.addObjectInput();
  }

  private patchValues(): void {
    const groups = this.objects.reduce((acc: any, item: SmartObjectDTO) => {
      if (!acc[item.typeId]) acc[item.typeId] = [];

      acc[item.typeId].push(item);
      return acc;
    }, {});

    for (const key in groups) {
      this.addObjectInput(
        groups[key].length,
        groups[key][0].hunger,
        groups[key][0].thirst,
        groups[key][0].reproduction,
        groups[key][0].age,
        groups[key][0].perception,
        groups[key][0].velocity,
        groups[key][0].radius,
        groups[key][0].variation
      );
    }
  }
}
