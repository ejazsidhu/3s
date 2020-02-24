import { Component, OnInit, OnDestroy } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";


@Component({
  selector: "add-huddle-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.css"]
})
export class RootComponent implements OnInit, OnDestroy {
  private projectTitle: string = 'add_huddle';

  private styles = [
    { id: 'addHuddleGlobal', path: 'assets/add-huddle/css/global.css' },
    { id: 'addHuddleAnimate', path: 'assets/add-huddle/css/animate.min.css' },
    { id: 'addAssessmentHuddle', path: 'assets/add-huddle/css/add_assessment.css' }

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
