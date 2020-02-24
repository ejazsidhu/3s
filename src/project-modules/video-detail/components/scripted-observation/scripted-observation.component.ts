import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, Input } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';
import { ActivatedRoute, Router } from "@angular/router";
import { HeaderService, AppMainService } from "@app/services";
import * as _ from "underscore";
import { ToastrService } from "ngx-toastr";
import { MainService, PlayerService, ScrollService, CropPlayerService, ObservationService } from '@videoDetail/services';
import { environment } from "@environments/environment";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';

@Component({
  selector: 'video-detail-scripted-observation',
  templateUrl: './scripted-observation.component.html',
  styleUrls: ['./scripted-observation.component.css']
})
export class ScriptedObservationComponent implements OnInit, OnDestroy {

  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  @ViewChild('cropDialog', { static: true }) cropDialog;
  @Input() huddle_permission;

  public loaded: boolean = false;
  public src;
  public newComment;
  public settings;
  public VideoCurrentTime: any = 0;
  public VideoTotalTime;
  public comments = [];
  public colorClasses;
  public CustomMarkers;
  private selectedTag;
  public totals;
  public rubrics;
  public currentTab;
  public selectedRubrics;
  public ShowInfo;
  public VideoInfo: any = {};
  private params;
  private tags;
  private fakeCommentCount;
  private currentTimeInSeconds;
  private videoOptions;
  public staticFiles;
  public isPlaying;
  public currentComment;
  public EditMode;
  public editableRubrics;
  public EditableComment;
  public modalRef: BsModalRef;
  private DeletableFile;
  public EnablePublish;
  public PLTabData;
  public CopyData;
  public SelectedPLRubric;
  public PLcomments;
  public permissions: any = {};
  public isAuthenticatedUser;
  public currnetUser;
  public cropRange;
  public cropRangeSliderConfig;
  public cropStartValue;
  public cropEndValue;
  public videoEnd;
  public previousStart;
  public previousEnd;
  public captureCount = 0;
  public IsCropPlayerReady;
  public currentCopyTab;
  public isCroLoading;
  public frameworks;
  public VideoHuddleFramework = 0;
  public rubricPreview;
  public isVideoProcessing; //d
  public EditChanges;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  videoOldTime: any = [];
  public userAccountLevelRoleId: number | string = null;

  // Variables from vo-body
  public pageState: string = '';
  public CurrentTab;
  public enabledLoad: boolean = true;
  public options: any = {};
  private player;
  private interval_id;
  public conf;
  public scriptMode: boolean = false;
  public TempTime;
  public SearchFormOptions = { sorting: true, others: false, export: false };
  public FilteredCommentsCounts = 1;
  public showPublish: boolean = false;
  public VideoHuddleDefaultFramework = 0;
  public translationLoaded: boolean = false;
  workspace: any;
  searchTerm = '';
  public oldSyncNote: boolean = false;
  isCreater = true;


