import { Component, OnInit, ViewEncapsulation, Renderer2 } from '@angular/core';
import { HeaderService } from '@app/services';

@Component({
  selector: 'people-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css']
})
export class RootComponent implements OnInit {

  private projectTitle: string = 'administrators_groups';

  private styles = [
    // { id: 'peopleBootstrap', path: 'assets/people/css/bootstrap.min.css' },
    { id: 'peopleApp', path: 'assets/people/css/app.css' },
    { id: 'peopleCustom', path: 'assets/people/css/custom.css' }
  ];
  
  constructor(private headerService: HeaderService, private renderer: Renderer2) {

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
