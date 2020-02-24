import { Component, OnInit, Input, NgModule, ViewChild, OnDestroy, OnChanges } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { BsDropdownModule, BsLocaleService, esLocale, defineLocale } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import * as _ from "lodash";

import { DetailsService } from "@analytics/services";
import { HeaderService } from "@projectModules/app/services";

@NgModule({
	imports: [BsDropdownModule.forRoot()]
})

@Component({
	selector: 'ud-body',
	templateUrl: './ud-body.component.html',
	styleUrls: ['./ud-body.component.css']
})
export class UdBodyComponent implements OnInit, OnChanges, OnDestroy {

	@ViewChild('dp', { static: false }) dp;
	@Input() details;
	public filters_settings;
	public filters;
	public filtersList;
	public cols;
	private params;
	private excludes = ['ref_id', 'account_folder_id'];
	public header_color;
	public primery_button_color;
	public secondry_button_color;
	public header_data;
	public translation: any = {};
	public translationLoaded: boolean = false;
	private translationSubscription: Subscription;
	public detailsLoaded: boolean = false;
	private queryParams: any;

	constructor(private activatedRoute: ActivatedRoute, private detailsService: DetailsService, private headerService: HeaderService, private localeService: BsLocaleService) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.analytics_select_filters) { // check if translation for analytics loaded
				this.translationLoaded = true;
			}

			this.initCols();

			this.filters_settings = {
				"singleSelection": false,
				"selectAllText": this.translation.analytics_select_all,
				"unSelectAllText": this.translation.analytics_un_select_all,
				"allowSearchFilter": true,
				"itemsShowLimit": 1,
				"closeDropDownOnSelection": false,
				"idField": "name",
				"textField": "label",
				"label": "select filters"
			};
		});

		this.activatedRoute.queryParams.subscribe(queryParams => {
			this.queryParams = queryParams;
		});
	}

	ngOnInit() {

		let sessionData: any = this.headerService.getStaticHeaderData();
		this.header_data = this.headerService.getStaticHeaderData();
		//   this.translation = this.header_data.language_translation;

		// Dynamic Button Colors Start
		this.header_color = sessionData.header_color;
		this.primery_button_color = sessionData.primery_button_color;
		this.secondry_button_color = sessionData.secondry_button_color;
		// Dynamic Button Colors End


		this.RunSubscribers();
		this.filters = {};
		if (sessionData.language_translation.current_lang == 'es') defineLocale(sessionData.language_translation.current_lang, esLocale);
		this.localeService.use(sessionData.language_translation.current_lang);

	}

	ngOnChanges() {
		console.log('this.details: ', this.details)
		if (this.details) this.detailsLoaded = true;
	}

	public export() {
		let data = this.details.user_detail;
		//let headers = data[0].keys();
		//headers.push(data);
		this.JSONToCSVConvertorStatic(data, "UserDetails", true);
		//new Angular5Csv(data, 'My Report', {});
	}

	private loadLabels(key) {

		let vals = {
			"action_type": this.translation.analytics_action,
			"username": this.translation.analytics_account_name,
			"date_added": this.translation.analytics_action_date,
			"workspace": this.translation.analytics_workspace,
			"desc": this.translation.analytics_huddles,
			"library": this.translation.analytics_library,
			"url": this.translation.analytics_details,
			"video": this.translation.analytics_video_title,
			"coach": this.translation.analytics_coach,
			"coachee": this.translation.analytics_coachee,
			"session_date": this.translation.analytics_session_date,
			"minutes": this.translation.analytics_min_uploaded_watch
		};

		return vals[key] || key;

	}

	public selectRow(col) {

		this.details.user_detail.forEach((u) => {

			if (u.ref_id == col.ref_id) {
				u.isSelected = true;
			}
			else {
				u.isSelected = false;
			}


		});
		col.isSelected = true;//!Boolean(col.isSelected);
		//console.log(col);
	}

	public isRowSelected(rowData: any) {

		//return (rowData.isSelected) ? "rowSelected" : "rowUnselected";
		//if (this.details)
		//console.log(this.details);
		if (rowData.isSelected) {
			console.log("Selected");
			return "rowSelected";
		}
		return "rowUnselected";
	}

	private initCols() {

		this.cols = [

			{ field: "action_type", header: this.translation.analytics_action },
			{ field: "username", header: this.translation.analytics_account_name },
			{ field: "date_added", header: this.translation.analytics_action_date },
			{ field: "workspace", header: this.translation.analytics_workspace },
			{ field: "desc", header: this.translation.analytics_huddles },
			{ field: "library", header: this.translation.analytics_library },
			{ field: "url", header: this.translation.analytics_details },
			{ field: "video", header: this.translation.analytics_video_title },
			{ field: "coach", header: this.translation.analytics_coach },
			{ field: "coachee", header: this.translation.analytics_coachee },
			{ field: "session_date", header: this.translation.analytics_session_date },
			{ field: "minutes", header: this.translation.analytics_min_uploaded_watch }

		]
	}

	public onFiltersSelect(f) {

	}

	public showdp() {

		this.dp.nativeElement.click();

	}
	public modelChanged(date) {



	}
	public Updatevalues() {

		//
		this.detailsService.UpdateFilters(this.filters);
		console.log('this.filters: ', this.filters)

	}

	private selectFilter(v) {
		let that = this;
		let interval_id = setInterval(() => {

			if (that.filtersList) {

				clearInterval(interval_id);

				that.filters.standards;
				let index = _.findIndex(that.filtersList, { name: v });
				if (index > -1) {
					that.assignStandards([that.filtersList[index]]);
				}


			}

		}, 100);

	}

	private assignStandards(v) {

		let that = this;

		setTimeout(() => {

			if (!this.queryParams.standards) that.filters.standards = v;
		}, 500);

	}

	private assignFilters() {
		let that = this;
		setTimeout(() => {

			if (!that.filters) that.filters = [];
			console.log('that.params.start_date: ', that.params.start_date)
			let start_date;
			let end_date;
			if (that.queryParams.startDate) start_date = that.queryParams.startDate;
			else start_date = that.params.start_date;

			if (that.queryParams.endDate) end_date = that.queryParams.endDate;
			else end_date = that.params.end_date;

			console.log('end_date: ', end_date)
			that.filters.date_range = [new Date(start_date), new Date(end_date)];

		}, 500);

	}

	private RunSubscribers() {

		this.detailsService.UpdateSelectedFilter.subscribe(v => {

			this.selectFilter(v);


		});

		this.activatedRoute.params.subscribe(d => { this.params = d; this.assignFilters(); });

		this.detailsService.LoadFilters().subscribe((data) => {

			this.filtersList = data;
			this.detailsService.UpdateFiltersDropdown(data);

			if (this.queryParams.standards) {
				let standards = JSON.parse(this.queryParams.standards);
				let currentStandards = [];
				standards.forEach(element => {
					for (let key in element) {
						let index = _.findIndex(this.filtersList, { name: key });
						if (index > -1) {
							currentStandards.push(this.filtersList[index]);
						}
					}
				});

				this.filters.standards = currentStandards;
			}

		});

	}


	private JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel, excludes = []) {
		//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
		var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

		var CSV = '';
		//Set Report title in first row or line

		CSV += ReportTitle + '\r\n\n';

		//This condition will generate the Label/Header
		if (ShowLabel) {
			var row = "";

			//This loop will extract the label from 1st index of on array
			for (var index in arrData[0]) {

				//Now convert each value to string and comma-seprated
				if (this.excludes.indexOf(index) == -1)
					row += this.loadLabels(index) + ',';
			}

			row = row.slice(0, -1);

			//append Label row with line break
			CSV += row + '\r\n';
		}

		//1st loop is to extract each row
		for (var i = 0; i < arrData.length; i++) {
			var row = "";



			//2nd loop will extract each column and convert it in string comma-seprated
			for (var index in arrData[i]) {
				if (this.excludes.indexOf(index) == -1) {
					row += '"' + arrData[i][index] + '",';
					//console.log(Object.keys(index)[index] + ">>" + index);
				}

			}

			row.slice(0, row.length - 1);

			//add a line break after each row
			CSV += row + '\r\n';
		}

		if (CSV == '') {
			alert("Invalid data");
			return;
		}

		//Generate a file name
		var fileName = "UserDetails";
		//this will remove the blank-spaces from the title and replace it with an underscore
		fileName += ReportTitle.replace(/ /g, "_");

		//Initialize file format you want csv or xls
		var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

		// Now the little tricky part.
		// you can use either>> window.open(uri);
		// but this will not work in some browsers
		// or you will not get the correct file extension    

		//this trick will generate a temp <a /> tag
		var link = document.createElement("a");
		link.href = uri;

		//set the visibility hidden so it will not effect on your web-layout
		//link.style = "visibility:hidden";
		link.download = fileName + ".csv";

		//this part will append the anchor tag and remove it after automatic click
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	private JSONToCSVConvertorStatic(JSONData, ReportTitle, ShowLabel) {
		//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
		var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

		var CSV = '';
		//Set Report title in first row or line

		//CSV += ReportTitle + '\r\n\n';

		//This condition will generate the Label/Header
		if (ShowLabel) {
			var row = "";

			//This loop will extract the label from 1st index of on array
			// for (var index in arrData[0]) {

			// 	//Now convert each value to string and comma-seprated
			// 	if (this.excludes.indexOf(index) == -1)
			// 		row += this.loadLabels(index) + ',';
			// }

			// row = row.slice(0, -1);
			row = row + this.translation.analytics_action + ',';
			row = row + this.translation.analytics_account_name + ',';
			row = row + this.translation.analytics_action_date + ',';
			row = row + this.translation.analytics_workspace + ',';
			row = row + this.translation.analytics_huddles + ',';
			if (true) {
				row = row + this.translation.analytics_library + ',';
			}
			row = row + this.translation.analytics_details + ',';
			row = row + this.translation.analytics_video_title + ',';
			row = row + this.translation.analytics_coach + ',';
			row = row + this.translation.analytics_coachee + ',';
			row = row + this.translation.analytics_session_date + ',';
			row = row + this.translation.analytics_min_uploaded_watch + ',';

			//append Label row with line break
			CSV += row + '\r\n';
		}

		//1st loop is to extract each row
		for (var i = 0; i < arrData.length; i++) {
			var row = "";

			row = row + this.prepareString(arrData[i].action_type) + ',' + "\t";
			row = row + this.prepareString(arrData[i].username) + ',' + "\t";
			row = row + this.prepareString(arrData[i].date_added) + ',' + "\t";
			row = row + this.prepareString(arrData[i].workspace) + ',' + "\t";
			row = row + this.prepareString(arrData[i].desc) + ',' + "\t";
			if (true) {
				row = row + this.prepareString(arrData[i].library) + ',' + "\t";
			}
			row = row + this.prepareString(arrData[i].url) + ',' + "\t";
			row = row + this.prepareString(arrData[i].video) + ',' + "\t";
			row = row + this.prepareString(arrData[i].coach) + ',' + "\t";
			row = row + this.prepareString(arrData[i].coachee) + ',' + "\t";
			row = row + this.prepareString(arrData[i].session_date) + ',' + "\t";
			row = row + this.prepareString(arrData[i].minutes) + ',' + "\t";

			CSV += row + '\r\n';
		}

		if (CSV == '') {
			alert("Invalid data");
			return;
		}

		//Generate a file name
		var fileName = "UserDetails";
		//this will remove the blank-spaces from the title and replace it with an underscore
		fileName += ReportTitle.replace(/ /g, "_");

		//Initialize file format you want csv or xls
		var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

		// Now the little tricky part.
		// you can use either>> window.open(uri);
		// but this will not work in some browsers
		// or you will not get the correct file extension    

		//this trick will generate a temp <a /> tag
		var link = document.createElement("a");
		link.href = uri;

		//set the visibility hidden so it will not effect on your web-layout
		//link.style = "visibility:hidden";
		link.download = fileName + ".csv";

		//this part will append the anchor tag and remove it after automatic click
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	private prepareString(str) {

		return (str && str != 'undefined' && typeof (str) != 'undefined' && typeof (str.trim) == 'function') ? str.trim() : "";
	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
	}


}
declare function escape(s: string): string;
