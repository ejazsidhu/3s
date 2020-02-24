import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, EventEmitter, HostListener } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HeaderService, SocketService, HomeService } from '@projectModules/app/services';
import { SessionService } from "@videoHuddle/child-modules/list/services/session.service";
import { ToastrService } from "ngx-toastr";
// import { HomeService } from "@videoHuddle/child-modules/list/services/home.service";
import { BsModalService, ModalDirective } from "ngx-bootstrap/modal";
import { DetailsHttpService } from "../servic/details-http.service";
import { PermissionService } from '../servic/permission.service';
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { environment } from "@environments/environment";
import * as _ from "underscore";
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { DiscussionService } from "../servic/discussion.service";

/* Socket Imports */
import io from 'socket.io-client';
import { ConsoleService } from '@ng-select/ng-select/ng-select/console.service';

// At the top of the file
declare global {
  interface Window { io: any; }
  interface Window { Echo: any; }
}

declare var Echo: any;

window.io = io;
window.Echo = window.Echo || {};

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})

export class HomeComponent implements OnInit, OnDestroy {
  public ModalRefs: Modals;
  public params: any = {};
  public showHide = false;
  public popup_val;
  public socket_listener: any;
  @ViewChild("participantsModal", { static: false }) participantsModal;
  @ViewChild("renameModal", { static: true }) renameModal;
  @ViewChild("cropVideo", { static: true }) cropVideo;
  @ViewChild("delete_confim", { static: true }) delete_confim;
  @ViewChild("activity", { static: false }) activity;
  @ViewChild("email", { static: true }) email;
  @ViewChild("newDiscussions", { static: false }) newDiscussions;

  @ViewChild("popUp", { static: false }) popUpModel;

  @ViewChild('deleteHuddleModal', { static: false }) deleteHuddleModal: ModalDirective;
  @ViewChild('moveHuddleModal', { static: false }) moveHuddleModal: ModalDirective;

