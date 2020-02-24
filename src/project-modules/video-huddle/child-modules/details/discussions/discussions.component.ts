import { Component, OnInit, ViewChild, TemplateRef, EventEmitter, OnDestroy } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { ActivatedRoute, Router } from "@angular/router";
import { DetailsHttpService } from "../servic/details-http.service";
import { ToastrService } from "ngx-toastr";
import { HeaderService, HomeService, AppMainService } from "@projectModules/app/services";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { DiscussionService } from "../servic/discussion.service";
import IUpload from "./IUpload";
import { environment } from "@environments/environment";
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import * as moment from 'moment';
@Component({
  selector: "discussions",
  templateUrl: "./discussions.component.html",
  styleUrls: ["./discussions.component.css"]
})
export class DiscussionsComponent implements OnInit, OnDestroy, IUpload {
  @ViewChild("addDiscussion", { static: false }) addDiscussion;
  // @ViewChild("editDiscussion", {static: false}) editDiscussion;
  @ViewChild("delete", { static: false }) delete;
  @ViewChild("popupModal", { static: false }) popModal;
  @ViewChild("activity", { static: true }) activity;
  @ViewChild("participantsModal", { static: false }) participantsModal;
  @ViewChild("uploader", { static: false }) uploader;
  private searchInput: Subject<string> = new Subject();
  public ModalRefs: Modals;
  SearchString: any = "";
  rootPath = environment.baseUrl;
  public editoroptions: Object = {
    heightMin: 200,
    pluginsEnabled: [
      "fontFamily",
      "paragraphFormat",
      "paragraphStyle",
      "link",
      "colors",
      "file",
      "lists"
    ],
    toolbarButtons: [
      "fontFamily",
      "|",
      "bold",
      "italic",
      "underline",
      "color",
      "|",
      "insertLink",
      "insertFile",
      "|",
      "formatOL",
      "formatUL"
    ]
  };
  dicussions: any = [];
  selectedDiscussion: any = {};
  confirmDeleteString: string = "";
  huddle_id: number = 0;
  addDiscData = {
    title: "",
    comment: ""
  };
  editDiscData:any = {};
  Loadings: any = {};
  page: number = 0;
  actvities: any = [];
  participents: any = [];
  sort: any = "";
  huddle_name;
  public editorOptions;
  public DiscussionFiles: any = [];
  public layout: string = "";
  popupIsLoading: boolean;
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  isthisDetail: any = false;
  public translation: any = {};
  public translationLoaded: boolean = false;
  private subscription: Subscription;
  public header_data;
  public userAccountLevelRoleId: number | string = null;
  public addBtnPermissionLoaded: boolean = false;
  public unsavedDiscussionId = -1;
  public addDiscussionTAArray= [];
  public cirqLiveData:any;
  viewerObj: any = {}
  // tempArray: any = [];
  private DISCUSSION_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.DISCUSSION;
  private addDiscussionLSKey: string = '';
  private addDiscussionTAKey: string = '';
  thumb_image: any;
  public sessionData:any;

