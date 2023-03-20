import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ``,
    loadChildren: () =>
      import(
        './components/simulations/population-growth/population-growth.module'
      ).then((m) => m.PopulationGrowthModule),
  },
  {
    path: `basic-evolution`,
    loadChildren: () =>
      import(
        './components/simulations/basic-evolution/basic-evolution.module'
      ).then((m) => m.BasicEvolutionModule),
  },
  {
    path: `aggresive-simulation`,
    loadChildren: () =>
      import(
        './components/simulations/aggresive-simulation/aggresive-simulation.module'
      ).then((m) => m.AggresiveSimulationModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
