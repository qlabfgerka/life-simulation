import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicEvolutionComponent } from './basic-evolution.component';

const routes: Routes = [{ path: '', component: BasicEvolutionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BasicEvolutionRoutingModule {}