  constructor(
    public appMainService:AppMainService,
    public toastr: ToastrService,
    private modalService: BsModalService,
    private ARouter: ActivatedRoute,
    public detailService: DetailsHttpService,
    public headerService: HeaderService,
    private fullRouter: Router,
    private homeService: HomeService,
    private discussionService: DiscussionService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      this.translationLoaded = true;
    });
  }
  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.ARouter.params.subscribe(p => {
      this.huddle_id = +p["id"];
      this.getArfifactsForTemp(this.huddle_id);
      this.detailService.SetParams(p);
      this.initEditorOptions();
      this.GetCirqLiveData();

      this.addDiscussionLSKey = `${this.DISCUSSION_LS_KEYS.ADD}${this.huddle_id}_${this.headerService.getUserId()}`;
      this.addDiscussionTAKey = `${this.DISCUSSION_LS_KEYS.ADD_TA}${this.huddle_id}_${this.headerService.getUserId()}`;
    });

    // to be deleted soon
    // var abc = localStorage.getItem(`unsaved_discussions_array${this.huddle_id}`);
    //   var new_obj = JSON.parse(abc);
    //   if(new_obj!=null || new_obj!=undefined){
    //     new_obj.forEach(x => {
    //       this.tempArray.push(x); 
    //     });
         
    //   }
      
    this.detailService.discussionEmitter.subscribe((data:any)=>{
      let formData = this.discussionService.ToFormData(data);

      for (let i = 0; i < this.DiscussionFiles.length; i++) {
        formData.append("attachment[]", this.DiscussionFiles[i]);
      }

      this.discussionService.AddDiscussion(formData).subscribe((d: any) => {

        this.detailService.removeUnsavedDiscussion(data);
        this.toastr.info(d.message);
        // console.log(data);
        this.addDiscData = {
          title: "",
          comment: ""
        };
      }, err => {
        data.processing = false;
      }); 
    })
    
    this.discussionService.dDemit.subscribe(d => {
      this.isthisDetail = d
    })
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
    this.ModalRefs = {};

    if (this.activity.lenght == 0) {
    }

    this.getBreadCrumbs();
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;

    /** Restore  and set add discussion localstorage object start */
    let lsAddDiscussionObj = this.headerService.getLocalStorage(this.addDiscussionLSKey);
    if(lsAddDiscussionObj){
      this.addDiscData.title = lsAddDiscussionObj.title ? lsAddDiscussionObj.title : "";  
      this.addDiscData.comment = lsAddDiscussionObj.comment ? lsAddDiscussionObj.comment : "";  
    }
    /** Restore  and set add discussion localstorage object end */

    /** Restore  and set add discussion try again array start */
    let taAddDiscussionArray = this.headerService.getLocalStorage(this.addDiscussionTAKey);
    if(Array.isArray(taAddDiscussionArray)) this.addDiscussionTAArray = taAddDiscussionArray;
    /** Restore  and set add discussion try again array end */
    this.headerService.currentUserImage$.subscribe(data=>{
      this.thumb_image=data.replace(/^.*[\\\/]/, '');
          })
    window.onbeforeunload = () => this.ngOnDestroy(); // listen to the events like refresh or tab close

  }

  // checkLayout() {
  //   // setInterval(() => {
  //   //   this.layout =
  //   //     this.fullRouter.url.indexOf("list") > 0 ? "list" : "details";
  //   // }, 1000);
  // }
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
            queryParams: { search: this.SearchString },
            queryParamsHandling: "merge"
          });
        } else {
          this.fullRouter.navigate([], {
            queryParams: { search: null },
            queryParamsHandling: "merge"
          });
        }
        this.search();
      });
  }

  setQueryparams(param) {
    this.fullRouter.navigate([], {
      queryParams: { sort: param },
      queryParamsHandling: "merge"
    });
  }

  public initEditorOptions() {
    this.editorOptions = this.discussionService.GetEditorOptionsAdd();
  }

  public onUpload(e) {
    let target = e.target;
    target.files.length > 0 && this.pushToFiles(target.files);
    target.value = "";
  }

  private pushToFiles(files) {
    for (let i = 0; i < files.length; i++) {
      this.DiscussionFiles.push(this.parseFile(files[i]));
    }
  }

  public search() {
    // this.initVars(true, true);
    // this.LoadNextPage(this.params.folder_id, false);
  }

  private parseFile(file: any) {
    // let file = event.target.files[0];
    const name = file.name + file.name.substring(file.name.lastIndexOf("."));
    return new File([file], name, { type: file.type });
  }

  public OnSearchChange(event) {
    this.searchInput.next(event);
  }

  public Onclickonparticipant() {
    this.ShowParticipentsModal(this.participantsModal, "lg_popup");
    this.detailService.GetParticipentsList(this.huddle_id);
    this.participents = [];
    this.popupIsLoading = true;
    // this.actvities = this.detailService.getActivitiesList();
    this.detailService.getParticientslist().subscribe(d => {
      this.participents = d;
      this.popupIsLoading = false;
      //console.log("par  par apar", this.participents)
    });
  }

  public ShowParticipentsModal(template: TemplateRef<any>, class_name) {
    this.ModalRefs.participentsModal = this.modalService.show(template, {
      ignoreBackdropClick: true,
      class: class_name
    });
  }

  public Onclickactivity() {
    this.ShowParticipentsModal(this.activity, "lg_popup");
    this.actvities = [];
    this.popupIsLoading = true;
    this.detailService.getAcitives(this.huddle_id);
    this.detailService.getActivitiesList().subscribe(d => {
      this.actvities = d;
      this.popupIsLoading = false;
      // console.log("bal bla bla", this.actvities)
    });
  }

  public OpenModal(modelName) {
    this.popModal.showModal(modelName);
  }
  getDiscussions(id: number) {
    this.Loadings.isNextPageLoading = true;
    let obj = {
      huddle_id: id
    };
    this.detailService.GetDiscussions(obj).subscribe(
      data => {
        // console.log("discussions", data);
        let res: any = data;
        this.dicussions = res;
        this.Loadings.isNextPageLoading = false;
      },
      error => { }
    );
  }

  private getArfifactsForTemp(huddleId: number){
    let sessionData: any = this.headerService.getStaticHeaderData();

    let {
      user_current_account: {
        accounts: { account_id },
        User: { id: user_id },
        roles: { role_id }
      }
    } = sessionData;

    let obj: any = {
      huddle_id: huddleId,
      account_id, //sessionData.user_current_account.accounts.account_id,
      user_id, //sessionData.user_current_account.User.id,
      role_id, //sessionData.user_current_account.roles.role_id,
      //  user_current_account: sessionData.user_current_account
    };

    this.detailService.GetArtifacts(obj).subscribe((data: any) => {
      if (data.success) {
        this.viewerObj = {
          role_id: data.role_id,
          huddle_type: data.huddle_type
        };
        this.addBtnPermissionLoaded = true;

      } else {
        this.toastr.error(data.message);
        this.fullRouter.navigate(["/list"]);
      }
    }, error => {
      this.toastr.error(error.message);
      this.fullRouter.navigate(["/list"]);
    });

  }

  ConfirmDelete() {
    let obj:any = {
      discussion_id: this.selectedDiscussion.id
    };
    this.confirmDeleteString = 'DELETE';
    if (this.confirmDeleteString === "DELETE") {
      const params = this.detailService.GetParams();
      obj.huddle_id = params.id;
     
      this.appMainService.DeleteDiscussion(obj).subscribe(
        data => {
          let d: any = data;
          if (d.success) {
            // this.toastr.success(
            //   this.translation.discussion_discussion_deleted_successfully
            // );
          } else {
            this.toastr.info(d.message);
          }
          this.ModalRefs.participentsModal.hide();
          this.selectedDiscussion = {};
          this.getDiscussions(this.huddle_id);
        },
        error => {
          this.toastr.error(error.message);
        }
      );
    } else
      this.toastr.info(
        this.translation.discussion_please_enter_delete_to_confirm
      );
  }

  AddDiscussionSubmit() {

    this.headerService.removeLocalStorage(this.addDiscussionLSKey);

    var x = this.addDiscData.comment

    x = x.toString().replace(/<.*?>/g, "");

    if (this.addDiscData.title.trim() == "" || this.addDiscData.comment.trim() == "" || this.addDiscData.comment.trim() == null || x == "" || x.trim() == "") {
      this.toastr.info(this.translation.discussion_fields_cannot_be_empty);
    } else {
      if (this.DiscussionFiles.length) {
        let result = this.headerService.checkFileSizeLimit(this.DiscussionFiles);
        if (!result.status) {
          this.toastr.error(result.message);
          return;
        }
      }
      let sessionData: any = this.headerService.getStaticHeaderData(),
        obj: any = {
          huddle_id: this.huddle_id,
          user_current_account: sessionData.user_current_account,
          title: this.addDiscData.title,
          comment: this.addDiscData.comment,
          send_email: true,
          notification_user_ids: "",
          commentable_id: null,
          fake_id:moment(new Date()).format('x')

        };

      ({
        User: { id: obj.user_id },
        accounts: { account_id: obj.account_id }
      } = sessionData.user_current_account);

      let formData = this.discussionService.ToFormData(obj);

      for (let i = 0; i < this.DiscussionFiles.length; i++) {
        formData.append("attachment[]", this.DiscussionFiles[i]);
      }

      this.addDiscData = { title: "", comment: "" };
      this.detailService.getFlag(this.prepareDummyDiscussion(obj,sessionData));
      // this.discussionService.AddDiscussion(formData).subscribe((data: any) => {

      this.appMainService.AddDiscussion(formData).subscribe((data: any) => {
        // this.toastr.info(data.message);
        // this.detailService.getFlag(data[0]); 
      },
      (error)=>{
        obj.first_name = sessionData.user_current_account.User.first_name;
        obj.last_name = sessionData.user_current_account.User.last_name;
        obj.id= this.unsavedDiscussionId+new Date().getTime();
        obj.uuid= new Date().getTime();
        obj.tryAgain = true;
        obj.thumb_image = `${environment.baseUrl}/img/home/photo-default.png`;
        this.addDiscussionTAArray.push(obj);
        this.headerService.setLocalStorage(this.addDiscussionTAKey, this.addDiscussionTAArray)
        this.detailService.getFlag(obj); 
      });

      this.ModalRefs.participentsModal.hide();
    }
  }

  // EditDiscussion() { }
  prepareDummyDiscussion(comment,sessionData){
    debugger
    console.log(this.thumb_image)
    let obj: any = {
      huddle_id: comment,
      user_current_account: sessionData.user_current_account,
      title:comment.title,
      comment: comment.comment,
      send_email: true,
      notification_user_ids: "",
      commentable_id: null,
      fake_id:comment.fake_id,
      image: this.thumb_image,
      user_id:sessionData.user_current_account.User.id,
      thumb_image: this.thumb_image
    };

 
// debugger
    return obj;
  }

  addDiscussion_popup() {
    this.DiscussionFiles = [];
    this.ShowParticipentsModal(this.addDiscussion, "lg_popup");
  }

  editDiscussion_popup(item: any) {
    // this.editDiscData = item;
    // this.ShowParticipentsModal(this.editDiscussion, "lg_popup");
    //this.editDiscussion.show();
  }

  deleteDiscussion_popup(item: any) {
    this.selectedDiscussion = item;
    this.ShowParticipentsModal(this.delete, "sm_popup");
  }

  // public ShowParticipentsModal(template: TemplateRef<any>, class_name) {
  //   this.ModalRefs.participentsModal = this.modalService.show(template, { class: class_name });

  // }
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

        // this.huddle_name = data[0].folder_name;

        let dataDeepCopy = JSON.parse(JSON.stringify(data));
        
        let folderName = dataDeepCopy[dataDeepCopy.length - 1].folder_name;
        let folderId = dataDeepCopy[dataDeepCopy.length - 1].folder_id;
        let breadCrumbToAdd = { folder_name: this.translation.discussion_breacrum, folder_id: folderId, isCustom: true };
        
        this.huddle_name = folderName;

        data.push(breadCrumbToAdd)

        this.discussionService.SetBreadcrumbs(data);
      }


      // data.push({ folder_name: "Today", folder_id: -1 });
      // console.log("this");
      // this.homeService.Breadcrumbs.emit(data);
      this.homeService.updateBreadcrumb(data)
      //console.log('data.length: ', data.length)

      //console.log('============home body--------',this.huddle_name);
      //
      //this.homeService.Breadcrumbs.emit(data);
    });
  }
  public exportDiscussion() {
    this.discussionService.exportDiscussionTrigger();
  }

  public cancelAddDiscussionModal(){
    this.ModalRefs.participentsModal.hide();
    this.addDiscData = { title: "", comment: "" };
    this.headerService.removeLocalStorage(this.addDiscussionLSKey);
  }

  private saveAddDiscussionToLocalStorage (): void {
    if(this.addDiscData.title || this.addDiscData.comment){
      let obj = {title: this.addDiscData.title, comment: this.addDiscData.comment};
      this.headerService.setLocalStorage(this.addDiscussionLSKey, obj);
    }
  }
  public GetCirqLiveData(){
  this.detailService.cirqliveData$.subscribe(
    data => {
      this.cirqLiveData = data;
    });
    console.log('this.cirqLiveData: ',this.cirqLiveData);
    if (this.cirqLiveData == 'disabled' || (this.cirqLiveData && this.cirqLiveData.auth_key)) {
      console.log('in if disabled or already have data');
    }else{
      console.log('in else of disc for again request');
      this.subscription.add(this.detailService.GetCirqLiveData().subscribe((cirQdata) => {
        this.cirqLiveData = cirQdata;
        let obj={
          huddle_id: this.huddle_id,
          account_id:this.sessionData.user_current_account.accounts.account_id, 
          user_id:this.sessionData.user_current_account.User.id, 
          role_id:this.sessionData.user_current_account.roles.role_id, 
        }
        if (this.cirqLiveData) {
        this.detailService.GetArtifacts(obj).subscribe((data: any) => {
          console.log('top of disc',this.cirqLiveData)
          let userInfoForCirq ={
            userId: data.user_info.id,
            userFirstName: data.user_info.first_name,
            userLastName: data.user_info.last_name,
            userCourseId: data.huddle_info[0].account_folder_id,
            userCourseName: encodeURIComponent(data.huddle_info[0].name),
            userRole: (data.role_id == 200 && data.users_accounts.role_id !=125) ? 'teacher' : 'student',
          }
          this.cirqLiveData={...this.cirqLiveData,...userInfoForCirq};
          this.detailService.updateCirqliveData(this.cirqLiveData);// send data to service for using in other components
        });
      }else{
        this.detailService.updateCirqliveData('disabled');
      }
      }));
    }
  }
  ngOnDestroy() {

    this.saveAddDiscussionToLocalStorage();

    this.subscription.unsubscribe();
    if (this.ModalRefs && this.ModalRefs.participentsModal) this.ModalRefs.participentsModal.hide();
  }
}

interface Modals {
  [key: string]: any;
}
