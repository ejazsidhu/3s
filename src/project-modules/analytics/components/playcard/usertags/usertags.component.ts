import { Component, OnInit, OnDestroy } from '@angular/core';
import { AmChartsService } from "@amcharts/amcharts3-angular";
import { HeaderService } from "@projectModules/app/services";
// import { BodyService } from "../../body.service";
// import { TabsService } from "../../services/tabs.service";
// import { TagsService } from "../../services/tags.service";
import { ActivatedRoute } from "@angular/router";
// import { PlaycardService } from "../../services/playcard.service";
import { PlaycardService, TagsService, BodyService } from "@analytics/services";
import { Subscription } from 'rxjs';

@Component({
	selector: 'usertags',
	templateUrl: './usertags.component.html',
	styleUrls: ['./usertags.component.css']
})
export class UsertagsComponent implements OnInit, OnDestroy {

	public barChartData;
	public barChartData2;
	public serialChartData;
	public pieChartData;
	private params;
	public serialCharts;
	private list = ["#025c8a", "#28a745", "#004061", "#5e9d31", "#4f91cd"];
	private top_charts;
	private charts_data;
	public current_chart_tab: number = 1;
	public serialChartCount;
	public p;
	public header_data;
	public translation: any = {};
	public translationLoaded: boolean = false;
	public topContainerLoaded: boolean = false;
	public leastContainerLoaded: boolean = false;
	public pieContainerLoaded: boolean = false;
	private translationSubscription: Subscription;

