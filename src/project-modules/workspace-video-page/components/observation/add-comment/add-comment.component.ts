import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { MainService } from "../../../services";
import { ToastrService } from "ngx-toastr";
import { HeaderService } from "@projectModules/app/services";
import * as _ from "underscore";
import { Subscription } from 'rxjs';

@Component({
  selector: 'add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.css']
})
export class AddCommentComponent implements OnInit, OnDestroy, OnChanges {

	// Class Props
	public newComment;
  private params;
  public videoOptions;
  public header_data;
  public translation: any = {};
  private translationSubscription: Subscription;

	// Inputs
	@Input() permissions;
  @Input() selectedRubrics;
  @Input() rubrics;
  @Input() settings;
  @Input() presetTags;
  @Input() text;
  @Input() EditMode;
  @Input() files;
	// Outputs
	@Output() customTags = new EventEmitter<any>();
  @Output() onTabSelection = new EventEmitter<any>();
  @Output() onRubricDelete = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() TypingStarted = new EventEmitter<any>();
  @Output() commentText = new EventEmitter<any>();

  ngOnChanges(change){

    if(change.text && change.text.currentValue){
      if(!this.newComment) this.newComment = {};
      this.newComment.commentText = change.text.currentValue;
    }

    if(change.files){
      if(!this.newComment) this.newComment = {};
      this.newComment.files = change.files.currentValue;
    }

  }

  constructor(private headerService:HeaderService, public mainService:MainService, private toastr:ToastrService) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
  	this.initVars();
  
    
    
    this.mainService.ResetForm.subscribe((d)=>{

      this.ResetForm();

    });
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

    private ResetForm(){

    this.newComment.commentText = "";
    this.newComment.files = [];
    this.selectedRubrics = [];
    this.mainService.ResetCustomTags();
    this.mainService.ResetSelectedRubrics();

    // this.rubrics.forEach((r)=>{r.selected=false;});
    // this.EditableComment = {};
    
    this.EditMode = false;

  }

  private initVars(){

   this.videoOptions = {};
    if(!this.newComment){ 
      this.newComment = {};
    }
  	
  }

  public AddTextComment(){

    if(!this.newComment.commentText){

      this.toastr.info(this.translation.myfile_enter_text_comment);
      return;

    }

    if(!this.newComment.files) this.newComment.files = [];
    this.onAdd.emit({text:this.newComment.commentText, files: this.newComment.files});
    this.rubrics.account_tag_type_0.forEach((r)=>{r.selected=false;});

  }

    public RemoveFileFromComment(file, i){

    let index = _.findIndex(this.newComment.files, {url: file.url});    
    this.newComment.files.splice(i,1);

    if(index >-1){

      let subIndex = _.findIndex(this.newComment.files, {url:file.url});
      this.newComment.files.splice(index, 1);
      // this.ResolveDeleteFile(1,file.id);

    }


  }

 
  public SetCustomTags(tags){
  	 
  	this.customTags.emit(tags);

  }

  public RemoveSelectedRubric(r,i){

    this.onRubricDelete.emit({rubric:r, index:i});

  }

  public ActivateTab(tab_id){

    this.onTabSelection.emit(tab_id);

  }

  public EditTextComment(flag){

    if(flag==0){
      this.ResetForm();
      this.onEdit.emit(false);
      return;
    }

    this.onEdit.emit({flag:flag, text:this.newComment.commentText});

  }
     public TriggerTextChange(ev){

      if(ev.keyCode==13 && this.settings.EnterToPost){

        ev.preventDefault();

          this.AddTextComment();

      }else{

         let context = this;
        setTimeout(()=>{

            context.commentText.emit(context.newComment.commentText);

        }, 50);

      }

      if(!this.newComment.commentText || this.newComment.commentText.length==0){
        this.TypingStarted.emit(true);
      }

    }

  public AppendNewFiles(obj) {
    if(obj.from == 'comment') {
      if(!this.newComment.files) this.newComment.files = [];
      this.newComment.files = this.newComment.files.concat(obj.files);
    }
  }

  ngOnDestroy(){
    this.translationSubscription.unsubscribe();
  }

}
