import { Component, OnInit, Input, EventEmitter, Output, TemplateRef, OnChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { environment } from "@environments/environment";
import * as _ from "underscore";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ToastrService } from "ngx-toastr";
import { trigger, style, animate, transition } from '@angular/animations';
import { HeaderService, AppMainService } from "@app/services";
import { ScrollService, MainService, PlayerService } from '../../services';
import { Subscription } from 'rxjs';
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
  @Input('comment') comment;
  @Input('customMarkers') customMarkers;
  @Input('classes') classes;
  @Input('isActive') isActive;
  @Input() settings;
  @Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() onReplyEdit: EventEmitter<any> = new EventEmitter<any>();
  // @Output() onAdd: EventEmitter<any> = new EventEmitter<any>();
  @Input() params;
  @Input() staticFiles;
  @Input() from;
  @Input() pltab: boolean = false;
  @Input() permissions;
  @Input() index;
  @Input() VideoInfo;
  @Input() EditMode;
  @Input() parent;
  public modalRef: BsModalRef;
  private deletableComment;
  public currentUser;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  public header_data;
  public translation: any = {};
  private subscriptions: Subscription = new Subscription();
  public userAccountLevelRoleId: number | string = null;
  public fromVideoOvservations: boolean = false;
  private WORKSPACE_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.WORKSPACE;
  private lsReplyArray = [];
  private lsSubReplyArray = [];
  public addReplyLSKey: string = '';

  constructor(
    public scrollService: ScrollService, 
    private toastr: ToastrService, 
    private headerService: HeaderService, 
    private mainService: MainService, 
    private playerService: PlayerService, 
    private modalService: BsModalService,
    private appMainService: AppMainService) {
    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    }));

  }

  ngOnInit() {

    let sessionData: any = this.headerService.getStaticHeaderData();
    this.currentUser = sessionData.user_current_account.User;
    this.currentUser.role_id = sessionData.user_current_account.roles.role_id;

    // Dynamic Button Colors Start
    this.header_color = sessionData.header_color;
    this.primery_button_color = sessionData.primery_button_color;
    this.secondry_button_color = sessionData.secondry_button_color;
    // Dynamic Button Colors End


    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream

    // prepare localstorage keys
    this.addReplyLSKey = `${this.WORKSPACE_LS_KEYS.REPLY}${this.comment.id}_${this.headerService.getUserId()}`;

    this.comment.replyText = localStorage.getItem(this.addReplyLSKey);
    if (this.comment.Comment && this.comment.Comment.responses) {
      this.comment.Comment.responses.forEach(x => {
        if (localStorage.getItem(this.header_data.user_current_account.User.id+'_workspace_video_play_sub_reply_comment_' + x.id) != null) {
          x.replyText = localStorage.getItem(this.header_data.user_current_account.User.id+'_workspace_video_play_sub_reply_comment_' + x.id);
        }
        if (localStorage.getItem('workspace_video_play_reply_edit_comment_' + x.id + '_' + this.headerService.getUserId() ) != null) {
          x.EditableText = localStorage.getItem('workspace_video_play_reply_edit_comment_' + x.id + '_' + this.headerService.getUserId() );
        } else {
          x.EditableText = x.comment;
        }
      });
    }


    let tmpLSReplyArray = localStorage.getItem(`${this.WORKSPACE_LS_KEYS.VIDEO_REPLY_TA}${this.params.video_id}` + '_' + this.headerService.getUserId() );
    if (tmpLSReplyArray && tmpLSReplyArray !== 'undefined' && tmpLSReplyArray !== 'null') {
      this.lsReplyArray = JSON.parse(tmpLSReplyArray);
      if(this.lsReplyArray){
      this.lsReplyArray.forEach(reply => {
        if (reply && reply.parent_id == this.comment.id) {
          if (!this.comment.Comment) this.comment.Comment = {};
          if (!this.comment.Comment.responses) this.comment.Comment.responses = [];
          this.comment.Comment.responses.push(reply);
        }
      });
    }
    }




    let localEditReplydata = localStorage.getItem('workspace_video_edit_reply_'+this.params.video_id + '_' + this.headerService.getUserId() )
    if (localEditReplydata != null && localEditReplydata != undefined) {
      let sdata = JSON.parse(localEditReplydata)
      if(sdata){
      sdata.forEach(x => {
        this.comment.Comment.responses.forEach((o,i) => {
          o.id == x.id ? this.comment.Comment.responses[i] = x : this.comment.Comment.responses[i]=this.comment.Comment.responses[i];
        });
      });
     }
    }
    let localEditSubReplydata = localStorage.getItem('workspace_video_edit_sub_reply_'+this.params.video_id + '_' + this.headerService.getUserId() )
    if (localEditSubReplydata != null && localEditSubReplydata != undefined) {
      let sdata = JSON.parse(localEditSubReplydata)
      if(sdata){
      sdata.forEach(x => {
        if(this.comment.Comment.responses){
        this.comment.Comment.responses.forEach((o,i) => {
          if(o.responses){
          o.responses.forEach((r,ii) => {
            if(r.id==x.id){
              this.comment.Comment.responses[i].responses[ii] = x
            }
          });
        }
        });
      }
      });
    }
  }

    let localsubrData = localStorage.getItem('workspace_video_sub_reply_'+this.params.video_id + '_' + this.headerService.getUserId() )
    if (localsubrData != null && localsubrData != undefined) {
      let sdata = JSON.parse(localsubrData)
      if(sdata){
      sdata.forEach(x => {
        if(this.comment.Comment.responses){
        this.comment.Comment.responses.forEach(p => {
          if (p.id == x.parent_id) {
            p.responses.push(x);
          }
        });
      }
      });
    }
    }

    if(this.comment.ref_type == 6) {
      this.checkIfAduioCommentIsPlayable(this.comment.comment);
    }

  }
  // GetTexts() {
  //   this.comment.Comment.responses.forEach(x => {
  //     x.responses.forEach(o => {
  //       if (localStorage.getItem('workspace_video_play_subreply_edit_comment_' + o.id + '_' + this.headerService.getUserId() ) != null) {
  //         o.EditableText = localStorage.getItem('workspace_video_play_subreply_edit_comment_' + o.id + '_' + this.headerService.getUserId() );
  //       } else {
  //         o.EditableText = o.comment;
  //       }
  //     });
  //   });
  // }
  GetReplyText(){
        //Reply Refresh Text Save Start
        if (this.comment.Comment.responses != undefined) {
          this.comment.Comment.responses.forEach(reply => {
            if (localStorage.getItem(this.header_data.user_current_account.User.id+'_workspace_play_reply_edit_'+reply.id) != null && localStorage.getItem(this.header_data.user_current_account.User.id+'_workspace_play_reply_edit_'+reply.id) != undefined) {
              reply.EditableText = localStorage.getItem(this.header_data.user_current_account.User.id + '_workspace_play_reply_edit_' + reply.id);
            } else {
              reply.EditableText = reply.comment;
            }
          });
        }
        //Reply Refresh Text Save End
  }
  GetSubReplyText(){
        //Sub-Reply Refresh Text Save Start
        if (this.comment.Comment.responses != undefined) {
          this.comment.Comment.responses.forEach(x => {
            if(x.responses.forEach){
            x.responses.forEach(sub_reply => {
              if (localStorage.getItem(this.header_data.user_current_account.User.id + '_workspace_play_sub_reply_edit_' + sub_reply.id) != null && localStorage.getItem(this.header_data.user_current_account.User.id + '_workspace_play_sub_reply_edit_' + sub_reply.id) != undefined) {
                sub_reply.EditableText = localStorage.getItem(this.header_data.user_current_account.User.id + '_workspace_play_sub_reply_edit_' + sub_reply.id);
              } else {
                sub_reply.EditableText = sub_reply.comment;
              }
            });
          }
          });
        }
            //Sub-Reply Refresh Text Save End
  }
  ngOnChanges(change) {
    if (change.comment && change.comment.currentValue) {
      setTimeout(() => {
        if (this.staticFiles) {
          this.AttachFilesToComment(this.comment);
        }
      }, 5);
    }
  }

  public initiateDelete(template: TemplateRef<any>, comment, parent?) {
    this.deletableComment = comment;
    this.modalRef = this.modalService.show(template, { class: "modal-md" });
  }

  public getUserImgUrl(comment) {


    if (comment.image && comment.image.length > 0) {

      let img = comment.image;

      return "https://s3.amazonaws.com/sibme.com/static/users/" + comment.user_id + "/" + img;

    }

    return environment.baseUrl + "/img/home/photo-default.png";



  }


  public getCustomTagsLength(default_tags) {

    let matched = _.where(default_tags, { ref_type: 1 });
    if (matched) return matched.length;
    return false;
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

  public AttachFilesToComment(comment) {

    // if(!comment.isExpnded) return;

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

        if (((!file.comment_id) && (comment.time2 == file.time2)) || ((file.comment_id) && (file.comment_id == comment.id))) {

          comment.files.push(file);

        }

      })


    if (this.WhetherScrollOrNot("#comment_" + this.index) && (comment.default_tags.length > 0 || comment.files.length > 0 || comment.standard.length > 0)) {

      this.scrollService.scrollTo("#slimscroll", "#comment_" + this.index, 0.5);

    }

  }

  private WhetherScrollOrNot(elementId) {

    let parentDiv = (<HTMLElement>document.querySelector("#slimscroll"));

    if (!parentDiv) return;

    let scrollerHeightInPx = parentDiv.style.height;

    let scrollHeight = Number(scrollerHeightInPx.substring(0, scrollerHeightInPx.indexOf("px")));

    let elementScroll = (document.querySelector(elementId)).offsetTop;

    return elementScroll + 185 > scrollHeight;

  }

  public CancelReply(comment) {

    comment.replyEnabled = false;
    comment.replyText = '';
    localStorage.removeItem(this.addReplyLSKey);
  }

  private FormatToSeconds(time) {

    if (time == 0) return 0;
    if (typeof (time) == "number") return time;
    if (time == void 0) return 0;
    let stamp = time.split(":");

    return Number(stamp[0] * 3600) + Number(stamp[1] * 60) + Number(stamp[2]);

  }

  public retryReply(reply) {
    if(reply.processing) return;

    reply.processing = true;
    reply.tryAgain = false;
    const currntuuid = reply.uuid;
    const lsIndex = this.lsReplyArray.findIndex(r => r.uuid == currntuuid);
    // const replyIndex = this.comment.Comment.responses.findIndex(r => r.uuid == currntuuid);

    this.appMainService.AddReply(reply).subscribe((data: any) => {

      // if (replyIndex > -1) this.comment.Comment.responses[replyIndex] = data.latest_reply_added; Logic Commented cause of two times push
      // if(replyIndex > -1) this.comment.Comment.responses.splice(replyIndex,1);

      //remove from localstorage
      if (lsIndex > -1) {
        this.lsReplyArray.splice(lsIndex, 1);
        localStorage.setItem(`${this.WORKSPACE_LS_KEYS.VIDEO_REPLY_TA}${this.params.video_id}` + '_' + this.headerService.getUserId() , JSON.stringify(this.lsReplyArray));
      }
      reply.processing = false;
      reply.tryagain = true;
    },err=>{
      reply.processing = false;
      reply.tryAgain = true;
    });

  }

  public AddReply(comment) {

    if ((!comment || !comment.replyText || !comment.replyText.trim() || comment.replyText.trim() == "")){
      this.toastr.error(this.translation.please_enter_text_to_reply);
      return;
    }

    let sessionData: any = this.headerService.getStaticHeaderData();
    let obj: any = {
      id: -1,
      parent_id: comment.id,
      parent_comment_id: comment.id,
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
      // this logic has been moved to socket "comment_added" on v body page
      // comment.replyAdding = false;
      // comment.replyText = "";
      // if (!comment.Comment) comment.Comment = {};
      // if (!comment.Comment.responses) comment.Comment.responses = [];
      // comment.Comment.responses.push(data.latest_reply_added);
      // this.onAdd.emit(true);

    }, err => {
      // if (!comment.Comment) comment.Comment = {};
      // if (!comment.Comment.responses) comment.Comment.responses = [];
      // comment.Comment.responses.push(obj);
      obj.tryAgain = true;
      this.lsReplyArray.push(obj);
      localStorage.setItem(`${this.WORKSPACE_LS_KEYS.VIDEO_REPLY_TA}${this.params.video_id}` + '_' + this.headerService.getUserId() , JSON.stringify(this.lsReplyArray));
    });
  }

  SubmitSubReply(comment, reply:any, ind?, sub_reply?, fakeComment: boolean = false) {

    if(fakeComment){
      if(sub_reply.processing) return;
      
      sub_reply.processing = true;
      sub_reply.tryAgain = false;
    }

     if ((!reply || !reply.replyText || !reply.replyText.trim() || reply.replyText.trim() == "")){
      this.toastr.error(this.translation.please_enter_text_to_reply);
      return;

    }

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj:any = {
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

    this.appMainService.AddReply(obj).subscribe((data: any) => {
      reply.replyText = "";
      localStorage.removeItem(this.header_data.user_current_account.User.id+'_workspace_video_play_sub_reply_comment_' + reply.id);
      if (!reply.responses) reply.responses = [];
      // if(!reply.Comment.responses) reply.Comment.responses = [];
      // reply.responses.push(data.latest_reply_added);
      // this.onAdd.emit(true);
      // if (sub_reply && reply.responses[ind].id == sub_reply.id) {
        let lsData = localStorage.getItem('workspace_video_sub_reply_'+this.params.video_id + '_' + this.headerService.getUserId() );
        let dddata = JSON.parse(lsData);
        if(dddata){
        dddata.forEach((x,ii) => {
          if(x.id == sub_reply.id){
            dddata.splice(ii,1)
          }
        });
      }
        localStorage.setItem('workspace_video_sub_reply_'+this.params.video_id + '_' + this.headerService.getUserId() ,JSON.stringify(dddata)) 
        // reply.responses[ind] = data.latest_reply_added;
      //   reply.responses.splice(ind,1);
      // }else{
      //   // reply.responses.push(data.latest_reply_added);
      // }
      if(sub_reply) sub_reply.processing = false;
    },err=>{
      if(fakeComment){
        sub_reply.processing = false;
        sub_reply.tryAgain = true;
      } else {
        obj.tryAgain = true;
        this.lsSubReplyArray.push(obj);
        localStorage.setItem(`workspace_video_sub_reply_${this.params.video_id}` + '_' + this.headerService.getUserId() , JSON.stringify(this.lsSubReplyArray));
        // if(!reply.responses) reply.responses = [];
        // reply.responses.push(obj);
        
        // reply.replyText = "";
        localStorage.removeItem(this.header_data.user_current_account.User.id+'_workspace_video_play_sub_reply_comment_' + reply.id);
      }
    });
  }

  public editComment(comment) {

    if (comment.replyEnabled && comment.replyText) {
      alert(this.translation.myfile_please_add_reply);
      return;
    }
    comment.EditEnabled = true;
    comment.replyEnabled = false;
    this.headerService.hideTabRecordIcon(true);
    this.onEdit.emit(comment);

  }

  public EnableReply(comment) {

    if (this.EditMode) {

      alert(this.translation.myfile_please_update_or_cancel);
      return;
    }

    comment.replyEnabled = true; comment.EditEnabled = false;

  }

  public ResolveDelete(flag) {

    this.modalRef.hide();
    if (flag == 1) {

      this.onDelete.emit(this.deletableComment);

    }
  }

  public AttachAnimation(comment) {
    if (comment.isExpnded) {
      comment.isAnimated = true;
      setTimeout(() => {
        comment.isAnimated = false;
      }, 1500);
    }
  }

  public Seek(comment) {

    if (!this.from)
      this.playerService.SeekTo({time:comment.time,end_time:comment.end_time});

  }

  public getFormattedTime(time, end_time) {

    if (time <= 0 || time == null) return this.translation.myfile_all_videos;
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

    if ((!reply || !reply.EditableText.trim() || reply.EditableText.trim() == "")){
      this.toastr.error(this.translation.myfile_please_add_text);
      return;

    }
    this.onReplyEdit.emit({ comment: comment, reply: reply });

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
      });
    }else {
      return '';
    }

  }

  public getTimelineBg(comment) {

    if (comment.default_tags.length > 0) {

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

  retryComment(comment: any) {
    console.log('comment: ', comment);
    if(comment.processing) return;

    comment.processing = true;

    if (comment.comment_id) {
      let obj = {
        huddle_id: comment.huddle_id,
        account_id: comment.account_id,
        comment_id: comment.comment_id,
        videoId: comment.videoId,
        for: comment.for,
        synchro_time: comment.synchro_time,
        time: comment.time,
        end_time: comment.end_time,
        ref_type: comment.ref_type,
        comment: comment.comment,
        audio_duration: comment.audioDuration,
        user_id: comment.user_id,
        standards_acc_tags: comment.standards_acc_tags,
        default_tags: comment.default_tags_value,
        assessment_value: comment.assessment_value,
        account_role_id: comment.account_role_id,
        current_user_email: comment.current_user_email,
        file : comment.file
      };

      this.appMainService.EditComment(obj).subscribe((data: any) => {

        if (data.status == "success") {

          let retComment = data.updated_comment;
          retComment.valid = true;
          let returnedObj = { parent: this.parent, event: 'edit', updatedComment: retComment, comment_id: comment.comment_id };
          this.mainService.updateCommentTryAgain(returnedObj);
          
        } else {
          this.toastr.info(this.translation.something_went_wrong_msg);
          comment.processing = false;
        }

      }, error => comment.processing = false) ;

    } else {
      comment.tryAgain = false;

      let obj = {
        videoId: comment.videoId,
        for: comment.for,
        synchro_time: comment.synchro_time,
        time: comment.time,
        end_time: comment.end_time,
        ref_type: comment.ref_type,
        comment: comment.comment,
        audio_duration: comment.audioDuration,
        user_id: comment.user_id,
        standards_acc_tags: comment.standards_acc_tags,
        default_tags: comment.default_tags_value,
        assessment_value: comment.assessment_value,
        fake_id: comment.fake_id,
        first_name: comment.first_name,
        last_name: comment.last_name,
        company_name: comment.company_name,
        image: comment.image,
        account_role_id: comment.account_role_id,
        current_user_email: comment.current_user_email,
      };

      this.appMainService.AddComment(obj).subscribe((data: any) => {

        if (data.status == "success") {

          let retComment = data["0"];
          retComment.valid = true;
          let returnedObj = { parent: this.parent, event: 'add', updatedComment: retComment, oldCommentuuid: comment.uuid };
          this.mainService.updateCommentTryAgain(returnedObj);

        } else {

          this.toastr.info(this.translation.something_went_wrong_msg);
          comment.processing = false;
          comment.tryAgain = true;
        }

      }, error => {
        comment.processing = false;
        comment.tryAgain = true;
      });
    }
  }


  public AllowTags(default_tags) {

    return default_tags.filter((dt) => { return dt.ref_type != 2; }).length > 0;

  }

  public FileClicked(file){
    if(file.stack_url && file.stack_url != null){

      let path = environment.baseUrl+"/app/view_document"+ file.stack_url.substring(file.stack_url.lastIndexOf("/"), file.stack_url.length);
      window.open(path, "_blank");

    }
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
    this.subscriptions.unsubscribe();
    if (this.modalRef) this.modalRef.hide();
  }

}
