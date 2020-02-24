import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: "no-discussion",
  templateUrl: "./no-discussion.component.html",
  styleUrls: ["./no-discussion.component.css"]
})
export class NoDiscussionComponent implements OnInit, OnDestroy {
  SearchString: any;
  bysearch: boolean;
  public header_data;
  public userAccountLevelRoleId;
  public translation: any = {};
  private subscription: Subscription;
  constructor(private route:ActivatedRoute,private headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      params.search
      this.SearchString = params.search
      if(this.SearchString!=undefined){
        this.bysearch = true
      }else{
        this.bysearch = false
      }
    });
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
