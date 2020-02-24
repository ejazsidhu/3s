import { Component, OnInit, Input } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  public header_data;
  public translation;
  @Input() details;
  public userImage = '';
  alertPrevent=false;
  public userFirstName;
  public userLastName;
  public userEmail;
  constructor(private headerService:HeaderService) {

  //  this.headerService.LoggedIn.subscribe((f)=>{

      //  if(f){
    this.header_data = this.headerService.getStaticHeaderData();
    this.translation = this.header_data.language_translation;
    this.headerService.userImageSubject.subscribe((data) => {
      this.userImage = data;
    });
    this.headerService.userFirstNameSubject.subscribe((data) => {
      this.userFirstName = data;
    });
    this.headerService.userLastNameSubject.subscribe((data) => {
      this.userLastName = data;
    });
    this.headerService.userEmailSubject.subscribe((data) => {
      this.userEmail = data;
    });
    //  }

    //  })

  }

  ngOnInit() {

  }

  setAlertPreventValue(){
    // localStorage.clear();
    this.headerService.setalertPrenventValue(true);
  }


  public getAvatarPath(details){

  	if(details.user_current_account.User.image){

  		return details.avatar_path;

  	} else{
  		return details.base_url+"/img/home/photo-default.png";
  	}
  	//

  }

  public SettingsAllowed(details){

    return details.user_permissions.roles.role_id == 100;

  }
}
