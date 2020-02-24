import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkspaceHttpService } from '../services';
import { SocketService } from '@app/services';
import { HeaderService } from '@projectModules/app/services';
import { ToastrService } from 'ngx-toastr';
// import { GridComponent } from '../grid/grid.component';
import { environment } from "@environments/environment";
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from "underscore";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('share', { static: false }) shareComponent: any;
  @ViewChild('syncnotes', { static: false }) syncnotes: ModalDirective;
  public toggleStyleView = 'grid';
  public resourceFilter;
  public searchString = '';
  private searchInput: Subject<string> = new Subject();
  sort: any;
  page: number = 1;
  user_id: any = '';
  account_id: any = '';
  Loadings: any = {};
  artifacts: any = [];
  total_artifacts: any;
  bysearch: any;
  sessionData: any;
  activities_request_ref: any;
  noRecorFound: boolean;
  public socket_listener: any;
  NewVideos: any = [];
  NewVideosTime: NodeJS.Timer;
  public translation: any = {};
  private subscription: Subscription;
  total_artifactsload: boolean = true;
  showSkeleton = true;
  
  public userAccountLevelRoleId: number | string = null;
  
  @HostListener("window:scroll", ["$event"])
  onScroll(event) {
    // setTimeout(()=>{
    if (this.Loadings.isNextPageLoading) {
      let doc = document.documentElement;
      let currentScroll =
        (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

      var d = document.documentElement;
      var offset = window.innerHeight + window.pageYOffset; //d.scrollTop + window.innerHeight;
      var height = d.offsetHeight;
      if (
        window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight - 2
      ) {
        window.scroll(0, currentScroll - 100);
      }
    } else if (!this.Loadings.isNextPageLoading && this.total_artifacts > this.artifacts.length) {
      setTimeout(() => {
        let doc = document.documentElement;
        let currentScroll =
          (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        var d = document.documentElement;
        var offset = d.scrollTop + window.innerHeight;
        var height = d.offsetHeight;

        // if (offset === height)
        if (
          window.innerHeight + window.pageYOffset >=
          document.body.offsetHeight - 2
        ) {
          this.LoadNextPage(true);
          window.scroll(
            0,
            document.body.offsetHeight -
            this.getPercentage(document.body.offsetHeight, 9)
          );
        }
      }, 100);
    } else {
      // console.log(!this.Loadings.isNextPageLoading && this.total_artifacts < this.artifacts.length, this.total_artifacts, this.artifacts.length);
      //window.scroll(0,document.body.offsetHeight-this.getPercentage(document.body.offsetHeight, 8));
    }
    // }, 100);
  }
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private workService: WorkspaceHttpService, private headerService: HeaderService, private toastr: ToastrService, private socketService: SocketService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    // this.translation = this.sessionData.language_translation; // changed to observable stream
    
        this.userAccountLevelRoleId = this.sessionData.user_permissions.roles.role_id;
    this.SubscribeSearch();
    this.activatedRoute.queryParams.subscribe(params => {
      let searchchecker = params.search
      if (searchchecker != undefined) {
        this.bysearch = true
      } else {
        this.bysearch = false
      }
      this.page = 1;
      var url = this.router.url.split("/");

      // console.log(url[url.length - 1].split('?'));
      let r = url[url.length - 1].split('?');
      this.toggleStyleView = r[0]; // popular
      params.resource
        ? (this.resourceFilter = params.resource)
        : (this.resourceFilter = 0);
      params.search
        ? (this.searchString = params.search)
        : (this.searchString = "");
      params.sort
        ? (this.sort = params.sort)
        : (this.sort = "");
      // this.GetArtifacts()
      if (this.page) {
        this.artifacts = []
        this.workService.setArtifact([]);
        this.total_artifacts = 0;
        this.workService.setTotalAritifactCount(0);
      }
      this.LoadNextPage(false);
      // this.detailsService.setResource(this.resourceFilter);
      this.workService.getArtifact().subscribe(d => {
        this.artifacts = d

      })
    });
    this.workService.count_emmiter.subscribe((count: any) => {
      this.total_artifactsload = true
      this.total_artifacts = count;
      this.total_artifactsload = false
    });
    this.workService.resourceToOpen.subscribe(artifact => {
      this.FileClicked("td", artifact);
    });
    let channel_name = `workspace-${this.sessionData.user_current_account.users_accounts.account_id}-${this.sessionData.user_current_account.users_accounts.user_id}`;
    console.log(channel_name);
    this.socket_listener = this.socketService.pushEventWithNewLogic(channel_name).subscribe(data => this.processEventSubscriptions(data));
    // this.processEventSubscriptions();
  }

  showModal(value): void {
    // this.artifactModel=this.artifact;
    switch (value) {
      case 'sync_notes':
        this.syncnotes.show();
        break;
    }
  }

  hideModal(value) {
    switch (value) {
      case 'sync_notes':
        this.syncnotes.hide();
        break;
    }
  }

  //#region searchFunctionality
  public OnSearchChange(event) {
    this.searchInput.next(event);

  }
  private SubscribeSearch() {
    this.searchInput
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(value => {

        if (this.searchString) {
          this.router.navigate([], {
            queryParams: { search: this.searchString }, queryParamsHandling: 'merge'
          });
        }
        else {
          this.router.navigate([], {
            queryParams: { search: null }, queryParamsHandling: 'merge'
          });
        }

        this.search();

      });
  }

  public search() {
    // this.initVars(true, true);
    this.workService.Loadings.IsLoadingArtifacts.emit(true);
    // this.GetArtifacts()
    this.LoadNextPage(false);
  }
  //#endregion
  GetArtifacts() {

    this.artifacts = []
    this.workService.setArtifact([]);
    this.total_artifacts = 0;
    let x: any = this.headerService.getStaticHeaderData()
    this.user_id = x.user_current_account.users_accounts.user_id;
    this.account_id = x.user_current_account.users_accounts.account_id;
    let obj = {
      account_id: this.account_id,
      user_id: this.user_id,
      title: this.searchString,
      page: this.page,
      sort: this.sort,
      doc_type: this.resourceFilter

    }
    if (this.activities_request_ref) {
      this.activities_request_ref.unsubscribe();
    }
    this.activities_request_ref = this.workService.getWorkspaceArtifects(obj).subscribe((d: any) => {
      this.workService.setArtifact(d.data);
      //this.total_artifacts = d.total_records
      this.workService.setTotalAritifactCount(d.total_records);
      // this.workService.total_count.subscribe((count:any)=>{
      //   this.total_artifacts=count;
      // });
    }, err => {
      console.log('Error', err)
    })
    this.workService.Loadings.IsLoadingArtifacts.emit(false);
  }
  private getPercentage(n, what) {
    return (what / 100) * n;
  }
  public LoadNextPage(increment?) {
    if (increment) this.page++;
    this.workService.Loadings.IsLoadingArtifacts.emit(true);
    this.Loadings.isNextPageLoading = true;
    let x: any = this.headerService.getStaticHeaderData()
    this.user_id = x.user_current_account.users_accounts.user_id;
    this.account_id = x.user_current_account.users_accounts.account_id;
    let obj = {
      account_id: this.account_id,
      user_id: this.user_id,
      title: this.searchString,
      page: this.page,
      sort: this.sort,
      doc_type: this.resourceFilter

    };
    if (this.activities_request_ref) {
      this.activities_request_ref.unsubscribe();
    }
    this.activities_request_ref = this.workService.getWorkspaceArtifects(obj).subscribe((d: any) => {
      this.showSkeleton = false;
      if (this.page == 1) {
        this.total_artifactsload = true
        this.total_artifacts = d.total_records;
        this.total_artifactsload = false;
        this.workService.setArtifact(d.data);

      } else {
        if (d.data.length) {
          this.artifacts = [...this.artifacts, ...d.data];
          this.workService.setArtifact(this.artifacts);
        }
      }
      // let total_pages=Math.ceil(this.total_artifacts/12);
      //     if(this.page>total_pages){
      //       this.page=total_pages;
      //     }
      setTimeout(() => {
        this.Loadings.isNextPageLoading = false;
        this.workService.Loadings.IsLoadingArtifacts.emit(false);
        if (this.artifacts.length == 0)
          this.noRecorFound = true
      }, 100);
    });
  }
  public onMediaUpload(event) {
    if (event.from && event.files.length) {
      let that = this;
      for (let file_key in event.files) {
        if (event.files.hasOwnProperty(file_key)) {
          let file = event.files[file_key];
          let obj: any = {};
          obj.user_current_account = that.sessionData.user_current_account;
          obj.account_folder_id = null;
          obj.huddle_id = null;
          obj.account_id = that.sessionData.user_current_account.accounts.account_id;
          obj.site_id = that.sessionData.site_id;
          obj.user_id = that.sessionData.user_current_account.User.id;
          obj.current_user_role_id = that.sessionData.user_current_account.roles.role_id;
          obj.current_user_email = that.sessionData.user_current_account.User.email;
          obj.suppress_render = false;
          obj.suppress_success_email = false;
          obj.workspace = true;
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
          if (event.from == "Resource") {
            this.workService.uploadResource(obj).subscribe((data: any) => {
              /*that.total_artifacts++;
              if(this.sort == "uploaded_date"){
                this.artifacts.unshift(data.data)
                this.workService.setArtifact(this.artifacts);
              }else{
                this.toastr.info('New Record Available Please Click Here to Refresh', 'New Record!').onTap.subscribe(() => this.routeRefresh());
              }*/
              this.toastr.info(`${this.translation.workspace_newresourceuploaded}`)
            },error=>{
              // this.toastr.error(`${this.translation.video_not_processed}`)

            });
          }
          else {
            this.workService.uploadVideo(obj).subscribe((data: any) => {
              /*that.total_artifacts++;
              if(this.sort == "uploaded_date"){
                this.artifacts.unshift(data.data)
                this.workService.setArtifact(this.artifacts);
              }else{
                this.toastr.info('New Record Available Please Click Here to Refresh', 'New Record!').onTap.subscribe(() => this.routeRefresh());
              }*/
              let d: any = data
              let type = this.headerService.isAValidAudio(d.data.file_type);
              if(type==false){
                this.toastr.info(`${this.translation.workspace_newvideouploaded}`);
              }
              else {
                this.toastr.info(this.translation.workspace_new_audio_uploaded);
              }
              
            },error=>{
              // this.toastr.error(`${this.translation.video_not_processed}`)
            });
          }

        }
      }
      //alert("Successfully uploaded : " + event.files[0].filename);
    }
  }

  public FileClicked(from, file) {

    if (from == "td") {

      if (file.stack_url && file.stack_url != null) {
        let path = environment.baseUrl + "/app/view_document" + file.stack_url.substring(file.stack_url.lastIndexOf("/"), file.stack_url.length);
        window.open(path, "_blank");
      }
      else {
        this.DownloadFile(file);
      }
    }
    else {
      this.DownloadFile(file);
    }
  }
  private DownloadFile(file) {
    this.workService.DownloadFile(file.doc_id);
  }
  routeRefresh() {
    this.ngOnInit();
  }

  startScriptedNotes() {
    let obj = {
      observation_title: `${this.translation.workspace_scriptednotes} ` + new Date().toUTCString(),
      observations_comments: '',
      observations_standards: '',
      observations_tags: '',
      observations_time: '00: 00: 00',
      account_id: this.sessionData.user_current_account.accounts.account_id,
      user_id: this.sessionData.user_current_account.User.id,
      from_workspace: true,
      video_id: null,
      huddle_id: null
    }
    this.workService.startScriptedNotes(obj).subscribe((data: any) => {
      // let path = environment.baseUrl+'/video_details/scripted_observations/'+data.huddle_id+'/'+data.document_id+'?workspace=true'
      // debugger
      // window.open(path,'_self')
      let path = '/video_details/scripted_observations/' + data.huddle_id + '/' + data.document_id;

      this.router.navigate([path], { queryParams: { workspace: true } });
    })
  }
  private processEventSubscriptions(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      console.log("A Web Socket event received testing");
      console.log(data);
      switch (data.event) {
        case "resource_added":
          //console.log(data.allowed_participants,this.sessionData.user_current_account.User.id);
          let should_wait = 0;
          if (data.is_video_crop) {
            should_wait = 1;
          }
          this.processResourceAdded(data.data, should_wait);
          if (data.new_video_uploaded) {
            this.NewVideos.push(data.data);
            if (this.NewVideosTime) {
              clearTimeout(this.NewVideosTime)
            }
            this.NewVideosTime = setTimeout(() => {
              this.getThumbNail()
            }, 30000);

          }
          break;
        case "resource_renamed":
          //this.isAllowed();
          this.processResourceRenamed(data.data, data.is_dummy);
          break;
        case "synced_notes_uploads":
          //this.isAllowed();
          this.processResourceUpload(data.data);
          break;
        case "resource_deleted":
          //this.isAllowed();
          this.processResourceDeleted(data.data, data.deleted_by);
          break;
        default:
          // code...
          break;
      }
    // });
  }
  private processResourceAdded(resource, should_wait) {
    let that = this;
    let wait_time = 0;
    if (should_wait) {
      wait_time = 12000;
      resource.published = 0;
    }
    that.artifacts.push(resource);
    console.log("on resourec added ",resource.doc_id)
    if(this.resourceFilter == 0){
      that.total_artifacts++;
    }else if((this.resourceFilter == 1 && resource.doc_type == 1) || (this.resourceFilter == 1 && resource.doc_type == 3 && resource.is_processed >= 4) || (this.resourceFilter == 3 && resource.doc_type == 3 && resource.is_processed < 4)){
      that.total_artifacts++;
    }else if(this.resourceFilter == 2 && resource.doc_type == 2){
      that.total_artifacts++;
    }
    // setTimeout(function () {
    //   // resource.published = 1;
    //   that.processResourceRenamed(resource);
    // }, wait_time);
  }
  private processResourceDeleted(resource_id, deleted_by) {
    var indexOfMyObject = this.artifacts.findIndex(x => {
      return x.doc_id == resource_id || x.id == resource_id;
    });
    if (indexOfMyObject > -1) {
      let obj = this.artifacts[indexOfMyObject];
      this.artifacts.splice(indexOfMyObject, 1);
      this.total_artifacts -= 1;
      this.workService.setTotalAritifactCount(this.total_artifacts);
    }
  }
  private processResourceRenamed(resource , is_dummy?) {
    // _.extend(_.findWhere(this.artifacts, { doc_id: resource.document_id }), data);
    let objResource = _.find(this.artifacts, function (item) {
      return ((parseInt(item.id) == parseInt(resource.id)) || parseInt(item.doc_id) == parseInt(resource.doc_id)) ;
    });
    let index = -1;
    this.artifacts.forEach((item, i) => {
      if ((parseInt(item.id) == parseInt(resource.id)) || (parseInt(item.doc_id) == parseInt(resource.doc_id)))  {
        index = i;
      }
    });
    console.log(index);
    if (objResource) {
      if(is_dummy){
        this.artifacts[index].total_comments = resource.total_comments;
        this.artifacts[index].total_attachment = resource.total_attachment;
      }else{
        this.artifacts[index] = resource;
      }
      
    }
    console.log("on resourec rename ",resource.doc_id)

  }
  private processResourceUpload(resource) {
    // _.extend(_.findWhere(this.artifacts, { doc_id: resource.document_id }), data);
    let objResource = _.find(this.artifacts, function (item) {
      return parseInt(item.doc_id) == parseInt(resource.id);
    });
    let index = -1;
    this.artifacts.forEach((item, i) => {
      if (parseInt(item.doc_id) == parseInt(resource.id)) {
        index = i;
      }
    });
    console.log(index);
    if (objResource) {
      this.artifacts[index].upload_progress = resource.upload_progress;
      this.artifacts[index].total_comments = resource.total_comments;

	// code from workspace by Affan
	this.artifacts[index].video_duration = resource.video_duration;
          if(!resource.video_duration)
          {
              this.artifacts[index].video_duration = resource.current_duration;
          }
	// end code from workspace by Affan
      this.artifacts[index].upload_status = resource.upload_status;
      this.artifacts[index].thubnail_url = resource.thubnail_url;
      this.artifacts[index].static_url = resource.static_url;
    }
  }
  ngOnDestroy() {
    /*
    this.ARouter.params.subscribe(p => {
      this.huddle_id = p.id;
      this.socketService.destroyEvent(`huddle-details-${this.huddle_id}`);
    });
    */
    this.socket_listener.unsubscribe();
    this.subscription.unsubscribe();
  }
  getThumbNail() {

    this.NewVideos.forEach(e => {
      let obj = {
        document_id: e.doc_id,
        folder_type: 3,
        account_folder_id: e.account_folder_id,
        user_id: e.created_by,
      }
      this.workService.getSingleVideo(obj).subscribe((data: any) => {
        this.processResourceRenamed(data.data)
      })
    });
  }
}
