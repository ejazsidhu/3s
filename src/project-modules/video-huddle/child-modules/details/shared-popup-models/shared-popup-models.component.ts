import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, EventEmitter, OnDestroy } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { DetailsHttpService } from '../servic/details-http.service';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from "@projectModules/app/services";
import { ActivatedRoute } from "@angular/router";
import * as _ from "underscore";
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { PermissionService } from '../servic/permission.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'shared-popup-models',
  templateUrl: './shared-popup-models.component.html',
  styleUrls: ['./shared-popup-models.component.css']
})
export class SharedPopupModelsComponent implements OnInit, OnDestroy, OnChanges {


  @ViewChild('renameModal', { static: false }) renameModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal: ModalDirective;
  @ViewChild('emailModal', { static: false }) emailModal: ModalDirective;
  @ViewChild('shareModal', { static: false }) shareModal: ModalDirective;
  @ViewChild('cropModal', { static: false }) cropModal: ModalDirective;
  @ViewChild('activity', { static: false }) activity: ModalDirective;
  @ViewChild('participants', { static: false }) participants: ModalDirective;
  @ViewChild('shareResource', { static: false }) shareResource: ModalDirective;
  @ViewChild('renameTitle', { static: false }) renameTitle: any;
  @Input('artifact') artifact: any = {};
  @ViewChild('assetsShare', { static: false }) assetsShare: ModalDirective;

  artifactModel: any = {};
  confirmDelete: any = '';
  sessionData: any = {};
  emailForm: any = {};
  fileToUpload: any;
  attachmentName: any = '';
  isActive = 't1';
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";

  public isTrimming: boolean = false;
  public notResourceShare: boolean = true;
  public sliderValues: any = {

    min: 0,
    max: 10,
    range: [0, 10]

  }


  public manualRefresh: EventEmitter<any> = new EventEmitter<any>();
  actvities: any = [];
  participents: any = [];

  public videoShareFlag: boolean = false;

  public huddlesrecord;
  //public selected_huddles;
  public selected_library = false;
  //public selected_account; 
  public params;
  public copy_comments = false;
  public parameters;
  public videos;
  rename: any = '';
  artifacts: any = [];
  public search_Huddle_Input;
  public search_Account_Input;
  public search_videos_Input;
  sort: any;
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  isitNotes: boolean = false;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  doShareAssets: any = false;
  duplicateIsinProcess = false;

  constructor(public toastr: ToastrService,
    private detailService: DetailsHttpService,
    public headerService: HeaderService, private route: ActivatedRoute,
    public permissionService: PermissionService) {
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
    this.artifactModel = {};
    this.confirmDelete = '';
    this.sessionData = {};
    this.emailForm = {};
    this.parameters = {};
    this.sessionData = this.headerService.getStaticHeaderData();
    // this.actvities = this.detailService.getActivitiesList();
    // this.participents = this.detailService.getParticientslist();
    //console.log(this.detailService.getResource(),'resource');
    this.parameters = this.detailService.getParams();
    // console.log("actiities share modal",this.actvities );

    this.detailService.getArtifactList().subscribe(val => {
      //console.log('value from event emiter',val)
      this.artifacts = val
    });

    this.artifacts = this.detailService.list;


    this.route.queryParams.subscribe(params => {
      params.sort
        ? (this.sort = params.sort)
        : (this.sort = "");
    })

    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream

  }
  ImageUrlBuilder(participent: any) {
    let image = participent.image || "assets/video-huddle/img/c1.png";
    let url = `${this.staticImageServiceIp}${participent.user_id}/${
      participent.image
      }`;
    return participent.image ? url : image;
  }

  setIsActive(value) {
    this.isActive = value;
  }
  ngAfterViewInit() {
    this.handleVideoEvents();
  }
  ngOnChanges(value: SimpleChanges) {
    // console.log("current artiface",value.artifact.currentValue);
    // console.log("current artiface", this.artifact);
    this.artifactModel = this.artifact;


    this.emailForm = {
      subject: this.artifactModel.title,
      email: ''
    }
    // this.emailForm.
    this.rename = this.artifactModel.title


  }
  timedateSpanish(timedate, index) {
    let d = timedate.split(',')
    if (index == 1) return d[0]
    if (index == 2) {
      let dd = timedate.split(' ')
      console.log(dd)
      return dd[3] + ' ' + dd[4]
    }
  }

