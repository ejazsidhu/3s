import { Component, OnInit, NgModule, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as _ from "underscore";
import { MainService } from '@src/project-modules/add-huddle/services';
import { HeaderService } from '@src/project-modules/app/services';
import { Subscription } from 'rxjs';

@NgModule({
	imports: [
		ModalModule
	]
})
@Component({
	selector: 'app-more-settings-dialog',
	templateUrl: './more-settings-dialog.component.html',
	styleUrls: ['./more-settings-dialog.component.css']
})
export class MoreSettingsDialogComponent implements OnInit, OnDestroy {
	@ViewChild('moreSettingForm', { static: true })
	public moreSettingForm: NgForm
	subscription: Subscription;
	translation: any;
	public frameworks: any;
	public HuddleSettings;
	public EditMode;
	public enable_framework_standard;

	constructor(
		public modalRef: BsModalRef,
		private mainService: MainService,
		private headerService: HeaderService) {
		this.mainService.assessmentHuddleMoreSettingFrameworks$.subscribe(frameworks => {
			this.frameworks = frameworks;
		});

		this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			
			
    });
	}

	ngOnInit() {
		this.selectFramework();
	}

	ngAfterViewInit() {
		if (!this.EditMode) {
			this.HuddleSettings.selected_framework = 0;
			this.HuddleSettings.show_publish_comments = true;
		} else if (!this.HuddleSettings.selected_framework) {
			this.HuddleSettings.selected_framework = 0;
		}
	}

	private selectFramework() {
		if (this.frameworks.length > 0) {
			let index = _.findIndex(this.frameworks, { account_tag_id: Number(this.HuddleSettings.selected_framework) });
			if (index == -1) {
				this.HuddleSettings.selected_framework = 0;
			} else {
				this.HuddleSettings.selected_framework = this.frameworks[index].account_tag_id;
			}
		}
	}

	public resolve_settings() {
		this.modalRef.hide();
		this.mainService.updateIsDirtyAssessmentHuddleMoreSettingFormStatus(this.moreSettingForm.dirty);
		this.mainService.PublishMoreSettings(this.HuddleSettings);
	}

	ngOnDestroy() {
		if (this.modalRef) this.modalRef.hide();
	}
}
