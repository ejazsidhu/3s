import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { environment } from '@src/environments/environment';
import { MainService ,ScrollService,CropPlayerService} from '@videoPage/services';
import * as _ from "underscore";
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'seperate-video-player',
  templateUrl: './seperate-video-player.component.html',
  styleUrls: ['./seperate-video-player.component.css']
})
export class SeperateVideoPlayerComponent implements OnInit {

  @Input('data') data:any;
  @Input('params') params:any;

  rubrics: any={};
  translation: any=[];
  private subscriptions: Subscription = new Subscription();
  VideoCurrentTime: any;
  isAuthenticatedUser: boolean;
  src: { "path": any; "type": string; };
  comments: any;
  permissions: any={};
  CustomMarkers: any;
  totals: any={};
  VideoInfo: any={};
  thubnail_url: any;
  settings: any={};
  localArry: any;
  header_data: any;
  loaded: boolean;
  currnetUser: any={};
  VideoTotalTime: any;
  isVideoProcessing: boolean;
  EditMode: any;
  lsCommentExisted: boolean;
  newComment: any;
  audioRecorderState: string;
  localAudioData: any;
  EditChanges: any;
  selectedTag: any;
  tags: any;
  selectedRubrics: any;
  transCodingStatus: any;
  errorStatus: boolean;
  isAudio: boolean;
  VideoHuddleFramework: any;
  commentsSortBy:number = 0;previousTime: any;
  currentTimeInSeconds: number;
  isPlaying: any;
  currentComment: any;
  colorClasses:any;
  videoCommentPlayAvailable;
  private videoCommentPlayTimeSlots: any[] = [];
  videoIsLessAutoCommentPlayRange: boolean;
  videoDuration: number;
  private minMntsReqForVCP: number = 1;
  public userAccountLevelRoleId: any= 0;
  public modalRef:BsModalRef;
  isCroLoading: boolean;
  cropRange: number[];
  cropStartValue: string;
  cropEndValue: string;
  CopyData: any={};
  primery_button_color: any;
  ShowInfo=false;
  previousEnd: any;
  previousStart: any;
  captureCount: number=0;
  videoEnd: any;
  cropRangeSliderConfig: any={};
  IsCropPlayerReady: boolean;
  public currentCopyTab;

