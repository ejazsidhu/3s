import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, EventEmitter, OnDestroy, AfterContentInit, AfterViewChecked, OnChanges, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { HeaderService } from '../../header.service';
import { AssessmentService } from '../services/assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
import { DetailsHttpService } from '../../details/servic/details-http.service';
import { ToastrService } from 'ngx-toastr';

import { Subject, Subscription } from 'rxjs';
// import { SocketService } from "../../socket.service";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CanDeactivateGuard } from '../services/can-deactivate.guard';
import * as _ from "underscore";
import oEcho from 'laravel-echo';
import io from 'socket.io-client';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';

import * as truncate from 'html-truncate';

import { HeaderService, SocketService, HomeService } from '@src/project-modules/app/services';
import { transition } from '@angular/animations';
declare global {
  interface Window { io: any; }
  interface Window { Echo: any; }
}

declare var Echo: any;

window.io = io;
window.Echo = window.Echo || {};

@Component({
  selector: 'asessors-detail-view',
  templateUrl: './asessors-detail-view.component.html',
  styleUrls: ['./asessors-detail-view.component.css']
})
export class AsessorsDetailViewComponent implements OnInit, AfterViewInit {
  private subscriptions: Subscription = new Subscription();
  translation:any;
  PipeTrigger: boolean;
  HuddlesAndFolders: any;
  Loadings: any;
  FoldersTreeData: any[];
  public colors;
  resource_allowed=1;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.huddleData && this.huddleData.current_huddle_info && !this.isPublished) {
      $event.returnValue = false;
    }
  }

  @ViewChild('childModal', { static: false }) childModal: ModalDirective;
  @ViewChild('description', { static: false }) description: ElementRef
  @ViewChild('popUp', { static: false }) popUpModel;
  @ViewChild('popup_scroll', { static: false }) popup;
  @ViewChild('hiddenDescToCalculateActualDescLength', { static: false })
  set hiddenDescToCalculateActualDescLength(v: any) {
    setTimeout(() => { this.hiddenDescLength = v.nativeElement.offsetHeight; }, 0);
  };
  @ViewChild('deleteHuddleModal', { static: false }) deleteHuddleModal: ModalDirective;
  @ViewChild('moveHuddleModal', { static: false }) moveHuddleModal: ModalDirective;
  @ViewChild('searchString', { static: false }) searchString: ElementRef;
  
  public hiddenDescLength: number = 400;
  public VideoForm: boolean = false;
  public artifact: any = {};
  public huddle_id: any = 0;
  public sessionData: any = {};
  public videoList: any = [];
  public selectedVideo: any;
  public workspaceVideoLoading = true;
  public addVideoTitle: string = '';
  public removeVideoTitle: string = '';
  public copyVideoNotes: boolean = false; // to be used on add vidoe from workspace
  public SearchString = ''
  public videoslist: any = [];
  public page: any = 1;
  public isAssessorOrCreator: boolean = true;
  public huddleData: any = {};
  public isDataAvailable = false;
  public is_expand = false;
  public is_enable;
  public isPublished = 0;
  public descString: string = '';
  huddleId: number;
  obj:any;
  activeComment:number;
  // public descStringWithoutHtmlTags: string = '';
  public opts: ISlimScrollOptions;
  public scrollEvents: EventEmitter<SlimScrollEvent>;
  private searchInput: Subject<string> = new Subject();
  public Inputs: { NewFolderName: string; Confirmation: string; ConfirmationKey: any; };

  userAccountLevelRoleId:any=0;
	DeletableItem
  MovableItem: { id: any; isHuddle: boolean; type: any; };
  isResponseCompleted= false;
  public totalRecords;
  public callCount=0;
  public searchPage=1;
  public userId:number;

  constructor(
    private toastr: ToastrService,
    private detailsService: DetailsHttpService,
    public assessmentService: AssessmentService,
    public headerService: HeaderService,
    private router: Router,
    private Guard: CanDeactivateGuard,
    private socketService: SocketService,
    private homeService: HomeService,
    private activeRoute: ActivatedRoute,
    ) {
      
      this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
        this.translation = languageTranslation;
        if(this.translation.artifacts_add_video){
          this.addVideoTitle = this.translation.artifacts_add_video;
          this.removeVideoTitle = this.translation.vd_cancel;
        }
      })
      );
    }

  clickme() {
    // console.log("height of description:ElementRef",this.description.nativeElement.offsetHeight)

  }

 
  ngOnInit() {

    this.SubscribeSearch();
    this.Inputs = { NewFolderName: "", Confirmation: "", ConfirmationKey: 'DELETE' };
    this.colors = this.headerService.getColors();

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
    }
    // this.activeRoute.queryParams.subscribe(p =>{
    //   console.log(p,'asessor view')
    //   this.huddle_id = p.id;
    // }
    //   )

    this.sessionData = this.headerService.getStaticHeaderData();
    
    this.userAccountLevelRoleId = this.sessionData.user_permissions.roles.role_id;
    setTimeout(() => {
      this.huddleData = this.assessmentService.huddleDataLocalSinglton;
      this.huddle_id=this.huddleData.current_huddle_info

      if (this.huddleData.sample_data) {
        this.huddleData.sample_data.map(item => {
          if (item.url.includes('.mp3')) item.is_mp3 = true;
          else item.is_mp3 = false;
        });
      }

      if (this.huddleData.current_huddle_info) {
        this.descString = this.huddleData.current_huddle_info.desc;
      this.huddle_id=this.huddleData.current_huddle_info.account_folder_id;

        // this.descStringWithoutHtmlTags = this.huddleData.current_huddle_info.desc.replace(/<\/?[^>]+(>|$)/g, "");
        // this.descStringLength = this.descStringWithoutHtmlTags.length;
        // if (this.descStringLength > 1200) {
        //   this.descString = truncate(this.huddleData.current_huddle_info.desc, 1200);
        // } else {
        //   this.descString = this.huddleData.current_huddle_info.desc;
        // }

        this.isPublished = this.huddleData.current_huddle_info.is_published;
      }

      this.isDataAvailable = true;

    }, 3000);
    this.userId = this.sessionData.user_current_account.User.id;
    // this.processEventSubscriptions();

    // if(this.sessionData.user_current_account.accounts.role_id==200)
    //   this.isAssessorOrCreator=true;
    // else
    // this.isAssessorOrCreator=false;

    // ;
    // this.getWorkSpaceVideos();
    
  this.getId();
  }

  goToEditHuddle(huddleData) {
    let str = '/add_huddle_angular/assessment/edit/' + huddleData.current_huddle_info.account_folder_id
    this.router.navigate([str])
  }

  ngOnDestroy() {

    this.subscriptions.unsubscribe();
  }


  public OnSearchChange(str) {
    this.searchPage=1;
    this.callCount=0;
    this.isResponseCompleted= false;
    this.workspaceVideoLoading = true;
    this.videoList = [];
    this.SearchString = str;
    //  this.getWorkSpaceVideos()
    this.searchInput.next(str)

  }


  private SubscribeSearch() {
    this.searchInput
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.getWorkSpaceVideos()


      });
  }
  ngAfterViewInit() {

    this.assessmentService.getVideoList().subscribe(data => {
      this.videoList = data;
      this.videoList.map(video => {
        if (this.selectedVideo && this.selectedVideo.id === video.id) video.selected = true;
        else video.selected = false;
      });
      this.workspaceVideoLoading = false;
    });



    this.assessmentService.getHuddleData().subscribe((data: any) => {
      if (data) {
        this.huddleData = data;

        this.huddleData.sample_data.map(item => {
          if (item.url.includes('.mp3')) item.is_mp3 = true;
          else item.is_mp3 = false;
        });

        if (this.huddleData.current_huddle_info) {
          this.descString = this.huddleData.current_huddle_info.desc;
          this.huddleData.submission_deadline_date = this.huddleData.submission_deadline_date.replace(/-/g, '/');;
          this.isPublished = this.huddleData.current_huddle_info.is_published;
          // this.descStringWithoutHtmlTags = this.huddleData.current_huddle_info.desc.replace(/<\/?[^>]+(>|$)/g, "");
          // this.descStringLength = this.descStringWithoutHtmlTags.length;
          // if (this.descStringLength > 1200) {
          //   this.descString = truncate(this.huddleData.current_huddle_info.desc, 1200);
          // } else {
          //   this.descString = this.huddleData.current_huddle_info.desc;
          // }
        }

        this.socketPushFunctionDiscussionDetail();
        if (this.huddleData.current_user_huddle_role_id == 200 || this.sessionData.user_current_account.User.id == this.huddleData.created_by)
          this.isAssessorOrCreator = true;
        else
          this.isAssessorOrCreator = false;

        this.isDataAvailable = true;
        this.detailsService.setArtifactlList(this.huddleData.sample_data);
      }

    });



  }

  public openResource(artifact) {
    this.detailsService.openResource(artifact);
  }
  goToDetailPage(artifact) {
    if (artifact.published == 1)
      this.router.navigate(["/video_details/home", artifact.account_folder_id, artifact.doc_id], { queryParams: { assessment: true } })
  }

  getSingleAsignment() {
    this.router.navigate(['../asignment/details'])
  }


  onScroll(event) {
    let element = this.popup.nativeElement;
    // console.log(event, 'scroll called');
    let atBottom = parseInt(element.scrollHeight) - parseInt(element.scrollTop) === element.clientHeight
    // console.log(atBottom);
    if (atBottom) {
      this.page++;
      let records = Math.ceil(this.totalRecords/12) - 1; 
      if(this.callCount<records){
        this.callCount++;this.searchPage++;
        this.getWorkSpaceVideos(true);
      }
      else{
        return;
      }
      // this.getWorkSpaceVideos(true);

    }

  }
  getId() {
    // this.assessmentService.getHuddleId().subscribe(id=>{
    //   console.log(id)
    // })

    this.huddle_id = this.assessmentService.getHuddleId();


  }
  public onMediaUpload(event) {

    if (event.from && event.files.length) {
      // console.log(event);
      let that = this;
      for (let file_key in event.files) {
        if (event.files.hasOwnProperty(file_key)) {
          let file = event.files[file_key];
          let obj: any = {};
          let sessionData: any = that.headerService.getStaticHeaderData();
          obj.user_current_account = sessionData.user_current_account;
          obj.account_folder_id = that.huddle_id;
          obj.huddle_id = that.huddle_id;
          obj.account_id = sessionData.user_current_account.accounts.account_id;
          obj.site_id = sessionData.site_id;
          obj.user_id = sessionData.user_current_account.User.id;
          obj.current_user_role_id = sessionData.user_current_account.roles.role_id;
          obj.current_user_email = sessionData.user_current_account.User.email;
          obj.suppress_render = false;
          obj.suppress_success_email = false;
          obj.workspace = false;
          obj.activity_log_id = "";
          obj.direct_publish = event.from == "Upload";
          obj.video_file_name = file.filename;
          obj.stack_url = file.url;
          obj.video_url = file.key;
          obj.video_id = "";
          obj.video_file_size = file.size;
          obj.direct_publish = true;
          obj.video_title = file.filename.split(".")[0];
          obj.url_stack_check = 1;
          obj.sample = 1;
          // console.log(obj);
          if (event.from == "Resource") {
            this.detailsService.uploadResource(obj).subscribe((response: any) => {
              this.toastr.info(this.translation.artifacts_new_resource_upload_successfully);
            });
          }
          else {
            this.detailsService.uploadVideo(obj).subscribe((data: any) => {
              // that.total_artifacts++;
              // console.log(data);
              // this.toastr.info('New Record Available Please Click Here to Refresh', 'New Record!').onTap.subscribe(() => this.routeRefresh());
              this.toastr.info(this.translation.artifacts_new_video_uploaded_successfully);
            });
          }

        }
      }
      //alert("Successfully uploaded : " + event.files[0].filename);
    }
  }

  public getWorkSpaceVideos(onScrollCall: boolean = false) {
    
    if (!onScrollCall) this.workspaceVideoLoading = true;
    // this.workspaceVideoLoading=true;
    let obj = {
      title: this.SearchString,
      page: this.SearchString.length>0 ? this.searchPage: this.page,
      sort: '',
      doc_type: '1',
      // account_id: 1,
      // user_id: 1,
      account_id: this.sessionData.user_current_account.users_accounts.account_id,
      user_id: this.sessionData.user_current_account.users_accounts.user_id,

    };
    this.assessmentService.getWorkspaceVideos(obj).subscribe((data: any) => {
      // this.workspaceVideoLoading=false;
      if(data.total_records>0){
        this.totalRecords = data.total_records;
      }
      this.videoslist = data.data;
      this.videoList = [...this.videoList, ...this.videoslist];

      this.assessmentService.setvideoList(this.videoList)
      if(this.videoList.length>0)
        {
        this.isResponseCompleted = true;
       }
     else
        this.isResponseCompleted = false;
    }, error => {

    })
  }
  showChildModal(): void {
    this.workspaceVideoLoading=true;
    this.page=1;
    this.videoList=[];
    this.getWorkSpaceVideos();
    this.childModal.show();
    this.copyVideoNotes = false;
    this.selectedVideo = null;
  }

  hideChildModal(): void {
      this.childModal.hide();
      // this.OnSearchChange('');
      this.resetItems()
  }

  OpenModel(artifact, modalName) {
   
    this.artifact = artifact;
    if (modalName === 'download')
      this.popUpModel.DownloadResource(artifact);
    else
      this.popUpModel.showModal(modalName);
  }

  toggleSelectedVide(item: any) {
    this.selectedVideo = item;
    this.videoList.forEach(video => {
      if (video.id === this.selectedVideo.id) video.selected = true;
      else video.selected = false;
    });
  }

  submitForm() {
    this.VideoForm = true
    let selectedVideo = this.videoList.find(video => video.selected);
    if (selectedVideo) {
      let formData = {
        document_id: selectedVideo.doc_id,
        account_folder_id: [this.huddleData.current_huddle_info.account_folder_id],
        current_huddle_id: selectedVideo.account_folder_id,
        account_id: this.sessionData.user_current_account.accounts.account_id,
        user_id: this.sessionData.user_current_account.User.id, copy_notes: this.copyVideoNotes,
        from_workspace: 1,
        sample: 1
      };

      this.detailsService.DuplicateResource(formData).subscribe((response: any) => {
        this.hideChildModal();
        this.VideoForm = false
        this.toastr.info(this.translation.artifact_newvideouploadedsuccessfully);

        // clear the data for selected video
        this.videoList.map(video => {
          video.selected = false;
        });
        this.copyVideoNotes = false;
        this.selectedVideo = null;
      }, error => {
        this.VideoForm = false

        // clear the data for selected video
        this.videoList.map(video => {
          video.selected = false;
        });
        this.copyVideoNotes = false;
        this.selectedVideo = null;
        this.hideChildModal();
        this.toastr.info(this.translation.sorry_for_inconvenience);
      });
    } else {
      this.VideoForm = false

      this.toastr.info(this.translation.select_video_to_upload);
    }
  }

  publish() {
    let data = {
      account_folder_id: this.huddleData.current_huddle_info.account_folder_id,
      account_id: this.sessionData.user_current_account.accounts.account_id,
      user_current_account: this.sessionData.user_current_account
    };

    this.assessmentService.publishAssessment(data).subscribe((res: any) => {
      if (res.success) {
        this.isPublished = 1;
        this.huddleData.current_huddle_info.published_date = res.published_date;
        this.toastr.info(this.translation.assessment_huddle_published)
      }
    }, error => console.log('error from publish: ', error))
  }

  expandView() {
    this.is_expand = !this.is_expand;

    // if (this.is_expand && this.descStringLength > 1200) {
    //   this.descString = this.huddleData.current_huddle_info.desc;
    // } else {
    //   this.descString = truncate(this.huddleData.current_huddle_info.desc, 1200);
    // }
  }


  private socketPushFunctionDiscussionDetail() {
    this.subscriptions.add(
      this.socketService.pushEventWithNewLogic(
        `huddle-details-${this.huddleData.current_huddle_info.account_folder_id}`).pipe(debounceTime(400)).subscribe(data => 
        this.processEventSubscriptions(data)));
  }

  private processEventSubscriptions(data) {
    console.log('web socket res: ', data);
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      switch (data.event) {
        case "resource_added":
          //console.log(data.allowed_participants,this.sessionData.user_current_account.User.id);
          if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {
            let should_wait = 0;
            if (data.is_video_crop) {
              should_wait = 1;
            }
            if (data.data.assessment_sample == 1 || data.assessment_sample == 1 ) {
              this.processResourceAdded(data.data, should_wait);
            }
            else
            {
              this.huddleData.sample_data.forEach(x => {
                if(x.document_id== data.reference_id){
                  x.total_attachment++;
                }
              });
            }
            // this.processResourceAdded(data.data, should_wait);
          }
          break;

        case "resource_renamed":
          //this.isAllowed();
          if (data.data.assessment_sample == 1) {
            this.processResourceRenamed(data.data, data.is_dummy);
          }
          // this.processResourceRenamed(data.data);
          break;

          case "comment_added":
            if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {
             if(data.from_cake==1){
              console.log('Comment added from Mobile')

               let odata=JSON.parse(data.data)
               this.huddleData.sample_data.forEach(x => {
                if(this.userId == odata.created_by && x.document_id == odata.ref_id ){
                  x.total_comments++
                }
                else{ 
                  if(x.document_id == odata.ref_id){
                  let obj = {
                    huddle_id: this.activeRoute.parent.snapshot.paramMap.get('id'),
                    user_id: odata.user_id,
                    video_id:x.document_id
                  }
                  this.assessmentService.getCommentCount(obj).subscribe((data:any) => {
                    if(data.success && data){
                      x.total_comments=data.data.active_comments_count;
                    }
                  });
                }
                }
              });
            }
            else{

              this.huddleData.sample_data.forEach(x => {
                if(x.created_by == data.data.created_by && x.document_id == data.video_id  ){
                  let obj = {
                    huddle_id: this.activeRoute.parent.snapshot.paramMap.get('id'),
                    user_id: data.participant_id,
                    video_id:x.document_id
                  }
                  this.assessmentService.getCommentCount(obj).subscribe((data:any) => {
                    if(data.success && data){
                      x.total_comments=data.data.active_comments_count;
                    }
                  });
                }
              });
            }
              
            }
            break;

        case "resource_deleted":
          //this.isAllowed();
          if (data.assessment_sample == 1) {
            this.processResourceDeleted(data.data, data.deleted_by);
          }
          // this.processResourceDeleted(data.data, data.deleted_by);
          break;

        default:
          // code...
          break;
      }

    // });
  } //

  private isAllowed(allowed_participants = []) {
    let that = this;
    let allowed = _.find(allowed_participants, function (item) {
      return parseInt(item.user_id) == parseInt(that.sessionData.user_current_account.User.id);
    });
    if (allowed) {
      return true;
    }
  }


  private processResourceAdded(resource, should_wait) {
    // let that = this;
    let wait_time = 0;
    if (should_wait) {
      wait_time = 10000;
      resource.published = 0;
    }
    const resourceExisted = this.huddleData.sample_data.find(r => r.id == resource.id);
    if(!resourceExisted) {
      this.huddleData.sample_data.push(resource);
      if (this.sessionData.user_current_account.User.id != resource.created_by) {
        this.toastr.info(this.translation.artifacts_new_artifacts_added);
      }
    }
    
    // that.total_artifacts++;

    // setTimeout(function () {
    //   resource.published = 1;
    //   that.processResourceRenamed(resource, 1);
    // }, wait_time);


  }

  private processResourceRenamed(resource, dont_show_toast = 0) {
    // _.extend(_.findWhere(this.artifacts, { doc_id: resource.document_id }), data);
    let objResource = _.find(this.huddleData.sample_data, function (item) {
      return (parseInt(item.id) == parseInt(resource.id) || parseInt(item.doc_id) == parseInt(resource.doc_id));
    });
    let index = -1;
    this.huddleData.sample_data.forEach((item, i) => {
      console.log(item.id, resource.id)
      if (parseInt(item.id) == parseInt(resource.id) || parseInt(item.doc_id) == parseInt(resource.doc_id)) {
        index = i;
      }

    });
    console.log(index);

    if (objResource) {
      if(dont_show_toast == 1 && this.activeComment==1){
        this.huddleData.sample_data[index].total_comments = resource.total_comments;
        this.huddleData.sample_data[index].total_attachment = resource.total_attachment;
      }else{
      if (dont_show_toast == 0) {
        objResource.title.slice(0, 25)
        console.log(this.sessionData.user_current_account.User.id, resource.updated_by);
        if (this.sessionData.user_current_account.User.id != resource.updated_by) {
          if (objResource.title.length > 25) {
            // this.toastr.info("'" + objResource.title + "'... renamed to '" + resource.title + "'...");
            this.toastr.info(`'${objResource.title}'... ${this.translation.artifacts_renamed_to} '${resource.title}'...`);
          } else {
            // this.toastr.info("'" + objResource.title + "' renamed to '" + resource.title + "'");
            this.toastr.info(`'${objResource.title}' ${this.translation.artifacts_renamed_to} '${resource.title}'`);
          }
        }
      }
      this.huddleData.sample_data[index] = resource;
    }
    }
  }

  private processResourceDeleted(resource_id, deleted_by) {

    var indexOfMyObject = this.huddleData.sample_data.findIndex(x => {
      return x.doc_id == resource_id || x.id == resource_id;
    });
    if (indexOfMyObject > -1) {
      let obj = this.huddleData.sample_data[indexOfMyObject];
      this.huddleData.sample_data.splice(indexOfMyObject, 1);
      if (deleted_by != this.sessionData.user_current_account.User.id) {
        this.toastr.info(this.translation.artifacts_new_artifacts_deleted);
      }
    }
    // this.total_artifacts--;
  }

