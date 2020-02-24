import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { VideoPageService } from "@videoPage/services";
import { BreadCrumbInterface } from "@videoPage/interfaces";


@Component({
  selector: 'video-page-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {

  public loaded: boolean = false;
  public breadCrumbs: BreadCrumbInterface[] = [];

  private subscription: Subscription;

  constructor(private videoPageService: VideoPageService) {
    this.subscription = this.videoPageService.breadCrumb$.subscribe(((breadCrumbs: BreadCrumbInterface[]) => {
      this.breadCrumbs = breadCrumbs;
      this.loaded = true;
    }));
  }

  ngOnInit() {
    this.updateBreadCrumb();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateBreadCrumb() {
    const breadCrumb = [
      { title: 'Home', link: '/home' },
      { title: 'BreadCrum is in development process' },
    ];
    this.videoPageService.updateBreadCrumb(breadCrumb);
  }

}
