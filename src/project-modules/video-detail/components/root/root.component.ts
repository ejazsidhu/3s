import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: "video-detail-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class RootComponent implements OnInit, OnDestroy {
  private projectTitle: string = 'video_details';

  private styles = [
    { id: 'videoDetailGlobal', path: 'assets/video-page/css/global.css' },
    { id: 'videoDetailAnimate', path: 'assets/video-page/css/animate.min.css' },
    { id: 'videoDetailExport', path: 'assets/video-page/css/export.css' },
    { id: 'videoDetailVJSMarkers', path: 'assets/video-page/css/vjsmarkers.min.css' },
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
