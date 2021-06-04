import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './feature/map/map.component';

const routes: Routes = [
  {
    path: 'profile',
    loadChildren: () =>
      import('./feature/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'map',
    component: MapComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
