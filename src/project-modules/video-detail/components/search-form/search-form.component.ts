import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, OnDestroy } from '@angular/core';
import { MainService } from "@videoDetail/services";
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
export class SearchFormComponent implements OnInit, OnDestroy {

	public searchData;
	public settings;
  private selectedTag;
  public modalRef:BsModalRef;
  public EmailData;
  private file;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
	@Input('customMarkers') customMarkers;
	@Input('classes') classes;
  @Output('settingsChanged') settingsChanged:EventEmitter<any> = new EventEmitter<any>();
  @Input() params;
  @Input() VideoInfo;
  @Input() options;
  @Input() permissions;
  constructor(private toastr:ToastrService, private modalService:BsModalService, private headerService:HeaderService, private mainService:MainService) { 
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }

  ngOnInit() {
  	this.searchData = {text:localStorage.getItem('searchDataText'),tag_id:localStorage.getItem('LsTagId')};
    this.settings = {};
    this.settings.autoscroll = false;
    this.settings.sortBy = 0;
    this.EmailData = {};

    // console.log(this.options);
    this.initOptions();
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
    // console.log(this.translation);
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

  public HandleFile(files, ref){
    console.log(files[0].size);
    console.log(files[0].name);
    console.log(files[0].type);
    if(files[0].size > 2000000){
      this.toastr.info(this.translation.vd_file_to_large);
      // files[0].nativeElement.reset();
      ref.value = "";
      return;
    }else{
      this.file = files[0];
    }

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
          this.toastr.info(this.translation.vd_please_provide);
          return;
        }

      }else{
        if(!this.isValidEmail(this.EmailData.email)){
          this.toastr.info(this.translation.vd_valid_email_address);
          return;
        }
      }

      if(!this.EmailData.subject){

        this.toastr.info(this.translation.vd_please_provide_email);
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
    this.subscription.unsubscribe();
    if(this.modalRef) this.modalRef.hide();
  }

}
