import { Component, OnInit, NgModule, TemplateRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { MainService } from '@addHuddle/services';
import { HeaderService } from "@projectModules/app/services";

import * as _ from "underscore";
import { Subscription } from 'rxjs';

@NgModule({

	imports: [
		ModalModule
	]
})

@Component({
  selector: 'more-settings',
  templateUrl: './more-settings.component.html',
  styleUrls: ['./more-settings.component.css']
})


export class MoreSettingsComponent implements OnInit, OnDestroy, OnChanges {

  modalRef: BsModalRef;
	// public HuddleSettings;
	public frameworks;
	public header_data;
	public translation: any = {};
	private subscription: Subscription;
	@Input('huddle_type') huddle_type;
	@Input('HuddleSettings') HuddleSettings;
	@Input('EditMode') EditMode;
	@Input() enable_framework_standard;
	@Input('cirqEnabled') cirqEnabled;
	constructor(private headerService:HeaderService, private modalService: BsModalService, private mainService:MainService) { 
		this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
	}

  ngOnInit() {

	  // this.HuddleSettings = {};
	  //this.HuddleSettings.show_publish_comments=false;
	  this.GetFrameworks();
	 // this.HuddleSettings.selected_framework = 0;
	  
	//   this.HuddleSettings.enable_publish = 1;
	  this.header_data = this.headerService.getStaticHeaderData();
	//   this.translation = this.header_data.language_translation; // changed to observable stream

	//   if(this.HuddleSettings.show_publish_comments){
	//   	this.HuddleSettings.enable_publish = 1;	
	//   }
	//   else{
	//   	this.HuddleSettings.enable_publish = 0;	
	//   }
  

  }

  ngOnChanges(change){

  //	console.log(change);
// debugger

	  	if(change.HuddleSettings && change.HuddleSettings.currentValue.selected_framework && this.EditMode && this.frameworks && this.frameworks.length>0){
	  	//	;
	  		let index = _.findIndex(this.frameworks, {account_tag_id: Number(change.HuddleSettings.currentValue.selected_framework)});
	  		if(index == -1){
	  			change.HuddleSettings.currentValue.selected_framework = 0;
	  			this.HuddleSettings.selected_framework = 0;
	  		}
	  	}

	  	if(!this.EditMode){
	  		this.HuddleSettings.show_publish_comments = true;
	  	}
	  	/*
	  	//new code start 25-1-19//
	  	this.HuddleSettings.show_publish_comments=false;
	  	if(!this.HuddleSettings.show_publish_comments){
	  		this.HuddleSettings.show_publish_comments = true;
	  		this.HuddleSettings.enable_publish=false
	  		
	  	}
	  	//new code end 25-1-19//
		*/

	}	

  ngAfterViewInit(){

  	if(!this.EditMode){

  		this.HuddleSettings.selected_framework = 0;
  	
  	}else if(!this.HuddleSettings.selected_framework){

  		this.HuddleSettings.selected_framework = 0;
  	
  	}

  }

  	private GetFrameworks(){

			this.mainService.GetFrameworks().subscribe((fr)=>{

				// console.log(fr);
				this.frameworks = fr;

			});
  	}

	public LoadMoreSettings(template:TemplateRef<any>, event){

		event.preventDefault();

		this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
	}

	public resolve_settings(flag){

		if(flag==0){
			this.modalRef.hide();
		}else if(flag==1){

			this.modalRef.hide();
			this.mainService.PublishMoreSettings(this.HuddleSettings);
		}
		
	}

	ngOnDestroy(){
		this.subscription.unsubscribe();
		if(this.modalRef) this.modalRef.hide();
	  }



}
