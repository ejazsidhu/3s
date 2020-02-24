import { Component, OnInit, OnDestroy } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: "video-huddle-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.css"]
})
export class RootComponent implements OnInit, OnDestroy {
  private projectTitle: string = 'huddle_list';

  private styles = [
    { id: 'videoHuddleApp', path: 'assets/video-huddle/css/app.css' },
    { id: 'videoHuddleCustom', path: 'assets/video-huddle/css/custom.css' },
    { id: 'videoHuddleAnimations', path: 'assets/video-huddle/css/animations.css' },
    { id: 'videoHuddleApp2', path: 'assets/video-huddle/css/app-2.css' },
    { id: 'videoHuddleCustom2', path: 'assets/video-huddle/css/custom-2.css' },
    { id: 'videoHuddleCustomAssessment', path: 'assets/video-huddle/css/custom-assessment.css' },
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
