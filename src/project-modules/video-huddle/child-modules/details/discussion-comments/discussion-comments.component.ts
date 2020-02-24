import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from "@angular/core";
import { DiscussionService } from "../servic/discussion.service";
import IUpload from "../discussions/IUpload";
import { HeaderService } from "@projectModules/app/services";
import { ToastrService } from "ngx-toastr";
import { DetailsHttpService } from "../servic/details-http.service";
import { PermissionService } from '../servic/permission.service';
import * as _ from "underscore";
import { DomSanitizer } from '@angular/platform-browser'
import { Subscription } from 'rxjs';
import { environment } from "@environments/environment";
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import * as moment from 'moment';
import { AppMainService } from '@app/services';

// At the top of the file
// declare global {
//   interface Window {
//     io: any;
//   }
//   interface Window {
//     Echo: any;
//   }
// }

// declare var Echo: any;

// window.io = io;
// window.Echo = window.Echo || {};

@Component({
  selector: "discussion-comment",
  templateUrl: "./discussion-comments.component.html",
  styleUrls: ["./discussion-comments.component.css"]
})
export class DiscussionCommentsComponent implements OnInit, OnDestroy, IUpload {
  public reply = false;
  public edit_discussion = false;
  public more_mode;
  public mode_flag;
  @Input() comment;
  @Input() params;
  @Input() users;
  @Input() comment_status;
  @Output() delete_emitter = new EventEmitter<any>();
  @Output() state_emitter = new EventEmitter<any>();
  @Output() comment_emitter = new EventEmitter<any>();
  @Output() edit_comment_emitter = new EventEmitter<any>();
  //@Output() edit_comment_after_save_emitter = new EventEmitter<any>();
  @Output() edit_comment_after_save_emitter_1 = new EventEmitter(true);
  public editor_flag;
  public Files: any = [];
  public stockFiles: any = [];
  public editableComment: any = {};
  public editablereply: any;
  public comment_id;
  public comment_details: any = {};
  public emailAll: boolean = false;
  public comment_complete = false;
  public comment_less = true;
  public reply_complete = false;
  public reply_less = true;
  public edit_btn = false;
  public reply_btn = false;
  public delete_btn = false;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  currentreplyid: any;
  public userAccountLevelRoleId: number | string = null;
  public negativeId = -1;
  public editNegativeId = -1;
  public editReplyNegativeId = -1;
  private disscussion_add_replies = [];
  private disscussion_edit_replies = [];
  private discussionEditCommentsTAArray = [];
  private DISCUSSION_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.DISCUSSION;
  private discussionEditCommentLSKey: string = '';
  private discussionEditCommentTAKey: string = '';
  public user_id;
  thumb_image: any;
  thumb_image_Url: any;

