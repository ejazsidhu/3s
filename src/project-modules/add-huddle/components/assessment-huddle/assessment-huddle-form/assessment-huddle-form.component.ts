import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { mergeMap } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import * as _ from "lodash";
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import { MainService } from '@addHuddle/services';
import { HeaderService } from '@src/project-modules/app/services';
import { environment } from '@src/environments/environment';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/of';
import { BsDatepickerConfig, BsLocaleService, esLocale, defineLocale } from 'ngx-bootstrap';
import { MoreSettingsDialogComponent } from "../more-settings-dialog/more-settings-dialog.component";

@Component({
  selector: 'app-assessment-huddle-form',
  templateUrl: './assessment-huddle-form.component.html',
  styleUrls: ['./assessment-huddle-form.component.css']
})
export class AssessmentHuddleFormComponent implements OnInit, OnDestroy {

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.assessmentHuddleForm.dirty || this.isDirtyMoreSettingForm) {
      $event.returnValue = false;
    }
  }

  @ViewChild('input', { static: false }) inputRef: ElementRef;
  @ViewChild('assessmentHuddleForm', { static: false })
  public assessmentHuddleForm: NgForm;

  public pageTitle: string = '';
  public submitBtnTitle: string = '';
  private huddleId: number; // used in case of edit mode, reflect the current huddleId from route params 
  public quillConfiguration = GLOBAL_CONSTANTS.QUILL_CONFIGURATION;
  public formFields = GLOBAL_CONSTANTS.ASSSESSMENT_HUDDLE_FORM_FIELDS;
  public selectedusers;
  public modalRef: BsModalRef;
  public asyncSelected: string;
  public typeaheadLoading: boolean;
  public typeaheadNoResults: boolean;
  public dataSource: Observable<any>;
  public huddle_data: any = {};
  private newUsers;
  public users;
  public editableHuddle;
  public EditMode: boolean;
  public GroupDetails;
  private inEligibleIds;
  public timeVals;
  public folder_id: number | string = -1;
  public headerData;
  public currentUser;
  public enable_framework_standard;
  public primery_button_color;
  public isLoading = true;
  public isDirtyMoreSettingForm: boolean;
  
  


  subscription: Subscription;
  translation: any;


  constructor(
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private mainService: MainService,
    private headerService: HeaderService,
    private router: Router,
    private bsLocale: BsLocaleService) {

    if (this.activatedRoute.snapshot.data.pageMode === GLOBAL_CONSTANTS.PAGE_MODE.EDIT) {
      this.EditMode = true;
      this.mainService.EmitEditMode(this.EditMode); // Set the edit mode to true for use in breadcrumbs
    }

    this.activatedRoute.params.subscribe(param => {
      (param.huddleId) ? this.huddleId = param.huddleId : true; // If huddleId is received from param then save it to private variable this.this.huddleId else do nothing
    });

    this.mainService.isDirtyAssessmentHuddleMoreSettingForm$.subscribe((status: boolean) => {
      this.isDirtyMoreSettingForm = status;
    });

    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      if (this.activatedRoute.snapshot.data.pageMode === GLOBAL_CONSTANTS.PAGE_MODE.EDIT) {
        this.pageTitle = this.translation.assessment_huddle_title_edit;
        this.submitBtnTitle = this.translation.assessment_update;
      }
      else {
        this.pageTitle = this.translation.assessment_huddle_title;
        this.submitBtnTitle = this.translation.assessment_create;
      }
    });

    this.mainService.folderId$.subscribe((folderId: number | string) => {
      this.folder_id = folderId;
    });


  }

  ngOnInit() {
    let sessionData: any = this.headerService.getStaticHeaderData();
    // Dynamic Button Colors Start
    if (sessionData.language_translation.current_lang == 'es') defineLocale(sessionData.language_translation.current_lang, esLocale);
    this.bsLocale.use(sessionData.language_translation.current_lang);
    this.primery_button_color = sessionData.primery_button_color;
    this.newUsers = 0;
    this.users = [];
    this.selectedusers = [];
    this.huddle_data.more_settings = {
      "video_marker": true,
      "frameworks": true,
      "selected_framework": 0,
      "coachee_can_view_summary": false,
      "can_comment_reply": false
    };
    this.huddle_data.submission_allowed = this.formFields.VIDEO.DEFAULT; // Arif
    this.huddle_data.resource_submission_allowed = this.formFields.RESOURCE.DEFAULT; // Arif
    this.RunSubscribers();
    this.editableHuddle = {};
    this.GroupDetails = {};
    this.inEligibleIds = [];
    this.timeVals = [];
    this.LoadTimeVals();
    this.huddle_data.deadline_date = new Date();
    // new arif
    if (!this.EditMode) this.getUsers(3, false, true);

    setTimeout(() => {
      this.isLoading = false;

    }, 2000);

    this.loadFrameworksForMoreSettingDialogForm();
  }

  private RunSubscribers() {
    let that = this;
    let in_id = setInterval(() => {
      let headerData = that.headerService.getStaticHeaderData();
      if (headerData) {
        clearInterval(in_id);
        that.headerData = headerData;
      }
    }, 50);
    // New subscribers logic start
    if (this.EditMode) {
      this.mainService.GetEditableHuddle(this.huddleId).subscribe((data: any) => {
        if (!data.success) {
          this.toastr.info(data.message);
          location.href = environment.baseUrl + "/Huddles";
        }
        this.enable_framework_standard = data.enable_framework_standard;
        this.editableHuddle = data;
        this.formatEditableHuddle(data);
      });
    } else this.loadPermissions();
    // New subscribers logic end
    this.mainService.MoreSettings.subscribe((s) => {
      console.log('in subscribe s: ', s)
      this.huddle_data.more_settings = s;
      console.log('this.huddle_data.more_settings: ', this.huddle_data.more_settings)

    });
    this.mainService.users.subscribe((users) => {
      users.forEach((user) => { this.assignRole(user); });
      this.selectedusers = this.selectedusers.concat(JSON.parse(JSON.stringify(users)));
      // sort selectedusers array
      this.selectedusers = this.sortSelectedUsersExceptCreator();
    });
    // this.mainService.DeletedUser.subscribe((user)=>this.DeleteUser(user));
    this.dataSource = Observable.create((observer: any) => {
      // Runs on every search
      observer.next(this.asyncSelected);
    }).pipe(mergeMap((token: string) => this.getUsersAsObservable(token)));
    // this.mainService.getUsers();
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
    });
  }

  public AssessorChanged(ev, user) {
    if (ev == "false") {
      let found = false;
      this.selectedusers.forEach((u:any) => {
        if (u.isAssessor == "true")
          found = true;
      });
      if (!found) {
        this.toastr.info(this.translation.min_assessor_requirement);
        setTimeout(() => { user.isAssessor = "true"; });
      }
    }

  }

  public roleChanged(e, user) {
    if (this.EditMode && this.isCreator(user) && this.editableHuddle.huddle_type == "2") {
      // e.preventDefault();
      this.toastr.info(this.translation.huddle_you_cannot);
      setTimeout(() => {
        e.preventDefault();
        user.isCoach = "true";
      }, 100);
      return;
    }
    setTimeout(() => {
      if (user.isCoach == "true") return;
      let count = 0;
      this.selectedusers.forEach((u) => {
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
    this.huddle_data.hdescription = ""; // Arif
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
      index = _.findIndex(this.selectedusers, { user_id: user_id });
      if (index >= 0)
        return this.selectedusers[index];
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
            this.toastr.info(this.translation.huddle_permission_not_granted);
            location.href = environment.baseUrl + "/Huddles";
          } else {
            this.enable_framework_standard = d.enable_framework_standard;
          }
        })
      }
    }, 50);
  }

  public validateData() {
    if (!(this.huddle_data.deadline_date instanceof Date && !isNaN(this.huddle_data.deadline_date))) {
      this.huddle_data.deadline_date = "";
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



    this.huddle_data.huddle_type = Number(data.huddle_type);
    this.getUsers(this.huddle_data.huddle_type, true);
    this.editableHuddle = data;
    this.huddle_data.hname = data.current_huddle_info.name;
    this.huddle_data.hdescription = data.current_huddle_info.desc;
    this.huddle_data.submission_allowed = Number(data.submission_allowed);
    this.huddle_data.resource_submission_allowed = Number(data.resource_submission_allowed);
    if (data.submission_deadline_date) {
      let dateArray = data.submission_deadline_date.split("-");
      let sortedDate = dateArray[0] + "/" + dateArray[1] + "/" + dateArray[2];
      this.huddle_data.deadline_date = new Date(sortedDate);
    }
    if (data.submission_deadline_time) {
      this.huddle_data.deadline_time = (data.submission_deadline_time[0] == 0) ? data.submission_deadline_time.slice(1) : data.submission_deadline_time;
      let index = _.findIndex(this.timeVals, { name: this.huddle_data.deadline_time });
      this.huddle_data.deadline_time = this.timeVals[index]//data.submission_deadline_time;

    }
    if (!this.huddle_data.more_settings) {
      this.huddle_data.more_settings = {};
    }
    if (data.chk_frameworks) {
      if (Number(data.chk_frameworks) == 1) {
        this.huddle_data.more_settings.frameworks = true;
      } else {
        this.huddle_data.more_settings.frameworks = false;
      }
      //data.show_publish_comments =false;
      if (data.show_publish_comments) {
        if (Number(data.show_publish_comments) == 1) {
          this.huddle_data.more_settings.show_publish_comments = true;
        }
      }
      if (data.allow_per_video) {
        if (Number(data.allow_per_video) == 1) {
          this.huddle_data.more_settings.allow_per_video = true;
        }
      }
      if (data.chk_tags_value) {
        if (Number(data.chk_tags_value) == 1) {
          this.huddle_data.more_settings.video_marker = true;
        } else {
          this.huddle_data.more_settings.video_marker = false;
        }
      }
      if (data.coach_hud_feedback_value) {
        if (Number(data.coach_hud_feedback_value) == 1) {
          this.huddle_data.more_settings.enable_publish = true;
        }
      }
      if (data.coachee_permission_value) {
        if (Number(data.coachee_permission_value) == 1) {
          this.huddle_data.more_settings.allow_download = true;
        }
      }
      if (data.coachee_can_view_summary) {
        if (Number(data.coachee_can_view_summary) == 1) {
          this.huddle_data.more_settings.coachee_can_view_summary = true;
        }
      }
      if (data.can_comment_reply) {
        if (Number(data.can_comment_reply) == 1) {
          this.huddle_data.more_settings.can_comment_reply = true;
        }
      }
      if (data.framework_id) {
        this.huddle_data.more_settings.selected_framework = data.framework_id;
      }
      if (data.huddle_message.meta_data_value) {
        this.huddle_data.more_settings.invite_message = data.huddle_message.meta_data_value;
      }

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
      if (!this.selectedusers) this.selectedusers = [];
      this.assignFixRole(this.users[index], u.role_id);
      // this.selectedusers.unshift(this.getCopy(this.users[index])); // As per previous requirements new assessor will be on top
      this.selectedusers.push(this.getCopy(this.users[index]));
      // sort selectedusers array
      this.selectedusers = this.sortSelectedUsersExceptCreator();
      this.users.splice(index, 1);
    }
  }

  private AddUserToGrid(u) {
    let index = _.findIndex(this.users, { user_id: u.user_id });
    if (index >= 0) {
      if (!this.selectedusers) this.selectedusers = [];
      this.assignFixRole(this.users[index], u.role_id);
      // this.selectedusers.unshift(this.getCopy(this.users[index])); // As per previous requirements new assessor will be on top
      this.selectedusers.push(this.getCopy(this.users[index]));
      // sort selectedusers array
      this.selectedusers = this.sortSelectedUsersExceptCreator();
      this.users.splice(index, 1);
      // this.asyncSelected = '';
    }
  }

  private assignFixRole(user, role_id) {
    user.isAssessor = (role_id == 200) ? "true" : "false";
  }

  public DeleteUser(user) {
    if (user.user_id == -1) {
      let index = _.findIndex(this.selectedusers, { email: user.email });
      if (index >= 0) {
        this.selectedusers.splice(index, 1);
      }
    } else if (user.is_user) {
      // this.users.push(user);
      let index = _.findIndex(this.selectedusers, { user_id: user.user_id });
      if (index >= 0) {
        this.selectedusers.splice(index, 1);
        this.users.push(user);
      }
    } else {
      let index = _.findIndex(this.selectedusers, { id: user.id });
      if (index >= 0) {
        this.selectedusers.splice(index, 1);
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
          huddle_type: typeId
        };
        this.mainService.getUsers(obj).subscribe((data) => {
          that.users = that.formatUsers(data);
          that.users = _.sortBy(that.users, 'first_name');
          let user_id = headerData.user_current_account.User.id;
          this.currentUser = headerData.user_current_account.User;
          if (selectCurrent) {
            this.typeaheadOnSelect({ item: { id: Number(user_id) } });
          }
          that.inEligibleIds.push(user_id);
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
    return Observable.of(
      this.users.filter((user: any) => {
        if (!this.IsEligible(user)) return false;
        if (!user.is_user) {
          return query.test(user.name);
        }
        return query.test(user.first_name) || query.test(user.last_name) || query.test(user.first_name + " " + user.last_name) || query.test(user.email);
      })
    );
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  typeaheadOnSelect(e: any): void {
    let index = _.findIndex(this.users, { id: e.item.id });
    if (index >= 0) {
      if (!this.selectedusers) this.selectedusers = [];
      this.assignRole(this.users[index]);
      this.selectedusers.push(this.getCopy(this.users[index]));
      // sort selectedusers array
      this.selectedusers = this.sortSelectedUsersExceptCreator();
      this.users.splice(index, 1);
      this.asyncSelected = '';
    }
    // sort selectedusers array
    this.selectedusers = this.sortSelectedUsersExceptCreator();
  }

  private assignRole(user) {
    // Always assign role to user as an assessee
    if (this.currentUser.id == user.id)
      user.isAssessor = "true";
    else
      user.isAssessor = "false";

    // Old logic to dynamically set user role
    // if (!user.user_id)
    //   user.isAssessor = "false";
    // else if (this.selectedusers.length == 1)
    //   user.isAssessor = "false";
    // else
    //   user.isAssessor = "true";
  }

  private getCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  public submitHuddle() {
    this.huddle_data.hname = (this.huddle_data.hname) ? this.huddle_data.hname.trim() : null;
    if (!this.huddle_data.hname) {
      this.toastr.info(this.translation.huddle_give_huddle_name);
      return;
    }
    if (this.selectedusers.length == 0 || !this.selectedusers) {
      this.toastr.info(this.translation.huddle_add_least_participent);
      return;
    }
    this.newUsers = 0;
    let json = this.prepareHuddleData();
    if (!json) return;
    if (this.EditMode) {
      let sessionData: any;
      sessionData = this.headerService.getStaticHeaderData();
      json.account_id = sessionData.user_current_account.accounts.account_id;
      json.huddle_id = this.editableHuddle.current_huddle_info.account_folder_id;
      this.mainService.EditHuddle(json).subscribe((data: any) => {
        if (data.success) {
          this.toastr.info(this.translation.assessment_huddle_update_successfully);
          setTimeout(() => {
            this.router.navigate([`/video_huddles/assessment/${this.huddleId}`]);
          }, 2000);
        } else {
          this.toastr.info(this.translation.huddle_sorry_for_inconvenience);
        }
      })
    }
    else {
      this.mainService.AddHuddle(json).subscribe((data: any) => {
        if (data.success) {
          this.toastr.info(this.translation.huddle_successfully_created);
          this.router.navigate([`/video_huddles/assessment/${data.huddle_id}`]);
        } else {
          this.toastr.info(this.translation.huddle_sorry_for_inconvenience);
        }
      });
    }
  }

  public cancel() {
    if (this.EditMode) {

      if ((window as any).history.length > 1) (window as any).history.back();
      else this.router.navigate([`/video_huddles/assessment/${this.huddleId}`]);

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

  private prepareHuddleData() {
    let sessionData;
    sessionData = this.headerService.getStaticHeaderData();
    let obj: any = {
      account_role_id: sessionData.user_current_account.users_accounts.role_id,
      current_user_email: sessionData.user_current_account.User.email
    };
    obj.hname = this.huddle_data.hname;
    obj.hdescription = this.huddle_data.hdescription || "";
    obj["user_current_account"] = sessionData.user_current_account;
    obj["user_permissions"] = sessionData.user_permissions;
    if (this.folder_id != -1) {
      obj.folder_id = this.folder_id;
    }

    if (!this.huddle_data.deadline_date) {
      this.toastr.info(this.translation.huddle_deadline_date_is_required);
      return false;
    }
    if (!this.huddle_data.deadline_time) {
      this.toastr.info(this.translation.huddle_deadline_time_is_required);
      return false;
    }
    this.huddle_data.deadline_time = (this.huddle_data.deadline_time[0] == 0) ? this.huddle_data.deadline_time.slice(1) : this.huddle_data.deadline_time;

    // let index = _.findIndex(this.timeVals, { name: this.huddle_data.deadline_time });

    let index = _.findIndex(this.timeVals, { name: this.huddle_data.deadline_time.name });

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
    // if (!this.huddle_data.deadline_date) {
    //   this.toastr.info("Deadline date is required.");
    //   return false;
    // }
    // if (!this.huddle_data.deadline_time) {
    //   this.toastr.info("Deadline time is required.");
    //   return false;
    // }

    if (this.huddle_data.submission_allowed == 0 && this.huddle_data.resource_submission_allowed == 0) {
      this.toastr.info(this.translation.assessment_huddle_min_resource_or_video);
      return false;
    }

    obj.message = this.huddle_data.more_settings.invite_message;
    obj.chkenableframework = (this.huddle_data.more_settings.frameworks) ? 1 : 0;
    obj.chkenabletags = (this.huddle_data.more_settings.video_marker) ? 1 : 0;
    obj.type = 3;
    obj.submission_allowed = this.huddle_data.submission_allowed;
    obj.resource_submission_allowed = this.huddle_data.resource_submission_allowed;
    obj.submission_deadline_date = this.formatDate(this.huddle_data.deadline_date);//moment().format("DD-mm-YYYY");;
    obj.submission_deadline_time = this.huddle_data.deadline_time.name;
    obj.coachee_can_view_summary = (this.huddle_data.more_settings.coachee_can_view_summary) ? 1 : 0;
    obj.can_comment_reply = (this.huddle_data.more_settings.can_comment_reply) ? 1 : 0;
    // obj.chkcoacheepermissions = (this.huddle_data.more_settings.allow_download) ? 1 : 0;
    // obj.coach_hud_feedback = (this.huddle_data.more_settings.enable_publish) ? 1 : 0;
    if (obj.chkenableframework == 1) {
      obj.frameworks = this.huddle_data.more_settings.selected_framework;
    }
    obj.super_admin_ids = [];
    let count = 0;
    this.selectedusers.forEach((u) => {
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

  private assignGroupRole(obj, g) {
    if (!obj.group_ids) obj.group_ids = [];
    obj.group_ids.push(g.id);
    if (g.isAssessor == "true") {
      obj["group_role_" + g.id] = 200;
      obj["is_coach_" + g.id] = 1;
    } else if (g.isAssessor == "false") {
      obj["group_role_" + g.id] = 210;
      obj["is_mentor_" + g.id] = 1;
    }
  }

  // public CollabRoleChanged(user, role) {
  //   if (user.role_id && user.role_id == 125 && role != "viewer") {
  //     setTimeout(() => {
  //       user.user_huddle_role = "viewer";
  //       this.toastr.info("Viewer's role cannot be set to " + role);
  //     }, 50);
  //   }
  // }

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

  /**
   * Sort selectedusers array by firstName except the creator user i.e this.currentUser
   */
  private sortSelectedUsersExceptCreator() {
    // Temporary array holds objects with position and sort-value with reduced key-value pairs (id, firstName, index)
    // First we will sort this tempSelectedUsers array as it has minimum and only required key-value pairs  (id, firstName, index) 
    // instead of actual selectedtedusers array with bunch of key-value pairs that do nothing with sort. 
    // As we sort on base of first_name and will need id to not to apply sort on creator of this huddle
    let tempSelectedUsers = this.selectedusers.map((user, index) => {
      let userFirstName = (user.is_user) ? user.first_name : user.name; // pick first_name in case of iteratee type user and pick name in case of iteratee type group
      return { id: user.id, firstName: userFirstName.toLowerCase(), userIndex: index };
    });

    // Configure tempCurrentUser with reduced key-value pairs as demonstrated above 
    let tempCurrentUser = { id: Number(this.currentUser.id), firstName: this.currentUser.first_name.toLowerCase() };
    // sorting the mapped array containing the reduced values
    tempSelectedUsers.sort((firstIndex, secondIndex) => {
      let firstIndexName = firstIndex.firstName;
      let secondIndexName = secondIndex.firstName;
      if (firstIndex.firstName === tempCurrentUser.firstName && firstIndex.id === tempCurrentUser.id) return -1;
      if (secondIndex.firstName === tempCurrentUser.firstName && secondIndex.id === tempCurrentUser.id) return 1;
      if (firstIndexName < secondIndexName) return -1;
      if (firstIndexName > secondIndexName) return 1;
      return 0;
    });
    // return actual selectedusers array as per sorted indexs of tempSelectedUsers array
    return tempSelectedUsers.map(user => {
      return this.selectedusers[user.userIndex];
    });
  }

  openMoreSettingDialog() {
    let more_settings = JSON.parse(JSON.stringify(this.huddle_data.more_settings)); // Deep copy to avoid form update if user cancelled more setting dialog
    const initialState = {
      enable_framework_standard: this.enable_framework_standard,
      EditMode: this.EditMode,
      HuddleSettings: more_settings
    };

    this.modalService.show(MoreSettingsDialogComponent, { initialState, class: 'modal-lg' });
  }

  private loadFrameworksForMoreSettingDialogForm() {
    this.mainService.GetFrameworks().subscribe(frameworks => {
      this.mainService.updateAssessmentHuddleMoreSettingFrameworks(frameworks);
    });
  }

  public checkAssesseeSubmissions(user){
    let sessionData = this.headerService.getStaticHeaderData();
    let ev = "false"
    this.AssessorChanged(ev,user)
    let obj={
      huddle_id : this.editableHuddle.current_huddle_info.account_folder_id,
      user_id: user.user_id,
      user_role_id: sessionData.user_current_account.roles.role_id
    }
   this.mainService.getAssesseesubmissions(obj).subscribe((data:any)=>{
    
     if (data[0].total_submissions>0 && data[0].role_name=="Assessee"){
        alert("You cannot change the role of an assessee to an assessor once they have submitted videos or resources as an assessee.");
        this.AssessorChanged("true",user)
        user.isAssessor= "false";
      }
      else{
        this.AssessorChanged("false",user)
      }
      
   });
  }

  ngOnDestroy() {
    if (this.modalRef) this.modalRef.hide();
  }
}
