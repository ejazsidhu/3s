import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';

import { environment } from "@environments/environment";
import { HeaderService } from "@projectModules/app/services";

@Component({
	selector: 'people-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.css']
})

export class BreadcrumbsComponent implements OnInit, OnDestroy {

	public breadcrubms;
	public translation: any = {};
	private translationSubscription: Subscription;
	isLoadingBread: boolean = false;

	constructor(private router: ActivatedRoute, private headerService: HeaderService) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
		setTimeout(() => {
			this.isLoadingBread = true
		}, 3000);
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
	}

}