  public ToggleView: string = "all";
  private searchInput: Subject<string> = new Subject();
  ToggleStyleView = "grid";
  Filters: any = {};
  assessment_permissions;
  SearchString = "";
  Loadings: any = {};
  page: number = 0;
  HuddlesAndFolders;
  foldersExpanded: boolean;
  FoldersTreeData: any = {};
  subscriptionRefs: any = {};
  EditableFolder: any = {};
  PipeTrigger: boolean;
  permissions: any = {};
  colors;
  artifacts: any = [];
  resource_filter: any = 0;
  participents: any = [];
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  showArtifactButton = true;
  showDiscussionButton;
  loading_huddles: boolean = false;
  preLoaderLoop = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  actvities: any = [];
  path = environment.APIbaseUrl;
  rootPath = environment.baseUrl;
  isNotDiscussion: boolean;
  lastRoute: string = "grid";
  huddle_type: any = 3;
  artifacts_name;
  huddle_id: any;
  sort: any = '';
  user_huddle_role: any;
  sessionData: any = [];
  public total_artifacts: number = 0;
  @ViewChild("popupModal", { static: false }) popModal;
  noRecorFound: boolean = false;
  popupIsLoading: boolean;
  isGroupImage: boolean = false;
  bysearch: boolean;
  activities_request_ref: any = null;
  viewerObj: any = {}
  huddle_name: any;
  changed_account_name: "";
  previous_page: any;
  public header_data;
  public translation: any = {};
  private subscriptions: Subscription = new Subscription();
  public userAccountLevelRoleId: number | string = null;
  public translationLoaded: boolean = false;
  public addBtnPermissionLoaded: boolean = false;
  public cirqLiveData:any;
  public artifactsDataLoaded:boolean=false;
  Inputs: { NewFolderName: string; Confirmation: string; ConfirmationKey: any; };
	DeletableItem
  MovableItem: { id: any; isHuddle: boolean; type: any; };
  showMomeoptions=false;
  @HostListener("window:scroll", ["$event"])
  onScroll(event) {
    let stop_api_call = 0;
    if (this.total_artifacts) {
      let total_pages = Math.ceil(this.total_artifacts / 12)
      if (this.page > total_pages) {
        stop_api_call = 1;
      }
    }
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
    } else if (!this.Loadings.isNextPageLoading && this.total_artifacts > this.artifacts.length && !stop_api_call) {
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
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  constructor(
    public detailsService: DetailsHttpService,
    private fullRouter: Router,
    private ARouter: ActivatedRoute,
    public headerService: HeaderService,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private homeService: HomeService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private socketService: SocketService,
    public permissionService: PermissionService,
    private discussionService: DiscussionService) {
    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      this.translationLoaded = true;
    })
    );
    // let url = this.fullRouter.url.split("/");

    // this.lastRoute = url[url.length - 1];

    // this.fullRouter.events.subscribe(va => {
    //   let url = this.fullRouter.url.split("/");

    //   this.lastRoute = url[url.length - 1];
    //   let r=this.lastRoute.split('?');
    //   r[0];
    //   console.log(r[0])
    //   if (this.lastRoute == "grid" || this.lastRoute == "list") {
    //     this.ToggleStyleView = this.lastRoute;
    //   }
    // });


  }

  isViewer() {

  }


  ngOnInit() {
    
    this.sessionData = this.headerService.getStaticHeaderData();
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    
			this.Inputs = { NewFolderName: "", Confirmation: "", ConfirmationKey: 'DELETE' };

    // this.translation = this.header_data.language_translation; // changed to observable stream
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
    this.GetParams();
    this.SubscribeSearch();
    // this.LoadNextPage(true); //this.params.folder_id, false

    // this.processEventSubscriptions();


    // resource
    let id: any;
    this.ARouter.queryParams.subscribe(params => {
      this.total_artifacts = 0;
      let searchchecker = params.search
      if (searchchecker != undefined) {
        this.bysearch = true
      } else {
        this.bysearch = false
      }
      var url = this.fullRouter.url.split("/");
      // console.log(url)

      this.page = 0;

      // console.log(url[url.length - 1].split('?'));
      let r = url[url.length - 1].split('?');
      this.ToggleStyleView = r[0]; // popular
      // console.log(this.ToggleStyleView, 'toggle view');

      params.resource
        ? (this.resource_filter = params.resource)
        : (this.resource_filter = 0);
      params.search
        ? (this.SearchString = params.search)
        : (this.SearchString = "");
      params.sort
        ? (this.sort = params.sort)
        : (this.sort = "");
      // this.artifacts = []
      this.Loadings.isNextPageLoading = true;
      this.artifacts = [];
      this.previous_page = 0;
      this.LoadNextPage(true);
      this.detailsService.setResource(this.resource_filter);
    });

    this.detailsService.popup_value.subscribe(v => {
      this.trigger_model(v);
    });
    this.detailsService.resourceToOpen.subscribe(artifact => {
      this.FileClicked("td", artifact);
    });

    this.ModalRefs = {};

    this.isNotDiscussion = false;

    this.route.params.subscribe((p) => {


      this.params = p;
      this.detailsService.setParams(this.params);

    });

    //this.Getartifacts();

    this.observeNewRecords();
    this.getBreadCrumbs();
    

  }

  ngOnDestroy() {
    /*
    this.ARouter.params.subscribe(p => {
      this.huddle_id = p.id;
      this.socketService.destroyEvent(`huddle-details-${this.huddle_id}`);
    });
    */
    // this.socket_listener.unsubscribe();
    this.subscriptions.unsubscribe();
    if (this.ModalRefs && this.ModalRefs.participentsModal) this.ModalRefs.participentsModal.hide();

  }

  private getPercentage(n, what) {
    return (what / 100) * n;
  }

  public GetParticipents() {
    // this.detailsService.GetParticipentsList(this.huddle_id, this.huddle_type);
    let obj: any = {
      huddle_id: +this.huddle_id,
      user_role_id: +this.sessionData.user_current_account.roles.role_id,
      user_id: +this.sessionData.user_current_account.User.id,
      // folder_type: this.huddle_type || 0
    };

    this.detailsService.GetParticipents(obj).subscribe(
      data => {
        this.participents = data;
        // console.log(this.participents,'participents')
        this.detailsService.setParticients(this.participents)
        this.popupIsLoading = false;
      },
      error => { }
    );
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
  private SubscribeSearch() {
    this.searchInput
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(value => {
        //console.log(value);
        let url = this.fullRouter.url;
        if (this.SearchString) {
          this.fullRouter.navigate([], {
            queryParams: { search: this.SearchString }, queryParamsHandling: 'merge'
          });
        }
        else {
          this.fullRouter.navigate([], {
            queryParams: { search: null }, queryParamsHandling: 'merge'
          });
        }

        this.search();




      });
  }

  public search() {
    this.initVars(true, true);

    // this.LoadNextPage(this.params.folder_id, false);
  }

  private LoadFilterSettings() {
    this.Filters = {};
    this.ModalRefs = { newFolderModal: "" };
    // this.Inputs = { NewFolderName: "", Confirmation:"", ConfirmationKey: "DELETE" };
    //  this.sub_filters = "0";

    this.Filters.type = this.NVals(
      this.sessionService.GetItem("huddle_type"),
      ["0", "1", "2", "3"],
      "0"
    );
    this.Filters.layout = this.NVals(
      this.sessionService.GetItem("huddle_layout"),
      ["0", "1"],
      "0"
    );
    this.Filters.sort_by = this.NVals(
      this.sessionService.GetItem("huddle_sort"),
      ["0", "1", "2", "3"],
      "0"
    );
    if (this.Filters.type == 3 && !this.Assessment_huddle_permissions()) {
      // this.Filters.type=0;
      this.DigestFilters("huddle_type", "0");
    }
  }
  private NVals(src, possible_values, default_value) {
    return possible_values.indexOf(src) > 0 ? src : default_value;
  }

  public DigestFilters(key, value, force_block?) {
    this.resource_filter = +value;
    this.sessionService.SetItem(key, value);
    if (key != "huddle_layout" && !force_block) {
      this.initVars(true, true);
      // this.LoadNextPage(true);
    }
  }

  public Assessment_huddle_permissions() {
    //let data = {};
    let data: any = this.headerService.getStaticHeaderData();
    this.assessment_permissions =
      data.user_permissions.UserAccount.manage_evaluation_huddles == 1;
    return this.assessment_permissions;
  }

  private GetParams() {
    // let id: any;
    // var url = this.fullRouter.url.split("/");
    // [, , , id, ,] = url;
    this.ARouter.params.subscribe(p => {
      this.huddle_id = p.id;
      // this.LoadNextPage(true);

      this.subscriptions.add(this.socketService.pushEventWithNewLogic(`huddle-details-${this.huddle_id}`).subscribe(data => {
        this.processEventSubscriptions(data);
      })
      );

      // this.socketService.pushEvent(`huddle-details-${this.huddle_id}`);


      // window.Echo.channel('huddle-resource-uploaded-'+this.huddle_id)
      //   .listen('BroadcastSibmeEvent', (data) => {
      //      let resource = data.data;
      //      console.log('From laravel echo: ', resource);
      //      this.artifacts.push(resource);
      // });


    })
    // console.log(id); // {order: "popular"}

    if (this.huddle_id) {
      // this.initVars();
      this.params = this.huddle_id;

      this.detailsService.SetParams(this.params);

      let obj: any = {
        folder_id: this.huddle_id
      };
      let sessionData: any = this.headerService.getStaticHeaderData();

      ({
        User: { id: obj.user_id },
        accounts: { account_id: obj.account_id }
      } = sessionData.user_current_account);

      let ref = this.homeService.GetBreadcrumbs(obj).subscribe((data: any) => {
        //

        // if(void 0 != data.success && data.success == -1){

        //   //this.toastr.info(data.message);
        //   setTimeout(()=>{
        //     this.fullRouter.navigate(['/list']);
        //   }, 2000);

        //   return;

        // }

        // console.log('home body',data)
        //
        // this.homeService.Breadcrumbs.emit(data);
      });
    } else {
      // this.LoadNextPage(false);
      // this.homeService.Breadcrumbs.emit([]);
    }

    // this.params = this.huddle_id;

    this.ARouter.params.subscribe(p => {
      this.params = p;
      this.huddle_id = p.id;
      if (p.id) {
        // this.LoadNextPage(true);
      }
    });
  }
  private initVars(preserve_params?, preserve_search_string?) {
    this.LoadFilterSettings();
    this.page = 1;
    this.Loadings = {};
    this.foldersExpanded = true;

    if (!preserve_search_string) {
      this.SearchString = "";
    }

    this.FoldersTreeData = {};
    // this.LoadNextPage();
    this.subscriptionRefs = {};
    this.EditableFolder = {};
    this.PipeTrigger = false;
    let sessionData: any = this.headerService.getStaticHeaderData();
    this.permissions.allow_move =
      sessionData.user_current_account.users_accounts.folders_check == 1;
    // ({folders_check:this.permissions.allow_move}=sessionData.user_current_account.user_accounts);
    this.Loadings.isNextPageLoading;
    if (!preserve_params) {
      this.params = {};
    }

    // let perms:any = {};
    if (this.HuddlesAndFolders != void 0)
      if (
        void 0 != this.HuddlesAndFolders.huddle_create_permission ||
        this.HuddlesAndFolders.folder_create_permission != void 0
      ) {
        let copy = JSON.parse(JSON.stringify(this.HuddlesAndFolders));
        this.HuddlesAndFolders = {};
        ({
          huddle_create_permission: this.HuddlesAndFolders
            .huddle_create_permission,
          folder_create_permission: this.HuddlesAndFolders
            .folder_create_permission
        } = copy);

        copy = {};
      } else {
        this.HuddlesAndFolders = {};
      }

    this.colors = this.headerService.getColors();
  }

  public Onclickonparticipant() {
    this.ShowParticipentsModal(this.participantsModal, "lg_popup");
    this.participents = []
    this.popupIsLoading = true;
    this.GetParticipents();

  }

  public ShowParticipentsModal(template: TemplateRef<any>, class_name) {
    this.ModalRefs.participentsModal = this.modalService.show(template, {
      class: class_name
    });
  }
  timedateSpanish(timedate, index) {
    let d = timedate.split(',')
    if (index == 1) return d[0]
    if (index == 2) {
      let dd = timedate.split(' ')
      // console.log(dd)
      return dd[3] + ' ' + dd[4]
    }
  }
  // =======
  public LoadNextPage(increment?) {

    if (increment) this.page++;
    if ((this.previous_page + 1) != this.page) {
      this.page = (this.previous_page + 1);
    }
    let reload_current_page = false;
    let sessionData: any = this.headerService.getStaticHeaderData();

    let url = this.fullRouter.url.split("/");
    let { id } = this.huddle_id;
    let {
      user_current_account: {
        accounts: { account_id },
        User: { id: user_id },
        roles: { role_id }
      }
    } = sessionData;

    let obj: any = {
      huddle_id: this.huddle_id,
      title: this.SearchString || "",
      account_id, //sessionData.user_current_account.accounts.account_id,
      user_id, //sessionData.user_current_account.User.id,
      role_id, //sessionData.user_current_account.roles.role_id,
      page: this.page, //reload_current_page ? this.page <= 1 ? this.page : this.page - 1 : this.page,
      doc_type: this.resource_filter || 0,
      sort: this.sort
      //  user_current_account: sessionData.user_current_account
    };



    this.Loadings.isNextPageLoading = true;
    // while(this.Loadings.isNextPageLoading){
    //   this.detailsService.Loadings.IsLoadingArtifacts.emit(true);
    // }
    let _interval_id = setInterval(() => {

      if (this.Loadings.isNextPageLoading) {
        // console.log("interval is running!");
        this.detailsService.Loadings.IsLoadingArtifacts.emit(true);
      } else {
        clearInterval(_interval_id);
      }

    }, 200);
    if (this.activities_request_ref) {
      this.activities_request_ref.unsubscribe();
    }
    this.activities_request_ref = this.detailsService.GetArtifacts(obj).subscribe((data: any) => {

      if (data.success) {

        this.GetCirqLiveData(data);// Get cirqlive data after getting artifacts
        this.previous_page = this.page;
        this.Loadings.is_loading_huddles = false;
        this.huddle_type = data.huddle_type;
        if(this.huddle_type==3){
          let url=`/video_huddles/assessment/${this.huddle_id}`
          this.fullRouter.navigate([url])
  
        }
        let artifactObj = {
          huddle_info: data.huddle_info,
          huddle_type: data.huddle_type,
          users_accounts: data.users_accounts,
          role_id: data.role_id,
          evaluators_ids: data.evaluators_ids,
          participants_ids: data.participants_ids,
          dis_mem_del_video: data.dis_mem_del_video,
          coachee_permissions: data.coachee_permissions,
          is_evaluator: data.is_evaluator,
          submission_date_passed: data.submission_date_passed
        }
        this.viewerObj = {
          role_id: artifactObj.role_id,
          huddle_type: artifactObj.huddle_type,
          isEvaluator:artifactObj.is_evaluator
        };
        this.addBtnPermissionLoaded = true;
        this.detailsService.setObj(artifactObj);
        if (1) {
          // this.page == 1 && (this.total_artifacts = data.artifects.total_records);
          if (this.page == 1) {
            (this.total_artifacts = data.artifects.total_records);
          }
          // let total_pages=Math.ceil(this.total_artifacts/12);
          // if(this.page>total_pages){
          //   this.page=total_pages;
          // }
          // if (data.artifects.all.length === 0)
          // this.toastr.info('No data found for current options', 'Artifacts')
          // if (!this.HuddlesAndFolders || !this.HuddlesAndFolders.huddles) {
          //  this.HuddlesAndFolders = data;
          // let d = data
          // this.artifacts = data.artifects.all;
          this.loading_huddles = true;
          this.huddle_type = data.huddle_type//data.huddle_info[0].folder_type;
          this.artifacts_name = data.huddle_info[0].name;
          this.user_huddle_role = data.role_id;
        } else {
          this.toastr.info(`${this.translation.artifact_somethingwentwrongpleaseretrylater}`);
        }

        if (this.page == 1) {
          this.artifacts = data.artifects.all;
          this.detailsService.setArtifactlList(this.artifacts);

        } else {
          // TODO: uniq
          this.artifacts = [...this.artifacts, ...data.artifects.all];
          data.artifects.all.length == 0 && (this.total_artifacts = this.total_artifacts);
          this.detailsService.setArtifactlList(this.artifacts);

          //this.page++;
        }
        setTimeout(() => {
          if (this.artifacts.length == 0)
            this.noRecorFound = true

        }, 200);

        //  this.PipeTrigger = !this.PipeTrigger;
        //  this.DealWithFakeHuddles(true);
        // window.scroll(0, this.Filters.layout==0? (scroll-1500): scroll-1000);
      } else {
            this.toastr.error(data.message);
            this.fullRouter.navigate(["/list"]);
      }
      setTimeout(() => {
        this.Loadings.isNextPageLoading = false;
        this.detailsService.Loadings.IsLoadingArtifacts.emit(false);
        // if(scroll){
        //    window.scroll(0,document.body.offsetHeight-100);
        // }
      }, 100);

      this.activities_request_ref.unsubscribe();
    }, error => {
      this.toastr.error(error.message);
      this.fullRouter.navigate(["/list"]);
    });
  }
  public OnSearchChange(event) {
    this.searchInput.next(event);

  }

  getAcitives() {
    // {"folder_id":"150013","user_id":"18737","account_id":"2936", "role_id": "100"}
    //  this.actvities= this.detailsService.getAcitives(this.huddle_id);

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj: any = {
      folder_id: this.huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      role_id: sessionData.user_current_account.roles.role_id
    };

    this.detailsService.getActivities(obj).subscribe(
      data => {
        // console.log('activites', data);
        this.actvities = data;
        this.detailsService.setActivities(this.actvities)
        this.popupIsLoading = false;
      },
      error => { }
    );
  }

  // public ShowParticipentsModal(template: TemplateRef<any>){

  //       this.ModalRefs.participentsModal = this.modalService.show(template,{class:class_name});

  //     }

  changeToggle(value: string) {
    this.ToggleView = value;
  }

  // public display_popup(popup){
  //   switch (popup) {
  //     case "renameModal":
  //     this.popup_val=this.detailsService.get_popup();
  //       this.ShowParticipentsModal(this.renameModal);
  //       // code...
  //       break;

  //     default:
  //       // code...
  //       break;
  //   }
  // }

  public trigger_model(v) {
    switch (v) {
      case "rename":
        this.ShowParticipentsModal(this.renameModal, "sm_popup");
        break;
      case "crope":
        this.ShowParticipentsModal(this.cropVideo, "lg_popup");
        break;
      case "duplicate":
        // code...
        break;
      case "Delete":
        this.ShowParticipentsModal(this.delete_confim, "sm_popup");
        break;
      case "email":
        this.ShowParticipentsModal(this.email, "lg_popup");
      default:
        // code...
        break;
    }
  }

  public Onclickactivity() {
    this.ShowParticipentsModal(this.activity, "lg_popup");
    this.actvities = []
    this.popupIsLoading = true;
    this.getAcitives();

  }

  public Newdiscussion() {
    this.ShowParticipentsModal(this.newDiscussions, "lg_popup");
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
          // console.log(obj);
          if (event.from == "Resource") {
            this.detailsService.uploadResource(obj).subscribe((data: any) => {
              // that.total_artifacts++;
              // console.log(data);
              // this.toastr.info('New Record Available Please Click Here to Refresh', 'New Record!').onTap.subscribe(() => this.routeRefresh());
              this.toastr.info(`${this.translation.artifact_newresourceuploadedsuccessfully}`);
            },error=>{
              // this.toastr.error(`${this.translation.video_not_processed}`)

            });
          }
          else {
            this.detailsService.uploadVideo(obj).subscribe((data: any) => {
              // that.total_artifacts++;
              // console.log(data);
              // this.toastr.info('New Record Available Please Click Here to Refresh', 'New Record!').onTap.subscribe(() => this.routeRefresh());
              let validAudioType =  this.headerService.isAValidAudio(data.data.file_type);
              if(validAudioType==false){
                this.toastr.info(`${this.translation.artifact_newvideouploadedsuccessfully}`);
              }
              else {
                this.toastr.info(`${this.translation.workspace_new_audio_uploaded}`);
                
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
  routeRefresh() {
    this.ngOnInit();
  }
  public OpenModal(modelName) {
    this.popModal.showModal(modelName)
  }

  public FileClicked(from, file) {

    console.log('reached')
    if (from == "td") {

      if (file.stack_url && file.stack_url != null) {
        //let path = environment.baseUrl + "/app/view_document" + file.stack_url.substring(file.stack_url.lastIndexOf("/"), file.stack_url.length);
        //window.open(path, "_blank");
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
    this.detailsService.DownloadFile(file.doc_id);
  }

  private observeNewRecords() {

    /*window.Echo = new oEcho({
      broadcaster: 'socket.io',
      // host: 'http://localhost:6001'
      host: 'https://26df58f7.ngrok.io'
    });

    // window.Echo.channel('huddle-resource-uploaded-'+this.huddle_id)
    //   .listen('BroadcastSibmeEvent', (data) => {
    //      let resource = data.data;
    //      console.log('From laravel echo: ', resource);
    //      this.artifacts.push(resource);
    // });

    window.Echo.channel('huddle-resource-renamed-'+this.huddle_id)
      .listen('BroadcastSibmeEvent', (data) => {
         let resource = data.data;
         console.log('From laravel echo: ', resource);
         _.extend(_.findWhere(this.artifacts, { id: resource.id }), resource);
    });*/

  }

  private processEventSubscriptions(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      console.log('websocket',data)
      switch (data.event) {
        case "resource_added":
          const condition = (data.reference_id) ? data.document_id == data.reference_id : true;
          if(condition){
            //console.log(data.allowed_participants,this.sessionData.user_current_account.User.id);
            if (this.isAllowed(data.allowed_participants) || (typeof data.allowed_participants === 'undefined') || data.allowed_participants.length == 0 || data.allowed_participants == undefined) {
              let should_wait = 0;
              if (data.is_video_crop) {
                should_wait = 1;
              }
              this.processResourceAdded(data.data, should_wait);
            }
          }
          break;

        case "resource_renamed":
          //this.isAllowed();
          this.processResourceRenamed(data.data, data.is_dummy,data);
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
    let that = this;
    let wait_time = 0;
    if (should_wait) {
      wait_time = 10000;
      resource.published = 0;
    }
    that.artifacts.push(resource);
    if (that.sessionData.user_current_account.User.id != resource.created_by && resource.doc_type !=4) {
      that.toastr.info(`${this.translation.artifact_newartifactadded}`);
    }
    if(this.resource_filter == 0){
      that.total_artifacts++;
    }else if((this.resource_filter == 1 && resource.doc_type == 1) || (this.resource_filter == 1 && resource.doc_type == 3 && resource.is_processed >= 4) || (this.resource_filter == 3 && resource.doc_type == 3 && resource.is_processed < 4)){
      that.total_artifacts++;
    }else if(this.resource_filter == 2 && resource.doc_type == 2){
      that.total_artifacts++;
    }
    // setTimeout(function () {
    //   // resource.published = 1;
    //   that.processResourceRenamed(resource, 1);
    // }, wait_time);


  }

  private processResourceDeleted(resource_id, deleted_by) {
    ;
    var indexOfMyObject = this.artifacts.findIndex(x => {
     return x.doc_id == resource_id || x.id == resource_id
    });

    if (indexOfMyObject > -1) {
      let obj = this.artifacts[indexOfMyObject];
      this.artifacts.splice(indexOfMyObject, 1);
      if (deleted_by != this.sessionData.user_current_account.User.id) {
        this.toastr.info(`${this.translation.artifact_artifactdeleted}`);
      }
    }
    this.total_artifacts--;
  }

  private processResourceRenamed(resource, dont_show_toast = 0,data?) {
    // _.extend(_.findWhere(this.artifacts, { doc_id: resource.document_id }), data);
    let objResource = _.find(this.artifacts, function (item) {
      return (parseInt(item.id) == parseInt(resource.id)) || parseInt(item.doc_id) == parseInt(resource.doc_id);
    });
    let index = -1;
    this.artifacts.forEach((item, i) => {
      //console.log(item.id, resource.id)
      if ((parseInt(item.id) == parseInt(resource.id)) || parseInt(item.doc_id) == parseInt(resource.doc_id)) {
        index = i;
      }

    });
    //console.log(index);

    if (objResource) {
      
      if(dont_show_toast == 1){
        this.artifacts[index].total_comments = resource.total_comments;
        this.artifacts[index].total_attachment = resource.total_attachment;
        if(data && data.live_video_event && data.live_video_event == "1"){
        this.artifacts[index].video_is_saved = resource.video_is_saved;
        this.artifacts[index].doc_type = resource.doc_type;
        this.artifacts[index].published = resource.published;
        this.artifacts[index].thubnail_url = resource.thubnail_url;
        this.artifacts[index].video_duration = resource.video_duration;
        }
        console.log('resource: ',resource);
       
      }else{
        this.artifacts[index] = resource;
        resource.video_duration == -1 ?  this.artifacts[index].video_duration=0 : ''; //change the duration 0 of unsaved video after rename
          objResource.title.slice(0, 25)
          //console.log(this.sessionData.user_current_account.User.id, resource.updated_by);
          if (this.sessionData.user_current_account.User.id != (resource.updated_by || resource.last_edit_by)) {
            
            if (objResource.title.length > 25) {
              this.toastr.info("'" + objResource.title + `'... ${this.translation.artifact_renamedto} '` + resource.title + "'...");
            } else {
              this.toastr.info("'" + objResource.title + `' ${this.translation.artifact_renamedto} '` + resource.title + "'");
          }
        }
      }
    }
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

    let ref = this.homeService.GetBreadcrumbs(obj).subscribe((data: any) => {
      if (data.success == -1) {
        this.toastr.info(data.message);

        setTimeout(() => {
          this.fullRouter.navigate(['/list'])
        }, 4000);

      }
      else {
        let huddleObj=data[data.length - 1]; 
        this.huddle_name = huddleObj ? huddleObj.folder_name :  data[0].folder_name;
        data.push({
          folder_name: this.translation.artifacts_breacrum,
          folder_id: data[0].folder_id,
          // folder_id: ["/huddle", "details", data[0].folder_id, "home"],
          isCustom: true
        });

        this.discussionService.SetBreadcrumbs(data);
      }


      // data.push({ folder_name: "Today", folder_id: -1 });
      // console.log("this");
      // this.homeService.Breadcrumbs.emit(data);
      //console.log('============home body--------',this.huddle_name);
      //
      // this.homeService.Breadcrumbs.emit(data);
      this.homeService.updateBreadcrumb(data)

    });
  }


  // delete huddle 
  public OnHuddleEdit(huddle_id) {
		let str = '';

		// if (event.type === 'assessment')
		// 	str = "/add_huddle_angular/assessment/edit/" + event.huddle_id;
		// else
			str = "/add_huddle_angular/edit/" + huddle_id;

		this.fullRouter.navigate([str])

  }

 
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

			obj.huddle_id = this.DeletableItem;
          let sessionData: any = this.headerService.getStaticHeaderData();
          obj.user_id = sessionData.user_current_account.User.id;
			this.homeService.DeleteItem(obj, false).subscribe((d: any) => {

				this.hideDeleteHuddleModal();

				if (d.success) {
          this.toastr.info(d.message);
          this.fullRouter.navigate(['/video_huddles/list'])
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
    this.showMomeoptions=true
    //this.OnFolderMove(huddle_id)
    this.moveHuddleModal.show();
  }
 
  hideMoveHuddleModal(): void {
    this.showMomeoptions=false

    this.moveHuddleModal.hide();
  }

  public OnFolderClick(folder_id, tree) {
		// ;
		// tree.treeModel.getActiveNode().data
		// console.log(folder_id);

	}
  
  public OnFolderMove(folder_id) {
    let isHuddle=true;
   let hType= this.huddle_type

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
/**
 * GetCirqliveData 
 */ 
public GetCirqLiveData(artifactsData) {
 
  if(artifactsData && artifactsData.huddle_type != 3 && !this.artifactsDataLoaded){
    this.artifactsDataLoaded = true;
    // this.detailsService.cirqliveData$.subscribe(
    //   data => {
    //     this.cirqLiveData = data;
    //   });
  
    // if (this.cirqLiveData && this.cirqLiveData.auth_key) {
    // console.log("in if of home");
    // return;
    // }else{
    // console.log("in else of home");  
  
    let userInfoForCirq ={
    userId: artifactsData.user_info.id,
    userFirstName: artifactsData.user_info.first_name,
    userLastName: artifactsData.user_info.last_name,
    userCourseId: artifactsData.huddle_info[0].account_folder_id,
    userCourseName: encodeURIComponent(artifactsData.huddle_info[0].name),
    userRole: (artifactsData.role_id == 200 && artifactsData.users_accounts.role_id !=125) ? 'teacher' : 'student',
  }
 
  this.detailsService.GetCirqLiveData().subscribe((data) => {
  this.cirqLiveData = data;
  if(this.cirqLiveData){
  this.cirqLiveData={...this.cirqLiveData,...userInfoForCirq};
  this.detailsService.updateCirqliveData(this.cirqLiveData);// send data to service for using in other components
 // this.getUpcomingEvents(this.cirqLiveData);
  }else{
    this.detailsService.updateCirqliveData('disabled');
  }
  });
//}
}
}

/**Get upcoming events/conferences */
/*public getUpcomingEvents(data){
  let obj:any ={
    key:data.auth_key,
    secret:data.auth_secret,
    api_root_url:data.api_root_url,
    lti_zoom_key:data.lti_zoom_key,
    course_id:data.userCourseId
  }
this.detailsService.getUpcomingEvents(obj).subscribe((eventData:any) => {
let eData =JSON.parse(eventData.data);
});
}*/


}

/////////////////////////////////



interface Modals {
  [key: string]: any;
}
