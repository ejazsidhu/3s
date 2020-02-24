import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { environment } from "@environments/environment";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';


@Component({
	selector: 'currentuser',
	templateUrl: './currentuser.component.html',
	styleUrls: ['./currentuser.component.css']
})
export class CurrentuserComponent implements OnInit, OnDestroy, OnChanges {

	@Input() user;
	public userLoaded: boolean = false;
	public translation: any = {};
	public translationLoaded: boolean = false;
	private translationSubscription: Subscription;

	constructor(private headerService: HeaderService) {
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			if (this.translation.analytics_user_role) { // check if translation for analytics loaded
				this.translationLoaded = true;
			}
		});
	}

	ngOnInit() {
	}

	ngOnChanges() {
		if (this.user) this.userLoaded = true;
	}

	public getUserImgUrl() {

		if (!this.user) return;

		if (this.user && this.user.user_essentials.length > 0 && this.user.user_essentials[0].image) {

			return "https://s3.amazonaws.com/sibme.com/static/users/" + this.user.user_essentials[0].user_id + "/" + this.user.user_essentials[0].image;

		}

		return environment.baseUrl + "/img/home/photo-default.png";



	}

	public getUserRole(role_id) {

		if (!role_id) return "";

		let roles = {
			"100": this.translation.analytics_account_owner,
			"110": this.translation.analytics_super_admin,
			"115": this.translation.analytics_admin,
			"120": this.translation.analytics_user,
			"125": this.translation.analytics_viewer
		};

		return roles[role_id];

	}

	ngOnDestroy() {
		this.translationSubscription.unsubscribe();
	}

}
