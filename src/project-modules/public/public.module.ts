import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const route:Routes=[

  { path: '',redirectTo:'reset_password' ,pathMatch:'full' },

   { path: 'reset_password', component: ResetPasswordComponent }
]

@NgModule({
  declarations: [ResetPasswordComponent],
  imports: [
  RouterModule.forChild(route),
    //CommonModule
    FormsModule,
    HttpClientModule
  ],
  exports: [ResetPasswordComponent]
})
export class PublicModule { }