  public rangeChanged(r) {

    // console.log(r);

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
    let id = this.detailService.GetParams();

    this.detailService.TrimVideo(this.artifact.doc_id, id, { startVideo: parseFloat(range[0] + ".00").toFixed(2), endVideo: parseFloat(range[1] + ".00").toFixed(2) }).subscribe((data: any) => {

      this.isTrimming = false;

      this.toastr.info(this.translation.artifacts_video_request_has_been_submitted);
      // next thre lne for new trim rule iplementting
      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      this.headerService.afterHuddleTrim(this.artifact.doc_id, data["document"].doc_id, parseFloat(range[0] + ".00").toFixed(2), parseFloat(range[1] + ".00").toFixed(2), user_id, id).subscribe(data => {
        // console.log('after workspace trim',data)
      })

      if (data["document"]) data["document"].doc_type = 1;

      //this.detailService.AppendToArtifacts(data["document"]);

      this.sliderValues.range = [0, this.sliderValues.duration];

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

  setFile(files) {


    if (files[0].size > 2000000) {
      this.toastr.info(this.translation.artifacts_file_to_large);
      // files[0].nativeElement.reset();
      // ref.value = "";
      return;
    } else {
      // this.files = files[0];
      this.fileToUpload = files[0];
      this.attachmentName = this.fileToUpload.name
    }
  }

  triggerInterval() { }

  updateTitle(art) {

    let item = this.artifacts.findIndex(d => d.id == art.document_id);
    if(this.artifacts[item] && this.artifacts[item].title){
      this.artifacts[item].title = art.title;
      this.detailService.setArtifactlList(this.artifacts)
    }
    // this.artifacts[item].title = art.title;
    // this.detailService.setArtifactlList(this.artifacts)
  }

  SubmitRename() {
    let sessionData: any = this.headerService.getStaticHeaderData();
    //;
    // console.log("submit", this.artifactModel.title);this.artifactModel.original_file_name
    let obj = { title: this.rename.trim(), document_id: String(this.artifactModel.id), doc_id: String(this.artifactModel.doc_id), huddle_id: String(this.artifactModel.account_folder_id), user_id: sessionData.user_current_account.User.id };
    let strObj = JSON.stringify(obj)
    // console.log(strObj)
    if (obj.title.length !== 0) {
      this.detailService.RenameResourceTitle(strObj).subscribe(data => {
        // console.log('data', data)
        let d: any = data;
        this.updateTitle(obj)
        // this.rename=obj.title;

        let message = d.message || this.translation.artifacts_title_changed + `\n ${d.title}`
        if (d.success) {
          message.slice(0, 25)
          if (message.length > 25) {
            this.toastr.success(message + '.')
          } else {
            this.toastr.success(message)
          }
          this.hideModal('rename');

        }
        else {
          // this.artifactModel = this.artifact;
          this.toastr.info(d.message)

        }
      }, error => {
        // console.log('error', error);
        this.toastr.info(error.message)
      })
    }
    else {
      this.artifactModel.title = this.artifact.title;
      if (this.artifact.doc_type == 1) {
        this.toastr.info(this.translation.artifacts_video_name_Should_not_be_empty);
      } else if (this.artifact.doc_type == 2) {
        this.toastr.info(this.translation.artifacts_resource_name_should_not_be_empty);
      } else {
        this.toastr.info(this.translation.artifacts_scripted_note_name_should_not_be_empty);
      }
    }



  }

  removeItem(value) {

    let arr = this.detailService.list;

    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (arr[index].id === value) {
        arr.splice(index, 1);
      }

    }

  }

  SubmitDelete() {
    this.confirmDelete = 'DELETE';
    let obj = { document_id: this.artifactModel.doc_id, huddle_id: this.artifactModel.account_folder_id, user_id: 0, doc_type: this.artifactModel.doc_type };

    ({
      User: {
        id: obj.user_id
      }
    } = this.sessionData.user_current_account);
    // console.log("submit delete", this.confirmDelete, obj);
    if (this.confirmDelete === 'DELETE') {

      this.detailService.DeleteResource(obj).subscribe(data => {
        // console.log('data', data)

        let d: any = data;
        this.confirmDelete = '';
        if (d.success) {
          this.removeItem(obj.document_id);
          // this.toastr.success(this.translation.artifacts_delete_item_selected_is_delete);
          let type = this.headerService.isAValidAudio(this.artifact.file_type);
          if (this.artifact.doc_type == 1 && type == false) {
            this.toastr.info(`${this.translation.workspace_videohasbeendeleted}`);
          }
          else if (this.artifact.doc_type == 1 && type == true) {
            this.toastr.info(`${this.translation.workspace_audio_hasbeendeleted}`);
          }

          else if (this.artifact.doc_type == 2) {
            this.toastr.info(`${this.translation.workspace_resourcehasbeendeleted}`);
          } else if (this.artifact.doc_type == 3 && this.artifact.is_processed < 4) {
            this.toastr.info(`${this.translation.workspace_scriptednotehasbeendeleted}`);
          } else if (this.artifact.doc_type == 3 && this.artifact.is_processed >= 4) {
            this.toastr.info(`${this.translation.workspace_videohasbeendeleted}`);
          }
        }
        else {
          this.toastr.info(d.message)

        }
        this.hideModal('delete');


      }, error => {
        // console.log('error', error)
        this.toastr.error(error.message)


      })

    }
    else
      this.toastr.info(this.translation.artifacts_please_enter_delete);



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

      if (this.emailForm.email.length == 0) {
        this.toastr.info(this.translation.artifacts_please_provide_email)
        return;

      }
      else {
        if (this.emailForm.email.indexOf(",") > -1) {

          let valid = true;

          let arr = this.emailForm.email.split(",");

          arr.forEach((e) => {

            if (!this.isValidEmail(e)) {
              valid = false;
            }


          });

          if (!valid) {
            this.toastr.info(this.translation.artifacts_please_provide_valid_emails);
            return;
          }

        } else {
          if (!this.isValidEmail(this.emailForm.email)) {
            this.toastr.info(this.translation.artifacts_please_provide_email);
            return;
          }
        }
      }

      if (!this.emailForm.subject) {

        this.toastr.info(this.translation.artifacts_please_provide_email_subject);
        return;

      }

      // console.log('email object', this.emailForm);
      let obj: any = {
        huddle_id: this.artifactModel.account_folder_id,
        video_id: this.artifactModel.id,
        account_id: this.artifactModel.account_id,
        email: this.emailForm.email || "",
        subject: this.emailForm.subject || "",
        message: this.emailForm.message || "",
        additional_attachemnt: this.fileToUpload

      }
      let q = this.emailForm.attachment

      this.detailService.SendEmail(obj).subscribe(data => {
        // console.log('email resonse data', data)
        let d: any = data
        this.toastr.success(d.message);
        this.hideModal('email')
      }, error => {
        // console.log('email resonse error', error)
        this.toastr.error(error.message)

      })
    }
  }

  DownloadResource(res) {

    if (res.static_url && false) {//this was creating problems of CORS

      //this.detailService.DownloadFileFromUrl({ url: res.static_url, title: res.title });

    } else {
      let obj: any = {};
      obj.document_id = res.doc_id;
      obj.account_id = res.account_id;
      ({
        User: {
          id: obj.user_id
        }
      } = this.sessionData.user_current_account);

      this.detailService.DownloadResource(obj);
    }

    this.toastr.info(this.translation.artifacts_your_file_is_downloading)


  }

  DuplicateResource(res: any) {
    // 
    let obj: any = {};
    // {"document_id":"288503","account_folder_id":[150013],"current_huddle_id":"150013","account_id":"2936","user_id":"18737","copy_notes":1} {}
    obj.document_id = res.doc_id;
    obj.account_folder_id = [res.account_folder_id];
    obj.current_huddle_id = res.account_folder_id;
    obj.account_id = res.account_id;
    obj.copy_notes = 1;
    obj.is_duplicated = true;
    obj.shareAssets = this.doShareAssets
    obj.doc_type = res.doc_type;
    ({
      User: {
        id: obj.user_id
      }
    } = this.sessionData.user_current_account);

    this.detailService.DuplicateResource(obj).subscribe(data => {
      // console.log('duplicate data', data);
      let d: any = data;
      this.duplicateIsinProcess = false;

      // console.log('Sorting',this.sort)
      // if(this.sort == "uploaded_date"){
      // this.artifacts.unshift(d.data[0])    
      // this.detailService.setArtifactlList(this.artifacts)      
      // }else{
      let type = this.headerService.isAValidAudio(d.data.file_type);
      if (type == false) {
        this.toastr.info(d.message);
      }
      else {
        this.toastr.info(this.translation.audio_duplicate_successfully);
      }
      // }
    }, error => {
      // console.log('duplicate error', error)
      this.toastr.error(error.message)

    });
  }

  showModal(value): void {
    this.artifactModel = this.artifact;
    this.rename = this.artifactModel.title

    switch (value) {
      case 'rename':
        this.renameModal.show();
        break;
      case 'delete':
        this.deleteModal.show();
        break;
      case 'email':

        this.fileToUpload = {}
        this.emailModal.show();
        break;
      case 'share':
        //this.deSelectCheckbox();
        this.isActive = 't1'
        this.notResourceShare = true;
        this.getHuddles();
        this.search_Account_Input = '';
        this.search_Huddle_Input = '';
        this.shareModal.show();
        break;
      case 'crop':
        document.getElementById("ply_butn").style.display = "inherit"
        this.cropModal.show();
        break;
      // case 'activity':
      //   this.activity.show();
      // break;
      // case 'participants':
      //   this.participants.show();
      // break;
      case 'shareResource':
        this.isActive = 't1'
        this.notResourceShare = false;
        this.getHuddles();
        this.search_Account_Input = '';
        this.search_Huddle_Input = '';
        this.shareModal.show();
        break;
      case 'shareNotes':
        this.isActive = 't1'
        this.notResourceShare = false;
        this.isitNotes = true
        this.getHuddles();
        this.search_Account_Input = '';
        this.search_Huddle_Input = '';
        this.shareModal.show();
        break;

    }

    setTimeout(() => {

      window.dispatchEvent(new Event('resize'));

    }, 1000);
  }

  hideModal(value): void {

    (this.rename.length == 0) ? this.rename = this.artifactModel.original_file_name : ''

    // this.artifactModel = this.artifact;

    switch (value) {
      case 'rename':
        this.renameModal.hide();
        break;

      case 'delete':
        this.confirmDelete = '';
        this.deleteModal.hide();
        break;
      case 'email':
        this.fileToUpload = {}
        this.emailForm = {}
        this.emailModal.hide();
        break;
      case 'share':
        this.deSelectCheckbox();
        this.shareModal.hide();
        this.videoShareFlag = false;
        break;
      case 'crop':
        this.cropModal.hide();
        break;
      //   case 'activity':
      //   this.activity.hide();
      // break;
      // case 'participants':
      //   this.participants.hide();
      // break;
      case 'shareResource':
        this.deSelectVideoCheckbox();
        this.shareResource.hide();

      // default:
      //   break;
    }
  }
  private isValidEmail(email) {

    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());

  }

