import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '@videoPage/services';

@Component({
  selector: "video-page-root",
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
  path: string;
  params: any;

  constructor(private headerService: HeaderService,private activatedRoute:ActivatedRoute,private router:Router,private mainService:MainService) {
    
    // this.activatedRoute.data.subscribe(data=>{
    //   debugger
    //   console.log("activated route data",data.name)
    //   if(data){
    //     if(data.name=='video_page')
    //     this.path='/video_page';
    //     else if(data.name=='workspace_video_page')
    //     this.path='/workspace_video_page';

    //   }

    //   console.log('PATH',this.path,this.activatedRoute.snapshot.params)
    //   // this.router.url.subscribe((p:any)=>{
  	// 	// console.log("prams ",p)
    //   //   this.params = p;
    //   //   // this.device_detector();
    //   //   this.getData(p);
    //   // });
    //   });
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