  constructor(private headerService:HeaderService,private toastr:ToastrService
    ,public mainService:MainService,private scrollToService:ScrollService,private modalService :BsModalService,private cropPlayerService:CropPlayerService) {
    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      this.VideoCurrentTime=this.translation.all_video;
    }));
   }

  ngOnInit() {
    this.colorClasses =  ["#5db85b", "#38a0ff", "#ff5800", "#df0a00"];
    this.handleVideo(this.data);
    this.totals.comment_count=0;
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    this.GetCopyData();
    this.primery_button_color = this.header_data.primery_button_color;
    this.cropRangeSliderConfig = {
      connect: [false,true,false],
      step: 1,
      range: {
          min: 1,
          max: 62
      }
  };

  }

  private handleVideo(data){
    this.header_data = this.headerService.getStaticHeaderData();
    if(data.h_type==3 && this.rubrics){

      if(data.user_huddle_level_permissions==210 || data.user_huddle_level_permissions==220){

        this.rubrics.account_framework_settings.checkbox_level = -1;

      }

    }

    if(!data.success){
          
      this.toastr.info(this.translation.u_dont_permission_vd);

      setTimeout(()=>{

        location.href = environment.baseUrl;

      }, 1000);

      return ;


    }

    // console.log(data);
    // console.log(data.published);

    this.isAuthenticatedUser = true;
  	this.src = {"path":data.static_url, "type":"video/mp4"};
    this.comments = data.comments.Document.comments;
    this.ApplySettings({sortBy:0});
    let fake_coment = JSON.parse(localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_comment_video_' + this.params.video_id));
    if(fake_coment!=undefined && fake_coment!=null){
      fake_coment.forEach(c => {
        if(c!=undefined && c!=null){
          this.localArry.push(c);
          this.comments.unshift(c);  
          this.comments = [...this.comments];
        }    
      });
    }

    let localCdata = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_edit_comment_video_'+this.params.video_id)
    if (localCdata != null && localCdata != undefined) {
      let sdata = JSON.parse(localCdata)
      sdata.forEach(x => {
        const index = this.comments.findIndex(c => c.id == x.id);
        if (index > -1) {
          this.comments[index] = x;
        }
      });
    }


  	this.CustomMarkers = data.custom_markers;
  	// this.prepareComments(this.comments);
  	this.totals.comment_count = data.comments_counts.total_comments;
    this.totals.resources_count = data.attached_document_numbers;
    this.VideoInfo = data.video_detail;
    this.thubnail_url = data.thubnail_url;
  	this.VideoInfo.h_type = data.h_type;
  	this.VideoInfo.huddle_type = data.huddle_type;
    this.settings.PauseWhileTyping = Boolean(data.user_pause_settings);
    this.permissions.rubric_check = data.rubric_check;
    this.permissions.performance_level_check = data.performance_level_check;
    this.permissions.can_view_summary = data.can_view_summary;
    this.permissions.coaching_summary_check = data.coaching_summary_check;
    this.permissions.assessment_summary_check = data.assessment_summary_check;
    this.permissions.can_comment = data.can_comment;
    this.permissions.can_reply = data.can_reply;
    this.permissions.can_rate = data.can_rate;
    this.permissions.huddle_permission = data.user_huddle_level_permissions;
    this.permissions.showCopy = data.can_dl_edit_delete_copy_video;
    this.permissions.AllowCustomMarkers = data.video_markers_check == "1";
    this.permissions.coaching_perfomance_level = data.coaching_perfomance_level == "1";
    this.permissions.can_crop_video = !!data.can_crop_video;
    this.permissions.assessment_perfomance_level = data.assessment_perfomance_level=="1";
    this.loaded = true;

    data.huddle_info.huddle_title = this.VideoInfo.title;
    this.mainService.breadcrumbs.emit(data.bread_crumb_output);
    this.mainService.huddleInfo.emit(data.huddle_info);
    this.VideoInfo.coaching_link = data.coaching_link;
    this.VideoInfo.assessment_link = data.assessment_link;
    this.permissions.framework_selected_for_video = data.framework_selected_for_video;
    this.permissions.allow_per_video = data.allow_per_video;
    this.permissions.get_account_video_library_permissions = data.get_account_video_library_permissions;

    this.currnetUser.huddle_role_id = data.user_huddle_level_permissions;

    this.VideoTotalTime = data.video_duration;
    this.VideoInfo.defaultFramework = data.default_framework;
    this.isVideoProcessing = data.video_detail.published==0;

    if(this.EditMode){
      
    }else{
      let datafromlS = localStorage.getItem(this.header_data.user_current_account.User.id + '_video_play_comment_' + this.params.video_id);
      let ParsedDataFromLs = JSON.parse(datafromlS);
      if (ParsedDataFromLs) {
        this.lsCommentExisted = true;
        this.newComment.commentText = ParsedDataFromLs.comment;
        this.newComment.ref_type = ParsedDataFromLs.ref_type;

        if(ParsedDataFromLs.localAudio) { 
          this.newComment.audioUrl = ParsedDataFromLs.audioUrl;
          this.newComment.localAudio = ParsedDataFromLs.localAudio;
          this.newComment.audioDuration = ParsedDataFromLs.audioDuration;
          this.audioRecorderState = 'play';
          this.localAudioData.localAudio = ParsedDataFromLs.localAudio;
          this.localAudioData.audioUrl = ParsedDataFromLs.audioUrl;
          this.localAudioData.audioRecorderState = this.audioRecorderState;
        }

        this.CustomMarkers.forEach(marker => {
          if (marker.tag_title == ParsedDataFromLs.assessment_value.split(' ')[1]) {
            this.ChooseCustomTag(marker);
          }
        });
        this.SetCustomTags(ParsedDataFromLs.customTags);
        this.newComment.files = ParsedDataFromLs.files;
        this.selectedRubrics = ParsedDataFromLs.selectedRubrics;
        // this.GetTime(this.ConvertTime(ParsedDataFromLs.time))
        if(ParsedDataFromLs.time) {
          this.GetTime(ParsedDataFromLs.time)
        }else {
          this.VideoCurrentTime = this.translation.vd_all_videos.trim();
        }
      }
    }
    this.transCodingStatus=data.video_detail.transcoding_status;
    this.errorStatus=data.video_detail.encoder_status=='Error'

    // data.video_detail.file_type=='mp3'
    if(this.headerService.isAValidAudio(data.video_detail.file_type) ){
      // this.isVideoProcessing=true;

      this.isAudio=true;

    }
    if(this.permissions.can_crop_video){
      // this.init_crop();
    }
    if(data.default_framework != "0" && data.default_framework != "-1"){

    this.VideoHuddleFramework = data.default_framework;
    // this.GetRubricById(data.default_framework);


    this.permissions.permission_video_library_upload = this.header_data.user_current_account.users_accounts.permission_video_library_upload==1;    

    }

  	if(this.VideoInfo.h_type==2){
  		this.VideoInfo.coachee_name = data.coachee_name;
  		this.VideoInfo.coaches_name = data.coaches_name;
  	}else if(this.VideoInfo.h_type==3){

  		this.VideoInfo.assessor_names = data.assessor_names;
  		this.VideoInfo.eval_participant_names = data.eval_participant_names;

  	}


  }
  public ApplySettings(settings){

    if(typeof(settings.sortBy) == "number"){
      this.commentsSortBy = settings.sortBy;
      if(settings.sortBy==1){

        this.comments = _.sortBy(this.comments, (c:any)=>{return new Date(c.created_date)});

      }else if(settings.sortBy==0){
        this.comments = _.sortBy(this.comments, (c:any)=>{return new Date(c.created_date)});
        this.comments = this.comments.reverse();
      }else if(settings.sortBy==2){

        let wholeComments = this.comments.filter((c)=>{return c.time==0||c.time==null;});
        let timeComments = this.comments.filter((c)=>{return c.time>0});


        this.comments = _.sortBy(timeComments, (c)=>{return new Date(c.time)}).concat(wholeComments);

      }

    }
    if(typeof(settings.autoscroll)=="boolean"){

      this.settings.autoscroll = settings.autoscroll;

    }

  }

  public ChooseCustomTag(tag){

    this.EditChanges.changed_custom_markers=true;//{changed_standards:false, };

  	if(this.selectedTag == tag){
  		this.selectedTag = {};
  	}else{
  		this.selectedTag = tag;
  	}

  }

  public SetCustomTags(tags){
  	this.tags = tags;
  }

    /**
   * As we are getting current time from videojs which omit time randomly after 250 - 1000 ms based on video current playback rate So I have 
   * implemented to save a previous time in a global variable and if current video time is not equal to previous video time then scrolling and 
   * other variable updated occurs
   * @param currentTime Video current playing time
   */
  public GetTime(currentTime: number) {
    if (this.EditMode) return;
    
    let time = Math.floor(currentTime);
    
    if(!this.previousTime) {
      this.previousTime = time;
      this.VideoCurrentTime = this.ConvertTime(currentTime);
      this.currentTimeInSeconds = currentTime;
    }

    if(time !== this.previousTime) {

      this.VideoCurrentTime = this.ConvertTime(currentTime);
      this.currentTimeInSeconds = currentTime;

      let index = _.findIndex(this.comments, { time: Math.floor(currentTime) });

      if (index >= 0 && currentTime != 0) {
        if (this.isPlaying && this.settings.autoscroll) {

          this.previousTime = time;

          this.currentComment = this.comments[index];
          this.scrollToService.scrollTo("#slimscroll", "#comment_" + index);

        } else {
          this.currentComment = {};
        }

      }
    }
  }

  public ConvertTime (n) {

    if(!n || n==null || n==0) return this.translation.vd_all_videos;//"00:00:00";
    let sec_num:any = parseInt(n, 10);
    let hours:any   = Math.floor(sec_num / 3600);
    let minutes:any = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds:any = sec_num - (hours * 3600) - (minutes * 60);

    if(hours==0 && minutes==0 && seconds==0){
      return this.translation.vd_all_videos;
    }
    
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
  }

  /** Comment play functionality start */

  public checkForVideoCommentPlay(videoDuration?: number) {
    if(videoDuration) this.videoDuration = videoDuration;

    if((Math.floor(this.videoDuration) / 60) > this.minMntsReqForVCP) {
    
      let timeCommentsExists = this.comments.find(comment => comment.time);
      if(timeCommentsExists) {
        this.calculateVideoCommentPlayTimeSlots();
        this.videoCommentPlayAvailable = true;
      }else {
        this.videoCommentPlayAvailable = false;
      }
      
      this.videoIsLessAutoCommentPlayRange = false;
    } else {
      this.videoIsLessAutoCommentPlayRange = true;
    }

  }
    /** Calculates video comment play time slots
   *  Description: Steps => 
   *  1. Calculate time range by looping over comments by handling the overlap behavior of comment's time and end time
   *  2. If bydefault ordering of commets some time slots have been missed and overlapped their time with one another then do a force filtering 
   *     to remove overlap time ranges.
   *  3. Sort the time range slots so that video will always play from leas start time
   */
  private calculateVideoCommentPlayTimeSlots() {
    // Step-1
    this.videoCommentPlayTimeSlots = [];
    this.comments.forEach(comment => {
      if(comment.time && comment.time != 0) {

        const commentTime = Math.max(0, (comment.time - 10));
        const commentEndTime = (comment.end_time && comment.end_time != 0) ? (comment.end_time + 10) : (comment.time + 10); 

        let timeRangeExists = this.videoCommentPlayTimeSlots.find(item => commentTime >= item.start && commentTime <= item.end);
        if(timeRangeExists) {
          if(timeRangeExists.end < commentEndTime) timeRangeExists.end = commentEndTime;
        } else {
          this.videoCommentPlayTimeSlots.push({start: commentTime, end: commentEndTime});
        }
      }
    });

    // Step-2
    this.videoCommentPlayTimeSlots = this.videoCommentPlayTimeSlots.filter(timeRange => {
      let timeRangeExists = this.videoCommentPlayTimeSlots.find(item => timeRange.end >= item.start && timeRange.end < item.end);
      if(timeRangeExists) {
        if(timeRange.start < timeRangeExists.start) timeRangeExists.start = timeRange.start;
      } else {
        return timeRange;
      }
    });

    // Step-3
    this.videoCommentPlayTimeSlots.sort((firstIndex, secondIndex) => {
      return firstIndex.start - secondIndex.start;
    });
    //alternative of Step 2
    let temp = this.videoCommentPlayTimeSlots;
    let that = this;
    for(let index = 0; index < this.videoCommentPlayTimeSlots.length; index++){
      let slot = this.videoCommentPlayTimeSlots[index];
        for(let inner_index = 0; inner_index < temp.length; inner_index++){
          let current = temp[inner_index];
          if(index !== inner_index)
          {
              if(slot.start >= current.start && slot.end <= current.end)
              {
                  that.videoCommentPlayTimeSlots.splice(index, 1);
                  break;
              }
          }
      }
    }

    console.log('this.videoCommentPlayTimeSlots: ', this.videoCommentPlayTimeSlots)

    // const arr = [];
    // this.videoCommentPlayTimeSlots.forEach(timeRange => {
    //   let timeRangeExists = arr.find(item => timeRange.end >= item.start && timeRange.end <= item.end);
    //   if(timeRangeExists) {
    //     if(timeRange.start < timeRangeExists.start) timeRangeExists.start = timeRange.start;
    //   } else {
    //     arr.push({start: timeRange.start, end: timeRange.end});
    //   }
    // });

    // console.log('afte ', arr)

  }

  public DownloadVideo(){

    let sessionData:any = this.headerService.getStaticHeaderData();

    let obj = {
      document_id: this.params.video_id,
      huddle_id: this.params.huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id
    }

    this.mainService.DownloadVideo(obj);

  }

  public InitiateCopyDialog(template: TemplateRef<any>, file){
    // this.DeletableFile = file;

   this.modalRef = this.modalService.show(template, {class:"modal-md model-copy"});
 }
 public InitiateCropDialog(template: TemplateRef<any>, file?){
      
  let that = this;

  // this.playerService.ModifyPlayingState("pause");

  if(document.getElementsByTagName("modal-container").length < 1){
    this.isCroLoading = true;

    setTimeout(()=>{

      this.isCroLoading = false;
      this.cropRange = [0,0];
      this.cropStartValue = "00:00";
      this.cropEndValue = "00:00";
      this.modalRef = this.modalService.show(template, {class:"modal-lg model-crop",backdrop:'static', animated: false});
      (document.querySelector('modal-container') as HTMLElement).addEventListener('click',function(){
      //  // it was closing modal on clicking
        // that.hideCropModal();
      });
      (document.querySelector('.modal-content') as HTMLElement).addEventListener('click',function(e){
          e.stopPropagation();
      });

    }, 1000);



  }
  else
  {
      (document.querySelector('bs-modal-backdrop') as HTMLElement).style.display = "block";
      (document.querySelector('modal-container') as HTMLElement).style.display = "block";
      (document.querySelector('body') as HTMLElement).style.overflow = "hidden";
  }

}

public GetCopyData(){

  let sessionData:any = this.headerService.getStaticHeaderData();

  let obj = {

     user_id: sessionData.user_current_account.User.id,
     account_id: sessionData.user_current_account.accounts.account_id

  }

  this.mainService.GetCopyData(obj).subscribe((data)=>{

    this.CopyData = data;

    if(this.CopyData.all_huddles && this.CopyData.all_huddles.length>0){
      this.onSearchHuddleChange("");
    }

    if(this.CopyData.all_accounts && this.CopyData.all_accounts.length>0){
      this.onSearchAccountChange("");
    }



  })

}

public onSearchHuddleChange(newVal){

  if(this.CopyData.searchHuddleText=='' || !this.CopyData.searchHuddleText){

    this.CopyData.all_huddles.forEach((h)=>{

    h.valid = true;

  });

    return;

  }

  this.CopyData.all_huddles.forEach((h)=>{

    h.valid = h.name.toLowerCase().indexOf(this.CopyData.searchHuddleText.toLowerCase()) > -1;

  });

  this.UpdateMatches();
}

private UpdateMatches(){
  
  this.CopyData.huddles_matched = _.where(this.CopyData.all_huddles, {valid: true}).length;
  this.CopyData.accounts_matched = _.where(this.CopyData.all_accounts, {valid: true}).length;

}

public onSearchAccountChange(newVal){

  if(this.CopyData.searchAccountText=='' || !this.CopyData.searchAccountText){

    this.CopyData.all_accounts.forEach((ac)=>{

    ac.valid = true;

  });

    return;

  }

  this.CopyData.all_accounts.forEach((ac)=>{

    ac.valid = ac.company_name.toLowerCase().indexOf(this.CopyData.searchAccountText.toLowerCase()) > -1;;

  });
  this.UpdateMatches();
}

public ResolveDeleteVideo(flag){
  if(flag==0){
    this.modalRef.hide();
  }else{
    this.modalRef.hide();
    this.DeleteVideo();
  }

}

public InitiateDeleteVideo(template: TemplateRef<any>){

  this.modalRef = this.modalService.show(template, {class:"modal-md"});

}

public DeleteVideo(){

  let sessionData:any = this.headerService.getStaticHeaderData();

  let obj = {

    huddle_id: this.params.huddle_id,
    video_id: this.params.video_id,
    user_id: sessionData.user_current_account.User.id

  }

  this.mainService.DeleteVideo(obj).subscribe((data:any)=>{

    if(data.sucess){

      this.toastr.info(this.translation.vd_videos_has_been_deleted);

      setTimeout(()=>{

        let path = environment.baseUrl+"/Huddles/view/"+this.params.huddle_id;

        location.href = path;

      }, 2000);

    }else{

      this.toastr.info(data.message);

    }

  });

}

public CaptureTotalTime(VideoTotalTime){
  // console.log("VTT:"+ VideoTotalTime);
     if(this.captureCount == 0)
     {
         let videoStart = 0;
         let videoEnd = Math.floor(this.VideoTotalTime) || Math.floor(VideoTotalTime);
         this.videoEnd = videoEnd; 
         let that = this;
         this.cropRangeSliderConfig.range.min = videoStart;
         this.previousStart = videoStart;
         this.cropRangeSliderConfig.range.max = videoEnd;

         this.previousEnd = videoEnd;
         this.cropRange = [videoStart,videoEnd];
         this.convertValuesToTime([videoStart,videoEnd],0);
         this.convertValuesToTime([videoStart,videoEnd],1);
         this.videoEnd = this.cropEndValue;
         setTimeout(()=>{
             that.IsCropPlayerReady = true;
         }, 1000);

     }
     this.captureCount++;
 }

 public onCropSliderChange(ev)
  {
      let handle = 0;
      if(this.previousEnd != ev[1])
      {
          handle = 1;
      }
      if(handle == 0)
      {
          this.cropPlayerService.SeekTo(ev[0],0);
      }
      else
      {
          this.cropPlayerService.SeekTo(ev[1],0);
      }
      this.convertValuesToTime(ev,handle);
      this.previousStart = ev[0];
      this.previousEnd = ev[1];
  }

  convertValuesToTime(values,handle){
    let hours = 0,
        minutes = 0,
        seconds = 0;

    if(handle === 0){
        hours = this.convertToHour(values[0]);
        minutes = this.convertToMinute(values[0],hours);
        seconds = this.convertToSecond(values[0],minutes,hours);
        this.cropStartValue = this.formatHoursAndMinutes(hours,minutes,seconds);
        return;
    }

    hours = this.convertToHour(values[1]);
    minutes = this.convertToMinute(values[1],hours);
    seconds = this.convertToSecond(values[1],minutes,hours);
    this.cropEndValue =  this.formatHoursAndMinutes(hours,minutes,seconds);

}
convertToHour(value){
  return Math.floor(value / 3600);
}
convertToMinute(value,hour){
  return (Math.floor(value / 60) - (hour * 60));
}
convertToSecond(value,minute,hour){
  return (value - (minute * 60) - (hour * 3600));
}
formatHoursAndMinutes(hours,minutes,seconds){
  if(hours.toString().length == 1) hours = '0' + hours;
  if(minutes.toString().length == 1) minutes = '0' + minutes;
  if(seconds.toString().length == 1) seconds = '0' + seconds;
  if(hours == '00' || hours == 0)
  {
      return minutes +':'+ seconds;
  }
  else
  {
      return hours+':'+minutes+':'+Math.floor(seconds);
  }
}

public ResolveCopyVideo(flag){

  if(flag==0){

    if(this.CopyData.all_huddles){

      this.CopyData.all_huddles.forEach((h)=>{h.selected = false;})
    }

    if(this.CopyData.all_accounts){

      this.CopyData.all_accounts.forEach((ac)=>{ac.selected = false;})
    }

    this.CopyData.LibrarySelected = false;

    this.modalRef.hide();


  }else{

    let selectedAccounts = _.where(this.CopyData.all_accounts, {selected:true});

    let selectedHuddles = _.where(this.CopyData.all_huddles, {selected:true});

    if((selectedHuddles && selectedHuddles.length>0) || this.CopyData.LibrarySelected){

      let ids = selectedHuddles.map((ac)=>{ return ac.account_folder_id; });

      let sessionData:any = this.headerService.getStaticHeaderData();

      if(this.CopyData.LibrarySelected) { ids.push("-1") }

      let obj = {

        document_id: this.params.video_id,
        account_folder_id: ids,
        current_huddle_id: this.params.huddle_id,
        account_id: sessionData.user_current_account.accounts.account_id,
        user_id: sessionData.user_current_account.User.id,
        copy_notes: this.CopyData.CopyComments?1:0

      }

      this.mainService.CopyToHuddlesAndLib(obj).subscribe((data:any)=>{

        {

          this.toastr.info(data.message);

        }

      });

    }

    if(selectedAccounts && selectedAccounts.length>0){

      let ids = selectedAccounts.map((ac)=>{ return ac.account_id; });

      let sessionData:any = this.headerService.getStaticHeaderData();

      let obj = {

        account_ids: ids,
        document_id: this.params.video_id,
        user_id: sessionData.user_current_account.User.id,
        copy_notes: this.CopyData.CopyComments?1:0

      }
      this.modalRef.hide();
      this.mainService.CopyToAccounts(obj).subscribe((data:any)=>{

        {

          this.toastr.info(data.message);

        }

      });

    }

    if(selectedAccounts.length == 0 && selectedHuddles.length == 0 && !this.CopyData.LibrarySelected){
      this.toastr.info(this.translation.vd_select_huddle_to_copy);
    }

    this.ResolveCopyVideo(0);
  }

}

public hideCropModal()
{
    (document.querySelector('bs-modal-backdrop') as HTMLElement).style.display = "none";
    (document.querySelector('modal-container') as HTMLElement).style.display = "none";
    (document.querySelector('body') as HTMLElement).style.overflow = "visible";

}
public TrimVideo()
{
    // console.log("Trimming...");
    if(this.cropRange[0] == this.cropRange[1])
    {
        //console.log(this.translation);
        alert(this.translation.please_select_range);
    }
    else
    {
    this.mainService.TrimVideo(this.params.video_id,this.params.huddle_id,{startVideo:parseFloat(this.cropRange[0]+".00").toFixed(2),endVideo:parseFloat(this.cropRange[1]+".00").toFixed(2)}).subscribe((data:any)=>{
        // console.log(data);
         let path:any;// = location.pathname;
        // path = path.split('/');
        // let huddle = path[path.length - 2];
          // next thre lne for new trim rule iplementting
  let sessionData: any = this.headerService.getStaticHeaderData();
  let user_id= sessionData.user_current_account.User.id;
    this.headerService.afterHuddleTrim(this.params.video_id,data["document"].doc_id, parseFloat(this.cropRange[0] + ".00").toFixed(2),parseFloat(this.cropRange[1] + ".00").toFixed(2),user_id,this.params.huddle_id).subscribe(data=>{
      // console.log('after workspace trim',data)
      debugger;
      path = environment.baseUrl+"/Huddles/view/"+this.params.huddle_id;
      console.log(path);
      location.href = path;
    })

       
    });
  }
}
public CropPreviewVideo()
  {
      this.cropPlayerService.ModifyPlayingState(["play",this.cropRange[0],this.cropRange[1]]);
  }
}
