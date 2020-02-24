import { Component, OnInit } from '@angular/core';
import { HeaderService } from '@src/project-modules/app/services';
import { environment } from '@src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-page-not-found',
  templateUrl: './shared-page-not-found.component.html',
  styleUrls: ['./shared-page-not-found.component.css']
})
export class SharedPageNotFoundComponent implements OnInit {
  details:any= {};
  public translation: any = {};
  private projectTitle: string = 'dashboard_angular';

  constructor(private headerService: HeaderService,private router:Router) { }

  ngOnInit() {
    this.details = {};
    this.details.status = false;
    let base_url = environment.baseHeaderUrl + `/angular_header_api/${this.projectTitle}`;
    this.headerService.getHeaderData(base_url).subscribe((header_details) => {
      this.details=header_details;
      this.translation = this.details.language_translation;
    });
  }

  private GetRoleId() {

    //details?.user_current_account?.roles?.role_id!=120
    if(this.details.user_current_account)
    return this.details.user_current_account.roles.role_id;

  }
  public isAllowedPeople() {
    //;
    if (!this.details) {
      return false;
    } else {

      let roleId = this.GetRoleId();

      if (roleId == 100 || roleId == 110) {
        return true;
      }
      else if (roleId == 120 && this.details.user_current_account.users_accounts.permission_administrator_user_new_role == "1") {

        return true;

      } else if (roleId == 115 && this.details.user_current_account.users_accounts.permission_administrator_user_new_role == "1") {

        return true;

      } else {

        // console.log("==========access=======");
        // console.log(this.details.user_current_account.users_accounts.parmission_access_my_workspace);
        return false;


      }



    }

  }


  gotTo(url){
    if(url=='people'){
      url="/people/home/people"
      this.router.navigate([url],{ fragment: 'adduser' });
    }
    else
    this.router.navigate([url]);

    

  }
}
