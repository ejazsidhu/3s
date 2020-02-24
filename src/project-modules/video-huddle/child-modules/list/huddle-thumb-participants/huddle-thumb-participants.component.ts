import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HomeService } from "../services/home.service";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'huddle-thumb-participants',
  templateUrl: './huddle-thumb-participants.component.html',
  styleUrls: ['./huddle-thumb-participants.component.css']
})

export class HuddleThumbParticipantsComponent implements OnInit, OnDestroy {
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
	@Input() data;
	@Output() RequestDetails: EventEmitter<any> = new EventEmitter<any>();
	@Output() OnDetailsClick: EventEmitter<any> = new EventEmitter<any>();
  constructor(private homeService:HomeService,private headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

    public getImgSrc(user){

    return this.homeService.getAvatarPath(user);

  }

  public RequestParticipentsDetails(e){
    //OnHuddleClick
    // e.stopPropagation();
    this.OnDetailsClick.emit(true);

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
