import { Component, OnInit, NgModule, TemplateRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
// import { MainService } from '../../services/main.service';
import { ToastrService } from 'ngx-toastr';
import { MainService } from '@src/project-modules/add-huddle/services';
import { HeaderService } from '@src/project-modules/app/services';
// import {HeaderService} from "../../header.service";


@NgModule({

	imports: [
		ModalModule
	]
})

@Component({
	selector: 'assessment-huddle-new-user',
	templateUrl: './assessment-huddle-new-user.component.html',
	styleUrls: ['./assessment-huddle-new-user.component.css']
})
export class AssessmentHuddleNewUserComponent implements OnInit, OnDestroy {

	modalRef: BsModalRef;
	public usersData: Array<users> = [];
	public translation: any = {};
	private subscription: Subscription;

	constructor(private toastr: ToastrService, private modalService: BsModalService, private mainService: MainService, private headerService: HeaderService) {
		this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
	}

	ngOnInit() {
		this.resetNewUsers();
	}

	private resetNewUsers() {

		this.usersData = [];

		for (let i = 0; i < 5; i++) {
			this.usersData[i] = { "first_name": "", "last_name": "", "email": "", "image": false, "is_user": true, "user_id": -1 };
		}

	}
	public test(row) {

		console.log(row);
	}
	public showNewUserModal(template: TemplateRef<any>) {

		this.resetNewUsers();
		this.modalRef = this.modalService.show(template, { class: 'modal-lg' });

	}


	public resolve_new(flag, usersData) {

		if (flag == 0) {

			this.modalRef.hide();
			this.resetNewUsers();

		} else if (flag == 1) {

			this.saveCurrentUsers(usersData, false);
			// this.resetNewUsers();
		} else if (flag == 2) {
			this.saveCurrentUsers(usersData, true);
			// this.resetNewUsers();
			// this.modalRef.hide();
		}

	}

	private isValidEmail(user) {

		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return re.test(user.email);

	}

	private HowManyKeysExist(u) {

		let count = 0;

		if (u.first_name) count++;
		if (u.last_name) count++;
		if (u.email) count++;

		return count;

	}

	private saveCurrentUsers(users, hide_modal) {

		let AllValid = true;
		users.forEach((u) => {

			let count = this.HowManyKeysExist(u);
			if (count > 0 && count < 3) {

				AllValid = false;

			}

		});

		if (!AllValid) {

			this.toastr.info(this.translation.huddle_all_fiedls_required);
			return;

		}

		let newUsers = users.filter((u) => {

			return Boolean(u.first_name && u.last_name && u.email)

		});

		let flag = true;
		let errorOnUser;
		newUsers.forEach((u) => { if (!this.isValidEmail(u)) { errorOnUser = u; flag = false; } });

		if (!flag) {
			this.toastr.info(this.translation.huddle_enter_valid_email + errorOnUser.first_name + " " + errorOnUser.last_name);
			return;
		}

		this.mainService.EmitUsers(newUsers);

		if (hide_modal) {
			this.modalRef.hide();
		}

		this.resetNewUsers();

	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
		if(this.modalRef) this.modalRef.hide();
	}
}



interface users {
	[key: string]: any
}
