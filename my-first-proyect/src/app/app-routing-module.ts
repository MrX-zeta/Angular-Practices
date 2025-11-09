import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteDummy } from './route-dummy';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: RouteDummy },
  { path: 'search', component: RouteDummy }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
