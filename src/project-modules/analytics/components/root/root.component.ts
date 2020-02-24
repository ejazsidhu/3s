import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: "analytics-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class RootComponent implements OnInit, OnDestroy {
  private projectTitle: string = 'analytics';

  private styles = [
    { id: 'analyticsGlobal', path: 'assets/analytics/css/global.css' },
    { id: 'analyticsAnimate', path: 'assets/analytics/css/animate.min.css' },
    { id: 'analyticsExport', path: 'assets/analytics/css/export.css' },
  ];

  constructor(private headerService: HeaderService) {
    this.headerService.getLanguageTranslation(this.projectTitle).subscribe(() => {
      // Update the language_translation for its child project
    });
  }

  ngOnInit() {
    this.styles.forEach(style => {
      this.loadCss(style);
    });
  }

  ngOnDestroy() {
    this.styles.forEach(style => {
      let element = document.getElementById(style.id);
      element.parentNode.removeChild(element);
    });
  }

  private loadCss(style: any) {
    let head = document.getElementsByTagName('head')[0];
    let link = document.createElement('link');
    link.id = style.id;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = style.path;
    head.appendChild(link);
  }
}
