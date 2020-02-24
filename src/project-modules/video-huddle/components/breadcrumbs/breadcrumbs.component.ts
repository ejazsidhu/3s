import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { environment } from "@environments/environment";

import { HeaderService } from "@projectModules/app/services";
import { HomeService } from "@projectModules/app/services";
import { DiscussionService } from '@videoHuddle/child-modules/details/servic/discussion.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'video-huddle-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.css']
})

export class BreadcrumbsComponent implements OnInit, OnDestroy {
	public translation: any = {};
	public breadcrubms;
	private translationSubscription: Subscription;
	private breadCrumbsSubscription: Subscription;

	constructor(private router: ActivatedRoute, private homeService: HomeService, public discussionService: DiscussionService, private headerService: HeaderService) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
		this.breadCrumbsSubscription = this.homeService.breadcrumbs$.subscribe(data => {
			this.breadcrubms = data;
		});
	}

	ngOnInit() {

	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
		this.breadCrumbsSubscription.unsubscribe();
	}

}