// delete huddle 

showDeleteHuddleModal(huddle_id): void {
  this.DeletableItem=huddle_id;
  this.deleteHuddleModal.show();
}

hideDeleteHuddleModal(): void {
  this.deleteHuddleModal.hide();
}

public ConfirmDelete() {
  console.log(this.Inputs.Confirmation);
  ;
  if (this.Inputs.ConfirmationKey != this.Inputs.Confirmation) {

    this.toastr.info(this.translation.huddle_you_typed_in + " '" + this.Inputs.ConfirmationKey + "' ");
    return;
  }

  let obj: any = {};
    let sessionData: any = this.headerService.getStaticHeaderData();
    obj.user_id = sessionData.user_current_account.User.id;
    obj.huddle_id = this.DeletableItem;
    this.homeService.DeleteItem(obj, false).subscribe((d: any) => {

      this.hideDeleteHuddleModal();

      if (d.success) {
        this.toastr.info(d.message);
        this.router.navigate(['/video_huddles/list'])
      } else {
        this.toastr.info(d.message);
      }

    });

}
public TriggerTextChange(ev) {

  if (ev.keyCode == 13) {
    this.ConfirmDelete()

  }
}

// moving huddle code


showMoveHuddleModal(): void {
  // this.OnFolderMove(huddle_id)
  this.moveHuddleModal.show();
}