  // @HostListener("window:scroll", ["$event"])
  // onScroll(event) {
  //   if((window.innerHeight + window.scrollY) >= document.body.offsetHeight){
  //     this.mode_flag = this.more_mode.default;
  //     this.Files = [];
  //     this.emailAll = false;
  //   }
  // }
  constructor(
    public appMainService:AppMainService,
    private toastr: ToastrService,
    private discussionService: DiscussionService,
    private headerService: HeaderService,
    private detailService: DetailsHttpService,
    public permissionService: PermissionService,
    private domSanitizer: DomSanitizer) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;

    });
  }
 ngOnChanges() {
   //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
   //Add '${implements OnChanges}' to the class.
   if(this.comment_status)
    {//console.log("this is commentStatus",this.comment_status);
    }
 }
  ngOnInit() {
    this.more_mode = {};
    this.more_mode = {
      default: 0,
      edit: 1,
      reply: 2,
      replyedit: 3
      
    };
    // console.log(this.comment.id,this.comment)
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream

    let tmpReplies = localStorage.getItem(`disscussion_add_replies${this.params.discussion_id}`);
    if(tmpReplies && tmpReplies != 'undefined' && tmpReplies != 'null'){
      this.disscussion_add_replies = JSON.parse(tmpReplies);
      this.disscussion_add_replies.forEach(reply => {
       if(reply.commentable_id == this.comment.id) this.comment.replies.unshift(reply);
      });
    }

    let tmpEditReplies = localStorage.getItem(`disscussion_edit_replies${this.params.discussion_id}`);
    if(tmpEditReplies && tmpEditReplies != 'undefined' && tmpEditReplies != 'null'){
      this.disscussion_edit_replies = JSON.parse(tmpEditReplies);
      this.disscussion_edit_replies.forEach(tmpReply => {
        let index = this.comment.replies.findIndex(x => x.id == tmpReply.comment_id);

        if(index > -1) this.comment.replies[index] = tmpReply;

      });
    }
    this.user_id = this.headerService.getUserId()
    //this.discussionEditCommentLSKey = `${this.DISCUSSION_LS_KEYS.EDIT_COMMENT}${this.params.discussion_id}_${this.headerService.getUserId()}`;
    this.discussionEditCommentTAKey = `${this.DISCUSSION_LS_KEYS.EDIT_COMMENT_TA}${this.params.discussion_id}_${this.headerService.getUserId()}`;

    /** Restore discussion edit comments try again array start */
    let tmpEditComments = this.headerService.getLocalStorage(this.discussionEditCommentTAKey);
    if(Array.isArray(tmpEditComments)){
      this.discussionEditCommentsTAArray = tmpEditComments
    }
    /** Restore discussion edit comments try again array start */
    this.headerService.currentUserImage$.subscribe(data=>{
      this.thumb_image_Url=data;
      this.thumb_image=data.replace(/^.*[\\\/]/, '');
          })
  }
  onUpload(e) {
    let target = e.target;
    target.files.length > 0 && this.pushToFiles(target.files);
    target.value = "";
  }
  ImageBuilder(participent) {
    let image = participent.image || "assets/video-huddle/img/c1.png";
    let url = `${this.staticImageServiceIp}${participent.user_id}/${
      participent.image
      }`;
    return participent.image ? url : image;
  }
  public pushToFiles(files: any, is_reply = false): any {
    for (let i = 0; i < files.length; i++) {
      this.Files.push(this.discussionService.parseFile(files[i]));
    }
  }

  public ActivateMode(mode, reply?: any) {
    this.mode_flag = mode;
    this.editor_state(false);
    this.editablereply = '';
    if (mode == this.more_mode.edit) {
      this.Files = [];
      this.stockFiles = JSON.parse(JSON.stringify(this.comment.attachments));
      this.editableComment = JSON.parse(JSON.stringify(this.comment));

      //let tmpEditComment = this.headerService.getLocalStorage(this.discussionEditCommentLSKey);
      //console.log("this is comment id",this.editableComment);
      let tmpEditComment = this.headerService.getLocalStoragewithoutParse('discussionEditCommentLSKey_'+this.editableComment.id+this.user_id);
      if(tmpEditComment) this.editableComment.comment = tmpEditComment;
    } else if (mode == this.more_mode.default) {
      this.editor_state(true);
      this.stockFiles = [];
      this.Files = [];
      this.emailAll = false;
    } else if (mode == this.more_mode.replyedit) {
      this.currentreplyid = reply.id
      this.Files = [];
      this.stockFiles = JSON.parse(JSON.stringify(reply.attachments));
      this.editablereply = JSON.parse(JSON.stringify(reply.comment));
        if(localStorage.getItem(reply.id)!=null && localStorage.getItem(reply.id)!=''){
          this.editablereply = localStorage.getItem(reply.id);
        }
    }
  }

  public DownloadFile(attachment) {
    // let file = {
    //   url: `${environment.baseUrl}/${attachment.url}`,
    //   title: attachment.original_file_name
    // };
    this.detailService.DownloadDiscussionFile(attachment.document_id);
  }
  public AddReply() {
    if (!this.editablereply || this.editablereply.trim() == "" || this.editablereply.toString().replace(/<.*?>/g, "") == "" || this.editablereply.toString().replace(/<.*?>/g, "").trim() == "") {
      this.toastr.info(this.translation.discussion_enter_some_text);
      return;
    } else {
      if (this.Files.length) {
        let result = this.headerService.checkFileSizeLimit(this.Files);
        if (!result.status) {
          this.toastr.error(result.message);
          return;
        }
      }
      let sessionData: any = this.headerService.getStaticHeaderData();
      let obj: any = {
        fake_id:moment(new Date()).format('x'),
        huddle_id: this.params.huddle_id,
        send_email: true,
        comment: this.editablereply,
        comment_id: this.editableComment.id,
        commentable_id: this.comment.id,
        discussion_id: this.comment.parent_comment_id,
        user_current_account: sessionData.user_current_account,
        remove_attachments: this.stockFiles
          .filter(f => f.isDeleted)
          .map(f => f.document_id)
          .join(","),
        title: "",
        // notification_user_ids: this.emailAll
        //   ? this.users.map(u => u.id).join(",")
        //   : ""
        notification_user_ids: this.users.map(u => u.id).join(",")
      };
      ({
        User: { id: obj.user_id },
        accounts: { account_id: obj.account_id }
      } = sessionData.user_current_account);
      //console.log('Reply Data',obj,'Comment Data',this.editablereply);
      let fd = this.discussionService.ToFormData(obj);
      this.Files.length > 0 &&
        (() => {
          for (let i = 0; i < this.Files.length; i++) {
            fd.append("attachment[]", this.Files[i]);
          }
        })();

        localStorage.removeItem('comment_'+this.comment.id);
        this.mode_flag = this.more_mode.default;
        this.Files = [];
        this.emailAll = false;

        // adding coment for real time effect in array
      this.comment.replies.unshift(this.createDummySubReply(obj,sessionData));
      this.comment.replies=[...this.comment.replies];
      // this.discussionService.AddDiscussion(fd).subscribe((data : any) => {

      this.appMainService.AddDiscussion(fd).subscribe((data : any) => {
        if(data.success){
          // localStorage.removeItem('comment_'+this.comment.id);
          // this.toastr.info(this.translation.discussion_reply_added);
        }
        
        // this.mode_flag = this.more_mode.default;
        // this.Files = [];
        // this.emailAll = false;
      },(error)=>{
        obj.unsavedreply_Id = this.negativeId;
        --this.negativeId;
        obj.first_name = sessionData.user_current_account.User.first_name;
        obj.last_name = sessionData.user_current_account.User.last_name;
        obj.tryAgain = true;
        obj.uuid = new Date().getTime();
        obj.thumb_image = `${environment.baseUrl}/img/home/photo-default.png`;

        this.disscussion_add_replies.push(obj);
        localStorage.setItem(`disscussion_add_replies${this.params.discussion_id}`, JSON.stringify(this.disscussion_add_replies));
        //obj.image =  this.discussionService.GetAvatar(obj)
        this.comment.replies.unshift(obj);
        //console.log("in the reply error", this.comment.replies);
      });
    }
  }

  public createDummySubReply(reply,sessionData)
  {
    let obj={
      id:0,
      fake_id:reply.fake_id,
      parent_comment_id:reply.comment_id,
      title: reply.title,
      comment:reply.comment,
      first_name: sessionData.user_current_account.User.first_name,
  last_name: sessionData.user_current_account.User.last_name,
  image: this.thumb_image,
      user_id:sessionData.user_current_account.User.id,
      thumb_image: this.thumb_image_Url
    }
  
    return obj;
  }
  public onUpdate() {
    this.headerService.removeLocalStorage('discussionEditCommentLSKey_'+this.editableComment.id+this.user_id);
    if (!this.editableComment.comment || this.editableComment.comment.trim() == "" || this.editableComment.comment.toString().replace(/<.*?>/g, "") == "" || this.editableComment.comment.toString().replace(/<.*?>/g, "").trim() == "") {
      this.toastr.info(this.translation.discussion_enter_some_text);
      return;
    } else {
      if (this.Files.length) {
        let result = this.headerService.checkFileSizeLimit(this.Files);
        if (!result.status) {
          this.toastr.error(result.message);
          return;
        }
      }
      let sessionData: any = this.headerService.getStaticHeaderData();
      let obj: any = {
        huddle_id: this.params.huddle_id,
        send_email: true,
        comment_id: this.editableComment.id,
        commentable_id: this.params.discussion_id,
        discussion_id: this.params.discussion_id,
        user_current_account: sessionData.user_current_account,
        remove_attachments: this.stockFiles
          .filter(f => f.isDeleted)
          .map(f => f.document_id)
          .join(","),
        title: "",
        notification_user_ids: this.emailAll
          ? this.users.map(u => u.id).join(",")
          : ""
      };

      ({ comment: obj.comment } = this.editableComment);

      ({
        User: { id: obj.user_id },
        accounts: { account_id: obj.account_id }
      } = sessionData.user_current_account);

      let fd = this.discussionService.ToFormData(obj);
      this.Files.length > 0 &&
        (() => {
          for (let i = 0; i < this.Files.length; i++) {
            fd.append("attachment[]", this.Files[i]);
          }
        })();

      this.discussionService.EditDiscussion(fd).subscribe((data : any) => {
        if(data.success){
          this.toastr.info(this.translation.discussion_comment_updated);
          this.click_cancle_edit();
          this.ActivateMode(this.more_mode.default);
        }

        this.mode_flag = this.more_mode.default;
        this.Files = [];
        this.emailAll = false;
      },
      (error)=>{
        obj.unsavedEditedComment = this.editNegativeId;
        //--this.editNegativeId;
        obj.first_name = sessionData.user_current_account.User.first_name;
        obj.last_name = sessionData.user_current_account.User.last_name;
        obj.id = this.comment.id;
        obj.thumb_image = `${environment.baseUrl}/img/home/photo-default.png`;
        obj.tryAgain = true;
        obj.editTryAgain = true;
        obj.uuid = new Date().getTime();

        this.discussionEditCommentsTAArray.push(obj);
        this.headerService.setLocalStorage(this.discussionEditCommentTAKey, this.discussionEditCommentsTAArray);
        this.edit_comment_emitter.emit(obj);
        

      }
      );
    }
  }
  public onReplyUpdate(reply) {
    if (!this.editablereply || this.editablereply.trim() == "" || this.editablereply.toString().replace(/<.*?>/g, "") == "" || this.editablereply.toString().replace(/<.*?>/g, "").trim() == "") {
      this.toastr.info(this.translation.discussion_enter_some_text);
    } else {
      if (this.Files.length) {
        let result = this.headerService.checkFileSizeLimit(this.Files);
        if (!result.status) {
          this.toastr.error(result.message);
          return;
        }
      }
      let sessionData: any = this.headerService.getStaticHeaderData();
      let obj: any = {
        huddle_id: this.params.huddle_id,
        send_email: true,
        comment: this.editablereply,
        comment_id: reply.id,
        commentable_id: this.comment.id,
        discussion_id: this.params.discussion_id,
        user_current_account: sessionData.user_current_account,
        remove_attachments: this.stockFiles
          .filter(f => f.isDeleted)
          .map(f => f.document_id)
          .join(","),
        title: "",
        notification_user_ids: this.emailAll
          ? this.users.map(u => u.id).join(",")
          : ""
      };

      ({
        User: { id: obj.user_id },
        accounts: { account_id: obj.account_id }
      } = sessionData.user_current_account);
      //console.log('Reply Data',obj,'Comment Data',this.editablereply,'Files',this.Files);
      let fd = this.discussionService.ToFormData(obj);
      this.Files.length > 0 &&
        (() => {
          for (let i = 0; i < this.Files.length; i++) {
            fd.append("attachment[]", this.Files[i]);
          }
        })();

      this.discussionService.EditDiscussion(fd).subscribe((data: any) => {
        if (data.success) {
          this.toastr.info(this.translation.discussion_reply_updated);

          this.click_cancle_reply();
          this.ActivateMode(this.more_mode.default);
          this.click_cancl_edit_reply();
        }

        this.mode_flag = this.more_mode.default;
        this.Files = [];
        this.emailAll = false;
      },
      (error)=>{
        obj.editReplyNegativeId = this.editReplyNegativeId;
        --this.editReplyNegativeId;
        obj.first_name = sessionData.user_current_account.User.first_name;
        obj.last_name = sessionData.user_current_account.User.last_name;
        obj.tryAgain = true;
        obj.editTryAgain = true;
        obj.uuid = new Date().getTime();
        obj.thumb_image = `${environment.baseUrl}/img/home/photo-default.png`;
       // console.log("in comments",this.comment);
        //obj.id = this.comment.id;
        //console.log("in reply edit",reply);
        //debugger;
        var indexofcomment =  this.comment.replies.findIndex(x => x.id == reply.id);
        obj.id = this.comment.replies[indexofcomment].id
       // console.log("in edit reply id",obj.id);
       //debugger;
        this.comment.replies[indexofcomment] = obj;
        this.ActivateMode(this.more_mode.default);
        this.click_cancl_edit_reply();

        this.disscussion_edit_replies.push(obj);
        localStorage.setItem(`disscussion_edit_replies${this.params.discussion_id}`, JSON.stringify(this.disscussion_edit_replies));

        
      }
      );
    }
  }
  public ShowReply() {
    window.scrollTo(0, document.body.scrollHeight - 10);
    this.mode_flag = this.more_mode.default;
    this.Files = [];
    this.emailAll = false;

  }

  public deleteComment() {
    this.comment_id = this.comment.id;

    this.delete_emitter.emit(this.comment_id);
  }
  public deletereply(reply) {
    this.delete_emitter.emit(reply.id);
  }

  public editor_state(flag) {
    this.editor_flag = flag;
    localStorage.setItem('flag', flag)
    this.state_emitter.emit(this.editor_flag);
  }

  public commentMoreShow() {
    this.comment_complete = true;
    this.comment_less = false;
  }
  public commentLessShow() {
    this.comment_less = true;
    this.comment_complete = false;
    let mubutton = document.getElementById("show_less_" + this.comment.id);
    //console.log();
    window.scrollBy(0, -(this.findSiblingWithId(document.getElementById("show_less_" + this.comment.id), this.comment.id).offsetHeight - 100))
  }

  public replyMoreShow(id?: string) {
    this.currentreplyid = id
    this.reply_complete = true;
    this.reply_less = false;
  }
  public replyLessShow(id?: string) {
    this.reply_less = true;
    this.reply_complete = false;
    let mubutton = document.getElementById("show_less_" + id);
    //console.log();
    window.scrollBy(0, -(this.findSiblingWithId(document.getElementById("show_less_" + id), id).offsetHeight - 100))
  }
  public findSiblingWithId(element, id) {
    let siblings = element.parentNode.children,
      sibWithId = null;
    for (var i = siblings.length; i--;) {
      if (siblings[i].id == "comment_content_" + id) {
        sibWithId = siblings[i];
        break;
      }
    }


    return sibWithId;

  }
  findLength() {
    let comnt = this.comment.comment.replace(/<.*?>/g, "");
    return comnt.length;
  }

  click_edit() {
    this.edit_btn = true;
    this.reply_btn = true;
    this.delete_btn = true;
  }
  click_cancle_edit() {
    this.edit_btn = false;
    this.reply_btn = false;
    this.delete_btn = false;
  }

  click_edit_reply() {
    this.edit_btn = true;
    this.reply_btn = true;
    this.delete_btn = true;
  }
  click_cancl_edit_reply() {
    this.edit_btn = false;
    this.reply_btn = false;
    this.delete_btn = false;
  }
  click_reply(){
    this.editablereply = localStorage.getItem('comment_'+this.comment.id);
    this.edit_btn=true;
    //this.reply_btn=true;
    this.delete_btn = true;
  }
  click_cancle_reply() {
    this.edit_btn = false;
    this.reply_btn = false;
    this.delete_btn = false;
  }

  saveCommentAgainEmit(comment){
    if(comment.processing) return;
    comment.processing = true;
    comment.fake_id=moment(new Date()).format('x');
    this.comment_emitter.emit(comment)
  }

  saveReplyAgain(reply){
    
    if(reply.processing) return;
    reply.processing = true;
    reply.fake_id=moment(new Date()).format('x');
    let fd = this.discussionService.ToFormData(reply);
      this.Files.length > 0 &&
        (() => {
          for (let i = 0; i < this.Files.length; i++) {
            fd.append("attachment[]", this.Files[i]);
          }
        })();


        

      this.discussionService.AddDiscussion(fd).subscribe((data : any) => {
        this.comment.replies = this.comment.replies.filter(x => x.uuid != reply.uuid);
        this.comment.replies = [...this.comment.replies];
        this.disscussion_add_replies = this.disscussion_add_replies.filter(x => x.uuid != reply.uuid);
        localStorage.setItem(`disscussion_add_replies${this.params.discussion_id}`, JSON.stringify(this.disscussion_add_replies));
        
        if(data.success){
          localStorage.removeItem('comment_'+this.comment.id);
          this.toastr.info(this.translation.discussion_reply_added);
        }
        
        this.mode_flag = this.more_mode.default;
        this.Files = [];
        this.emailAll = false;
      }, err => reply.processing = false);
    
  }

  editCommentSaveAgain(comment){
    if(comment.processing) return;
    comment.processing = true;

    var temp = 0;
    let fd = this.discussionService.ToFormData(comment);
      this.Files.length > 0 &&
        (() => {
          for (let i = 0; i < this.Files.length; i++) {
            fd.append("attachment[]", this.Files[i]);
          }
        })();
        // debugger;
        // this.edit_comment_after_save_emitter_1.emit(comment);
        this.discussionService.EditDiscussion(fd).subscribe((data: any)=>{
        this.discussionEditCommentsTAArray = this.discussionEditCommentsTAArray.filter(x => x.uuid != comment.uuid);
        this.headerService.setLocalStorage(this.discussionEditCommentTAKey, this.discussionEditCommentsTAArray);
          
          this.toastr.info(this.translation.discussion_comment_updated);
        }, err => {
          comment.processing = false;
        });
        
        
  }

  editReplyAgain(reply){
    if(reply.processing) return;
    reply.processing = true;
    let fd = this.discussionService.ToFormData(reply);
      this.Files.length > 0 &&
        (() => {
          for (let i = 0; i < this.Files.length; i++) {
            fd.append("attachment[]", this.Files[i]);
          }
        })();

      this.discussionService.EditDiscussion(fd).subscribe((data : any) => {
        this.comment.replies = this.comment.replies.filter(x => x.uuid != reply.uuid);
        this.comment.replies = [...this.comment.replies];
        this.disscussion_edit_replies = this.disscussion_edit_replies.filter(x => x.uuid != reply.uuid);
        localStorage.setItem(`disscussion_edit_replies${this.params.discussion_id}`, JSON.stringify(this.disscussion_edit_replies));

        // var indexofcomment =  this.comment.replies.findIndex(x=> x.id==reply.comment_id);
        // if(indexofcomment>=0){
          
        //   //this.comment.replies[indexofcomment]=reply;
        //  // this.comment.replies.splice(indexofcomment,1);
        //   //console.log("in spliced array",this.comment.replies);
        //   this.comment.replies =[...this.comment.replies];
        // }
        if(data.success){
          this.toastr.info(this.translation.discussion_reply_updated);
          localStorage.removeItem('comment_'+this.comment.id);
        }
        
        this.mode_flag = this.more_mode.default;
        this.Files = [];
        this.emailAll = false;
      }, err => {
        reply.processing = false;
      });

  }

  // event_emitter(comment){
  //   //debugger;
  //   //this.edit_comment_after_save_emitter_1.emit(comment);
  // }
  
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
