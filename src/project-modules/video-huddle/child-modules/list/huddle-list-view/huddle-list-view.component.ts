import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import * as _ from "underscore";
import { environment } from "@environments/environment";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'huddle-list-view',
  templateUrl: './huddle-list-view.component.html',
  styleUrls: ['./huddle-list-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HuddleListViewComponent implements OnInit, OnDestroy {

	@Input() data;
  @Output() OnMove: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() RequestDetails: EventEmitter<any> = new EventEmitter<any>();
  @Input() block_move;
  
  public isDropdownOpen:boolean;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;

  constructor(private headerService:HeaderService,private router:Router ) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
    this.isDropdownOpen = false;
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId=this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

  public getHuddleLink(huddle){
    let str='';
    if(huddle.huddle_type=='Assessment'){
      str="/video_huddles/assessment/"+huddle.huddle_id+'/huddle/details';
    }else{
    str="/video_huddles/huddle/details/"+huddle.huddle_id;
    }
    console.log(str)
    this.router.navigate([str])
    // return str;

  }

  public getParticipentCount(participants, type){

    if(!participants) return 0;

  	if(type=="coaching"){

  		return participants.coach? participants.coach.length:0 + participants.coachee?participants.coachee.length:0;

  	}else if(type=="collaboration"){

  		return participants.collaboration_participants?participants.collaboration_participants.length:0;

  	}else if(type=="assessment"){

  		
		return participants.assessed_participants? participants.assessed_participants.length:0 + (participants.assessor)? participants.assessor.length:0;
  	}

  }

    public isOpen(flag){

    this.isDropdownOpen = flag;
    if(flag){
      this.data.mouseEntered = true;
    }

  }

  public getClass(type){

    let types = {
      "coaching": "coaching_icon type_container",
      "collaboration": "collaboration_icon type_container",
      "assessment": "assessment_icon type_container"
    };

    return types[type];

  }

  public getSrc(type){

  	let types = {
  		"coaching": "./assets/img/coaching_icon.svg",
  		"collaboration": "./assets/img/collaboration_icon.svg",
  		"assessment": "./assets/img/assessment_icon.svg"
  	};


  	return types[type];

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