  getHuddles() {
    let obj: any = {
      user_id: this.sessionData.user_current_account.User.id,
      account_id: this.sessionData.user_current_account.accounts.account_id,

    };
    this.detailService.getHuddlesForCopy(obj).subscribe((data: any) => {
      // for (let t = 0; t < data.length; t++) {
      //   const x = data.all_huddles[t];
      //   x.selected = ''
      // }
      let indexCurrentHuddle = data.all_huddles.findIndex(item => item.account_folder_id == this.parameters)
      data.all_huddles.splice(indexCurrentHuddle, 1);

      this.huddlesrecord = data;
      this.huddlesrecord.all_huddles = this.huddlesrecord.all_huddles.filter(huddles => {
        if (huddles.meta_data_value != '3') {
          return huddles;
        }
      })
    });



  }

  getVideos() {
    let obj: any = {
      account_id: this.sessionData.user_current_account.accounts.account_id,
      account_folder_id: this.parameters

    };
    this.detailService.getVideos(obj).subscribe((data: any) => {

      this.videos = data;

    });


  }

  copyVideo() {
    this.videoShareFlag = true;
    let selected_huddles = [];
    let selected_account = [];
    // this.parameters=this.detailService.getParams();

    for (let i = 0; i < this.huddlesrecord.all_huddles.length; i++) {
      if (this.huddlesrecord.all_huddles[i].selected) {
        selected_huddles.push(this.huddlesrecord.all_huddles[i].account_folder_id)
      }
    }

    for (let i = 0; i < this.huddlesrecord.all_accounts.length; i++) {
      if (this.huddlesrecord.all_accounts[i].selected) {
        selected_account.push(this.huddlesrecord.all_accounts[i].account_id)
      }
    }

    if (selected_huddles.length > 0 || this.selected_library) {
      let sessionData: any = this.headerService.getStaticHeaderData();
      var ids = selected_huddles;
      if (this.selected_library) {
        ids.push("-1");
      }
      let obj: any = {                //for copy in huddles and lib

        document_id: this.artifactModel.doc_id,
        //this.artifactModel.id,
        account_folder_id: ids,
        current_huddle_id: this.parameters,      //this.params.huddle_id,
        account_id: sessionData.user_current_account.accounts.account_id,
        user_id: sessionData.user_current_account.User.id,
        copy_notes: this.copy_comments,
        doc_type: this.artifactModel.doc_type,
        //is_scripted_note: false
        //copy_notes: this.CopyData.CopyComments?1:0
      }

      if (this.isitNotes) {
        obj.copy_notes = true;
        obj.is_scripted_note = true;
      }
      this.detailService.copyVideoToHuddlesAndLib(obj).subscribe((data: any) => {
        {

          this.toastr.info(data.message).onTap.subscribe(() => this.routeRefresh());
          this.deSelectCheckbox();
          if (data.success) {
            this.hideModal('share');
            if (this.isitNotes) {
              this.isitNotes = false;
            }
          }
          else {
            this.videoShareFlag = false;
          }

          // this.huddlesrecord.all_huddles.forEach((h)=>{h.selected = false;});
          // if(this.selected_library){
          //   this.selected_library=false;
          // }

        }
      });
    }

    if (selected_account.length > 0) {

      let sessionData: any = this.headerService.getStaticHeaderData();
      var ids = selected_account;
      let obj = {                        //for copy in account

        account_ids: ids,
        document_id: this.artifactModel.doc_id,
        user_id: sessionData.user_current_account.User.id,
        copy_notes: this.copy_comments
        //copy_notes: this.CopyData.CopyComments?1:0

      }
      if (this.isitNotes) {
        obj.copy_notes = true;
        // obj.is_scripted_note = true;
      }
      this.detailService.copyVideoToAccounts(obj).subscribe((data: any) => {
        {

          this.toastr.info(data.message);
          if (data.success) {
            this.hideModal('share')
          }
          else {
            this.videoShareFlag = false;
          }
          // this.hideModal('share')

        }
        this.deSelectCheckbox();
        //this.huddlesrecord.all_accounts.forEach((h)=>{h.selected = false;})
        selected_account = [];
      });

    }

    if (selected_huddles.length == 0 && selected_account.length == 0 && !this.selected_library) {
      if (!this.notResourceShare) {
        this.toastr.info(this.translation.artifacts_please_select_huddle);
        this.videoShareFlag = false;
      } else {
        this.toastr.info(this.translation.artifacts_please_select_huddle_or_library);
        this.videoShareFlag = false;
      }
    }




  }
  routeRefresh() {
    this.ngOnInit();
  }
  shareResources() {
    // this.hideModal("shareResource");
    let selected_videos = [];
    selected_videos = _.where(this.videos.data, { selected: true });
    let video_ids = selected_videos.map((ac) => { return ac.id })
    //console.log("selected videos",video_ids);
    if (selected_videos.length > 0) {
      let obj = {
        document_id: this.artifactModel.doc_id,
        account_folder_id: this.parameters,
        associated_videos: (video_ids).join(",")
      }
      this.detailService.shareResourceToVideos(obj).subscribe((data: any) => {
        {
          this.toastr.info(data.message);
          this.deSelectVideoCheckbox()


        }
      });
    }
    if (selected_videos.length == 0) {
      this.toastr.info(this.translation.artifacts_please_select_at_least_on_video);
    }

    this.hideModal("shareResource");

  }

  deSelectCheckbox() {
    this.huddlesrecord.all_huddles.forEach((h) => { h.selected = false; });
    this.huddlesrecord.all_huddles.forEach((h) => { h.selected = false; });
    this.selected_library = false;
    this.copy_comments = false;

  }

  deSelectVideoCheckbox() {
    this.videos.data.forEach((h) => { h.selected = false; });
  }
  showAssetsShare(artifact): void {
    this.artifactModel = artifact;
    this.assetsShare.show();
  }

  hideAssetsShare(): void {
    this.assetsShare.hide();
    this.doShareAssets = false;

  }
  duplicateResourceNow(value) {
    this.duplicateIsinProcess = true;
    if (value == 1)
      this.doShareAssets = true;
    this.DuplicateResource(this.artifactModel)
    this.hideAssetsShare();


  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
