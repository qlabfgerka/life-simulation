import { Component, Inject } from '@angular/core';
import { PlantDTO } from '../../models/plant/plant.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlantType } from '../../models/plant/plant-type.enum';
import { PlantService } from '../../services/plant/plant.service';

@Component({
  selector: 'app-plants-dialog',
  templateUrl: './plants-dialog.component.html',
  styleUrls: ['./plants-dialog.component.scss'],
})
export class PlantsDialogComponent {
  public plants!: PlantDTO[];
  public plantsForm!: FormGroup;

  public names = ['Land', 'Water'];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private readonly dialogRef: MatDialogRef<PlantsDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly plantService: PlantService
  ) {
    if (!this.data) return;

    if (this.data.plants) this.plants = this.data.plants;
    else this.plants = new Array<PlantDTO>();
  }

  ngOnInit(): void {
    this.initForm();
  }

  public get plantsArray(): FormArray {
    return this.plantsForm.controls['plants'] as FormArray;
  }

  public addPlantInput(
    amount: number | string = 5,
    size: number = 10,
    growthRate: number = 5,
    spreadRadius: number = 2,
    value: number = 0.5,
    seedOutput: number = 2,
    variation: number = 0.05
  ): void {
    this.plantsArray.push(
      this.formBuilder.group({
        amount: [amount, [Validators.required]],
        size: [size, [Validators.required, Validators.min(2), Validators.max(15)]],
        growthRate: [growthRate, [Validators.required, Validators.min(0), Validators.max(100)]],
        spreadRadius: [spreadRadius, [Validators.required, Validators.min(1), Validators.max(10)]],
        value: [value, [Validators.required, Validators.min(0), Validators.max(1)]],
        seedOutput: [seedOutput, [Validators.required, Validators.min(0), Validators.max(20)]],
        variation: [variation, [Validators.required, Validators.min(0), Validators.max(1)]],
      })
    );
  }

  public accept(): void {
    const types = [PlantType.land, PlantType.aquatic];
    this.plants = new Array<PlantDTO>();
    let typeCounter: number = 0;

    for (const plant of this.plantsArray.controls) {
      if (!plant.valid) continue;

      this.plants = this.plants.concat(
        this.plantService.generatePlants(
          plant.get('amount')!.value,
          types[typeCounter++],
          plant.get('size')!.value,
          plant.get('growthRate')!.value,
          plant.get('spreadRadius')!.value,
          plant.get('value')!.value,
          plant.get('seedOutput')!.value,
          plant.get('variation')!.value
        )
      );
    }

    this.dialogRef.close({
      plants: this.plants,
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  private initForm(): void {
    this.plantsForm = this.formBuilder.group({
      plants: this.formBuilder.array([]),
    });

    if (this.plants && this.plants.length > 0) this.patchValues();
    else for (let i = 0; i < 2; i++) this.addPlantInput();
  }

  private patchValues(): void {
    const groups = this.plants.reduce((acc: any, item: PlantDTO) => {
      if (!acc[item.typeId]) acc[item.typeId] = [];

      acc[item.typeId].push(item);
      return acc;
    }, {});

    for (const key in groups) {
      this.addPlantInput(
        groups[key].length,
        groups[key][0].size,
        groups[key][0].growthRate,
        groups[key][0].spreadRadius,
        groups[key][0].value,
        groups[key][0].seedOutput,
        groups[key][0].variation
      );
    }
  }
}
