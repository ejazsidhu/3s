import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tiltle',
  templateUrl: './tiltle.component.html',
  styleUrls: ['./tiltle.component.css']
})
export class TiltleComponent implements OnInit, OnDestroy {
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  constructor(private headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
