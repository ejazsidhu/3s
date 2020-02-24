import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { HeaderService, HomeService } from "@projectModules/app/services";
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DetailsHttpService } from '../servic/details-http.service';
import { BsModalService } from 'ngx-bootstrap';
import { environment } from '@src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: "conferencing",
  templateUrl: "./conferencing.component.html",
  styleUrls: ["./conferencing.component.css"]
})
export class ConferencingComponent implements OnInit {
  public huddle_name;
  public huddle_id;
  public upCommingEvents = [];
  public translation: any = {};
  public translationLoaded: boolean = false;
  public eventsLoaded: boolean = false;
  private subscriptions: Subscription = new Subscription();
  public addBtnPermissionLoaded: boolean = false;
  participents: any = [];
  popupIsLoading: boolean;
  actvities: any = [];
  sessionData: any = [];
  public ModalRefs: Modals = {};
  public cirqLiveData: any;
  public SearchString: any = "";
  public cirqPath: any;
  public cirqDataLoaded: boolean = false;
  @ViewChild("participantsModal", { static: false }) participantsModal;
  @ViewChild("activity", { static: false }) activity;
  constructor(
    private ARouter: ActivatedRoute,
    public toastr: ToastrService,
    public headerService: HeaderService,
    private router: Router,
    private homeService: HomeService,
    public detailsService: DetailsHttpService,
    private modalService: BsModalService,
    public sanitizer: DomSanitizer,
  ) {
    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      this.translationLoaded = true;
    }));
  }
  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();

    this.ARouter.params.subscribe(p => {
      this.huddle_id = +p["id"];

    });
    this.getBreadCrumbs();
    this.addBtnPermissionLoaded = true;
    this.GetCirqLiveData();
  }

  public getBreadCrumbs() {
    let obj: any = {
      folder_id: this.huddle_id
    };
    let sessionData: any = this.headerService.getStaticHeaderData();

    ({
      User: { id: obj.user_id },
      accounts: { account_id: obj.account_id }
    } = sessionData.user_current_account);

    let ref = this.subscriptions.add(this.homeService.GetBreadcrumbs(obj).subscribe((data: any) => {
       if (data.success == -1) {
        this.toastr.info(data.message);
      }
      else {
        let dataDeepCopy = JSON.parse(JSON.stringify(data));
        let folderName = dataDeepCopy[dataDeepCopy.length - 1].folder_name;
        let folderId = dataDeepCopy[dataDeepCopy.length - 1].folder_id;
        let breadCrumbToAdd = { folder_name: 'Conferences', folder_id: folderId, isCustom: true };
        this.huddle_name = folderName;
        data.push(breadCrumbToAdd)
      }

      this.homeService.updateBreadcrumb(data);
    }));
  }
  /**Get Cirqlive config data for passing to getupcomingeventss */
  public GetCirqLiveData() {
    this.detailsService.cirqliveData$.subscribe(
      data => {
        this.cirqLiveData = data;
      });

    if (this.cirqLiveData && this.cirqLiveData.auth_key) {
      console.log('in if of confg alreay have data');
      this.cirqDataLoaded = true;
      let path = `${environment.APIbaseUrl}/get_cirq_page_data?u_id=${this.cirqLiveData.userId}&u_f_name=${this.cirqLiveData.userFirstName}&u_l_name=${this.cirqLiveData.userLastName}&lti_email=${encodeURIComponent(this.sessionData.user_current_account.User.email)}&course_id=${this.cirqLiveData.userCourseId}&course_name=${this.cirqLiveData.userCourseName}&role=${this.cirqLiveData.userRole}&lti_sub_domain=${this.cirqLiveData.lti_sub_domain}&lti_key=${this.cirqLiveData.lti_zoom_key}&lti_secret=${this.cirqLiveData.lti_zoom_secret}`;
      this.cirqPath = this.sanitizer.bypassSecurityTrustResourceUrl(path);
      // this.getUpcomingEvents(this.cirqLiveData);
    } else if (this.cirqLiveData == 'disabled') {
      console.log("else if disable");
      this.router.navigate(['/video_huddles/huddle/details/' + this.huddle_id + '/artifacts/grid']);
      this.toastr.error('You have no access for using this service');
      // this.eventsLoaded = true;
    } else {
      console.log('api hit agein in else');
      this.subscriptions.add(this.detailsService.GetCirqLiveData().subscribe((cirQdata) => {
        this.cirqLiveData = cirQdata;
        if (this.cirqLiveData) {
          let obj = {
            huddle_id: this.huddle_id,
            account_id: this.sessionData.user_current_account.accounts.account_id,
            user_id: this.sessionData.user_current_account.User.id,
            role_id: this.sessionData.user_current_account.roles.role_id,
          }
          this.subscriptions.add(this.detailsService.GetArtifacts(obj).subscribe((data: any) => {
            let userInfoForCirq = {
              userId: data.user_info.id,
              userFirstName: data.user_info.first_name,
              userLastName: data.user_info.last_name,
              userCourseId: data.huddle_info[0].account_folder_id,
              userCourseName: encodeURIComponent(data.huddle_info[0].name),
              userRole: (data.role_id == 200 && data.users_accounts.role_id != 125) ? 'teacher' : 'student',
            }
            this.cirqLiveData = { ...this.cirqLiveData, ...userInfoForCirq };
            this.cirqDataLoaded = true;
            let path = `${environment.APIbaseUrl}/get_cirq_page_data?u_id=${this.cirqLiveData.userId}&u_f_name=${this.cirqLiveData.userFirstName}&u_l_name=${this.cirqLiveData.userLastName}&lti_email=${encodeURIComponent(this.sessionData.user_current_account.User.email)}&course_id=${this.cirqLiveData.userCourseId}&course_name=${this.cirqLiveData.userCourseName}&role=${this.cirqLiveData.userRole}&lti_sub_domain=${this.cirqLiveData.lti_sub_domain}&lti_key=${this.cirqLiveData.lti_zoom_key}&lti_secret=${this.cirqLiveData.lti_zoom_secret}`;
            this.cirqPath = this.sanitizer.bypassSecurityTrustResourceUrl(path);
            // this.getUpcomingEvents(this.cirqLiveData);
            this.detailsService.updateCirqliveData(this.cirqLiveData);// send data to service for using in other components
          }));
        } else {
          this.router.navigate(['/video_huddles/huddle/details/' + this.huddle_id + '/artifacts/grid']);
          this.toastr.error('You have no access for using this service');
        }
      }));
    }

  }

  /**Get upcoming events/conferences */
  // public getUpcomingEvents(data) {
  //   if (data && data.auth_key) {
  //     let obj: any = {
  //       key: data.auth_key,
  //       secret: data.auth_secret,
  //       api_root_url: data.api_root_url,
  //       lti_zoom_key: data.lti_zoom_key,
  //       course_id: this.huddle_id
  //     }

  //     this.subscriptions.add(this.detailsService.getUpcomingEvents(obj).subscribe((eventData: any) => {
  //       let eData = JSON.parse(eventData.data);
  //       if (eData.status == 200) {
  //         for (let key in eData.conferencingEvents) {
  //           let value = eData.conferencingEvents[key];
  //           let MeetingHost = '';
  //           for (let userKey in eData.users) {
  //             let userValue = eData.users[userKey];
  //             if (userValue.meetsIdUser == value.meetsIdUser_host) {
  //               MeetingHost = userValue.nameFirst + ' ' + userValue.nameLast;
  //               break;
  //             }
  //           }
  //           value.hostname = MeetingHost;
  //           this.upCommingEvents.push(value);
  //         }
  //       }
  //       this.eventsLoaded = true;
  //       console.log('eData.conferencingEvents: ', this.upCommingEvents)
  //     }));
  //   }
  // }

  public Onclickonparticipant() {
    this.ShowParticipentsModal(this.participantsModal, "lg_popup");
    this.detailsService.GetParticipentsList(this.huddle_id);
    this.participents = [];
    this.popupIsLoading = true;
    // this.actvities = this.detailService.getActivitiesList();
    this.detailsService.getParticientslist().subscribe(d => {
      this.participents = d;
      this.popupIsLoading = false;
      //console.log("par  par apar", this.participents)
    });
  }
  public Onclickactivity() {
    this.ShowParticipentsModal(this.activity, "lg_popup");
    this.actvities = []
    this.popupIsLoading = true;
    this.getAcitives();

  }
  public ShowParticipentsModal(template: TemplateRef<any>, class_name) {
    this.ModalRefs.participentsModal = this.modalService.show(template, {
      class: class_name
    });
  }
  public GetParticipents() {
    // this.detailsService.GetParticipentsList(this.huddle_id, this.huddle_type);
    let obj: any = {
      huddle_id: +this.huddle_id,
      user_role_id: +this.sessionData.user_current_account.roles.role_id,
      user_id: +this.sessionData.user_current_account.User.id,
      // folder_type: this.huddle_type || 0
    };
  }
  getAcitives() {
    let sessionData: any = this.headerService.getStaticHeaderData();
    let obj: any = {
      folder_id: this.huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      role_id: sessionData.user_current_account.roles.role_id
    };

    this.subscriptions.add(this.detailsService.getActivities(obj).subscribe(
      data => {
        this.actvities = data;
        this.detailsService.setActivities(this.actvities)
        this.popupIsLoading = false;
      },
      error => { }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

interface Modals {
  [key: string]: any;
}