hideMoveHuddleModal(): void {
  this.moveHuddleModal.hide();
}

public OnFolderClick(folder_id, tree) {
  // ;
  // tree.treeModel.getActiveNode().data
  // console.log(folder_id);

}

public OnFolderMove(folder_id) {
  let isHuddle=true;
 let hType= 3//this.huddle_type

  if (!folder_id) return;

  this.MovableItem = {
    id: folder_id,
    isHuddle: Boolean(isHuddle),
    type: hType
  };

  let sessionData: any = this.headerService.getStaticHeaderData();

  let obj: any = {

    account_id: sessionData.user_current_account.accounts.account_id,
    user_id: sessionData.user_current_account.User.id,
    id: isHuddle ? "" : folder_id

  };

  let ref = this.homeService.GetFolderList(obj).subscribe((data) => {

    //console.log(data);
    this.FoldersTreeData = this.list_to_tree(data, 'parent');
    // this.ModalRefs.TreeViewDialog = this.modalService.show(template);
    this.showMoveHuddleModal()
    ref.unsubscribe();

  });


}
private list_to_tree(list, parentProp) {
  var map = {}, node, roots = [], i;
  for (i = 0; i < list.length; i += 1) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    node.name = node.text; //add name prop
    if (node[parentProp] !== "#") {
      // if you have dangling branches check that map[node[parentProp]] exists
      if (list[map[node[parentProp]]]) {
        list[map[node[parentProp]]].children.push(node);
      } else {
        // ;
      }

    } else {
      roots.push(node);
    }
  }
  return roots;
}

