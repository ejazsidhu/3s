import {  Component,  OnInit,  Input,  ViewChild,  TemplateRef,  EventEmitter,  Output, OnDestroy} from "@angular/core";
import { DetailsHttpService } from "../servic/details-http.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { DiscussionService } from "../servic/discussion.service";
import IUpload from "../discussions/IUpload";
import { ToastrService } from "ngx-toastr";
import { HeaderService } from "@projectModules/app/services";
import { PermissionService } from '../servic/permission.service';
import { Subscription } from 'rxjs';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import * as moment from 'moment';

@Component({
  selector: "single-discussion",
  templateUrl: "./single-discussion.component.html",
  styleUrls: ["./single-discussion.component.css"]
})
export class SingleDiscussionComponent implements OnInit, OnDestroy, IUpload {
  @Input() discussion;
  @Input() params;
  public editDiscData: any = {};
  public ModalRefs: any = {};
  public Files: any = [];
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;
  private DISCUSSION_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.DISCUSSION;
  private editDiscussionTitleLSKey: string = '';
  private editDiscussionCommentLSKey: string = '';
  private editDiscussionTAKey: string = '';
  
  
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild("editDiscussion", {static: false}) editDiscussion;

  constructor(
    public discussionService: DiscussionService,
    public detailService: DetailsHttpService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public headerService: HeaderService,
    public permissionService:PermissionService  ) {
      this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
        this.translation = languageTranslation;
      });
    }

  ngOnInit() {
    this.discussion.parsedComment = this.discussion.comment.replace(/<.*?>/g, "");
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    
    this.editDiscussionTitleLSKey = `${this.DISCUSSION_LS_KEYS.EDIT_D_TITLE}${this.discussion.id}_${this.params.id}_${this.headerService.getUserId()}`;
    this.editDiscussionCommentLSKey = `${this.DISCUSSION_LS_KEYS.EDIT_D_COMMENT}${this.discussion.id}_${this.params.id}_${this.headerService.getUserId()}`;
    this.editDiscussionTAKey = `${this.DISCUSSION_LS_KEYS.EDIT_TA}${this.params.id}_${this.headerService.getUserId()}`;
    

    window.onbeforeunload = () => this.ngOnDestroy(); // listen to the events like refresh or tab close

  }

  public editDiscussion_popup(item: any) {
    this.editDiscData = JSON.parse(JSON.stringify(item));
    console.log('this.editDiscData: ', this.editDiscData)

    /** Restore  and set edit discussion localstorage object start */
    const lsEditDiscussionTitle = this.headerService.getLocalStorage(this.editDiscussionTitleLSKey);
    if(lsEditDiscussionTitle){
      this.editDiscData.title = lsEditDiscussionTitle;  
    }

    const lsEditDiscussionComment = this.headerService.getLocalStorage(this.editDiscussionCommentLSKey);
    if(lsEditDiscussionComment){
      this.editDiscData.comment = lsEditDiscussionComment;  
    }
    /** Restore  and set edit discussion localstorage object end */

    this.Files = [];
    // this.deletedIds = [];
    this.unDeleteAttachments();
    this.ShowModal(this.editDiscussion, "lg_popup");
    //this.editDiscussion.show();
  }

  onUpload(e: any) {
    let target = e.target;
    target.files.length > 0 && this.pushToFiles(target.files);
    target.value = "";
  }
  public TriggerUpload() {
    document.getElementById(`file_${this.discussion.id}`).click();
  }
  public pushToFiles(files: any): any {
    for (let i = 0; i < files.length; i++) {
      this.Files.push(this.discussionService.parseFile(files[i]));
    }
  }

  public unDeleteAttachments() {
    // console.log('Testing',this.discussion)
    this.discussion.attachments.length > 0 &&
      (() => {
        this.discussion.attachments.forEach(
          d => (d.isDeleted = false)
        );
      })();
  }

  public onEditSubmission() {
    this.headerService.removeLocalStorage(this.editDiscussionTitleLSKey);
    this.headerService.removeLocalStorage(this.editDiscussionCommentLSKey);

    if (!this.editDiscData.title || this.editDiscData.title.trim()=="" || 
      !this.editDiscData.comment || this.editDiscData.comment.trim() == "" || 
      this.editDiscData.comment.toString().replace(/<.*?>/g, "") == "" || 
      this.editDiscData.comment.toString().replace(/<.*?>/g, "").trim() == "") {
        this.toastr.info(this.translation.discussion_title_description_required_to_edit );
        return;
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
        huddle_id: this.params.id,
        send_email: true,
        comment_id: this.discussion.id,
        discussion_id: this.discussion.id,
        user_current_account: sessionData.user_current_account,
        remove_attachments: this.discussion.attachments
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
            console.log('this.Files[i]: ', this.Files[i]);
          }
        })();

      this.ModalRefs.editDiscussionModal.hide();
      this.editDiscData = { title: "", comment: "" };
      this.discussionService.EditDiscussion(fd).subscribe((d: any) => {
        if (d.success) {
          this.toastr.info(d.message)
          this.discussion = d.data[0];
        } else {
          this.toastr.info(
            d.message || this.translation.something_went_wrong_msg
          );
        }
      }, err => {
        obj.first_name = sessionData.user_current_account.User.first_name;
        obj.last_name = sessionData.user_current_account.User.last_name;
        obj.thumb_image = 'assets/img/photo-default.png', 
        obj.tryAgain = true;
        obj.editTryAgain = true;
        obj.uuid = new Date().getTime();
        obj.parsedComment = obj.comment.replace(/<.*?>/g, "");

        this.discussion = obj;
        let tmpDiscussionEditArray = this.headerService.getLocalStorage(this.editDiscussionTAKey);
        if(!Array.isArray(tmpDiscussionEditArray)) tmpDiscussionEditArray = [];
          tmpDiscussionEditArray.push(obj);
          this.headerService.setLocalStorage(this.editDiscussionTAKey, tmpDiscussionEditArray);
      });
    }
  }

  public ShowModal(template: TemplateRef<any>, class_name) {
    this.ModalRefs.editDiscussionModal = this.modalService.show(template, {
      ignoreBackdropClick :true,
      class: class_name
    });
  }

  findLength(){
    let comnt = this.discussion.comment.replace(/<.*?>/g, "");
    return comnt.length;
  }
  public saveDiscussionAgain(discussion){
    // debugger
    if(discussion.processing) return;
    discussion.processing = true;
    // discussion.fake_id=moment(new Date()).format('x');

    this.detailService.saveDiscussionEmitter(discussion);
    // this.detailService.removeUnsavedDiscussion(discussion);
  }

  public editDiscussionTryAgain(discussion: any){
    // debugger
    if(discussion.processing) return;
    discussion.processing = true;
    // discussion.fake_id=moment(new Date()).format('x');
    let fd = this.discussionService.ToFormData(discussion);

    this.discussionService.EditDiscussion(fd).subscribe((d: any) => {
      if (d.success) {
        this.toastr.info(d.message)
        this.discussion = d.data[0];
        this.discussion.parsedComment = this.discussion.comment.replace(/<.*?>/g, "");


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

  public editModalChange(key: string, value: string){
    if(key === 'title'){
      if(value) this.headerService.setLocalStorage(this.editDiscussionTitleLSKey, value);
      else this.headerService.removeLocalStorage(this.editDiscussionTitleLSKey);
    } else if(key === 'comment'){
      if(value) this.headerService.setLocalStorage(this.editDiscussionCommentLSKey, value);
      else this.headerService.removeLocalStorage(this.editDiscussionCommentLSKey);
    }

  }

  public cancelEditDiscussionModal(){
    this.ModalRefs.editDiscussionModal.hide();
    // this.editDiscData = { title: "", comment: "" };
    this.headerService.removeLocalStorage(this.editDiscussionTitleLSKey);
    this.headerService.removeLocalStorage(this.editDiscussionCommentLSKey);
  }

  ngOnDestroy(){

    this.subscription.unsubscribe();
    if(this.ModalRefs && this.ModalRefs.editDiscussionModal) this.ModalRefs.editDiscussionModal.hide();
  }

  
}
