import {Component, OnInit, OnDestroy, ViewChild, EventEmitter, HostListener} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import {ISlimScrollOptions, SlimScrollEvent} from 'ngx-slimscroll';
import {Subscription} from 'rxjs';

import {HeaderService, SocketService} from '@projectModules/app/services';
import {PeopleHttpService} from '@people/services';
import {environment} from '@environments/environment';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit, OnDestroy {

  @HostListener('click', ['$event'])
  onClick(event) {
    event.stopPropagation();
    console.log('event', event);
  }


  account_id: any;
  user_id: any;
  role_id: any;
  headData: any;
  current_user: any = {};
  huddle_data: any;
  staticImageServiceIp = 'https://s3.amazonaws.com/sibme.com/static/users/';
  collabtoggle: boolean = true;
  coachtoggle: boolean = false;
  assestoggle: boolean = false;
  pC: number = 1;
  pCa: number = 1;
  pA: number = 1;
  collab_data: any;
  coach_data: any;
  assest_data: any;
  user_huddles: any;
  huddle_role: any;
  saveObj = {};
  @ViewChild('addhuddle', {static: false}) addhuddle: ModalDirective;
  @ViewChild('account_owner_priv', {static: false}) account_owner_priv: ModalDirective;
  @ViewChild('superadmin_priv', {static: false}) superadmin_priv: ModalDirective;
  @ViewChild('admin_priv', {static: false}) admin_priv: ModalDirective;
  @ViewChild('user_priv', {static: false}) user_priv: ModalDirective;
  @ViewChild('viewer_priv', {static: false}) viewer_priv: ModalDirective;
  @ViewChild('participant_popup', {static: false}) participant_popup: ModalDirective;
  @ViewChild('errorRemove', {static: false}) errorRemove: ModalDirective;
  @ViewChild('accountinfo_role', {static: false}) accountinfo_role: ModalDirective;
  @ViewChild('roleChange', {static: false}) roleChange: ModalDirective;

  addhuddle_collab: any = [];
  addhuddle_coach: any = [];
  addhuddle_assest: any = [];
  modalDatatitle: string;
  modalDataArray: any;
  addhuddletype: number;
  addHuddleDataArray: any = [];
  participants: any;
  reset_assest_data: any;
  reset_coach_data: any;
  reset_collab_data: any;
  addhuddleSearch: any;
  modalConfig = {
    ignoreBackdropClick: true
  };
  skeletonLoading: boolean;
  cross_clicked: boolean = false;
  socket_listener: any;
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  errorPrem: boolean = false;
  errorPremMsg: any;
  currentUrl: string;
  curentPayload: { account_id: any; user_id: any; role: any; };
  lastRoleId: any;

  public translation: any = {};
  private translationSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private headerService: HeaderService,
    private peoplehttp: PeopleHttpService,
    private toastr: ToastrService,
    private socketService: SocketService) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.opts = {
      position: 'right', // left | right
      barBackground: '#C9C9C9', // #C9C9C9
      barOpacity: '0.8', // 0.8
      barWidth: '10', // 10
      barBorderRadius: '20', // 20
      barMargin: '0', // 0
      gridBackground: '#D9D9D9', // #D9D9D9
      gridOpacity: '1', // 1
      gridWidth: '0', // 2
      gridBorderRadius: '20', // 20
      gridMargin: '0', // 0
      alwaysVisible: true, // true
      visibleTimeout: 1000, // 1000
    };
    this.headData = this.headerService.getStaticHeaderData();
    this.skeletonLoading = true;
    this.route.paramMap.subscribe((params: any) => {
      this.account_id = params.params.account_id;
      this.user_id = params.params.user_id;
      this.role_id = params.params.role_id;
    });
    this.assign_user();
    let channel_name = `people_${this.headData.user_current_account.users_accounts.account_id}`;
    this.socket_listener = this.socketService.pushEventWithNewLogic(channel_name).subscribe(data => this.processEventSubscriptions(data));
    // this.processEventSubscriptions();
  }

  assign_user() {
    let url = environment.APIbaseUrl + '/users/assign_user';
    let body = {
      account_id: this.account_id,
      user_id: this.user_id,
      logged_in_role: this.headData.user_current_account.roles.role_id,
      logged_in_account_id: this.headData.user_current_account.users_accounts.account_id,
      not_logged_in_role: this.role_id,
    };
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      this.skeletonLoading = false;
      if (d.status) {
        this.current_user = d.data.users;
        if (this.current_user.parmission_access_my_workspace == 1) {
          this.current_user.parmission_access_my_workspace = true;
        } else {
          this.current_user.parmission_access_my_workspace = false;
        }
        if (this.current_user.permission_access_video_library == 1) {
          this.current_user.permission_access_video_library = true;
        } else {
          this.current_user.permission_access_video_library = false;
        }
        this.huddle_data = d.data.huddle_data;
        this.user_huddles = d.data.associate_huddle_users;
        if (this.user_huddles != null) {
          this.collab_data = this.huddle_data.filter(collab => {
            let data = this.user_huddles.find(user => {
              return collab.meta_data_value == 1 && user == collab.account_folder_id;
            });
            if (data) {
              return data;
            } else {
              this.addhuddle_collab.push(collab);
            }
          });
          this.coach_data = this.huddle_data.filter(coach => {
            let data = this.user_huddles.find(user => {
              return coach.meta_data_value == 2 && user == coach.account_folder_id;
            });
            if (data) {
              return data;
            } else {
              this.addhuddle_coach.push(coach);
            }
          });
          this.assest_data = this.huddle_data.filter(assest => {
            let data = this.user_huddles.find(user => {
              return assest.meta_data_value == 3 && user == assest.account_folder_id;
            });
            if (data) {
              return data;
            } else {
              this.addhuddle_assest.push(assest);
            }
          });
          this.reset_collab_data = JSON.parse(JSON.stringify(this.collab_data));
          this.reset_coach_data = JSON.parse(JSON.stringify(this.coach_data));
          this.reset_assest_data = JSON.parse(JSON.stringify(this.assest_data));
        } else {
         this.huddle_data.filter(collab => {
            if(collab.meta_data_value==1){
              this.addhuddle_collab.push(collab);
            } 
          });
          this.huddle_data.filter(coach => {
            if(coach.meta_data_value==2){
              this.addhuddle_coach.push(coach);
            } 
          });
          this.huddle_data.filter(asses => {
            if(asses.meta_data_value==3){
              this.addhuddle_assest.push(asses);
            } 
          });
          this.collab_data = [];
          this.coach_data = [];
          this.assest_data = [];
        }
      } else {
        this.toastr.info(d.message);
        if (d.redirect_to) {
          this.router.navigate(['/people']);
        }
      }
      if (this.coach_data.length == 0) {
        this.coachtoggle = true;
      } else if (this.assest_data.length == 0) {
        this.assestoggle = true;
      }
    });
  }

  saveChanges(huddle_type) {
    this.cross_clicked = false;
    let body = {
      huddle_type_id: huddle_type,
      account_id: this.account_id,
      user_id: this.user_id,
      current_user_id: this.headData.user_current_account.User.id,
      account_folder_ids: {}
    };
    if (huddle_type == 1) {
      this.collab_data.forEach(x => {
        body.account_folder_ids[x.account_folder_id] = x.role_id;
      });
    } else if (huddle_type == 2) {
      this.coach_data.forEach(x => {
        body.account_folder_ids[x.account_folder_id] = x.role_id;
      });
    } else if (huddle_type == 3) {
      this.assest_data.forEach(x => {
        body.account_folder_ids[x.account_folder_id] = x.role_id;
      });
    }
    let url = environment.APIbaseUrl + '/users/associate_huddle_user';
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      if (d.status) {
        this.toastr.info(d.message);
      } else {
        if (d.is_permission) {
          this.errorPrem = true;
          this.errorPremMsg = d.message;
          this.showModal('errorRemove');
        } else {
          this.toastr.error(d.message);
        }
      }
    });
    // obj.user_role_`${array.map(data=>{return data.account_folder_id})}` = array.map(data=>{return data.role_id})
  }

  cancelChanges(huddle_type) {
    this.cross_clicked = false;
    if (huddle_type == 1) {
      this.collab_data = this.reset_collab_data;
      this.collabtoggle = !this.collabtoggle;
    }
    ;
    if (huddle_type == 2) {
      this.coach_data = this.reset_coach_data;
      this.coachtoggle = !this.coachtoggle;
    }
    if (huddle_type == 3) {
      this.assest_data = this.reset_assest_data;
      this.assestoggle = !this.assestoggle;
    }
  }

  change_permission(role) {
    this.lastRoleId = this.role_id;
    let url = environment.APIbaseUrl + '/users/change_permission';
    let body = {
      account_id: this.account_id,
      user_id: this.user_id,
      role: role,
    };
    if (role != 125) {
      this.changeRole(url, body);
    } else {
      this.currentUrl = url;
      this.curentPayload = body;
      this.showRoleChange();

    }


  }


  changeRole(url, body) {
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      this.hideRoleChange();
      if (d.status) {
        this.toastr.info(d.message);
      } else {
        this.toastr.error(d.message);
      }
    });
  }

  deleteHuddle(huddle_type, account_folder_id, huddle) {
    this.cross_clicked = true;
    let url = environment.APIbaseUrl + '/check_coaching_huddle_scenario';
    let body = {
      huddle_id: huddle.account_folder_id,
      user_id: this.user_id
    };
    this.peoplehttp.httpPostCall(url, body).subscribe((data: any) => {
      if (data.status) {
        if (huddle_type == 1) {
          let index = this.collab_data.findIndex((data) => {
            return data.account_folder_id == account_folder_id;
          });
          this.collab_data.splice(index, 1);
        } else if (huddle_type == 2) {
          let index = this.coach_data.findIndex((data) => {
            return data.account_folder_id == account_folder_id;
          });
          this.coach_data.splice(index, 1);
        } else if (huddle_type == 3) {
          let index = this.assest_data.findIndex((data) => {
            return data.account_folder_id == account_folder_id;
          });
          this.assest_data.splice(index, 1);
        }
        //  this.toastr.info('Huddle Removed Successfully','Remove Huddle')
      } else {
        this.addhuddletype = huddle_type;
        this.huddle_role = data.role_id;
        this.showModal('errorRemove');
      }
    });
  }

  ImageUrlBuilder(participant: any) {
    if (participant) {
      if (participant.image == 'groups') {
        return true;
      } else {
        let image = participant.image || 'assets/img/photo-default.png';
        if (participant.id) {
          let url = `${this.staticImageServiceIp}${participant.id}/${
            participant.image
            }`;
          return participant.image ? url : image;
        } else {
          let url = `${this.staticImageServiceIp}${participant.user_id}/${
            participant.image
            }`;
          return participant.image ? url : image;
        }
      }
    }
  }

  addHuddleData(checked, item) {
    if (checked.checked) {
      if (this.addhuddletype == 1) {
        item.role_id = 220;
        this.addHuddleDataArray.push(item);
      } else if (this.addhuddletype == 2) {
        item.role_id = 210;
        this.addHuddleDataArray.push(item);
      } else if (this.addhuddletype == 3) {
        item.role_id = 210;
        this.addHuddleDataArray.push(item);
      }
    } else {
      this.addHuddleDataArray.forEach((x, i) => {
        if (x.account_folder_id == item.account_folder_id) {
          this.addHuddleDataArray.splice(i, 1);
        }
      });
    }
  }

  addhuddleAdd() {
    if (this.addHuddleDataArray.length > 0) {
      if (this.addhuddletype == 1) {
        this.collab_data = [...this.addHuddleDataArray, ...this.collab_data];
        this.collabtoggle = true;
      } else if (this.addhuddletype == 2) {
        this.coach_data = [...this.addHuddleDataArray, ...this.coach_data];
        this.coachtoggle = true;
      } else if (this.addhuddletype == 3) {
        this.assest_data = [...this.addHuddleDataArray, ...this.assest_data];
        this.assestoggle = true;
      }
      this.hideModal('addhuddle');
      // this.toastr.info(this.translation.poeple_huddle_successfully_added,this.translation.poeple_add_huddle)
    } else {
      this.toastr.info('Please Select Huddle!');
    }
  }

  donePriv() {
    let url = environment.APIbaseUrl + '/users/associate_video_huddle_user';
    let body = {
      account_id: this.current_user.account_id,
      user_id: this.current_user.id,
      user_account_id: this.current_user.user_account_id,
      current_user_id: this.headData.user_current_account.User.id,
      permission_access_video_library: this.current_user.permission_access_video_library,
      permission_administrator_user_new_role: this.current_user.permission_administrator_user_new_role,
      permission_maintain_folders: this.current_user.permission_maintain_folders,
      folders_check: this.current_user.folders_check,
      permission_start_synced: this.current_user.permission_start_synced,
      permission_scripted_notes: this.current_user.permission_scripted_notes,
      permission_video_library_upload: this.current_user.permission_video_library_upload,
      permission_view_analytics: this.current_user.permission_view_analytics,
      parmission_access_my_workspace: this.current_user.parmission_access_my_workspace,
      manage_collab_huddles: this.current_user.manage_collab_huddles,
      permission_view_account_wide_analytics: this.current_user.permission_view_account_wide_analytics,
      permission_video_workspace_upload: this.current_user.permission_video_workspace_upload,
    };

    if (body.parmission_access_my_workspace) {
      debugger;
      body.parmission_access_my_workspace = 1;
    } else {
      body.parmission_access_my_workspace = 0;
    }
    if (body.permission_access_video_library) {
      body.permission_access_video_library = 1;
    } else {
      body.permission_access_video_library = 0;
    }

    if (this.role_id == 115) {
      body.parmission_access_my_workspace = 1;
      body.permission_video_workspace_upload = 1;
      body.permission_scripted_notes = 1;
      body.permission_start_synced = 1;
      body.manage_collab_huddles = 1;
      body.permission_access_video_library = 1;
      body.permission_view_analytics = this.current_user.permission_view_analytics;
    } else if (this.role_id == 120) {
      body.permission_administrator_user_new_role = 0;
      body.permission_view_account_wide_analytics = 0;
    } else if (this.role_id == 125) {
      body.permission_access_video_library = 1;
      body.permission_administrator_user_new_role = 0;
      body.permission_maintain_folders = 0;
      body.folders_check = 0;
      body.permission_scripted_notes = 0;
      body.permission_start_synced = 0;
      body.permission_video_library_upload = 0;
      body.permission_video_workspace_upload = 0;
      // body.parmission_access_my_workspace = 0;
      body.permission_view_account_wide_analytics = 0;
      body.permission_view_analytics = 0;
      body.manage_collab_huddles = 0;
    }
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      if (d.status) {
        this.hideModal('priv');
        this.toastr.info(d.message);
      } else {
        this.hideModal('priv');
        this.toastr.error(d.message);
      }
    });
  }

  getParticipants(account_folder_id, huddle_type) {
    this.addhuddletype = huddle_type;
    let url = environment.APIbaseUrl + `/get_participants/${account_folder_id}`;
    this.peoplehttp.httpGetCall(url).subscribe((d: any) => {
      if (d.status) {
        this.participants = d.data;
        this.showModal('activity');
      }
    });
  }

  private processEventSubscriptions(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
    // console.log("A Web Socket event received");
    // console.log(data);
    switch (data.event) {
      case 'user_role_changed':
        let user_id = data.user_id;
        let role_id = data.role_id;
        if (user_id == this.user_id) {
          this.role_id = role_id;
          this.router.navigate([`/people/home/people/permission/${this.account_id}/${this.user_id}/${role_id}`]);
        }
        break;
      default:
        // code...
        break;
    }
    // });
  }

  showModal(modal, modaltype?) {
    if (modal == 'addhuddle') {
      this.addhuddle.config = this.modalConfig;
      this.addhuddle.show();
      this.addhuddletype = modaltype;
      if (modaltype == 1) {
        this.modalDatatitle = this.translation.poeple_collaboration;
        this.collab_data.forEach(x => {
          this.addhuddle_collab.forEach((d, di) => {
            if (x.account_folder_id == d.account_folder_id) {
              this.addhuddle_collab.splice(di, 1);
              this.addhuddle_collab = [...this.addhuddle_collab];
            }
          });
        });
        this.modalDataArray = this.addhuddle_collab;
      } else if (modaltype == 2) {
        this.modalDatatitle = this.translation.poeple_coaching;
        this.coach_data.forEach(x => {
          this.addhuddle_coach.forEach((d, di) => {
            if (x.account_folder_id == d.account_folder_id) {
              this.addhuddle_coach.splice(di, 1);
              this.addhuddle_coach = [...this.addhuddle_coach];
            }
          });
        });
        this.modalDataArray = this.addhuddle_coach;
      } else if (modaltype == 3) {
        this.modalDatatitle = this.translation.poeple_assessment;
        this.assest_data.forEach(x => {
          this.addhuddle_assest.forEach((d, di) => {
            if (x.account_folder_id == d.account_folder_id) {
              this.addhuddle_assest.splice(di, 1);
              this.addhuddle_assest = [...this.addhuddle_assest];
            }
          });
        });
        this.modalDataArray = this.addhuddle_assest;
      }
    } else if (modal == 'priv') {
      if (this.role_id == 100) {
        this.account_owner_priv.config = this.modalConfig;
        this.account_owner_priv.show();
      } else if (this.role_id == 110) {
        this.superadmin_priv.config = this.modalConfig;
        this.superadmin_priv.show();
      } else if (this.role_id == 115) {
        this.admin_priv.config = this.modalConfig;
        this.admin_priv.show();
      } else if (this.role_id == 120) {
        this.user_priv.config = this.modalConfig;
        this.user_priv.show();
      } else if (this.role_id == 125) {
        this.viewer_priv.config = this.modalConfig;
        this.viewer_priv.show();
      }
    } else if (modal == 'activity') {
      this.participant_popup.config = this.modalConfig;
      this.participant_popup.show();
    } else if (modal == 'errorRemove') {
      this.errorRemove.config = this.modalConfig;
      this.errorRemove.show();
    } else if (modal == 'accountinfo_role') {
      this.accountinfo_role.config = this.modalConfig;
      this.accountinfo_role.show();
    }
  }

  hideModal(modal) {
    if (modal == 'addhuddle') {
      var allcheckbox = document.querySelectorAll('.addhuddle_checkbox');
      allcheckbox.forEach((x: any) => {
        x.checked = false;
      });
      this.addhuddle.hide();
      this.addHuddleDataArray = [];
    } else if (modal == 'priv') {
      if (this.role_id == 100) {
        this.account_owner_priv.hide();
      } else if (this.role_id == 110) {
        this.superadmin_priv.hide();
      } else if (this.role_id == 115) {
        this.admin_priv.hide();
      } else if (this.role_id == 120) {
        this.user_priv.hide();
      } else if (this.role_id == 125) {
        this.viewer_priv.hide();
      }
    } else if (modal == 'activity') {
      this.participant_popup.hide();
    } else if (modal == 'errorRemove') {
      this.errorRemove.hide();
    } else if (modal == 'accountinfo_role') {
      this.accountinfo_role.hide();
    }
  }


  showRoleChange(): void {
    this.roleChange.show();
  }

  hideRoleChange(): void {
    this.roleChange.hide();

  }

  onCancelHideRoleChange() {

    this.roleChange.hide();

  }

  public checkAssesseeSubmissions(user) {
    let sessionData = this.headerService.getStaticHeaderData();

    let obj = {
      huddle_id: user.account_folder_id,
      user_id: user.user_id,
      user_role_id: sessionData.user_current_account.roles.role_id
    };
    this.headerService.getAssesseesubmissions(obj).subscribe((data: any) => {
      //console.log("in the api",data[0]);
      if (data[0].total_submissions > 0 && user.role_id != 200) {
        alert('You cannot change the role of an assessee to an assessor once they have submitted videos or resources as an assessee.');
        //user.role_id==210
        // this.AssessorChanged("true",user)
        // user.isAssessor= "false";
        this.assest_data.forEach(p => {
          if (user.account_folder_id == p.account_folder_id) {
            p.role_id = 210;
          }
        });
      } else {
        user.role_id == 200;
        console.log(this.assest_data);
        this.assest_data.forEach(p => {
          if (user.account_folder_id == p.account_folder_id) {
            p.role_id = 200;
          }
        });
        //this.AssessorChanged("false",user)
      }

    });
  }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
  }
}
