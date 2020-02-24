import { Component, OnInit, Input, EventEmitter, Output, TemplateRef, OnChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { environment } from "@environments/environment";
import { PlayerService, MainService, ScrollService } from "@videoPage/services";
import * as _ from "underscore";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
// import { MainService } from "../services/main.service";
import { HeaderService, AppMainService } from "@app/services";
import { ToastrService } from "ngx-toastr";
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmpty } from '@src/project-modules/app/helpers';
// import { ScrollService } from '../services/scroll.service';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';

@Component({
  selector: 'comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ]
    )
  ]
})
export class CommentComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('audioPlayer', {static: false}) audioPlayer: ElementRef;
  @Input('fromLiveStream') fromLiveStream: boolean;
  @Input('comment') comment;
  @Input('customMarkers') customMarkers;
  @Input('classes') classes;
  @Input('isActive') isActive;
  @Input() settings;
  @Input() showCrudOptions=true;
  @Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() onReplyEdit: EventEmitter<any> = new EventEmitter<any>();
  // @Output() onAdd: EventEmitter<any> = new EventEmitter<any>();
  @Input() params;
  @Input() staticFiles;
  @Input() from;
  @Input() permissions;
  @Input() index;
  @Input() VideoInfo;
  public modalRef: BsModalRef;
  private deletableComment;
  public currentUser;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;
  public fromScriptedOvservations: boolean = false;
  Reply_tryagain: boolean=false;
  minusIds: any = -1;
  localReplyArry: any = [];
  SubReply_tryagain: boolean;
  localsubReplyArry: any = [];
  private VIDEO_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.VIDEO;
  public addReplyLSKey: string = '';
  public addSubReplyLSKey: string = '';

  constructor(
    public scrollService: ScrollService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private headerService: HeaderService,
    private mainService: MainService,
    private playerService: PlayerService,
    private modalService: BsModalService,
    private router:Router,
    private appMainService: AppMainService) {

    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });

    this.activatedRoute.url.subscribe((url) => {
      if (url && url[0] && url[0].path == "scripted_observations") {
        this.fromScriptedOvservations = true;
      }
    });

  }

  ngOnInit() {

    let sessionData: any = this.headerService.getStaticHeaderData();
    this.currentUser = sessionData.user_current_account.User;
    this.currentUser.role_id = sessionData.user_current_account.roles.role_id;

    // Dynamic Button Colors Start
    this.header_color = sessionData.header_color;
    this.primery_button_color = sessionData.primery_button_color;
    this.secondry_button_color = sessionData.secondry_button_color;
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream
    // Dynamic Button Colors End

    // prepare localstorage keys
    this.addReplyLSKey = `${this.VIDEO_LS_KEYS.REPLY}${this.comment.id}_${this.headerService.getUserId()}`;
    this.addSubReplyLSKey = `${this.VIDEO_LS_KEYS.SUB_REPLY}${this.comment.id}_${this.headerService.getUserId()}`;

    this.comment.replyText = localStorage.getItem(this.addReplyLSKey);
    if(this.comment.Comment && this.comment.Comment.responses!=undefined){
      this.comment.Comment.responses.forEach(x => {
        if(localStorage.getItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_comment_'+x.id)!=null){
          x.replyText = localStorage.getItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_comment_'+x.id);
        }
      });
    }


    let localsData = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_reply_comment_video_'+this.params.video_id)
    if(localsData!=null && localsData!=undefined){
      let data  = JSON.parse(localsData)
      if(data){
      data.forEach(x => {
          if(x && this.comment.id==x.parent_id){
            this.Reply_tryagain = true;
            this.comment.Comment.responses.push(x);
          }
      });}
    }
    let localsubrData = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_sub_reply_comment_video_'+this.params.video_id)
    if (localsubrData != null && localsubrData != undefined) {
      let sdata = JSON.parse(localsubrData)
      if(sdata && Array.isArray(sdata)){
      sdata.forEach(x => {
        this.comment.Comment.responses.forEach(p => {
          if (p.id == x.parent_id) {
            x.tryagain = true;
            p.responses.push(x);
          }
        });
      });}
    }
    let localEditReplydata = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_edit_reply_comment_video_'+this.params.video_id)
    if (localEditReplydata != null && localEditReplydata != undefined) {
      let sdata = JSON.parse(localEditReplydata)
      if(sdata){
      sdata.forEach(x => {
        if(this.comment.Comment.responses){
          this.comment.Comment.responses.forEach((o,i) => {
            o.id == x.id ? this.comment.Comment.responses[i] = x : this.comment.Comment.responses[i]=this.comment.Comment.responses[i];
          });
        }
      });}
    }
    let localEditSubReplydata = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_edit_sub_reply_comment_video_'+this.params.video_id)
    if (localEditSubReplydata != null && localEditSubReplydata != undefined) {
      let sdata = JSON.parse(localEditSubReplydata)
      if(sdata){
      sdata.forEach(x => {
      if(this.comment.Comment.responses){
        this.comment.Comment.responses.forEach((o,i) => {
          o.responses.forEach((r,ii) => {
            if(r.id==x.id){
              this.comment.Comment.responses[i].responses[ii] = x
            }
          });
        });
      }
      });}
    }

    if(this.comment.ref_type == 6) {
      this.checkIfAduioCommentIsPlayable(this.comment.comment);
    }
    
  }
  GetReplyText(){
        //Reply Refresh Text Save Start
        if (this.comment.Comment.responses != undefined) {
          this.comment.Comment.responses.forEach(reply => {
            if (localStorage.getItem(this.header_data.user_current_account.User.id + '_video_play_reply_edit_' + reply.id) != null && localStorage.getItem(this.header_data.user_current_account.User.id + '_video_play_reply_edit_' + reply.id) != undefined) {
              reply.EditableText = localStorage.getItem(this.header_data.user_current_account.User.id + '_video_play_reply_edit_' + reply.id);
            } else {
              reply.EditableText = reply.comment;
            }
          });
        }
        //Reply Refresh Text Save End
  }
  GetSubReplyText(){
        //Sub-Reply Refresh Text Save Start
        if(this.comment.Comment.responses!=undefined){
          this.comment.Comment.responses.forEach(x => {
           if(x.responses){
            x.responses.forEach(sub_reply => {
              if(localStorage.getItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_edit_'+sub_reply.id)!=null && localStorage.getItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_edit_'+sub_reply.id)!=undefined){
                sub_reply.EditableText = localStorage.getItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_edit_'+sub_reply.id);
              }else{
                sub_reply.EditableText=sub_reply.comment;
              }
            });
           }
          });
        }
        //Sub-Reply Refresh Text Save End
  }
  ngOnChanges(change) {
    if (change.comment && change.comment.firstChange) {
      if (this.staticFiles) {
        this.AttachFilesToComment(this.comment, true);
      }
    }
  }

  public initiateDelete(template: TemplateRef<any>, comment, parent?) {
    this.deletableComment = comment;
    this.modalRef = this.modalService.show(template, { class: "modal-md" });
  }

  public getCustomTagsLength(default_tags) {

    let matched = _.where(default_tags, { ref_type: 1 });
    if (matched) return matched.length;
    return false;
  }

  public getUserImgUrl(comment) {


    if (comment.image && comment.image.length > 0) {

      let img = comment.image;

      return "https://s3.amazonaws.com/sibme.com/static/users/" + comment.user_id + "/" + img;

    }

    return environment.baseUrl + "/img/home/photo-default.png";



  }

  public ReplyTextChanged(ev, comment) {

    if (ev.keyCode == 13 && this.settings.EnterToPost) {

      ev.preventDefault();

      this.AddReply(comment);

    }

  }

  public SubReplyTextChanged(ev, comment, reply) {

    if (ev.keyCode == 13 && this.settings.EnterToPost) {

      ev.preventDefault();

      this.SubmitSubReply(comment, reply);

    }

  }

  public AttachFilesToComment(comment, is_internal?) {

    if (!comment.isExpnded && !is_internal) return;

    if (((typeof (comment.time) == "number" && comment.time == 0) || comment.time == "0") && !comment.is_new_comment) {

      comment.files = [];
      return;

    }

    comment.files = [];

    if (comment.is_new_comment) {
      comment.files = this.staticFiles.filter(file => file.comment_id == comment.id);
      return;
    }

    if (this.staticFiles && this.staticFiles.length > 0)
      this.staticFiles.forEach((file) => {

        if (!file) return;

        file.time2 = file.time == "All Video" ? 0 : this.FormatToSeconds(file.time);

        comment.time2 = this.FormatToSeconds(comment.time);
        if (comment.time2 == file.time2) {

          comment.files.push(file);

        }

      })


    // if(this.WhetherScrollOrNot("#comment_"+this.index) && (comment.default_tags.length>0 || comment.files.length>0 || comment.standard.length >0)){

    //   this.scrollService.scrollTo("#slimscroll","#comment_"+this.index);

    // }

  }

  private WhetherScrollOrNot(elementId) {

    let parentDiv = (<HTMLElement>document.querySelector("#slimscroll"));

    if (!parentDiv) return;

    let scrollerHeightInPx = parentDiv.style.height;

    let scrollHeight = Number(scrollerHeightInPx.substring(0, scrollerHeightInPx.indexOf("px")));

    let elementScroll = (document.querySelector(elementId)).offsetTop;

    return elementScroll + 185 > scrollHeight;

  }

  private FormatToSeconds(time) {

    if (time == 0 || !time) return 0;
    if (typeof (time) == "number") return time;
    let stamp = time.split(":");

    return Number(stamp[0] * 3600) + Number(stamp[1] * 60) + Number(stamp[2]);

  }

  public retryEditComment(comment: any){
    if(comment.processing) return;

    comment.processing = true;

    let obj = {
      huddle_id:this.comment.huddle_id,
      account_id:this.comment.account_id,
      comment_id: this.comment.id,
      videoId: this.comment.videoId,
      for:  this.comment.for,
      // synchro_time: this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:'',
      // time:  this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:0,
      synchro_time: this.comment.synchro_time,//Math.floor(this.currentTimeInSeconds):'',
      time: this.comment.time, //Math.floor(this.currentTimeInSeconds):0,
      end_time: this.comment.end_time,
      ref_type: this.comment.ref_type,
      comment: this.comment.comment,
      audio_duration: this.comment.audioDuration,
      user_id: this.comment.user_id,
      standards_acc_tags : this.comment.standards_acc_tags,
      default_tags: this.comment.default_tags,
      assessment_value: this.comment.assessment_value,
      account_role_id: this.comment.account_role_id,
      current_user_email: this.comment.current_user_email,
      changed_standards: this.comment.changed_standards,
      changed_custom_markers: this.comment.changed_custom_markers
 };
 this.appMainService.EditComment(obj).subscribe((data:any)=>{

      if(data.status=="success"){

        
        let localCdata = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_edit_comment_video_'+this.params.video_id)
        if (localCdata != null && localCdata != undefined) {
          let sdata = JSON.parse(localCdata)
          if(sdata){
          sdata.forEach((x,i) => {
            if(this.comment.id == x.id)
            {
              let filesArray = JSON.parse(JSON.stringify(x.filesArray));
              if(filesArray.length > 0){
                const returnedObj = { filesArray: filesArray,time: this.comment.time, id: this.comment.id };
                this.mainService.updateAddFilesToEditLS(returnedObj);
              }
              sdata.splice(i,1)
            }
          });
        }
          localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_edit_comment_video_'+this.params.video_id,JSON.stringify(sdata))
        }
          // this.comment = data.updated_comment;
          // this.comment.valid = true;
          // this.mainService.ReRenderMarkers.emit(true);


      }else{
        this.toastr.info(this.translation.something_went_wrong_msg);
        comment.processing = false;
      }

    }, error => comment.processing = false);
  }

  public AddReply(comment,reply?, replyindex?) {
    if (!comment.replyText || comment.replyText == "") {
      this.toastr.info(this.translation.vd_alert_please_add_text);
      return;
    }
    let sessionData: any = this.headerService.getStaticHeaderData();
    let obj = {
      parent_id: comment.id,
      account_id: sessionData.user_current_account.accounts.account_id,
      comment: comment.replyText,
      access_level: "nested",
      huddle_id: this.params.huddle_id,
      user_id: sessionData.user_current_account.User.id,
      first_name: sessionData.user_current_account.User.first_name,
      last_name: sessionData.user_current_account.User.last_name,
      company_name: sessionData.user_current_account.accounts.company_name,
      image: sessionData.user_current_account.User.image,
      uuid: `${new Date().getTime()}-${this.params.video_id}`,
      fakeComment: true
    }

    comment.replyEnabled = false;
    comment.replyAdding = true;
    comment.replyText = "";
    if (!comment.Comment) comment.Comment = {};
    if (!comment.Comment.responses) comment.Comment.responses = [];
    comment.Comment.responses.push(obj);
    localStorage.removeItem(this.addReplyLSKey);

    // this.onAdd.emit(true);

    this.appMainService.AddReply(obj).subscribe((data: any) => {
    localStorage.removeItem('video_reply_'+comment.id+'_'+this.header_data.user_current_account.User.id)
        
      let lsData = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_reply_comment_video_'+this.params.video_id);
      let dddata = JSON.parse(lsData);
      if(dddata){
      dddata.forEach((x,ii) => {
        if(x.id == reply.id){
          dddata.splice(ii,1)
        }
      });}
      localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_reply_comment_video_'+this.params.video_id,JSON.stringify(dddata)) 
        
    },(err)=>{
      localStorage.removeItem('video_reply_'+comment.id+'_'+this.header_data.user_current_account.User.id)
      comment.replyText = '';
      let localdata:any = obj;
      localdata.id = this.minusIds-1;
      localdata.tryagain=true;
      this.localReplyArry.push(localdata);
      localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_reply_comment_video_'+this.params.video_id,JSON.stringify(this.localReplyArry));
      // if(!comment.Comment) comment.Comment = {};
      // if(!comment.Comment.responses) comment.Comment.responses = [];
      // comment.Comment.responses.push(localdata);
    });
  }
  public ReAddReply(comment,reply?, replyindex?) {
    if(reply.processing) return;

    reply.processing = true;
    reply.tryagain = false;
    if (!comment.replyText || comment.replyText == "") {
      this.toastr.info(this.translation.vd_alert_please_add_text);
      return;
    }
    let sessionData: any = this.headerService.getStaticHeaderData();
    let obj = {
      parent_id: comment.id,
      account_id: sessionData.user_current_account.accounts.account_id,
      comment: comment.replyText,
      access_level: "nested",
      huddle_id: this.params.huddle_id,
      user_id: sessionData.user_current_account.User.id,
      first_name: sessionData.user_current_account.User.first_name,
      last_name: sessionData.user_current_account.User.last_name,
      company_name: sessionData.user_current_account.accounts.company_name,
      image: sessionData.user_current_account.User.image,
      uuid: reply.uuid
    }
    comment.replyEnabled = false;
    comment.replyAdding = true;

    this.appMainService.AddReply(obj).subscribe((data: any) => {

     if(data.status=="failed"){
        this.toastr.error(data.message);
        this.router.navigate(['/'])
      }

      comment.replyAdding = false;
      comment.replyText = "";
      this.comment.replyText = '';
      // reply.tryagain=false;
      // this.comment.Comment.responses.splice(replyindex,1);
      localStorage.removeItem('video_reply_'+comment.id+'_'+this.header_data.user_current_account.User.id);
      let lsData = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_reply_comment_video_'+this.params.video_id);
      let dddata = JSON.parse(lsData);
     if(dddata){
      dddata.forEach((x,ii) => {
        if(x.id == reply.id){
          dddata.splice(ii,1)
        }
      });
     }
      localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_reply_comment_video_'+this.params.video_id,JSON.stringify(dddata)) 
      localStorage.removeItem(this.addReplyLSKey)
      // this.onAdd.emit(true);
      reply.processing = false;
    },(err)=>{
      reply.processing = false;
      reply.tryagain = true;
    });
  }
  retryComment(comment: any){
    if(comment.processing) return;

    comment.processing = true;
    comment.tryagain = false;

    let sessionData:any = this.headerService.getStaticHeaderData();
    let user_id = sessionData.user_current_account.User.id;
    let obj = {
      videoId: this.params.video_id,
      for:  "",
      synchro_time: this.comment.synchro_time,
      assessment_value: this.comment.assessment_value_text,
      time: this.comment.time,
      end_time: comment.end_time,
      ref_type: comment.ref_type,
      comment: this.comment.comment,
      audio_duration: comment.audioDuration,
      user_id: user_id,
      standards_acc_tags: this.PrepareRubrics(this.comment.standard),
      // default_tags: this.comment.default_tags[0] && this.comment.default_tags[0]!=={} && this.comment.default_tags[0]!==null && this.comment.default_tags[0]!==undefined ? this.comment.default_tags : '',
      default_tags: this.comment.default_tags_value || '',
      fake_id: this.comment.fake_id,
      first_name: sessionData.user_current_account.User.first_name,
      last_name: sessionData.user_current_account.User.last_name,
      company_name: sessionData.user_current_account.accounts.company_name,
      image: sessionData.user_current_account.User.image,
      account_role_id: sessionData.user_current_account.users_accounts.role_id,
      current_user_email: sessionData.user_current_account.User.email
    };
    this.appMainService.AddComment(obj).subscribe((data: any) => {
      if (data.status == "success") {
        let retComment = data["0"];
        retComment.valid = true;
        const returnedObj = { updatedComment: retComment, oldCommentuuid: comment.uuid };
        this.mainService.updateCommentTryAgain(returnedObj);

        // this.comment = data["0"];
        // this.comment.valid=true;
        // this.comment.tryagain = false;

        //   setTimeout(()=>{this.AttachFilesToComment(this.comment);}, 1000);
        //   this.mainService.CommentAddedNotification.emit(comment);

      }else {
        comment.processing = false;
        comment.tryagain = true;
      }
    }, error => {
      comment.processing = false;
      comment.tryagain = true;
    });
  }

  SubmitSubReply(comment, reply, ind?, sub_reply?, fakeComment: boolean = false) {

    if(fakeComment){
      if(sub_reply.processing) return;
      
      sub_reply.processing = true;
      sub_reply.tryagain = false;
    }
    
    if (!reply || reply.replyText == "" || !reply.replyText) {

      this.toastr.info(this.translation.vd_alert_plesae_enter_text);
      return;
    }

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {
      parent_id: reply.id,
      account_id: sessionData.user_current_account.accounts.account_id,
      comment: reply.replyText,
      access_level: "nested",
      huddle_id: this.params.huddle_id,
      user_id: sessionData.user_current_account.User.id,
      first_name: sessionData.user_current_account.User.first_name,
      last_name: sessionData.user_current_account.User.last_name,
      company_name: sessionData.user_current_account.accounts.company_name,
      image: sessionData.user_current_account.User.image,
      uuid: (sub_reply && sub_reply.uuid) ? sub_reply.uuid : `${new Date().getTime()}-${this.params.video_id}`,
      fakeComment: true
    };

    if (!reply.responses) reply.responses = [];
    if(!fakeComment) reply.responses.push(obj);

    reply.replyEnabled = false;
    reply.replyText = "";

    localStorage.removeItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_comment_'+reply.id);
    this.appMainService.AddReply(obj).subscribe((data: any) => {

      // reply.replyText = "";
      // if(!reply.responses) reply.responses = [];
      // this.onAdd.emit(true);
      // console.log('Reply Responses',reply.responses)
      // for (let ii = 0; ii < this.comment.Comment.responses.length; ii++) {
      //   this.comment.Comment.responses[ii].responses.splice(ind,1) 
      // }
      let lsData = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_sub_reply_comment_video_'+this.params.video_id);
      let dddata = JSON.parse(lsData);
      if(dddata){
      dddata.forEach((x,ii) => {
        if(x.id == sub_reply.id){
          dddata.splice(ii,1)
        }
      });}
      localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_sub_reply_comment_video_'+this.params.video_id,JSON.stringify(dddata)) 
      if(sub_reply) {
        sub_reply.processing = false;
        sub_reply.tryagain = true;
      }
    },(err)=>{
      if(fakeComment){
        sub_reply.processing = false;
        sub_reply.tryagain = true;
      } else {
        let localdata:any = obj;
        localdata.id = this.minusIds-1;
        localdata.tryagain = true;
        // obj['tryagain'] = true;
        this.localsubReplyArry.push(localdata);
        if(ind!=null && ind!=undefined){
          reply.responses[ind] = localdata;
        }else{
        localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_sub_reply_comment_video_'+this.params.video_id,JSON.stringify(this.localsubReplyArry));
        if(reply.responses==undefined){
          reply.responses = [];
        }
        // reply.responses.push(localdata);        
        }
        // reply.replyText='';
        localStorage.removeItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_comment_'+reply.id)
      }
    });
  }
  ReSubmitSubReply(reply,ind, sub_reply) {
    if(sub_reply.processing) return;

    sub_reply.processing = true;
    if (!reply || reply.replyText == "" || !reply.replyText) {

      this.toastr.info(this.translation.vd_alert_plesae_enter_text);
      return;
    }

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {
      parent_id: reply.id,
      account_id: sessionData.user_current_account.accounts.account_id,
      comment: reply.replyText,
      access_level: "nested",
      huddle_id: this.params.huddle_id,
      user_id: sessionData.user_current_account.User.id,
      first_name: sessionData.user_current_account.User.first_name,
      last_name: sessionData.user_current_account.User.last_name,
      company_name: sessionData.user_current_account.accounts.company_name,
      image: sessionData.user_current_account.User.image
    };

    reply.replyEnabled = false;
    localStorage.removeItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_comment_'+reply.id);
    
    this.appMainService.AddReply(obj).subscribe((data: any) => {
      if(data.status=="failed"){sub_reply.processing = false}
      // reply.replyText = "";
      // if(!reply.responses) reply.responses = [];
      // this.onAdd.emit(true);
      console.log('Reply Responses',reply.responses)
      for (let ii = 0; ii < this.comment.Comment.responses.length; ii++) {
        if(sub_reply.tryagain){
          this.comment.Comment.responses[ii].responses.splice(ind,1) 
        }
      }
      let lsData = localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_sub_reply_comment_video_'+this.params.video_id);
      let dddata = JSON.parse(lsData);
      if(dddata){
      dddata.forEach((x,ii) => {
        if(x.id == sub_reply.id){
          dddata.splice(ii,1)
        }
      });}
      localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_sub_reply_comment_video_'+this.params.video_id,JSON.stringify(dddata)) 
    },(err)=>sub_reply.processing = false);
  }
  retrySubComment(obj,reply){
    this.appMainService.AddReply(obj).subscribe((data: any) => {
      reply.replyText = "";
      localStorage.removeItem(this.header_data.user_current_account.User.id+'_video_play_sub_reply_comment_'+reply.id);
      // if(!reply.responses) reply.responses = [];
      // this.onAdd.emit(true);
      // if(!reply.Comment.responses) reply.Comment.responses = [];
      // reply.responses.push(data.latest_reply_added);

    });
  }

  public editComment(comment) {
    this.headerService.hideTabRecordIcon(true);
    this.onEdit.emit(comment);

  }

  public ResolveDelete(flag) {

    this.modalRef.hide();
    if (flag == 1) {

      this.onDelete.emit(this.deletableComment);

    }
  }

  public Seek(comment) {

    if (!this.from)
      this.playerService.SeekTo({time:comment.time,end_time:comment.end_time});

  }

  public getFormattedTime(time, end_time) {

    if (time <= 0 || time == null) return this.translation.vd_all_videos;
    let formattedTime = '';
    let sec_num: any = parseInt(time, 10);
    let hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: any = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    formattedTime += hours + ':' + minutes + ':' + seconds;

    if(end_time && end_time > 0 && end_time != time) {
      let sec_num: any = parseInt(end_time, 10);
      let hours: any = Math.floor(sec_num / 3600);
      let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
      let seconds: any = sec_num - (hours * 3600) - (minutes * 60);

      if (hours < 10) { hours = "0" + hours; }
      if (minutes < 10) { minutes = "0" + minutes; }
      if (seconds < 10) { seconds = "0" + seconds; }
      formattedTime += ' - ' + hours + ':' + minutes + ':' + seconds;
    }
    
    return formattedTime;

  }

  public UpdateReply(comment, reply) {

    if (!reply.EditableText) {

      this.toastr.info(this.translation.vd_alert_please_add_text);

    }
    this.onReplyEdit.emit({ comment: comment, reply: reply });

  }

  public AllowTags(default_tags) {

    return default_tags.filter((dt) => { return dt.ref_type != 2; }).length > 0;

  }

  public Urlify(text) {

    if(text){
      let urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
      return text.replace(urlRegex, function (url) {
        let add_protocole = false;
        if (!/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig.test(url)) {
          add_protocole = true;
        }
        return add_protocole ? '<a href="' + "//" + url + '" target="_blank">' + url + '</a>' : '<a href="' + url + '" target="_blank">' + url + '</a>';
      })
    }else {
      return '';
    } 

  }

  public getTimelineBg(comment) {

    if (Array.isArray(comment.default_tags)) {

      let ret = "transparent";

      comment.default_tags.forEach((dt) => {

        if (dt) {
          let index = _.findIndex(this.customMarkers, { account_tag_id: dt.account_tag_id });

          if (index > -1) {
            ret = this.classes[index];
          }
        }


      });

      return ret;

    } else {
      return "transparent";
    }

  }

  public FileClicked(file){

    if(file.stack_url && file.stack_url != null){

      let path = environment.baseUrl+"/app/view_document"+ file.stack_url.substring(file.stack_url.lastIndexOf("/"), file.stack_url.length);
      window.open(path, "_blank");

    }
  }

  private PrepareRubrics(standads){

  	if(!standads || standads.length==0) return "";

  	let ret = [];
    if(standads)
  	standads.forEach((r)=>{ ret.push(r.account_tag_id); });

  	return ret.join(",");
  }

  private checkIfAduioCommentIsPlayable(commentText: string) {
    let extensionExisted = this.appMainService.playableAudioExtensions.find(plExt => {
      let returnedRes = false;
      if(commentText.indexOf(`.${plExt}`) > -1) returnedRes = true;
      return returnedRes;
    });
    if(extensionExisted) {
      this.comment.playable = true;

      setTimeout(() => {
        if(this.audioPlayer) this.audioPlayer.nativeElement.load();
      }, 500);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.modalRef) this.modalRef.hide();
  }

}
