import { Component, OnInit, Input, ViewChild, EventEmitter } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ModalDirective  } from 'ngx-bootstrap/modal';
import { AmChartsService } from '@amcharts/amcharts3-angular';
import { environment } from '@src/environments/environment.prod';
import { HeaderService } from '@src/project-modules/app/services';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
@Component({
  selector: 'app-coaching-detail',
  templateUrl: './coaching-detail.component.html',
  styleUrls: ['./coaching-detail.component.css']
})
export class CoachingDetailComponent implements OnInit {
  @Input() data;
  @Input() translation;
  @ViewChild('coachingpopup',{static:true}) coachingpopup: ModalDirective;
  @ViewChild('confirmationPopup',{static:true}) confirmationPopup: ModalDirective;
  isDragging:boolean=false;
  private list = ["#025c8a", "#28a745",  "#004061", "#5e9d31", "#4f91cd"];
  owlOptions:OwlOptions = {
    margin: 10,
    nav: true,
    dots: false,
    loop: false,
    autoplay: false,
    autoplayTimeout: 5000,
    navText: [ '‹', '›' ],
    responsive: {
      0: {
        items: 4
      },
      600: {
        items: 4
      },
      800:{
        items: 4
      },
      1000: {
        items: 4
      }
    }
  }
  editmode: boolean = false;
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  coacheeSearch:any;
  summaryEditText = '';
  popupData: any;
  ChartOptions:any;
  summary_rating: any;
  no_data_found: boolean=true;
  popupskeleton: boolean=true;
  feedbacksearch;
  sessionData: any;
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  full_text_video_tags: any;
  constructor(private AmCharts:AmChartsService,private headerService:HeaderService, private http:HttpClient,private toastr:ToastrService) { }

