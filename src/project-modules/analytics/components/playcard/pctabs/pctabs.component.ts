import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap';
import { HeaderService } from "@projectModules/app/services";
import { GLOBAL_CONSTANTS } from '@constants/constant';

@Component({
  selector: 'pctabs',
  templateUrl: './pctabs.component.html',
  styleUrls: ['./pctabs.component.css']
})
export class PctabsComponent implements OnInit, OnDestroy {

  @Input() data;
  @ViewChild('pcTabs', { static: true }) pcTabs: TabsetComponent;
  private analyticsPCTabs = GLOBAL_CONSTANTS.ANALYTICS_PC_TABS;
  public translation: any = {};
  public translationLoaded: boolean = false;
	private translationSubscription: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerService:HeaderService
    ) { 
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      if(this.translation.analytics_overview){ // check if translation for analytics loaded
        this.translationLoaded = true;
      }
		});
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {

			if (queryParams.tab) {
				let selectedRouteTab = this.analyticsPCTabs.find(item => item.label == queryParams.tab);
				this.pcTabs.tabs[selectedRouteTab.value].active = true;
			} else {
				this.pcTabs.tabs[0].active = true;

			}
		});
  }

  public selectTab(tabId: number) {

		let selectedRouteTab = this.analyticsPCTabs.find(item => item.value == tabId);

		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { tab: selectedRouteTab.label },
			queryParamsHandling: 'merge',
		});
	}

  ngOnDestroy(){
    this.translationSubscription.unsubscribe();
  }

}