public getMovePath(tree) {

  if (!tree || !tree.treeModel || !tree.treeModel.getActiveNode() || !tree.treeModel.getActiveNode().data) {
    return;
  }
  //tree.treeModel.getActiveNode()
  let head = tree.treeModel.getActiveNode();

  if (tree.treeModel.getActiveNode().id == -1) return [tree.treeModel.getActiveNode().data];

  let arr = [];

  // let temp = JSON.parse(JSON.stringify(data));.data

  // console.log(this.deepFind(this.FoldersTreeData, {id: temp.parent}));

  while (head.parent != null) {

    if (head.data) {

      arr.push(head.data);

    }
    else if (head.treeModel.getActiveNode()) {

      arr.push(head.treeModel.getActiveNode().data);

    }

    head = head.parent;
  }

  if (arr.length == 0) return [tree.treeModel.getActiveNode().data];

  return arr.reverse();

}

 

public MoveItem(tree) {

  if (!tree.treeModel.getActiveNode()) {

    this.toastr.info(this.translation.huddle_no_traget_folder);

  }

  if (!(tree.treeModel.getActiveNode() && this.MovableItem.id)) return;

  // console.log(!!this.Loadings.MovingItem);
  if (this.Loadings.MovingItem) {
    //console.log("Already moving!");
    return;
  }

  let target = tree.treeModel.getActiveNode().data;

  let obj = {
    folder_id: target.id,
    huddle_id: this.MovableItem.id
  }

  if (this.MovableItem.isHuddle) {

    this.Loadings.MovingItem = true;
    this.homeService.Move(obj).subscribe((d: any) => {

      this.Loadings.MovingItem = false;
      if (d.success) {

        this.toastr.info(this.translation.huddle_moved_successfully);

        this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.filter((h) => {

          return h.huddle_id != this.MovableItem.id;

        });

        this.HuddlesAndFolders.total_huddles--;

        let index = _.findIndex(this.HuddlesAndFolders.folders, { folder_id: target.id });

        if (index > -1) {

          this.HuddlesAndFolders.folders[index].stats[this.MovableItem.type]++;

        }

        // this.ReloadCurrentPage();

      } else {
        this.toastr.info(d.message);
      }

    });


    this.hideMoveHuddleModal();

    // this.HideModal("TreeViewDialog");

  } else {

    this.Loadings.MovingItem = true;
    this.homeService.Move(obj).subscribe((d: any) => {
      this.Loadings.MovingItem = false;
      if (d.success) {
        this.toastr.info(this.translation.huddle_folder_moved_successfully);
        this.HuddlesAndFolders.folders.forEach((f, i) => {
          if (f.folder_id == target.id) {

            f.stats[this.MovableItem.type]++;

          }
          if (f.folder_id == this.MovableItem.id) {
            this.HuddlesAndFolders.folders.splice(i, 1);
          }
        })
      } else {
        this.toastr.info(d.message);
      }

      this.PipeTrigger = !this.PipeTrigger;

    });



    // this.HideModal("TreeViewDialog");
    this.hideMoveHuddleModal();

  }

  // console.log(this.MovableItem);
  // console.log(target);

}
public resetItems(){
  this.videoList=[];
  this.OnSearchChange('');
  this.page=1;
  // this.getWorkSpaceVideos()
}

}

