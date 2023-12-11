import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkeletonComponent } from './layout/skeleton/skeleton.component';
import { LoginComponent } from './modules/login/login.component';
import { HomeComponent } from './modules/home/home.component';
import { RegistrationComponent } from './modules/registration/registration.component';
import { AdminMenuComponent } from './modules/admin-menu/admin-menu.component';
import { ModeratorMenuComponent } from './modules/moderator-menu/moderator-menu.component';
import { ImageUploadComponent } from './modules/image-upload/image-upload.component';
import { ChangePasswordComponent } from './modules/change-password/change-password.component';


const routes: Routes = [
  {
    path:'',
    component: SkeletonComponent,
    pathMatch: 'prefix',
    children:[
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegistrationComponent },
      { path: 'AdminMenu', component: AdminMenuComponent },
      { path: 'ModeratorMenu', component:ModeratorMenuComponent },
      { path: 'ImageUpload', component:ImageUploadComponent },
      { path: 'ChangePassword', component:ChangePasswordComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
