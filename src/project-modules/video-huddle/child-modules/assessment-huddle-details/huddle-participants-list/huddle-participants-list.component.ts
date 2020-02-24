import { Component, OnInit, AfterViewInit, Input,ViewChild, OnChanges, SimpleChanges,TemplateRef, OnDestroy
} from '@angular/core';
import { AssessmentService } from '../services/assessment.service';
// import { HeaderService } from '../../header.service';
import { ModalDirective } from "ngx-bootstrap";
import { BsModalService } from "ngx-bootstrap/modal";
// import { SocketService } from "../../socket.service";
import { ToastrService } from 'ngx-toastr';
import * as _ from "underscore";
import oEcho from 'laravel-echo';
import io from 'socket.io-client';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderService, SocketService } from '@src/project-modules/app/services';
import { Subscription } from 'rxjs';

declare global {
  interface Window { io: any; }
  interface Window { Echo: any; }
}

declare var Echo: any;

window.io = io;
window.Echo = window.Echo || {};

@Component({
  selector: 'huddle-participants-list',
  templateUrl: './huddle-participants-list.component.html',
  styleUrls: ['./huddle-participants-list.component.css']
})
export class HuddleParticipantsListComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {


  dataLoading: boolean = true;
  participantsList: any = [];
  isGroupImage: boolean;
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  @ViewChild('childModal',{static:false}) childModal: ModalDirective;
  @ViewChild('delete',{static:false}) delete;
  @Input('particiants') particiants;
  sessionData: any = {};
  public socket_listener: any;
  public current_huddel_id;
  artifact: any;
  public ModalRefs: Modals;
  public participantForDelete;
  messageDelete: string;
  subscription: Subscription;
  translation:any={};
  userAccount:any;
  
  sortOptions: { key: string; label: any; selected: boolean; }[];
  userAccountLevelRoleId: any=0;
  

