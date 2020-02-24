import { Component, OnInit, Input, ViewChild, OnDestroy, OnChanges } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerConfig, BsLocaleService, esLocale, defineLocale } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import * as _ from 'lodash'; 
import * as moment from 'moment';

import { HeaderService } from "@projectModules/app/services";
import { PlaycardService, TagsService, BodyService } from "@analytics/services";

@Component({
	selector: 'pc-body',
	templateUrl: './pc-body.component.html',
	styleUrls: ['./pc-body.component.css']
})
export class PcBodyComponent implements OnInit, OnChanges, OnDestroy {
	@Input() userDetails;
	huddle_settings; //newcode
	framework_settings; //newcode
	standards_settings; //newcode
	settings2; //newcode
	settings; //newcode

	public title: title;
	public filters: any = {};
	public bsConfig: Partial<BsDatepickerConfig>;
	private params;
	public header_color;
	public primery_button_color;
	public secondry_button_color;
	public header_data;
	public translation: any = {};
	public translationLoaded: boolean = false;
	public userDetailsLoaded: boolean = false;
	private translationSubscription: Subscription;
	private queryParams: any;


	@ViewChild('dp', { static: false }) dp;
	public dropdowns; //newcode

	constructor(
		private playcardService: PlaycardService,
		private toastr: ToastrService,
		private activatedRoute: ActivatedRoute,
		private bodyService: BodyService,
		private tagsService: TagsService,
		private headerService: HeaderService,
		private localeService: BsLocaleService) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.analytics_month) { // check if translation for analytics loaded
				this.translationLoaded = true;
			}

			this.Init_settings();
		});

		this.activatedRoute.queryParams.subscribe(queryParams => {
			this.queryParams = queryParams;
			if (queryParams.start_date) this.bodyService.UpdateFilters("start_date", queryParams.start_date);
			if (queryParams.end_date) this.bodyService.UpdateFilters("end_date", queryParams.end_date);
			if (queryParams.folder_type) {
				this.playcardService.Set_Filters("folder_type", queryParams.folder_type);
				this.filters.folder_type = queryParams.folder_type;
			}
			if (queryParams.coachee_view) this.playcardService.Set_Filters('coachee_view', queryParams.coachee_view);
			if (queryParams.framework_id) {
				this.playcardService.Set_Filters("framework_id", queryParams.framework_id);
				this.bodyService.UpdateFilters("framework_id", queryParams.framework_id);
			}
			if (queryParams.standards) {
				this.playcardService.Set_Filters("standards", queryParams.standards);
				this.bodyService.UpdateFilters("standards", queryParams.standards);
			}
		});
	}

	ngOnInit() {
		let sessionData: any = this.headerService.getStaticHeaderData();

		// Dynamic Button Colors Start
		this.header_color = sessionData.header_color;
		this.primery_button_color = sessionData.primery_button_color;
		this.secondry_button_color = sessionData.secondry_button_color;
		// Dynamic Button Colors End

		// this.filters = {range:"-1", start_date:"",end_date:"",date_range:[]};
		this.activatedRoute.params.subscribe(p => {
			this.params = p
			//console.log(this.params);
			this.updateDropdowns(this.params.account_id, this.params.user_id);
		});
		this.dropdowns = {}; //newcode
		this.title = { "title": "Aivanne Sales", "sub_title": "KIPP Houston" };
		this.bsConfig = Object.assign({}, { containerClass: "theme-default" });
		this.importFilters();
		this.playcardService.Set_Filters('coachee_view', 1);
		this.header_data = this.headerService.getStaticHeaderData();
		//   this.translation = this.header_data.language_translation; // changed to observable stream
		//   console.log(this.translation);
		//this.userDetails = {"user_id":1, "huddles":5, "videos_uploaded":10, "comments_added":11, 

		// 	"videos_views": 33, "hours_uploaded": 5, "hours_viewed": 4
		//};
		if (sessionData.language_translation.current_lang == 'es') defineLocale(sessionData.language_translation.current_lang, esLocale);
		this.localeService.use(sessionData.language_translation.current_lang);
	}

	ngOnChanges() {
		if (this.userDetails) this.userDetailsLoaded = true;
	}

	public updateData() {
		let filters = this.bodyService.GetFilters();

		this.tagsService.UpdatePlaycard();

	}

	public showdp() {

		this.dp.nativeElement.click();

	}

	private importFilters() {

		let filters = this.bodyService.GetFilters();
		if (filters && Object.keys(filters).length !== 0) {

			if (filters.start_date) {

				this.filters.date_range = [new Date(filters.start_date), new Date(filters.end_date)];
				let diff = moment(filters.end_date).diff(moment(filters.start_date), 'months');

				if (diff <= 12) {

					if (diff == 1 || diff == 3 || diff == 6 || diff == 12) {
						this.filters.duration = (diff == 1) ? 1 : (diff == 3) ? 2 : (diff == 6) ? 3 : 4;
					}

				}

			} else {
				if (filters.duration) {
					this.filters.duration = filters.duration;
				}
			}

		} else {


			this.filters.date_range = [new Date(this.params.start_date), new Date(this.params.end_date)];

			let diff = moment(this.params.end_date).diff(moment(this.params.start_date), 'months');

			if (diff <= 12) {

				if (diff == 1 || diff == 3 || diff == 6 || diff == 12) {
					this.filters.duration = (diff == 1) ? 1 : (diff == 3) ? 2 : (diff == 6) ? 3 : 4;
				}

				this.bodyService.UpdateFilters("start_date", this.filters.date_range[0]);
				this.bodyService.UpdateFilters("end_date", this.filters.date_range[1]);

				// this.filters.duration = 4;
				// this.bodyService.UpdateFilters("duration", 4);
			}

		}
	}

	public selectDuration(dur): void {

		this.filters.duration = dur;
		let val = dur == 1 ? 1 : dur == 2 ? 3 : dur == 3 ? 6 : 12;

		if (val) {
			let date_range = [moment().subtract(val, 'months'), moment()];
			//this.deselectDuration(event)
			this.filters.date_range = [date_range[0].toDate(), date_range[1].toDate()];
			let start_date = date_range[0].format("MM/DD/YYYY");//this.getFormattedDate(this.filters.date_range[0]); //this.filters.date_range[0].toLocaleDateString();
			let end_date = date_range[1].format("MM/DD/YYYY");//this.getFormattedDate(this.filters.date_range[1]); //this.filters.date_range[1].toLocaleDateString();
			this.bodyService.UpdateFilters("start_date", start_date);
			this.bodyService.UpdateFilters("end_date", end_date);
			this.filters.duration = dur;
			return;
		}
		this.bodyService.UpdateFilters("duration", dur);
		this.bodyService.deleteFilter("start_date");
		this.bodyService.deleteFilter("end_date");
		this.filters.date_range = [];

	}

	public deselectDuration(Event) {

		if (Event[0] == null) {
			this.toastr.info(this.translation.analytics_invalid_start_date);
			return;
		}

		if (Event[1] == null) {
			this.toastr.info(this.translation.analytics_invalid_end_date);
			return;
		}

		if (!Event[0] || !Event[1]) {
			this.toastr.info(this.translation.analytics_start_and_end_dates);
			return;
		}

		if (moment(Event[0]).isAfter(Event[1])) {

			this.toastr.info(this.translation.analytics_strt_date_check);
			this.filters.date_range = [];
			return;
		}

		if (!this.filters) {
			this.filters = {};
		}

		if (Array.isArray(this.filters.date_range) && this.filters.date_range.length > 0) {

			this.filters.duration = -1;
			//this.bodyService.deleteFilter("duration");
			this.bodyService.UpdateFilters("duration", -1);
			let start_date = this.filters.date_range[0].toLocaleDateString();
			let end_date = this.filters.date_range[1].toLocaleDateString();
			this.bodyService.UpdateFilters("start_date", start_date);
			this.bodyService.UpdateFilters("end_date", end_date);
			this.bodyService.UpdateFilters("date_range", this.filters.date_range);
		} else {
			this.bodyService.deleteFilter("start_date");
			this.bodyService.deleteFilter("end_date");
		}

	}

	//new functions start


	private handleDropdowns(data) {
		this.PreareFrameworks(data.frameworks);
		this.dropdowns.frameworks = data.frameworks;
		this.chooseFramework(this.dropdowns.frameworks);
		this.dropdowns.huddles_filters = this.ObjectoArray(data.huddles_filters).reverse();
		this.selectHuddle();

		this.dropdowns.standards = data.standards;
		this.chooseStandard(this.dropdowns.standards);

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

		fr.forEach(f => { f.val_id = f.account_id + "-" + f.account_tag_id });

	}

	private chooseStandard(standards) {
		let current_standards = this.bodyService.GetFilter("standards");
		if (current_standards) {

			current_standards = current_standards.split(",");
			this.filters.standards = [];
			current_standards.forEach((s, i) => {

				let index = _.findIndex(standards, { account_tag_id: Number(s) });

				if (index > -1) {

					this.filters.standards.push(standards[index]);

				}


			});


		}
		this.playcardService.Set_Filters("standard", this.filters.standards)

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
			this.playcardService.Set_Filters("framework_id", frameworks[0].account_tag_id);
			this.dropdowns.selectedFramework = [frameworks[0]];
			// this.onFrameworkSelectSelect({ account_tag_id: frameworks[0].account_tag_id });
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

		}

		let coaching_index = _.findIndex(this.dropdowns.huddles_filters, { id: "2" });

		if (coaching_index > -1) {

			this.playcardService.Set_Filters("folder_type", "2");
			this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[coaching_index]];
			this.onHuddleSelectSelect({ id: 2 });

		} else {
			let assessment_index = _.findIndex(this.dropdowns.huddles_filters, { id: "3" });

			if (assessment_index > -1) {

				this.playcardService.Set_Filters("folder_type", "3");
				this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[assessment_index]];
				this.onHuddleSelectSelect({ id: 3 });

			} else {

				this.playcardService.Set_Filters("folder_type", "1");
				this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[0]];
				this.onHuddleSelectSelect({ id: 1 });

			}

		}

		//this.dropdowns.selectedHuddle = [this.dropdowns.huddles_filters[0]];

	}

	private updateDropdowns(accId, user_id) {
		//;
		this.bodyService.LoadFilterDropdowns(accId, user_id).subscribe(data => this.handleDropdowns(data));
	}

	public onHuddleSelectSelect(huddle) {

		if (Number(huddle.id) == 2 || Number(huddle.id) == 4) {

			this.playcardService.Set_Filters('folder_type', 2);

			if (Number(huddle.id) == 4) {

				this.playcardService.Set_Filters('coachee_view', 2);
				// this.playcardService.Set_Filters("Huddle",)
			}
			else {
				this.playcardService.Set_Filters('coachee_view', 1);
			}

		} else {
			this.playcardService.Delete_Filters('coachee_view');
			this.playcardService.Set_Filters('folder_type', huddle.id);
		}
	}

	public onFrameworkSelectSelect(framework) {

		this.playcardService.Set_Filters("framework_id", framework.account_tag_id);
		this.filters.standards = [];
		this.bodyService.LoadStandards(framework.account_tag_id).subscribe(data => this.PrepareAndAssignStandards(data));

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

		this.playcardService.Set_Filters("standards", current_standards);

	}

	public PrepareAndAssignStandards(standards) {

		standards.forEach(s => {

			s.account_tag_id = s.value;
			s.tag_title = s.label;

		});

		this.chooseStandard(standards);
		this.dropdowns.standards = [];
		this.dropdowns.standards = standards;

	}

	private Init_settings() {
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
			"unSelectAllText": this.translation.analytics_select_all,
			"allowSearchFilter": true,
			"itemsShowLimit": 2,
			"closeDropDownOnSelection": false,
			"idField": "item_id",
			"textField": "item_text"
		};

		this.standards_settings = {
			"singleSelection": false,
			"selectAllText": this.translation.analytics_select_all,
			"unSelectAllText": this.translation.analytics_select_all,
			"allowSearchFilter": true,
			"itemsShowLimit": 2,
			"closeDropDownOnSelection": false,
			"idField": "account_tag_id",
			"textField": "tag_title"
		};
	}

	public onHuddleDeselect(oldVal) {

		this.dropdowns.selectedHuddle = [oldVal];

	}

	public onFrameworkDeselect(oldVal) {

		this.dropdowns.selectedFramework = [oldVal];

	}

	public selectedOpt(e) {
		console.log(e);
	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
	}
	// new functions end

}

interface filters {

	range: string,
	start_date: string,
	end_date: string,
	date_range: Array<any>

}

interface title {

	title: string,
	sub_title: string
}