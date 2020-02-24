import { Component, OnInit, OnDestroy } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: "workspace-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.css"]
})
export class RootComponent implements OnInit, OnDestroy {
  private projectTitle: string = 'workspace';

  private styles = [
    { id: 'workspaceApp', path: 'assets/workspace/css/app.css' },
    { id: 'workspaceCustom', path: 'assets/workspace/css/custom.css' },
    { id: 'workspaceAnimations', path: 'assets/workspace/css/animations.css' }
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
//  console.clear()

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
