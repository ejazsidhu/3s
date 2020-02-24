import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { MainService } from "@videoDetail/services";
import { HeaderService } from "@projectModules/app/services";
import { ToastrService } from "ngx-toastr";
import { Subscription } from 'rxjs';
import * as _ from "underscore";
import { BsModalRef } from 'ngx-bootstrap';
@Component({
  selector: 'add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.css']
})
export class AddCommentComponent implements OnInit, OnDestroy, OnChanges {

  // Class Props
  public newComment:any={};
  private params;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;

  // Inputs
  @Input() permissions;
  @Input() selectedRubrics;
  @Input() rubrics;
  @Input() settings;
  @Input() presetTags;
  @Input() text;
  @Input() EditMode;
  @Input() selectedFiles:any;
  @Input() huddleCradentials;
  @Input() timerStatus='stopped';
  @Input() isTimerStart;
  @Input() isREcordingOn;
  // Outputs
  @Output() customTags = new EventEmitter<any>();
  @Output() onTabSelection = new EventEmitter<any>();
  @Output() onRubricDelete = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() TypingStarted = new EventEmitter<any>();
  @Output() commentText = new EventEmitter<any>();
  @Output() updateFilesCount = new EventEmitter<any>();
  public modalRef: BsModalRef;
  DeletableFile: any={};
  commentTextForModal=""
  commentTextForModalAdd: string="";
  ngOnChanges(change) {

    if (change.text && change.text.currentValue) {
      if (!this.newComment) this.newComment = {};
      this.newComment.commentText = change.text.currentValue;
      this.commentTextForModal=this.newComment.commentText;
      localStorage.setItem('edit_comment',this.commentTextForModal)
    }

    if(this.isREcordingOn)
    localStorage.setItem('live_edit_comment',this.commentTextForModal)

    // if(this.selectedFiles)
    //  this.selectedFiles.concat(this.newComment.files)
    //  else
    //  this.selectedFiles=[]

  }

  constructor(public mainService: MainService, private toastr: ToastrService, private headerService: HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    let sessionData: any = this.headerService.getStaticHeaderData();

    // Dynamic Button Colors Start
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
    this.header_color = sessionData.header_color;
    this.primery_button_color = sessionData.primery_button_color;
    this.secondry_button_color = sessionData.secondry_button_color;
    // Dynamic Button Colors End

    this.initVars();

    if (this.params)
      this.newComment.commentText = localStorage.getItem('video_play_synced_comment_' + this.params.video_id);
    if (this.EditMode) this.newComment.commentText = localStorage.getItem('video_play_synced_edit_comment_' + this.params.video_id);
    this.mainService.ResetForm.subscribe((d) => {

      this.ResetForm();

    });
  }

  private ResetForm() {

    this.newComment.commentText = "";
    this.commentTextForModal="";
    this.commentTextForModalAdd=""
    this.newComment.files = [];
    // this.selectedRubrics = [];
    this.mainService.ResetCustomTags();
    this.mainService.ResetSelectedRubrics();
    this.selectedRubrics.forEach((r)=>{r.selected=false;});
    // this.EditableComment = {};

    this.EditMode = false;

  }

  private initVars() {


    if (!this.newComment) {
      console.log("Something");
      this.newComment = {};
    }

  }

  public AddTextComment() {
    // if (!this.newComment.commentText) {
      if(!this.commentTextForModalAdd){

        if(!this.commentTextForModal)
      this.toastr.info(`${this.translation.vd_pleaseentersometexttocomment}`);
      return;

    }
    let obj = {
      text: this.newComment.commentText=this.commentTextForModalAdd,
      files: this.newComment.files
    }
    //this.ResetForm();
    // this.onAdd.emit(this.newComment.commentText);this.commentTextForModal
    this.onAdd.emit(obj);
    // this.commentTextForModal=""

  }

  public SetCustomTags(tags) {

    this.customTags.emit(tags);

  }