  ngOnInit() {
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.opts = { 
      position: 'right', // left | right
      barBackground: '#C9C9C9', // #C9C9C9
      barOpacity: '0.8', // 0.8
      barWidth: '10', // 10
      barBorderRadius: '20', // 20
      barMargin: '0', // 0
      gridBackground: '#D9D9D9', // #D9D9D9
      gridOpacity: '1', // 1
      gridWidth: '0', // 2
      gridBorderRadius: '20', // 20
      gridMargin: '0', // 0
      alwaysVisible: true, // true
      visibleTimeout: 1000, // 1000
    }
    this.coacheeSearch=''
  }
  initchartOptions(){
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
          "balloonText": "[[label]] [[average_rating]]",
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
    let sessionData:any = this.headerService.getStaticHeaderData();
    this.sessionData = sessionData;
    let url = environment.APIbaseUrl + '/coaching_tracker_video_detail';
    let body = {
      user_current_account:sessionData.user_current_account,
      document_id:this.popupData.id,
    }
    this.http.post(url,body).subscribe((data:any)=>{
      this.popupskeleton=false;
    let total_rat = 0;
    data.video_tags.forEach(x => {
     total_rat = total_rat + x.average_rating;
    });
    let rating_index = Math.round(total_rat/data.video_tags.length);
    this.popupData.data = data;
    this.summaryEditText = data.coach_feedback.comment;
    this.summary_rating = data.rating_names[rating_index];
    this.assign_colors(data.video_tags, "bar");
    data.full_text_tags = JSON.parse(JSON.stringify(data.video_tags));
    this.full_text_video_tags = data.full_text_tags;
    this.LimitLabels(data.video_tags as Array<any>, "tag_title", 15);
    this.AssignPattern(data.video_tags);
    this.ChartOptions.dataProvider = data.video_tags;
    var chart = this.AmCharts.makeChart("chartContainer", this.ChartOptions);
    // document.getElementsByClassName('amcharts-main-div')[0].prepend(document.getElementsByClassName('tooltip_container')[0])
    var categoryAxis = chart.categoryAxis;
    categoryAxis.addListener("rollOverItem",(e)=>{
    let id =  e.serialDataItem.dataContext.account_tag_id;
    let elm = document.getElementById('tooltip_'+id);
    elm.style.display = 'block';
    let cheight = 35 - elm.clientHeight;
    let left = e.target.x-10+'px';
    let top = ((e.target.y+55)+(cheight))+'px';
        if(this.sessionData.user_current_account.User.id == this.popupData.CoacheData.coach_id){
            top = ((e.target.y+290)+(cheight))+'px';
        }
    elm.style.top = top;
    elm.style.left = left;
    })
    categoryAxis.addListener("rollOutItem",function(e){
    let id =  e.serialDataItem.dataContext.account_tag_id;
    document.getElementById('tooltip_'+id).style.display = 'none';
    })
    console.log('Watch Data',data)
    })

  }
  summaryEdit(){
    this.editmode = true;
  }
  custom_f(e){
    console.log('Event Fired From Chart',e)
  }
  ImageUrlBuilder(participent: any) {
    if (participent) {
      if (participent.image == 'groups') {
        return true
      } else {
        let image = participent.image || "assets/img/photo-default.png";
        let url = `${this.staticImageServiceIp}${participent.id}/${
          participent.image
          }`;
        return participent.image ? url : image;
      }
    }
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
  getUrl(data){
    if(data){
      let url = environment.baseUrl + '/video_details/home/' + data.document.huddle_id + '/' + data.document.id
      return url;
    }
  }

  getScriptedNoteLink(document){
    if(document){
      return environment.baseUrl + '/video_details/scripted_observations/' + document.huddle_id + '/' + document.id
    }
  }
  modalData(data,item?){
    this.popupData = data
    this.popupData.CoacheData = item;
  }
  saveSummary(){
    let sessionData:any = this.headerService.getStaticHeaderData();
    let url = environment.APIbaseUrl + '/coaching_tracker_note_tracker_controller';
    let body:any = {};
    body.coach_response=this.summaryEditText.trim();
    if(this.popupData.data.coach_feedback==''){body.coach_feedback_id=''}else{body.coach_feedback_id=this.popupData.data.coach_feedback.id};
    body.document_id=this.popupData.data.document.id;
    body.user_current_account=sessionData.user_current_account;
    this.http.post(url,body).subscribe((d:any)=>{
      if(d.status){
        this.editmode=false;
        this.popupData.data.coach_feedback.comment=this.summaryEditText;
        this.toastr.info(this.translation.coaching_tracker_summary_field_updated_successfully)
      }
    })
  }
  cancelSummary(){
    this.summaryEditText=this.popupData.data.coach_feedback.comment;
    this.editmode=false;
  }
  removeTracker(){
    let sessionData:any = this.headerService.getStaticHeaderData();
    let url = environment.APIbaseUrl + '/remove_tracking';
    console.log(this.popupData)
    let body = {
      user_current_account:sessionData.user_current_account,
      document_id:this.popupData.id,
    }
    this.http.post(url,body).subscribe((d:any)=>{
      if(d.status){
        this.data.forEach((d,ii) => {
          d.Videos.forEach((x,i) => {
            if(x.id==this.popupData.id){
              this.data[ii].Videos.splice(i,1);
              this.data[ii].Videos = [...this.data[ii].Videos];
            }
          });
        });
        this.hideModal('coachingpopup');
        this.hideModal('confirm');
        this.toastr.info(this.translation.coaching_tracker_successfully_removed_from_tracker)
      }
    })
  }
  exportApi(type,item){
    let sessionData:any = this.headerService.getStaticHeaderData();
    let url = environment.APIbaseUrl + '/export_coaching_tracker';
    let body = {
      single_export: 1,
      export_type:type,
      user_current_account:sessionData.user_current_account,
      start_date:item.bsRangeValue[0].toISOString().split('T')[0],
      end_date:item.bsRangeValue[1].toISOString().split('T')[0],
      single_coach_id:item.coach_id,
      single_coachee_id:item.id,
    }
    this.http.post(url,body,{responseType: 'blob'}).subscribe((d:any)=>{
      const datapdf = new Blob([d],{type:'application/pdf'})
      const dataxlsx = new Blob([d],{type:'application/pdfapplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
      if(type=="pdf"){
        FileSaver.saveAs(datapdf,`Coaching Tracker ${item.full_name} PDF Export.pdf`);
      }else{
        FileSaver.saveAs(dataxlsx,`Coaching Tracker ${item.full_name} EXCEL Export.xlsx`)
      }
    },err=>{
      this.toastr.error(this.translation.something_went_wrong_coaching_tracking_new)
    })
  }
  feedback_Search(type){
    if (type == "no") {
      if (this.feedbacksearch == 'no_feedback') {
        this.feedbacksearch = '';
      } else {
        this.feedbacksearch = 'no_feedback';
      }
    }
    if (type == "late") {
      if (this.feedbacksearch == 'late_feedback') {
        this.feedbacksearch = '';
      } else {
        this.feedbacksearch = 'late_feedback';
      }
    }
    if (type == "ontime") {
      if (this.feedbacksearch == 'ontime_feedback') {
        this.feedbacksearch = '';
      } else {
        this.feedbacksearch = 'ontime_feedback';
      }
    }
  }
  checkPermission(){
    if(this.sessionData.user_current_account.User.id == this.popupData.CoacheData.coach_id){
      this.editmode=true;
    }
  }
  showModal(modal?){
    console.log('this.popupData: ', this.popupData)
    if(modal=='coachingpopup' && this.isDragging==false){
      this.popupskeleton=true;
      this.editmode=false;
      this.initchartOptions();
      this.coachingpopup.show();
    }else if(modal=='confirm'){
      this.confirmationPopup.show();
    }
  }
  hideModal(modal?){
    if(modal=='coachingpopup'){
      this.coachingpopup.hide();
    }else if(modal=='confirm'){
      this.confirmationPopup.hide()
    }
  }

  changePage(event){
    this.data.page = event;
  }

}
