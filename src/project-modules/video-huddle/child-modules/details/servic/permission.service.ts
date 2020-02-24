import { Injectable } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { DetailsHttpService } from './details-http.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private headerService: HeaderService, private detailService: DetailsHttpService) { }
  getOnwerShip(created_by) {
    let obj: any = {};
    obj = this.detailService.artifactObj;
    let sessionData: any = this.headerService.getStaticHeaderData();
    let userId = sessionData.user_current_account.User.id;
    if (userId == created_by || obj.role_id == 200) {
      return true;
    }
    else {
      return false;
    }
  }
  getdiscussionPermissions(created_by) {
    let obj: any = {};
    obj = this.detailService.artifactObj;

    // console.log(artifact.created_by);
    let sessionData: any = this.headerService.getStaticHeaderData();
    let userId = sessionData.user_current_account.User.id;
    // let sepcialPermission = obj.users_accounts.permission_maintain_folders;
    // let accountLevelRole = obj.users_accounts.role_id;
    //  
    if (userId == created_by) {
      return true;
    }
    else {
      return false;
    }

  }

  CanDelete(artifact) {
    let obj: any = {};
    let sessionData: any = this.headerService.getStaticHeaderData();
    let userId = sessionData.user_current_account.User.id;
    obj = this.detailService.artifactObj;
    if (artifact.doc_type == '2' && userId == artifact.created_by) {
      return true
    } else {
      return false;
    }

  }

  isShareToLibraryAllowed() {
    let obj = this.detailService.artifactObj;
    if(obj){
      if (!!obj.users_accounts.permission_access_video_library && !!obj.users_accounts.permission_video_library_upload)
      return true
    else
      return false;
    }
    
  }
  isViewer(){
    let obj: any = {};
    obj = this.detailService.artifactObj;
    let accountLevelRole = obj.users_accounts.role_id;
    if(accountLevelRole){
      if(accountLevelRole == 220 && obj.huddle_type == '1')
     return false;
      else
     return true;
    }
    
  setTimeout(() => {
   
  }, 2000);
    
  }
  getPermission(artifact, action?, resourceType?) {

    let obj: any = {};
    obj = this.detailService.artifactObj;

    // console.log(artifact.created_by);
    let sessionData: any = this.headerService.getStaticHeaderData();
    let userId = sessionData.user_current_account.User.id;
    let sepcialPermission = obj.users_accounts.permission_maintain_folders;
    let accountLevelRole = obj.users_accounts.role_id;
    //  
    // 

    if (obj.huddle_type == '3') {

      if (accountLevelRole != 125) {
        if (artifact.published && (userId == artifact.created_by || obj.role_id == 200) && action == 'delete') {

          if (obj.dis_mem_del_video == 1) {
            return true
          }


        }



        // if (artifact.published && (userId == artifact.created_by || obj.role_id==200)  ||(obj.role_id==210 && userId == artifact.created_by) && action == 'copy') 
        if ((userId == artifact.created_by || obj.role_id == 200) && action == 'copy') {
          // ;
          return true;
        }

        if ((window.navigator.userAgent.search("Firefox") === -1) && artifact.published && (userId == artifact.created_by || obj.is_evaluator) && action == 'crop') {
          return true;
        }

        if (action == 'download') {
          return true;
        }

        if ((obj.role_id == 200 || userId == artifact.created_by) && action == 'rename') {
          return true;
        }

        if ((userId == artifact.created_by || obj.role_id == 200) && action == 'duplicate') {
          return true;
        }

      }
      else {
        return false;

      }


    }
    else if (obj.huddle_type == '2') {


      if (accountLevelRole != 125) {



        // 
        if (artifact.published && obj.role_id == 200 || (!!+obj.coachee_permissions && obj.role_id == 210) || (obj.role_id == 210 && userId == artifact.created_by)) {
          if (obj.dis_mem_del_video == 1 && action == 'delete') {
            return true;
          }
          if (action == 'rename') {
            return true;
          }
          if (action == 'duplicate') {
            return true;
          }
          if (artifact.published == 1 && action == 'copy') {
            return true;
          }
          if (action == 'download') {
            return true;
          }

          if ((window.navigator.userAgent.search("Firefox") === -1) && artifact.published || (obj.role_id == 210 && userId == artifact.created_by) || obj.role_id == 200) {
            if ((userId == artifact.created_by || obj.is_evaluator) && action == 'crop') {
              return true;
            }

          }

        }
      }
      else {
        return false;
      }


    }

    else {

      if (accountLevelRole != 125) {
        if (obj.role_id == 200 || (obj.role_id == 210 && userId == artifact.created_by)) {
          return true;
        }
      } 
    }


    return false;

  }

  getArtifactShowHidePermission(artifact) {
    let obj: any = {};
    obj = this.detailService.artifactObj;

    // console.log(artifact.created_by);
    let sessionData: any = this.headerService.getStaticHeaderData();
    let userId = sessionData.user_current_account.User.id;
    let sepcialPermission = obj.users_accounts.permission_maintain_folders;
    let accountLevelRole = obj.users_accounts.role_id;

    if (obj.huddle_type == '2') {
      if ((obj.role_id == 200) || (obj.role_id == 210 && userId == artifact.created_by) || (userId == artifact.created_by && sepcialPermission == '1')) {
        return true;
      }
    }
    if (obj.huddle_type == '3') {


      if ((obj.role_id == 200 && accountLevelRole == 120)) {
        if (userId == artifact.created_by || this.inArray(artifact.created_by, obj.participants_ids)) {
          return true
        }

      }
      else if (obj.role_id == 200 && (accountLevelRole == 110 || accountLevelRole == 100 || accountLevelRole == 115)) {
        if (obj.role_id == 200 && (userId == artifact.created_by || this.inArray(artifact.created_by, obj.participants_ids))) {
          return true
        }
      }


    }

    return false;
  }

  inArray(userid, participantsList) {
    let result = false;

    if (participantsList.length > 0)
      result = participantsList.find(p => p == userid);

    return (result) ? result : false;
  }



}
