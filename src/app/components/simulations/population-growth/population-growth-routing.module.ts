import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PopulationGrowthComponent } from './population-growth.component';

const routes: Routes = [{ path: '', component: PopulationGrowthComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PopulationGrowthRoutingModule {}
