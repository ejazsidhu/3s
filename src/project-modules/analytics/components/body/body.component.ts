import { Component, OnInit, ViewChild, NgModule, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerModule, BsDatepickerConfig, BsLocaleService, esLocale, defineLocale } from 'ngx-bootstrap';
import * as _ from 'lodash';
import * as moment from "moment";
import { Subscription } from 'rxjs';

import { HeaderService } from "@projectModules/app/services";
import { TabsService, OverviewService, BodyService } from "@analytics/services";

@NgModule({
	imports: [BsDatepickerModule.forRoot()]
})
@Component({
	selector: 'app-body',
	templateUrl: './body.component.html',
	styleUrls: ['./body.component.css']
})
export class BodyComponent implements OnInit, OnDestroy {

	public sub_accounts;
	public settings;
	public sub_1;
	public selectedItem;
	public radioModel;
	public filters: filter = {};
	public bsConfig: Partial<BsDatepickerConfig>;
	public settings2;
	public currentTab;
	public selectedSub1;
	public selectedSub2;
	public OverviewData;
	public dropdowns;
	public framework_settings;
	public huddle_settings;
	public standards_settings;
	public isLoggedIn: boolean = false;
	public params;
	private accountChanged;
	public header_color;
	public primery_button_color;
	public secondry_button_color;
	public header_data;
	public translation: any = {};
	public translationLoaded: boolean = false;
	private subscriptions: Subscription = new Subscription();
	private queryParams: any;
	@ViewChild('dp', { static: false }) dp;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private tabsService: TabsService,
		private bodyService: BodyService,
		private overviewService: OverviewService,
		private headerService: HeaderService,
		private toastrService: ToastrService,
		private localeService: BsLocaleService
	) {

		this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.account_analytics) {
				this.translationLoaded = true;
				this.initiazlizeSettingWithTranslation();
				this.load_accounts();
			}
		}));

		this.activatedRoute.queryParams.subscribe(queryParams => {
			this.queryParams = queryParams;
			console.log('this.queryParams: ', this.queryParams);
			if (queryParams.subAccount) this.bodyService.UpdateFilters("subAccount", Number(queryParams.subAccount));
			this.bodyService.UpdateFilters('folder_type', queryParams.folder_type);

			// if (queryParams.folder_type) {
			// 	this.filters.folder_type = queryParams.folder_type;

			// 	if (queryParams.folder_type == 2 || queryParams.folder_type == 4) {

			// 		this.bodyService.UpdateFilters('folder_type', 2);

			// 		if (queryParams.folder_type == 4) this.bodyService.UpdateFilters('coachee_view', 2);
			// 		else this.bodyService.UpdateFilters('coachee_view', 1);

			// 	} else {
			// 		this.bodyService.deleteFilter('coachee_view');
			// 		this.bodyService.UpdateFilters('folder_type', queryParams.folder_type);
			// 	}

			// }

			if (queryParams.framework_id) this.bodyService.UpdateFilters("framework_id", queryParams.framework_id);
			if (queryParams.standards) {
				this.bodyService.UpdateFilters("standards", queryParams.standards);
			}

		});

		let sessionData: any = this.headerService.getStaticHeaderData();

		// Dynamic Button Colors Start
		this.header_color = sessionData.header_color;
		this.primery_button_color = sessionData.primery_button_color;
		this.secondry_button_color = sessionData.secondry_button_color;
		this.header_data = this.headerService.getStaticHeaderData();
		if (sessionData.language_translation.current_lang == 'es') defineLocale(sessionData.language_translation.current_lang, esLocale);
		this.localeService.use(sessionData.language_translation.current_lang);

	}

	public showdp() {

		this.dp.nativeElement.click();

	}

	private handleParams() {
		this.activatedRoute.params.subscribe(p => {
			let that = this;
			if (p.tab_id) {
				// setTimeout(()=>{

				// 	that.bodyService.updateTab(p.tab_id);

				// }, 500);
				this.params = p;

			}
		})
	}

	ngOnInit() {

		this.handleParams();
		let filters = this.bodyService.GetFilters();

		if (this.queryParams.start_date && this.queryParams.end_date) {
			filters.start_date = this.queryParams.start_date;
			filters.end_date = this.queryParams.end_date;
		}

		if (!this.dropdowns) {
			this.dropdowns = {};
		}

		if (filters && (filters.start_date || filters.duration)) {

			this.filters = JSON.parse(JSON.stringify(filters));


			if (this.filters.duration && this.filters.duration != -1) {
				this.filters.duration = function (d) {

					return d == 1 ? 1 : d == 2 ? 3 : d == 3 ? 6 : 12;

				}(this.filters.duration)
			} else {
				this.filters.date_range = [new Date(this.filters.start_date), new Date(this.filters.end_date)];
				let start_date = this.getFormattedDate(this.filters.date_range[0]); //this.filters.date_range[0].toLocaleDateString();
				let end_date = this.getFormattedDate(this.filters.date_range[1]);

				// let diff = moment(this.filters.end_date).diff(moment(this.filters.start_date), 'months');
				let diff = moment(end_date).diff(moment(start_date), 'months', true);
				diff = Math.ceil(diff);

				if (diff <= 12) {



					if (diff == 1 || diff == 3 || diff == 6 || diff == 12) {
						this.filters.duration = diff;//(diff == 1) ? 1 : (diff == 3) ? 2 : (diff == 6) ? 3 : 4;
						this.bodyService.UpdateFilters('duration', diff);
					} else {
						this.filters.duration = -1;
						this.bodyService.UpdateFilters('duration', -1);
					}


					// this.bodyService.UpdateFilters("start_date", this.filters.date_range[0]);
					// this.bodyService.UpdateFilters("end_date", this.filters.date_range[1]);
					this.bodyService.UpdateFilters("start_date", start_date);
					this.bodyService.UpdateFilters("end_date", end_date);

					// this.filters.duration = 4;
					// this.bodyService.UpdateFilters("duration", 4);

				} else {
					this.filters.duration = -1;
					this.bodyService.UpdateFilters('duration', -1);
					this.bodyService.UpdateFilters("start_date", start_date);
					this.bodyService.UpdateFilters("end_date", end_date);
				}

			}


		}
		else {

			this.filters = { "duration": 12 };
			this.selectDuration(12);

		}

		this.init();

	}

	init() {

		this.bsConfig = Object.assign({}, { containerClass: "theme-default" });
		//this.filters = {"duration":-1};

		this.updateData(true);
		// this.loadOverviewData();
		this.RunSubscribers();
		this.sub_1 = [
			{ item_id: 1, item_text: 'Sub Account 1' },
			{ item_id: 2, item_text: 'Sub Account 2' },
			{ item_id: 3, item_text: 'Sub Account 3' },
			{ item_id: 4, item_text: 'Sub Account 4' },
			{ item_id: 5, item_text: 'Sub Account 5' }
		];

	}

	public FilterCharts() {

		this.tabsService.Submit();

	}

	private RunSubscribers() {

		this.tabsService.Tabs.subscribe(tab => this.ActivateTab(tab));
	}

	private ActivateTab(tab) {

		this.currentTab = tab;

	}

	public onStandardsSelectSelect(standard) {

		if (!standard) return;
		// let current_standards = this.bodyService.GetFilter("standards");
		// //console.log(current_standards);
		// if (!current_standards) {
		// 	current_standards = standard.account_tag_id + "";
		// } else {
		// 	current_standards = current_standards.split(",");
		// 	current_standards.push(standard.account_tag_id);
		// 	current_standards = current_standards.join(",");
		// }

		let current_standards = standard.map((s) => {

			return s.account_tag_id;

		}).join();

		this.bodyService.UpdateFilters("standards", current_standards);

	}

	public onFrameworkSelectSelect(framework) {

		this.bodyService.UpdateFilters("framework_id", framework.account_tag_id);
		this.bodyService.deleteFilter("standards");
		// if (fromPageLoad) {

		// 	this.router.navigate([], {
		// 		relativeTo: this.activatedRoute,
		// 		queryParams: { standards: null },
		// 		queryParamsHandling: 'merge',
		// 	});
		// }
		//this.dropdowns.standards = [];
		this.filters.standards = [];
		this.bodyService.LoadStandards(framework.account_tag_id).subscribe(data => {
			this.PrepareAndAssignStandards(data);

		})

	}

	public PrepareAndAssignStandards(standards) {
		standards.forEach(s => {

			s.account_tag_id = s.value;
			s.tag_title = s.label;

		});

		let current_standards = this.bodyService.GetFilter("standards");

		if (!current_standards && this.queryParams.standards) {
			this.bodyService.UpdateFilters("standards", this.queryParams.standards);
		}

		this.chooseStandard(standards);
		this.dropdowns.standards = [];
		this.dropdowns.standards = standards;

	}

	public onHuddleSelectSelect(huddle) {


		if (Number(huddle.id) == 2 || Number(huddle.id) == 4) {

			this.bodyService.UpdateFilters('folder_type', 2);

			if (Number(huddle.id) == 4) {

				this.bodyService.UpdateFilters('coachee_view', 2);

			}
			else {
				this.bodyService.UpdateFilters('coachee_view', 1);
			}

		} else {
			this.bodyService.deleteFilter('coachee_view');
			this.bodyService.UpdateFilters('folder_type', huddle.id);
		}




	}


	private handleDropdowns(data) {
		if (data.frameworks) {
			this.PreareFrameworks(data.frameworks);
			this.dropdowns.frameworks = data.frameworks;
			this.chooseFramework(this.dropdowns.frameworks);
			this.dropdowns.huddles_filters = this.ObjectoArray(data.huddles_filters).reverse();
			this.selectHuddle();
			this.dropdowns.standards = data.standards;
			this.chooseStandard(this.dropdowns.standards);
		}


	}
	private chooseStandard(standards) {
		let current_standards = this.bodyService.GetFilter("standards");
		if (current_standards) {

			current_standards = current_standards.split(",");
			this.filters.standards = [];
			current_standards.forEach(s => {

				let index = _.findIndex(standards, { account_tag_id: Number(s) });
				if (index > -1) {
					this.filters.standards.push(standards[index]);
				}
			});
		}

	}


	private chooseFramework(frameworks) {
		let account_tag_id = this.bodyService.GetFilter("framework_id");


		if (frameworks[0] && account_tag_id && account_tag_id != 'undefined') {

			let index = _.findIndex(frameworks, { account_tag_id: Number(account_tag_id) });

			if (index > -1) {
				this.onFrameworkSelectSelect({ account_tag_id: account_tag_id });
				this.dropdowns.selectedFramework = [frameworks[index]];
			}


		} else {
			if (frameworks.length <= 0) {
				//this.toastr.info('no framework available');
				return;
			}
			this.bodyService.UpdateFilters("framework_id", frameworks[0].account_tag_id);
			this.dropdowns.selectedFramework = [frameworks[0]];
		}

	}

	private selectHuddle() {
		if (!this.dropdowns || !this.dropdowns.huddles_filters) {
			return;
		}

		if (this.filters.folder_type) {

			let index = _.findIndex(this.dropdowns.huddles_filters, { id: this.filters.folder_type });
			this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[index]];
			return;

		} else {

			let coaching_index = _.findIndex(this.dropdowns.huddles_filters, { id: "2" });

			if (coaching_index > -1) {

				this.bodyService.UpdateFilters("folder_type", "2");
				this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[coaching_index]];

			} else {
				let assessment_index = _.findIndex(this.dropdowns.huddles_filters, { id: "3" });

				if (assessment_index > -1) {

					this.bodyService.UpdateFilters("folder_type", "3");
					this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[assessment_index]];

				} else {

					this.bodyService.UpdateFilters("folder_type", "1");
					this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[0]];

				}

			}

		}
		//this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[0]];

	}

	private ObjectoArray(object) {

		let arr = [];

		Object.keys(object).forEach((k) => {

			arr.push({ id: k, value: object[k] });

		});

		if (arr[2] && arr[3]) {
			let t = arr[2];
			arr[2] = arr[3];
			arr[3] = t;
		}

		return arr;

	}

	private PreareFrameworks(fr) {

		if (fr) {
			fr.forEach(f => { f.val_id = f.account_id + "-" + f.account_tag_id });
		}
		// fr.forEach(f => { f.val_id = f.account_id + "-" + f.account_tag_id });


	}

	private updateDropdowns(accId) {
		this.bodyService.LoadFilterDropdowns(accId).subscribe(data => this.handleDropdowns(data));
	}

	private load_accounts() {

		let that = this;

		let intervalId = setInterval(function () {

			let sessionData: any;

			sessionData = that.headerService.getStaticHeaderData();
			let all_accounts = that.translation.all_accounts;
			if (sessionData && sessionData.user_current_account) {

				clearInterval(intervalId);

				that.bodyService.LoadFilterDropdowns().subscribe(data => that.handleDropdowns(data));



				//that.selectedItem = [{ "id": "-1", "company_name": "All Accounts" }];
				that.bodyService.getChildAccounts().subscribe((data: any) => {

					let _data = [{ "id": "-1", "company_name": all_accounts }];
					let accounts = JSON.parse(JSON.stringify(_data));
					if (data.length > 1) {
						that.sub_accounts = accounts.concat(data);
					} else {
						that.sub_accounts = data;
					}

					let subAccount = that.bodyService.GetFilter("subAccount");

					if (subAccount) {

						let index = _.findIndex(that.sub_accounts, { id: subAccount });
						if (index != -1) {
							that.selectedItem = [that.sub_accounts[index]];
						} else {
							that.selectedItem = data.length > 1 ? _data : [data[0]];
							if (data.length <= 1) {
								that.bodyService.UpdateFilters("subAccount", data[0].id)
							}

						}


					} else {
						that.selectedItem = data.length > 1 ? _data : [data[0]];
						if (data.length <= 1) {
							that.bodyService.UpdateFilters("subAccount", data[0].id)
						}

					}

				});//that.selectedItem = accounts[0]; 

			}


		}, 500);


	}

	private loadOverviewData() {

		// let filters = this.bodyService.GetFilters();

		// console.log('filters in loadOverviewData: ', filters);

		// let conf;

		// if (filters && (filters.start_date || filters.duration)) {

		// 	conf = filters;
		// 	conf.filter_type = conf.duration == -1 ? "custom" : "default";

		// } else {

		// 	conf = {
		// 		"subAccount": "",
		// 		"duration": "4",
		// 		"filter_type": "default",
		// 		"user_current_account": {}
		// 	};

		// }



		// let that = this; //since `this` points to current func,
		// // otherwise we could use BodyComponent.call(this)
		// let intervel_id = setInterval(function () {
		// 	let sessionData: any = that.headerService.getStaticHeaderData();
		// 	if (sessionData && sessionData.user_current_account) {

		// 		conf.user_current_account = sessionData.user_current_account;
		// 		that.updateData(conf);
		// 		clearInterval(intervel_id);

		// 	}

		// }, 500);

	}
	public updateData(loadOnPageInitialise?) {

		this.bodyService.UpdatePressed();
		let filters = this.bodyService.GetFilters();

		if (!filters.start_date) {
			filters = this.initializeAPIDataWithoutAnyFilter();
		} else {
			let sessionData: any = this.headerService.getStaticHeaderData();
			filters.filter_type = (filters.duration) ? "custom" : "default";
			filters.user_current_account = sessionData.user_current_account;
		}

		// console.log('conf: ', conf)
		// if (conf) {
		// 	filters = conf;
		// 	console.log('filters in if : ', filters)
		// } else {
		// 	let sessionData: any = this.headerService.getStaticHeaderData();
		// 	filters = this.bodyService.GetFilters();
		// 	console.log('filters in else : ', filters)
		// 	filters.filter_type = (filters.duration) ? "custom" : "default";
		// 	filters.user_current_account = sessionData.user_current_account;
		// }

		if (!filters.subAccount) {

			filters.subAccount = "";

		}

		if ((!filters.duration || filters.duration == -1) && !filters.start_date) {

			this.toastrService.info(this.translation.analytics_please_select_durtion);
			return;

		}

		if (!loadOnPageInitialise) this.updateRouteBasedOnFilters(filters);

		this.subscriptions.add(this.overviewService.getOverviewData(filters).subscribe(data => { this.UpdatePLData(data); this.bodyService.BroadcastOverviewValues(data) }));

		let tab_id;

		// if (whichTab!=0){
		// 	tab_id = (this.params && this.params.tab_id) ? this.params.tab_id : 0;
		// 	this.bodyService.updateTab(tab_id);
		// }else if(whichTab == 0){

		// 	if(this.accountChanged){
		// 		this.accountChanged = false;
		// 		this.bodyService.updateTab(whichTab);
		// 	}


		// }



		this.FilterCharts();
	}

	private UpdatePLData(data) {

		if (data.assessment_array) {

			this.bodyService.StorePLData(data.assessment_array);

		}

	}

	private getPadding(n) {

		return n < 10 ? "0" + n : n + "";

	}

	private getFormattedDate(date) {

		return (this.getPadding(date.getMonth() + 1)) + "/" + this.getPadding(date.getDate()) + "/" + date.getFullYear();
		//toLocaleDateString().replace(/\//g, "-");

	}

	public deselectDuration(event): void {

		if (event[0] == null) {
			this.toastrService.info(this.translation.analytics_invalid_start_date);
			return;
		}

		if (event[1] == null) {
			this.toastrService.info(this.translation.analytics_invalid_end_date);
			return;
		}

		if (!event[0] || !event[1]) {
			this.toastrService.info(this.translation.analytics_start_and_end_dates);
			return;
		}

		if (moment(event[0]).isAfter(event[1])) {

			this.toastrService.info(this.translation.analytics_strt_date_check);
			this.filters.date_range = [];
			return;
		}

		if (!this.filters) {
			this.filters = {};
		}
		if (Array.isArray(this.filters.date_range) && this.filters.date_range.length > 0) {

			//this.filters.duration = -1;
			//this.bodyService.deleteFilter("duration");
			//this.bodyService.UpdateFilters("duration", -1);
			let start_date = this.getFormattedDate(this.filters.date_range[0]); //this.filters.date_range[0].toLocaleDateString();
			let end_date = this.getFormattedDate(this.filters.date_range[1]); //this.filters.date_range[1].toLocaleDateString();

			let diff = moment(end_date).diff(moment(start_date), 'months', true);

			diff = Math.ceil(diff);

			if (diff <= 12) {



				if (diff == 1 || diff == 3 || diff == 6 || diff == 12) {
					this.filters.duration = diff;//(diff == 1) ? 1 : (diff == 3) ? 2 : (diff == 6) ? 3 : 4;
					this.bodyService.UpdateFilters('duration', diff);
				} else {
					this.filters.duration = -1;
					this.bodyService.UpdateFilters('duration', -1);
				}

				this.bodyService.UpdateFilters("start_date", start_date);
				this.bodyService.UpdateFilters("end_date", end_date);

			} else {
				this.filters.duration = -1;
				this.bodyService.UpdateFilters('duration', -1);
				// this.bodyService.deleteFilter("start_date");
				// this.bodyService.deleteFilter("end_date");
				this.bodyService.UpdateFilters("start_date", start_date);
				this.bodyService.UpdateFilters("end_date", end_date);
			}
		}
	}

	public selectDuration(dur) {
		let val = (dur == 1) ? 1 : (dur == 3) ? 2 : (dur == 6) ? 3 : 4;
		//this.bodyService.UpdateFilters("duration", 1);
		if (!this.filters.duration) {
			this.filters.duration = dur;
		}
		this.bodyService.UpdateFilters("duration", -1);
		if (!this.filters) {
			this.filters = {};
		}
		if (dur) {
			let date_range = [moment().subtract(dur, 'months'), moment()];
			//this.deselectDuration(event)
			this.filters.date_range = [date_range[0].toDate(), date_range[1].toDate()];
			let start_date = date_range[0].format("MM/DD/YYYY");//this.getFormattedDate(this.filters.date_range[0]); //this.filters.date_range[0].toLocaleDateString();
			let end_date = date_range[1].format("MM/DD/YYYY");//this.getFormattedDate(this.filters.date_range[1]); //this.filters.date_range[1].toLocaleDateString();
			this.bodyService.UpdateFilters("start_date", start_date);
			this.bodyService.UpdateFilters("end_date", end_date);
			this.filters.duration = dur;
			return;
		}
		this.filters.duration = dur;
		this.filters.date_range = [];
		this.bodyService.deleteFilter("start_date");
		this.bodyService.deleteFilter("end_date");
	}

	public onItemSelect(event) {

		this.accountChanged = true;
		this.bodyService.UpdateFilters("subAccount", (event.id == -1) ? "" : event.id);

		this.dropdowns.selectedHuddle = [];
		this.dropdowns.selectedFramework = [];
		this.filters.standards = [];

		this.bodyService.deleteFilter("framework_id");
		this.bodyService.deleteFilter("folder_type");
		this.bodyService.deleteFilter("standards");
		this.updateDropdowns(event.id);

	}

	public onItemChange(oldVal, model) {
		this.selectedItem = [oldVal];
	}

	public onHuddleDeselect(oldVal) {

		this.dropdowns.selectedHuddle = [oldVal];

	}

	public onFrameworkDeselect(oldVal) {

		this.dropdowns.selectedFramework = [oldVal];

	}

	private initializeAPIDataWithoutAnyFilter() {
		let headerData = this.headerService.getStaticHeaderData();
		return {
			'subAccount': '',
			'duration': '4',
			'filter_type': 'default',
			'user_current_account': headerData.user_current_account
		}
	}

	private initiazlizeSettingWithTranslation() {
		this.settings = {
			"singleSelection": true,
			"selectAllText": this.translation.analytics_select_all,
			"unSelectAllText": this.translation.analytics_un_select_all,
			"allowSearchFilter": true,
			"closeDropDownOnSelection": true,
			"idField": "id",
			"textField": "company_name"
		};

		this.framework_settings = {
			"singleSelection": true,
			"selectAllText": this.translation.analytics_select_all,
			"unSelectAllText": this.translation.analytics_un_select_all,
			"allowSearchFilter": true,
			"closeDropDownOnSelection": true,
			"idField": "account_tag_id",
			"textField": "tag_title"
		};

		this.huddle_settings = {
			"singleSelection": true,
			"selectAllText": this.translation.analytics_select_all,
			"unSelectAllText": this.translation.analytics_un_select_all,
			"allowSearchFilter": true,
			"closeDropDownOnSelection": true,
			"idField": "id",
			"textField": "value"
		};

		this.settings2 = {
			"singleSelection": false,
			"selectAllText": this.translation.analytics_select_all,
			"unSelectAllText": this.translation.analytics_un_select_all,
			"allowSearchFilter": true,
			"itemsShowLimit": 2,
			"closeDropDownOnSelection": false,
			"idField": "item_id",
			"textField": "item_text"
		};

		this.standards_settings = {
			"singleSelection": false,
			"selectAllText": this.translation.analytics_select_all,
			"unSelectAllText": this.translation.analytics_un_select_all,
			"allowSearchFilter": true,
			"itemsShowLimit": 2,
			"closeDropDownOnSelection": false,
			"idField": "account_tag_id",
			"textField": "tag_title"
		};
	}

	private updateRouteBasedOnFilters(filters: any) {
		let urlQueryParams: any = {};
		if (filters.subAccount) urlQueryParams.subAccount = filters.subAccount;
		else urlQueryParams.subAccount = null;

		if (filters.start_date) urlQueryParams.start_date = filters.start_date;
		else urlQueryParams.start_date = null;
		if (filters.end_date) urlQueryParams.end_date = filters.end_date;
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
		});
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe();

		this.bodyService.deleteAllFilters()
	}

}
interface filter {

	[key: string]: any

}

