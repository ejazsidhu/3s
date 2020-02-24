import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainService } from '@addHuddle/services';
import { Observable, of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HeaderService } from "@projectModules/app/services";
import * as _ from "lodash";
import { environment } from "@environments/environment";
import { ToastrService } from "ngx-toastr";
import * as moment from 'moment';
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

import { BsLocaleService, esLocale, defineLocale } from "ngx-bootstrap";
import { DetailsHttpService } from '@src/project-modules/video-huddle/child-modules/details/servic/details-http.service';

@Component({
	selector: 'main-view',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

	public huddleTypes;

	public selecedusers;

	public selectedType;
	modalRef: BsModalRef;
	public asyncSelected: string;
	public typeaheadLoading: boolean;
	public typeaheadNoResults: boolean;
	public dataSource: Observable<any>;

	public huddle_data: huddle_data | any = {};
	private newUsers;
	public users;
	public editableHuddle;
	public EditMode: boolean;
	public moreSettingsToPublish: any;
	public GroupDetails;
	private inEligibleIds;
	public timeVals;
	public folder_id;
	public headerData;
	public params;
	public currentUser;
	public enable_framework_standard;
	public header_color;
	public primery_button_color;
	public secondry_button_color;
	public header_data;
	public translation: any = {};
	public isLoading = true;
	public cirqEnabled:boolean=false;
	private subscription: Subscription;
	constructor(private modalService: BsModalService, private router: Router, private activatedRoute: ActivatedRoute, private toastr: ToastrService, private mainService: MainService, private headerService: HeaderService, private localeService: BsLocaleService,public detailsService: DetailsHttpService) {
		this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			this.huddle_data.title = this.translation.huddle_title;
			this.LoadHuddleTypes();
		});
	}

	ngOnInit() {
		
		this.isLoading = true;

		setTimeout(() => {
			this.isLoading = false;
		}, 3000)
		let sessionData: any = this.headerService.getStaticHeaderData();
		this.header_data = this.headerService.getStaticHeaderData();
		//   this.translation = this.header_data.language_translation; // changed to observable stream
		// Dynamic Button Colors Start
		this.header_color = sessionData.header_color;
		this.primery_button_color = sessionData.primery_button_color;
		this.secondry_button_color = sessionData.secondry_button_color;
		// Dynamic Button Colors End
		// this.loadPermissions();
		this.folder_id = -1;
		this.newUsers = 0;
		this.huddle_data.step = 2;
		this.users = [];
		this.selecedusers = [];
		//   this.huddle_data.title = "";
		this.huddle_data.more_settings = {
			"frameworks": 1,
			"video_marker": 1,
			"can_view_summary": 0,
			"assessee_can_view_assessment_summary": 0,
			"allow_download_recordings":0,
		};
		this.huddle_data.submission_allowed = 1;
		//   this.LoadHuddleTypes(); // changed to observable stream
		this.RunSubscribers();
		this.editableHuddle = {};
		this.EditMode = true;
		this.moreSettingsToPublish = {};
		this.GroupDetails = {};
		this.inEligibleIds = [];
		this.timeVals = [];
		this.LoadTimeVals();
		//   this.huddle_data.title = this.translation.huddle_title; // changed to observable stream
		this.moreSettingsToPublish.video_marker = true;
		this.moreSettingsToPublish.frameworks = true;
		this.moreSettingsToPublish.selected_framework = 0;
		if (sessionData.language_translation.current_lang == 'es') defineLocale(sessionData.language_translation.current_lang, esLocale);
		this.localeService.use(sessionData.language_translation.current_lang);
		this.GetCirqLiveData();
	}

	  /**Get Cirqlive config data */
	  public GetCirqLiveData() {
		this.subscription.add(this.detailsService.GetCirqLiveData().subscribe((cirQdata) => {
		   if(cirQdata){
			   this.cirqEnabled = true;
		   }
	 }));
	 }
	public IsEligible(user) {

		if (!user.is_user) return true;

		return this.inEligibleIds.indexOf(user.user_id + "") < 0;

	}

	public GetGroupDetails(template, group_id) {

		this.mainService.GetGroupDetails(group_id).subscribe((data: any) => {

			this.GroupDetails.name = data.group_details[0].name;
			this.GroupDetails.users = this.GetGroupUsers(data.group_user_details);

			this.modalRef = this.modalService.show(template, { class: 'modal-md' });
			// console.log(this.GroupDetails);

		});

	}

	public AssessorChanged(ev, user) {

		if (ev == "false") {

			let found = false;

			this.selecedusers.forEach((u) => {

				if (u.isAssessor == "true")
					found = true;

			});

			if (!found) {
				this.toastr.info(this.translation.huddle_at_least_assessment);
				setTimeout(() => { user.isAssessor = "true"; });

			}

		}

	}

	public roleChanged(e, user) {

		// ;
		// this.editableHuddle;

		if (this.EditMode && /*this.currentUser.id == user.id*/ this.isCreator(user) && this.editableHuddle.huddle_type == "2") {
			// e.preventDefault();
			this.toastr.info(this.translation.huddle_you_cannot);
			setTimeout(() => {
				e.preventDefault();
				user.isCoach = "true";
			}, 100);
			return;
		}

		let that = this;
		setTimeout(() => {

			if (user.isCoach == "true") return;

			let userIndex = _.findIndex(this.selecedusers, { id: user.id });

			let count = 0;

			this.selecedusers.forEach((u) => {

				if (u.isCoach == "false")
					count++;

			});

			if (count > 1) {

				this.toastr.info(this.translation.huddle_you_can_select);

				delete user.isCoach;

				user.isCoach = "true";

			} else {
				this.SetCoachingHuddleName(user);
			}

		}, 10);



	}

	private SetCoachingHuddleName(user) {

		let that = this;
		//	this.huddle_data.hname = user.first_name+" "+user.last_name;
		this.huddle_data.hname = "";
		let sessionData: any = that.headerService.getStaticHeaderData();

		let obj = {

			coachee_id: user.id,
			coachee_name: user.first_name + " " + user.last_name,
			account_id: sessionData.user_current_account.accounts.account_id

		};

		if (!user.id || user.id == -1) {
			that.huddle_data.hname = user.first_name + " " + user.last_name;
			return;
		}

		that.mainService.GetCoachingHuddleName(obj).subscribe((data: any) => {

			that.huddle_data.hname = data.name;
			//this.huddle_data.hname = user.first_name+" "+user.last_name;
		});


	}

	private GetGroupUsers(users: Array<any>) {

		let arr = [];
		users.forEach((u) => {

			arr.push(this.GetUserById(u.user_id));

		});

		return arr;
	}

	private GetUserById(user_id) {

		let index = _.findIndex(this.users, { user_id: user_id });
		if (index >= 0) {
			return this.users[index];
		} else {
			index = _.findIndex(this.selecedusers, { user_id: user_id });
			if (index >= 0)
				return this.selecedusers[index];

			else return {};
		}

	}
	private LoadTimeVals() {
		this.timeVals = [
			{
				id: 1,
				"name": "12:00 AM"
			}, {
				id: 2,
				"name": "1:00 AM"
			}, {
				id: 3,
				"name": "2:00 AM"
			}, {
				id: 4,
				"name": "3:00 AM"
			}, {
				id: 5,
				"name": "4:00 AM"
			}, {
				id: 6,
				"name": "5:00 AM"
			}, {
				id: 7,
				"name": "6:00 AM"
			}, {
				id: 8,
				"name": "7:00 AM"
			}, {
				id: 9,
				"name": "8:00 AM"
			}, {
				id: 10,
				"name": "9:00 AM"
			}, {
				id: 11,
				"name": "10:00 AM"
			}, {
				id: 12,
				"name": "11:00 AM"
			}, {
				id: 13,
				"name": "12:00 PM"
			}, {
				id: 14,
				"name": "1:00 PM"
			}, {
				id: 15,
				"name": "2:00 PM"
			}, {
				id: 16,
				"name": "3:00 PM"
			}, {
				id: 17,
				"name": "4:00 PM"
			}, {
				id: 18,
				"name": "5:00 PM"
			}, {
				id: 19,
				"name": "6:00 PM"
			}, {
				id: 20,
				"name": "7:00 PM"
			}, {
				id: 21,
				"name": "8:00 PM"
			}, {
				id: 23,
				"name": "9:00 PM"
			}, {
				id: 24,
				"name": "10:00 PM"
			}, {
				id: 25,
				"name": "11:00 PM"
			}
		];
	}

	private loadPermissions() {

		let that = this;

		let interval_id = setInterval(() => {

			let headerData = that.headerService.getStaticHeaderData();

			if (headerData) {

				clearInterval(interval_id);

				that.mainService.GetUserGlobalPermissions().subscribe((d: any) => {

					if (!d.success) {

						alert(this.translation.huddle_permission_not_granted);

						location.href = environment.baseUrl + "/Huddles";


					} else {
						this.enable_framework_standard = d.enable_framework_standard;
					}

				})
			}

		}, 50);

	}

	private RunSubscribers() {

		let perm = this.mainService.GetUserGlobalPermissions();

		let that = this;

		let in_id = setInterval(() => {

			let headerData = that.headerService.getStaticHeaderData();

			if (headerData) {

				clearInterval(in_id);

				that.headerData = headerData;


			}
		}, 50);


		this.activatedRoute.params.subscribe(p => {

			this.params = p;
			if (p.huddle_id) {
				this.EditMode = true;
				this.mainService.EmitEditMode(true);
				this.huddle_data.step = 2;
				this.mainService.GetEditableHuddle(p.huddle_id).subscribe((data: any) => {

					if (!data.success) {

						alert(data.message);

						location.href = environment.baseUrl + "/Huddles";
					}
					this.enable_framework_standard = data.enable_framework_standard;
					this.editableHuddle = data;
					this.EditMode = true;
					this.formatEditableHuddle(data);


				});
			} else {

				this.mainService.EmitEditMode(false);
				this.EditMode = false;
				this.loadPermissions();

			}
			if (p.folder_id) {
				this.folder_id = p.folder_id;
			}
			// this.editableHuddle.huddle_id = p.huddle_id;


		})

		this.mainService.MoreSettings.subscribe((s) => { this.huddle_data.more_settings = s; console.log(this.huddle_data); });

		this.mainService.users.subscribe((users) => {

			users.forEach((user) => { this.assignRole(user); });

			this.selecedusers = this.selecedusers.concat(JSON.parse(JSON.stringify(users)));

		});

		// this.mainService.DeletedUser.subscribe((user)=>this.DeleteUser(user));

		this.dataSource = Observable.create((observer: any) => {
			// Runs on every search
			observer.next(this.asyncSelected);
		}).pipe(mergeMap((token: string) => this.getUsersAsObservable(token)));

		// this.mainService.getUsers();
	}


	public validateData(d) {

		if (!(this.huddle_data.deadline_date instanceof Date && !isNaN(this.huddle_data.deadline_date))) {
			console.log(d);
			this.huddle_data.deadline_date = new Date();
		}

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

	public isCreator(user) {

		if (!this.EditMode || !user.is_user) return false;

		return this.editableHuddle.created_by + "" == user.user_id + "";

	}

	private formatEditableHuddle(data) {

		this.moreSettingsToPublish = {};

		this.huddle_data.huddle_type = Number(data.huddle_type);

		this.selectTypeById(this.huddle_data.huddle_type);

		this.getUsers(this.huddle_data.huddle_type, true);

		this.editableHuddle = data;

		this.huddle_data.hname = data.current_huddle_info.name;

		this.huddle_data.submission_allowed = Number(data.submission_allowed);

		if (data.submission_deadline_date) {
			var StringDate = data.submission_deadline_date;
			var DateVar = StringDate.split("-");
			var DateVal = DateVar[0] + "/" + DateVar[1] + "/" + DateVar[2];

			this.huddle_data.deadline_date = DateVal;

		}

		if (data.submission_deadline_time) {

			this.huddle_data.deadline_time = data.submission_deadline_time;
		}

		if (!this.huddle_data.more_settings) {

			this.huddle_data.more_settings = {};

		}

		// let moreSettingsToPublish:any = {};

		if (data.chk_frameworks) {
			if (Number(data.chk_frameworks) == 1) {

				this.huddle_data.more_settings.frameworks = true;
				this.moreSettingsToPublish.frameworks = true;

			}
			//data.show_publish_comments =false;

			if (data.show_publish_comments) {
				if (Number(data.show_publish_comments) == 1) {

					this.huddle_data.more_settings.show_publish_comments = true;
					this.moreSettingsToPublish.show_publish_comments = true;

				}
			}

			if (data.allow_per_video) {
				if (Number(data.allow_per_video) == 1) {

					this.huddle_data.more_settings.allow_per_video = true;
					this.moreSettingsToPublish.allow_per_video = true;

				}
			}

			if (data.chk_tags_value) {
				if (Number(data.chk_tags_value) == 1) {

					this.huddle_data.more_settings.video_marker = true;
					this.moreSettingsToPublish.video_marker = true;

				}
			}

			if (data.coach_hud_feedback_value) {
				if (Number(data.coach_hud_feedback_value) == 1) {

					this.huddle_data.more_settings.enable_publish = true;
					this.moreSettingsToPublish.enable_publish = true;

				}
			}

			if (data.coachee_permission_value) {
				if (Number(data.coachee_permission_value) == 1) {

					this.huddle_data.more_settings.allow_download = true;
					this.moreSettingsToPublish.allow_download = true;

				}
			}

			if (data.can_view_summary) {
				if (Number(data.can_view_summary) == 1) {

					this.huddle_data.more_settings.can_view_summary = true;
					this.moreSettingsToPublish.can_view_summary = true;

				}
			}
			
			if (data.allow_download_recordings) {
			   if (Number(data.allow_download_recordings) == 1) {
				this.huddle_data.more_settings.allow_download_recordings = data.allow_download_recordings;
				this.moreSettingsToPublish.allow_download_recordings = data.allow_download_recordings;
			}
		}
			if (data.framework_id) {
				this.huddle_data.more_settings.selected_framework = data.framework_id;
				this.moreSettingsToPublish.selected_framework = data.framework_id;
			}

			if (data.current_huddle_info.desc) {

				this.huddle_data.more_settings.description = data.current_huddle_info.desc;
				this.moreSettingsToPublish.description = data.current_huddle_info.desc;

			}

			if (data.huddle_message.meta_data_value) {

				this.huddle_data.more_settings.invite_message = data.huddle_message.meta_data_value;
				this.moreSettingsToPublish.invite_message = data.huddle_message.meta_data_value;

			}

			// this.moreSettingsToPublish.enable_publish=data.enable_publish;



		}
	}

	private formatEditableUsers() {

		let data = this.editableHuddle;

		let tempUsers = data.groups.concat(data.huddleUsers).concat(data.huddleViewers).concat(data.supperUsers);

		this.PreselectUsers(tempUsers);

	}

	private PreselectUsers(users) {

		users.forEach((u) => {

			if (u.user_id) u.is_user = true;
			else u.is_user = false;

			if (u.is_user)
				this.AddUserToGrid(u);
			else {
				this.AddGroupToGrid(u);
			}

		});

	}

	private AddGroupToGrid(u) {

		let index = _.findIndex(this.users, { id: u.group_id });

		if (index >= 0) {

			if (!this.selecedusers) this.selecedusers = [];

			this.assignFixRole(this.users[index], u.role_id);

			this.selecedusers.unshift(this.getCopy(this.users[index]));

			this.users.splice(index, 1);

			// this.asyncSelected = '';
		}


	}
	private AddUserToGrid(u) {

		let index = _.findIndex(this.users, { user_id: u.user_id });

		if (index >= 0) {

			if (!this.selecedusers) this.selecedusers = [];

			this.assignFixRole(this.users[index], u.role_id);

			this.selecedusers.unshift(this.getCopy(this.users[index]));

			this.users.splice(index, 1);

			// this.asyncSelected = '';
		}
	}

	private assignFixRole(user, role_id) {

		if (this.huddle_data.huddle_type == 1) {

			if (user.role_id && user.role_id == 125) {

				user.user_huddle_role = "viewer";
				user.disableRoleChange = true;
				return;

			}

			if (role_id == 200)
				user.user_huddle_role = "admin";
			else if (role_id == 210)
				user.user_huddle_role = "member";
			else if (role_id == 220)
				user.user_huddle_role = "viewer";


		}
		else if (this.huddle_data.huddle_type == 2) {

			user.isCoach = (role_id == 200) ? "true" : "false";


		} else if (this.huddle_data.huddle_type == 3) {

			user.isAssessor = (role_id == 200) ? "true" : "false";

		}

	}

	public DeleteUser(user) {

		if (user.user_id == -1) {

			let index = _.findIndex(this.selecedusers, { email: user.email });

			if (index >= 0) {

				this.selecedusers.splice(index, 1);

			}

		} else if (user.is_user) {

			// this.users.push(user);

			let index = _.findIndex(this.selecedusers, { user_id: user.user_id });

			if (index >= 0) {

				this.selecedusers.splice(index, 1);
				this.users.push(user);
			}

		} else {



			let index = _.findIndex(this.selecedusers, { id: user.id });

			if (index >= 0) {

				this.selecedusers.splice(index, 1);
				this.users.push(user);
			}

		}

	}
	getUsers(typeId, EditMode?, selectCurrent?) {

		let that = this;
		let interval_id = setInterval(() => {

			let headerData;
			headerData = that.headerService.getStaticHeaderData();

			if (headerData && headerData.user_current_account) {

				clearInterval(interval_id);

				let obj = {
					account_id: headerData.user_current_account.accounts.account_id,
					huddle_type: typeId//that.mainService.GetFilter("huddle_type")
				};

				this.mainService.getUsers(obj).subscribe((data) => {

					that.users = that.formatUsers(data);

					that.users = _.sortBy(that.users, 'first_name');

					let user_id = headerData.user_current_account.User.id;

					this.currentUser = headerData.user_current_account.User;

					if (selectCurrent) {

						this.typeaheadOnSelect({ item: { id: Number(user_id) } });

					}
					// let currentUser = _.findIndex(that.users, {id: user_id});

					// that.selecedusers.push(currentUser);

					that.inEligibleIds.push(user_id);

					// console.log(that.inEligibleIds);

					if (EditMode) {
						that.formatEditableUsers();
					}

				});

			}

		}, 100);

	}

	formatUsers(users) {

		let arr = [];

		Object.keys(users).forEach((k) => {

			this.getUserImage(users[k]);

			if (!users[k].user_id) {

				users[k].is_user = false;

			} else {
				users[k].is_user = true;
			}
			arr.push(users[k]);

		});

		return arr;

	}

	getUserImage(user) {

		if (user.image && user.image != null) {
			user.image = environment.imageBaseUrl + "/" + user.user_id + "/" + user.image;
		} else {
			user.image = false;
		}

	}

	getUsersAsObservable(token: string): Observable<any> {
		let query = new RegExp(token, 'ig');

		return of(
			this.users.filter((user: any) => {

				if (!this.IsEligible(user)) return false;

				// if ((this.selectedType.id == 2) && !user.user_id) { // older:> || this.selectedType.id == 3
				// 	return false;
				// }
				if (!user.is_user) {
					return query.test(user.name);
				}

				return query.test(user.first_name) || query.test(user.last_name) || query.test(user.first_name + " " + user.last_name) || query.test(user.email) || query.test(user.name);
			})
		);
	}

	changeTypeaheadLoading(e: boolean): void {
		this.typeaheadLoading = e;
	}

	typeaheadOnSelect(e: any): void {
		// 
		console.log('Selected value: ', e);

		let index = _.findIndex(this.users, { id: e.item.id });

		if (index >= 0) {

			if (!this.selecedusers) this.selecedusers = [];

			this.assignRole(this.users[index]);

			this.selecedusers.unshift(this.getCopy(this.users[index]));

			this.users.splice(index, 1);

			this.asyncSelected = '';
		}

	}

	private assignRole(user) {

		if (this.huddle_data.huddle_type == 3) {

			if (!user.user_id) {

				user.isAssessor = "false";
				return;
			}

		}

		if (this.huddle_data.huddle_type == 1) {

			if (user.role_id && user.role_id == 125) {

				user.user_huddle_role = "viewer";
				user.disableRoleChange = true;

			} else {
				user.user_huddle_role = "member";
			}


		}
		else if (this.huddle_data.huddle_type == 2) {

			const coacheeExists = this.selecedusers.find(user => user.isCoach == "false");
	  
			if(coacheeExists) user.isCoach = "true";
			else {
			  if(user.is_user) {
				if(this.currentUser.id == user.id) user.isCoach = "true";
				else {
				  user.isCoach = "false";
				  this.SetCoachingHuddleName(user);
				}
				  
			  } else user.isCoach = "true";
			}
	  
		} else if (this.huddle_data.huddle_type == 3) {
			if (this.selecedusers.length == 1) {
				user.isAssessor = "false";
			} else {
				user.isAssessor = "true";
			}

		}

	}

	private getCopy(obj) {

		return JSON.parse(JSON.stringify(obj));

	}

	private selectTypeById(id) {

		let index = _.findIndex(this.huddleTypes, { id: id });

		if (index >= 0) {


			this.selectType(this.huddleTypes[index]);

		}

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

	public submitHuddle() {

		if (!this.huddle_data.hname) {
			this.toastr.info(this.translation.huddle_give_huddle_name);
			return;
		}
		if (this.selecedusers.length == 0 || !this.selecedusers) {

			this.toastr.info(this.translation.huddle_add_least_participent);
			return;

		}

		let arr = ["", "collaboration", "coaching", "assessment"];

		this.newUsers = 0;

		let json = this.prepareHuddleData(arr[this.huddle_data.huddle_type]);

		if (!json) return;

		if (this.EditMode) {

			let sessionData: any;

			sessionData = this.headerService.getStaticHeaderData();

			json.account_id = sessionData.user_current_account.accounts.account_id;

			json.huddle_id = this.editableHuddle.current_huddle_info.account_folder_id;

			this.mainService.EditHuddle(json).subscribe((data: any) => {

				if (data.success) {

					this.toastr.info(`${this.huddle_data.hname} ${this.translation.has_been_updated_successfully}`);

					if ((window as any).history.length > 1) (window as any).history.back();
					else this.router.navigate([`/video_huddles/huddle/details/${this.params.huddle_id}/artifacts/grid`]);

				} else {
					this.toastr.info(this.translation.huddle_sorry_for_inconvenience);
				}

			})
		}
		else {
			this.mainService.AddHuddle(json).subscribe((data: any) => {

				if (data.success) {
					// this.toastr.info(data.message);
					this.toastr.info(this.translation.huddle_successfully_created);
					this.router.navigate([`/video_huddles/huddle/details/${data.huddle_id}/artifacts/grid`]);

				} else {
					this.toastr.info(this.translation.huddle_sorry_for_inconvenience);
				}

			});
		}


	}

	public cancel() {

		if (this.EditMode) {

			if ((window as any).history.length > 1) (window as any).history.back();
			else this.router.navigate([`/video_huddles/huddle/details/${this.params.huddle_id}/artifacts/grid`]);

		} else this.router.navigate([`/add_huddle_angular/home`])

	}

	private formatDate(d) {
		let curr = moment(d);

		return this.AddPadding((curr.month() + 1)) + "-" + this.AddPadding(curr.date()) + "-" + this.AddPadding(curr.year());

	}

	private AddPadding(n) {

		n = parseInt(n);
		return (n < 10) ? "0" + n : n;

	}

	private prepareHuddleData(flag) {



		let sessionData;

		sessionData = this.headerService.getStaticHeaderData();

		let obj: any = {
			account_role_id: sessionData.user_current_account.users_accounts.role_id,
			current_user_email: sessionData.user_current_account.User.email
		};


		obj.hname = this.huddle_data.hname;
		obj["user_current_account"] = sessionData.user_current_account;
		obj["user_permissions"] = sessionData.user_permissions;

		if (this.folder_id != -1) {

			obj.folder_id = this.folder_id;

		}

		if (flag == "coaching") {
			obj.message = this.huddle_data.more_settings.invite_message;
			obj.chkenableframework = (this.huddle_data.more_settings.frameworks) ? 1 : 0;
			obj.chkenabletags = (this.huddle_data.more_settings.video_marker) ? 1 : 0;
			obj.hdescription = this.huddle_data.more_settings.description || "";
			if (this.huddle_data.more_settings.frameworks) {

				obj.allow_per_video = (this.huddle_data.more_settings.allow_per_video) ? 1 : 0;

			}

			obj.type = 2;
			obj.chkcoacheepermissions = (this.huddle_data.more_settings.allow_download) ? 1 : 0;
			obj.coach_hud_feedback = (this.huddle_data.more_settings.enable_publish) ? 1 : 0;
			obj.can_view_summary = (this.huddle_data.more_settings.can_view_summary) ? 1 : 0;
			obj.allow_download_recordings = (this.huddle_data.more_settings.allow_download_recordings) ? 1 : 0;
			if (obj.chkenableframework == 1) {

				obj.frameworks = this.huddle_data.more_settings.selected_framework;

			}

			obj.super_admin_ids = [];

			let count = 0;

			this.selecedusers.forEach((u) => {

				if (!u.is_user) {

					this.assignGroupRole(obj, u);

				}
				else if (u.user_id != -1) {

					obj.super_admin_ids.push(u.user_id);

					if (u.isCoach == "true") {

						obj["user_role_" + u.user_id] = 200;
						obj["is_coach_" + u.user_id] = 1;

					} else {

						count++;

						obj["user_role_" + u.user_id] = 210;
						obj["is_mentor_" + u.user_id] = 1;

					}
				} else {

					if (u.isCoach == "false") count++;

					this.prepareNewUser(obj, u, 2);
				}

			});

			if (count == 0) {
				this.toastr.info(this.translation.huddle_add_least_one_coachee);
				return false;
			}

			return obj;


		}
		else if (flag == "collaboration") {

			let admin_count = 0;

			obj.message = this.huddle_data.more_settings.invite_message;
			obj.chkenableframework = (this.huddle_data.more_settings.frameworks) ? 1 : 0;
			obj.chkenabletags = (this.huddle_data.more_settings.video_marker) ? 1 : 0;
			obj.hdescription = this.huddle_data.more_settings.description || "";
			obj.allow_per_video = (this.huddle_data.more_settings.allow_per_video) ? 1 : 0;
			obj.allow_download_recordings = (this.huddle_data.more_settings.allow_download_recordings) ? 1 : 0;
			obj.type = 1;
			// obj.chkcoacheepermissions = (this.huddle_data.more_settings.allow_download) ? 1 : 0;
			// obj.coach_hud_feedback = (this.huddle_data.more_settings.enable_publish) ? 1 : 0;

			if (obj.chkenableframework == 1) {

				obj.frameworks = this.huddle_data.more_settings.selected_framework;

			}

			obj.super_admin_ids = [];
			let user_id = sessionData.user_current_account.User.id;
			this.selecedusers.forEach((u) => {

				if (u.user_huddle_role == "admin") {
					admin_count++;
				}
				if (!u.is_user) {

					this.assignGroupRole(obj, u);

				}
				else if (u.user_id != -1) {
					obj.super_admin_ids.push(u.user_id);

					if (u.user_huddle_role == "admin" || u.id == user_id) {

						obj["user_role_" + u.user_id] = 200;

					}
					else if (u.user_huddle_role == "member") {

						obj["user_role_" + u.user_id] = 210;

					}
					else if (u.user_huddle_role == "viewer") {

						obj["user_role_" + u.user_id] = 220;

					}
				} else {
					this.prepareNewUser(obj, u, 1);
				}

			});

			if (admin_count == 0 && this.EditMode) {

				this.toastr.info(this.translation.huddle_at_least_one_admin);
				return false;

			}
			return obj;
		}
		else if (flag == "assessment") {

			let index = _.findIndex(this.timeVals, { name: this.huddle_data.deadline_time });

			if (index < 0) {

				this.toastr.info(this.translation.huddle_please_select_time);
				return false;
			}

			if (moment(this.huddle_data.deadline_date).isBefore()) {

				if (!moment(this.huddle_data.deadline_date).isSame(moment(), 'day')) {
					this.toastr.info(this.translation.huddle_past_dates_as_deadline);
					return false;
				}

			}
			if (!this.huddle_data.deadline_date) {
				this.toastr.info(this.translation.huddle_deadline_date_is_required);
				return false;
			}

			if (!this.huddle_data.deadline_time) {
				this.toastr.info(this.translation.huddle_deadline_time_is_required);
				return false;
			}


			obj.message = this.huddle_data.more_settings.invite_message;
			obj.chkenableframework = (this.huddle_data.more_settings.frameworks) ? 1 : 0;
			obj.chkenabletags = (this.huddle_data.more_settings.video_marker) ? 1 : 0;
			obj.hdescription = this.huddle_data.more_settings.description || "";
			obj.type = 3;
			obj.submission_allowed = this.huddle_data.submission_allowed;
			obj.submission_deadline_date = this.formatDate(this.huddle_data.deadline_date);//moment().format("DD-mm-YYYY");;
			obj.submission_deadline_time = this.huddle_data.deadline_time;
			obj.can_view_summary = (this.huddle_data.more_settings.can_view_summary) ? 1 : 0;
			obj.allow_download_recordings = (this.huddle_data.more_settings.allow_download_recordings) ? 1 : 0;
			// obj.chkcoacheepermissions = (this.huddle_data.more_settings.allow_download) ? 1 : 0;
			// obj.coach_hud_feedback = (this.huddle_data.more_settings.enable_publish) ? 1 : 0;
			if (obj.chkenableframework == 1) {

				obj.frameworks = this.huddle_data.more_settings.selected_framework;

			}

			obj.super_admin_ids = [];

			let count = 0;

			this.selecedusers.forEach((u) => {

				if (!u.is_user) {

					// although groups are not allowed in assessment huddle
					this.assignGroupRole(obj, u);
					if (u.isAssessor == "false") count++;
				}

				else if (u.user_id > -1) {
					obj.super_admin_ids.push(u.user_id);

					if (u.isAssessor == "true") {

						obj["user_role_" + u.user_id] = 200;
						obj["is_evaluator_" + u.user_id] = 1;

					} else if (u.isAssessor == "false") {

						count++;
						obj["user_role_" + u.user_id] = 210;
						obj["is_eval_participant_" + u.user_id] = 1;

					}
				} else {
					if (u.isAssessor == "false") count++;
					this.prepareNewUser(obj, u, 3);
				}

			});

			if (count == 0) {
				this.toastr.info(this.translation.huddle_one_participants_assessee);
				return false;
			}

			return obj;


		}

	}

	private assignGroupRole(obj, g) {


		if (!obj.group_ids) obj.group_ids = [];
		obj.group_ids.push(g.id);
		if (this.huddle_data.huddle_type == 1) {

			if (g.user_huddle_role == "admin") {

				obj["group_role_" + g.id] = 200;

			}
			else if (g.user_huddle_role == "member") {

				obj["group_role_" + g.id] = 210;

			}
			else if (g.user_huddle_role == "viewer") {

				obj["group_role_" + g.id] = 220;

			}

		} else if (this.huddle_data.huddle_type == 3) {
			
			if (g.isAssessor == "true") {
				
				obj["group_role_" + g.id] = 200;
				obj["is_coach_" + g.id] = 1;
				
			} else if (g.isAssessor == "false") {
				
				obj["group_role_" + g.id] = 210;
				obj["is_mentor_" + g.id] = 1;
				
			}
			
		} else if (this.huddle_data.huddle_type == 2) {
			if (g.isCoach == "true") {

				obj["group_role_" + g.id] = 200;
				obj["is_coach_" + g.id] = 1;
		
			} else {
		
				obj["group_role_" + g.id] = 210;
				obj["is_mentor_" + g.id] = 1;
		
			}
		}
		
	}

	public CollabRoleChanged(user, role) {

		if (user.role_id && user.role_id == 125 && role != "viewer") {

			setTimeout(() => {

				user.user_huddle_role = "viewer";
				this.toastr.info(this.translation.huddle_viewer_role + role + ".");

			}, 50);


		}

	}

	private prepareNewUser(obj, user, type) {

		//this.newUsers--;
		user.user_id = --this.newUsers;
		obj.super_admin_ids.push(this.newUsers);
		obj["super_admin_fullname_" + this.newUsers] = user.first_name + " " + user.last_name;
		obj["super_admin_email_" + this.newUsers] = user.email;

		if (type == 2) {
			if (user.isCoach == "true") {

				obj["user_role_" + this.newUsers] = 200;
				obj["is_coach_" + this.newUsers] = 1;

			} else {

				obj["user_role_" + this.newUsers] = 210;
				obj["is_mentor_" + this.newUsers] = 1;

			}
		} else if (type == 1) {

			if (user.user_huddle_role == "admin") {

				obj["user_role_" + user.user_id] = 200;

			}
			else if (user.user_huddle_role == "member") {

				obj["user_role_" + user.user_id] = 210;

			}
			else if (user.user_huddle_role == "viewer") {

				obj["user_role_" + user.user_id] = 220;

			}

		} else if (type == 3) {

			if (user.isAssessor == "true") {
				obj["user_role_" + user.user_id] = 200;
				obj["is_coach_" + user.user_id] = 1;
			} else if (user.isAssessor == "false") {
				obj["user_role_" + user.user_id] = 210;
				obj["is_mentor_" + user.user_id] = 1;
			}

		}

	}

	public selectType(type) {

		this.selectedType = type;

		this.mainService.UpdateFilter("huddle_type", type.id);

		if (!this.EditMode)
			this.getUsers(type.id, false, true);

		this.huddle_data.huddle_type = type.id;

		this.huddle_data.step = 2;

		this.setTitle(type.id);
	}

	private setTitle(typeId) {


		this.huddle_data.title = (typeId == 1) ? this.translation.huddle_collaboration_huddle : (typeId == 2) ? this.translation.huddle_coaching_header : this.translation.huddle_new_assessment_huddle;

	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
		if (this.modalRef) this.modalRef.hide();
	}

}

interface huddle_data {
	[key: string]: any
}
