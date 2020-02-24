import {  Component,  OnInit,  OnDestroy,  ViewChild,  TemplateRef,  EventEmitter} from "@angular/core";
import { DiscussionService } from "../servic/discussion.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DetailsHttpService } from "../servic/details-http.service";
import { HeaderService, SocketService, HomeService, AppMainService } from '@projectModules/app/services';
import IUpload from "../discussions/IUpload";
import { BsModalService } from "ngx-bootstrap/modal";
// import { BsModalRef } from "ngx-bootstrap/modal/bs-modal-ref.service";
import { ToastrService } from "ngx-toastr";
// import { HomeService } from "src/app/list/services/home.service";
// import { HomeService } from "../../list/services/home.service";
import * as _ from "underscore";
import { PermissionService } from '../servic/permission.service';
import { Subscription } from 'rxjs';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import * as moment from 'moment';
@Component({
  selector: "app-discussion-details",
  templateUrl: "./discussion-details.component.html",
  styleUrls: ["./discussion-details.component.css"]
})
export class DiscussionDetailsComponent implements OnInit, OnDestroy, IUpload {
  @ViewChild("email_discussion", {static: false}) email_discussion;
  @ViewChild("deleteTemplate", {static: false}) deleteTemplate;
  public commentStatus;
  public ModalRefs: Modals = {};
  public params;
  public DiscussionDetails;
  public newComment: any = {};
  public isLoading: boolean = false;
  public selectedSort: number = 1;
  public filterOptions: any = {
    newest: 1,
    oldest: 2
  };
  public SearchString: any = "";
  public Files: any = [];
  public editDiscData: any = {};
  public stockFiles: any = {};
  @ViewChild("editDiscussion", {static: false}) editDiscussion;
  public dirty:boolean = false;

  /*
    Props added to run ng build
  */
  public attachmentName: any;
  public hideModal: any;
  public setFile: any;
  public searchInput;
  public discussion_title;
  public user_email;
  public email_message =
    "Attached is a Word file export of the Custom Markers and Tagging Standards on Android App Huddle Discussion.";
  public email_attachment_name;
  private isReplyMode = false;
  public replyFiles: any = [];
  public commentID;
  public confirmDeleteString;
  public emailAll:boolean = true;
  public sessionData:any = [];
  public breadcrumb_added_count:any = 0;
  public editorShow=true;
  public counter=0;
  dEmit: any = new EventEmitter<any>();
  public comment_flag=0;
  public socket_listener:any;
  public header_data;
  public translation: any = {};
  public minus_Id = -1;
  private discussionAddCommentsTAArray = [];
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;
  private DISCUSSION_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.DISCUSSION;
  private editDiscussionLSKey: string = '';
  private editDiscussionTAKey: string = '';
  private discussionAddCommentLSKey: string = '';
  private discussionAddCommentTAKey: string = '';
  private discussionEditCommentTAKey: string = '';
  private subscriptions: Subscription = new Subscription();
  thumb_image: any;
  thumb_image_Url: any;
  /*
    build props end
  */