	constructor(private AmCharts: AmChartsService, private route: ActivatedRoute, private bodyService: BodyService, private headerService: HeaderService, private tagsService: TagsService, private playcardService: PlaycardService) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.analytics_top_five_tagged_standard) {  // check if translation for analytics is loaded
				this.translationLoaded = true;
				this.LoadCharts(); // load charts when translation are loaded
			}
		});
	}



	public LoadCharts(page?) {

		let that = this;
		this.current_chart_tab = 1;
		let interval_id = setInterval(() => {
			let sessionData;
			sessionData = that.headerService.getStaticHeaderData();

			if (sessionData.user_current_account) {

				clearInterval(interval_id);
				let filters = JSON.parse(JSON.stringify(that.bodyService.GetFilters()));

				if (filters.start_date) {

					filters.date_range = [new Date(filters.start_date), new Date(filters.end_date)];
					filters.filter_type = "custom";
					filters.start_date = this.formatDate(new Date(filters.start_date));
					filters.end_date = this.formatDate(new Date(filters.end_date));

				} else if (filters.duration > -1) {
					filters.start_date = that.params.start_date;
					filters.end_date = that.params.end_date;
					filters.filter_type = "default";

				}

				filters.user_id = that.params.user_id;
				filters.user_role = sessionData.user_current_account.roles.role_id;
				filters.user_type = this.translation.analytics_coach_assessor;

				filters.account_id = that.params.account_id;
				filters.folder_type = that.params.folder_type;
				filters.sub_account = "";
				filters.coachee_view = 1;
				filters.bool = 1;
				filters.offset_serial = this.p - 1 || page;
				filters.limit_serial = 5;

				filters.account_id = that.params.account_id;
				filters.subAccount = "";
				filters.folder_type = this.playcardService.Get_Filter("folder_type") || 2;
				filters.coachee_view = this.playcardService.Get_Filter("coachee_view");
				filters.framework_id = this.playcardService.Get_Filter("framework_id");
				filters.standards = this.playcardService.Get_Filter("standards");
				filters.search_by_standards = this.playcardService.Get_Filter("standards");
				this.tagsService.GetCharts(filters).subscribe((data) => { this.RenderCharts(data); });

			}


		}, 500)

	}

	public activate_chart_tab(n) {

		this.current_chart_tab = n;
		let that = this;
		setTimeout(() => {



			that.clearChart("TopContainer");

			that.clearChart("LeastContainer");

			that.clearChart("PieContainer");

			that.RenderCharts(that.charts_data, true, true);

		}, 500);




	}

	private clearChart(id) {
		var allCharts = this.AmCharts.charts;
		for (var i = 0; i < allCharts.length; i++) {
			if (allCharts[i].div && id == allCharts[i].div.id) {
				return allCharts[i].clear();
			}
		}
	}


	public getPage(page) {

		this.p = page;
		this.LoadCharts(page - 1);
	}

	private RenderCharts(data, tags_standards_only?, is_internal?) {
		let header_data = this.headerService.getStaticHeaderData();

		if (this.p == 1 || is_internal) {
			this.charts_data = data;

			this.top_charts = { top_available: false, least_available: false, serial_available: false };

			this.clearChart("TopContainer");
			this.clearChart("LeastContainer");
			this.clearChart("PieContainer");
			// this.topContainerLoaded = false;
			// this.leastContainerLoaded = false;
			// this.pieContainerLoaded = false;


			if (data && data.frequency_of_tagged_standars_chart && data.frequency_of_tagged_standars_chart.standarads_tag.length > 0) {

				this.top_charts.top_available = true;

				let standard_tags = data.frequency_of_tagged_standars_chart.standarads_tag;

				this.assign_colors(standard_tags, "bar");

				this.barChartData.dataProvider = standard_tags;

				this.AmCharts.makeChart("TopContainer", this.barChartData);
				this.topContainerLoaded = true;

			}else this.topContainerLoaded = true;

			if (data && data.standarads_tag_least && data.standarads_tag_least.length > 0) {

				let standard_tags_least = data.standarads_tag_least;

				this.assign_colors(standard_tags_least, "bar");

				this.barChartData2.dataProvider = standard_tags_least;

				this.top_charts.least_available = true;

				this.AmCharts.makeChart("LeastContainer", this.barChartData2);
				this.leastContainerLoaded = true;

			}else this.leastContainerLoaded = true;

			if ((data && data.frequency_of_tagged_standars_chart.custom_markers_tag && data.frequency_of_tagged_standars_chart.custom_markers_tag.length > 0)) {

				let custom_markers_tag = data.frequency_of_tagged_standars_chart.custom_markers_tag;

				this.assign_colors(custom_markers_tag, "pie");

				this.pieChartData.dataProvider = custom_markers_tag;

				this.top_charts.pie_available = true;

				this.AmCharts.makeChart("PieContainer", this.pieChartData);
				this.pieContainerLoaded = true;
			}else this.pieContainerLoaded = true;
		}else {
			this.topContainerLoaded = true;
			this.leastContainerLoaded = true;
			this.pieContainerLoaded = true;
		}
		let folder_type = this.playcardService.Get_Filter('folder_type');
		let that = this;
		let assessment_array = data.assessment_array;
		// (data.serial_charts && data.serial_charts.length > 0) && 
		if (!tags_standards_only) {
			if (!this.charts_data) this.charts_data = {};
			this.charts_data.serial_charts = data.serial_charts;
			this.top_charts.serial_available = true;

			this.serialCharts = data.serial_charts;
			this.serialChartCount = data.serial_charts_count;
			data.serial_charts.forEach((c, i) => {

				setTimeout(function (argument) {
					let data = JSON.parse(JSON.stringify(that.serialChartData));
					data.legend.divId = "legenddiv_" + i;
					data.legend.data = [
						{
							title: c.title + ":" + c.total_tagged_standards,
							color: (i % 2 == 0) ? that.list[0] : that.list[1]
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
							"title": header_data.language_translation.analytics_performance_level,
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
							"text": header_data.language_translation.analytics_standard_tags,
							"x": 16,
							"y": 13
						},
						{
							"bold": true,
							"id": "performance-level",

							"text": header_data.language_translation.analytics_performance_level,
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
								// let assessment_array = that.bodyService.GetPLData();

								if (!assessment_array) return value;

								return (assessment_array[value]) ? assessment_array[value] : value;
							},

							"titleFontSize": "10",
							"minVerticalGap": 1,
						}

					];

					c.data_provider.forEach((dp) => {

						dp.color = (i % 2 == 0) ? that.list[0] : that.list[1];

					});

					data.dataProvider = c.data_provider;
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

	ngOnInit() {
		this.header_data = this.headerService.getStaticHeaderData();
		this.top_charts = {};
		this.route.params.subscribe(params => { this.params = params; });
		this.initChartsData();
		this.tagsService.PlaycardUpdateClicked.subscribe(d => { if (d) { this.p = 1; this.LoadCharts() } });

		this.refactorChartLabels();

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

	private formatDate(date) {

		return date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();

	}

	private initChartsData() {

		this.barChartData = {
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

		this.barChartData2 = JSON.parse(JSON.stringify(this.barChartData));

		this.serialChartData = {

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
					"title": this.translation.analytics_performance_level,
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

					},
					"title": this.translation.analytics_performance_level,
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

		this.pieChartData = {

			"export": {
				"enabled": true,
				"menu": [{
					"class": "export-main",
					"menu": ["PNG", "JPG", "SVG", "PDF"]
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
				"valueWidth": 0
			},
			"dataProvider": [

			],
			"valueField": "AccountTag__total_tags",
			"titleField": "tag_title",
			"colorField": "color",
			"balloon": {
				"borderAlpha": 0,
				"borderColor": "#000000",
				"borderThickness": 0,
				"color": "#FDFDFD",
				"fillColor": "#040404"
			}

		};


	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
	}

}
