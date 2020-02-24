import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from "@environments/environment";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';
@Component({
	selector: 'pcbreadcrumbs',
	templateUrl: './pcbreadcrumbs.component.html',
	styleUrls: ['./pcbreadcrumbs.component.css']
})
export class PcbreadcrumbsComponent implements OnInit, OnDestroy {

	public translation: any = {};
	public translationLoaded: boolean = false;
	private translationSubscription: Subscription;

	constructor(private headerService: HeaderService) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.analytics_home) { // check if translation for analytics is loaded
				this.translationLoaded = true;
			}
		});
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
	}

}
