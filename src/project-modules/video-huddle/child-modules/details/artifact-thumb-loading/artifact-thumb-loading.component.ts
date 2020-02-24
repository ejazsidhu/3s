import { Component, OnInit, OnDestroy } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'artifact-thumb-loading',
  templateUrl: './artifact-thumb-loading.component.html',
  styleUrls: ['./artifact-thumb-loading.component.css']
})
export class ArtifactThumbLoadingComponent implements OnInit, OnDestroy {
  public translation: any = {};
  private subscription: Subscription;
  public header_data;
  constructor(private header_service: HeaderService) {
    this.subscription = this.header_service.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.header_data = this.header_service.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
    // console.log(this.translation);
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }


}