  constructor(
    public appMainService:AppMainService,
    public discussionService: DiscussionService,
    private route: ActivatedRoute,
    private detailService: DetailsHttpService,
    public headerService: HeaderService,
    private modalService: BsModalService,
    public fullRouter: Router,
    private toastr: ToastrService,
    private homeService: HomeService,
    private socketService:SocketService,
    public permisionService: PermissionService  ) {
      this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
        this.translation = languageTranslation;
        this.email_message = this.translation.discussion_email_message_text;
      });
    }
  editorOptions: any = {};
  more_mode;
  flag;
  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    this.discussionService.exportDiscussionEmitter.subscribe(() => {
      this.exportDiscussion();
    });
    this.route.params.subscribe(p => {
      this.params = p;

      let homeParams = this.detailService.GetParams();

      homeParams.id &&
        (this.params = { ...this.params, huddle_id: homeParams.id });

      this.getDiscussionDetails();

      this.editDiscussionLSKey = `${this.DISCUSSION_LS_KEYS.EDIT}${this.params.discussion_id}_${homeParams.id}_${this.headerService.getUserId()}`;
      this.editDiscussionTAKey = `${this.DISCUSSION_LS_KEYS.EDIT_TA}${homeParams.id}_${this.headerService.getUserId()}`;
      this.discussionAddCommentLSKey = `${this.DISCUSSION_LS_KEYS.ADD_COMMENT}${this.params.discussion_id}_${homeParams.id}_${this.headerService.getUserId()}`;
      this.discussionAddCommentTAKey = `${this.DISCUSSION_LS_KEYS.ADD_COMMENT_TA}${this.params.discussion_id}_${homeParams.id}_${this.headerService.getUserId()}`;
      this.discussionEditCommentTAKey = `${this.DISCUSSION_LS_KEYS.EDIT_COMMENT_TA}${this.params.discussion_id}_${this.headerService.getUserId()}`;

    });

    this.route.queryParams.subscribe(params => {
      // this.page = 0;
      // this.SearchString = params.search ? params.search : "";
      this.selectedSort = params.sort ? this.filterOptions[params.sort] : "";
      // this.params = this.detailService.GetParams();
      // console.log(this.selectedSort);
      if (params.sort) {
        this.setQueryparams(params.sort);
      } else {
        this.setQueryparams("newest");
        // this.getDiscussions(this.params.id, true);
      }

      // this.LoadNextPage(true);
    });

    this.socketPushFunctionDiscussionDetail();
    // this.processDiscussionDetailEventSubscriptions();

    this.detailEmit();
    this.header_data = this.headerService.getStaticHeaderData();
    //this.newComment.comment = localStorage.getItem('discussion_coment_added');
    // this.translation = this.header_data.language_translation; // changed to observable stream
    // this.email_message = this.translation.discussion_email_message_text; // moved in constructor due to language translation observable behavior
    
    let discussionAddCommentLS = this.headerService.getLocalStorage(this.discussionAddCommentLSKey);
    if(discussionAddCommentLS) this.newComment.comment = discussionAddCommentLS;

    this.headerService.currentUserImage$.subscribe(data=>{
      this.thumb_image_Url=data;
      this.thumb_image=data.replace(/^.*[\\\/]/, '');
          })
  window.onbeforeunload = () => this.ngOnDestroy(); // listen to the events like refresh or tab close
  }

  private socketPushFunctionDiscussionDetail()
  {
    this.subscriptions.add(this.socketService.pushEventWithNewLogic(`discussions-list-${this.params.huddle_id}`).subscribe(data => this.processDiscussionDetailEventSubscriptions(data)));
    this.subscriptions.add(this.socketService.pushEventWithNewLogic(`discussions-details-${this.params.discussion_id}`).subscribe(data => this.processDiscussionDetailEventSubscriptions(data)));
  }

  public OnSearchChange(event) {
    this.searchInput.next(event);
  }

  public setQueryparams(param) {
    this.fullRouter.navigate([], {
      queryParams: { sort: param },
      queryParamsHandling: "merge"
    });

     this.getDiscussionDetails(param);
    // this.selectedSort = id;
    // this.getDiscussions(this.params.id, false);
  }

  public DownloadFile(attachment) {
    // let file = {
    //   url: `${environment.baseUrl}/${attachment.url}`,
    //   title: attachment.original_file_name
    // };
    this.detailService.DownloadDiscussionFile(attachment.document_id);
  }

  public getDiscussionDetails(sort = 'newest') {
    this.isLoading = true;
    let sessionData: any = this.headerService.getStaticHeaderData(),
      obj: any = {
        huddle_id: this.params.huddle_id,
        detail_id: this.params.discussion_id,
        sort: sort
      };

    ({
      User: { id: obj.user_id },
      accounts: { account_id: obj.account_id }
    } = sessionData.user_current_account);

    this.discussionService
      .GetDiscussionDetails(obj)
      .subscribe(data => this.handleDiscussionDetails(data));
  }

  public handleDiscussionDetails(data) {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
    //alert('hello');
    this.DiscussionDetails = data;
    //console.log("this is discussion detaiol",this.DiscussionDetails);
    this.DiscussionDetails.discussion = this.DiscussionDetails.discussions.filter(
      d => d.id == this.params.discussion_id
    );
    this.DiscussionDetails.discussion.length > 0 &&
      (this.DiscussionDetails.discussion = this.DiscussionDetails.discussion[0]);
    delete this.DiscussionDetails.discussions;

    // this.DiscussionDetails.comment = this.domSanitizer.bypassSecurityTrustHtml(
    //   this.DiscussionDetails.comment
    // );
    this.bindAvatars()(this.DiscussionDetails);
      this.breadcrumb_added_count++;
      if(this.breadcrumb_added_count == 1)
      {
          

          let breadcrumbs=[];
          breadcrumbs = this.discussionService.GetBreadcrumbs();

          breadcrumbs.push({
              folder_id: -1,
              folder_name: this.DiscussionDetails.discussion.title
          });

          // this.homeService.Breadcrumbs.emit(breadcrumbs);
					this.homeService.updateBreadcrumb(breadcrumbs)

      }

      /** Restore edit discussion try again array start */
      let tmpDiscussionEditArray = this.headerService.getLocalStorage(this.editDiscussionTAKey);
      if(Array.isArray(tmpDiscussionEditArray)){
        tmpDiscussionEditArray.forEach(tmpDis => {
          if(this.DiscussionDetails.discussion.id == tmpDis.discussion_id){
            this.DiscussionDetails.discussion = tmpDis;
          }
        });
      }
      /** Restore edit discussion try again array end */

      /** Restore discussion add comments try again array start */
      let tmpComments = this.headerService.getLocalStorage(this.discussionAddCommentTAKey);
      if(Array.isArray(tmpComments)){
        this.discussionAddCommentsTAArray = tmpComments;
        this.DiscussionDetails.replys = [...this.discussionAddCommentsTAArray, ...this.DiscussionDetails.replys]; 
      }
      /** Restore discussion add comments try again array end */

      /** Restore discussion edit comments try again array start */
      let tmpEditComments = this.headerService.getLocalStorage(this.discussionEditCommentTAKey);
      if(Array.isArray(tmpEditComments)){
        tmpEditComments.forEach(tmpComment => {
          this.DiscussionDetails.replys.forEach(reply => {
            if(reply.id == tmpComment.comment_id){
              this.unSavedEditedCommentAgain(tmpComment);
            }
          });
        });
      }
      /** Restore discussion edit comments try again array start */
  }

  public bindAvatars() {
    return details => {
      details.discussion.thumb_image = this.discussionService.GetAvatar(
        details.discussion
      );

      details.replys.forEach(r => {
        r.thumb_image = this.discussionService.GetAvatar(r);
      });
    };
  }

  onUpload(e: any, is_reply: boolean = false) {
    this.isReplyMode = is_reply;
    let target = e.target;
    target.files.length > 0 && this.pushToFiles(target.files, is_reply);
    target.value = "";
  }

  public pushToFiles(files: any, is_reply = false): any {
    if (is_reply) {
      for (let i = 0; i < files.length; i++) {
        this.replyFiles.push(this.discussionService.parseFile(files[i]));
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        this.Files.push(this.discussionService.parseFile(files[i]));
      }
    }
  }

  public TriggerUpload() {
    document.getElementById("discussion_editor_files").click();
  }

  public OnDiscussionEdit() {
    this.editDiscData = JSON.parse(JSON.stringify(this.DiscussionDetails.discussion));

    /** Restore  and set edit discussion localstorage object start */
    let lsEditDiscussionObj = this.headerService.getLocalStorage(this.editDiscussionLSKey);
    if(lsEditDiscussionObj){
      this.editDiscData.title = lsEditDiscussionObj.title ? lsEditDiscussionObj.title : "";  
      this.editDiscData.comment = lsEditDiscussionObj.comment ? lsEditDiscussionObj.comment : "";  
    }
    /** Restore  and set edit discussion localstorage object end */
    
    this.Files = [];
    this.stockFiles = JSON.parse(
      JSON.stringify(this.DiscussionDetails.discussion.attachments)
    );

    // this.deletedIds = [];
    // this.unDeleteAttachments();
    this.ShowModal(this.editDiscussion, "lg_popup", "editableDiscussionModal");
  }

  public SubmitReply() { 
    this.headerService.removeLocalStorage(this.discussionAddCommentLSKey);

    this.comment_flag=1;
    if (!this.newComment.comment || this.newComment.comment.trim() == "" || this.newComment.comment.toString().replace(/<.*?>/g, "") == "" || this.newComment.comment.toString().replace(/<.*?>/g, "").trim() == "") {
      this.toastr.info(this.translation.discussion_enter_text_to_reply);
      this.comment_flag=0;
      return;
    } else {
        if(this.replyFiles.length)
        {
            let result =  this.headerService.checkFileSizeLimit(this.replyFiles);
            if(!result.status)
            {
                this.toastr.error(result.message);
                this.comment_flag=0;
                return;
            }
        }

      let sessionData: any = this.headerService.getStaticHeaderData();
      console.log('session data',sessionData)
      let obj: any = {
        fake_id:moment(new Date()).format('x'),
        huddle_id: this.params.huddle_id,
        send_email: true,
        comment_id: this.DiscussionDetails.discussion.id,
        commentable_id: this.DiscussionDetails.discussion.id,
        discussion_id: this.DiscussionDetails.discussion.id,
        user_current_account: sessionData.user_current_account,
        remove_attachments: "",
        title: "",
        notification_user_ids: this.emailAll ? this.DiscussionDetails.adminUsers.map(u => u.id).join():""
      };

      ({ comment: obj.comment } = this.newComment);

      ({
        User: { id: obj.user_id },
        accounts: { account_id: obj.account_id }
      } = sessionData.user_current_account);

      console.log('fd',obj ,this.DiscussionDetails.replys[0])
      // adding coment for real time effect in array
      this.DiscussionDetails.replys.unshift(this.createDummyReply(obj,sessionData));
      this.DiscussionDetails.replys=[...this.DiscussionDetails.replys];

      let fd = this.discussionService.ToFormData(obj);
      this.replyFiles.length > 0 &&
        (() => {
          for (let i = 0; i < this.replyFiles.length; i++) {
            fd.append("attachment[]", this.replyFiles[i]);
          }
        })();
        this.newComment = {};
        this.replyFiles = [];
        // this.emailAll = false;
        // console.log('fd',fd)
      // this.discussionService.AddDiscussion(fd).subscribe((data:any) => {
        
        this.appMainService.AddDiscussion(fd).subscribe((data:any) => {

        if(data.success=true){
          this.commentStatus=true;          
        }
        // this.newComment = {};
        // this.replyFiles = [];
        // this.emailAll = false;
      },
      (error)=>{
        //console.log("this is session data",sessionData);
        obj.unsaved_comment_id = this.minus_Id;
        obj.first_name = sessionData.user_current_account.User.first_name;
        obj.last_name = sessionData.user_current_account.User.last_name;
        obj.thumb_image =  'assets/video-huddle/img/c1.png';
        obj.tryAgain =  true;
        obj.uuid =  new Date().getTime();
          
        --this.minus_Id;
        ///console.log("in the errorLog",obj);
        this.discussionAddCommentsTAArray.push(obj);
        this.headerService.setLocalStorage(this.discussionAddCommentTAKey, this.discussionAddCommentsTAArray)

        this.DiscussionDetails.replys.unshift(obj);
        this.DiscussionDetails.replys=[...this.DiscussionDetails.replys]
        //console.log("after push comment",this.DiscussionDetails.replys)
        this.commentStatus=false;
        
      }
      );
      
    }
    let that = this;
    setTimeout(function(){
      that.comment_flag=0;
    },3000);
    
  }
  public createDummyReply(reply,sessionData)
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
  public onCancelReply(){
    this.replyFiles = [];
    this.newComment = {};
    // this.emailAll = false;

    this.headerService.removeLocalStorage(this.discussionAddCommentLSKey);

  }

  public onEditSubmission() {
    this.headerService.removeLocalStorage(this.editDiscussionLSKey);

    if (!this.editDiscData.title || this.editDiscData.title.trim()==""|| !this.editDiscData.comment || 
      this.editDiscData.comment.trim() == "" || this.editDiscData.comment.toString().replace(/<.*?>/g, "") == "" || 
      this.editDiscData.comment.toString().replace(/<.*?>/g, "").trim() == "") {
        this.toastr.info( this.translation.discussion_title_description_required_to_edit);
    } else {
        if(this.Files.length)
        {
            let result =  this.headerService.checkFileSizeLimit(this.Files);
            if(!result.status)
            {
                this.toastr.error(result.message);
                return;
            }
        }

      let sessionData: any = this.headerService.getStaticHeaderData();
      let obj: any = {
        huddle_id: this.params.huddle_id,
        send_email: true,
        comment_id: this.editDiscData.id,
        discussion_id: this.editDiscData.id,
        user_current_account: sessionData.user_current_account,
        remove_attachments: this.stockFiles
          .filter(i => i.isDeleted)
          .map(f => f.document_id)
          .join(",")
      };

      ({ comment: obj.comment, title: obj.title } = this.editDiscData);

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

      this.ModalRefs.editableDiscussionModal.hide();
      this.editDiscData = { title: "", comment: "" };
      this.discussionService.EditDiscussion(fd).subscribe((d: any) => {
       
        // this.toastr.info(d.message);
        if (d.success) {
          this.toastr.info(d.message);
          this.DiscussionDetails.discussion = d.data[0];
          this.bindAvatars()(this.DiscussionDetails);
        } else {
          this.toastr.info(
            d.message || this.translation.something_went_wrong_msg
          );
        }
      }, err => {
        obj.first_name = sessionData.user_current_account.User.first_name;
        obj.last_name = sessionData.user_current_account.User.last_name;
        obj.thumb_image = 'assets/video-huddle/img/c1.png', 
        obj.tryAgain = true;
        obj.editTryAgain = true;
        obj.uuid = new Date().getTime();
        obj.parsedComment = obj.comment.replace(/<.*?>/g, "");

        this.DiscussionDetails.discussion = obj;
        let tmpDiscussionEditArray = this.headerService.getLocalStorage(this.editDiscussionTAKey);
        if(!Array.isArray(tmpDiscussionEditArray)) tmpDiscussionEditArray = [];
          tmpDiscussionEditArray.push(obj);
          this.headerService.setLocalStorage(this.editDiscussionTAKey, tmpDiscussionEditArray);
      });
    }
  }

  public ShowModal(template: TemplateRef<any>, class_name, name) {
    this.ModalRefs[name] = this.modalService.show(template, {ignoreBackdropClick :true,
      class: class_name
    });
  }

  public exportDiscussion() {
    let sessionData: any = this.headerService.getStaticHeaderData(),
      obj: any = {
        huddle_id: this.params.huddle_id,
        detail_id: this.params.discussion_id
      };

    ({
      User: { id: obj.user_id },
      accounts: { account_id: obj.account_id }
    } = sessionData.user_current_account);

    this.discussionService.exportDiscussion(obj);
  }

  public onEmialClick() {
    this.discussion_title =
      this.DiscussionDetails.discussion.title + " - "+this.translation.discussion_discussion_export;
    this.email_attachment_name =
      this.DiscussionDetails.discussion.title + " - "+this.translation.discussion_discussion_export+".docx";
    this.Show_Modal(this.email_discussion, "lg_popup");
  }

  public Show_Modal(template: TemplateRef<any>, class_name) {
    this.ModalRefs.emailModal = this.modalService.show(template, {
      class: class_name
    });
  }

  public emailDiscussion() {
    let flag;
    if (this.user_email == "" || !this.user_email) {
      this.toastr.info(this.translation.discussion_please_enter_email_address);
      return;
    } else {
      flag = this.validateEmail(this.user_email);
    }

    if (!flag) {
      this.toastr.info(this.translation.discussion_please_enter_valid_email_address);
      // this.user_email="";
    } else {
      let sessionData: any = this.headerService.getStaticHeaderData(),
        obj: any = {
          huddle_id: this.params.huddle_id,
          detail_id: this.params.discussion_id,
          user_email: this.user_email,
          email_message: this.email_message
        };

      this.discussionService.email_discussion(obj).subscribe((data: any) => {
        this.toastr.info(data.message);
        this.emptyEmailFields();
      });
      this.ModalRefs.emailModal.hide();
    }
  }

  public validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  public emptyEmailFields() {
    this.email_message = this.translation.discussion_email_message_text;
    this.user_email = "";
  }


  private processDiscussionDetailEventSubscriptions(data){
    // this.socket_listener=this.socketService.EventData.subscribe(data =>{
      console.log('socket data: ', data)

      switch (data.event) {
          case "discussion_deleted":
          this.isAllowed();
          this.processDiscussionDetailDeleted(data.data[0]);
          break;

          case "discussion_added":
          this.isAllowed();
          this.processDiscussionDetailAdded(data.data[0]);
          break;

          case "discussion_edited":
          this.isAllowed();
          this.processDiscussionDetailEdited(data.data[0]);
          break;

          

          
        
        default:
          // code...
          break;
      }
    
    // });
  }

  private isAllowed()
  {

  }

  private processDiscussionDetailDeleted(discussion){
    discussion.thumb_image = this.discussionService.GetAvatar(
      discussion
    );
      if(discussion.parent_comment_id == this.DiscussionDetails.discussion.id)
      {
          this.DiscussionDetails.replys = _.without(this.DiscussionDetails.replys, _.findWhere(this.DiscussionDetails.replys, {
              id: discussion.id
          }));
          if(discussion.created_by != this.sessionData.user_current_account.User.id)
          {
              this.toastr.info(this.translation.discussion_a_comment_deleted);
          }
      }
      else
      {
          let that = this;
          this.DiscussionDetails.replys.forEach(function (comment) {
              if(comment.id == discussion.parent_comment_id)
              {
                  if(!comment.replies || comment.replies.length == 0)
                  {
                      comment.replies = [];
                  }
                  comment.replies = _.without(comment.replies, _.findWhere(comment.replies, {
                      id: discussion.id
                  }));
                  if(discussion.created_by != that.sessionData.user_current_account.User.id)
                  {
                      that.toastr.info(that.translation.discussion_a_reply_deleted);
                      // console.log('Comment Updated.');
                  }
              }
          });
      }

 }

 private processDiscussionDetailAdded(discussion){
   debugger
  discussion.thumb_image = this.discussionService.GetAvatar(
    discussion
  );
  if(discussion.parent_comment_id != 0 && discussion.parent_comment_id==this.params.discussion_id)
   {
    if(!this.DiscussionDetails.replys || this.DiscussionDetails.replys.length == 0)
    {
      this.DiscussionDetails.replys = [];
    }
    
    console.log('on adding reply socket',this.DiscussionDetails.replys,discussion)

    // console.error(this.DiscussionDetails.replys.length);
    // removing fake reply and adding original reply
    // let dummyDiscussion=this.DiscussionDetails.replys.find(d=>d.fake_id==discussion.fake_id);
    let index=this.DiscussionDetails.replys.findIndex(d=>d.fake_id==discussion.fake_id);
    // console.log('d index',index,'d1',dummyDiscussion)
    if(index > -1){
      // debugger
      this.DiscussionDetails.replys.splice(index,1);
    }
    this.DiscussionDetails.replys=[...this.DiscussionDetails.replys]
    // 

    if(this.selectedSort == 1){
      this.DiscussionDetails.replys.unshift(discussion);
    }else if(this.selectedSort == 2){
      this.DiscussionDetails.replys.push(discussion);
    }
    // console.error(this.DiscussionDetails.replys.length);
   this.dirty = !this.dirty;
     if(discussion.created_by != this.sessionData.user_current_account.User.id)
     {
         this.toastr.info(this.translation.discussion_new_comment_added);
           // console.log('New Comment Added.');
     }
   }
   else if(this.DiscussionDetails.replys && this.DiscussionDetails.replys.length)
  {
      let that = this;
      this.DiscussionDetails.replys.forEach(function (comment) {
          if(comment.id == discussion.parent_comment_id)
          {
              if(!comment.replies || comment.replies.length == 0)
              {
                  comment.replies = [];
              }
              // let dummyDiscussion=comment.replies.find(d=>d.fake_id==discussion.fake_id);
              let index=comment.replies.findIndex(d=>d.fake_id==discussion.fake_id);
              // console.log('d index',index,'d1',dummyDiscussion)
              if(index > -1){
                // debugger
                comment.replies.splice(index,1);
              }
              comment.replies=[...comment.replies]

              comment.replies.push(discussion);
              if(discussion.created_by != that.sessionData.user_current_account.User.id){
                  that.toastr.info(that.translation.discussion_new_reply_added);
              }
          }
      })
  }
 }

 private processDiscussionDetailEdited(discussion)
 {
  discussion.thumb_image = this.discussionService.GetAvatar(
    discussion
  );
   if(discussion.parent_comment_id == 0)
   {
     
    this.DiscussionDetails.discussion = discussion;

   }
   else if(discussion.parent_comment_id == this.DiscussionDetails.discussion.id)
   {
     //var indexofdiscussion = this.DiscussionDetails.replys.findIndex(x => x.parent_comment_id == this.DiscussionDetails.discussion.id);
     let replyIndex = this.DiscussionDetails.replys.findIndex(reply => reply.id == discussion.id);
     console.log('replyIndex: ', replyIndex);
     console.log('this.DiscussionDetails.replys: ', this.DiscussionDetails.replys);
     
     this.DiscussionDetails.replys[replyIndex] = discussion;


      // let index = -1;
      // this.DiscussionDetails.replys.forEach((item, i)=>{
      //     item.id == discussion.id && (index = i);
      // });
      // this.DiscussionDetails.replys[index] = discussion;

      this.dirty=!this.dirty;
     if(discussion.created_by != this.sessionData.user_current_account.User.id)
     {
         this.toastr.info(this.translation.discussion_a_comment_updated);
           // console.log('Comment Updated.');
     }
   }
   else
   {
       let that = this;
       this.DiscussionDetails.replys.forEach(function (comment) {
           if(comment.id == discussion.parent_comment_id)
           {
               if(!comment.replies || comment.replies.length == 0)
               {
                   comment.replies = [];
               }
               let index = -1;

               comment.replies.forEach((item, i)=>{
                   item.id == discussion.id && (index = i);
               });

               comment.replies[index] = discussion;
               that.dirty=!that.dirty;
               if(discussion.created_by != that.sessionData.user_current_account.User.id)
               {
                   that.toastr.info(that.translation.discussion_a_reply_updated);
                   // console.log('Comment Updated.');
               }
           }
       });

   }


 }


  AddDiscussionSubmit() {}

  deleteComment(event) {
    this.commentID = event;
    this.Show_Modal(this.deleteTemplate, "sm_popup");
  }
  confirmDelete() {
    this.confirmDeleteString = 'DELETE'
    if (this.confirmDeleteString == "DELETE") {
      this.counter=1;
      let obj:any = {
        discussion_id: this.commentID,
        original_discussion_id: this.DiscussionDetails.discussion.id,
      };

      const params = this.detailService.GetParams();
      obj.huddle_id = params.id;
        this.appMainService.DeleteDiscussion(obj).subscribe(
     
        data => {
          let d: any = data;
          if (d.success) {
            //this.counter=1;
            // this.toastr.success(
            //   this.translation.discussion_comment_deleted_successfully
            // );

            this.DiscussionDetails.replys = this.DiscussionDetails.replys.filter(
              d => d.id != this.commentID
            );
            
          } else {
             this.toastr.info(d.message, this.translation.discussion_delete_confirmation);
            //this.toastr.info(d.message, "Cannot deleted");
          }
          this.deSelectDeleteField();
          //this.deletableDiscussion = {};
          // this.getDiscussions(this.huddle_id);
        },
        error => {
          this.toastr.error(error.message);
        }
      );
    } else {
      //this.counter=0;
      this.toastr.info(this.translation.discussion_type_delete);
    }
    
  }

  deSelectDeleteField() {
    this.ModalRefs.emailModal.hide();
    let that = this;
    setTimeout(function(){
      that.counter=0;
    },500);
    
    
    this.confirmDeleteString = "";
  }

  public editorStateListner(event){
    this.editorShow=event
    //console.log("state",this.editorShow)
  }
  public detailEmit(){
    this.discussionService.dDemit.emit(true);
  }
  // public TriggerTextChange(ev){
  //   if(ev.keycode==13){
  //     this.confirmDelete();
  //     console.log(ev.keycode);
  //   }
  // }

  // public TriggerTextChange(event){
  //   if(event.keyCode==13) {
  //     this.confirmDelete();
  //   }
  // }

  public TriggerTextChange(event){
    //console.log(event);
    if(this.counter==0){
      //this.counter=1;
      if(event.keyCode==13) {

      //this.counter=1;
      this.confirmDelete();
        
      }
      //this.keydown(event).event.preventDefault();
    }
  }
  saveCommentAgain(event){
    let fd = this.discussionService.ToFormData(event);
      this.replyFiles.length > 0 &&
        (() => {
          for (let i = 0; i < this.replyFiles.length; i++) {
            fd.append("attachment[]", this.replyFiles[i]);
          }
        })();
    this.discussionService.AddDiscussion(fd).subscribe((data:any) => {
      let indexofcomment =  this.DiscussionDetails.replys.findIndex(x => x.uuid == event.uuid);
      let replyIndex = this.discussionAddCommentsTAArray.findIndex(x => x.uuid == event.uuid);

        if(indexofcomment>=0){
          this.DiscussionDetails.replys.splice(indexofcomment,1);
          console.log("in spliced array",this.DiscussionDetails.replys);
          this.DiscussionDetails.replys =[...this.DiscussionDetails.replys];
          
        }

        if(replyIndex > -1) {
          this.discussionAddCommentsTAArray.splice(replyIndex,1);
          this.headerService.setLocalStorage(this.discussionAddCommentTAKey, this.discussionAddCommentsTAArray)
        }
        
      if(data.success=true){

        this.commentStatus=true;          
      }
      this.newComment = {};
      this.replyFiles = [];
      // this.emailAll = false;
    }, 
    (error)=>{
      event.processing = true;
      // event.unsaved_comment_id = this.minus_Id;
      // --this.minus_Id;
      // this.DiscussionDetails.replys.push(event);
      // var indexofcomment =  this.DiscussionDetails.replys.findIndex(x => x.comment_id == event.comment_id);
      //   if(indexofcomment>0){
      //     this.DiscussionDetails.replys.splice(indexofcomment,0);
      //   }
      // this.DiscussionDetails.replys=[...this.DiscussionDetails.replys]
      // this.commentStatus=false;
    }
    );
  }
  unSavedEditedCommentAgain(editableComment){
    var indexofcomment =  this.DiscussionDetails.replys.findIndex(x => x.id == editableComment.comment_id);
    //console.log("index of edit",indexofcomment);
    //console.log("array in edit",this.DiscussionDetails.replys);
    if(indexofcomment!=-1){
      this.DiscussionDetails.replys[indexofcomment] = editableComment
      
      // this.DiscussionDetails.replys[indexofcomment].comment = editableComment.comment
      //this.DiscussionDetails.replys[indexofcomment].unsavedEditedComment = editableComment.unsavedEditedComment;
  
    this.DiscussionDetails.replys = [...this.DiscussionDetails.replys]
    }
    
  }
  unsavedEditedCommentRemove(editedComment){
    console.log("this is for removing",this.DiscussionDetails.replys);
    var indexofcomment =  this.DiscussionDetails.replys.findIndex(x => x.id == editedComment.comment_id);
    if(indexofcomment!=-1){
      this.DiscussionDetails.replys.splice(indexofcomment,1);
      console.log("in spliced array",this.DiscussionDetails.replys);
    this.DiscussionDetails.replys =[...this.DiscussionDetails.replys];
    }
    
  }

  public editDiscussionTryAgain(discussion: any){
    if(discussion.processing) return;
    discussion.processing = true;

    let fd = this.discussionService.ToFormData(discussion); // not using cause of date string issue
    let newFd = new FormData;
    newFd.append('huddle_id',discussion.huddle_id)
    newFd.append('send_email',discussion.send_email)
    newFd.append('comment_id',discussion.comment_id)
    newFd.append('commentable_id',discussion.commentable_id)
    newFd.append('discussion_id',discussion.discussion_id)
    newFd.append('remove_attachments',discussion.remove_attachments)
    newFd.append('title',discussion.title)
    newFd.append('notification_user_ids',discussion.notification_user_ids)
    newFd.append('comment',discussion.comment)
    newFd.append('user_id',discussion.user_id)
    newFd.append('account_id',discussion.account_id)
    newFd.append('user_current_account',discussion.user_current_account)
    this.discussionService.EditDiscussion(newFd).subscribe((d: any) => {
      if (d.success) {
        this.toastr.info(d.message);
        this.DiscussionDetails.discussion = d.data[0];
        this.bindAvatars()(this.DiscussionDetails);
        this.DiscussionDetails.discussion.parsedComment = this.DiscussionDetails.discussion.comment.replace(/<.*?>/g, "");


        // remove from local storage
        let tmpDiscussionEditArray = this.headerService.getLocalStorage(this.editDiscussionTAKey);
        if(Array.isArray(tmpDiscussionEditArray) && tmpDiscussionEditArray.length > 0){
          tmpDiscussionEditArray = tmpDiscussionEditArray.filter(dis => dis.uuid != discussion.uuid);
          this.headerService.setLocalStorage(this.editDiscussionTAKey, tmpDiscussionEditArray);
        }
      } else {
        this.toastr.info(
          d.message || this.translation.something_went_wrong_msg
        );
      }
    }, err => {

    discussion.processing = false;

    });

  }

  public cancelEditDiscussionModal(){
    this.ModalRefs.editableDiscussionModal.hide();
    // this.editDiscData = { title: "", comment: "" };
    this.headerService.removeLocalStorage(this.editDiscussionLSKey);
  }

  private saveEditDiscussionToLocalStorage (): void {
    if(this.editDiscData.title || this.editDiscData.comment){
      let obj = {title: this.editDiscData.title, comment: this.editDiscData.comment};
      this.headerService.setLocalStorage(this.editDiscussionLSKey, obj);
    }
  }

  private saveDiscussionAddCommentToLocalStorage (): void {
    if(this.newComment.comment){
      this.headerService.setLocalStorage(this.discussionAddCommentLSKey, this.newComment.comment);
    }
  }
 
  ngOnDestroy() {
    this.saveEditDiscussionToLocalStorage();
    this.saveDiscussionAddCommentToLocalStorage();

    this.subscription.unsubscribe();
    // this.socket_listener.unsubscribe(); 
    // this.socketService.destroyEvent(`discussions-details-${this.params.discussion_id}`);
  }
  
}

interface Modals {
  [key: string]: any;
}
