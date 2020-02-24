import { Component, OnInit, OnDestroy } from '@angular/core';
import { AmChartsService, AmChart } from "@amcharts/amcharts3-angular";
import { NgModule } from '@angular/core';
// import {DataTableModule} from 'primeng/datatable';
// import {PaginatorModule} from 'primeng/paginator';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';


// @NgModule({
// 	imports: [DataTableModule, PaginatorModule]
// })

@Component({
  selector: 'first-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {
	
	public chart: AmChart;
	public options;
	public cars;
	public colors;
	public cols;
	public brands;
	public optionslive;
	public pieData;
	public pieData2;
	public chartPage = 1;
	public header_data;
	public translation: any = {};
	private translationSubscription: Subscription;
  constructor(private AmCharts: AmChartsService,private headerService:HeaderService) { 
	this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
		this.translation = languageTranslation;
	});
  }
  
  ngOnInit() {
	  this.cars = [];
	  this.brands = [];

        this.colors = [];

        this.cols = [];

		  this.optionslive = {
			  "type": "serial",
			  "categoryField": "category",
			  "rotate": true,
			  "hideCredits":true,
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
					  "valueField": "column-1"
				  }
			  ],
			  "guides": [],
			  "valueAxes": [
				  {
					  "id": "ValueAxis-1",
					  "axisColor": "#E1E1E1",
					  "tickLength": 1,
					  "title": "",
					  "titleRotation": 1
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
					  "category": this.translation.analytics_content_knowledge_experties,
					  "column-1": 6,
					  "column-2": 5,
					  "color": "#5191cc"
				  },
				  {
					  "category": this.translation.analytics_knowledge_of_student,
					  "column-1": 4,
					  "column-2": "5",
					  "color": "#5e9d31"
				  },
				  {
					  "category": this.translation.analytics_achieving_expections,
					  "column-1": 7,
					  "column-2": "9",
					  "color": "#004160"
				  }
			  ]
		  };

		  this.options = {
			  "type": "serial",
			  "theme": "light",
			  "marginRight": 70,
			  "hideCredits": true,
			  "dataProvider": [
				  {
					  "country": "USA",
					  "visits": 3025,
					  "color": "#FF0F00"
				  },
				  {
					  "country": "China",
					  "visits": 1882,
					  "color": "#FF6600"
				  },
				  {
					  "country": "Japan",
					  "visits": 1809,
					  "color": "#FF9E01"
				  },
				  {
					  "country": "Germany",
					  "visits": 1322,
					  "color": "#FCD202"
				  },
				  {
					  "country": "UK",
					  "visits": 1122,
					  "color": "#F8FF01"
				  },
				  {
					  "country": "France",
					  "visits": 1114,
					  "color": "#B0DE09"
				  },
				  {
					  "country": "India",
					  "visits": 984,
					  "color": "#04D215"
				  },
				  {
					  "country": "Spain",
					  "visits": 711,
					  "color": "#0D8ECF"
				  },
				  {
					  "country": "Netherlands",
					  "visits": 665,
					  "color": "#0D52D1"
				  },
				  {
					  "country": "Russia",
					  "visits": 580,
					  "color": "#2A0CD0"
				  },
				  {
					  "country": "South Korea",
					  "visits": 443,
					  "color": "#8A0CCF"
				  },
				  {
					  "country": "Canada",
					  "visits": 441,
					  "color": "#CD0D74"
				  }
			  ],
			  "valueAxes": [
				  {
					  "axisAlpha": 0,
					  "position": "left",
					  "title": "Visitors from country"
				  }
			  ],
			  "startDuration": 1,
			  "graphs": [
				  {
					  "balloonText": "<b>[[category]]: [[value]]</b>",
					  "fillColorsField": "color",
					  "fillAlphas": 0.9,
					  "lineAlpha": 0.2,
					  "type": "column",
					  "valueField": "visits"
				  }
			  ],
			  "chartCursor": {
				  "categoryBalloonEnabled": false,
				  "cursorAlpha": 0,
				  "zoomable": false
			  },
			  "categoryField": "country",
			  "categoryAxis": {
				  "gridPosition": "start",
				  "labelRotation": 45
			  },
			  "export": {
				  "enabled": true
			  }
		  };
	  this.pieData = {
		  "type": "pie",
		  "theme": "none",
		  "hideCredits": true,
		  "startEffect": "easeInSine",
		  "startAlpha": 0,
		  "startRadius": 0.5,
		  "legend": {
			  "position": "bottom",
			  "marginRight": 100,
			  "autoMargins": true
		  },
		  "dataProvider": [
			  {
				  "country": "Lithuania",
				  "litres": 501.9,
				  "color": "#004061",
			  }, {
				  "country": "Czech Republic",
				  "litres": 301.9,
				  "color": "#4f91cd"
			  }, {
				  "country": "Ireland",
				  "litres": 201.1,
				  "color": "#28a745"
			  }
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
		  },
		  "export": {
			  "enabled": true
		  }
	  }

	  this.pieData2 = {
		  "type": "pie",
		  "theme": "none",
		  "hideCredits": true,
		  "startEffect": "easeInSine",
		  "startAlpha": 0,
		  "startRadius": 0.5,
		  "legend": {
			  "position": "bottom",
			  "marginRight": 100,
			  "autoMargins": false
		  },
		  "dataProvider": [
			  {
				  "country": "Lithuania",
				  "litres": 501.9,
				  "color": "#004061",
			  }, {
				  "country": "Czech Republic",
				  "litres": 301.9,
				  "color": "#4f91cd"
			  }, {
				  "country": "Ireland",
				  "litres": 201.1,
				  "color": "#28a745"
			  }
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
		  },
		  "export": {
			  "enabled": true
		  }
	  }
  }

  ngAfterViewInit() {
    this.chart = this.AmCharts.makeChart("chartContainer", this.optionslive);
	  this.AmCharts.makeChart("pieContainer", this.pieData);
	  this.AmCharts.makeChart("pieContainer2", this.pieData2);
  }

	public paginate(event){

		//return this.cars;

	}

	ngOnDestroy(){
		this.translationSubscription.unsubscribe();
	  }
  
}

export interface Car {
    vin;
    year;
    brand;
    color;
}
