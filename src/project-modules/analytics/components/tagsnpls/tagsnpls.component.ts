import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AmChartsService } from "@amcharts/amcharts3-angular";
import { HeaderService } from "@projectModules/app/services";
// import { BodyService } from "../body.service";
// import { TabsService } from "../services/tabs.service";
import { TabsService, BodyService } from "@analytics/services";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
	selector: 'tagsnpls',
	templateUrl: './tagsnpls.component.html',
	styleUrls: ['./tagsnpls.component.css']
})
export class TagsnplsComponent implements OnInit, OnDestroy {
	public optionsChart;
	public optionsChart2;
	public pieData;
	public serialCharts;
	public serialChartCount;
	public serialData;
	public top_charts: top_charts;
	public current_chart_tab: number = 1;
	private list = ["#025c8a", "#28a745", "#004061", "#5e9d31", "#4f91cd"];
	private charts_data;
	public p;
	private loadingModalRef: BsModalRef;
	public header_data;
	public translation: any = {};
	public translationLoaded: boolean = false;
	public chartContainerLoaded: boolean = false;
	public chartContainer2Loaded: boolean = false;
	public pieContainerLoaded: boolean = false;
	private subscriptions: Subscription = new Subscription();
	@ViewChild("loadingModal", { static: false }) loadingModal;
	constructor(
		private modalService: BsModalService,
		private tabsService: TabsService,
		private AmCharts: AmChartsService,
		private headerService: HeaderService,
		private bodyService: BodyService,
		private router: Router,
		private activatedRoute: ActivatedRoute) {
			this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.analytics_top_five_tagged_standard && !this.translationLoaded) {  // check if translation for analytics is loaded
				this.translationLoaded = true;
			}
		}));
		this.activatedRoute.queryParams.subscribe(queryParams => {
			if (queryParams.page) this.p = queryParams.page;
		});
	}
	ngOnInit() {
		this.header_data = this.headerService.getStaticHeaderData();
		// this.translation = this.header_data.language_translation; // changed to observable stream
		this.top_charts = { top_available: false, least_available: false, pie_available: false }
		let xlsx_menu_item = { "label": "XLSX", "click": () => { this.export_excel(); } };
		this.RunSubscribers();
		this.optionsChart = {
			"export": {
				"enabled": true,
				"menu": [{
					"class": "export-main",
					"menu": ["PNG", "JPG", "SVG", "PDF"]
				}]
			},
			"type": "serial",
			"categoryField": "country",
			"rotate": true,
			"hideCredits": true,
			"autoMarginOffset": 40,
			"marginRight": 60,
			"marginTop": 60,
			"zoomOutButtonColor": "#FFFFFF",
			"colors": [
				"#0000"
			],
			"startDuration": 1,
			"startEffect": "easeOutSine",
			"backgroundAlpha": 0.79,
			"fontFamily": "Roboto",
			"fontSize": 13,
			"theme": "default",
			"categoryAxis": {
				"autoRotateAngle": 1.8,
				"autoWrap": true,
				"gridPosition": "start",
				"axisAlpha": 0,
				"axisThickness": 0,
				"fillColor": "#ED1616",
				"gridCount": 11,
				"minorGridAlpha": 0,
				"offset": 30,
				"titleColor": "#FFFFFF"
			},
			"trendLines": [],
			"graphs": [
				{
					"balloonColor": "#FFFFFF",
					"balloonText": "[[title]] of [[category]]:[[value]]",
					"bulletBorderThickness": 0,
					"bulletSize": 0,
					"colorField": "color",
					"fillAlphas": 1,
					"gapPeriod": -5,
					"id": "AmGraph-1",
					"labelText": "",
					"precision": -9,
					"title": "graph 1",
					"type": "column",
					"valueField": "litres",
					"fixedColumnWidth": 20
				}
			],
			"guides": [],
			"valueAxes": [
				{
					"id": "ValueAxis-1",
					"axisColor": "#E1E1E1",
					"tickLength": 1,
					"title": "",
					"titleRotation": 1,
					"integersOnly": true
				}
			],
			"allLabels": [],
			"balloon": {
				"borderAlpha": 0,
				"borderColor": "#000000",
				"borderThickness": 0,
				"color": "#FDFDFD",
				"fillColor": "#040404"
			},
			"titles": [],
			"dataProvider": [
				{
					"category": this.translation.analytics_data_and_assessment,
					"column-1": 3,
					"column-2": 5,
					"color": "#5e9d31"
				},
				{
					"category": this.translation.analytics_standard_and_alignment,
					"column-1": 8,
					"column-2": 8,
					"color": "#004160"
				},
				{
					"category": this.translation.analytics_content_knowledge_expertise,
					"column-1": 6,
					"column-2": 5,
					"color": "#5191cc"
				},
				{
					"category": this.translation.analytics_knowledge_of_std,
					"column-1": 4,
					"column-2": "5",
					"color": "#5e9d31"
				},
				{
					"category": this.translation.analytics_achieving_expectations,
					"column-1": 7,
					"column-2": "9",
					"color": "#004160"
				}
			]
		};
		this.serialData = {
			"hideCredits": true,
			"type": "serial",
			"path": "/amcharts/",
			"theme": "light",
			"categoryField": "date",
			"rotate": false,
			"marginTop": 40,
			"marginBottom": 0,
			"startEffect": 'easeInSine',
			"startDuration": 0.5,
			"autoMargins": true,
			"addClassNames": true,
			"categoryAxis": {
				"gridPosition": "start",
				"position": "left",
			},
			"balloon": {
				"borderAlpha": 0,
				"borderColor": "#000000",
				"borderThickness": 0,
				"color": "#FDFDFD",
				"fillColor": "#040404"
			},
			"legend": {
				"equalWidths": false,
				"autoMargins": false,
				"position": "bottom",
				"valueAlign": "left",
				"markerType": "square",
				"valueWidth": 2,
				"verticalGap": 2,
				"data": []
			},
			"graphs": [
				{
					"valueAxis": "ValueAxis-17",
					"colorField": "color",
					"fixedColumnWidth": 10,
					"balloonText": this.translation.analytics_data_and_assessment + ":[[value]]",
					"fillAlphas": 0.8,
					"id": "AmGraph-17",
					"lineAlpha": 0.2,
					"title": this.translation.analytics_data_and_assessment,
					//                        "colors": "#85c4e3",
					"type": "column",
					//                        "lineColor": "[[color]]",
					"valueField": "total_tags",
				},
				{
					"valueAxis": "ValueAxis-r",
					"colorField": "color_rating",
					"balloonText": "[[average_rating_name]]:[[value]]",
					"fixedColumnWidth": 10,
					"fillAlphas": 0.8,
					"lineAlpha": 0.2,
					"title": "Performance Level",
					"type": "column",
					//                        "lineColor": "color_rating",
					"valueField": "standard_rating_avg",
				}
			],
			"guides": [],
			"valueAxes": [
				{
					"id": "ValueAxis-17",
					"position": "left",
					"axisAlpha": 1,
					"title": this.translation.analytics_number_of_standard_tags,
					"titleBold": false,
					"titleFontSize": "10",
					"integersOnly": true
				},
				{
					"id": "ValueAxis-r",
					"axisAlpha": 1,
					"autoGridCount": true,
					"gridCount": 6,
					"integersOnly": true,
					"dashLength": 1,
					"position": "right",
					/*"showLastLabel": true,
					 "showFirstLabel": true,*/
					//"labelFrequency": 5,
					"minimum": 0,
					"maximum": 6,
					"valueText": "standard_rating_avg",
					"labelFunction": function (v) {
						//
					},
					"title": "Performance Level",
					"titleBold": false,
					"titleFontSize": "10",
					"minVerticalGap": 1,
				}
			],
			"dataProvider": [{ "date": "Aug-17", "color": "#85c4e3", "standard_rating_avg": 2, "average_rating_name": "Developing", "color_rating": "#000", "total_tags": "1" }, { "date": "Sep-17", "color": "#85c4e3", "standard_rating_avg": 2, "average_rating_name": "Developing", "color_rating": "#000", "total_tags": "0" }, { "date": "Oct-17", "color": "#85c4e3", "standard_rating_avg": "No Ratings", "average_rating_name": "No Ratings", "color_rating": "#000", "total_tags": "1" }, { "date": "Nov-17", "color": "#85c4e3", "standard_rating_avg": 3, "average_rating_name": "Proficient", "color_rating": "#000", "total_tags": "3" }, { "date": "Dec-17", "color": "#85c4e3", "standard_rating_avg": "No Ratings", "average_rating_name": "No Ratings", "color_rating": "#000", "total_tags": "2" }, { "date": "Jan-18", "color": "#85c4e3", "standard_rating_avg": 2, "average_rating_name": "Developing", "color_rating": "#000", "total_tags": "5" }, { "date": "Feb-18", "color": "#85c4e3", "standard_rating_avg": 3, "average_rating_name": "Proficient", "color_rating": "#000", "total_tags": "0" }, { "date": "Mar-18", "color": "#85c4e3", "standard_rating_avg": "No Ratings", "average_rating_name": "No Ratings", "color_rating": "#000", "total_tags": "1" }, { "date": "Apr-18", "color": "#85c4e3", "standard_rating_avg": "No Ratings", "average_rating_name": "No Ratings", "color_rating": "#000", "total_tags": "0" }, { "date": "May-18", "color": "#85c4e3", "standard_rating_avg": "No Ratings", "average_rating_name": "No Ratings", "color_rating": "#000", "total_tags": "0" }, { "date": "Jun-18", "color": "#85c4e3", "standard_rating_avg": "No Ratings", "average_rating_name": "No Ratings", "color_rating": "#000", "total_tags": "0" }, { "date": "Jul-18", "color": "#85c4e3", "standard_rating_avg": "No Ratings", "average_rating_name": "No Ratings", "color_rating": "#000", "total_tags": "0" }],
			"export": {
				"enabled": true,
				"menu": [{
					"class": "export-main",
					"menu": ["PNG", "JPG", "SVG", "PDF"]
				}]
			},
		};
		this.optionsChart2 = JSON.parse(JSON.stringify(this.optionsChart));
		this.optionsChart2.export.menu[0].menu.push(xlsx_menu_item);
		this.optionsChart.export.menu[0].menu.push(xlsx_menu_item);
		this.pieData = {
			"export": {
				"enabled": true,
				"menu": [{
					"class": "export-main",
					"menu": ["PNG", "JPG", "SVG", "PDF", xlsx_menu_item]
				}]
			},
			"type": "pie",
			"theme": "none",
			"labelText": "[[percents]]%",
			"hideCredits": true,
			"startEffect": "easeInSine",
			"startAlpha": 0,
			"startRadius": 0.5,
			"legend": {
				"position": "bottom",
				"align": "center",
				"marginRight": 100,
				"autoMargins": true,
				"equalWidths": true,
				"valueWidth": 0,
				// "divId": "pieLegend"
			},
			"dataProvider": [
			],
			"valueField": "litres",
			"titleField": "country",
			"colorField": "color",
			"balloon": {
				"borderAlpha": 0,
				"borderColor": "#000000",
				"borderThickness": 0,
				"color": "#FDFDFD",
				"fillColor": "#040404"
			}
		};
		this.refactorChartLabels();
	}
	ngAfterViewInit() {
		this.HandleSubmit();
	}
	public activate_chart_tab(n) {
		this.current_chart_tab = n;
		if (n == 1) {
			let that = this;
			that.clearChart("chartContainer");
			that.clearChart("chartContainer2");
			setTimeout(() => {
				that.activateLinearCharts();
			}, 500);
		}
	}
	private clearChart(id) {
		var allCharts = this.AmCharts.charts;
		for (var i = 0; i < allCharts.length; i++) {
			if (allCharts[i].div && id == allCharts[i].div.id) {
				allCharts[i].clear();
			}
		}
	}
	private activateLinearCharts() {
		if (this.charts_data) {
			this.RenderCharts(this.charts_data, true, true);
		}
	}
	private refactorChartLabels() {
		this.AmCharts.addInitHandler(function (chart) {
			//if (chart.legend === undefined || chart.legend.truncateLabels === undefined)
			//	return;
			//;
			if (chart.dataProvider && chart.dataProvider.length > 0 && chart.dataProvider[0].country) {
				for (var i = 0; i < chart.dataProvider.length; i++) {
					var label = chart.dataProvider[i].country;
					if (label && label.length && label.length > 20) {
						label = label.substr(0, 20) + '...'
					} else if (label && label.length && label.length <= 20) {
						// let length =23 - label.length;
						// for (let i = 0; i < length;i++){
						// 	label = label + " ";
						// }
					}
					chart.dataProvider[i].country = label;
				}
			}
		}, ["serial"]);
	}
	// private formatValue(value) {
	// 	;
	// 	let assessment_array = this.bodyService.GetPLData();
	// 	if (!assessment_array) return value;
	// 	return (assessment_array[value]) ? assessment_array[value] : value;
	// }
	private RunSubscribers() {
		this.tabsService.Tabs.subscribe(tab => this.ActivateTab(tab));
		this.tabsService.FiltersSubmitted.subscribe(data => {
			this.HandleSubmit()
		});
	}
	public HandleSubmit() {
		this.p = 1;
		this.current_chart_tab = 1;
		let filters = this.bodyService.GetFilters();
		if (filters && filters.subAccount != '') this.LoadCharts(false);
		else {
			this.chartContainer2Loaded = true;
			this.chartContainerLoaded = true;
			this.pieContainerLoaded = true;
		}
	}
	private ActivateTab(tab) {
		//this.currentTab = tab;
		let filters = this.bodyService.GetFilters();
		if (tab == 1) {
			if (filters && filters.subAccount != '') this.LoadCharts(true);
			else {
				this.chartContainer2Loaded = true;
				this.chartContainerLoaded = true;
				this.pieContainerLoaded = true;
			}
		}
	}
	public getPage(page) {
		this.p = page;
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { page: page },
			queryParamsHandling: 'merge'
		})
		this.LoadCharts(false, page - 1);
	}
	private RenderCharts(data, tags_standards_only?, is_internal?) {
		let folder_type = this.bodyService.GetFilter("folder_type");
		if (void 0 != folder_type) {
			if (+folder_type == 6) { // in case All is selected
				this.optionsChart2.export.menu[0].menu.pop();
				this.optionsChart.export.menu[0].menu.pop();
			} else {
				let found = this.optionsChart2.export.menu[0].menu.some(item => item.label == "XLSX");
				//_.findIndex(this.optionsChart2.export.menu[0].menu, {label: "XLSX"});
				if (!found) {
					let xlsx_menu_item = { "label": "XLSX", "click": () => { this.export_excel(); } };
					this.optionsChart2.export.menu[0].menu.push(xlsx_menu_item);
					this.optionsChart.export.menu[0].menu.push(xlsx_menu_item);
				}
			}
		}
		let thisRef = this;
		if (this.p == 1 || is_internal) {
			this.charts_data = data;
			this.clearChart("chartContainer");
			this.clearChart("chartContainer2");
			this.clearChart("pieContainer");
			this.top_charts = {
				top_available: false,
				least_available: false,
				pie_available: false
			};
			if (data && data.frequency_of_tagged_standars_chart && data.frequency_of_tagged_standars_chart.standarads_tag.length > 0) {
				this.top_charts.top_available = true;
				let standard_tags = data.frequency_of_tagged_standars_chart.standarads_tag;
				this.assign_colors(standard_tags, "bar");
				this.optionsChart.dataProvider = standard_tags;
				this.AmCharts.makeChart("chartContainer2", this.optionsChart);
				this.chartContainer2Loaded = true;
			} else this.chartContainer2Loaded = true;
			if (data && data.frequency_of_tagged_standars_chart_least && data.frequency_of_tagged_standars_chart_least.standarads_tag_least && data.frequency_of_tagged_standars_chart_least.standarads_tag_least.length > 0) {
				let standard_tags_least = data.frequency_of_tagged_standars_chart_least.standarads_tag_least;
				this.assign_colors(standard_tags_least, "bar");
				this.optionsChart2.dataProvider = standard_tags_least;
				this.top_charts.least_available = true;
				this.AmCharts.makeChart("chartContainer", this.optionsChart2);
				this.chartContainerLoaded = true;
			} else this.chartContainerLoaded = true;
			if ((data && data.custom_markers_tag && data.custom_markers_tag.length > 0)) {
				let custom_markers_tag = data.custom_markers_tag;
				this.assign_colors(custom_markers_tag, "pie");
				this.pieData.dataProvider = custom_markers_tag;
				this.top_charts.pie_available = true;
				this.AmCharts.makeChart("pieContainer", this.pieData);
				this.pieContainerLoaded = true;
			} else this.pieContainerLoaded = true;
		} else {
			this.chartContainer2Loaded = true;
			this.chartContainerLoaded = true;
			this.pieContainerLoaded = true;
		}
		if (data.serial_charts && (!tags_standards_only || tags_standards_only == false)) {
			if (!this.charts_data) this.charts_data = {};
			this.charts_data.serial_charts = data.serial_charts;
			let that = this;
			this.serialCharts = data.serial_charts;
			this.serialChartCount = data.serial_charts_count;
			let folder_type = this.bodyService.GetFilter("folder_type");
			data.serial_charts.forEach((c, i) => {
				setTimeout(function (argument) {
					let data = JSON.parse(JSON.stringify(that.serialData));
					data.legend.divId = "legenddiv_" + i;
					data.legend.data = [
						{
							title: c.title + ":" + c.total_tagged_standards,
							color: that.list[(i % 2 == 0) ? 0 : 1]
						}
					];
					if (folder_type != 5) {
						data.legend.data.push(
							{
								title: c.ratting_title + ":" + c.total_avg,
								color: "#000"//that.list[1]
							}
						);
					}
					data.graphs = [
						{
							"valueAxis": "ValueAxis-" + i,
							"colorField": "color",
							"fixedColumnWidth": 15,
							"balloonText": c.title + ": " + "[[value]]", //"[[average_rating_name]]:[[value]]",
							"fillAlphas": 0.8,
							"id": "AmGraph-" + c.count,
							"lineAlpha": 0.2,
							"title": c.title,//"Performance Level",
							//                        "colors": "<?php echo $color; ?>",
							"type": "column",
							//                        "lineColor": "[[color]]",
							"valueField": "total_tags"
						},
						{
							"valueAxis": "ValueAxis-r",
							"colorField": "color_rating",
							"balloonText": "[[average_rating_name]]:[[value]]",
							"fixedColumnWidth": 15,
							"fillAlphas": 0.8,
							"lineAlpha": 0.2,
							"title": thisRef.translation.analytics_performance_level,
							"type": "column",
							//                        "lineColor": "color_rating",
							"valueField": "standard_rating_avg",
						}
					];
					data.allLabels = [
						{
							"bold": true,
							"id": "standard-tag",
							"tabIndex": -5,
							"text": thisRef.translation.analytics_standard_tags,
							"x": 15,
							"y": 13
						},
						{
							"bold": true,
							"id": "performance-level",
							"text": thisRef.translation.analytics_performance_level,
							"x": 820,
							"y": 13
						}
					]
					data.valueAxes = [
						{
							"id": "ValueAxis-" + i,
							"position": "left",
							"axisAlpha": 1,
							"title": "",
							"titleBold": false,
							"titleFontSize": "10",
							"axisColor": "#CCCCCC",
							"integersOnly": true
						},
						{
							"id": "ValueAxis-r",
							"axisAlpha": 1,
							"autoGridCount": true,
							"gridCount": 6,
							"integersOnly": true,
							"dashLength": 1,
							"position": "right",
							"axisColor": "#CCCCCC",
							"minimum": 0,
							"maximum": 5,
							"valueText": "standard_rating_avg",
							"title": "",
							"titleBold": false,
							"labelFunction": (value) => {
								let assessment_array = that.bodyService.GetPLData();
								if (!assessment_array) return value;
								return (assessment_array[value]) ? assessment_array[value] : value;
							},
							"titleFontSize": "10",
							"minVerticalGap": 1,
						}
					];
					data.dataProvider = c.data_provider;
					//that.assign_colors(data.dataProvider, "serial");
					//that.serialData.dataProvider = c.dataProvider;
					that.AmCharts.makeChart("serial_" + i, data);
				}, 500);
			});
		}
	}
	private assign_colors(data, type) {
		if (type == "bar" || type == "serial") {
			data.forEach((_d, i) => { _d.color = this.list[i % 2 == 0 ? 0 : 1] });
		} else if (type == "pie") {
			data.forEach((_d, i) => { _d.color = this.list[i] });
		} else if (type == "serial") {
			data.forEach((_d, i) => { if (i % 2 == 0) { _d.color = _d.color_rating = this.list[0] } else { _d.color = _d.color_rating = this.list[1] } });
		}
	}
	private LoadCharts(is_first = false, page = 0) {
		let filters: any;
		let sessionData: any = this.headerService.getStaticHeaderData();
		filters = this.bodyService.GetFilters();
		filters.filter_type = (filters.duration == -1) ? "custom" : "default";
		// if(is_first){
		// 	filters.folder_type = "1";
		// }
		filters.account_id = sessionData.user_current_account.accounts.account_id;
		filters.role_id = sessionData.user_current_account.roles.role_id;
		filters.startDate = new Date().getFullYear() - 1 + "-" + new Date().getMonth();
		filters.bool = 1;
		filters.user_id = sessionData.user_current_account.User.id;
		if (filters.standards)
			filters.search_by_standards = filters.standards;
		else filters.search_by_standards = "";
		if (!filters.subAccount) {
			filters.subAccount = ""; //2936
		}
		if (filters.account_id == filters.subAccount) {
			filters.account_id = "";
		}
		if ((!filters.duration || filters.duration == -1) && !filters.start_date) {
			//this.toastrService.info("Please select duration OR date range.");
			return;
		}
		filters.offset_serial = this.p - 1 || page;
		filters.limit_serial = 5;
		this.subscriptions.add(this.bodyService.GetCharts(filters).subscribe(data => this.RenderCharts(data)));
	}
	public export_excel() {
		let obj: any = {};
		let type_id = this.bodyService.GetFilter("folder_type");
		if (type_id == 2) {
			let coach_view = this.bodyService.GetFilter("coachee_view");
			type_id = coach_view == 2 ? 4 : 2;
		}
		// this.loadingBarService.start();
		this.loadingModalRef = this.modalService.show(this.loadingModal, { backdrop: 'static' });
		obj.start_date = this.bodyService.GetFilter("start_date");
		obj.end_date = this.bodyService.GetFilter("end_date");
		obj.standards = this.bodyService.GetFilter("standards");
		obj.framework_id = this.bodyService.GetFilter("framework_id");
		obj.subAccount = this.bodyService.GetFilter("subAccount");;
		obj.huddle_type = type_id; //this.bodyService.GetFilter("");
		let sessionData: any = this.headerService.getStaticHeaderData();
		obj.user_id = sessionData.user_current_account.User.id;
		obj.account_id = sessionData.user_current_account.accounts.account_id;
		this.bodyService.Export(obj).subscribe((data: any) => {
			let file_name = data.file_name;
			let interval_id = setInterval(() => {
				obj.file_name = file_name;
				this.bodyService.is_download_ready(obj).subscribe((data: any) => {
					let download_status = data.download_status;
					if (download_status) {
						clearInterval(interval_id);
						obj.download_url = data.download_url;
						obj.file_name = file_name;
						// this.loadingBarService.complete();
						this.loadingModalRef.hide();
						// Download File Here
						this.bodyService.download_analytics_standards_to_excel(obj);
					}
					// clearInterval(interval_id);
				});
			}, 3000);
		});
	}
	ngOnDestroy() {
		this.subscriptions.unsubscribe();
		// if(this.loadingModal) this.loadingModal.hide();
	}
}
interface top_charts {
	top_available: boolean,
	least_available: boolean,
	pie_available: boolean
}