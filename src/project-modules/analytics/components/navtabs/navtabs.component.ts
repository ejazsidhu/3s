import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap';
import { BodyService, TabsService } from "@analytics/services";
import { HeaderService } from "@projectModules/app/services";
import { GLOBAL_CONSTANTS } from '@constants/constant';

@Component({
	selector: 'navtabs',
	templateUrl: './navtabs.component.html',
	styleUrls: ['./navtabs.component.css']
})
export class NavtabsComponent implements OnInit, OnDestroy {

	@ViewChild('navTabs', { static: true }) navTabs: TabsetComponent;

	public analyticsTabs = GLOBAL_CONSTANTS.ANALYTICS_TABS;
	public selectedTab = 0;
	public filters;
	public header_data;
	private queryParams: any = {};
	public translation: any = {};
	public translationLoaded: boolean = false;
	public navTabsLoaded: boolean = false;
	private translationSubscription: Subscription;

	constructor(private tabsService: TabsService, private bodyService: BodyService, private headerService: HeaderService, private router: Router, private activatedRoute: ActivatedRoute) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.analytics_overview) {
				this.translationLoaded = true;
				// this.selectTabOnPageInit(this.queryParams);
			}
		});

		this.bodyService.FilterSubmitPressed.subscribe((r) => {
			this.filters = this.bodyService.GetFilters();
		});
	}

	ngOnInit() {

		this.activatedRoute.queryParams.subscribe(queryParams => {
			this.queryParams = queryParams;
			this.selectTabOnPageInit(this.queryParams);

		});

		this.header_data = this.headerService.getStaticHeaderData();
	}

	private selectTabOnPageInit(queryParams: any) {
		if (queryParams.tab) {
			let selectedRouteTab = this.analyticsTabs.find(item => item.label == queryParams.tab);
			if (this.navTabs) {
				this.navTabs.tabs[selectedRouteTab.value].active = true;
				this.navTabsLoaded = true;
			}
		} else {
			if (this.navTabs) {
				this.navTabs.tabs[0].active = true;
				this.navTabsLoaded = true;
			}
		}
	}

	public selectTab(tab) {

		this.selectedTab = tab;
		this.tabsService.setTab(tab);

		let selectedRouteTab = this.analyticsTabs.find(item => item.value == tab);

		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { tab: selectedRouteTab.label },
			queryParamsHandling: 'merge',
		});
	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
	}

}
