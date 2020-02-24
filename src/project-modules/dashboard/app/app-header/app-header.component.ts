import { Component, OnInit } from '@angular/core';
import { HeaderService } from "../header.service";
import { environment } from '@src/environments/environment';
// import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  public loaded: boolean = false; // check if required page data is loaded
  public showSibmeLogo: boolean = false;
  public headerdetails;// = new Object;
  public header_data;
  public translation;
  constructor(private headerService: HeaderService) {
    if (document.location.href.indexOf('hmh') < 0) this.showSibmeLogo = true;
   }

  ngOnInit() {
    this.headerdetails = {};
    this.headerdetails.status = false;
    let project_title = environment.project_title;
    let base_url = environment.baseHeaderUrl + `/angular_header_api/${project_title}`;

    this.headerService.getHeaderData(base_url).subscribe((header_details) => {
      this.handleResponse(header_details)
    });

    // this.header_data = this.headerService.getStaticHeaderData();
    //this.translation = this.header_data.language_translation;
    // console.log(this.header_data);
  }

  private handleResponse(args: any) {
    this.headerdetails = args;
    if (!args.status) {
      var getUrl = window.location;
      var baseUrl = getUrl.protocol + "//" + getUrl.host;
      location.href = baseUrl;
    } else {
      this.loaded = true;
    }
  }

  public get_header_bg(args: any) {

    if (args && args.status) {

      return (args.site_id == 1) ? args.header_background_color : args.header_color;

    }

  }

}