  constructor(private assessmentService: AssessmentService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public headerService: HeaderService,
    private socketService: SocketService,
    private router:Router,
    private activeRoute: ActivatedRoute,
    ) {

      this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
        this.translation = languageTranslation;
            this.sortOptions = [
          { key: 'user_name', label:this.translation.artifact_assessee , selected: false },
          { key: 'last_modified_with_time', label: this.translation.artifacts_last_modified , selected: false },
          { key: 'last_submission_with_time', label: this.translation.artifacts_last_submission , selected: false },
          { key: 'assessed', label: this.translation.artifacts_assessed_tracker, selected: false }
        ];
      });
     }

  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.sessionData.user_permissions.roles.role_id;

    // this.processEventSubscriptions();
    this.current_huddel_id=this.assessmentService.getHuddleId();
    this.ModalRefs = {};
     this.userAccount =this.sessionData.user_current_account;
  }
  ngOnDestroy() {

    this.socket_listener.unsubscribe();
      // if(this.childModal)this.childModal.hide();
      // if(this.ModalRefs && this.ModalRefs.participentsModal) this.ModalRefs.participentsModal.hide();

  }
  ngAfterViewInit(): void {
    // this.assessmentService.getParticipantsList().subscribe(data => {
    //   this.participantsList = data;
    // })


  }

  getSingleAsignment(item){
   let str=this.router.url.slice(0,-7) +`assignment/${item.user_id}`
     if(item.is_submitted==1)
     this.router.navigate([str]);
     else
     this.showChildModal()
    
  }



  public deleteAssessee() {
    
    let user = this.sessionData;
    let obj = {
      huddle_id: this.assessmentService.getHuddleId(),
      user_current_account: this.sessionData.user_current_account,
      assessee_id:this.participantForDelete
    }
    this.assessmentService.deleteAssessee(obj).subscribe((data: any) => {

      if (data.success) {
        this.toastr.info(this.translation.assessee_removed_from_huddle)
        // this.is_submitted = true
        
      }

    }, error => {

    })
    this.ModalRefs.participentsModal.hide();
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes: ', changes);
    this.participantsList = changes.particiants.currentValue;
    if(this.participantsList){
      this.dataLoading = false;
    }
    this.socketPushFunctionDiscussionDetail();
    // if (!this.participantsList) this.participantsList = this.testParticipants;
    // let count = 14;
    // let assess: boolean = false;
    // this.participantsList.map(item => {
    //   item.last_modified = new Date(`2019-07-${count}`);
    //   item.last_submission = new Date(`2019-09-${count}`);
    //   item.assessed = assess;
    //   count--;
    //   assess = !assess;
    // });

  }

  ImageUrlBuilder(participent: any) {
    if (participent.image == 'groups') {
      this.isGroupImage = true
      return true
    } else {
      this.isGroupImage = false
      let image = participent.image || "assets/video-huddle/img/c1.png";
      let url = `${this.staticImageServiceIp}${participent.user_id}/${
        participent.image
        }`;
      return participent.image ? url : image;
    }

  }

  /**
   * Sort participantsList based on the key param with differnet conditions based on key
   * If key is `last_modified` or `last_submission` which are type of date then sort the participantsList according to date
   * If key is `assessed` then sort the participantsList according to assessed boolean type and then username
   * Else sort the participantsList according to key param which in current case will be `user_name`
   * @param {key: string} 
   */
  public sortParticipants(key: string) {
    this.toggleSelectedSortOptions(key);
    this.participantsList.sort((firstIndex, secondIndex) => {
      if (key === 'last_modified_with_time' || key === 'last_submission_with_time') {
        let fIndexDate: any = new Date(firstIndex['last_submission_with_time']);
        let sIndexDate: any = new Date(secondIndex['last_submission_with_time']);
        return sIndexDate - fIndexDate;
      } else if (key === 'assessed') {
        if (firstIndex[key] && secondIndex[key]) {
          let firstIndexKey = firstIndex['user_name'].toLowerCase();
          let secondIndexKey = secondIndex['user_name'].toLowerCase();
          if (firstIndexKey < secondIndexKey) return -1;
          if (firstIndexKey > secondIndexKey) return 1;
          return 0;
        }
        if (firstIndex[key]) return -1;
        if (secondIndex[key]) return 1;
      } else {
        let firstIndexKey = firstIndex[key].toLowerCase();
        let secondIndexKey = secondIndex[key].toLowerCase();
        if (firstIndexKey < secondIndexKey) return -1;
        if (firstIndexKey > secondIndexKey) return 1;
        return 0;
      }
    });
  }

  private toggleSelectedSortOptions(key: string) {
    this.sortOptions.forEach(option => {
      if (option.key === key) option.selected = true;
      else option.selected = false;
    });
  }

  //socket methods start
  private socketPushFunctionDiscussionDetail() {
    this.socket_listener = this.socketService.pushEventWithNewLogic(`huddle-details-${this.current_huddel_id}`).subscribe(data => this.processEventSubscriptions(data));
  }

  private processEventSubscriptions(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      console.log('web socket res: ', data);
      switch (data.event) {
        case "resource_added":
          //console.log(data.allowed_participants,this.sessionData.user_current_account.User.id);
          if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {
            if(data.is_comment_resource || data.data.comment_id){

          }
          else{
            let should_wait = 0;
            if (data.is_video_crop) {
              should_wait = 1;
            }
            this.participantsList.forEach(x => {
               //console.log("sdfsdfwdsfsdfs",x.user_id,data.data.created_by) 
              if(x.user_id == data.data.created_by){
                
                //console.log("participants is",x.user_id )
                if(data.data.doc_type==1){
                  x.videos_count++
                }
                if(data.data.doc_type==2){
                  x.resources_count++
                }
              }
            });
           // this.processResourceAdded(data.data, should_wait);
          }
        }
          break;

        case "resource_renamed":
          //this.isAllowed();
         // this.processResourceRenamed(data.data);
          break;

        case "resource_deleted":
          
        this.participantsList.forEach(x => {
          //console.log("sdfsdfwdsfsdfs",x.user_id,data.data.created_by) 
         if(x.user_id == data.participant_id){
          let obj = {
            huddle_id: this.activeRoute.parent.snapshot.paramMap.get('id'),
            user_id: data.participant_id,
            video_id:''
          }
           x.is_submitted=0;
           // getting real time comments, if a video is deleted then its comments should also be deleted in count
          this.assessmentService.getCommentCount(obj).subscribe((data:any) => {
            if(data.success && data){
              x.comments_count=data.data.comments_count;
            }
        });
          
           if(data.doc_type==1){
             x.videos_count--
           }
           if(data.doc_type==2){
             x.resources_count--
           }
         }
       });


          //this.isAllowed();
          //this.processResourceDeleted(data.data, data.deleted_by);
          break;
        
        case "comment_added":  
        if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {

          this.participantsList.forEach(x => {
              if (data.from_cake == 1) {
                  let odata = JSON.parse(data.data)
                  if (x.user_id == odata.created_by) {
                      //console.log("participants is",x.user_id )
                      x.comments_count++
                  }
              } else {
                  if (x.user_id == data.data.created_by) {
                      //console.log("participants is",x.user_id )
                      x.comments_count++
                  }
              }
          });
 
      }
        break;

       case "comment_deleted":  
        if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {
          this.participantsList.forEach(x => {
            if(x.user_id == data.data || x.user_id ==data.user_id){
              x.comments_count--
            }
          });
          
        }
        break;
        
        case "assessee_deleted":
          //this.isAllowed();
          this.processAssesseeDeleted(data.data)
         // this.processResourceRenamed(data.data);
          break;
        case "assignment_submitted":
        this.participantsList.forEach(x => {
          if(x.user_id == data.submitted_by){
            //console.log("participants is",x.user_id )
            x.last_submission=data.data.last_submission;
            x.last_modified=data.data.last_submission;
            x.is_submitted=data.data.is_submitted;
            x.comments_count=data.data.comments_count;
          }
        });
        break;
        default:
          // code...
          break;
         
          
      }

    // });
  } //
  private processAssesseeDeleted(data){
    var indexOfMyObject = this.participantsList.findIndex(x => x.user_id == data.assessee_id);

    if (indexOfMyObject > -1) {
      let obj = this.participantsList[indexOfMyObject];
      this.participantsList.splice(indexOfMyObject, 1);
    }
  }
  // private processResourceAdded(resource, should_wait){
  //   let that = this;
  //   let wait_time = 0;
  //   if(should_wait)
  //   {
  //       wait_time = 10000;
  //       resource.published = 0;
  //   }
  //   this.huddleData.sample_data.push(resource);
  //   if(that.sessionData.user_current_account.User.id != resource.created_by)
  //   {
  //       that.toastr.info("New Artifact Added.");
  //   }
  //   //that.total_artifacts++;
  //   setTimeout(function(){
  //       resource.published = 1;
  //     that.processResourceRenamed(resource,1);
  //   },wait_time);


  // }

  // private processResourceRenamed(resource, dont_show_toast = 0){
  //   // _.extend(_.findWhere(this.artifacts, { doc_id: resource.document_id }), data);
  //   let objResource = _.find(this.huddleData.sample_data, function(item) {
  //       return (parseInt(item.id) == parseInt(resource.id) || parseInt(item.doc_id) == parseInt(resource.doc_id));
  //   });
  //     let index = -1;
  //     this.huddleData.sample_data.forEach((item, i)=>{
  //         //console.log(item.id,resource.id)
  //         if((parseInt(item.id) == parseInt(resource.id) || parseInt(item.doc_id) == parseInt(resource.doc_id)))
  //         {
  //             index = i;
  //         }

  //     });
  //     console.log(index);

  //   if(objResource){
  //       if(dont_show_toast == 0)
  //       {
  //           objResource.title.slice(0,25)
  //           console.log(this.sessionData.user_current_account.User.id , resource.updated_by);
  //           if(this.sessionData.user_current_account.User.id != resource.updated_by)
  //           {
  //               if( objResource.title.length>25){
  //                   this.toastr.info("'"+objResource.title+"'... renamed to '"+resource.title+"'...");
  //               }else{
  //                   this.toastr.info("'"+objResource.title+"' renamed to '"+resource.title+"'");
  //               }
  //           }
  //       }
  //       this.huddleData.sample_data[index] = resource;
  //   }
  // }

  // private processResourceDeleted(resource_id, deleted_by){

  //   var indexOfMyObject = this.huddleData.sample_data.findIndex(x => x.id == resource_id);

  //   if (indexOfMyObject > -1)
  //   {
  //       let obj = this.huddleData.sample_data[indexOfMyObject];
  //       this.huddleData.sample_data.splice(indexOfMyObject, 1);
  //       if(deleted_by != this.sessionData.user_current_account.User.id)
  //       {
  //           this.toastr.info("Artifact Deleted.");
  //       }
  //   }
  //  // this.total_artifacts--;
  // }
private isAllowed(allowed_participants = []) {
    let that = this;
    let allowed = _.find(allowed_participants, function (item) {
      return parseInt(item.user_id) == parseInt(that.sessionData.user_current_account.User.id);
    });
    if (allowed) {
      return true;
    }
  }
  OnclickDeleteModal(assesse_id){
    this.OpenDeleteModal(this.delete,"sm_popup", this.translation.artifacts_are_you_sure_to_delete_assessee );
    this.participantForDelete= assesse_id;
  }

  OpenDeleteModal(template: TemplateRef<any>,class_name,message?:string){
    if(message){
      this.messageDelete = message
    }else{
      this.messageDelete = this.translation.artifacts_you_are_about_to_delete_the_assesee ;
    }
    this.ModalRefs.participentsModal = this.modalService.show(template, {
      ignoreBackdropClick :true,
      class: class_name
    });                                                                                                                                                                                                                                 

  }

  showChildModal(): void {
    this.childModal.show();
  }
 
  hideChildModal(): void {
    this.childModal.hide();
  }

}

interface Modals {
  [key: string]: any;
}
