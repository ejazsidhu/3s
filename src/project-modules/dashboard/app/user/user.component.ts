import { Component, OnInit, Input } from '@angular/core';
import {HeaderService} from "../header.service";

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

	@Input() details;
    public header_data;
    public translation;
    constructor(private headerService:HeaderService) { }

  ngOnInit() {
      this.header_data = this.headerService.getStaticHeaderData();
      this.translation = this.header_data.language_translation;
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