  public RemoveSelectedRubric(r, i) {

    this.onRubricDelete.emit({ rubric: r, index: i });

  }

  public ActivateTab(tab_id) {

    this.onTabSelection.emit(tab_id);

  }

  public EditTextComment(flag) {
let text=localStorage.getItem('edit_comment');
let text_live=localStorage.getItem('live_edit_comment');

    if (flag == 0 ) {
      this.mainService.isEditComent = false;
      if(text!==this.commentTextForModal){
        this.commentTextForModal=text || "";
      }
      if(this.isREcordingOn)
      this.commentTextForModalAdd=""
      // this.ResetForm();
      this.resetFormInCaseEdit()
      this.onEdit.emit(false);
      return;

    }
    
    let obj={ flag: flag, text: this.newComment.commentText=this.commentTextForModal,files:this.newComment.files }
    if(this.rubrics)
this.rubrics.account_tag_type_0.forEach((r)=>{r.selected=false;});
    this.onEdit.emit(obj);

  }

  public resetFormInCaseEdit(){
    this.mainService.ResetCustomTags();
    this.mainService.ResetSelectedRubrics();
    this.selectedRubrics.forEach((r)=>{r.selected=false;});
  }
  public TriggerTextChange(ev) {

    if (ev.keyCode == 13 && this.settings.EnterToPost) {

      ev.preventDefault();

      this.AddTextComment();

    } else {

      let context = this;
      setTimeout(() => {

        context.commentText.emit(context.newComment.commentText);

      }, 50);

    }

    if (!this.newComment.commentText || this.newComment.commentText.length == 0) {
      this.TypingStarted.emit(true);
    }
    if (!this.commentTextForModal || this.commentTextForModal.length == 0) {
      this.TypingStarted.emit(true);
    }
    if (!this.commentTextForModalAdd || this.commentTextForModalAdd.length == 0) {
      this.TypingStarted.emit(true);
    }

  }

  public AppendNewFiles(obj) {
    // files.forEach((f)=>{ f.title = f.filename; });
    if (obj.from == 'comment') {
      if (this.newComment.files)
        this.newComment.files = this.newComment.files.concat(obj.files);
    
      else {
        this.newComment.files = [];
        this.newComment.files = this.newComment.files.concat(obj.files);

      }

      this.selectedFiles.push(obj.files[0]);
      console.log("selected files ",this.selectedFiles)


    }


  }
  public RemoveFileFromComment(file, i) {
    let index = _.findIndex(this.selectedFiles, {url: file.url});
    
    let index2 = _.findIndex(this.newComment.files, {url: file.url});
    if(index2 >-1){
    this.newComment.files.splice(i, 1);
    // this.selectedFiles.splice(i, 1);
    }


    if(index >-1){

      let subIndex = _.findIndex(this.selectedFiles, {url:file.url});
      if(file.id)
      this.ResolveDeleteFile(1,file.id);
      else
      this.selectedFiles.splice(index, 1);


    }


  }

  public ResolveDeleteFile(flag, id?){
    let sessionData = this.headerService.getStaticHeaderData();
      let obj = {
        huddle_id:this.huddleCradentials.huddle_id,
        video_id: this.huddleCradentials.video_id,
        document_id:this.DeletableFile.id?this.DeletableFile.id:id,
        user_id: this.header_data.user_current_account.User.id,
      }

      this.mainService.DeleteResource(obj).subscribe((data:any)=>{
// commentting this condition check to remove this form local array wheter we  get positive or nagative respose for nw
        // if(!data.error){
         
            // this.toastr.info(this.translation.resource_deleted);
            let index = _.findIndex(this.selectedFiles, {id: id? id: this.DeletableFile.id});
            if(index >-1){
              this.selectedFiles.splice(index, 1);
              // this.totals.resources_count--;
              this.updateCount()
            }


        // }

      });

    

  }

  updateCount(){
    this.updateFilesCount.emit(this.selectedFiles)
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
