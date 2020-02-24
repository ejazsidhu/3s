import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HeaderService } from "@projectModules/app/services";
import { BodyService, TagsService, PlaycardService } from "@analytics/services";

@Component({
	selector: 'playcard',
	templateUrl: './playcard.component.html',
	styleUrls: ['./playcard.component.css']
})
export class PlaycardComponent implements OnInit, OnDestroy {

	private params;
	public userDetails;
	private firstTimeLoad: boolean = false;

	constructor(
		private bodyService: BodyService,
		private tagsService: TagsService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private playcardService: PlaycardService,
		private headerService: HeaderService
	) { }

	ngOnInit() {

		let filters = this.bodyService.GetFilters();

		let is_submitted = false;
		if (filters.start_date && filters.end_date) is_submitted = true;

		this.activatedRoute.params.subscribe(params => {
			this.params = params; this.loadUserDetails(is_submitted);
		});


		this.tagsService.PlaycardUpdateClicked.subscribe(d => { if (d) { this.LoadOverview() } });

	}

	private LoadOverview() {

		this.loadUserDetails(true);

	}

	private loadUserDetails(is_submitted?) {
		let interval_id = setInterval(() => {

			let sessionData;
			let that = this;
			sessionData = this.headerService.getStaticHeaderData();

			if (sessionData.user_current_account) {

				clearInterval(interval_id);

				let params = JSON.parse(JSON.stringify(that.params));

				params.user_current_account = sessionData.user_current_account;

				params.user_permissions = sessionData.user_permissions;

				let filters = this.bodyService.GetFilters();

				if (is_submitted) {



					params.filter_type = (filters.duration > -1) ? "default" : "custom";

					if (filters.duration > -1) {

						params.duration = filters.duration;

					} else {
						params.start_date = filters.start_date;
						params.end_date = filters.end_date;
					}


				}


				// if (filters.subAccount) {

				//  params.account_id = "";
				//  params.subAccount = filters.subAccount;

				// } else {

				//  params.account_id = that.params.account_id;
				//  params.subAccount = "";
				// }
				params.account_id = that.params.account_id;
				params.subAccount = "";
				params.folder_type = this.playcardService.Get_Filter("folder_type") || 2;
				params.coachee_view = this.playcardService.Get_Filter("coachee_view");
				params.framework_id = this.playcardService.Get_Filter("framework_id");
				params.standards = this.playcardService.Get_Filter("standards");
				params.search_by_standards = this.playcardService.Get_Filter("standards");

				if (this.firstTimeLoad) this.updateRouteBasedOnFilters(params); // only update route when user click update button i.e page has been loaded and dispalyed to user

				if (!this.firstTimeLoad) this.firstTimeLoad = true; // if current function is called on ngOnInit then update the variable to later check that page has been initialized
				that.playcardService.LoadPlaycard(params).subscribe(data => that.userDetails = data);

			}



		}, 500);


		//

	}

	private updateRouteBasedOnFilters(filters: any) {
		let urlQueryParams: any = {};

		if (filters.filter_type) urlQueryParams.filter_type = filters.filter_type;
		else urlQueryParams.filter_type = null;

		if (filters.duration) urlQueryParams.duration = filters.duration;
		else urlQueryParams.duration = null;

		if (filters.start_date) {
			if (typeof filters.start_date == 'object') {
				let start_month = filters.start_date.getMonth() + 1;
				if (start_month < 10) start_month = `0${start_month}`;
				let start_date = `${start_month}/${filters.start_date.getDate()}/${filters.start_date.getFullYear()}`;
				urlQueryParams.start_date = start_date;
			}
			else urlQueryParams.start_date = filters.start_date;
		}
		else urlQueryParams.start_date = null;

		if (filters.end_date) {
			if (typeof filters.end_date == 'object') {
				let end_month = filters.end_date.getMonth() + 1;
				if (end_month < 10) end_month = `0${end_month}`;
				let end_date = `${end_month}/${filters.end_date.getDate()}/${filters.end_date.getFullYear()}`;
				urlQueryParams.end_date = end_date;
			}
			else urlQueryParams.end_date = filters.end_date;
		}

		else urlQueryParams.end_date = null;

		if (filters.folder_type) urlQueryParams.folder_type = filters.folder_type;
		else urlQueryParams.folder_type = null;

		if (filters.coachee_view) urlQueryParams.coachee_view = filters.coachee_view;
		else urlQueryParams.coachee_view = null;

		if (filters.framework_id) urlQueryParams.framework_id = filters.framework_id;
		else urlQueryParams.framework_id = null;

		if (filters.standards) urlQueryParams.standards = filters.standards;
		else urlQueryParams.standards = null;

		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: urlQueryParams,
			queryParamsHandling: 'merge',
			// skipLocationChange: true
		});
	}

	ngOnDestroy() {
		this.bodyService.deleteAllFilters();
		this.playcardService.deleteAllFilters();
	}

}
