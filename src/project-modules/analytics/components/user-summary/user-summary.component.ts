import { Component, OnInit, ViewChild, NgModule, OnDestroy } from '@angular/core';
// import { SummaryService } from "../services/summary.service";
import { HeaderService } from "@projectModules/app/services";
import *  as _ from 'lodash';
// import { BodyService } from "../body.service";
import { BodyService, SummaryService } from "@analytics/services";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTable } from 'primeng/datatable';

@Component({
	selector: 'user-summary',
	templateUrl: './user-summary.component.html',
	styleUrls: ['./user-summary.component.css']
})

@NgModule({
	imports: [BsDropdownModule.forRoot()]
})
export class UserSummaryComponent implements OnInit, OnDestroy {

	@ViewChild('pUsertable', { static: true }) pUsertable: DataTable;

	public cars;
	public carsOriginal;
	public UsersOriginal;
	public cols;
	public dt;
	public gb;
	public isLoading: boolean = true;
	public users;
	private search_enabled: boolean = false;
	private firstTimeLoad: boolean = false;
	private allowAjax: boolean = true;
	public header_data;
	public translation: any = {};
	private subscriptions: Subscription = new Subscription();
	private queryParams: any;
	constructor(
		private bodyService: BodyService,
		private summaryService: SummaryService,
		private headerService: HeaderService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		// this.isLoading = false;
		this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;

			this.activatedRoute.queryParams.subscribe(queryParams => {
				this.queryParams = queryParams;
			});

			this.cols = [
				{ field: 'company_name', header: this.translation.analytics_account_name },
				{ field: 'email', header: this.translation.analytics_email },
				{ field: 'user_role', header: this.translation.analytics_user_role },
				{ field: 'user_type', header: this.translation.analytics_user_type },
				{ field: 'workspace_upload_counts', header: this.translation.analytics_videos_upload_workspace },
				{ field: 'video_upload_counts', header: this.translation.analytics_videos_upload_huddle },
				{ field: 'shared_upload_counts', header: this.translation.analytics_videos_shared_to_huddles },
				{ field: 'scripted_notes_shared_upload_counts', header: this.translation.scripted_notes_shared_upload_counts },
				{ field: 'library_shared_upload_counts', header: this.translation.analytics_videos_shared_to_library },
				{ field: 'library_upload_counts', header: this.translation.analytics_videos_uploaded_to_library },
				{ field: 'videos_viewed_count', header: this.translation.analytics_huddle_video_viewed },
				{ field: 'workspace_videos_viewed_count', header: this.translation.analytics_video_viewed_in_workspace },
				{ field: 'library_videos_viewed_count', header: this.translation.analytics_library_videos_viewed },
				{ field: 'total_hours_uploaded', header: this.translation.analytics_hours_uploaded },
				{ field: 'total_hours_viewed', header: this.translation.analytics_hours_viewed },
				{ field: 'huddle_created_count', header: this.translation.analytics_huddle_created },
				{ field: 'workspace_comments_initiated_count', header: this.translation.analytics_workspace_video_notes },
				{ field: 'scripted_observations', header: this.translation.analytics_workspace_scripted_notes },
				{ field: 'analytics_workspace_resources_uploaded', header: this.translation.analytics_workspace_resources_uploaded },
				{ field: 'analytics_workspace_resources_viewed', header: this.translation.analytics_workspace_resources_viewed },
				{ field: 'comments_initiated_count', header: this.translation.analytics_huddle_video_comments },
				{ field: 'replies_initiated_count', header: this.translation.analytics_huddle_video_replies },
				{ field: 'documents_uploaded_count', header: this.translation.analytics_resources_uploaded },
				{ field: 'documents_viewed_count', header: this.translation.analytics_resources_viewed },
				// { field: 'scripted_video_observations', header: this.translation.analytics_scripted_video_observation },
				// { field: 'scripted_observations', header: this.translation.analytics_scripted_observation },
				{ field: 'huddle_discussion_created', header: this.translation.huddle_discussion_created },
				{ field: 'huddle_discussion_posts', header: this.translation.huddle_discussion_posts },
				{ field: 'web_login_counts', header: this.translation.analytics_total_logins },
			];

		}));
	}

	ngOnInit() {
		this.gb = '';
		this.header_data = this.headerService.getStaticHeaderData();
		this.bodyService.FilterSubmitPressed.subscribe(d => {
			console.log('user-summary ngonint: d: ', d)
			if (d) {
				this.pUsertable.first = 0; this.gb = "";
				this.LoadUserSummary();
			}
		});
	}

	private preventDuplication() {

		let that = this;
		setTimeout(() => {

			that.allowAjax = true;

		}, 1000);

	}
	private LoadUserSummary(page = 1, query?) {
		//		this.gb = "";
		if (!this.allowAjax) return;

		// this.isLoading = true;
		let that = this;
		let interval_id = setInterval(function () {

			let sessionData: any;
			sessionData = that.headerService.getStaticHeaderData();

			if (sessionData && sessionData.user_current_account) {

				clearInterval(interval_id);
				that.preventDuplication();
				that.allowAjax = false;
				if (query) {
					that.subscriptions.add(that.summaryService.LoadUserSummary(page, query).subscribe(data => {
			
						that.prepare_users(data);
						that.users = _.clone(data);
						that.UsersOriginal = _.clone(data);
						that.isLoading = false;
						if (that.queryParams.userSummaryPage) that.pUsertable.first = ((that.queryParams.userSummaryPage - 1) * 10);
					}));
				} else {
					that.subscriptions.add(that.summaryService.LoadUserSummary(page).subscribe(data => {
						that.prepare_users(data);
						that.users = _.clone(data);
						that.UsersOriginal = _.clone(data);
						that.isLoading = false;
						if (that.queryParams.userSummaryPage) that.pUsertable.first = ((that.queryParams.userSummaryPage - 1) * 10);
					}));


				}

			}

		});
	}
	public ExportExcel() {


		// let conf = {
		// 	rows:"export",
		// 	filter_type:default
		// 	page:
		// 	search_text:
		// 	sidx: account_name
		// 	sord: asc
		// 	subAccount:
		// }
		let filters = this.bodyService.GetFilters();
		filters.filter_type = (filters.start_date) ? "custom" : "default";
		filters.rows = "export";
		filters.page = "";
		filters.search_text = "";
		filters.sidx = "account_name";
		filters.sord = "asc";
		//filters.subAccount = "";

		this.summaryService.GetFile(filters).subscribe(data => this.handleFile(data));

	}

	private handleFile(result) {


		var blob = new Blob([result]);
		var link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = "users.csv";
		link.click();

	}

	private prepare_users(users) {

		users.folder_type = this.bodyService.GetFilter("folder_type");

		users.folder_type = users.folder_type || "1";

		// users.rows.forEach(u => {

		// 	u.workspace_upload_counts = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 4, u.user_id, u.account_id, 3) + '>' + u.workspace_upload_counts + "</a>";
		// 	u.video_upload_counts = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 4, u.user_id, u.account_id, 1) + '>' + u.video_upload_counts + "</a>";
		// 	u.shared_upload_counts = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 22, u.user_id, u.account_id, 1) + '>' + u.shared_upload_counts + "</a>";
		// 	u.workspace_videos_viewed_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 3) + '>' + u.workspace_videos_viewed_count + "</a>";
		// 	u.videos_viewed_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 1) + '>' + u.videos_viewed_count + "</a>";
		// 	u.total_hours_uploaded = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 24, u.user_id, u.account_id, 2) + '>' + u.total_hours_uploaded + "</a>";
		// 	u.total_hours_viewed = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 25, u.user_id, u.account_id, 2) + '>' + u.total_hours_viewed + "</a>";
		// 	u.huddle_created_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 1, u.user_id, u.account_id, 0) + '>' + u.huddle_created_count + "</a>";
		// 	u.workspace_comments_initiated_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 5, u.user_id, u.account_id, 3) + '>' + u.workspace_comments_initiated_count + "</a>";
		// 	u.comments_initiated_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 5, u.user_id, u.account_id, 1) + '>' + u.comments_initiated_count + "</a>";
		// 	u.replies_initiated_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 8, u.user_id, u.account_id, 0) + '>' + u.replies_initiated_count + "</a>";
		// 	u.documents_uploaded_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 3, u.user_id, u.account_id, 0) + '>' + u.documents_uploaded_count + "</a>";
		// 	u.documents_viewed_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 13, u.user_id, u.account_id, 0) + '>' + u.documents_viewed_count + "</a>";
		// 	u.scripted_video_observations = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 20, u.user_id, u.account_id, 0) + '>' + u.scripted_video_observations + "</a>";
		// 	u.scripted_observations = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 23, u.user_id, u.account_id, 0) + '>' + u.scripted_observations + "</a>";
		// 	u.web_login_counts = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 9, u.user_id, u.account_id, 0) + '>' + u.web_login_counts + "</a>";
		// 	u.library_shared_upload_counts = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 22, u.user_id, u.account_id, 2) + '>' + u.library_shared_upload_counts + "</a>";
		// 	u.library_upload_counts = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 2, u.user_id, u.account_id, 2) + '>' + u.library_upload_counts + "</a>";
		// 	u.library_videos_viewed_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 2) + '>' + u.library_videos_viewed_count + "</a>";
		// 	u.videos_viewed_count = '<a target="_blank" href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 1) + '>' + u.videos_viewed_count + "</a>";

		// });

		// users.rows.forEach(u => {

		// 	u.workspace_upload_counts = '<a  href=' + this.paramLink(users.start_date, users.end_date, 4, u.user_id, u.account_id, 3) + '>' + u.workspace_upload_counts + "</a>";
		// 	u.video_upload_counts = '<a  href=' + this.paramLink(users.start_date, users.end_date, 4, u.user_id, u.account_id, 1) + '>' + u.video_upload_counts + "</a>";
		// 	u.shared_upload_counts = '<a  href=' + this.paramLink(users.start_date, users.end_date, 22, u.user_id, u.account_id, 1) + '>' + u.shared_upload_counts + "</a>";
		// 	u.workspace_videos_viewed_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 3) + '>' + u.workspace_videos_viewed_count + "</a>";
		// 	u.videos_viewed_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 1) + '>' + u.videos_viewed_count + "</a>";
		// 	u.total_hours_uploaded = '<a  href=' + this.paramLink(users.start_date, users.end_date, 24, u.user_id, u.account_id, 2) + '>' + u.total_hours_uploaded + "</a>";
		// 	u.total_hours_viewed = '<a  href=' + this.paramLink(users.start_date, users.end_date, 25, u.user_id, u.account_id, 2) + '>' + u.total_hours_viewed + "</a>";
		// 	u.huddle_created_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 1, u.user_id, u.account_id, 0) + '>' + u.huddle_created_count + "</a>";
		// 	u.workspace_comments_initiated_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 5, u.user_id, u.account_id, 3) + '>' + u.workspace_comments_initiated_count + "</a>";
		// 	u.comments_initiated_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 5, u.user_id, u.account_id, 1) + '>' + u.comments_initiated_count + "</a>";
		// 	u.replies_initiated_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 8, u.user_id, u.account_id, 0) + '>' + u.replies_initiated_count + "</a>";
		// 	u.documents_uploaded_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 3, u.user_id, u.account_id, 0) + '>' + u.documents_uploaded_count + "</a>";
		// 	u.documents_viewed_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 13, u.user_id, u.account_id, 0) + '>' + u.documents_viewed_count + "</a>";
		// 	u.scripted_video_observations = '<a  href=' + this.paramLink(users.start_date, users.end_date, 20, u.user_id, u.account_id, 0) + '>' + u.scripted_video_observations + "</a>";
		// 	u.scripted_observations = '<a  href=' + this.paramLink(users.start_date, users.end_date, 23, u.user_id, u.account_id, 0) + '>' + u.scripted_observations + "</a>";
		// 	u.web_login_counts = '<a  href=' + this.paramLink(users.start_date, users.end_date, 9, u.user_id, u.account_id, 0) + '>' + u.web_login_counts + "</a>";
		// 	u.library_shared_upload_counts = '<a  href=' + this.paramLink(users.start_date, users.end_date, 22, u.user_id, u.account_id, 2) + '>' + u.library_shared_upload_counts + "</a>";
		// 	u.library_upload_counts = '<a  href=' + this.paramLink(users.start_date, users.end_date, 2, u.user_id, u.account_id, 2) + '>' + u.library_upload_counts + "</a>";
		// 	u.library_videos_viewed_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 2) + '>' + u.library_videos_viewed_count + "</a>";
		// 	u.videos_viewed_count = '<a  href=' + this.paramLink(users.start_date, users.end_date, 11, u.user_id, u.account_id, 1) + '>' + u.videos_viewed_count + "</a>";

		// });

		users.rows.forEach(u => {
			u.workspace_upload_counts = '<span  data-link=' + this.paramLink(u, "workspace_upload_counts", users.start_date, users.end_date, 4, u.user_id, u.account_id, 3) + '>' + u.workspace_upload_counts + "</span>";
			u.video_upload_counts = '<span  data-link=' + this.paramLink(u, "video_upload_counts", users.start_date, users.end_date, 4, u.user_id, u.account_id, 1) + '>' + u.video_upload_counts + " </span>";
			u.shared_upload_counts = '<span  data-link=' + this.paramLink(u, "shared_upload_counts", users.start_date, users.end_date, 22, u.user_id, u.account_id, 1) + '>' + u.shared_upload_counts + "</span>";
			u.workspace_videos_viewed_count = '<span  data-link=' + this.paramLink(u, "workspace_videos_viewed_count", users.start_date, users.end_date, 11, u.user_id, u.account_id, 3) + '>' + u.workspace_videos_viewed_count + " </span>";
			u.workspace_upload_counts = '<span  data-link=' + this.paramLink(u, "workspace_upload_counts", users.start_date, users.end_date, 4, u.user_id, u.account_id, 3) + '>' + u.workspace_upload_counts + "</span>";
			u.video_upload_counts = '<span  data-link=' + this.paramLink(u, "video_upload_counts", users.start_date, users.end_date, 4, u.user_id, u.account_id, 1) + '>' + u.video_upload_counts + " </span>";
			u.shared_upload_counts = '<span  data-link=' + this.paramLink(u, "shared_upload_counts", users.start_date, users.end_date, 22, u.user_id, u.account_id, 1) + '>' + u.shared_upload_counts + "</span>";
			u.workspace_videos_viewed_count = '<span  data-link=' + this.paramLink(u, "workspace_videos_viewed_count", users.start_date, users.end_date, 11, u.user_id, u.account_id, 3) + '>' + u.workspace_videos_viewed_count + " </span>";
			u.videos_viewed_count = '<span  data-link=' + this.paramLink(u, "videos_viewed_count", users.start_date, users.end_date, 11, u.user_id, u.account_id, 1) + '>' + u.videos_viewed_count + "</span>";
			u.total_hours_uploaded = '<span  data-link=' + this.paramLink(u, "total_hours_uploaded", users.start_date, users.end_date, 24, u.user_id, u.account_id, 2) + '>' + u.total_hours_uploaded + "</span>";
			u.total_hours_viewed = '<span  data-link=' + this.paramLink(u, "total_hours_viewed", users.start_date, users.end_date, 25, u.user_id, u.account_id, 2) + '>' + u.total_hours_viewed + "</span>";
			u.scripted_video_observations = '<span  data-link=' + this.paramLink(u, "scripted_video_observations", users.start_date, users.end_date, 20, u.user_id, u.account_id, 0) + '>' + u.scripted_video_observations + "</span>";
			u.scripted_observations = '<span  data-link=' + this.paramLink(u, "scripted_observations", users.start_date, users.end_date, 23, u.user_id, u.account_id, 0) + '>' + u.scripted_observations + "</span>";
			u.huddle_created_count = '<span  data-link=' + this.paramLink(u, "huddle_created_count", users.start_date, users.end_date, 1, u.user_id, u.account_id, 0) + '>' + u.huddle_created_count + "</span>";
			u.workspace_comments_initiated_count = '<span  data-link=' + this.paramLink(u, "workspace_comments_initiated_count", users.start_date, users.end_date, 5, u.user_id, u.account_id, 3) + '>' + u.workspace_comments_initiated_count + "</span>";
			u.scripted_observations = '<span  data-link=' + this.paramLink(u, "scripted_observations", users.start_date, users.end_date, 23, u.user_id, u.account_id, 3) + '>' + u.scripted_observations + "</span>";
			u.analytics_workspace_resources_uploaded = '<span  data-link=' + this.paramLink(u, "analytics_workspace_resources_uploaded", users.start_date, users.end_date, 3, u.user_id, u.account_id, 3) + '>' + u.analytics_workspace_resources_uploaded + "</span>";
			u.analytics_workspace_resources_viewed = '<span  data-link=' + this.paramLink(u, "analytics_workspace_resources_viewed", users.start_date, users.end_date, 13, u.user_id, u.account_id, 3) + '>' + u.analytics_workspace_resources_viewed + "</span>";
			u.comments_initiated_count = '<span  data-link=' + this.paramLink(u, "comments_initiated_count", users.start_date, users.end_date, 5, u.user_id, u.account_id, 1) + '>' + u.comments_initiated_count + "</span>";
			u.replies_initiated_count = '<span  data-link=' + this.paramLink(u, "replies_initiated_count", users.start_date, users.end_date, 8, u.user_id, u.account_id, 3) + '>' + u.replies_initiated_count + "</span>";
			u.documents_uploaded_count = '<span  data-link=' + this.paramLink(u, "documents_uploaded_count", users.start_date, users.end_date, 3, u.user_id, u.account_id, 1) + '>' + u.documents_uploaded_count + "</span>";
			u.documents_viewed_count = '<span  data-link=' + this.paramLink(u, "documents_viewed_count", users.start_date, users.end_date, 13, u.user_id, u.account_id, 1) + '>' + u.documents_viewed_count + "</span>";
			u.web_login_counts = '<span  data-link=' + this.paramLink(u, "web_login_counts", users.start_date, users.end_date, 9, u.user_id, u.account_id, 0) + '>' + u.web_login_counts + "</span>";
			u.library_shared_upload_counts = '<span  data-link=' + this.paramLink(u, "library_shared_upload_counts", users.start_date, users.end_date, 22, u.user_id, u.account_id, 2) + '>' + u.library_shared_upload_counts + "</span>";
			u.library_upload_counts = '<span  data-link=' + this.paramLink(u, "library_upload_counts", users.start_date, users.end_date, 2, u.user_id, u.account_id, 2) + '>' + u.library_upload_counts + "</span>";
			u.library_videos_viewed_count = '<span  data-link=' + this.paramLink(u, "library_videos_viewed_count", users.start_date, users.end_date, 11, u.user_id, u.account_id, 2) + '>' + u.library_videos_viewed_count + "</span>";
			u.videos_viewed_count = '<span  data-link=' + this.paramLink(u, "videos_viewed_count", users.start_date, users.end_date, 11, u.user_id, u.account_id, 1) + '>' + u.videos_viewed_count + "</span>";
			u.huddle_discussion_created = '<span  data-link=' + this.paramLink(u, "huddle_discussion_created", users.start_date, users.end_date, 6, u.user_id, u.account_id, 1) + '>' + u.huddle_discussion_created + "</span>";
			u.huddle_discussion_posts = '<span  data-link=' + this.paramLink(u, "huddle_discussion_posts", users.start_date, users.end_date, 8, u.user_id, u.account_id, 1) + '>' + u.huddle_discussion_posts + "</span>";
			u.scripted_notes_shared_upload_counts = '<span  data-link=' + this.paramLink(u, "scripted_notes_shared_upload_counts", users.start_date, users.end_date, 26, u.user_id, u.account_id, 1) + '>' + u.scripted_notes_shared_upload_counts + "</span>";

		});

	}

	public selectRow(rowData) {
		this.users.rows.forEach((u) => u.isSelected = false);
		rowData.isSelected = !Boolean(rowData.isSelected);

	}

	public isRowSelected(rowData: any) {
		return (rowData.isSelected) ? "rowSelected" : "rowUnselected";
	}

	private paramLink(u, prop, startDate, endDate, type, userid, account_id, workspace_huddle_library = 0) {
		var subAccount = account_id;
		if (subAccount == '')
			subAccount = 0;
		var re = /\//gi;
		// var stdate = $('#fromUsr').val();
		//	var startDate = //this.bodyService.GetFilter("start_date");
		//  var edate = $('#toUsr').val();
		//var endDate = '<?php echo $end_date ?>';

		//return environment.baseUrl+"/dashboard/userDetail/" + userid + "/" + subAccount + "/" + startDate + "/" + endDate + "/" + type + "/" + workspace_huddle_library;
		u[prop + "_link"] = ["../details", userid, subAccount, startDate, endDate, type, workspace_huddle_library];
		//return "/details/" + userid + "/" + subAccount + "/" + startDate + "/" + endDate + "/" + type + "/" + workspace_huddle_library;
		return "";
		//window.location = (url);
	}

	public serverPaginate(event: any) {


		event.preventDefault();

		if (event.keyCode == 13) {
			this.udpateSearchQueryInRoute(this.gb);
			this.search_enabled = true;

			this.LoadUserSummary(1, this.gb);

		} else {
			this.search_enabled = false;
		}

		//setTimeout(() => { that.gb = oldVal }, 100);

	}

	public paginate(pages) {
		if (this.queryParams.search && !this.gb) {
			this.gb = this.queryParams.search;
		}

		// let pageNumber: number = pages.first / 10 + 1;
		let pageNumber: number = 1;
		if (pages.first == 0 && this.queryParams.userSummaryPage) pageNumber = Number(this.queryParams.userSummaryPage);
		else pageNumber = pages.first / 10 + 1;

		if (this.search_enabled || this.gb) this.LoadUserSummary(pageNumber, this.gb);
		else this.LoadUserSummary(pageNumber);

		if (this.firstTimeLoad) this.udpatePageNumberInRoute(pageNumber); // if user pressed search of page number then update pageNumberRouting else there is no need to update page number in routing

		if (!this.firstTimeLoad) this.firstTimeLoad = true; // if current function is called on ngOnInit then update the variable to later check that page has been initialized

	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe();
	}

	private udpatePageNumberInRoute(pageNumber: number | null) {
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { userSummaryPage: pageNumber },
			queryParamsHandling: 'merge'
		});
	}

	private udpateSearchQueryInRoute(searchQuery: string) {
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { search: searchQuery || null, userSummaryPage: null },
			queryParamsHandling: 'merge'
		});
	}

}
