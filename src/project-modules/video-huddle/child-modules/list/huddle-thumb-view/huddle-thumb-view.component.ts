import { Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HomeService } from "../services/home.service";
import { environment } from "@environments/environment";
import {Router} from "@angular/router";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'huddle-thumb-view',
  templateUrl: './huddle-thumb-view.component.html',
  styleUrls: ['./huddle-thumb-view.component.css']
})
export class HuddleThumbViewComponent implements OnInit, OnDestroy, OnChanges {

	@Input() data;
  @Input('block_move') block_move;
	@Output() OnDetailsClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnHuddleClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnMove: EventEmitter<any> = new EventEmitter<any>();
  @Output() RequestDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnEdit: EventEmitter<any> = new EventEmitter<any>();
  public isDropdownOpen:boolean;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;
  baseUrl: any;
	ngOnChanges(change){
    
		if(change.data && change.data.currentValue){

		change.data.currentValue.type_title = change.data.currentValue.type? change.data.currentValue.type.toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
  			return m.toUpperCase();
		}): change.data.currentValue.type;

		}

	}

  constructor(private homeService:HomeService, private router: Router, private headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
    // console.log(this.block_move);
   }

  ngOnInit() {
    this.isDropdownOpen = false;
    // this.mouseEntered = false;
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId=this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream
    this.baseUrl = environment.baseUrl
  }


  public isOpen(flag){

    this.isDropdownOpen = flag;
    if(flag){
      this.data.mouseEntered = true;
    }

  }

  public getHuddleTypeTitle(){
  	return this.data? this.data.type: "";
  }

  public OnHuddleMove(id){
    this.OnMove.emit(id);
  }

  public getHuddleLink(huddle){

    this.router.navigate(["/details/"+huddle.huddle_id])
     return environment.baseUrl+"/details/"+huddle.huddle_id+"/grid";

  }

  public getTypeClass(data){

  	if(!data.type){
  		return "";
  	}
  	let types = {
  		"coaching": "hu_last",
  		"collaboration": "hu_last col_b",
  		"assessment": "hu_last as_h"
  	};

  	return types[data.type];

  }

  public RequestParticipentsDetails(e){
    //OnHuddleClick
    // e.stopPropagation();
    this.OnDetailsClick.emit(this.data.huddle_id);

  }

  public getSrc(data){
  	if(!data.type){
  		return "";
  	}
  	let types = {
  		"coaching": "./assets/img/coaching_icon.svg",
  		"collaboration": "./assets/img/collaboration_icon.svg",
  		"assessment": "./assets/img/assessment_icon.svg"
  	};

  	return types[data.type];
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
  

}
