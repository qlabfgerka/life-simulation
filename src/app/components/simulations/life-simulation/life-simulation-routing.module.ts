import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LifeSimulationComponent } from './life-simulation.component';

const routes: Routes = [{ path: '', component: LifeSimulationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LifeSimulationRoutingModule {}
