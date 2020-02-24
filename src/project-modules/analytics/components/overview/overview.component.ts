import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Observable } from "rxjs";
import { HeaderService } from "@projectModules/app/services";
// import { BodyService } from "../body.service";
import { BodyService } from "@analytics/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {
  public overview_data;
  public sessionData;
  public isLiveStreamingEnabled;
  public translation: any = {};
  public translationLoaded: boolean = false;
  public dataLoaded: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private bodyService: BodyService, private headerService: HeaderService) {
    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;

      if (this.translation.analytics_total_user) { // check if translation for analytics is loaded
        this.translationLoaded = true;
      }
    }));
  }

  ngOnInit() {
    let sessionData;
    sessionData = this.headerService.getStaticHeaderData();
    this.sessionData = sessionData;
    this.isLiveStreamingEnabled = sessionData.user_current_account.accounts;
    this.bodyService.triggerOverviewDataChange.subscribe(data => {
      this.overview_data = data;
      this.dataLoaded = true;
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
