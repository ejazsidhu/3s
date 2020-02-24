import { Component, OnInit, Input } from '@angular/core';
import { HeaderService} from "../header.service";

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
@Input() details;
public currentProject;
public header_data;
public translation;

  constructor(private headerService:HeaderService) {

  	let that = this;

  	setTimeout(()=>{

  		console.log(localStorage);

  		if(localStorage.current_page){

  			that.currentProject = localStorage.current_page;

  		}

  	}, 3000);

  }

  public isAllowedPeople(){

    if(!this.details){
      return false;
    }else{

      let roleId = this.GetRoleId();

      if(roleId == 100 || roleId == 110){
        return true;
      }
      else if(roleId == 120 && this.details.user_current_account.users_accounts.permission_administrator_user_new_role == "1"){

        return true;

      }else if(roleId==115 && this.details.user_current_account.users_accounts.permission_administrator_user_new_role == "1"){

        return true;

      }else{

        return false;
      
      }

        

    }

  }

  private GetRoleId(){

    //details?.user_current_account?.roles?.role_id!=120
    return this.details.user_current_account.roles.role_id;

  }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    this.translation = this.header_data.language_translation;
  }

}
