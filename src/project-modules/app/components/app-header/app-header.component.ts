import { Component, OnInit } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { environment } from "@environments/environment";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  public showSibmeLogo: boolean = false;
  public loaded: boolean = false; // check if required page data is loaded
  public headerdetails;// = new Object;
  isLoading=true;
  constructor(private headerService: HeaderService) {
    if (document.location.href.indexOf('hmh') < 0) this.showSibmeLogo = true;
  }

  ngOnInit() {
    this.headerdetails = {};
    this.headerdetails.status = false;
    let project_title = environment.project_title;
    let base_url = environment.baseHeaderUrl + `/angular_header_api/${project_title}`;
    this.headerService.getHeaderData(base_url).subscribe((header_details:any) => {
      
       this.handleResponse(header_details);
      if(header_details.user_current_account.User.image)
      this.headerService.setCurrentUserImageValue(header_details.avatar_path);
    });
  }

  private handleResponse(args: any) {
    this.headerdetails = args;
    if (!args.status) {
      var getUrl = window.location;
      var baseUrl = getUrl.protocol + "//" + getUrl.host;
      location.href = baseUrl;
    } else {
      this.loaded = true;
      this.isLoading=false;
    }
  }

  public get_header_bg(args: any) {

    if (args && args.status) {

      return (args.site_id == 1) ? args.header_background_color : args.header_color;

    }

  }

}
