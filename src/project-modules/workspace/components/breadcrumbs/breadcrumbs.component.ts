import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: "workspace-breadcrumbs",
  templateUrl: "./breadcrumbs.component.html",
  styleUrls: ["./breadcrumbs.component.css"]
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public isLoadingBread: boolean = false;
  public translation: any = {};
  private translationSubscription: Subscription;

  constructor(private headerService: HeaderService) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.isLoadingBread = true
    }, 3000);
  }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
  }

}
