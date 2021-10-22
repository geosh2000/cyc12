import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { UploadsComponent } from './uploads/uploads.component';


const childRoutes: Routes = [
  { 
    path: 'uploads', 
    component: UploadsComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Upload Excel Files', role: 'upload_info' } 
  }
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
