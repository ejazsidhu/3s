import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from "@environments/environment";
import { MainService } from "@addHuddle/services";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'add-huddle-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

  public EditMode: boolean = false;
  public translation: any = {};
  private translationSubscription: Subscription;

  constructor(private mainService: MainService, private headerService: HeaderService, private router: Router) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });

    if (this.router.url.indexOf('edit') > -1) {
      this.EditMode = true;
    }
  }

  ngOnInit() {
    this.mainService.EditMode.subscribe((d) => {

      this.EditMode = d;

    });

  }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
  }
}
