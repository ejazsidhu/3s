import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import * as _lodash from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { environment } from '@environments/environment';
import { HeaderService, SocketService } from "@projectModules/app/services";
import { PeopleHttpService, DataStorageService } from '@people/services';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit, OnDestroy {
  @ViewChild('addGroupModal', { static: false }) addGroupModal: ModalDirective;
  @ViewChild('renameModal', { static: false }) renameModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal: ModalDirective;
  @ViewChild('addPeopleModal', { static: false }) addPeopleModal: ModalDirective;
  @ViewChild('search_group', { static: false }) focusElement: ElementRef;

  public headerData: any;
  public groupsList: any;
  public peopleList;
  public expand;
  public collaps;
  public expandButton = true;
  public collapsButton = false;
  public acountOwner;
  public superAdmins;
  public admins;
  public users;
  public viewers;
  public allMembers: any = [];
  public selectedGroupmember;
  public pV: number = 1;
  public pU: number = 1;
  public pM: number = 1;
  public groupName;
  public memberSearch = '';
  public addGroupFlag: boolean = false;
  public selectAll: boolean = true;
  public deSelectAll: boolean = false;
  public deleteGroupId;
  public userSearch = '';
  public newUsers: any = [];
  public newUsersSearch = '';
  public selectAllUsers: boolean = true;
  public deSelectAllUsers: boolean = false;
  public groupId;
  public staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  public groupNameForUsers;
  public forChangeGroupName;
  public groupIdsTemp: any = [];
  public groupIdsArray: any = [];
  public groupIdForRename;
  //public searchPlaceHolder:string="Search personal name or email";
  public socket_listener: any;
  public current_group_id: any;
  public addMoreUser: any = [];
  public selectedUsers: any = [];
  public ngSelectShouldOpen: any = [];
  public noUserState: boolean = false;

  public translation: any = {};
  private translationSubscription: Subscription;

  constructor(private peoplehttpservice: PeopleHttpService,
    private headerService: HeaderService,
    private toastr: ToastrService,
    private dataStorageService: DataStorageService,
    private socketService: SocketService) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {

    this.headerData = this.headerService.getStaticHeaderData();
    this.getGroups();
    this.getGroupMembers();

    this.setSearchUsers(this.allMembers);
    let channel_name = `people_${this.headerData.user_current_account.users_accounts.account_id}`;
    this.socket_listener = this.socketService.pushEventWithNewLogic(channel_name).subscribe(data => this.processEventSubscriptions(data));
    // this.processEventSubscriptions();

    let that = this;
    window.addEventListener('click', function (e) {
      let is_inside = false;

    });
  }

  onChange() {

  }

  getGroups() {

    let url = environment.APIbaseUrl + '/get_groups';
    let body = {
      account_id: this.headerData.user_current_account.users_accounts.account_id
    };
    this.peoplehttpservice.httpPostCall(url, body).subscribe((res: any) => {
      this.groupsList = res.data;
      this.groupIdsTemp = res.data;

      for (let i = 0; i < this.groupIdsTemp.length; i++) {
        this.groupIdsArray.push(this.groupIdsTemp[i].group_id)
      }

      this.groupsList.map((group, index) => {
        this.selectedUsers[group.group_id] = [];
        this.ngSelectShouldOpen[group.group_id] = false;
        group.page = 1;
        if (index == 0) {
          group.collapsed = false;
          this.current_group_id = group.group_id;
        }
        else {
          group.collapsed = true;
        }
      })


    });

  }

  public getGroupMembers() {
    let url = environment.APIbaseUrl + '/get_members/' + this.headerData.user_current_account.users_accounts.account_id;
    let body = {

    };
    this.peoplehttpservice.httpPostCall(url, body).subscribe((data: any) => {
      this.acountOwner = data.account_owner;
      this.superAdmins = data.superAdmins;
      this.admins = data.admins;
      this.users = data.users;
      this.viewers = data.viewers;

      this.allMembers = [this.acountOwner, ...this.superAdmins, ...this.admins, ...this.users, ...this.viewers]      // console.log("this is account owner",data.account_owner);
      this.dataStorageService.setAllMembers(this.allMembers);
      //console.log("this is concated array", this.allMembers)
      this.setSearchUsers(this.users);

    })
  }

  public addGroup() {

    let url = environment.APIbaseUrl + '/add_group'
    let selected_members = [];
    let memberId = [];

    selected_members = this.allMembers.filter(item => item.selected);
    memberId = selected_members.map((ac) => { return ac.id });

    if (this.groupName) this.groupName = this.groupName.trim();
    if (this.groupName !== null && this.groupName !== "" && this.groupName !== undefined) {
      if (selected_members.length == 0) {
        this.noUserState = true;
        this.addGroupFlag = false;
        this.focusElement.nativeElement.focus();
        return;
      }
      let obj = {
        name: this.groupName,
        super_admin_ids: memberId,
        account_id: this.headerData.user_current_account.users_accounts.account_id
      }
      this.peoplehttpservice.httpPostCall(url, obj).subscribe((data: any) => {
        //console.log("check object data", obj.name, obj.super_admin_ids, obj.account_id)
        this.toastr.info(data.message);
        this.hideModal("addGroupModal");
        this.addGroupFlag = false;
        this.noUserState = false;
      });
    }
    else {
      if (this.groupName === null || this.groupName === "" || this.groupName === undefined) {
        this.toastr.info(this.translation.group_name_canot_empty);
        this.addGroupFlag = false;
      }
      else {
        // this.toastr.info(this.translation.atleast_one_member_to_be_selected);
        this.addGroupFlag = false;
      }
    }


  }

  deleteUserFromGroup(groupIndex: number, userIndex: number, user_group_id: number) {

    if (this.groupsList[groupIndex].users.length > 1) {
      let url = environment.APIbaseUrl + '/delete_group_users/' + user_group_id;
      console.log("this is MemberId", url);
      let body = {

      };
      this.peoplehttpservice.httpPostCall(url, body).subscribe((res: any) => {
        if (res.status == true) {
          this.toastr.info(this.translation.user_removed_successfully);
          this.groupsList[groupIndex].users.splice(userIndex, 1);
        }
        else {
          this.toastr.info(res.message)
        }

      });
    } else {
      this.toastr.info(this.translation.atleast_one_member_to_be_selected)
    }


  }

  deleteGroup() {
    let url = environment.APIbaseUrl + '/delete_group/' + this.deleteGroupId + "/" + this.headerData.user_current_account.users_accounts.account_id;
    let body = {

    };
    this.peoplehttpservice.httpPostCall(url, body).subscribe((res: any) => {
      if (res.status == true) {
        this.toastr.info(this.translation.group_deleted_successfully);
        this.deleteGroupId = "";
        this.hideModal("deleteModal");
      }
      else {
        this.toastr.info(res.message);
      }
    })
  }

  selectAllMembers() {
    this.noUserState = false;
    let i;
    for (i = 0; i < this.allMembers.length; i++) {
      this.allMembers[i].selected = true;
      this.selectAll = false;
      this.deSelectAll = true;
    }
  }
  deselectAllMembers() {
    let i;
    this.allMembers.forEach((h) => { h.selected = false; });
    this.deSelectAll = false;
    this.selectAll = true;
  }
  renameGroup() {
    this.forChangeGroupName = this.forChangeGroupName.trim();
    //console.log("name to change",this.forChangeGroupName);
    let url = environment.APIbaseUrl + '/rename_group';
    let body = {
      account_id: this.headerData.user_current_account.users_accounts.account_id,
      group_id: this.groupIdForRename,
      name: this.forChangeGroupName,
      user_id: this.headerData.user_current_account.User.id
    };
    this.peoplehttpservice.httpPostCall(url, body).subscribe((res: any) => {
      if (res.status) {

        this.hideModal('renameModal');
        this.toastr.info(this.translation.name_change_successfully);

      }
      else {
        //this.toastr.info("cannt be empty");
        this.toastr.info(this.translation.name_change_error);
      }
    });
  }
  listOfAddMorePeople(currentMembers) {

    this.newUsers = _lodash.differenceBy(this.allMembers, currentMembers, 'id');

  }

  selectAllRemainingUsers() {
    let i;
    for (i = 0; i < this.newUsers.length; i++) {
      this.newUsers[i].selected = true;
      this.selectAllUsers = false;
      this.deSelectAllUsers = true;
    }
  }

  deSelectAllRemainingUsers() {
    let i;
    this.newUsers.forEach((h) => { h.selected = false; });
    this.deSelectAllUsers = false;
    this.selectAllUsers = true;
  }

  addUserInGroup() {
    let url = environment.APIbaseUrl + '/edit_user_group/' + this.groupId;
    let selected_Users = [];
    let usersId = [];
    let select_users: any = []
    // selected_members = _.where(this.allMembers, { selected: true });
    selected_Users = this.newUsers.filter(item => item.selected);
    usersId = selected_Users.map((ac) => { return ac.id });
    if (selected_Users.length == 0) {
      this.toastr.info(this.translation.please_select_at_least_one_usre);
    }
    else {
      let body = {
        name: this.groupNameForUsers,
        super_admin_ids: usersId,
        account_id: this.headerData.user_current_account.users_accounts.account_id,
        user_id: this.headerData.user_current_account.User.id

      };
      this.peoplehttpservice.httpPostCall(url, body).subscribe((data: any) => {

        if (data.status) {
          // this.selectedUsers[this.current_group_id] = [];
          if (this.allMembers) {
            for (let i = 0; i < this.allMembers.length; i++) {
              if (selected_Users) {
                for (let j = 0; j < selected_Users.length; j++) {
                  if (this.allMembers[i].id == selected_Users[j].id) {
                    let member = this.allMembers[i];
                    data.data.forEach(x => {
                      if (x.user_id == member.user_id) {
                        member.user_group_id = x.user_group_id;
                        select_users.push(member);
                      }
                    });
                  }


                }

              }
            }

            let index = this.groupsList.findIndex(x => x.group_id == this.groupId);
            //this.groupsList[index].users.push().select_users;
            this.groupsList[index].users = [...this.groupsList[index].users, ...select_users]
            this.selectedUsers[this.current_group_id] = [];

          }
          this.toastr.info(this.translation.user_added_successfully);
          this.hideModal('addPeopleModal');
          this.addGroupFlag = false;
        }
        else {
          this.toastr.info(data.message);
          this.addGroupFlag = false;
        }
      });
    }


  }

  setSearchUsers(currentUsers) {
    this.addMoreUser = _lodash.differenceBy(this.allMembers, currentUsers, 'id');

    this.addMoreUser.map(data => {
      // this.ImageUrlBuilder(data);
      let useRrole = this.findUserRole(data.role)
      data.userData = data.first_name + " " + data.last_name + " " + data.email + "  " + useRrole;
      //data.userData.url = this.ImageUrlBuilder(data)

      data.url = this.ImageUrlBuilder(data)
    })

  }

  private processEventSubscriptions(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      //console.log("A Web Socket event received");
      //console.log(data);
      switch (data.event) {
        case "group_added":
          this.groupAdded(data.data.original.data[0]);
          break;
        case "group_deleted":
          this.groupDeleted(data);
          break;
        case "group_renamed":
          this.groupRename(data);

          break;

        default:
          // code...
          break;
      }
    // });
  }

  private groupAdded(data) {
    data.collapsed = true;

    let group = data;
    group.page = 1;
    this.selectedUsers[group.group_id] = [];
    this.ngSelectShouldOpen[group.group_id] = false;

    this.groupsList.unshift(data);
  }

  private groupDeleted(data) {
    let index = this.groupsList.findIndex(x => x.group_id == data.group_id);
    this.groupsList.splice(index, 1);
  }
  public groupRename(data) {
    let index = this.groupsList.findIndex(x => x.group_id == data.group_id);
    if (this.groupsList)
      this.groupsList[index].department_name = data.group_name;
  }

  ImageUrlBuilder(participent: any) {

    if (participent) {

      let image = participent.image || "assets/img/photo-default.png";
      let url = `${this.staticImageServiceIp}${participent.id}/${
        participent.image
        }`;
      return participent.image ? url : image;
    }
  }



  public toggleCollaps(group: any) {
    if (group.collapsed) {
      this.groupsList.map((item) => {
        if (item.group_id == group.group_id) {
          item.collapsed = false;
          this.current_group_id = group.group_id;
        }
        else {
          item.collapsed = true;
        }
      })
    } else {
      group.collapsed = true;
    }
  }

  public showModal(modal?): void {
    if (modal == 'addGroupModal') {
      this.addGroupModal.show();
    }
    else if (modal == 'renameModal') {
      this.renameModal.show();
    }
    else if (modal == 'deleteModal') {
      this.deleteModal.show();
    }
    else if (modal == 'addPeopleModal') {
      this.addPeopleModal.show();
      // this.deSelectUsers();
    }

  }

  public hideModal(modal?): void {
    if (modal == 'addGroupModal') {
      this.addGroupModal.hide();
      this.deSelectMembers();
      this.noUserState = false;
    }
    else if (modal == 'renameModal') {
      this.renameModal.hide();
      //this.forChangeGroupName="";
    }
    else if (modal == 'deleteModal') {
      this.deleteModal.hide();
      this.deleteGroupId = "";
    }
    else if (modal == 'addPeopleModal') {
      this.addPeopleModal.hide();
      this.deSelectUsers();

    }

  }

  public deSelectMembers() {
    this.groupName = "";
    this.memberSearch = "";
    this.allMembers.forEach((h) => { h.selected = false; });
    this.deSelectAll = false;
    this.selectAll = true;
  }

  public deSelectUsers() {
    //this.groupName = "";
    this.newUsersSearch = "";
    this.newUsers.forEach((h) => { h.selected = false; });
    this.addGroupFlag = false;
    this.deSelectAllUsers = false;
    this.selectAllUsers = true;
  }

  removeUser(item: any) {
    let filteredSelectedUsers = this.selectedUsers[this.current_group_id].filter(el => {
      return el != item.id;
    });

    this.selectedUsers[this.current_group_id] = filteredSelectedUsers;


  }

  onSearch(item: any) {
    if (item.term.length > 2) {
      this.ngSelectShouldOpen[this.current_group_id] = true;
    } else {
      this.ngSelectShouldOpen[this.current_group_id] = false;
    }
    //console.log('item: ', item)
  }

  addNewSearhUser() {


    if (this.selectedUsers[this.current_group_id].length == 0 || this.selectedUsers[this.current_group_id].length == undefined) {
      this.toastr.info(this.translation.please_select_at_least_one_usre);
    }
    else {

      let url = environment.APIbaseUrl + '/edit_user_group/' + this.groupId;
      let selected_Users = [];
      let select_users: any = []
      let usersId = [];

      usersId = this.selectedUsers[this.current_group_id];
      let body = {
        name: this.groupNameForUsers,
        super_admin_ids: usersId,
        account_id: this.headerData.user_current_account.users_accounts.account_id,
        user_id: this.headerData.user_current_account.User.id

      };
      //console.log("selected users", body);
      this.peoplehttpservice.httpPostCall(url, body).subscribe((data: any) => {
        if (data.status) {

          if (this.allMembers) {
            for (let i = 0; i < this.allMembers.length; i++) {
              if (this.selectedUsers) {
                for (let j = 0; j < this.selectedUsers[this.current_group_id].length; j++) {
                  if (this.allMembers[i].id == this.selectedUsers[this.current_group_id][j]) {
                    //console.log("in second if",this.allMembers[i])
                    let member = this.allMembers[i];
                    data.data.forEach(x => {
                      if (x.user_id == member.user_id) {
                        member.user_group_id = x.user_group_id;
                        select_users.push(member);
                      }
                    });


                  }



                }


              }
            }

            let index = this.groupsList.findIndex(x => x.group_id == this.groupId);
            //this.groupsList[index].users.push().select_users;
            this.groupsList[index].users = [...this.groupsList[index].users, ...select_users]
            this.selectedUsers[this.current_group_id] = [];

          }
          this.toastr.info(this.translation.user_added_successfully);
          this.hideModal('addPeopleModal');
          this.addGroupFlag = false;
        }
        else {
          this.toastr.info(data.message);
          this.addGroupFlag = false;
        }
      });
    }


  }

  itemAdded(item, current_group_id) {

    this.ngSelectShouldOpen[current_group_id] = false;



  }

  checkSelectedUsers(event) {
    if (event.target.checked) {
      this.noUserState = false;
    }
  }

  findUserRole(userRole: number) {
    if (userRole == 100) {
      return "Account Owner";
    }
    else if (userRole == 110) {
      return "Super Admin";
    }
    else if (userRole == 115) {
      return "Admin";
    }
    else if (userRole == 120) {
      return "User";
    }
    else if (userRole == 125) {
      return "Viewer";
    }
  }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
    // if(this.addGroupModal) this.addGroupModal.hide();
    // if(this.renameModal) this.renameModal.hide();
    // if(this.deleteModal) this.deleteModal.hide();
    // if(this.addPeopleModal) this.addPeopleModal.hide();
  }

}

