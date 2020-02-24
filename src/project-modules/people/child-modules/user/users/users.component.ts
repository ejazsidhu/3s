import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { HeaderService, SocketService } from "@projectModules/app/services";
import { PeopleHttpService } from '@people/services';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy,AfterViewInit {
  @ViewChild('multipeople', { static: false }) multipeople: ModalDirective;
  @ViewChild('deactiveDelete', { static: false }) deactiveDelete: ModalDirective;
  @ViewChild('changepassword', { static: false }) changepassword: ModalDirective;
  @ViewChild('resend_inv', { static: false }) resend_inv: ModalDirective;
  @ViewChild('newsuper', { static: false }) newsuper: ModalDirective;
  @ViewChild('activeuser', { static: false }) activeuser: ModalDirective;
  @ViewChild('deletepopup', { static: false }) deletepopup: ModalDirective;
  @ViewChild('account_ownerrole', { static: false }) account_ownerrole: ModalDirective;
  @ViewChild('adduser1', { static: false }) elRef:any;

  headData: any;
  accountOwner: any;
  deactivatedUsers: any = [];
  admins: any = [];
  supperAdmins: any = [];
  users: any = [];
  viewers: any = [];
  CurrentPage: any;
  maxPageSize: any = 12;
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  deactivateSearch = '';
  viewerSearch = '';
  userSearch = '';
  adminSearch = '';
  superAdminSearch = '';
  pS: number = 1;
  pA: number = 1;
  pU: number = 1;
  pV: number = 1;
  pD: number = 1;
  deactiveDeleteData: any = {};
  deleteString: any;
  deactivateSearch2: any = '';
  cPass: any = {
    npaswrd: '',
    cnpaswrd: '',
    email: false,
  }
  addusr_roleid: any = 0;
  addusr_message: any = '';
  addusr_obj: any = [
    {
      name: '',
      email: ''
    },
    {
      name: '',
      email: ''
    },
    {
      name: '',
      email: ''
    }
  ];
  deleteDeString: string = '';
  superadminAccess: boolean;
  adminAccess: boolean;
  userAccess: boolean;
  viewerAccess: boolean;
  passwordChange: boolean;
  active: boolean;
  deActive: boolean;
  showdummyFieldToStopAutoComplete: boolean = true;
  delete: boolean;
  accountOwnerAccess: boolean;
  accountOwnerPassword: boolean;
  AddMultiPeoplePrem: boolean;
  superAdminAdd: boolean;
  skeletonLoading: boolean;
  infopopupTitle: string;
  infopopupData: string;
  addmultiEmail: any = true;
  modalConfig = {
    ignoreBackdropClick: true
  }
  socket_listener: any;
  csvFile: any;
  addUEmail: any = true;
  svgToggle: boolean = false;
  APIcalInProcess=false;

  public translation: any = {};
  private translationSubscription: Subscription;

  constructor(
    private peoplehttp: PeopleHttpService,
    private headerService: HeaderService,
    private toastr: ToastrService,
    private socketService: SocketService,
    private router:Router) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.headData = this.headerService.getStaticHeaderData();
    this.skeletonLoading = true;
    this.adminUsers();
    if (this.headData.user_current_account.roles.role_id == 100) {
      this.accountOwnerAccess = true;
      this.accountOwnerPassword = true;
      this.AddMultiPeoplePrem = true;
      this.superadminAccess = true;
      this.superAdminAdd = true;
      this.adminAccess = true;
      this.userAccess = true;
      this.viewerAccess = true;
      this.passwordChange = true;
      this.deActive = true;
      this.active = true;
      this.delete = true;
    } else if (this.headData.user_current_account.roles.role_id == 110) {
      this.accountOwnerAccess = false;
      this.accountOwnerPassword = false;
      this.AddMultiPeoplePrem = true;
      this.superadminAccess = true;
      this.superAdminAdd = true;
      this.adminAccess = true;
      this.userAccess = true;
      this.viewerAccess = true;
      this.passwordChange = true;
      this.deActive = true;
      this.active = true;
      this.delete = true;
    } else if (this.headData.user_current_account.roles.role_id == 115) {
      this.accountOwnerAccess = false;
      this.accountOwnerPassword = false;
      this.AddMultiPeoplePrem = false;
      this.superadminAccess = false;
      this.superAdminAdd = false;
      this.adminAccess = true;
      this.userAccess = true;
      this.viewerAccess = true;
      this.passwordChange = true;
      this.deActive = true;
      this.active = true;
      this.delete = true;
    } else if (this.headData.user_current_account.roles.role_id == 120) {
      this.accountOwnerAccess = false;
      this.accountOwnerPassword = false;
      this.AddMultiPeoplePrem = false;
      this.superadminAccess = false;
      this.superAdminAdd = false;
      this.adminAccess = false;
      this.userAccess = true;
      this.viewerAccess = true;
      this.passwordChange = true;
      this.deActive = true;
      this.active = true;
      this.delete = true;
    } else if (this.headData.user_current_account.roles.role_id == 125) {
      this.accountOwnerAccess = false;
      this.accountOwnerPassword = false;
      this.AddMultiPeoplePrem = false;
      this.superadminAccess = false;
      this.superAdminAdd = false;
      this.adminAccess = false;
      this.userAccess = false;
      this.viewerAccess = false;
      this.passwordChange = false;
      this.deActive = false;
      this.active = false;
      this.delete = false;
    }
    let channel_name = `people_${this.headData.user_current_account.users_accounts.account_id}`;
    this.socket_listener = this.socketService.pushEventWithNewLogic(channel_name).subscribe(data => this.processEventSubscriptions(data));
    // this.processEventSubscriptions();

    setTimeout(() => {
      this.showdummyFieldToStopAutoComplete = false;
    }, 3000);

    
  }
