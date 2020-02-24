import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '@src/project-modules/app/services';
import { MainService } from "@addHuddle/services";
interface huddle_data {
	[key: string]: any
}
@Component({
	selector: 'add-huddle-landing-page',
	templateUrl: './landing-page.component.html',
	styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
	subscription: any;
	translation: any;
	public huddle_data: huddle_data | any = {};
	isLoading = true
	huddleTypes: any;
	public selectedType: any = {};
	header_data: any;
	headerData: any;

	constructor(
		private headerService: HeaderService,
		private mainService: MainService,
		private activatedRoute: ActivatedRoute) {
		this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			this.huddle_data.title = this.translation.huddle_title;
			this.LoadHuddleTypes();

		});
		this.selectedType.id = 1;

		this.activatedRoute.queryParams.subscribe(queryParams => {
			if(queryParams.folderId){
				this.mainService.updateFolderId(queryParams.folderId);
			}
		});
	}

	ngOnInit() {
		setTimeout(() => {
			this.isLoading = false
		}, 1500);
		this.headerData = this.headerService.getStaticHeaderData();

	}

	private LoadHuddleTypes() {

		this.huddleTypes = [

			{
				id: 2,
				"label": this.translation.coaching_title,
				"type": "2",
				"value": "coaching",
				"desc": this.translation.coaching_huddle_description
				// "desc": "Create this type of huddle to enhance and personalize one-on-one coaching and mentoring.  These private and secure huddles help establish high levels of trust between professionals who are focused on continuous improvement."
			},
			{
				id: 1,
				"label": this.translation.collaboration_huddle_name,
				"type": "1",
				"value": "collaboration",
				"desc": this.translation.collaboration_huddle_description
				//"desc": "Create this type of huddle for collaborative partners, Professional Learning Communities, or results-oriented teams who want to more effectively work together by sharing videos and resources in a secure environment."
			},
			{
				id: 3,
				"label": this.translation.assessment_huddle_name,
				"type": "3",
				"value": "assessment",
				"desc": this.translation.assessment_huddle_description
				//"desc": "Create this type of huddle to provide feedback on student-submitted performance tasks.  Assessors in this huddle have the ability to identify performance levels in association with standards on a rubric in order to better track student growth."
			}

		];

	}

	public isTypeAllowed(type) {

		let id = Number(type.id);

		if (!this.headerData) return false;

		let perms = this.headerData.user_permissions.UserAccount;

		if (type.id == 2) {

			if (perms.manage_coach_huddles && (perms.manage_coach_huddles == 1 || perms.manage_coach_huddles == true)) { // just strict checking

				return true;

			} else {
				return false;
			}

		}
		else if (type.id == 1) {

			if (perms.manage_collab_huddles && (perms.manage_collab_huddles == 1 || perms.manage_collab_huddles == true)) {

				return true;

			} else {
				return false;
			}

		}

		else if (type.id == 3) {

			if (perms.manage_evaluation_huddles && (perms.manage_evaluation_huddles == 1 || perms.manage_evaluation_huddles == true)) {

				return true;

			} else {
				return false;
			}

		}

		return false;

	}

}
