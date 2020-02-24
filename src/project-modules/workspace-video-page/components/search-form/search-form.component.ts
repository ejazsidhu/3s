import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, OnChanges, OnDestroy} from '@angular/core';
import { MainService } from "../../services";
import { HeaderService } from "@projectModules/app/services";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ToastrService } from "ngx-toastr";
import { Subscription } from 'rxjs';

@Component({
  selector: 'search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit, OnDestroy, OnChanges {

	public searchData;
	public settings;
  private selectedTag;
  public modalRef:BsModalRef;
  public EmailData;
  private file;
  public header_data;
  public translation: any = {};
  private translationSubscription: Subscription;
	@Input('customMarkers') customMarkers;
	@Input('classes') classes;
  @Output('settingsChanged') settingsChanged:EventEmitter<any> = new EventEmitter<any>();
  @Input() params;
  @Input() VideoInfo;
  @Input() options;
  @Input() autoscroll;
  @Input() permissions;
  constructor(private toastr:ToastrService, private modalService:BsModalService, private headerService:HeaderService, private mainService:MainService) { 
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }

  ngOnChanges(change){

    if(change.autoscroll){
      if(!this.settings) this.settings = {};
      this.settings.autoscroll = change.autoscroll.currentValue;
    }

  }

  ngOnInit() {
    this.searchData = {text:localStorage.getItem('searchDataText'),tag_id:localStorage.getItem('LsTagId')};
    if(!this.settings)
  	this.settings = {};
    // this.settings.autoscroll = false;
    this.settings.sortBy = 0;
    this.EmailData = {};

    // console.log(this.options);
    this.initOptions();
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

  private initOptions(){

    if(!this.options){
      this.options = {sorting:true, others:true, export:true};
    }

  }

  public searchTextChanged(ev){

    localStorage.setItem('searchDataText',ev)
  	this.mainService.TriggerSearchChange({text:ev});

  }

  public ExportComments(to){

    let sessionData:any = this.headerService.getStaticHeaderData();

    let obj = {
      video_id: this.params.video_id,
      huddle_id: this.params.huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      sort_by: this.FormatSortingOptions(this.settings.sortBy)
    }

    this.mainService.ExportComments(obj, to);

  }

  private FormatSortingOptions(flag){

    return ["newest", "oldest", "timestamp"][flag];
    

  }

  public HandleFile(files){

    this.file = files[0];

  }

  public ResolveEmail(flag){

    if(flag==0){

      this.EmailData = {};
      this.modalRef.hide();
      return;

    }else{

      if(this.EmailData.email.indexOf(",")>-1){

        let valid = true;

        let arr = this.EmailData.email.split(",");

        arr.forEach((e)=>{

          if(!this.isValidEmail(e)){
            valid = false;
          }


        });

        if(!valid){
          this.toastr.info(this.translation.myfile_comma_seprated_email);
          return;
        }

      }else{
        if(!this.isValidEmail(this.EmailData.email)){
          this.toastr.info(this.translation.myfile_valid_email);
          return;
        }
      }

      if(!this.EmailData.subject){

        this.toastr.info(this.translation.myfile_subject);
        return;

      }

      let sessionData:any = this.headerService.getStaticHeaderData();
      let obj = {
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        account_id: sessionData.user_current_account.accounts.account_id,
        email: this.EmailData.email,
        subject: this.EmailData.subject,
        message: this.EmailData.message,
        additional_attachemnt: this.file

      }
      this.modalRef.hide();
      this.mainService.SendEmail(obj).subscribe((data:any)=>{

        this.toastr.info(data.message);

      });

    }

  }

  private isValidEmail(email){

    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());

  }

   public InitiateEmailDialog(template: TemplateRef<any>, file){
     
    this.EmailData.email = this.VideoInfo.email;
    this.EmailData.subject = this.VideoInfo.title;

    this.modalRef = this.modalService.show(template, {class:"modal-md model-send-email"});
  }

  public sortBy(flag){

    this.settingsChanged.emit({sortBy:flag});
    this.settings.sortBy = flag;

  }

  public ToggleAutoScroll(){

    this.settings.autoscroll = !this.settings.autoscroll;

    let sessionData:any = this.headerService.getStaticHeaderData();
    let obj = {
      user_id: sessionData.user_current_account.User.id,
      account_id: sessionData.user_current_account.accounts.account_id,
      value: Number(this.settings.autoscroll)
    };

    this.mainService.SaveAutoscrollSettings(obj).subscribe((data)=>{});

    this.settingsChanged.emit({autoscroll:this.settings.autoscroll});
  }

  public SelectTag(tag){
	
  let tag_id = -1;
  let lsTagid=localStorage.getItem('LsTagId');
  	
  	if(this.selectedTag == tag){

  		this.selectedTag = {};
  	}
  	else{
  		this.selectedTag = tag;
  		tag_id = tag.account_tag_id;
    }
    if(lsTagid!=tag_id.toString()){

      localStorage.setItem('LsTagId',JSON.stringify(tag_id))
    }
    else{
      localStorage.setItem('LsTagId','-1')
    }
  	this.mainService.TriggerSearchChange({text: this.searchData.text, tag_id:tag_id})

  }

  public getBg(tag, index){

  	if(this.selectedTag == tag){

  		return this.classes[index];

    }

    if(localStorage.getItem('LsTagId')==tag.account_tag_id){
      return this.classes[index];
    }
  }

  ngOnDestroy(){
    this.translationSubscription.unsubscribe();
    if(this.modalRef) this.modalRef.hide();
  }

}
