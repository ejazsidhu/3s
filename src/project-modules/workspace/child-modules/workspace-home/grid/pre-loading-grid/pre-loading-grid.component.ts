import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderService } from '@projectModules/app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pre-loading-grid',
  templateUrl: './pre-loading-grid.component.html',
  styleUrls: ['./pre-loading-grid.component.css']
})
export class PreLoadingGridComponent implements OnInit, OnDestroy {
  sessionData;
  public translation: any = {};
  private subscription: Subscription;

  constructor(private headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
      // this.translation = this.sessionData.language_translation; // changed to observable stream
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