  constructor(
    private modalService: BsModalService,
    private scrollToService: ScrollService,
    private toastr: ToastrService,
    private headerService: HeaderService,
    public mainService: MainService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private playerService: PlayerService,
    private cropPlayerService: CropPlayerService,
    private deviceService: DeviceDetectorService,
    private observationService: ObservationService,
    private appMainService: AppMainService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      if (this.translation.vd_notes) {
        this.translationLoaded = true;
      }
    });
  }

  ngOnInit() {

    this.isAuthenticatedUser = false;
    this.settings = { EnterToPost: true, PauseWhileTyping: true };
    this.newComment = {};
    this.newComment.files = [];
    this.newComment.timeEnabled = true;
    this.totals = {};
    this.currentTab = 0;
    this.selectedRubrics = [];
    this.ShowInfo = false;
    this.tags = [];
    this.fakeCommentCount = 0;
    this.staticFiles = [];
    this.currentComment = {};
    this.EditMode = false;
    this.editableRubrics = [];
    this.EditableComment = {};
    this.totals.resources_count = 0;
    this.totals.comment_count = 0;
    this.CopyData = {};
    this.CopyData.searchHuddleText = "";
    this.CopyData.searchAccountText = "";
    this.CopyData.LibrarySelected = false;
    this.permissions.isEditingAllowed = 0;
    this.isCroLoading = false;
    this.EditChanges = {};
    this.VideoInfo.h_type = "2";
    this.colorClasses = ["#5db85b", "#38a0ff", "#ff5800", "#df0a00"]; //["q_circle", "i_circle", "b_circle", "r_circle"];
    this.videoOptions = {
      maxFiles: 20,
      accept: GLOBAL_CONSTANTS.RESOURCE_UPLOAD_EXTENSIONS,
      fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'url', 'onedrive']
    };
    this.cropRangeSliderConfig = {
      connect: [false, true, false],
      step: 1,
      range: {
        min: 1,
        max: 62
      }
    };

    // logic from VoBody
    this.activatedRoute.queryParams.subscribe(params => {
      params.workspace ? this.workspace = params.workspace : this.workspace = null;
    });

    this.header_data = this.headerService.getStaticHeaderData();

    // Dynamic Button Colors Start
    this.header_color = this.header_data.header_color;
    this.primery_button_color = this.header_data.primery_button_color;
    this.secondry_button_color = this.header_data.secondry_button_color;
    // Dynamic Button Colors End

    this.currnetUser = this.header_data.user_current_account.User;
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable streams
    // this.currnetUser.role_id = sessionData.user_current_account.roles.role_id;

    this.mainService.GetFrameworks().subscribe((frameworks) => {

      this.frameworks = frameworks;

      if (this.frameworks.length == 1) {

        setTimeout(() => {
          this.VideoHuddleFramework = this.frameworks[0].account_tag_id;
          //  this.rubricPreview = this.frameworks[0];
          this.ResolveAssignFramework(1, true);
        }, 3000);
        // this.permissions.framework_selected_for_video = "0";


      }

    });

    this.RunSubscribers();

  }


  private RunSubscribers() {
    // this.GetVideoDuration();

    // logic from vobody
    this.activatedRoute.url.subscribe((url) => {

      if (url && url[0] && url[0].path == "scripted_observations") {

        this.InitScriptMode();

      }

    });

    this.activatedRoute.params.subscribe((p) => {


      this.params = p;
      this.device_detector();
      this.handleParams(p);
    });

    this.mainService.SearchData.subscribe((data) => {

      this.filterComments(data);

    });

    this.mainService.PushableRubric.subscribe((r) => {

      if (this.EditMode) {
        this.EditChanges.changed_standards = true;
      }
      if (r.selected) {

        this.selectedRubrics.push(JSON.parse(JSON.stringify(r)));

      } else {

        this.selectedRubrics = this.selectedRubrics.filter((rub) => {

          return r.account_tag_id != rub.account_tag_id;

        });

      }

    });

    this.LoadPublishSettings();
    this.GetCopyData();

  }

  //D
  // private GetVideoDuration() {

  //   this.mainService.GetVideoDuration(this.params.video_id).subscribe((data) => {

  //     // console.log(data);
  //     if (data != -1) {
  //       this.VideoTotalTime = Number(data);
  //     }


  //   });

  // }

  public Seek(val) {

    if (val == "All Video" || val == 0) return;
    this.playerService.Seek.emit(this.FormatToSeconds(val));

  }

  public init_crop() {
    if (this.params.init_crop && this.params.init_crop == 1) {

      // this.cropDialog;
      let that = this;
      setTimeout(() => {

        if (that.src && that.src.path) {
          // clearInterval(interval_id);
          that.InitiateCropDialog(that.cropDialog);
        }

      });


    }
  }

  public GetCopyData() {

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {

      user_id: sessionData.user_current_account.User.id,
      account_id: sessionData.user_current_account.accounts.account_id

    }

    this.mainService.GetCopyData(obj).subscribe((data) => {

      this.CopyData = data;

      if (this.CopyData.all_huddles && this.CopyData.all_huddles.length > 0) {
        this.onSearchHuddleChange("");
      }

      if (this.CopyData.all_accounts && this.CopyData.all_accounts.length > 0) {
        this.onSearchAccountChange("");
      }



    })

  }

  public GetRubricById(framework_id, assign?) {

    if (!framework_id) {
      this.rubricPreview = {};
      return;
    }

    if (framework_id) {
      let obj = {
        framework_id: framework_id
      };


      this.mainService.GetRubricById(obj).subscribe((rubrics: any) => {

        this.rubricPreview = rubrics.data;
        if (assign) {

          this.rubrics = this.rubricPreview;

        }

      });
    }



  }

  public onSearchHuddleChange(newVal) {

    if (this.CopyData.searchHuddleText == '' || !this.CopyData.searchHuddleText) {

      this.CopyData.all_huddles.forEach((h) => {

        h.valid = true;

      });

      return;

    }

    this.CopyData.all_huddles.forEach((h) => {

      h.valid = h.name.toLowerCase().indexOf(this.CopyData.searchHuddleText.toLowerCase()) > -1;

    });

    this.UpdateMatches();
  }

  private UpdateMatches() {

    this.CopyData.huddles_matched = _.where(this.CopyData.all_huddles, { valid: true }).length;
    this.CopyData.accounts_matched = _.where(this.CopyData.all_accounts, { valid: true }).length;

  }

  public ResolveCopyVideo(flag) {

    if (flag == 0) {

      if (this.CopyData.all_huddles) {

        this.CopyData.all_huddles.forEach((h) => { h.selected = false; })
      }

      if (this.CopyData.all_accounts) {

        this.CopyData.all_accounts.forEach((ac) => { ac.selected = false; })
      }

      this.CopyData.LibrarySelected = false;

      this.modalRef.hide();


    } else {

      let selectedAccounts = _.where(this.CopyData.all_accounts, { selected: true });

      let selectedHuddles = _.where(this.CopyData.all_huddles, { selected: true });

      if ((selectedHuddles && selectedHuddles.length > 0) || this.CopyData.LibrarySelected) {

        let ids = selectedHuddles.map((ac) => { return ac.account_folder_id; });

        let sessionData: any = this.headerService.getStaticHeaderData();

        if (this.CopyData.LibrarySelected) { ids.push("-1") }

        let obj = {

          document_id: this.params.video_id,
          account_folder_id: ids,
          current_huddle_id: this.params.huddle_id,
          account_id: sessionData.user_current_account.accounts.account_id,
          user_id: sessionData.user_current_account.User.id,
          copy_notes: this.CopyData.CopyComments ? 1 : 0

        }

        this.mainService.CopyToHuddlesAndLib(obj).subscribe((data: any) => {

          {

            this.toastr.info(data.message);

          }

        });

      }

      if (selectedAccounts && selectedAccounts.length > 0) {

        let ids = selectedAccounts.map((ac) => { return ac.account_id; });

        let sessionData: any = this.headerService.getStaticHeaderData();

        let obj = {

          account_ids: ids,
          document_id: this.params.video_id,
          user_id: sessionData.user_current_account.User.id,
          copy_notes: this.CopyData.CopyComments ? 1 : 0

        }
        this.modalRef.hide();
        this.mainService.CopyToAccounts(obj).subscribe((data: any) => {

          {

            this.toastr.info(data.message);

          }

        });

      }

      if (selectedAccounts.length == 0 && selectedHuddles.length == 0 && !this.CopyData.LibrarySelected) {
        this.toastr.info(this.translation.vd_select_huddle_to_copy);
      }

      this.ResolveCopyVideo(0);
    }

  }

  public onSearchAccountChange(newVal) {

    if (this.CopyData.searchAccountText == '' || !this.CopyData.searchAccountText) {

      this.CopyData.all_accounts.forEach((ac) => {

        ac.valid = true;

      });

      return;

    }

    this.CopyData.all_accounts.forEach((ac) => {

      ac.valid = ac.company_name.toLowerCase().indexOf(this.CopyData.searchAccountText.toLowerCase()) > -1;;

    });
    this.UpdateMatches();
  }

  private LoadPublishSettings() {

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {

      huddle_id: this.params.huddle_id,
      user_id: sessionData.user_current_account.User.id,
      video_id: this.params.video_id

    };

    this.appMainService.GetPublishSettings(obj).subscribe((data: any) => {

      this.EnablePublish = data.show_publish_button;

    });

  }

  public ResolvePublish(flag) {

    this.modalRef.hide();

    if (flag == 1) {

      let sessionData: any = this.headerService.getStaticHeaderData();

      let obj = {

        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        user_id: sessionData.user_current_account.User.id,
        account_id: sessionData.user_current_account.accounts.account_id,
        account_role_id: sessionData.user_current_account.users_accounts.role_id,
        current_user_email: sessionData.user_current_account.User.email

      };


      this.mainService.PublishFeedback(obj).subscribe((data: any) => {

        if (data.status) {

          this.EnablePublish = false;

          this.toastr.info(this.translation.feedback_published);

        }

      });

    }

  }

  public PublishFeedback(template) {

    this.modalRef = this.modalService.show(template, { class: 'modal-md' });

  }

  public InitiateCopyDialog(template: TemplateRef<any>, file) {
    // this.DeletableFile = file;

    this.modalRef = this.modalService.show(template, { class: "modal-md model-copy" });
  }

  public InitiateCropDialog(template: TemplateRef<any>, file?) {

    let that = this;

    this.playerService.ModifyPlayingState("pause");

    if (document.getElementsByTagName("modal-container").length < 1) {
      this.isCroLoading = true;

      setTimeout(() => {

        this.isCroLoading = false;
        this.cropRange = [0, 0];
        this.cropStartValue = "00:00";
        this.cropEndValue = "00:00";
        this.modalRef = this.modalService.show(template, { class: "modal-lg model-crop", backdrop: 'static', animated: false });
        (document.querySelector('modal-container') as HTMLElement).addEventListener('click', function () {
          that.hideCropModal();
        });
        (document.querySelector('.modal-content') as HTMLElement).addEventListener('click', function (e) {
          e.stopPropagation();
        });

      }, 1000);



    }
    else {
      (document.querySelector('bs-modal-backdrop') as HTMLElement).style.display = "block";
      (document.querySelector('modal-container') as HTMLElement).style.display = "block";
      (document.querySelector('body') as HTMLElement).style.overflow = "hidden";
    }

  }
  public hideCropModal() {
    (document.querySelector('bs-modal-backdrop') as HTMLElement).style.display = "none";
    (document.querySelector('modal-container') as HTMLElement).style.display = "none";
    (document.querySelector('body') as HTMLElement).style.overflow = "visible";

  }
  public TrimVideo() {
    // console.log("Trimming...");
    if (this.cropRange[0] == this.cropRange[1]) {
      console.log(this.translation);
      alert(this.translation.please_select_range);
    }
    else {
      this.mainService.TrimVideo(this.params.video_id, this.params.huddle_id, { startVideo: parseFloat(this.cropRange[0] + ".00").toFixed(2), endVideo: parseFloat(this.cropRange[1] + ".00").toFixed(2) }).subscribe((data: any) => {
        // console.log(data);
        let path: any;// = location.pathname;
        // path = path.split('/');
        // let huddle = path[path.length - 2];
        path = environment.baseUrl + "/Huddles/view/" + this.params.huddle_id;
        console.log(path);
        location.href = path;
      });
    }
  }

  public CaptureTotalTime(VideoTotalTime) {
    // console.log("VTT:"+ VideoTotalTime);
    if (this.captureCount == 0) {
      let videoStart = 0;
      let videoEnd = Math.floor(this.VideoTotalTime) || Math.floor(VideoTotalTime);
      this.videoEnd = videoEnd;
      let that = this;
      this.cropRangeSliderConfig.range.min = videoStart;
      this.previousStart = videoStart;
      this.cropRangeSliderConfig.range.max = videoEnd;

      this.previousEnd = videoEnd;
      this.cropRange = [videoStart, videoEnd];
      this.convertValuesToTime([videoStart, videoEnd], 0);
      this.convertValuesToTime([videoStart, videoEnd], 1);
      this.videoEnd = this.cropEndValue;
      setTimeout(() => {
        that.IsCropPlayerReady = true;
      }, 1000);

    }
    this.captureCount++;
  }
  public onCropSliderChange(ev) {
    let handle = 0;
    if (this.previousEnd != ev[1]) {
      handle = 1;
    }
    if (handle == 0) {
      this.cropPlayerService.SeekTo(ev[0], 0);
    }
    else {
      this.cropPlayerService.SeekTo(ev[1], 0);
    }
    this.convertValuesToTime(ev, handle);
    this.previousStart = ev[0];
    this.previousEnd = ev[1];
  }
  convertValuesToTime(values, handle) {
    let hours = 0,
      minutes = 0,
      seconds = 0;

    if (handle === 0) {
      hours = this.convertToHour(values[0]);
      minutes = this.convertToMinute(values[0], hours);
      seconds = this.convertToSecond(values[0], minutes, hours);
      this.cropStartValue = this.formatHoursAndMinutes(hours, minutes, seconds);
      return;
    }

    hours = this.convertToHour(values[1]);
    minutes = this.convertToMinute(values[1], hours);
    seconds = this.convertToSecond(values[1], minutes, hours);
    this.cropEndValue = this.formatHoursAndMinutes(hours, minutes, seconds);

  }

  convertToHour(value) {
    return Math.floor(value / 3600);
  }
  convertToMinute(value, hour) {
    return (Math.floor(value / 60) - (hour * 60));
  }
  convertToSecond(value, minute, hour) {
    return (value - (minute * 60) - (hour * 3600));
  }
  formatHoursAndMinutes(hours, minutes, seconds) {
    if (hours.toString().length == 1) hours = '0' + hours;
    if (minutes.toString().length == 1) minutes = '0' + minutes;
    if (seconds.toString().length == 1) seconds = '0' + seconds;
    if (hours == '00' || hours == 0) {
      return minutes + ':' + seconds;
    }
    else {
      return hours + ':' + minutes + ':' + Math.floor(seconds);
    }
  }
  public CropPreviewVideo() {
    this.cropPlayerService.ModifyPlayingState(["play", this.cropRange[0], this.cropRange[1]]);
  }

  public InitiateDeleteResource(template: TemplateRef<any>, file) {

    this.DeletableFile = file;
    this.modalRef = this.modalService.show(template, { class: "modal-md" });


  }

  public onReplyEdit(commentObj) {

    console.log(commentObj);
    let sessionData: any = this.headerService.getStaticHeaderData();
    let user_id = sessionData.user_current_account.User.id;
    let account_id = sessionData.user_current_account.accounts.account_id;
    let huddle_id = this.params.huddle_id;
    let obj = {
      huddle_id: huddle_id,
      account_id: account_id,
      comment_id: commentObj.reply.id,
      videoId: this.params.video_id,
      for: "",
      synchro_time: '',
      time: (this.newComment.timeEnabled) ? this.currentTimeInSeconds : 0,
      ref_type: '2',
      comment: commentObj.reply.EditableText,
      user_id: user_id,
      standards_acc_tags: "",
      default_tags: "",
      assessment_value: "",
      account_role_id: sessionData.user_current_account.users_accounts.role_id,
      current_user_email: sessionData.user_current_account.User.email
    };

    this.appMainService.EditComment(obj).subscribe((data: any) => {

      if (data.status == "success") {

        let parentIndex = _.findIndex(this.comments, { id: commentObj.comment.id });
        let found = false;
        if (parentIndex > -1) {

          let index = _.findIndex(this.comments[parentIndex].Comment.responses, { id: commentObj.reply.id });

          if (index > -1) {
            found = true;
            this.comments[parentIndex].Comment.responses[index].comment = commentObj.reply.EditableText;
            this.comments[parentIndex].Comment.responses[index].EditEnabled = false;
            this.mainService.ReRenderMarkers.emit(true);
          }

        }

        if (!found) {

          this.comments.forEach((c) => {

            if (c.Comment.responses) {

              c.Comment.responses.forEach((r) => {

                let index = -1;
                if (r.responses)
                  index = _.findIndex(r.responses, { id: commentObj.reply.id });

                if (index > -1) {

                  r.responses[index].comment = commentObj.reply.EditableText;
                  r.responses[index].EditEnabled = false;

                }

              });

            }

          });

        }

      }

    });


  }

  public ResolveDeleteFile(flag, id?) {

    if (flag == 0) {
      this.modalRef.hide();
    } else {
      if (this.modalRef)
        this.modalRef.hide();
      let sessionData = this.headerService.getStaticHeaderData();

      let obj = {
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        document_id: id ? id : this.DeletableFile.id,
        user_id: sessionData.user_current_account.User.id,
      }

      this.mainService.DeleteResource(obj).subscribe((data: any) => {

        if (!data.error) {
          this.toastr.info(this.translation.resource_deleted);
          let index = _.findIndex(this.staticFiles, { id: id ? id : this.DeletableFile.id });
          if (index > -1) {
            this.staticFiles.splice(index, 1);
            this.totals.resources_count--;
          }

        }

      });

    }

  }

  public UploadResource(file, wholeVideo?, commentId?) {

    if (wholeVideo) file.time = 0;
    let sessionData: any = this.headerService.getStaticHeaderData();
    let obj: any = {
      huddle_id: this.params.huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      video_id: this.params.video_id,
      stack_url: file.url,
      video_url: file.key,
      video_file_name: file.filename,
      video_file_size: file.size,
      video_desc: "",
      current_user_role_id: sessionData.user_current_account.roles.role_id,
      current_user_email: sessionData.user_current_account.User.email,
      url_stack_check: 1,
      account_role_id: sessionData.user_current_account.users_accounts.role_id


    };

    if (commentId) {

      let comment = _.findWhere(this.comments, { id: commentId });

      if (comment)
        obj.time = comment.time;
      obj.comment_id = commentId;
    }

    //else file.time =
    if (!obj.time && obj.time != 0) obj.time = this.FormatToSeconds(file.time);
    this.appMainService.UploadResource(obj).subscribe((data: any) => {

      file.id = data.document_id;

    });

  }

  private FormatToSeconds(time) {

    if (time == 0) return 0;
    if (typeof (time) == "number") return time;
    let stamp = time.split(":");

    return Number(stamp[0] * 3600) + Number(stamp[1] * 60) + Number(stamp[2]);

  }

  public ApplySettings(settings) {

    if (typeof (settings.sortBy) == "number") {

      if (settings.sortBy == 1) {

        this.comments = _.sortBy(this.comments, (c) => { return new Date(c.created_date) });

      } else if (settings.sortBy == 0) {
        this.comments = _.sortBy(this.comments, (c) => { return new Date(c.created_date) });
        this.comments = this.comments.reverse();
      } else if (settings.sortBy == 2) {

        let wholeComments = this.comments.filter((c) => { return c.time == 0 || c.time == null; });
        let timeComments = this.comments.filter((c) => { return c.time > 0 });


        this.comments = _.sortBy(timeComments, (c) => { return new Date(c.time) }).concat(wholeComments);

      }

    }
    if (typeof (settings.autoscroll) == "boolean") {

      this.settings.autoscroll = settings.autoscroll;

    }

  }

  public GetNewFiles(obj) {
    if (obj.from == 'resources') {

      this.AddTimeStampToResources(obj.files);

      this.staticFiles = this.staticFiles.concat(obj.files);

    }

  }

  public FileClicked(from, file) {

    if (from == "td") {

      if (file.stack_url && file.stack_url != null) {

        let path = environment.baseUrl + "/app/view_document" + file.stack_url.substring(file.stack_url.lastIndexOf("/"), file.stack_url.length);
        window.open(path, "_blank");

      } else {

        this.DownloadFile(file);

      }
    } else {
      this.DownloadFile(file);
    }

  }

  private DownloadFile(file) {

    this.mainService.DownloadFile(file.id);

  }

  public AppendNewFiles(obj) {
    // files.forEach((f)=>{ f.title = f.filename; });
    if (obj.from == 'comment') {
      this.newComment.files = this.newComment.files.concat(obj.files);
    }


  }

  public RemoveFileFromComment(file, i) {

    let index = _.findIndex(this.staticFiles, { url: file.url });
    this.newComment.files.splice(i, 1);

    if (index > -1) {

      let subIndex = _.findIndex(this.staticFiles, { url: file.url });
      this.staticFiles.splice(index, 1);
      this.ResolveDeleteFile(1, file.id);

    }


  }

  public AttachFilesToComment(comment) {

    if (((typeof (comment.time) == "number" && comment.time == 0) || comment.time == "0") && !comment.is_new_comment) {

      comment.files = [];
      return;

    }

    comment.files = [];

    if (comment.is_new_comment) {
      comment.files = _.where(this.staticFiles, { comment_id: comment.id });
      return;
    }

    this.staticFiles.forEach((file) => {

      if (!file) return;

      file.time2 = file.time == "All Video" ? 0 : this.FormatToSeconds(file.time);

      comment.time2 = this.FormatToSeconds(comment.time);
      if (comment.time2 == file.time2) {

        comment.files.push(file);

      }

    })

  }

  private AddTimeStampToResources(files, isFromComment?, fixTime?, commentId?) {

    this.totals.resources_count += files.length;
    if (this.newComment.timeEnabled) {

      files.forEach((f) => {

        f.created_by = this.currnetUser.id;

        f.time = fixTime != void 0 ? fixTime : this.ConvertTime(this.currentTimeInSeconds);

        if (commentId) {

          let comment = _.findWhere(this.comments, { id: commentId });

          if (comment) {
            f.time = comment.time;
          }

        }

        f.stack_url = f.url;

        f.title = f.filename || f.title;

        if (commentId) {
          f.comment_id = commentId;
        }

        if (!isFromComment)
          this.UploadResource(f, true);
        else
          this.UploadResource(f, false, commentId);

      });
    } else {

      files.forEach((f) => {
        f.time = 0;
        f.stack_url = f.url;
        f.title = f.filename;
        if (commentId) {
          f.comment_id = commentId;
        }
        if (!isFromComment)
          this.UploadResource(f, true);
        else
          this.UploadResource(f, false, commentId);

      });
    }


  }

  public DeleteResource(file) {



  }

  public ActivateTab(tabId) {

    this.staticTabs.tabs[tabId].active = true;
    this.currentTab = tabId;

  }

  public RemoveSelectedRubric(rubric, i) {

    if (rubric) {

      let index = _.findIndex(this.rubrics.account_tag_type_0, { account_tag_id: rubric.account_tag_id });

      if (index > -1) {

        this.rubrics.account_tag_type_0[index].selected = false;

        this.selectedRubrics.splice(i, 1);

      }

    }

  }

  private GetRubrics(huddle_id, account_id) {

    this.mainService.GetRubrics({ huddle_id: huddle_id, account_id: account_id, video_id: this.params.video_id }).subscribe((data: any) => {

      this.rubrics = data.data;

    });

  }
  public SelectTab(ev) {
    this.closeInfo();
    this.currentTab = ev;

    if (ev == 4) {
      this.LoadRubricsTabData();
    }

  }

  public LoadRubricsTabData() {

    if (true) {

      this.SelectedPLRubric = {};
      this.PLcomments = [];
      let sessionData: any = this.headerService.getStaticHeaderData();

      let obj = {
        account_id: sessionData.user_current_account.accounts.account_id,
        user_id: sessionData.user_current_account.User.id,
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id
      }

      this.appMainService.GetPLTabData(obj).subscribe((data) => {

        this.PLTabData = data;

      });

    }

  }

  public OnRubricClicked(rubric) {

    this.SelectedPLRubric = rubric;

    this.SelectedPLRubric.selectOptions = this.getPls();

    if (this.getSettings("enable_unique_desc") == 1) {

      this.SelectedPLRubric.descriptions = [];

      this.SelectedPLRubric.selectOptions.forEach((opt) => {

        let obj = _.findWhere(this.SelectedPLRubric.performance_level_descriptions, { performance_level_id: opt.id });

        if (obj)
          this.SelectedPLRubric.descriptions.push({ label: opt.text, text: obj.description });

      });

    }

    if (this.SelectedPLRubric.get_selected_rating)
      this.SelectedPLRubric.selectedRating = this.SelectedPLRubric.get_selected_rating.rating_id;
    else this.SelectedPLRubric.selectedRating = 0;
    this.PLcomments = [];
    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {

      huddle_id: this.params.huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      video_id: this.params.video_id,
      account_tag_id: rubric.account_tag_id

    };
    if (Number(this.SelectedPLRubric.get_standard_tagged_count) > 0) {

      this.mainService.GetPLComments(obj).subscribe((data: any) => {

        this.PLcomments = data.videoComments;

      });

    }


  }

  public RatingChanged(id) {

    let sessionData: any = this.headerService.getStaticHeaderData();

    id = Number(id);

    let val = _.findWhere(this.SelectedPLRubric.selectOptions, { id: id });

    if (!val) return;

    let obj = {

      standard_ids: [this.SelectedPLRubric.account_tag_id],
      huddle_id: this.params.huddle_id,
      video_id: this.params.video_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      account_role_id: sessionData.user_current_account.users_accounts.role_id,
      current_user_email: sessionData.user_current_account.User.email
    };

    obj["rating_value_" + this.SelectedPLRubric.account_tag_id] = val ? val.value : 0;
    obj["rating_id_" + this.SelectedPLRubric.account_tag_id] = id;


    this.mainService.SaveRating(obj).subscribe((data) => {

      console.log(data);

    });


    this.SelectedPLRubric.get_selected_rating = {
      rating_id: this.SelectedPLRubric.selectedRating
    };

  }

  public getPls() {

    if (this.getSettings("enable_performance_level") == 1) {

      return this.GetDropdownSettingsFromPL(this.SelectedPLRubric);

    } else {
      return this.PLTabData.old_ratings.map((fr) => {

        return { id: fr.account_meta_data_id, value: fr.meta_data_value, text: fr.meta_data_name.substring(fr.meta_data_name.lastIndexOf("_") + 1, fr.meta_data_name.length) };

      });
    }



  }

  public getSettings(key) {

    return this.PLTabData.standards.data.account_framework_settings[key];

  }

  private GetDropdownSettingsFromPL(rubric: any) {

    return rubric.account_framework_settings_performance_levels.map((r) => {

      return { id: r.id, value: r.performance_level_rating, text: r.performance_level };

    })

  }

  public getMarkerBg(tag, index) {

    if (this.selectedTag == tag) {

      return this.colorClasses[index];

    } else {
      return "transparent";
    }

  }

  public ChooseCustomTag(tag) {

    this.EditChanges.changed_custom_markers = true;//{changed_standards:false, };

    if (this.selectedTag == tag) {
      this.selectedTag = {};
    } else {
      this.selectedTag = tag;
    }

  }

  private filterComments(criteria) {

    if (!this.comments) {

      return;
    }

    this.prepareComments(this.comments);

    if (criteria.tag_id && criteria.tag_id != -1) {

      this.comments.forEach((c) => {

        c.valid = false;

        c.default_tags.forEach((dt) => {

          if (dt.account_tag_id == criteria.tag_id) {
            c.valid = true;
          }

        });

      });

    }

    if (criteria.text) {

      this.comments.forEach((c) => {

        c.valid = c.comment.toLowerCase().indexOf(criteria.text.toLowerCase()) > -1;

        if (!c.valid) {

          if (c.Comment && c.Comment.responses) {

            c.Comment.responses.forEach((reply) => {

              if (reply.comment.toLowerCase().indexOf(criteria.text.toLowerCase()) > -1) {
                c.valid = true;
              }

              if (reply.responses) {

                reply.responses.forEach((sub_reply) => {

                  if (sub_reply.comment.toLowerCase().indexOf(criteria.text.toLowerCase()) > -1) {

                    c.valid = true;

                  }

                });

              }


            })

          }

        }

      })

    }


  }

  private handleParams(args) {
    this.params = args;

    if (!this.scriptMode)
      this.GetVideoStatus(args.video_id);

    if (this.scriptMode) {
      this.GetVideo();
    }

    let sessionData: any = this.headerService.getStaticHeaderData();

    let user_id = sessionData.user_current_account.User.id;

    this.mainService.GetVideoResources({ video_id: args.video_id, huddle_id: args.huddle_id, user_id: user_id }).subscribe((data: any) => {

      if (data)
        data.forEach((d) => {

          d.time = (d.scripted_current_duration) ? this.ConvertTime(d.scripted_current_duration) : this.translation.vd_all_videos;

        })

      if (data)
        this.staticFiles = this.staticFiles.concat(data);

    });

    let that = this;

    let interval = setInterval(() => {

      let headerData: any = that.headerService.getStaticHeaderData();

      console.log('headerData: ', headerData)

      if (headerData) {

        clearInterval(interval);

        let account_id = headerData.user_current_account.accounts.account_id;
        that.GetRubrics(args.huddle_id, account_id);

      }

    });

  }

  public getPLTabPermission() {
    //This change was made (function written) on Request of Saad in SW-1057
    if (this.VideoInfo.h_type == 2) {

      return this.permissions.coaching_perfomance_level;

    } else if (this.VideoInfo.h_type == 3) {

      return this.permissions.assessment_perfomance_level;

    }

  }

  public getCoachingSummaryCheck() {
    //2: coaching 3: assessment

    if (this.VideoInfo.h_type == 2) {
      if (this.currnetUser.huddle_role_id == '210') {
        if (!this.permissions.coaching_perfomance_level) {
          return false;
        } else {
          if (this.permissions.can_view_summary == "1") {
            return true;
          } else {
            return false;
          }
        }
      } else {
        return true;
      }

    } else if (this.VideoInfo.h_type == 3) {

      if (!this.permissions.assessment_perfomance_level) {
        return false;
      } else {
        return this.permissions.can_view_summary || this.permissions.assessment_summary_check;
      }

    } else {
      return false;
    }

    //    (this.VideoInfo.h_type==2 || this.VideoInfo.h_type==3) && (this.permissions.coaching_summary_check || this.permissions.assessment_summary_check);
  }

  private handleVideo(data) {

    if (data.h_type == 3 && this.rubrics) {

      if (data.user_huddle_level_permissions == 210 || data.user_huddle_level_permissions == 220) {

        this.rubrics.account_framework_settings.checkbox_level = -1;

      }

    }

    if (!data.success) {

      this.toastr.info(this.translation.u_dont_permission_vd);

      setTimeout(() => {

        location.href = environment.baseUrl;

      }, 1000);

      return;
    }

    this.isAuthenticatedUser = true;
    this.src = { "path": data.static_url, "type": "video/mp4" };
    this.comments = data.comments.Document.comments;
    this.ApplySettings({ sortBy: 0 });
    this.CustomMarkers = data.custom_markers;
    this.prepareComments(this.comments);
    this.totals.comment_count = data.comments_counts.total_comments;
    this.totals.resources_count = data.attached_document_numbers;
    this.VideoInfo = data.video_detail;
    this.VideoInfo.h_type = data.h_type;
    this.VideoInfo.huddle_type = data.huddle_type;
    this.settings.PauseWhileTyping = Boolean(data.user_pause_settings);
    this.permissions.rubric_check = data.rubric_check;
    this.permissions.performance_level_check = data.performance_level_check;
    this.permissions.can_view_summary = data.can_view_summary;
    this.permissions.coaching_summary_check = data.coaching_summary_check;
    this.permissions.assessment_summary_check = data.assessment_summary_check;
    this.permissions.can_comment = data.can_comment;
    this.permissions.can_reply = data.can_reply;
    this.permissions.can_rate = data.can_rate;
    this.permissions.huddle_permission = data.user_huddle_level_permissions;
    this.permissions.showCopy = data.can_dl_edit_delete_copy_video;
    this.permissions.AllowCustomMarkers = data.video_markers_check == "1";
    this.permissions.coaching_perfomance_level = data.coaching_perfomance_level == "1";
    this.permissions.can_crop_video = !!data.can_crop_video;
    this.permissions.assessment_perfomance_level = data.assessment_perfomance_level == "1";
    this.loaded = true;
    // this.permissions.coaching_perfomance_level = data.coaching_perfomance_level=="1";

    data.huddle_info.huddle_title = this.VideoInfo.title;
    this.mainService.breadcrumbs.emit(data.bread_crumb_output);
    this.mainService.huddleInfo.emit(data.huddle_info);
    this.VideoInfo.coaching_link = data.coaching_link;
    this.VideoInfo.assessment_link = data.assessment_link;
    this.permissions.framework_selected_for_video = data.framework_selected_for_video;
    this.permissions.allow_per_video = data.allow_per_video;
    this.permissions.get_account_video_library_permissions = data.get_account_video_library_permissions;

    this.currnetUser.huddle_role_id = data.user_huddle_level_permissions;

    this.VideoTotalTime = data.video_duration;
    this.VideoInfo.defaultFramework = data.default_framework;
    this.isVideoProcessing = data.video_detail.published == 0;
    if (this.permissions.can_crop_video) {
      this.init_crop();
    }
    if (data.default_framework != "0" && data.default_framework != "-1") {

      this.VideoHuddleFramework = data.default_framework;
      this.GetRubricById(data.default_framework);

      let sessionData: any = this.headerService.getStaticHeaderData();

      this.permissions.permission_video_library_upload = sessionData.user_current_account.users_accounts.permission_video_library_upload == 1;

    }

    if (this.VideoInfo.h_type == 2) {
      this.VideoInfo.coachee_name = data.coachee_name;
      this.VideoInfo.coaches_name = data.coaches_name;
    } else if (this.VideoInfo.h_type == 3) {

      this.VideoInfo.assessor_names = data.assessor_names;
      this.VideoInfo.eval_participant_names = data.eval_participant_names;

    }

    if (!this.CustomMarkers)
      this.CustomMarkers = data.custom_markers;

    if (data.published == 1) {

      this.options.status == "published";
      if (data.video_url && data.video_url.relative_url) {
        this.options.video_url = data.video_url.url;
        clearInterval(this.interval_id);
        this.enabledLoad = false;
        this.initPlayer(this.options.video_url);
      }

    }
    else if (data.is_processed == 5) {

      this.options.status = "recording";

      this.options.current_time = this.ConvertTime(data.current_duration);
      this.options.current_seconds = data.current_duration;


    } else if (data.is_processed == 4 && data.upload_progress < 100) {

      this.options.status = data.upload_status;//"uploading";
      this.options.upload_progress = data.upload_progress;

    } else if (data.is_processed == 4 && data.upload_progress >= 100 && data.is_associalted != null) {

      this.options.status = "uploaded";
      this.showPublish = false;

    } else if (data.is_processed == 4 && data.upload_progress >= 100) {

      this.options.url = data.url;
      this.showPublish = false;
      if (data.video_url && data.video_url.relative_url) {
        clearInterval(this.interval_id);
        this.enabledLoad = false;
        this.options.video_url = data.video_url.url;
        let that = this;
        setTimeout(() => { that.initPlayer(data.video_url.url); }, 1000);

      }

    }

    if (data.is_associated == null && data.is_processed == 4 && data.upload_progress >= 100) {

      this.showPublish = true;
    }


  }

  private prepareComments(comments) {

    comments.forEach((c) => {

      c.valid = true;

      c.ReplyTouched = false;

      if (c.time == null) c.time = 0;

      if (c.default_tags.length > 0) {

        c.default_tags.forEach((dt) => {

          let index = _.findIndex(this.CustomMarkers, { account_tag_id: dt.account_tag_id });

          if (index >= 0) {
            if (!c.customMarkers) c.customMarkers = [];
            c.customMarkers.push(dt);
          } else {

            if (!c.defaultTags) c.defaultTags = [];
            c.defaultTags.push(dt);

          }

        });

      }
    })

  }

  public InitiateDeleteVideo(template: TemplateRef<any>) {

    this.modalRef = this.modalService.show(template, { class: "modal-md" });

  }

  public getValidCommentCount() {

    if (!this.comments || this.comments.length <= 0) return 1;

    return _.where(this.comments, { valid: true }).length;

  }

  public getSelectFrameworkPermission() {

    let flag = false;

    if (this.permissions.allow_per_video == "1" && (this.VideoInfo.h_type == 2 || this.VideoInfo.h_type == 1) && this.permissions.framework_selected_for_video != "1") {
      flag = true;
    }

    if (this.permissions.allow_per_video != "1" && (this.VideoInfo.h_type == 2 || this.VideoInfo.h_type == 1) && this.permissions.framework_selected_for_video != "1") {

      if (this.permissions.huddle_permission == 200) {

        flag = true;

      }

    }

    if (this.VideoInfo.h_type == 3 && this.permissions.framework_selected_for_video != "1") {

      if (this.permissions.huddle_permission == 200) {

        flag = true;

      }

    }

    return flag;

  }

  public ResolveDeleteVideo(flag) {
    if (flag == 0) {
      this.modalRef.hide();
    } else {
      this.modalRef.hide();
      this.DeleteVideo();
    }

  }

  public DeleteVideo() {

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {

      huddle_id: this.params.huddle_id,
      video_id: this.params.video_id,
      user_id: sessionData.user_current_account.User.id

    }

    this.mainService.DeleteVideo(obj).subscribe((data: any) => {

      if (data.sucess) {

        this.toastr.info(this.translation.vd_videos_has_been_deleted);

        setTimeout(() => {

          let path = environment.baseUrl + "/Huddles/view/" + this.params.huddle_id;

          location.href = path;

        }, 2000);

      } else {

        this.toastr.info(data.message);

      }

    });

  }

  public DownloadVideo() {

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {
      document_id: this.params.video_id,
      huddle_id: this.params.huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id
    }

    this.mainService.DownloadVideo(obj);

  }

  public PointToLink() {

    // let link = this.VideoInfo.h_type=="2"? environment.baseUrl+"/Dashboard/coach_tracker" : this.VideoInfo.h_type=="3"? environment.baseUrl+"/Dashboard/assessment_tracker":"";
    let link = this.VideoInfo.h_type == "2" ? `${environment.baseUrl}/home/trackers/coaching?date=1month` : this.VideoInfo.h_type == "3" ? `${environment.baseUrl}/home/trackers/assessment` : "";

    if (link) {
      window.open(link, "_blank");
    }

    setTimeout(() => {
      this.ActivateTab(this.currentTab);
    });

  }

  public OnCommentAdded(e) {

    this.totals.comment_count++;

  }
  private updateCommentCount() {

    let count = this.comments.length;

    if (count == 0) {
      this.totals.comment_count = 0;
      return;
    }

    _.each(this.comments, (c) => {

      if (c && c.Comment && c.Comment.responses && c.Comment.responses.length > 0) {

        count += c.Comment.responses.length;

        c.Comment.responses.forEach((r) => {
          count += r.responses ? r.responses.length : 0;
        });

      }


    });

    this.totals.comment_count = count;
  }

  public onCommentDelete(comment) {
    if (!comment.id || comment.id == "") {
      this.toastr.info(this.translation.please_select_comment);
      return;
    } else {
      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj = {
        video_id: this.params.video_id,
        comment_id: comment.id,
        user_id: user_id
      }
      this.appMainService.DeleteComment(obj).subscribe((data: any) => {
        if (data.status == "success") {

          // this.totals.comment_count--;

          this.LoadPublishSettings();

          this.FindAndKill(comment.id);

          this.updateCommentCount();

          this.mainService.ReRenderMarkers.emit(true);

        }
      })
    };
  }

  private FindAndKill(id) {

    let index = -1;
    index = _.findIndex(this.comments, { id: id });

    if (index > -1) {

      this.comments.splice(index, 1);

    } else {

      let parent;
      this.comments.forEach((c) => {

        if (c && c.Comment && c.Comment.responses) {
          let _index = _.findIndex(c.Comment.responses, { id: id });
          if (_index > -1) {
            index = _index;
            parent = c;
          }
        }


      });

      if (index > -1) {

        parent.Comment.responses.splice(index, 1);

      } else {

        this.comments.forEach((c) => {
          if (c && c.Comment && c.Comment.responses) {
            c.Comment.responses.forEach((r, i) => {
              if (r && r.responses) {
                let _index = _.findIndex(r.responses, { id: id });

                if (_index > -1) {
                  r.responses.splice(_index, 1);
                }
              }


            });
          }


        });

      }

    }

  }

  public GetTime(ev) {

    if (this.EditMode) return;
    this.VideoCurrentTime = this.ConvertTime(ev);
    this.currentTimeInSeconds = ev;

    let index = _.findIndex(this.comments, { time: Math.floor(ev) });

    if (index >= 0 && ev != 0) {
      if (this.isPlaying && this.settings.autoscroll) {
        //   if(ev != 0)
        // console.log(this.comments[index]);
        this.currentComment = this.comments[index];
        this.scrollToService.scrollTo("#slimscroll", "#comment_" + index);
      } else {
        this.currentComment = {};
      }

    }
  }

  public ToggleEnterPost() {

    this.settings.EnterToPost = !this.settings.EnterToPost;

  }

  public TogglePause() {

    this.settings.PauseWhileTyping = !this.settings.PauseWhileTyping;

    let sessionData: any = this.headerService.getStaticHeaderData();
    let obj = {
      user_id: sessionData.user_current_account.User.id,
      account_id: sessionData.user_current_account.accounts.account_id,
      value: Number(this.settings.PauseWhileTyping)
    };

    this.mainService.SavePauseSettings(obj).subscribe((data) => { });

  }

  public SetCustomTags(tags) {

    this.tags = tags;

  }

  public onCommentEdit(c) {

    this.EditMode = true;
    this.EditChanges = {};
    this.prepareEditComment(c);

  }

  public confirmExit(e) {

    if (!this.EnablePublish) return;

    var message = "Your confirmation message goes here.",
      e = e || window.event;
    // For IE and Firefox
    if (e) {
      e.returnValue = message;
    }

    // For Safari
    return message;
  }


  public ResolveAssignFramework(flag, is_internal?) {

    if (flag == 0) {

      this.modalRef.hide();

    } else {

      if (!is_internal) {
        this.modalRef.hide();
      }

      let obj = {
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        framework_id: this.VideoHuddleFramework,
        user_id: this.headerService.getUserId()
      }
      this.mainService.SetFrameworkForVideo(obj).subscribe((data: any) => {

        if (!data.status) {

          if (!is_internal) {
            this.toastr.info(this.translation.vd_framework_selected_for_video);
          }

          let video_framework_id = data.video_framework_id;
          this.GetRubricById(video_framework_id, true);
          //  this.rubrics = _.findWhere(this.frameworks, {account_tag_id: video_framework_id});
          // this.rubrics = this.rubricPreview;
          this.permissions.framework_selected_for_video = "1";

        } else {

          this.rubrics = this.rubricPreview;
          this.permissions.framework_selected_for_video = "1";
        }

      });
      //CHOOSE FRAMEWORK HERE

    }

  }

  public AssignFramework(template, flag) {

    if (flag == 0) {

      this.rubricPreview = "";
      this.VideoHuddleFramework = this.VideoInfo.defaultFramework;
      this.GetRubricById(this.VideoInfo.defaultFramework);
      return;

    } else if (flag == 1) {

      this.modalRef = this.modalService.show(template, { class: 'modal-md' });

    }

  }

  public OnCommentTimeChange(val, flag) {
    if (flag == 's') {

      if (val > 59) {
        this.VideoCurrentTime[1]++;
        this.VideoCurrentTime[2] = 0;
        if (this.VideoCurrentTime[1] >= 59) {
          this.OnCommentTimeChange(this.VideoCurrentTime[1], 'm');
        }
      }

    } else if (flag == 'm') {
      if (val > 59) {
        this.VideoCurrentTime[0]++;
        this.VideoCurrentTime[1] = 0;
      }
    } else if (flag == 'h') {

    }
  }

  private prepareEditComment(comment) {

    this.EditChanges = { changed_standards: false, changed_custom_markers: false };
    this.AttachFilesToComment(comment);
    this.EditableComment = comment;
    this.newComment.timeEnabled = comment.time >= 0;
    this.newComment.commentText = comment.comment;
    this.videoOldTime = this.ConvertTime(comment.time).split(":");

    this.VideoCurrentTime = this.ConvertTime(comment.time);
    if (this.VideoCurrentTime == "All Video") {
      this.newComment.timeEnabled = false;
    }
    this.VideoCurrentTime = this.VideoCurrentTime == "All Video" ? this.VideoCurrentTime : this.VideoCurrentTime.split(":");//Object.assign({},this.VideoCurrentTime.split(":"));
    this.newComment.files = comment.files;
    window.scrollTo(0, document.body.scrollHeight - 30);

    this.tags = [];

    this.selectedRubrics = [];

    comment.default_tags.forEach((dt) => {

      let index = _.findIndex(this.CustomMarkers, { account_tag_id: dt.account_tag_id });

      if (index >= 0) {

        this.selectedTag = this.CustomMarkers[index];

      } else {
        this.perpareEditableTag(dt);
      }

    });

    comment.standard.forEach((c) => {

      // this.editableRubrics.push(c.account_tag_id);
      let index = _.findIndex(this.rubrics.account_tag_type_0, { account_tag_id: c.account_tag_id });

      if (index > -1) {

        this.rubrics.account_tag_type_0[index].selected = true;
        this.selectedRubrics.push(this.rubrics.account_tag_type_0[index]);

      }

    });

  }

  private perpareEditableTag(tag) {
    this.tags.push({ text: tag.tag_title, id: this.tags.length + 1 });

  }

  public TriggerTextChange(ev) {
    if (this.settings.PauseWhileTyping) {

      this.playerService.ModifyPlayingState("pause");

    }
    if (ev.keyCode == 13 && this.settings.EnterToPost) {

      ev.preventDefault();

      if (!this.EditMode) {
        this.AddTextComment();
      } else {
        this.EditTextComment(1);
      }


    }


  }

  public AddTextComment() {

    if (!this.newComment.commentText || this.newComment.commentText == "") {

      this.toastr.info(this.translation.please_enter_text_to_comment);
      return;

    } else {

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj = {
        videoId: this.params.video_id,
        for: (this.newComment.timeEnabled) ? "synchro_time" : "",
        synchro_time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : '',
        time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : 0,
        ref_type: '2',
        comment: this.newComment.commentText,
        user_id: user_id,
        standards_acc_tags: this.PrepareRubrics(),
        default_tags: this.GetCustomTags(),
        assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
        fake_id: this.GetFakeId(),
        first_name: sessionData.user_current_account.User.first_name,
        last_name: sessionData.user_current_account.User.last_name,
        company_name: sessionData.user_current_account.accounts.company_name,
        image: sessionData.user_current_account.User.image,
        account_role_id: sessionData.user_current_account.users_accounts.role_id,
        current_user_email: sessionData.user_current_account.User.email
      };

      let files = [];

      if (this.newComment.files && this.newComment.files.length > 0) {

        this.staticFiles = this.staticFiles.concat(this.newComment.files);

        files = this.newComment.files;

        // this.AddTimeStampToResources(this.newComment.files, true, obj.time);

      }

      if (this.settings.PauseWhileTyping) {

        this.playerService.PlayerPlayingState.emit("play");

      }
      this.appMainService.AddComment(obj).subscribe((data: any) => {

        if (data.status == "success") {

          this.LoadPublishSettings();

          this.totals.comment_count++;
          let comment = data["0"];
          let fake_id = data["0"].fake_id;
          comment.valid = true;

          let index = _.findIndex(this.comments, { fake_id: fake_id });
          if (index > -1) {

            this.comments[index] = comment;
            setTimeout(() => { this.AttachFilesToComment(this.comments[index]); }, 1000);
            this.mainService.CommentAddedNotification.emit(comment);

          }

          if (files.length > 0) {

            this.AddTimeStampToResources(files, true, obj.time, comment.id);

          }

        } else {
          this.toastr.info(this.translation.something_went_wrong_msg);
        }

      });
      this.ActivateTab(0);
      this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
      this.ResetForm();
    }

  }
  findNegativeNumber(timeArray) {
    let a = timeArray.split(":");
    let result = false;
    console.log(a)
    for (let index = 0; index < a.length; index++) {
      const element = a[index];
      if (parseInt(element) < 0) {
        this.toastr.info(this.translation.vd_please_enter_valid_number)
        result = true;
        // return;
      }

    }
    return result;
  }

  calculateSeconds(timeArray) {
    let a = timeArray.split(":")
    console.log(a)


    let newTime = parseInt(a[0]) * 3600;
    newTime += parseInt(a[1]) * 60;
    newTime += parseInt(a[2]);

    return newTime;
  }
  public EditTextComment(flag) {

    if (flag == 0) {
      this.ResetForm();
      return;
    }

    if (!this.newComment.commentText || this.newComment.commentText == "") {

      this.toastr.info(this.translation.please_enter_text_to_comment);
      return;

    } else {

      if (this.newComment.timeEnabled && (this.VideoTotalTime < this.FormatToSeconds(this.VideoCurrentTime.join(":")))) {

        this.toastr.info(this.translation.comment_time_ahead);
        return;

      }

      if (this.newComment.files && this.newComment.files.length > 0) {

        this.newComment.files = this.newComment.files.filter((f) => { return !f.id; });

        this.staticFiles = this.staticFiles.concat(this.newComment.files);
        this.AddTimeStampToResources(this.newComment.files, true, this.EditableComment.time, this.EditableComment.id);

      }

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let account_id = sessionData.user_current_account.accounts.account_id;


      var newTime = this.calculateSeconds(this.VideoCurrentTime.join(":"));
      var oldTime = this.calculateSeconds(this.videoOldTime.join(":"));
      var isNagative = this.findNegativeNumber(this.VideoCurrentTime.join(":"))
      let huddle_id = this.params.huddle_id;

      if (!isNagative) {
        if (oldTime < newTime || !newTime) {
          if (!newTime)
            this.toastr.info(this.translation.vd_please_enter_valid_number)
          else
            this.toastr.info(this.translation.comment_time_ahead);
          // this.toastr.info()
        }
        else {

          let obj = {
            huddle_id: huddle_id,
            account_id: account_id,
            comment_id: this.EditableComment.id,
            videoId: this.params.video_id,
            for: (this.newComment.timeEnabled) ? "synchro_time" : "",
            // synchro_time: this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:'',
            // time:  this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:0,
            synchro_time: (this.newComment.timeEnabled) ? Math.floor(this.FormatToSeconds(this.VideoCurrentTime.join(":"))) : '',//Math.floor(this.currentTimeInSeconds):'',
            time: (this.newComment.timeEnabled) ? Math.floor(this.FormatToSeconds(this.VideoCurrentTime.join(":"))) : 0, //Math.floor(this.currentTimeInSeconds):0,

            ref_type: '2',
            comment: this.newComment.commentText,
            user_id: user_id,
            standards_acc_tags: this.PrepareRubrics(),
            default_tags: this.GetCustomTags(),
            assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
            account_role_id: sessionData.user_current_account.users_accounts.role_id,
            current_user_email: sessionData.user_current_account.User.email,
            changed_standards: this.EditChanges.changed_standards,
            changed_custom_markers: this.EditChanges.changed_custom_markers
          };
          this.appMainService.EditComment(obj).subscribe((data: any) => {

            if (data.status == "success") {

              let index = _.findIndex(this.comments, { id: this.EditableComment.id });
              if (index > -1) {

                this.comments[index] = data.updated_comment;
                this.comments[index].valid = true;
                this.EditableComment = {};
                this.mainService.ReRenderMarkers.emit(true);

              }

            } else {
              this.toastr.info(this.translation.something_went_wrong_msg);
            }

          });
          this.ActivateTab(0);
          // this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
          this.ResetForm();
        }
      }
    }

  }

  private ResetForm() {

    this.newComment.commentText = "";
    this.newComment.files = [];
    this.selectedRubrics = [];
    this.mainService.ResetCustomTags();
    this.mainService.ResetSelectedRubrics();
    // this.rubrics.forEach((r)=>{r.selected=false;});
    // this.EditableComment = {};
    this.selectedTag = {};
    this.EditMode = false;

  }

  private GetCustomTags() {
    if (!this.tags || this.tags.length == 0) return "";
    let arr = [];
    this.tags.forEach((t) => { arr.push(t.text) });
    return arr.join();
  }
  private PrepareFakeComment(comment, sessionData) {

    let fake_comment = {
      "valid": true,
      "fake_id": comment.fake_id,
      "id": -1,
      "parent_comment_id": comment.parent_comment_id ? comment.parent_comment_id : null,
      "title": null,
      "comment": comment.comment,
      "ref_type": comment.ref_type,
      "ref_id": -1,
      "user_id": comment.user_id,
      "time": comment.time,
      "restrict_to_users": 0,
      "created_by": comment.user_id,
      "created_date": "2017-01-23 06:52:14",
      "last_edit_by": -1,
      "last_edit_date": "2017-02-21 20:42:13",
      "active": "1",
      "audio_duration": 0,
      "published_by": null,
      "first_name": sessionData.user_current_account.User.first_name,
      "last_name": sessionData.user_current_account.User.last_name,
      "image": sessionData.user_current_account.User.image,
      "Comment": {
        "last_edit_date": "2017-02-21T20:42:13+00:00",
        "created_date": "2017-01-23T06:52:14+00:00"
      },
      "created_date_string": "Just Now",
      "standard": this.selectedRubrics,
      "default_tags": [
        this.selectedTag
      ]
    };

    return fake_comment;

  }

  private GetFakeId() {

    return ++this.fakeCommentCount;


  }

  private PrepareRubrics() {

    if (!this.selectedRubrics || this.selectedRubrics.length == 0) return "";

    let ret = [];

    this.selectedRubrics.forEach((r) => { ret.push(r.account_tag_id); });

    return ret.join(",");
  }

  public getFileTime(file) {

    if (isNaN(file.time)) return file.time;

    return this.ConvertTime(file.time);

  }
  public ConvertTime(n) {

    if (!n || n == null || n == 0) return this.translation.vd_all_videos;//"00:00:00";
    let sec_num: any = parseInt(n, 10);
    let hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: any = sec_num - (hours * 3600) - (minutes * 60);

    if (hours == 0 && minutes == 0 && seconds == 0) {
      return this.translation.vd_all_videos;
    }

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
  }

  public closeInfo(changeTabe = 0, changeToTab = 0, fromTab = 0) {
    console.log("changeTabe = " + changeTabe, "changeToTab = " + changeToTab, "fromTab = " + fromTab);
    console.log("Current tab = " + this.currentTab);
    this.ShowInfo = false;
    if (changeTabe) {
      if (fromTab == this.currentTab) {
        this.ActivateTab(changeToTab);
      }
    }
  }


  device_detector() {
    let huddle_id = this.params.huddle_id;
    let video_id = this.params.video_id;
    let sessionData: any = this.headerService.getStaticHeaderData();
    let account_id = sessionData.user_current_account.accounts.account_id;
    const isMobile = this.deviceService.isMobile(); //new code
    if (isMobile) {
      //location.href = "sibme://play_video/?huddleID=195578&videoID=307795&isWorkspace=true&account_id=181";
      location.href = "sibme://play_video/?huddleID=" + huddle_id + "&videoID=" + video_id + "&isWorkspace=false&account_id=" + account_id;
    }

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.modalRef) this.modalRef.hide();
  }

  /** Functions from vobody */
  private InitScriptMode() {
    console.log('initializing init script')

    this.scriptMode = true;
    this.options.current_time = "00:00:00";
    this.options.current_seconds = 0;
    this.options.timerStarted = false;
    this.options.interval_id = -1;

  }

  private GetVideoStatus(video_id) {

    let that = this;

    let headerData: any = this.headerService.getStaticHeaderData();

    let account_id = headerData.user_current_account.accounts.account_id;
    let user_id = headerData.user_current_account.User.id;
    this.interval_id = setInterval(() => {

      if (that.enabledLoad) {

        that.observationService.LoadObservationVideo({ user_id: user_id, video_id: video_id, huddle_id: that.params.huddle_id, account_id: account_id }).subscribe((data) => {

          that.handleVideo(data);

        });

      }

    }, 1000);

  }

  private GetVideo() {
    let that = this;

    let interval = setInterval(() => {

      let headerData: any = that.headerService.getStaticHeaderData();

      if (headerData) {

        clearInterval(interval);

        let account_id = headerData.user_current_account.accounts.account_id;
        let user_id = headerData.user_current_account.User.id;
        let data = {
          "user_id": user_id,
          "video_id": that.params.video_id,
          "account_id": account_id,
          "huddle_id": that.params.huddle_id,
          "role_id": headerData.user_current_account.roles.role_id,
          "permission_maintain_folders": headerData.user_permissions.UserAccount.permission_maintain_folders
        }

        if (this.workspace) {
          that.mainService.WorkspaceGetObservationVideo(data).subscribe((data: any) => {
            if (!data.success) {
              this.toastr.info(data.message);
              that.router.navigate(["/"]);

            } else {
              if (data.video_object_detail.is_scripted_note_start && !data.video_object_detail.published) {
                data.video_object_detail.published = 1;
                this.PublishScript(false);
              }

              if (data.video_object_detail.is_scripted_note_start) {
                this.oldSyncNote = true;
                if (data.video_object_detail.created_by == user_id)
                  this.isCreater = true;
                else {
                  this.isCreater = false;
                }
              }

              that.handleVideoData(data);
              this.permissions.isEditingAllowed = data.video_object_detail.is_scripted_note_start


            }





          });
        } else {
          that.mainService.GetObservationVideo(data).subscribe((data: any) => {
            if (data.video_object_detail.created_by == user_id)
              this.isCreater = true;
            else {
              this.isCreater = false;
            }
            that.handleVideoData(data);

          });
        }

      }

    });
  }

  public PublishScript(showMessage: boolean) {

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {
      huddle_id: this.params.huddle_id,
      video_id: this.params.video_id,
      user_id: sessionData.user_current_account.User.id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_current_account: sessionData.user_current_account

    }

    this.observationService.PublishScript(obj).subscribe((data: any) => {

      if (data.success) {

        this.SearchFormOptions.export = true;
        this.options.script_published = true;
        if (showMessage) this.toastr.info(`${this.translation.vd_scriptednotepublished}`);

      }

    });



  }

  private handleVideoData(data) {

    if (!data.success) {

      this.toastr.info(data.message);

      setTimeout(() => {

        location.href = environment.baseUrl;

      }, 1000);

      return;


    }


    this.isAuthenticatedUser = true;
    this.src = { "path": this.options.video_url, "type": "video/mp4" };
    this.comments = data.comments.Document.comments;
    this.ApplySettings({ sortBy: 0 });
    this.CustomMarkers = data.custom_markers;
    this.prepareComments(this.comments);
    // this.totals.comment_count = data.comments_counts.total_comments;
    // this.totals.resources_count = data.attached_document_numbers;
    // this.VideoInfo = data.video_detail;
    this.VideoInfo.h_type = data.h_type;
    this.VideoInfo.huddle_type = data.huddle_type;
    this.settings.PauseWhileTyping = Boolean(data.user_pause_settings);
    this.permissions.rubric_check = data.rubric_check;
    this.permissions.performance_level_check = data.performance_level_check;
    this.permissions.coaching_summary_check = data.coaching_summary_check;
    this.permissions.assessment_summary_check = data.assessment_summary_check;
    this.permissions.can_comment = data.can_comment;
    this.permissions.can_reply = data.can_reply;
    this.permissions.can_rate = data.can_rate;
    this.permissions.showCopy = data.can_dl_edit_delete_copy_video;
    this.permissions.AllowCustomMarkers = data.video_markers_check == "1";
    this.permissions.huddle_permission = 200; //data.user_huddle_level_permissions;
    console.log("setting huddle permission to 200 forceully in observations.");
    this.permissions.framework_selected_for_video = data.framework_selected_for_video;
    this.permissions.allow_per_video = data.allow_per_video;
    this.VideoInfo.defaultFramework = data.default_framework;

    if (this.scriptMode) {
      this.options.script_published = data.video_object_detail.published == 1;

      if (this.options.script_published) {

        this.SearchFormOptions.export = true;

      }
      if (data.video_object_detail.published == 0 && data.video_object_detail.scripted_current_duration > 0) {

        this.options.timerStarted = true;
        this.options.current_seconds = data.video_object_detail.scripted_current_duration;
        this.options.current_time = this.ConvertTime(data.video_object_detail.scripted_current_duration);
        this.options.script_published = false;
        this.options.timerStatus = 'stopped';
      }
      this.options.video_title = data.video_object_detail.title || data.video_object_detail.original_file_name.replace('.mp4', '');
      data.huddle_info.huddle_title = this.options.video_title;
      this.mainService.breadcrumbs.emit(data.bread_crumb_output);
      this.mainService.huddleInfo.emit(data.huddle_info);
    }

    if (data.default_framework && data.default_framework != "0" && data.default_framework != "-1") {

      this.VideoHuddleFramework = data.default_framework;
      this.VideoHuddleDefaultFramework = data.default_framework;
      console.log('in 8: ', data.default_framework)
      this.GetRubricById(data.default_framework);

    }

    this.loaded = true;

  }

  public GetUrl() {

    if (this.workspace) {
      return this.params ? "/workspace/workspace/home" : "";
    } else {
      return this.params ? "/video_huddles/huddle/details/" + this.params.huddle_id : "";
    }
  }

  private initPlayer(url) {

    this.GetVideo();

    // this.player = videojs("temp_video", {
    //      controls: true,
    //      autoplay: false,
    //      preload: false,

    //    });

    // this.player.src(url);

    // this.player.ready(function(context){

    //   context.player.play();

    // }(this));

    // 

  }

}
