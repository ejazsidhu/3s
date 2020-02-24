import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PublicService } from '../../services/public.service';
import { HeaderService } from "@projectModules/app/services";
import * as _ from "lodash"
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public model = {
    password: '',
    confirm_password: '',
    key: ''

  }

  public showPassword = 'password';
  public showConfirmPassword = 'password';
  public showPasswordFlag = false;
  public showConfirmPasswordFlag = false;

  constructor(private acRoute: ActivatedRoute, private router: Router, private toastr: ToastrService, private publicService: PublicService, private headerService: HeaderService) {

    this.acRoute.queryParams.subscribe(params => {
      if (params.key)
        this.model.key = params.key;
      else
        this.router.navigate(["/page_not_found"]);

    })
    // let sessionData: any = this.headerService.getStaticHeaderData();
    // if(!_.isEmpty(sessionData))
  }

  ngOnInit() {
  }

  showhidePassword(flag, option) {


  }

  resetPassword() {
    console.log('model', this.model)
    if (this.model.password == '' || this.model.confirm_password == '') {
      this.toastr.info('Please fill both fileds to continue')
    }
    if (this.model.password.length < 8 || this.model.confirm_password.length < 8) {
      this.toastr.info('Minimum 8 charaters for password')
    }

    if (this.model.password != this.model.confirm_password) {
      this.toastr.info('confirm password must match new password')
    }

    if ((this.model.password.length >= 8 && this.model.confirm_password.length >= 8) && (this.model.password == this.model.confirm_password)) {
      this.publicService.resetPassword(this.model).subscribe((data: any) => {
        console.log('reset password data', data)
      }, error => {

      })
    }

  }

}
