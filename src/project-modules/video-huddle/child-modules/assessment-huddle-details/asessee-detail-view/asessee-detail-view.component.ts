import { Component, OnInit, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, OnDestroy, ElementRef } from '@angular/core';
import { AssessmentService } from '../services/assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
// import { HeaderService } from 'src/app/header.service';
// import { DetailsHttpService } from 'src/app/details/servic/details-http.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
// import * as moment from 'moment'
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';

// import { SocketService } from "../../socket.service";
import * as _ from "underscore";
import oEcho from 'laravel-echo';
import io from 'socket.io-client';
// import { resolveComponentResources } from '@angular/core/src/metadata/resource_loading';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { DetailsHttpService } from '../../details/servic/details-http.service';
import { HeaderService, SocketService } from '@src/project-modules/app/services';
import { ActivatedRoute } from '@angular/router';

declare global {
  interface Window { io: any; }
  interface Window { Echo: any; }
}

declare var Echo: any;

window.io = io;
window.Echo = window.Echo || {};
@Component({
  selector: 'asessee-detail-view',
  templateUrl: './asessee-detail-view.component.html',
  styleUrls: ['./asessee-detail-view.component.css']
})
export class AsesseeDetailViewComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('popUp', { static: false }) popUpModel;
  videoList: any = [];
  @ViewChild('childModal', { static: false }) childModal: ModalDirective;
  @ViewChild('popup_scroll', { static: false }) popup;
  @ViewChild('searchString', { static: false }) searchString: ElementRef;
  @Input('resources') resources: any;
  @Input('resourceAllowed') resource_submission_allowed: any;
 
  workspaceVideoLoading = true;
  page: any = 1;
  sessionData: any = [];
  // public videosList: any = [];
  public videoslist: any = [];
  selectedVideo: any;
  artifact: any = {};
  public socket_listener: Subscription = new Subscription();
  basePath = environment.baseUrl;
  public totalRecords;
  public callCount=0;
  public copyVideoNotes: boolean = false; // to be used on add vidoe from workspace

  // Only for development purposes variables, If you are going to delete them then also delete
  // their references being used in html
  public pageBlankView: boolean = false;

  huddleData: any = {};
  isResponseCompleted= false;

  public addVideoTitle: string = '';
  public removeVideoTitle: string = '';
  isDataAvailable: boolean = false;
  public artifacts: any = []
  huddle_id: any = 0;
  SearchString='';
  isSubmissionValid = true;
  selectedIndex = -1;
  is_submitted: any = true;
  isAssessorOrCreator: boolean = true;
  // End development purpose variables
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  assignmentVideos: any[];
  assignmentResources: any[];
  testEelement: any;
  private searchInput: Subject<string> = new Subject();
  VideoForm: boolean = false;
  public translation: any = {};
  private subscription: Subscription;
  userAccountLevelRoleId: any=0;
  params: any;
  public searchPage=1;

  constructor(private toastr: ToastrService, private detailsService: DetailsHttpService,
    public headerService: HeaderService, private assessmentService: AssessmentService,
    private socketService: SocketService, private arouter:ActivatedRoute) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      if(this.translation.artifacts_add_video){
        this.addVideoTitle = this.translation.artifacts_add_video;
        this.removeVideoTitle = this.translation.vd_cancel;
      }
    });
  }
  ngOnInit() {
    this.SubscribeSearch();
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
    this.sessionData = this.headerService.getStaticHeaderData();
    // console.log('this.videoArtifetcts: ', this.videoArtifetcts);
    this.userAccountLevelRoleId = this.sessionData.user_permissions.roles.role_id;

    this.isDataAvailable = false;
    // this.processEventSubscriptions();
    this.arouter.parent.params.subscribe(params=>{
      this.params=params
      this.socketPushFunctionDiscussionDetail();
    })

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isResponseCompleted= false;
    if(changes.resource_submission_allowed)
    this.resource_submission_allowed=changes.resource_submission_allowed.currentValue;
    this.resources = changes.resources.currentValue;
    if (this.resources.original) {
      this.artifacts = this.resources.original.artifects.all;
      this.detailsService.setArtifactlList(this.artifacts);

      this.assignmentVideos = []
      this.assignmentResources = [];

      this.artifacts.forEach(c => {
        if (c.doc_type == 1) {
          this.assignmentVideos.push(c);

        }
        else {
          this.assignmentResources.push(c);
          // this.assignmentResources.splice(c.slot_index,1,i)


        }


      });
    }

    
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

  onScroll(event) {
    this.testEelement
    let element = this.popup.nativeElement;
    this.testEelement = element;
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

  public getWorkSpaceVideos(onScrollCall: boolean = false) {
    
    if (!onScrollCall) this.workspaceVideoLoading = true;
    let obj = {
      title: this.SearchString,
      page: this.SearchString.length>0 ? this.searchPage: this.page,
      sort: '',
      doc_type: '1',
      account_id: this.sessionData.user_current_account.users_accounts.account_id,
      user_id: this.sessionData.user_current_account.users_accounts.user_id,

    };
    this.assessmentService.getWorkspaceVideos(obj).subscribe((data: any) => {
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
      // this.videosList = data.data;
      // this.videoList = [...this.videoList, ...this.videosList];
      // if (onScrollCall) {
      //   console.log('in if')
      //   this.videoList = this.videoList.concat(data.data);
      //   // this.videoList = [this.videoList, ...data.data];
      //   // this.videoList = [...new Set(this.videoList)];
      // } else {
      //   console.log('in else')
      //   this.videoList = data.data;
      // }
      // this.workspaceVideoLoading = false;

      // this.assessmentService.setvideoList(this.videoList)
      // console.log(this.videoList.length);

    }, error => {

    })
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
    // this.videoList = this.assessmentService.workspaceVideosListSinglton;
    // this.workspaceVideoLoading = false;

    this.assessmentService.getHuddleData().subscribe((data: any) => {
      if (data) {
        this.huddleData = data;
        this.isDataAvailable = true;
      }
      this.socketPushFunctionDiscussionDetail();
      if (this.huddleData.current_user_huddle_role_id == 200 || this.sessionData.user_current_account.User.id == this.huddleData.created_by)
        this.isAssessorOrCreator = true;
      else
        this.isAssessorOrCreator = false;

    });

    this.huddleData = this.assessmentService.huddleDataLocalSinglton || [];
    var today = new Date();

    let splitdate = this.huddleData.submission_deadline_date.split('/');
    let newdate =  splitdate[0] + '-' +splitdate[1] + '-' + splitdate[2] +" "+ this.huddleData.submission_deadline_time;
    var submitDate = new Date(newdate);

    if (submitDate < today) {
      this.isSubmissionValid = false;
    }
    setTimeout(() => {
      this.isDataAvailable = true;

    }, 2000);
    if (this.huddleData.assessees_list)
      this.is_submitted = this.huddleData.assessees_list[0].is_submitted;

  }

  toggleSelectedVide(item: any) {
    this.selectedVideo = item;
    this.videoList.forEach(video => {
      if (video.id === this.selectedVideo.id) video.selected = true;
      else video.selected = false;
    });
  }

  showChildModal(index): void {
    this.workspaceVideoLoading=true;
    this.page=1;
    this.videoList=[];
    this.selectedIndex = index;
    this.getWorkSpaceVideos();
    this.childModal.show();
  }



  hideChildModal(): void {
    this.childModal.hide();
    // this.OnSearchChange('');
    this.resetItems()
  }

  getSelectedArtifact(data) {
    // console.log('event');
    this.artifact = data.artifact;
    if (data.modalName)
      this.popUpModel.showModal(data.modalName);
    else if (data.duplicateArtifact)
      this.popUpModel.DuplicateResource(data.artifact);

    else if (data.downloadArtifact)
      this.popUpModel.DownloadResource(data.artifact);
  }

  submitForm() {
    this.VideoForm = true;
     let selectedVideo = this.videoList.find(video => video.selected);
    if (selectedVideo) {
      let formData = {
        document_id: selectedVideo.doc_id,
        account_folder_id: [this.huddleData.current_huddle_info.account_folder_id],
        current_huddle_id: selectedVideo.account_folder_id,
        account_id: this.sessionData.user_current_account.accounts.account_id,
        user_id: this.sessionData.user_current_account.User.id, copy_notes: this.copyVideoNotes,
        from_workspace: 1,
        slot_index: this.selectedIndex
      };

      this.detailsService.DuplicateResource(formData).subscribe((response: any) => {
        // this.huddleData.sample_data.push(response.data);
        this.hideChildModal();
        this.VideoForm = false
        if (response.success) {
          this.toastr.info(this.translation.artifacts_new_video_uploaded_successfully);
          // this.assignmentVideos[this.selectedIndex]=response.data;
          // this.assignmentVideos.splice(this.selectedIndex, 1, response.data);
          console.log('videos', this.assignmentVideos.length, 'resources', this.assignmentResources.length)
          // clear the data for selected video
          this.videoList.map(video => {
            video.selected = false;
          });
          this.copyVideoNotes = false;
          this.selectedVideo = null;
        }
        else {
          this.toastr.info(response.message);
        }
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
    this.VideoForm = false;

      this.toastr.info(this.translation.select_video_to_upload);
    }
  }


  public OnSearchChange(str) {
    this.searchPage=1;
    this.callCount=0;
    this.isResponseCompleted= false;
    this.workspaceVideoLoading = true;
    this.videoList = [];
    this.SearchString = str;
    this.searchInput.next(str);

    // this.getWorkSpaceVideos()

  }

  getId(index) {
    // this.assessmentService.getHuddleId().subscribe(id=>{
    //   console.log(id)
    // })
    this.selectedIndex = -1;

    this.selectedIndex = index;
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
          obj.slot_index = this.selectedIndex


          // console.log(obj);
          if (event.from == "Resource") {
            this.detailsService.uploadResource(obj).subscribe((response: any) => {
              // that.total_artifacts++;
              // this.huddleData.sample_data.push(response.data);
              //this.artifacts.splice(this.selectedIndex, 1, response.data)
              // this.toastr.info('New Record Available Please Click Here to Refresh', 'New Record!').onTap.subscribe(() => this.routeRefresh());
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

  OpenModel(artifact, modalName) {
    this.artifact = artifact;
    if (modalName === 'download')
      this.popUpModel.DownloadResource(artifact);
    else
      this.popUpModel.showModal(modalName);
  }

  goToDetailPage(artifact) {
    let url = `${this.basePath}/video_details/home/${artifact.account_folder_id}/${artifact.doc_id}?assessment=true`
    if (artifact.published == 1)
      window.open(url.toString(), '_self');
  }

  public openResource(artifact) {
    // console.log('openResource: ', artifact)
    this.detailsService.openResource(artifact);
  }

  isAllResurcesSubmited() {
    let dummy_count = 0;
    let result = false
    this.artifacts = this.resources.original.artifects.all;
    this.assignmentVideos.forEach(element => {
      if (element.is_dummy == 1)
        dummy_count++

    });
    this.assignmentResources.forEach(element => {
      if (element.is_dummy == 1)
        dummy_count++

    });


    // console.log(count)
    if (dummy_count == this.assignmentResources.length + this.assignmentVideos.length)
      return true;
    else
      false

  }
  public submitAssignment() {

    let c = this.isAllResurcesSubmited()

    if (c) {
      this.toastr.info(this.translation.assesse_min_video_or_resource_upload_alert)
    }

    else if (confirm(this.translation.assesse_before_submit_assessment_alert)) {
      let obj = {
        account_folder_id: this.assessmentService.getHuddleId(),
        account_id: this.sessionData.user_current_account.accounts.account_id,
        user_id: this.huddleData.assessees_list[0].user_id,
        group_id: this.huddleData.assessees_list[0].group_id,
      }
      this.assessmentService.submitAssignment(obj).subscribe((data: any) => {

        if (data.success) {
          this.toastr.info(data.message)
          this.is_submitted = true
        }

      }, error => {

      })
    }
  }

  //socket methods start
  private socketPushFunctionDiscussionDetail() {
    console.log('123',this.params)
    this.socket_listener.add(this.socketService.pushEventWithNewLogic(`huddle-details-${this.params.id}`).subscribe(data => this.processEventSubscriptions(data)));
  }

  private processEventSubscriptions(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
    console.log('data from socket: ',data)
      switch (data.event) {
        case "resource_added":
          //console.log(data.allowed_participants,this.sessionData.user_current_account.User.id);
          if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {
            let should_wait = 0;
            if (data.is_video_crop) {
              should_wait = 1;
            }
            this.processResourceAdded(data.data, should_wait);
          }
          break;

        case "resource_renamed":
          //this.isAllowed();
          this.processResourceRenamed(data.data, data.is_dummy);
          break;

        case "resource_deleted":
          //this.isAllowed();
          this.processResourceDeleted(data.data, data.deleted_by, data.assignment_unsubmitted);
          break;

          case "comment_deleted": 

          if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {
            this.huddleData.sample_data.forEach(x => {
              if(x.document_id == data.video_id){
                x.total_comments--
              }
            });
            
          }
          break;

        default:
          // code...
          break;
      }

    // });
  } //

  private processResourceAdded(resource, should_wait) {
    let that = this;
    let wait_time = 0;
    if (should_wait) {
      wait_time = 10000;
      resource.published = 0;
    }
    const resourceExisted = this.artifacts.find(r => r.id == resource.id);
    if(!resourceExisted) {
      this.artifacts.push(resource);
      if (that.sessionData.user_current_account.User.id != resource.created_by) {
        // that.toastr.info(this.translation.artifacts_new_artifacts_added);
      }
    }

    if (resource.doc_type == 2)
      this.assignmentResources[this.selectedIndex] = resource;
    else if (resource.doc_type == 1)
      this.assignmentVideos[this.selectedIndex] = resource

    //that.total_artifacts++;
    // setTimeout(function () {
    //   resource.published = 1;
    //   that.processResourceRenamed(resource, 1);
    // }, wait_time);


  }

  private processResourceRenamed(resource, dont_show_toast = 0) {

    // _.extend(_.findWhere(this.artifacts, { doc_id: resource.document_id }), data);
    var indexOfMyObject = this.assignmentVideos.findIndex(x => x.id == resource.id);
    var indexOfMyObject2 = this.assignmentResources.findIndex(x => x.doc_id == resource.doc_id);
    let objResource = null;
    //console.log("Hellooooooooooooooooooo");

    if (indexOfMyObject > -1) {
      objResource = this.assignmentVideos[indexOfMyObject];
      this.assignmentVideos[indexOfMyObject] = resource;
      console.log("in socket video", this.assignmentVideos[indexOfMyObject], resource)
    }

    else if (indexOfMyObject2 > -1) {
      objResource = this.assignmentResources[indexOfMyObject2];
      this.assignmentResources[indexOfMyObject2] = resource;
    }

    if (objResource) {
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

    }
    //this.artifacts=[];
    //this.artifacts=[...this.assignmentVideos,...this.assignmentResources];
  }

  private processResourceDeleted(resource_id, deleted_by, issubmit?) {

    var indexOfMyObject = this.assignmentVideos.findIndex(x => {
      return x.doc_id == resource_id || x.id == resource_id;
    });
    var indexOfMyObject2 = this.assignmentResources.findIndex(x => {
      return x.doc_id == resource_id || x.id == resource_id;
    });
    console.log("index number is", indexOfMyObject, " or ", indexOfMyObject2);
    console.log("x id is", resource_id);
    //console.log("index number is",indexOfMyObject);
    if (issubmit) {
      this.is_submitted = false
    }
    if (indexOfMyObject > -1) {
      this.assignmentVideos[indexOfMyObject].is_dummy = 1;
    }
    else if (indexOfMyObject2 > -1) {
      this.assignmentResources[indexOfMyObject2].is_dummy = 1;
    }
    // this.total_artifacts--;
    if (deleted_by != this.sessionData.user_current_account.User.id) {
      // this.toastr.info(this.translation.artifacts_new_artifacts_deleted);
    }
  }
  private isAllowed(allowed_participants = []) {
    let that = this;
    let allowed = _.find(allowed_participants, function (item) {
      return parseInt(item.user_id) == parseInt(that.sessionData.user_current_account.User.id);
    });
    if (allowed) {
      return true;
    }
  }
  public resetItems(){
    this.videoList=[];
    this.OnSearchChange('');
    this.page=1;
    // this.getWorkSpaceVideos()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.socket_listener.unsubscribe();
  }
}
