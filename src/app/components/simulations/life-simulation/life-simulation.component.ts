import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ObjectsDialogComponent } from '../../../shared/dialogs/objects-dialog/objects-dialog.component';

@Component({
  selector: 'app-life-simulation',
  templateUrl: './life-simulation.component.html',
  styleUrls: ['./life-simulation.component.scss'],
})
export class LifeSimulationComponent implements OnInit {
  constructor(private readonly dialog: MatDialog) {}

  ngOnInit(): void {}

  public openSettings(): void {
    const settingsDialogRef = this.dialog.open(ObjectsDialogComponent, {
      data: {},
    });

    settingsDialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
      }
    });
  }
}
