import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AggresiveSimulationComponent } from './aggresive-simulation.component';

const routes: Routes = [{ path: '', component: AggresiveSimulationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AggresiveSimulationRoutingModule {}
