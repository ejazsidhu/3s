import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { HeaderService } from '@projectModules/app/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WorkspaceHttpService, PermissionsService } from '../services';
import { ToastrService } from 'ngx-toastr';
// import { template } from '@angular/core/src/render3';
import * as _ from "underscore";
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { Subscription } from 'rxjs';
// import { PermissionsService } from '@workspace/child-modules/services';
// import { PermissionsService } from '../permissions.service';
//import { NgbModal, NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sharepopup',
  templateUrl: './sharepopup.component.html',
  styleUrls: ['./sharepopup.component.css']
})
export class SharepopupComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild('renameModal', {static: false}) renameModal: ModalDirective;
  @ViewChild('deleteModal', {static: false}) deleteModal: ModalDirective;
  @ViewChild('emailModal', {static: false}) emailModal: ModalDirective;
  @ViewChild('shareModal', {static: false}) shareModal: ModalDirective;
  @ViewChild('cropModal', {static: false}) cropModal: ModalDirective;
  @ViewChild('activity', {static: false}) activity: ModalDirective;
  @ViewChild('resourceshareModal', {static: false}) resourceshareModal: ModalDirective;
  @Input('artifact') artifact: any = {};
  @ViewChild('assetsShare', { static: true }) assetsShare: ModalDirective;

  selectedArtifact: any = {}
  activetieList: any = [];
  emailForm: any = {};
  sessionData: any = {};
  public sliderValues: any = {

    min: 0,
    max: 10,
    range: [0, 10]

  }
  shareButtonFlag:boolean= false;
  delete: any;
  isTrimming: boolean = false;
  fileToUpload: any;
  attachmentName: any;
  public counter = 0;
  public ShareToLibreryTab: boolean = true;
  public commentsharing: boolean = true;
  public huddlesrecord;
  public isActive = 't1';
  public ShareToVideoLibrary: boolean = false;
  public copy_comments: boolean = false;
  public search_Huddle_Input;
  public search_Account_Input;
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  public temporaryrename;
  public renameField;
  public isEnable: boolean = false
  popupisloading: boolean;
  shareSkeleton: boolean;
  public translation: any = {};
  private subscription: Subscription;
  doShareAssets: any=false;
  duplicateIsinProcess: boolean=false;
  constructor(
    public headerService: HeaderService,
    private workService: WorkspaceHttpService,
    private toastr: ToastrService,
    public permissionService: PermissionsService) {
      this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
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
    }
    this.emailForm = {};
    this.sessionData = {};
    this.sessionData = this.headerService.getStaticHeaderData();
    // this.translation = this.sessionData.language_translation; // changed to observable stream

  }
  ngAfterViewInit() {
    this.handleVideoEvents();
  }
  private handleVideoEvents() {

    document.getElementById(`artifact_${this.artifact.doc_id}`).addEventListener('canplay', (e: any) => {

      let duration = Math.floor(e.target.duration);

      if (this.sliderValues.max === duration) return;

      this.sliderValues = {

        min: 0,
        max: duration,
        range: [0, duration],
        duration: duration

      }

    })


  }
  ngOnChanges(value: SimpleChanges) {
    this.selectedArtifact = value.artifact.currentValue;
    this.emailForm.subject = this.selectedArtifact.name;

    this.renameField = this.selectedArtifact.title;
    this.temporaryrename = this.renameField;
    //console.log('change value', this.emailForm.subject);
    //this.artifactModel=this.artifact;

  }
  public OnPreviewVideo(range) {

    let selector: any = document.getElementById(`artifact_${this.artifact.doc_id}`);

    [selector.currentTime] = range;//JSON.parse(JSON.stringify(this.sliderValues.range));
    selector.play();

    this.sliderValues.range = range;

    let stopTime = (((range[2] + 1) - range[1]) * 1000);
    let timer = setInterval(() => {
      if (!selector.paused) {
        if (selector.currentTime > range[1]) {

          selector.pause();
          selector.currentTime = range[0];
          clearInterval(timer);

        }

      }
    });
    this.playImageRemover()
    this.cropModal.onHide.subscribe(() => {
      selector.pause();
    })

  }
  playImageRemover() {
    let selector: any = document.getElementById(`artifact_${this.artifact.doc_id}`);
    this.cropModal.onHide.subscribe(() => {
      selector.pause();
    })
    document.getElementById("ply_butn").style.display = "none"
  }
  public OnTrim(range) {

    this.isTrimming = true;
    let id = this.artifact.account_folder_id//0;//this.detailService.GetParams();

    this.workService.TrimVideo(this.artifact.doc_id, id, { startVideo: parseFloat(range[0] + ".00").toFixed(2), endVideo: parseFloat(range[1] + ".00").toFixed(2), workspace: 1 }).subscribe((data: any) => {

      this.isTrimming = false;

      this.toastr.info(`${this.translation.workspace_videorequestdesc}`);
      // next thre lne for new trim rule iplementting
    let sessionData: any = this.headerService.getStaticHeaderData();
    let user_id= sessionData.user_current_account.User.id;
      this.headerService.afterWorkspaceTrim(this.artifact.doc_id,data["document"].doc_id, parseFloat(range[0] + ".00").toFixed(2),parseFloat(range[1] + ".00").toFixed(2),user_id).subscribe(data=>{
        // console.log('after workspace trim',data)
      })


      if (data["document"]) data["document"].doc_type = 1;

      //this.workService.AppendToArtifacts(data["document"]);

      this.sliderValues.range = [0, this.sliderValues.duration];


      let count;                    //artifact count updation
      count = this.workService.getTotalAritifactCount();
      count = count + 1;
      //this.workService.setTotalAritifactCount(count);

      this.hideModal("crop");

    })
  }
  public getFormattedTime(totalSeconds) {

    let [hours, minutes, seconds] = [0, 0, 0];
    hours = this.getPadding(Math.floor(totalSeconds / 3600));
    totalSeconds %= 3600;
    minutes = this.getPadding(Math.floor(totalSeconds / 60));
    seconds = this.getPadding(totalSeconds % 60);

    return `${hours}:${minutes}:${seconds}`;

  }
  private getPadding(n) {

    return n.toString().length == 1 ? `0${n}` : n;

  }

  DownloadResource(res) {

    let sessionData: any = this.headerService.getStaticHeaderData();
    if (res.static_url && false) {
      // this is creating CORS
      // this.workService.DownloadFileFromUrl({ url: res.static_url, title: res.title });

    } else {
      let obj: any = {};
      obj.document_id = res.doc_id;
      obj.account_id = res.account_id;
      ({
        User: {
          id: obj.user_id
        }
      } = sessionData.user_current_account);

      this.workService.DownloadResource(obj);
    }
    this.toastr.info(`${this.translation.workspace_yourfileisdownloading}`)



  }

  EmailSubmit(flag) {
    // let obj = { document_id: this.artifactModel.id, huddle_id: this.artifactModel.account_folder_id, user_id: 0 };

    // ({
    //   User: {
    //     id: obj.user_id
    //   }
    // } = this.sessionData.user_current_account);

    if (flag == 0) {

      this.emailForm = {};
      // this.modalRef.hide();
      this.hideModal('email')
      return;

    } else {

      if (this.emailForm.email.indexOf(",") > -1) {

        let valid = true;

        let arr = this.emailForm.email.split(",");

        arr.forEach((e) => {

          if (!this.isValidEmail(e)) {
            valid = false;
          }


        });

        if (!valid) {
          this.toastr.info("Please provide valid Emails separated by comma.");
          return;
        }

      } else {
        if (!this.isValidEmail(this.emailForm.email)) {
          this.toastr.info("Please provide valid Email address.");
          return;
        }
      }

      if (!this.emailForm.subject) {

        this.toastr.info("Please provide Email subject.");
        return;

      }

      // console.log('email object', this.emailForm);
      let obj: any = {
        huddle_id: this.artifact.account_folder_id,
        video_id: this.artifact.id,
        account_id: this.artifact.account_id,
        email: this.emailForm.email || "",
        subject: this.emailForm.subject || "",
        message: this.emailForm.message || "",
        additional_attachemnt: this.fileToUpload

      }
      let q = this.emailForm.attachment

      this.workService.SendEmail(obj).subscribe(data => {
     
        let d: any = data
        this.toastr.success(d.message);
        this.emailForm = {};

        this.hideModal('email')
      }, error => {
 
        this.toastr.error(error.message)

      })
    }
  }
  setFile(files) {


    if (files[0].size > 2000000) {
      this.toastr.info(`${this.translation.workspace_filetoolargefilemustbelessthanmegabytes}`);
      // files[0].nativeElement.reset();
      // ref.value = "";
      return;
    } else {
      // this.files = files[0];
      this.fileToUpload = files[0];
      this.attachmentName = this.fileToUpload.name
    }
  }



  DuplicateResource(res: any, is_scripted_notes?: number) {
    //console.log('duplicate called', res)
    let sessionData: any = this.headerService.getStaticHeaderData();
    //let doc_type= this.workService.getWorkspaceArtifects
    let obj: any = {};
    // {"document_id":"288503","account_folder_id":[150013],"current_huddle_id":"150013","account_id":"2936","user_id":"18737","copy_notes":1} {}
    obj.document_id = res.document_id;
    obj.account_folder_id = [res.account_folder_id];
    obj.current_huddle_id = res.account_folder_id;
    obj.account_id = res.account_id;
    obj.copy_notes = 1;
    obj.workspace = true;
    obj.from_workspace = 1;
    obj.doc_type = res.doc_type;
    obj.is_duplicated = true;
    obj.shareAssets=this.doShareAssets
    // if(res.is_scripted_note==1){
    //   obj.is_scripted_note=1;
    // }
    if (res.doc_type == 3 && res.is_processed < 4) {
      obj.is_scripted_note = 1;
    }

    ({
      User: {
        id: obj.user_id
      }
    } = sessionData.user_current_account);

    this.workService.DuplicateResource(obj).subscribe(data => {
      let d: any = data
      if (d.success) {
        this.duplicateIsinProcess = false;
        
        if(d.data.file_type != "mp3" && d.data.file_type!='aiff' && d.data.file_type!='m4a' && d.data.file_type!='ogg' && d.data.file_type!='wav' && d.data.file_type!='wma'){
          this.toastr.success(d.message);
        }
        else {
          this.toastr.success(this.translation.audio_duplicate_successfully);
        }
        


        let count;                    //artifact count updation
        count = this.workService.getTotalAritifactCount();
        count = count + 1;
        //this.workService.setTotalAritifactCount(count);

      }
      else {
        this.toastr.info(d.message, `${this.translation.workspace_duplicateconfimation}`)

      }
    }, error => {
      // console.log('duplicate error', error)
      this.toastr.error(error.message)

    });
  }
  deleteVideo() {
    this.isEnable = true;
    this.delete = 'DELETE';
    let sessionData: any = this.headerService.getStaticHeaderData();
    let obj = {
      huddle_id: this.artifact.account_folder_id,
      video_id: this.artifact.doc_id,
      user_id: sessionData.user_current_account.User.id,
      account_id: this.sessionData.user_current_account.accounts.account_id,
      workspace: 1

    }
    if (this.delete == "DELETE") {
      this.counter = 1;
      this.workService.deleteArtifact(obj).subscribe((d: any) => {
        if (d.success == true) {
         
          this.delete = ''
          this.removeItem(this.artifact.id);
          this.deSelectDelete();
          let count;
          count = this.workService.getTotalAritifactCount();
          count = count - 1;
          // this.workService.setTotalAritifactCount(count);
           //this.deleteModal.hide();
           let type = this.headerService.isAValidAudio(this.artifact.file_type);
           
          if (this.artifact.doc_type == 1 && type==false) {
            this.toastr.info(`${this.translation.workspace_videohasbeendeleted}`);
          }else if (this.artifact.doc_type == 1 && type==true) {
            this.toastr.info(`${this.translation.workspace_audio_hasbeendeleted}`);
          }

          else if (this.artifact.doc_type == 2) {
            this.toastr.info(`${this.translation.workspace_resourcehasbeendeleted}`);
          } else if (this.artifact.doc_type == 3 && this.artifact.is_processed < 4){
            this.toastr.info(`${this.translation.workspace_scriptednotehasbeendeleted}`);
          } else if (this.artifact.doc_type == 3 && this.artifact.is_processed >= 4){
            this.toastr.info(`${this.translation.workspace_videohasbeendeleted}`);
          }

        }
      })
    } else {
      this.toastr.info('Please Type Delete for Deleting Artifact', 'Delete Error')
    }

  }
  SubmitRename() {

    this.isEnable = true;

    // console.log(strObj)
    if (this.renameField == '' || this.renameField.trim() == "") {
      if (this.artifact.doc_type == 1) {
        this.toastr.info(`${this.translation.workspace_videonameshouldnotbeempty}`);
        this.isEnable = false;
      } else if (this.artifact.doc_type == 2) {
        this.toastr.info(`${this.translation.workspace_resourcenameshouldnotbeempty}`);
        this.isEnable = false;
      } else {
        this.toastr.info(`${this.translation.workspace_scriptednotenameshouldnotbeempty}`);
        this.isEnable = false;
      }
    } else {
      this.selectedArtifact.title = this.renameField.trim();
      // console.log("submit", this.artifactModel.title);
      let obj = {
        title: this.selectedArtifact.title,
        document_id: String(this.selectedArtifact.id),
        huddle_id: this.selectedArtifact.account_folder_id,
        user_id: this.sessionData.user_current_account.User.id,
        account_id: this.sessionData.user_current_account.accounts.account_id,
        workspace: 1,
        doc_id: this.selectedArtifact.doc_id
      };
      if (obj.title) {
        this.workService.RenameResourceTitle(obj).subscribe(data => {
          // console.log('data', data)
          let d: any = data;
          let messagee = d.message || `${this.translation.workspace_titlechangedsuccessfully}`
          if (d.success) {
            this.toastr.success(`${this.translation.workspace_titlechangedsuccessfully}.`)

            // this.toastr.success(message, 'Rename title')
            this.hideModal('rename');
            this.isEnable = false;
            // let that = this;


          }
          else {
            this.toastr.info(d.messagee, `${this.translation.workspace_renametitle}`)
            this.isEnable = false;
          }
        }, error => {
          // console.log('error', error);
          this.toastr.info(error.message, `${this.translation.workspace_renametitle}`)
          this.isEnable = false;
        })
      }
    }

  }
  removeItem(value) {

    let arr = this.workService.list;

    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (arr[index].id === value) {
        arr.splice(index, 1);
      }

    }

  }


  showModal(value, libraryShow?, commentShow?,scripted_notes?): void {
    switch (value) {
      case 'rename':
        this.renameModal.show();
        break;
      case 'delete':
        this.deleteModal.show();
        break;
      case 'email': {
        // console.log(this.selectedArtifact,'open modal')
        this.emailForm.subject = this.selectedArtifact.name;
        this.fileToUpload = {}
        this.emailModal.show();
        break;
      }

      case 'share':
        //if(libraryShow==false && commentShow==false){
        this.isActive = 't1';
        this.ShareToLibreryTab = libraryShow;
        this.commentsharing = commentShow;
        //}
        this.getHuddles();
        this.search_Account_Input = '';
        this.search_Huddle_Input = '';
        this.shareModal.show();
        let that = this;
        this.shareModal.onHide.subscribe(() => {
          that.deSelectCheckbox();
        });
        break;
      case 'crop':
        document.getElementById("ply_butn").style.display = "inherit"
        this.cropModal.show();
        break;
      case 'activity':
        this.activetieList = []
        this.popupisloading = true
        this.getActivities();
        this.activity.show();
        break;

      // case 'resourceshare':
      // this.resourceshareModal.show();
      // break;  

    }

    setTimeout(() => {

      window.dispatchEvent(new Event('resize'));

    }, 1000);
  }

  hideModal(value): void {

    switch (value) {
      case 'rename':
        this.renameModal.hide();
        this.isEnable = false;
        break;
      case 'delete':
        this.deleteModal.hide();
        break;
      case 'email':
        this.emailModal.hide();
        this.emailForm = {}
        this.fileToUpload = {}
        break;
      case 'share':
        this.isActive = 't1';
        this.deSelectCheckbox();
        this.shareModal.hide();
        this.search_Account_Input = '';
        this.search_Huddle_Input = '';
        break;
      case 'crop':
        this.cropModal.hide();
        break;
      case 'activity':
        this.activity.hide();
        break;
      case 'resourceshare':
        this.resourceshareModal.hide();
        break;

    }
  }
  private isValidEmail(email) {

    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());

  }

  getHuddles() {
    this.huddlesrecord = []
    this.shareSkeleton = true
    let obj: any = {
      user_id: this.sessionData.user_current_account.User.id,
      account_id: this.sessionData.user_current_account.accounts.account_id,

    };
    this.workService.getHuddlesForCopy(obj).subscribe((data: any) => {
      this.huddlesrecord = data;
      this.huddlesrecord.all_huddles = this.huddlesrecord.all_huddles.filter(huddles => {
        // if (this.artifact.doc_type == 1 || (this.artifact.doc_type == 3 && this.artifact.is_processed >= 4) || (this.artifact.doc_type == 2 && huddles.meta_data_value != '3') || (this.artifact.doc_type == 3 && this.artifact.is_processed < 4 && huddles.meta_data_value != '3')) {
        if (huddles.meta_data_value != '3') {
          return huddles;
        }
      })
      this.huddlesrecord.all_accounts = this.huddlesrecord.all_accounts.filter(accounts => {
        if ((this.sessionData.user_current_account.users_accounts.account_id != accounts.account_id && accounts.parmission_access_my_workspace == 1)) {
          return accounts;
        }
      })
      this.shareSkeleton = false
    });
  }

  getActivities() {

    let x: any = this.headerService.getStaticHeaderData()
    // this.user_id = x.user_current_account.users_accounts.user_id;


    let obj = {
      user_id:x.user_current_account.User.id,
      account_id: x.user_current_account.users_accounts.account_id,
      user_current_account: x.user_current_account,
      workspace: 1
    };

    this.workService.GetAcivities(obj).subscribe(data => {
      //console.log('activitie',data);
      this.activetieList = data;
      this.popupisloading = false
    }, error => {
      //console.log('activitie eror',error)


    })

  }

  setIsActive(value) {
    this.isActive = value;
  }
  timedateSpanish(timedate,index){
    let d = timedate.split(',')
    if(index==1) return d[0]
    if(index==2) {
    let dd = timedate.split(' ')
    console.log(dd)
    return dd[3]+' '+dd[4]
    }
  }
  public TriggerTextChange(event) {
    if (this.counter == 0) {
      if (event.keyCode == 13) {
        this.deleteVideo();

      }
    }
  }

  public shareArtifact() {
    
    this.shareButtonFlag=true
    let selected_huddles = [];
    let selected_accounts = [];

    selected_huddles = _.where(this.huddlesrecord.all_huddles, { selected: true });
    selected_accounts = _.where(this.huddlesrecord.all_accounts, { selected: true });

    if (selected_huddles.length > 0 || this.ShareToVideoLibrary) {
      let sessionData: any = this.headerService.getStaticHeaderData();
      var ids = selected_huddles.map((ac) => { return ac.account_folder_id });
      if (this.ShareToVideoLibrary) {
        ids.push("-1");
      }
      let obj:any = {                //for copy in huddles and lib

        document_id: this.artifact.doc_id,
        //this.artifactModel.id,
        account_folder_id: ids,
        current_huddle_id: this.artifact.account_folder_id,      //this.params.huddle_id,
        account_id: sessionData.user_current_account.accounts.account_id,
        user_id: sessionData.user_current_account.User.id,
        copy_notes: this.copy_comments,
        doc_type: this.artifact.doc_type,
        from_workspace: 1
        //copy_notes: this.CopyData.CopyComments?1:0
      }
  if(this.artifact.doc_type==3 && (this.artifact.is_processed<4 )){
        // maing copy comment always true for scripted notes
        obj.copy_notes=true;
        obj.is_scripted_note = true;
      }
      if(this.artifact.doc_type==3 && (this.artifact.is_processed==4 || this.artifact.is_processed==5)){
        obj.doc_type=1;
      }
      this.workService.copyVideoToHuddlesAndLib(obj).subscribe((data: any) => {
        {

          this.toastr.info(data.message).onTap.subscribe(() => this.routeRefresh());;
          this.deSelectCheckbox();
          //if(data.success)
          this.hideModal('share');
          this.shareButtonFlag = false;

          // this.huddlesrecord.all_huddles.forEach((h)=>{h.selected = false;});
          // if(this.selected_library){
          //   this.selected_library=false;
          // }

        }
      });

    }

    if (selected_accounts.length > 0) {
      let sessionData: any = this.headerService.getStaticHeaderData();
      var ids = selected_accounts.map((ac) => { return ac.account_id });
      let obj = {                        //for copy in account

        account_ids: ids,
        document_id: this.artifact.doc_id,
        user_id: sessionData.user_current_account.User.id,
        copy_notes: this.copy_comments,
        from_workspace: 1,
        workspace: true
        //copy_notes: this.CopyData.CopyComments?1:0

      }

      if(this.artifact.doc_type==3 && (this.artifact.is_processed<4 )){
        // maing copy comment always true for scripted notes
        obj.copy_notes=true
        // obj.is_scripted_note = true;
      }
      this.workService.copyVideoToAccounts(obj).subscribe((data: any) => {
        {

          this.toastr.info(data.message);
          if (data.success)
            this.hideModal('share')
            this.shareButtonFlag = false;

        }
        this.deSelectCheckbox();
        //this.huddlesrecord.all_accounts.forEach((h)=>{h.selected = false;})
        selected_accounts = [];
      });

    }
    if (selected_accounts.length == 0 && selected_huddles.length == 0 && !this.ShareToVideoLibrary) {
      this.toastr.info(`${this.translation.workspace_pleaseselectanyhuddlelibraryaccounttoshare}`)
      this.shareButtonFlag = false;
    }


  }
  public routeRefresh() {
    this.ngOnInit();
  }

  public deSelectDelete() {
    this.deleteModal.hide();
    this.isEnable = false;
    let that = this;
    setTimeout(function () {
      that.counter = 0;
    }, 500);
  }
  public deSelectCheckbox() {
    this.huddlesrecord.all_huddles.forEach((h) => { h.selected = false; });
    this.huddlesrecord.all_accounts.forEach((h) => { h.selected = false; });
    this.ShareToVideoLibrary = false;
    this.copy_comments = false;
  }
  disableClick() {
    setTimeout(function () {
      //that.counter=0;
    }, 1000);
  }

  duplicateResourceNow(value){
    this.duplicateIsinProcess = true;
    if(value==1)
    this.doShareAssets=true;
    this.DuplicateResource(this.selectedArtifact)
    this.hideAssetsShare();
    

  }
 
  showAssetsShare(artifact): void {
    this.selectedArtifact=artifact;
    this.assetsShare.show();
  }
 
  hideAssetsShare(): void {
    this.assetsShare.hide();
    this.doShareAssets=false
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
