import { Component, OnInit, Input } from '@angular/core';
import { Event as RouterEvent, Router, NavigationEnd } from "@angular/router";
import { HeaderService } from "@projectModules/app/services";
import { GLOBAL_CONSTANTS } from '@constants/constant';

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  @Input() details;
  public navItems = GLOBAL_CONSTANTS.NAV_ITEMS;
  public selectedNavItem: string = '';
  public header_data;
  public translation;
  constructor(private headerService: HeaderService, private router: Router) {

    // update selected nav item before the router events changed i.e on first load of app
    this.updateSelectedNavItem(router.url);

    this.router.events.subscribe(

      (event: RouterEvent): void => {
        if (event instanceof NavigationEnd) {
          // update selected nav item when the router events changed i.e user navigate from one module to another or internal module routing
          this.updateSelectedNavItem(event.urlAfterRedirects)
        }
      }
    );

  }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    this.translation = this.header_data.language_translation;
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

  private GetRoleId() {

    //details?.user_current_account?.roles?.role_id!=120
    return this.details.user_current_account.roles.role_id;

  }

  /**
   * Update the selectedNavItem based on current base url
   * @param {currentUrl: string} 
   */
  private updateSelectedNavItem(currentUrl: string) {
    if (currentUrl.indexOf('workspace/') > 0 || currentUrl.indexOf('workspace_video/') > 0 || (currentUrl.indexOf('video_details/') > 0 && currentUrl.indexOf('workspace') > 0)) {
      this.selectedNavItem = this.navItems.WORKSPACE;
    } else if (currentUrl.indexOf('video_huddles/') > 0 || (currentUrl.indexOf('video_details/') > 0 && currentUrl.indexOf('workspace') < 0)) {
      this.selectedNavItem = this.navItems.HUDDLE;
    } else if (currentUrl.indexOf('analytics_angular/') > 0) {
      this.selectedNavItem = this.navItems.ANALYTICS;
    } else if (currentUrl.indexOf('people') > 0){
      this.selectedNavItem = this.navItems.PEOPLE;
    }else {
      this.selectedNavItem = '';
    }
  }

}