ngAfterViewInit(){
  const el:HTMLElement=window.document.getElementById('adduser')
  //console.log(this.elRef,el);

  // console.log(this.router.url,this.router.url.indexOf('#'))
  //   if(this.router.url.indexOf('#')>-1){
  // // redirection logic gose here
  //   }
  
}
 

  addMultiPeople(files: FileList) {
    let url = environment.APIbaseUrl + '/import_user'
    let body: FormData = new FormData();
    let fileToUpload: File = files.item(0)
    body.append('additional_attachemnt', fileToUpload, fileToUpload.name);
    body.append('account_id', this.headData.user_current_account.users_accounts.account_id);
    body.append('user_id', this.headData.user_current_account.User.id);
    body.append('first_name', this.headData.user_current_account.User.first_name);
    body.append('last_name', this.headData.user_current_account.User.last_name);
    body.append('send_email', this.addmultiEmail);

    this.hideModal('multipeople');

    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      if (d.status) {
        this.toastr.info(d.message, '' , {
          enableHtml: true,
        });
        this.csvFile = null;
        body = new FormData();
      } else {
        this.toastr.error(d.message,'' , {
          enableHtml: true,
        });
        this.csvFile = null;
        body = new FormData();
      }
    }, err => {
      this.toastr.error(err.message,'' , {
        enableHtml: true,
      })
      this.csvFile = null;
      body = new FormData();
    })
    // this.adminUsers();
   

  }
  adminUsers() {
    let url = environment.APIbaseUrl + '/users/administrators_groups'
    let body = {
      user_id: this.headData.user_current_account.User.id,
      role_id: this.headData.user_current_account.roles.role_id,
      account_id: this.headData.user_current_account.users_accounts.account_id,
      permission_access_video_library: this.headData.user_permissions.UserAccount.permission_access_video_library,
      permission_video_library_upload: this.headData.user_permissions.UserAccount.permission_video_library_upload,
      permission_administrator_user_new_role: this.headData.user_permissions.UserAccount.permission_administrator_user_new_role,
    }
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      if (d.status) {
        if (d.data) {
          this.accountOwner = d.data.accountOwner;
          this.deactivatedUsers = d.data.deactivatedUsers;
          if (this.deactivatedUsers == false) {
            this.deactivatedUsers = []
          }
          this.admins = d.data.newAdmins;
          this.supperAdmins = d.data.supperAdmins;
          this.users = d.data.users;
          this.viewers = d.data.viewers;
          this.skeletonLoading = false;
          this.supperAdmins.forEach(x => {
            x.mouseenter = false
          });
          this.users.forEach(x => {
            x.mouseenter = false
          });
          this.viewers.forEach(x => {
            x.mouseenter = false
          });
          this.admins.forEach(x => {
            x.mouseenter = false
          });
          this.deactivatedUsers.forEach(x => {
            x.mouseenter = false
          });
        }
      } else {
        this.toastr.error(d.message)
        if (d.redirect_to) window.location.href = environment.baseUrl + d.redirect_to;
      }
    })
  }
  ImageUrlBuilder(participent: any) {
    if (participent) {
      if (participent.image == 'groups') {
        return true
      } else {
        let image = participent.image || "assets/img/photo-default.png";
        let url = `${this.staticImageServiceIp}${participent.user_id}/${
          participent.image
          }`;
        return participent.image ? url : image;
      }
    }
  }
  modalData(data) {
    this.deactiveDeleteData = data;
    if (data) {
      this.deactivatedUsers.forEach(x => {
        if (x.id == data.id) {
          data.isitDeUser = true
        }
      });
    }
  }
  deleteUser() {
    this.APIcalInProcess=true;
    let sessionData:any = this.headerService.getStaticHeaderData();
    let language = sessionData.language_translation.current_lang;
    if ((language == 'en' && this.deleteString == 'DELETE') || (language == 'es' && this.deleteString == 'ELIMINAR') ) {
      let url = environment.APIbaseUrl + '/users/deleteAccount';
      let body = {
        user_id: this.deactiveDeleteData.id,
        current_user_id: this.headData.user_current_account.User.id,
        company_name: this.deactiveDeleteData.company_name,
        current_account_id: this.headData.user_current_account.users_accounts.account_id,
      }
      this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
        if (d.status) {
          this.hideModal('deactiveDelete');
          this.toastr.info(d.message);
        }
        this.APIcalInProcess=false;
      }, err => {
        this.toastr.error(err)
      })
    } else {
      this.toastr.info(this.translation.poeple_type_delete_then_delete)
    }
  }
  deleteDeUser() {
    //debugger;
    let sessionData:any = this.headerService.getStaticHeaderData();
    let language = sessionData.language_translation.current_lang;
    
    if ((language == 'en' && this.deleteDeString == 'DELETE') || (language == 'es' && this.deleteDeString == 'ELIMINAR') ) {
      let url = environment.APIbaseUrl + '/users/deleteAccount';
      let body = {
        user_id: this.deactiveDeleteData.id,
        current_user_id: this.headData.user_current_account.User.id,
        company_name: this.deactiveDeleteData.company_name,
        current_account_id: this.headData.user_current_account.users_accounts.account_id,
      }
      this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
        if (d.status) {
          this.hideModal('delete');
          this.toastr.info(d.message);
        }
      }, err => {
        this.toastr.error(err)
      })
    } else {
      this.toastr.info(this.translation.poeple_type_delete_then_delete)
    }
  }
  changePassword() {
    this.APIcalInProcess=true;
    if (this.cPass.npaswrd == this.cPass.cnpaswrd && this.cPass.npaswrd.length >= 8 && this.cPass.cnpaswrd.length >= 8) {
      let url = environment.APIbaseUrl + '/users/change_password_accounts';
      let obj = {
        user_id: this.deactiveDeleteData.user_id,
        password: this.cPass.npaswrd,
        confirm_password: this.cPass.cnpaswrd,
        send_email: this.cPass.email,
        account_id: this.deactiveDeleteData.account_id,
        first_name: this.headData.user_current_account.User.first_name,
        last_name: this.headData.user_current_account.User.last_name,
      }
      this.peoplehttp.httpPostCall(url, obj).subscribe((d: any) => {
        if (d.status) {
          this.hideModal('changepassword');
          this.toastr.info(d.message);
        } else {
          this.toastr.info(d.message);
        }
        this.APIcalInProcess=false;
      }, err => {
        this.toastr.error(err);
        this.APIcalInProcess=false;
      })
    } else {
      if (this.cPass.npaswrd == "") {
        this.toastr.info(this.translation.poeple_password_can_not_empty)
      }
      else if (this.cPass.cnpaswrd == "") {
        this.toastr.info(this.translation.poeple_confirm_password_can_not_empty)
      }
      else if (this.cPass.npaswrd != this.cPass.cnpaswrd) {
        this.toastr.info(this.translation.poeple_password_is_not_equal)
      } else if ((this.cPass.npaswrd.length > 0 && this.cPass.npaswrd.length < 8) || (this.cPass.cnpaswrd.length > 0 && this.cPass.cnpaswrd.length < 8)) {
        this.toastr.info(this.translation.poeple_password_must_be_greater_then)
      }
    }
  }
  reSendInvitation() {
    this.APIcalInProcess=true;
    let url = environment.APIbaseUrl + '/users/resendInvitation';
    let body = {
      user_id: this.deactiveDeleteData.user_id,
      account_id: this.deactiveDeleteData.account_id,
      first_name: this.headData.user_current_account.User.first_name,
      last_name: this.headData.user_current_account.User.last_name,
    }
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      if (d.status) {
        this.hideModal('resend_inv');
        this.toastr.info(d.message)
      } else {
        this.toastr.error(d.message)
      }
      this.APIcalInProcess=false;
    })
  }
  emailChecker(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email);
  }
  addUser() {
    this.APIcalInProcess=true;
    if ((this.addusr_obj[0].name.trim() != '' && this.addusr_obj[0].email.trim() != '' && this.emailChecker(this.addusr_obj[0].email.trim()))) {
      if ((this.addusr_obj[1].name.trim() != '' && this.addusr_obj[1].email.trim() != '' && this.emailChecker(this.addusr_obj[1].email.trim()))) {
        if ((this.addusr_obj[2].name.trim() != '' && this.addusr_obj[2].email.trim() != '' && this.emailChecker(this.addusr_obj[2].email.trim()))) {
          this.addUserCall()
        } else {
          if ((this.addusr_obj[0].name.trim() != '' && this.addusr_obj[0].email.trim() != '') && (this.addusr_obj[1].name.trim() != '' && this.addusr_obj[1].email.trim() != '') && (this.addusr_obj[2].name.trim() == '' && this.addusr_obj[2].email.trim() == '') && (this.emailChecker(this.addusr_obj[0].email.trim()) && this.emailChecker(this.addusr_obj[1].email.trim()) && !this.emailChecker(this.addusr_obj[2].email.trim()))) { this.addUserCall(); return; }
          if (this.addusr_obj[2].name.trim() == '') {
            this.toastr.info(this.translation.poeple_please_add_full_name)
          } else if (this.addusr_obj[2].email.trim() == '') {
            this.toastr.info(this.translation.poeple_please_add_email)
          }//else if (this.addusr_message.trim() == ''){
          //   this.toastr.info(this.translation.poeple_please_write_message)
          //}
          else if (!(this.emailChecker(this.addusr_obj[2].email.trim()))) {
            this.toastr.info(this.translation.people_please_enter_valid_email)
          }
        }
      } else {
        if ((this.addusr_obj[0].name.trim() != '' && this.addusr_obj[0].email.trim() != '') && (this.addusr_obj[1].name.trim() == '' && this.addusr_obj[1].email.trim() == '') && (this.addusr_obj[2].name.trim() == '' && this.addusr_obj[2].email.trim() == '') && (this.emailChecker(this.addusr_obj[0].email.trim()) && !(this.emailChecker(this.addusr_obj[1].email.trim()) && this.emailChecker(this.addusr_obj[2].email.trim())))) { this.addUserCall(); return; }
        if (this.addusr_obj[1].name.trim() == '') {
          this.toastr.info(this.translation.poeple_please_add_full_name)
        } else if (this.addusr_obj[1].email.trim() == '') {
          this.toastr.info(this.translation.poeple_please_add_email)
        }//else if (this.addusr_message.trim() == ''){
        //   this.toastr.info(this.translation.poeple_please_write_message)
        // }
        else if (!(this.emailChecker(this.addusr_obj[1].email.trim()))) {
          this.toastr.info(this.translation.people_please_enter_valid_email)
        }
      }
    } else {
      if (this.addusr_obj[0].name.trim() == '') {
        this.toastr.info(this.translation.poeple_please_add_full_name)
      } else if (this.addusr_obj[0].email.trim() == '') {
        this.toastr.info(this.translation.poeple_please_add_email)
      }//else if (this.addusr_message.trim() == ''){
      //   this.toastr.info(this.translation.poeple_please_write_message)
      // }
      else if (!(this.emailChecker(this.addusr_obj[0].email.trim()))) {
        this.toastr.info(this.translation.people_please_enter_valid_email)
      }
    }
  }
  addUserCall() {
    this.APIcalInProcess=true;
    let url = environment.APIbaseUrl + '/add_users';
    let body = {
      'users': this.addusr_obj,
      account_id: this.headData.user_current_account.users_accounts.account_id,
      user_type: this.addusr_roleid,
      user_id: this.headData.user_current_account.User.id,
      first_name: this.headData.user_current_account.User.first_name,
      last_name: this.headData.user_current_account.User.last_name,
      message: this.addusr_message,
      send_email: this.addUEmail
    }
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      if (d.status) {
        this.hideModal('newsuper');
        this.toastr.info(d.message)
      } else {
        this.toastr.error(d.message)
      }
      this.APIcalInProcess=false;
    })
  }
  deactiveUser() {
    this.APIcalInProcess=true;
    let url = environment.APIbaseUrl + `/inactive/${this.deactiveDeleteData.account_id}/${this.deactiveDeleteData.user_id}/${this.deactiveDeleteData.role}`;
    this.peoplehttp.httpGetCall(url).subscribe((d: any) => {
      if (d.status) {
        this.hideModal('deactiveDelete');

        this.toastr.info(d.message)
      } else {
        this.toastr.error(d.message)
      }
      this.APIcalInProcess=false;
    })
  }
  activeUser() {
    this.APIcalInProcess=true;
    let url = environment.APIbaseUrl + `/active/${this.deactiveDeleteData.account_id}/${this.deactiveDeleteData.user_id}`;
    let body = {
      role_id: this.deactiveDeleteData.role,
      send_email: this.deactiveDeleteData.emailcheck,
      first_name: this.headData.user_current_account.User.first_name,
      last_name: this.headData.user_current_account.User.last_name,
    }
    this.peoplehttp.httpPostCall(url, body).subscribe((d: any) => {
      if (d.status) {
        this.hideModal('activeuser');
        this.toastr.info(d.message);
      } else {
        this.hideModal('activeuser');
        this.toastr.error(d.message);
      }
      this.APIcalInProcess=false;
    })
  }
  private processEventSubscriptions(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      console.log("A Web Socket event received");
      console.log(data);
      switch (data.event) {
        case "user_deactivated":
          if (data.role_id == 110) {
            let index = this.supperAdmins.findIndex(x => x.id == data.data.id);
            let pushD = this.supperAdmins[index];
            this.supperAdmins.splice(index, 1);
            this.deactivatedUsers.unshift(pushD);
            this.supperAdmins = [...this.supperAdmins]
          } else if (data.role_id == 115) {
            let index = this.admins.findIndex(x => x.id == data.data.id);
            let pushD = this.admins[index];
            this.admins.splice(index, 1);
            this.deactivatedUsers.unshift(pushD);
            this.admins = [...this.admins]
          } else if (data.role_id == 120) {
            let index = this.users.findIndex(x => x.id == data.data.id);
            let pushD = this.users[index];
            this.users.splice(index, 1);
            this.deactivatedUsers.unshift(pushD);
            this.users = [...this.users]
          } else if (data.role_id == 125) {
            let index = this.viewers.findIndex(x => x.id == data.data.id);
            let pushD = this.viewers[index];
            this.viewers.splice(index, 1);
            this.deactivatedUsers.unshift(pushD);
            this.viewers = [...this.viewers]
          }
          this.deactivatedUsers = [...this.deactivatedUsers]
          break;
        case "user_activated":
          if (data.data) {
            let index = this.deactivatedUsers.findIndex(x => x.id == data.data.id);
            let pushD = this.deactivatedUsers[index];
            data.data.role_id = this.deactiveDeleteData.role;
            this.deactivatedUsers.splice(index, 1);
            this.deactivatedUsers = [...this.deactivatedUsers]
            if (data.data.role_id == 110) {
              this.supperAdmins.unshift(pushD);
              this.supperAdmins = [...this.supperAdmins]
            } else if (data.data.role_id == 115) {
              this.admins.unshift(pushD);
              this.admins = [...this.admins]
            } else if (data.data.role_id == 120) {
              this.users.unshift(pushD);
              this.users = [...this.users]
            } else if (data.data.role_id == 125) {
              this.viewers.unshift(pushD);
              this.viewers = [...this.viewers]
            }
          }
          break;
        case "user_deleted":
          if (data.user_id) {
            if (data.role_id == 110) {
              let index = this.supperAdmins.findIndex(x => x.id == data.user_id);
              this.supperAdmins.splice(index, 1);
              this.supperAdmins = [...this.supperAdmins]
            } else if (data.role_id == 115) {
              let index = this.admins.findIndex(x => x.id == data.user_id);
              this.admins.splice(index, 1);
              this.admins = [...this.admins]
            } else if (data.role_id == 120) {
              let index = this.users.findIndex(x => x.id == data.user_id);
              this.users.splice(index, 1);
              this.users = [...this.users]
            } else if (data.role_id == 125) {
              let index = this.viewers.findIndex(x => x.id == data.user_id);
              this.viewers.splice(index, 1);
              this.viewers = [...this.viewers]
            }
            let index = this.deactivatedUsers.findIndex(x => x.id == data.user_id);
            this.deactivatedUsers.splice(index, 1);
            this.deactivatedUsers = [...this.deactivatedUsers];
          }
          break;
        case "user_added":
          debugger
          let role = data.role_id;
          if (role == 110) {
            data.user_id.forEach(d => {
              this.supperAdmins.unshift(d);
            });
            // this.supperAdmins.unshift(data.user_id)
            this.supperAdmins = [...this.supperAdmins]
          } else if (role == 115) {
            data.user_id.forEach(d => {
              this.admins.unshift(d)
            });
            // this.admins.unshift(data.user_id)
            this.admins = [...this.admins]
          } else if (role == 120) {
            data.user_id.forEach(d => {
              this.users.unshift(d)
            });
            // this.users.unshift(data.user_id)
            this.users = [...this.users]
          } else if (role == 125) {
            data.user_id.forEach(d => {
              this.viewers.unshift(d)
            });
            // this.viewers.unshift(data.user_id)
            this.viewers = [...this.viewers]
          }
          break;
        default:
          // code...
          break;
      }
    // });
  }
  showModal(modal, modaltype?): void {
    if (modal == 'multipeople') {
      this.multipeople.config = this.modalConfig
      this.multipeople.show();
    } else if (modal == 'deactiveDelete') {
      this.deactiveDelete.config = this.modalConfig
      this.deactiveDelete.show()
    } else if (modal == 'changepassword') {
      this.changepassword.config = this.modalConfig
      this.changepassword.show()
    } else if (modal == 'resend_inv') {
      this.resend_inv.config = this.modalConfig
      this.resend_inv.show()
    } else if (modal == 'newsuper') {
      this.newsuper.config = this.modalConfig
      this.newsuper.show()
    } else if (modal == 'activeuser') {
      this.activeuser.config = this.modalConfig
      this.activeuser.show();
    } else if (modal == 'delete') {
      this.deletepopup.config = this.modalConfig
      this.deletepopup.show()
    } else if (modal == 'account_ownerrole') {
      if (modaltype == 100) {
        this.infopopupTitle = this.translation.poeple_account_owner_role;
        this.infopopupData = this.translation.poeple_there_can_only_one_aow + this.translation.poeple_there_can_only_one_aow_1;
      } else if (modaltype == 110) {
        this.infopopupTitle = this.translation.people_super_admin_role;
        this.infopopupData = this.translation.people_these_are_trusted_memeber_info + this.translation.people_these_are_trusted_memeber_info_1;
      } else if (modaltype == 115) {
        this.infopopupTitle = this.translation.people_admin_role;
        this.infopopupData = this.translation.people_these_are_trusted_memeber_of_the_team + this.translation.people_these_are_trusted_memeber_of_the_team_1
      } else if (modaltype == 120) {
        this.infopopupTitle = this.translation.people_user_role;
        this.infopopupData = this.translation.people_these_are_usually_staff_members + this.translation.people_these_are_usually_staff_members_1;
      } else if (modaltype == 125) {
        this.infopopupTitle = this.translation.people_viewer_role;
        this.infopopupData = this.translation.viewers_info_people_section;
      } else if (modaltype == 130) {
        this.infopopupTitle = this.translation.people_deactivated_users;
        this.infopopupData = this.translation.people_copy_goes_here;
      }
      this.account_ownerrole.config = this.modalConfig
      this.account_ownerrole.show()
    }
  }

  hideModal(modal): void {
    if (modal == 'multipeople') {
      // this.addmultiEmail = false;
      this.multipeople.hide();
    } else if (modal == 'deactiveDelete') {
      this.deleteString = '';
      this.deactiveDelete.hide()
    } else if (modal == 'changepassword') {
      this.cPass = {
        npaswrd: '',
        cnpaswrd: '',
        email: false,
      }
      this.changepassword.hide()
    } else if (modal == 'resend_inv') {
      this.resend_inv.hide()
    } else if (modal == 'newsuper') {
      this.addusr_obj = [{ name: '', email: '' }, { name: '', email: '' }, { name: '', email: '' }];
      this.addusr_message = '';
      this.addUEmail = false;
      this.newsuper.hide()
    } else if (modal == 'activeuser') {
      this.deactiveDeleteData.emailcheck = false;
      this.activeuser.hide()
    } else if (modal == 'delete') {
      this.deleteDeString = '';
      this.deletepopup.hide()
    } else if (modal == 'account_ownerrole') {
      this.account_ownerrole.hide()
    }
  }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
  }
}
