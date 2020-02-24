import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { MainService } from "@videoPage/services";
import { AmChartsService } from "@amcharts/amcharts3-angular";
import { ToastrService } from "ngx-toastr";
import { Subscription } from 'rxjs';

@Component({
  selector: 'coaching-summary',
  templateUrl: './coaching-summary.component.html',
  styleUrls: ['./coaching-summary.component.css']
})
export class CoachingSummaryComponent implements OnInit, OnDestroy {

	@Input() params;
	@Input() VideoInfo;
  @Input() huddle_permission;
  @Input() coaching_perfomance_level;
	public Summary;
  public ChartOptions;
  private list = ["#025c8a", "#28a745",  "#004061", "#5e9d31", "#4f91cd"];
  public EditEnabled;
  public EditableFeedback;
  private isEditAllowed;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  public coachee_can_view_summary;


  constructor(private toastr:ToastrService, private AmCharts: AmChartsService, private headerService:HeaderService, private mainService:MainService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {

  	this.RunSubscribers();
    this.InitChartOptions();
    this.initVars();
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

  private initVars(){

    this.isEditAllowed = false;
    this.EditEnabled = false;

  }

  private InitChartOptions(){

    this.ChartOptions  = {
      
      "type": "serial",
      "categoryField": "tag_title",
      "rotate": true,
      "hideCredits": true,
      "autoMarginOffset": 40,
      "marginRight": 10,
      "marginTop": 10,
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
        "offset": 10,
        "titleColor": "#FFFFFF",
        "position":"right",
        "color":"#7d7c7e"
      },
      "trendLines": [],
      "graphs": [
        {
          "balloonColor": "#000",
          "balloonText": "[[label]]",
          // "balloonText": "[[label]] [[average_rating]]",
          "bulletBorderThickness": 0,
          "bulletSize": 0,
          "colorField": "color",
          "fillAlphas": 1,
          "gapPeriod": -5,
          "id": "AmGraph-1",
          "labelText": "",
          "precision": -9,
          "title": "graph 1",
          "titleField":"average_rating",
          "type": "column",
          "valueField": "AccountTag__total_tags",
          "fixedColumnWidth":20,
          "patternField": "pattern"
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
      "titles": []
    };

  }

  public EditFeedback(){

    this.EditEnabled = !this.EditEnabled;

    if(this.EditEnabled){

      this.EditableFeedback =  this.GetEditableVal() //this.Summary.coach_feedback? this.Summary.coach_feedback.comment:"";

    }

  }

  private GetEditableVal(){
    if(this.VideoInfo.h_type==2){

       if(this.Summary.coach_feedback){

         return this.Summary.coach_feedback.comment;

       }else{
         return "";
       }

    }else{
      if(this.Summary.assessment_feedback){

        return this.Summary.assessment_feedback.comment;
      }else{
        return "";
      }
    }
  }

  public ResolveEditResponse(flag){

    if(flag==0){
      this.EditEnabled = !!false;
    }else{

      // if(!this.EditableFeedback || this.EditableFeedback==""){
      //   this.toastr.info("Please provide feedback text to save.");
      //   return;
      // }

      this.EditEnabled = !!false;

      let sessionData:any = this.headerService.getStaticHeaderData();

      let obj:any = {

        user_id: sessionData.user_current_account.User.id,
        
        document_id:this.params.video_id,
        // coach_response:this.EditableFeedback assessment_note

      };

      if(this.VideoInfo.h_type==2){

        obj.coach_response = this.EditableFeedback;
        obj.coach_feedback_id= this.Summary.coach_feedback? this.Summary.coach_feedback.id:""

      }else{

        obj.assessment_note = this.EditableFeedback;
        obj.assessment_feedback_id = this.Summary.assessment_feedback? this.Summary.assessment_feedback.id:""
      }

      this.mainService.SubmitFeedback(obj, this.VideoInfo.h_type==3).subscribe((data:any)=>{

        if(data.success){

          if(this.VideoInfo.h_type==2){

            this.Summary.coach_feedback = {};

            this.Summary.coach_feedback.id = data.coach_feedback_id;

            this.Summary.coach_feedback.comment = this.EditableFeedback;

          }
          
          else {
            this.Summary.assessment_feedback = {};

            this.Summary.assessment_feedback.id = data.coach_feedback_id;
            
            this.Summary.assessment_feedback.comment = this.EditableFeedback;
          }
          this.toastr.info(data.message);

        }

      });

    }

  }

  private RunSubscribers(){

  	this.LoadSummary();


  }

  private LoadSummary(){

  	let sessionData:any = this.headerService.getStaticHeaderData();

    console.log('this.VideoInfo: ' ,this.VideoInfo)
  	let obj = {

  		account_id: sessionData.user_current_account.accounts.account_id,
  		role_id: sessionData.user_current_account.roles.role_id,
  		user_id: sessionData.user_current_account.User.id,
  		document_id: this.params.video_id,
  		coachee_id: (this.VideoInfo.h_type==2)? this.VideoInfo.coachee_name[0].id:this.VideoInfo.created_by,
  		huddle_id: this.params.huddle_id

  	};

  	this.mainService.GetCoachingSummary(obj, this.VideoInfo.h_type==3).subscribe((data:any)=>{
      this.coachee_can_view_summary = data.can_view_summary_value;
      this.Summary = data;

      this.assign_colors(data.video_tags, "bar");
      this.LimitLabels(data.video_tags as Array<any>, "tag_title", 15);
      this.AssignPattern(data.video_tags);
      this.ChartOptions.dataProvider = data.video_tags;
      this.AmCharts.makeChart("chartContainer", this.ChartOptions);

  	})

  }

  public getHeight(){
    if(this.ChartOptions && this.ChartOptions.dataProvider){
      if(this.ChartOptions.dataProvider.length <= 10){
        return 350;
      }else{
        return this.ChartOptions.dataProvider.length * 28;
      }
      
    }else{
      return 300;
    }
  }

  private AssignPattern(data){

    data.forEach((d)=>{
      
      if(d.average_rating>0){
        // d.color = "#000";
        console.log(d.color);
        d.pattern = {
          "url": "https://www.amcharts.com/lib/3/patterns/black/pattern6.png",
          width: 4,
          height: 4
       };
      }

    })

  }

  private LimitLabels(data:Array<any>, field, toWhat:number){

    data.forEach((d)=>{

      d[field] = d[field].length>toWhat? d[field].substring(0,toWhat)+"...":d[field];

    })

  }

    private assign_colors(data, type){

    if (type == "bar" || type == "serial") {

      data.forEach((_d,i) => { _d.color = this.list[i%2==0?0:1] });

    }else if(type=="pie"){

      data.forEach((_d, i) => { _d.color = this.list[i] });

    } else if (type == "serial") {

      data.forEach((_d, i) => { if (i % 2 == 0) { _d.color = _d.color_rating = this.list[0] } else { _d.color = _d.color_rating = this.list[1] } });

    }
    
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
