import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../core/material/material.module';
import { UnityComponent } from './unity/unity.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { ModeratorMenuComponent } from './moderator-menu/moderator-menu.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RoomViewComponent } from './room-view/room-view.component';


@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    HomeComponent,
    UnityComponent,
    AdminMenuComponent,
    ModeratorMenuComponent,
    ImageUploadComponent,
    ChangePasswordComponent,
    RoomViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ]
})
export class ModulesModule { }
