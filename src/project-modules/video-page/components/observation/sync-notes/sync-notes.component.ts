import {Component, OnInit, TemplateRef, ViewChild, OnDestroy, ElementRef} from '@angular/core';
import { BsModalRef, TabsetComponent } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as _ from "underscore";
import { HeaderService, SocketService, AppMainService } from '@app/services';
import { MainService, PlayerService, CropPlayerService, ObservationService, ScrollService } from '@videoPage/services';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from '@src/environments/environment';
import { Subscription } from 'rxjs';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';

type RecordingState = 'comfortZone' | 'recording' | 'resume' | 'uploading' | 'play';
type AudioPath = { filePath: string, audioUrl: string, autoSubmitComment: string, audioDuration: number };

@Component({
  selector: 'app-sync-notes',
  templateUrl: './sync-notes.component.html',
  styleUrls: ['./sync-notes.component.css']
})
export class SyncNotesComponent implements OnInit, OnDestroy {

  public src;
  public newComment;
  public settings;
  public VideoCurrentTime;
  public VideoTotalTime;
  public comments;
  public colorClasses;
  public CustomMarkers;
  private selectedTag;
  public totals;
  public rubrics;
  public currentTab;
  public selectedRubrics;
  public tagIds: number[] = []; // selectedPLRubricAccountTagIds
  public ratingIds: number[] = []; // rubricAccountTagRatingIds
  public ShowInfo;
  public VideoInfo: any = {};
  private params;
  private tags;
  private fakeCommentCount;
  private currentTimeInSeconds;
  private comment_start_time;
  private comment_start_time_string;
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
  public permissions;
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
  public isVideoProcessing;
  public header_color;
  public frameworks;
  public primery_button_color;
  public secondry_button_color;
  public rubricPreview;
  public VideoHuddleFramework = 0;

  private interval_id;

  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  @ViewChild('cropDialog', { static: false }) cropDialog;
  public header_data;
  public translation;
    public autoSaveAudio = "";
  options: any = {};
  enabledLoad: boolean = false;
  showPublish: boolean = false;
  scriptMode: boolean = false;
  private selectedTagTemp;
  private tmpCommentArrayForLocalStorage = [];
  private tmpEditCommentArrayForLocalStorage = [];
  private WORKSPACE_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.WORKSPACE;
  private addCommentLSKey: string = '';
  private editCommentLSKey: string = '';
  private addCommentTAKey: string = ''; // try again key
  private editCommentTAKey: string = ''; // try again key
  public lsCommentExisted: boolean = false;
  videoOldTime: any = [];
  EditSubReplylocalArry: any = [];
  EditReplylocalArry: any = [];

  /** Audio recorder variables start */
  public audioRecorderState: RecordingState = 'comfortZone';
  public localAudioData: any = {};
  public commentTextstatus:boolean=false;
  /** Audio recorder variables end */
  public tempEditComment: any = {};
  @ViewChild('audioPlayer', { static: false }) audioPlayer: ElementRef;

  private commentsSortBy: number = 0;

  private subscriptions: Subscription = new Subscription();
  constructor(private modalService: BsModalService, private scrollToService: ScrollService,
    private toastr: ToastrService, private headerService: HeaderService, public mainService: MainService,
    private route: ActivatedRoute, private playerService: PlayerService,
    private cropPlayerService: CropPlayerService, private deviceService: DeviceDetectorService,
    private observationService: ObservationService, private FullRouter: Router, private socketService: SocketService,
    private appMainService: AppMainService) {

    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    }));

    this.mainService.commentTryAgain$.subscribe(data => {
      if (data.parent === 'syncNote') {
        if (data.event === 'add') this.onTryAgainUpdate(data);
        else if (data.evet === 'edit') this.onEditTryAgainUpdate(data);
      }
    });
  }


  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    this.translation = this.header_data.language_translation;
    this.isAuthenticatedUser = false;
    this.settings = { EnterToPost: true, PauseWhileTyping: true };
    this.newComment = {};
    this.newComment.files = [];
    this.newComment.timeEnabled = true;
    this.totals = {};
    this.currentTab = 0;
    this.selectedRubrics = [];
    this.enabledLoad = true;
    this.ShowInfo = false;
    this.tags = [];
    this.fakeCommentCount = 0;
    this.staticFiles = [];
    this.currentComment = {};
    this.EditMode = false;
    this.editableRubrics = [];
    this.EditableComment = {};
    this.totals.resources_count = 0;
    this.CopyData = {};
    this.CopyData.searchHuddleText = "";
    this.CopyData.searchAccountText = "";
    this.CopyData.LibrarySelected = false;
    this.permissions = {};
    this.isCroLoading = false;
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
    let sessionData: any = this.headerService.getStaticHeaderData();

    // Dynamic Button Colors Start
    this.header_color = sessionData.header_color;
    this.primery_button_color = sessionData.primery_button_color;
    this.secondry_button_color = sessionData.secondry_button_color;
    // Dynamic Button Colors End

    this.currnetUser = sessionData.user_current_account.User;

    this.mainService.GetFrameworks().subscribe((frameworks) => {

      this.frameworks = frameworks;

      if (this.frameworks.length == 1) {

        setTimeout(() => {
          this.VideoHuddleFramework = this.frameworks[0].account_tag_id;
          //  this.rubricPreview = this.frameworks[0];
          this.GetRubricById(this.VideoHuddleFramework);
          this.ResolveAssignFramework(1, true);
        }, 3000);
        // this.permissions.framework_selected_for_video = "0";
      }

    });

    this.route.params.subscribe((p) => {

      this.params = p;
      this.device_detector();
      this.handleParams(p);

      // prepare local storage keys
      this.addCommentLSKey = `${this.WORKSPACE_LS_KEYS.SYNC_NOTE_COMMENT}${this.params.video_id}_${this.headerService.getUserId()}`;
      this.editCommentLSKey = `${this.WORKSPACE_LS_KEYS.SYNC_NOTE_EDIT_COMMENT}${this.params.video_id}_${this.headerService.getUserId()}`;
      this.addCommentTAKey = `${this.WORKSPACE_LS_KEYS.VIDEO_COMMENT_TA}${this.params.video_id}_${this.headerService.getUserId()}`;
      this.editCommentTAKey = `${this.WORKSPACE_LS_KEYS.VIDEO_EDIT_COMMENT_TA}${this.params.video_id}_${this.headerService.getUserId()}`;

    });

    this.RunSubscribers();

    window.onbeforeunload = () => this.ngOnDestroy(); // listen to the events like refresh or tab close
    this.socketPushFunctionComment();
    // this.processEventSubscriptions();

  }


  private RunSubscribers() {

    this.GetVideoDuration();

    this.mainService.SearchData.subscribe((data) => {

      this.filterComments(data);

    });

    this.mainService.PushableRubric.subscribe((r) => {

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

  private GetVideoDuration() {

    this.mainService.GetVideoDuration(this.params.video_id).subscribe((data) => {

      if (data != -1)
        this.VideoTotalTime = Number(data);

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

      if (c && c.Comment && c.Comment.responses.length > 0) {

        count += c.Comment.responses.length;

        c.Comment.responses.forEach((r) => {
          count += r.responses ? r.responses.length : 0;
        });

      }


    });

    this.totals.comment_count = count;
  }

  public Seek(val) {

    if (val == this.translation.myfile_all_videos || val == 0) return this.translation.myfile_all_videos;
    this.playerService.Seek.emit(this.FormatToSeconds(val));

  }

  public init_crop() {
    if (this.params.init_crop && this.params.init_crop == 1) {

      // this.cropDialog;
      let that = this;
      setTimeout(() => {
        this.playerService.ModifyPlayingState('pause');
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

      this.modalRef.hide();


    } else {

      let selectedAccounts = _.where(this.CopyData.all_accounts, { selected: true });

      let selectedHuddles = _.where(this.CopyData.all_huddles, { selected: true });
      if ((selectedHuddles.length + selectedAccounts.length == 0) && !this.CopyData.LibrarySelected) {

        this.toastr.info(this.translation.myfile_nothing_select_to_copy);
        return;

      }
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
    this.cropPlayerService.ModifyPlayingState(["pause"]);
    (document.querySelector('bs-modal-backdrop') as HTMLElement).style.display = "none";
    (document.querySelector('modal-container') as HTMLElement).style.display = "none";
    (document.querySelector('body') as HTMLElement).style.overflow = "visible";

  }
  public TrimVideo() {

    if (this.cropRange[0] == this.cropRange[1]) {

      alert(this.translation.please_select_range);
    }
    else {
      this.mainService.TrimVideo(this.params.video_id, this.params.huddle_id, { startVideo: parseFloat(this.cropRange[0] + ".00").toFixed(2), endVideo: parseFloat(this.cropRange[1] + ".00").toFixed(2), workspace: 1 }).subscribe((data: any) => {
        let path: any;// = location.pathname;
        // path = path.split('/');
        // let huddle = path[path.length - 2];
        path = environment.baseUrl + "/MyFiles";
        location.href = path;
      });
    }
  }

  public CaptureTotalTime(VideoTotalTime) {
    if (this.captureCount == 0) {
      let videoStart = 0;
      let videoEnd = Math.floor(this.VideoTotalTime) || Math.floor(VideoTotalTime);
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
      return hours + ':' + minutes + ':' + seconds;
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
        this.toastr.success(this.translation.reply_updated_successfully)

        let parentIndex = _.findIndex(this.comments, { id: commentObj.comment.id });
        let found = false;
        if (parentIndex > -1) {

          let index = _.findIndex(this.comments[parentIndex].Comment.responses, { id: commentObj.reply.id });

          if (index > -1) {
            found = true;
            this.comments[parentIndex].Comment.responses[index].comment = commentObj.reply.EditableText;
            this.comments[parentIndex].Comment.responses[index].EditEnabled = false;
            if (this.comments[parentIndex].Comment.responses[index].edittryagain) {
              this.comments[parentIndex].Comment.responses[index].edittryagain = false;
              let localEditReplydata = localStorage.getItem('workspace_video_edit_reply_' + this.params.video_id + '_' + this.headerService.getUserId())
              if (localEditReplydata != null && localEditReplydata != undefined) {
                let sdata = JSON.parse(localEditReplydata)
                sdata.forEach((x, i) => {
                  if (this.comments[parentIndex].Comment.responses[index].id == x.id) {
                    sdata.splice(i, 1)
                  }
                });
                localStorage.setItem('workspace_video_edit_reply_' + this.params.video_id + '_' + this.headerService.getUserId(), JSON.stringify(sdata))
              }
            }
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
                  if (r.responses[index].edittryagain) {
                    r.responses[index].edittryagain = false;
                    let localEditReplydata = localStorage.getItem('workspace_video_edit_sub_reply_' + this.params.video_id + '_' + this.headerService.getUserId())
                    if (localEditReplydata != null && localEditReplydata != undefined) {
                      let sdata = JSON.parse(localEditReplydata)
                      sdata.forEach((x, i) => {
                        if (r.responses[index].id == x.id) {
                          sdata.splice(i, 1)
                        }
                      });
                      localStorage.setItem('workspace_video_edit_sub_reply_' + this.params.video_id + '_' + this.headerService.getUserId(), JSON.stringify(sdata))
                    }
                  }
                }

              });

            }

          });

        }

      }

    }, err => {
      let parentIndex = _.findIndex(this.comments, { id: commentObj.comment.id });
      let index = _.findIndex(this.comments[parentIndex].Comment.responses, { id: commentObj.reply.id });
      if (!this.comments[parentIndex].Comment) this.comments[parentIndex]['Comment'] = {};
      if (!this.comments[parentIndex].Comment.responses) this.comments[parentIndex].Comment['responses'] = [];
      if (this.comments[parentIndex].Comment && this.comments[parentIndex].Comment.responses) {
        let parentSubindex = _.findIndex(this.comments[parentIndex].Comment.responses, { id: commentObj.reply.parent_comment_id });
        if (this.comments[parentIndex].Comment.responses[parentSubindex] && this.comments[parentIndex].Comment.responses[parentSubindex].responses) {
          let subreply_index = _.findIndex(this.comments[parentIndex].Comment.responses[parentSubindex].responses, { id: commentObj.reply.id });
          if (subreply_index > -1) {
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].comment = obj.comment;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].EditEnabled = false;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].huddle_id = obj.huddle_id;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].account_id = obj.account_id;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].edittryagain = true;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].videoId = obj.videoId;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].for = obj.for;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].synchro_time = obj.synchro_time;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].time = obj.time;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].ref_type = obj.ref_type;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].user_id = obj.user_id;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].standards_acc_tags = obj.standards_acc_tags;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].default_tags = obj.default_tags;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].assessment_value = obj.assessment_value;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].account_role_id = obj.account_role_id;
            this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index].current_user_email = obj.current_user_email;
            this.EditSubReplylocalArry.push(this.comments[parentIndex].Comment.responses[parentSubindex].responses[subreply_index])
            localStorage.setItem('workspace_video_edit_sub_reply_' + this.params.video_id + '_' + this.headerService.getUserId(), JSON.stringify(this.EditSubReplylocalArry));
          }
        }
      }
      if (index > -1) {
        this.comments[parentIndex].Comment.responses[index].comment = obj.comment;
        this.comments[parentIndex].Comment.responses[index].EditEnabled = false;
        this.comments[parentIndex].Comment.responses[index].huddle_id = obj.huddle_id;
        this.comments[parentIndex].Comment.responses[index].account_id = obj.account_id;
        this.comments[parentIndex].Comment.responses[index].edittryagain = true;
        this.comments[parentIndex].Comment.responses[index].videoId = obj.videoId;
        this.comments[parentIndex].Comment.responses[index].for = obj.for;
        this.comments[parentIndex].Comment.responses[index].synchro_time = obj.synchro_time;
        this.comments[parentIndex].Comment.responses[index].time = obj.time;
        this.comments[parentIndex].Comment.responses[index].ref_type = obj.ref_type;
        this.comments[parentIndex].Comment.responses[index].user_id = obj.user_id;
        this.comments[parentIndex].Comment.responses[index].standards_acc_tags = obj.standards_acc_tags;
        this.comments[parentIndex].Comment.responses[index].default_tags = obj.default_tags;
        this.comments[parentIndex].Comment.responses[index].assessment_value = obj.assessment_value;
        this.comments[parentIndex].Comment.responses[index].account_role_id = obj.account_role_id;
        this.comments[parentIndex].Comment.responses[index].current_user_email = obj.current_user_email;
        this.EditReplylocalArry.push(this.comments[parentIndex].Comment.responses[index])
        localStorage.setItem('workspace_video_edit_reply_' + this.params.video_id + '_' + this.headerService.getUserId(), JSON.stringify(this.EditReplylocalArry));
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
    if (!obj.time && obj.time != 0) obj.time = this.FormatToSeconds(file.time)
    this.appMainService.UploadResource(obj).subscribe((data: any) => {

      file.id = data.document_id;
      if (commentId) {

        file.comment_id = commentId;
        let comment = _.findWhere(this.comments, { id: commentId });
        // setTimeout(()=>{});
        this.AttachFilesToComment(comment);

      }

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
      this.commentsSortBy = settings.sortBy;

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

      file.time2 = file.time == this.translation.myfile_all_videos ? 0 : this.FormatToSeconds(file.time);

      comment.time2 = this.FormatToSeconds(comment.time);
      if (((!file.comment_id) && (comment.time2 == file.time2)) || ((file.comment_id) && (file.comment_id == comment.id))) {

        comment.files.push(file);

      }

    })

  }

  private AddTimeStampToResources(files, isFromComment?, fixTime?, commentId?) {
    this.totals.resources_count += files.length;
    if (this.newComment.timeEnabled) {

      files.forEach((f) => {

        f.created_by = this.currnetUser.id;

        f.time = fixTime ? fixTime : this.ConvertTime(this.currentTimeInSeconds);

        if (commentId) {

          let comment = _.findWhere(this.comments, { id: commentId });

          if (comment) {
            f.time = comment.time;
          }


        }

        f.stack_url = f.url;

        f.title = f.filename || f.title;

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

  public selectTab(ev) {
    this.closeInfo();
    this.currentTab = ev;

    if (ev == 3) {
      this.LoadRubricsTabData();
    }

  }

  public LoadRubricsTabData() {

    if (true) {
      this.SelectedPLRubric = {};
      let sessionData: any = this.headerService.getStaticHeaderData();
      delete this.PLcomments;
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

    this.tagIds.push(this.SelectedPLRubric.account_tag_id);
    this.ratingIds.push(id);

    let val = _.findWhere(this.SelectedPLRubric.selectOptions, { id: id });

    let obj = {
      standard_ids: [this.tagIds[this.tagIds.length - 1]],
      // standard_ids: [this.SelectedPLRubric.account_tag_id],
      huddle_id: this.params.huddle_id,
      video_id: this.params.video_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      account_role_id: sessionData.user_current_account.users_accounts.role_id,
      current_user_email: sessionData.user_current_account.User.email
    };
    obj["rating_value_" + this.tagIds[this.tagIds.length - 1]] = val ? val.value : 0;
    obj["rating_id_" + this.tagIds[this.tagIds.length - 1]] = this.ratingIds[this.ratingIds.length - 1];
    // obj["rating_value_" + this.SelectedPLRubric.account_tag_id] = val ? val.value : 0;
    // obj["rating_id_" + this.SelectedPLRubric.account_tag_id] = id;


    this.mainService.SaveRating(obj).subscribe((data: any) => {

      // update global average rating
      if (data.rating_score == 'N/O')
        this.PLTabData.average_rating = '0 - No Rating';
      else {
        let avgRating = this.SelectedPLRubric.selectOptions.find(option => data.rating_score == option.value);
        if (avgRating) this.PLTabData.average_rating = `${avgRating.value} - ${avgRating.text}`;
      }

      // update local variables for rating
      let selectedPLRubric = this.PLTabData.standards.data.account_tag_type_0.find(rubric => {
        return rubric.account_tag_id == this.tagIds[this.tagIds.length - 1];
      });
      if (selectedPLRubric) {
        if (selectedPLRubric.get_selected_rating)
          selectedPLRubric.get_selected_rating.rating_id = this.ratingIds[this.ratingIds.length - 1];
        else
          selectedPLRubric.get_selected_rating = { rating_id: this.ratingIds[this.ratingIds.length - 1] };
      }
      this.tagIds.shift();
      this.ratingIds.shift();

    });

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

  public onTyping(newVal) {

    if (this.newComment.searchHuddleText == '' || !this.newComment.searchHuddleText) {

      this.newComment.all_huddles.forEach((h) => {

        h.valid = true;

      });

      return;

    }

    this.newComment.all_huddles.forEach((h) => {

      h.valid = h.name.toLowerCase().indexOf(this.newComment.all_huddles.searchHuddleText.toLowerCase()) > -1;

    });

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

  private handleParams(args, recursive?) {
    

    if (!recursive) {

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      this.GetRubrics(args.huddle_id, sessionData.user_current_account.accounts.account_id);
      this.mainService.GetVideoResources({ video_id: args.video_id, huddle_id: args.huddle_id, user_id: user_id }).subscribe((data: any) => {

        if (data)
          data.forEach((d) => {

            d.time = (d.scripted_current_duration) ? this.ConvertTime(d.scripted_current_duration) : this.translation.myfile_all_videos;

          })

        if (data)
          this.staticFiles = this.staticFiles.concat(data);

      });

      let interval_id = setInterval(() => {

        let sessionData: any = that.headerService.getStaticHeaderData();

        if (sessionData && sessionData.user_current_account) {
          this.GetVideoStatus(args.video_id);
          this.GetVideo();
          this.GetAttachments();
          clearInterval(interval_id);
        }

      }, 50);
    }


    let that = this;

    let interval = setInterval(() => {

      let headerData: any = that.headerService.getStaticHeaderData();

      if (headerData) {

        clearInterval(interval);

        let account_id = headerData.user_current_account.accounts.account_id;
        let user_id = headerData.user_current_account.User.id;
        let data = {
          "user_id": user_id,
          "video_id": args.video_id,
          "account_id": account_id,
          "huddle_id": args.huddle_id,
          "role_id": headerData.user_current_account.roles.role_id,
          "permission_maintain_folders": headerData.user_permissions.UserAccount.permission_maintain_folders
        }
        // that.GetRubrics(args.huddle_id, account_id);
        that.mainService.GetVideo(data, recursive,'/workspace_video_page').subscribe((data) => {

          that.handleVideo(data);

        });

      }

    });

  }
  private GetAttachments() {
    let sessionData: any = this.headerService.getStaticHeaderData();

    let user_id = sessionData.user_current_account.User.id;
    let args = this.params;
    this.mainService.GetVideoResources({ video_id: args.video_id, huddle_id: args.huddle_id, user_id: user_id }).subscribe((data: any) => {

      if (data)
        data.forEach((d) => {

          d.time = (d.scripted_current_duration) ? this.ConvertTime(d.scripted_current_duration) : this.translation.myfile_all_videos;

        })

      if (data)
        this.staticFiles = this.staticFiles.concat(data);

    })
  }

  private GetVideoStatus(video_id) {
    

    let that = this;

    this.interval_id = setInterval(() => {

      if (that.enabledLoad) {

        that.observationService.LoadObservationVideo({ video_id: video_id, huddle_id: that.params.huddle_id }).subscribe((data: any) => {
          
          if (Number(data.upload_progress) >= 100) {
            clearInterval(this.interval_id);
            that.FullRouter.navigate(["/workspace_video/home/", that.params.huddle_id, video_id]);

            //location.reload();
          } else {
            that.handleVideoVO(data);
          }
        });

      }

    }, 1000);

  }

  private handleVideoVO(data) {
    
    if (data && data.original_file_name) {
      this.options.video_title = data.original_file_name;
      if (!data.huddle_info) data.huddle_info = {};
      data.huddle_info.huddle_title = this.options.video_title;
      this.mainService.huddleInfo.emit(data.huddle_info);
    }
    this.mainService.breadcrumbs.emit(data.bread_crumb_output);





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

        // that.mainService.GetObservationVideo(data).subscribe((data) => {
          that.mainService.GetVideo(data, false,'/workspace_video_page').subscribe((data) => {
          that.handleVideoData(data);

        });

      }

    });
  }
  private initPlayer(url) {

    this.GetVideo();

  }

  private handleVideoData(data) {

    if (!data.success) {

      this.toastr.info(this.translation.myfile_you_dont_permission);

      setTimeout(() => {

        location.href = environment.baseUrl;

      }, 1000);

      return;


    }

    this.isAuthenticatedUser = true;
    this.src = { "path": this.options.video_url, "type": "video/mp4" };
    this.comments = data.comments.Document.comments;
    this.ApplySettings({ sortBy: 0 });

    /**Adding try again add comments from localstorage start */
    let addCommentTAArray = this.headerService.getLocalStorage(this.addCommentTAKey);
    if (Array.isArray(addCommentTAArray)) this.tmpCommentArrayForLocalStorage = addCommentTAArray;
    this.tmpCommentArrayForLocalStorage.forEach(c => {
      if (c != undefined && c != null) {
        this.comments.unshift(c);
        // this.comments = [...this.comments]
      }
    });
    /**Adding try again add comments from localstorage end */

    /**Adding try again edit comments from localstorage start */
    let tmpLSEditComments = this.headerService.getLocalStorage(this.editCommentTAKey);
    if (Array.isArray(tmpLSEditComments)) {
      this.tmpEditCommentArrayForLocalStorage = tmpLSEditComments;
      this.tmpEditCommentArrayForLocalStorage.forEach(lscomment => {
        const index = this.comments.findIndex(c => c.id == lscomment.comment_id);
        if (index > -1) {
          this.comments[index].tryAgain = true;
          this.comments[index].huddle_id = lscomment.huddle_id;
          this.comments[index].account_id = lscomment.account_id;
          this.comments[index].comment_id = lscomment.comment_id;
          this.comments[index].videoId = lscomment.videoId;
          this.comments[index].for = lscomment.for;
          this.comments[index].synchro_time = lscomment.synchro_time;
          this.comments[index].time = lscomment.time;
          this.comments[index].ref_type = lscomment.ref_type;
          this.comments[index].comment = lscomment.comment;
          this.comments[index].user_id = lscomment.user_id;
          this.comments[index].standards_acc_tags = lscomment.standards_acc_tags;
          this.comments[index].default_tags_value = lscomment.default_tags_value;
          this.comments[index].assessment_value = lscomment.assessment_value;
          this.comments[index].account_role_id = lscomment.account_role_id;
          this.comments[index].current_user_email = lscomment.current_user_email;
        }
      })

    }
    /**Adding try again edit comments from localstorage end */

    this.CustomMarkers = data.custom_markers;
    this.prepareComments(this.comments);
    this.totals.comment_count = data.comments_counts.total_comments;
    // this.totals.resources_count = data.attached_document_numbers;
    // this.VideoInfo = data.video_detail;
    // this.VideoInfo.h_type = data.h_type;
    // this.VideoInfo.huddle_type = data.huddle_type;
    this.settings.PauseWhileTyping = Boolean(data.user_pause_settings);
    this.permissions.rubric_check = data.rubric_check;
    this.permissions.coaching_perfomance_level = Number(data.coaching_perfomance_level);
    this.permissions.performance_level_check = data.performance_level_check;
    this.permissions.coaching_summary_check = data.coaching_summary_check;
    this.permissions.assessment_summary_check = data.assessment_summary_check;
    this.permissions.can_comment = data.can_comment;
    this.permissions.can_reply = data.can_reply;
    this.permissions.can_rate = data.can_rate;
    this.permissions.showCopy = data.can_dl_edit_delete_copy_video;
    this.VideoInfo.defaultFramework = (data.default_framework) ? data.default_framework : 0;

    if (this.scriptMode) {
      this.options.script_published = data.video_object_detail.published == 1;
      this.options.video_title = data.video_object_detail.original_file_name;
      data.huddle_info.huddle_title = this.options.video_title;
      this.mainService.breadcrumbs.emit(data.bread_crumb_output);
      this.mainService.huddleInfo.emit(data.huddle_info);
    }

    /** Restoring comment from localStorage start */
    const restoredComment = this.headerService.getLocalStorage(this.addCommentLSKey);
    if (restoredComment) {
      this.lsCommentExisted = true;
      this.newComment.commentText = restoredComment.comment;
      this.newComment.audioDuration = restoredComment.audioDuration;
      this.newComment.ref_type = restoredComment.ref_type;
      this.SetCustomTags(restoredComment.customTags);
      this.newComment.files = restoredComment.files;
      this.selectedRubrics = restoredComment.selectedRubrics;
      this.newComment.timeEnabled = restoredComment.timeEnabled;

      if(restoredComment.localAudio) { 
        this.newComment.audioUrl = restoredComment.audioUrl;
        this.newComment.localAudio = restoredComment.localAudio;
        this.audioRecorderState = 'play';
        this.localAudioData.localAudio = restoredComment.localAudio;
        this.localAudioData.audioUrl = restoredComment.audioUrl;
        this.localAudioData.audioRecorderState = this.audioRecorderState;
      }

      if (restoredComment.selectedCustomMarker) {
        this.CustomMarkers.forEach(marker => {
          if (marker.tag_title == restoredComment.selectedCustomMarker) {
            this.ChooseCustomTag(marker);
          }
        });
      }
      if (restoredComment.time) {
        this.comment_start_time_string = this.ConvertTime(restoredComment.time);
        this.comment_start_time = this.ConvertTime(restoredComment.time);
      } else {
        this.comment_start_time_string = 'All Video';
      }
      // this.GetTime(this.ConvertTime(ParsedDataFromLs.time)) Todo: set time for accuracy
    }

    /** Restoring comment from localStorage end */

    /** Restoring edit comment from localStorage start */

    const restoredEditComment = this.headerService.getLocalStorage(this.editCommentLSKey);
    if (restoredEditComment && restoredEditComment.comment_id) {
      let commentExisted = this.comments.find(comment => comment.id == restoredEditComment.comment_id);
      if (commentExisted) {
        this.lsCommentExisted = true;
        commentExisted.EditEnabled = true;
        commentExisted.replyEnabled = false;

        if (restoredEditComment.time == 0) {
          this.newComment.timeEnabled = false;
        }
        this.EditMode = true;

        // this.AttachFilesToComment(restoredEditComment);
        this.EditableComment = restoredEditComment;
        this.EditableComment.id = restoredEditComment.comment_id;
        this.newComment.timeEnabled = restoredEditComment.time >= 0;
        this.newComment.commentText = restoredEditComment.comment;
        this.newComment.audioDuration = restoredEditComment.audioDuration;
        this.videoOldTime = this.ConvertTime(restoredEditComment.time).split(":");
        this.VideoCurrentTime = this.ConvertTime(restoredEditComment.time);
        this.comment_start_time_string = this.ConvertTime(restoredEditComment.time);
        this.comment_start_time = this.ConvertTime(restoredEditComment.time);

        if (this.VideoCurrentTime == this.translation.myfile_all_videos) {
          this.newComment.timeEnabled = false;
        }
        this.VideoCurrentTime = this.VideoCurrentTime == this.translation.myfile_all_videos ? this.VideoCurrentTime : this.VideoCurrentTime.split(":");

        // this.newComment.files = restoredEditComment.files;
        window.scrollTo(0, document.body.scrollHeight - 30);

        this.SetCustomTags(restoredEditComment.customTags);
        this.newComment.files = restoredEditComment.files;
        this.selectedRubrics = restoredEditComment.selectedRubrics;

        if (restoredEditComment.selectedCustomMarker) {
          this.CustomMarkers.forEach(marker => {
            if (marker.tag_title == restoredEditComment.selectedCustomMarker) {
              this.ChooseCustomTag(marker);
            }
          });
        }
        // if(restoredEditComment.time) this.VideoCurrentTime = this.ConvertTime(restoredEditComment.time);

      }
    }

    /** Restoring edit comment from localStorage end */

  }
  private handleVideo(data) {

    // if(!data.success){

    //   this.toastr.info(this.translation.u_dont_permission);

    //   setTimeout(()=>{

    //     location.href = environment.baseUrl;

    //   }, 1000);

    //   return ;


    // }
    // this.isAuthenticatedUser = true;
    // this.isVideoProcessing = data.video_detail.published!=1;

    // if(!this.isVideoProcessing)
    // this.src = {"path":data.static_url, "type":"video/mp4"};

    // this.comments = data.comments.Document.comments;
    // this.ApplySettings({sortBy:0});
    this.CustomMarkers = data.custom_markers;
    // this.prepareComments(this.comments);
    // this.totals.comment_count = data.comments_counts.total_comments;
    // this.totals.resources_count = data.attached_document_numbers;
    this.VideoInfo = data.video_detail;
    this.VideoInfo.h_type = data.h_type;
    this.VideoInfo.huddle_type = data.huddle_type;
    // this.settings.PauseWhileTyping = Boolean(data.user_pause_settings);
    // this.settings.autoscroll = Boolean(data.user_autoscroll_settings);
    // this.permissions.rubric_check = data.rubric_check;
    // this.permissions.performance_level_check = data.performance_level_check;
    // this.permissions.coaching_summary_check = data.coaching_summary_check;
    // this.permissions.assessment_summary_check = data.assessment_summary_check;
    // this.permissions.can_comment = data.can_comment;
    // this.permissions.can_reply = data.can_reply;
    // this.permissions.can_rate = data.can_rate;
    // this.permissions.huddle_permission = data.user_huddle_level_permissions;
    // this.permissions.showCopy = data.can_dl_edit_delete_copy_video;
    this.permissions.AllowCustomMarkers = data.video_markers_check == "1";
    // data.huddle_info.huddle_title = this.VideoInfo.title;
    // this.mainService.breadcrumbs.emit(data.bread_crumb_output);
    // this.mainService.huddleInfo.emit(data.huddle_info);
    // this.VideoInfo.coaching_link = data.coaching_link;
    // this.VideoInfo.assessment_link = data.assessment_link;
    // this.permissions.get_account_video_library_permissions = data.get_account_video_library_permissions;
    // this.VideoTotalTime = data.video_duration;
    this.VideoInfo.defaultFramework = data.account_framework;
    // this.permissions.framework_selected_for_video = data.framework_selected_for_video=="1";

    // if(this.permissions.framework_selected_for_video){
    //   this.VideoInfo.defaultFramework = data.default_framework;
    // }

    if (this.VideoInfo.h_type == 2) {
      this.VideoInfo.coachee_name = data.coachee_name;
      this.VideoInfo.coaches_name = data.coaches_name;
    } else if (this.VideoInfo.h_type == 3) {

      this.VideoInfo.assessor_names = data.assessor_names;
      this.VideoInfo.eval_participant_names = data.eval_participant_names;

    }
    // let sessionData:any = this.headerService.getStaticHeaderData();

    // this.permissions.permission_video_library_upload = sessionData.user_current_account.users_accounts.permission_video_library_upload==1;

    //   this.init_crop();

    //   if(this.isVideoProcessing){
    //     setTimeout(()=>{

    //     this.handleParams(this.params, true);

    //   }, 5000);
    // }

    if (this.VideoInfo.defaultFramework != -1 && void 0 != this.VideoInfo.defaultFramework) {

      this.VideoHuddleFramework = this.VideoInfo.defaultFramework;

    } else {

      this.VideoHuddleFramework = 0;

    }

    if (data.framework_selected_for_video == "1") {

      this.VideoHuddleFramework = this.VideoInfo.defaultFramework;//data.default_framework;
      this.GetRubricById(data.default_framework, true);

      let sessionData: any = this.headerService.getStaticHeaderData();

      this.permissions.permission_video_library_upload = sessionData.user_current_account.users_accounts.permission_video_library_upload == 1;

    } else {
      this.GetRubricById(this.VideoHuddleFramework, true);
    }

  }

  private prepareComments(comments) {

    comments.forEach((c) => {

      c.valid = true;

      c.ReplyTouched = false;

      if (c.time == null) c.time = 0;

      if (c.default_tags.length > 0) {

        c.default_tags.forEach((dt) => {

          if (dt) {
            let index = _.findIndex(this.CustomMarkers, { account_tag_id: dt.account_tag_id });

            if (index >= 0) {
              if (!c.customMarkers) c.customMarkers = [];
              c.customMarkers.push(dt);
            } else {

              if (!c.defaultTags) c.defaultTags = [];
              c.defaultTags.push(dt);

            }
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

        this.toastr.info(this.translation.myfile_videos_has_been_deleted);

        setTimeout(() => {

          let path = environment.baseUrl + "/MyFiles";

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

    let link = this.VideoInfo.h_type == "2" ? environment.baseUrl + "/Dashboard/coach_tracker" : this.VideoInfo.h_type == "3" ? environment.baseUrl + "/Dashboard/assessment_tracker" : "";

    if (link) {
      window.open(link, "_blank");
    }

    setTimeout(() => {
      this.ActivateTab(this.currentTab);
    });

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

          if (c && c.Comment && c.Comment.responses) {

            let _index = _.findIndex(c.Comment.responses, { id: id });

            if (_index > -1) {
              index = _index;
              parent = c;
            }

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
    this.prepareEditComment(c);

  }

  public confirmExit(e) {

    if (!this.EnablePublish) return;

    var message = this.translation.myfile_your_confirmation,
      e = e || window.event;
    // For IE and Firefox
    if (e) {
      e.returnValue = message;
    }

    // For Safari
    return message;
  }


  private prepareEditComment(comment) {

    this.AttachFilesToComment(comment);
    this.EditableComment = comment;
    this.newComment.timeEnabled = comment.time >= 0;
    this.newComment.commentText = comment.comment;
    this.newComment.audioDuration = comment.audioDuration;
    this.newComment.audioUrl = comment.comment;
    this.newComment.ref_type = comment.ref_type;
      this.tempEditComment = this.newComment;
    this.localAudioData = {};
    if(this.newComment.ref_type == 6)
    {
        this.commentTextstatus=false;
    }
    else
    {
        this.commentTextstatus=true;
    }
    this.audioRecorderState = "comfortZone";
    this.VideoCurrentTime = this.ConvertTime(comment.time);
    this.comment_start_time_string = this.ConvertTime(comment.time);
    this.comment_start_time = this.ConvertTime(comment.time);

    if (this.VideoCurrentTime == this.translation.myfile_all_videos) {
      this.newComment.timeEnabled = false;
    }
    this.VideoCurrentTime = this.VideoCurrentTime == this.translation.myfile_all_videos ? this.VideoCurrentTime : this.VideoCurrentTime.split(":");//Object.assign({},this.VideoCurrentTime.split(":"));

    this.newComment.files = comment.files;
    window.scrollTo(0, document.body.scrollHeight - 30);

    this.tags = [];

    this.selectedRubrics = [];

    comment.default_tags.forEach((dt) => {

      let index = _.findIndex(this.CustomMarkers, { account_tag_id: dt.account_tag_id });

      if (index > -1) {

        this.selectedTag = this.CustomMarkers[index];
      }
      //  }else{
      this.perpareEditableTag(dt);
      // }

    });

    comment.standard.forEach((c) => {

      // this.editableRubrics.push(c.account_tag_id);
      let index = _.findIndex(this.rubrics.account_tag_type_0, { account_tag_id: c.account_tag_id });

      if (index > -1) {

        this.rubrics.account_tag_type_0[index].selected = true;
        this.selectedRubrics.push(this.rubrics.account_tag_type_0[index]);

      }

    });
    if(comment.ref_type == 6 && this.audioPlayer)
    {
        this.audioPlayer.nativeElement.load();
    }
  }

  private perpareEditableTag(tag) {
    if (tag.tag_type == void 0)
      this.tags.push({ text: tag.tag_title, id: this.tags.length + 1 });

  }

  public TriggerTextChange(ev) {
    if (this.settings.PauseWhileTyping) {

      this.playerService.ModifyPlayingState("pause");

    }
    if (this.newComment.commentText && this.newComment.commentText.length <= 1) {
      this.comment_start_time_string = this.options.current_time;//this.ConvertTime(this.comment_start_time);
      this.comment_start_time = this.options.current_time;
    }
    if (ev.keyCode == 13 && this.settings.EnterToPost) {

      ev.preventDefault();
      this.comment_start_time_string = "";
      if (!this.EditMode) {
        this.AddTextComment();
      } else {
        this.EditTextComment(1);
      }


    }


  }
  public TriggerTextChangeKeyup(ev) {
    if (this.newComment.commentText && this.newComment.commentText.length >= 1) {
      if (!this.comment_start_time_string) {
        this.comment_start_time_string = this.comment_start_time;
        this.comment_start_time = this.options.current_time;
      }
    }
    if (ev.keyCode == 13 && this.settings.EnterToPost) {
      this.comment_start_time_string = "";
    }
    if ((ev.keyCode == 8 || ev.keyCode == 88) && this.newComment.commentText == '') {
      this.comment_start_time_string = "";
    }
  }

  public allowToComment() {

    let tags = this.GetCustomTags();
    let result = true;
    if ((!this.newComment.commentText || this.newComment.commentText == ""))
      result = true;

    if (this.newComment.commentText || (this.newComment.commentText != "" && this.newComment.commentText != undefined))
      result = false;

    if (!!!_.isEmpty(this.selectedTag) || (!_.isEmpty(tags)) || !!(this.newComment.files && this.newComment.files.length > 0) || !!(this.selectedRubrics.length > 0))
      result = false;

    return result;


  }



  public AddTextComment() {
      if(this.audioRecorderState == "resume")
      {
          this.autoSaveAudio = "add";//Sending save event to audio component to auto save audio comment.
          return;
      }
      this.autoSaveAudio = "";
    this.localAudioData = {};
    if (!this.currentTimeInSeconds) {
      //this.currentTimeInSeconds = this.getSecondsFromTimeString(this.options.current_time);
      this.currentTimeInSeconds = this.getSecondsFromTimeString(this.comment_start_time);//changes by asad
    }
    this.currentTimeInSeconds = this.getSecondsFromTimeString(this.comment_start_time);//changes by asad
    //this.currentTimeInSeconds = this.getSecondsFromTimeString(this.options.current_time);


    // !this.newComment.commentText || this.newComment.commentText==""
    let allowComment = this.allowToComment()
    if (allowComment) {

      //this.toastr.info(this.translation.please_enter_text_to_comment);
      this.toastr.info(this.translation.please_enter_text_to_post_note);
      return;

    } else {

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj = {
        videoId: this.params.video_id,
        for: (this.newComment.timeEnabled) ? "synchro_time" : "",
        synchro_time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : 0,
        time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : 0,
        ref_type: this.newComment.ref_type || '2',
        comment: this.newComment.commentText || "",
        audio_duration: this.newComment.audioDuration || null,
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

      this.LoadPublishSettings();
      this.newComment.commentText = "";
      // this.totals.comment_count++;
      // let comment = data["0"];
      // let fake_id = data["0"].fake_id;
      // comment.valid=true;
      if (this.newComment.files && this.newComment.files.length > 0) {

        // this.staticFiles = this.staticFiles.concat(this.newComment.files);

        files = this.newComment.files;

        // this.AddTimeStampToResources(this.newComment.files, true, obj.time);

      }

      if (this.settings.PauseWhileTyping) {

        this.playerService.PlayerPlayingState.emit("play");

      }

      this.ActivateTab(0);
      let preparedCommentObj: any = this.PrepareFakeComment(obj, sessionData);
      if(obj.ref_type == 6 && this.newComment.localAudio && this.newComment.audioUrl) {
        preparedCommentObj.comment = this.newComment.audioUrl;
      }
      this.comments.unshift(preparedCommentObj);
      if(this.commentsSortBy != 0) this.ApplySettings({sortBy: this.commentsSortBy});
      this.ResetForm();

      this.headerService.removeLocalStorage(this.addCommentLSKey);

      this.appMainService.AddComment(obj).subscribe((data: any) => {

        if (data.status == "success") {

          /** this logic has been moved to socket "comment_added" start */
          // this.LoadPublishSettings();

          // this.totals.comment_count++;
          // let comment = data["0"];
          // let fake_id = data["0"].fake_id;
          // comment.valid = true;

          // let index = _.findIndex(this.comments, { fake_id: fake_id });
          // if (index > -1) {

          //   this.comments[index] = comment;
          //   this.mainService.CommentAddedNotification.emit(comment);

          // }
          /** this logic has been moved to socket "comment_added" end */

          if (files.length > 0) {

            this.AddTimeStampToResources(files, true, obj.time, data[0].id);

          }
          this.comment_start_time_string = "";
        } else {

          this.toastr.info(this.translation.something_went_wrong_msg);
        }

      }, error => {

        /** Adding text comment to localstorage for try again start */
        preparedCommentObj.tryAgain = true;
        preparedCommentObj.uuid = `${new Date().getTime()}-${this.params.video_id}`;
        preparedCommentObj.videoId = obj.videoId;
        preparedCommentObj.for = obj.for;
        preparedCommentObj.synchro_time = obj.synchro_time;
        preparedCommentObj.comment=obj.comment;
        preparedCommentObj.audioDuration=obj.audio_duration;
        preparedCommentObj.ref_type = obj.ref_type;
        preparedCommentObj.standards_acc_tags = obj.standards_acc_tags;
        preparedCommentObj.default_tags_value = obj.default_tags;
        preparedCommentObj.assessment_value = obj.assessment_value;
        preparedCommentObj.company_name = obj.company_name;
        preparedCommentObj.account_role_id = obj.account_role_id;
        preparedCommentObj.current_user_email = obj.current_user_email;
        preparedCommentObj.filesArray = files;

        this.tmpCommentArrayForLocalStorage.push(preparedCommentObj)
        this.headerService.setLocalStorage(this.addCommentTAKey, this.tmpCommentArrayForLocalStorage);
        /** Adding text comment to localstorage for try again end */

      });
    }

  }

  private getSecondsFromTimeString(timeString: string) {
    if (!timeString || timeString == null) return null;
    let timeStringSplit = timeString.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    return (+timeStringSplit[0]) * 60 * 60 + (+timeStringSplit[1]) * 60 + (+timeStringSplit[2]);

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
  public EditTextComment(flag) {
    if (flag == 0) {
      this.ResetForm();
      return;
    }

      if(this.audioRecorderState == "resume")
      {
          this.autoSaveAudio = "edit";//Sending save event to audio component to auto save audio comment.
          return;
      }
      
      // If the audio is previously saved then get the actual path of comment and send to api
      if(this.newComment.commentText.indexOf('?Expires') > 0) {
        const toIndex = this.newComment.commentText.indexOf('?Expires');
        const fromIndex = this.newComment.commentText.indexOf('uploads/');
        this.newComment.commentText = this.newComment.commentText.slice(fromIndex, toIndex);
      }

      this.autoSaveAudio = "";
      this.localAudioData = {};

    this.headerService.removeLocalStorage(this.editCommentLSKey);

   
    if (!this.EditableComment) {
      this.toastr.info(this.translation.something_went_wrong_msg);
      return;
    }

    // !this.newComment.commentText || this.newComment.commentText==""
    let allowComment = this.allowToComment()
    if (allowComment) {

      // this.toastr.info(this.translation.please_enter_text_to_comment);
      this.toastr.info(this.translation.please_enter_text_to_post_note);
      return;

    } else {
      if (this.newComment.timeEnabled && (this.VideoTotalTime < this.FormatToSeconds(this.VideoCurrentTime.join(":")))) {

        this.toastr.info(this.translation.comment_time_ahead);
        return;

      }
      let files = [];
      if (this.newComment.files && this.newComment.files.length > 0) {

        this.newComment.files = this.newComment.files.filter((f) => { return !f.id; });

        // this.staticFiles = this.staticFiles.concat(this.newComment.files);
        this.AddTimeStampToResources(this.newComment.files, true, this.EditableComment.time, this.EditableComment.id);

      }

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let account_id = sessionData.user_current_account.accounts.account_id;
      let huddle_id = this.params.huddle_id;

      if(this.selectedTag) this.selectedTagTemp = JSON.parse(JSON.stringify(this.selectedTag));

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

        ref_type: this.newComment.ref_type || '2',
        comment: this.newComment.commentText,
        audio_duration: this.newComment.audioDuration,
        user_id: user_id,
        standards_acc_tags: this.PrepareRubrics(),
        default_tags: this.GetCustomTags(),
        assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
        account_role_id: sessionData.user_current_account.users_accounts.role_id,
        current_user_email: sessionData.user_current_account.User.email


      };

      const commentIndex = this.comments.findIndex(c => c.id == this.EditableComment.id);
      this.ResetForm();

      this.appMainService.EditComment(obj).subscribe((data: any) => {
        
        if (data.status == "success") {
          this.toastr.success(this.translation.comment_updated_successfully);
          /** this logic has been moved to comment_edited socket start */
          // let index = _.findIndex(this.comments, { id: this.EditableComment.id });
          // if (index > -1) {

          //   this.comments[index] = data.updated_comment;
          //   this.comments[index].valid = true;

          //   setTimeout(() => { this.AttachFilesToComment(this.comments[index]); }, 1000);

          //   this.EditableComment = {};
          //   this.mainService.ReRenderMarkers.emit(true);
          //   this.ResetForm();
          // }
          /** this logic has been moved to comment_edited socket end */

        } else {
          this.toastr.info(this.translation.something_went_wrong_msg);
        }

      }, error => {

        /** Adding edited comment to try again localstorage start */
        if (commentIndex > -1) {
          this.comments[commentIndex].tryAgain = true;
          this.comments[commentIndex].huddle_id = obj.huddle_id;
          this.comments[commentIndex].account_id = obj.account_id;
          this.comments[commentIndex].comment_id = obj.comment_id;
          this.comments[commentIndex].videoId = obj.videoId;
          this.comments[commentIndex].for = obj.for;
          this.comments[commentIndex].synchro_time = obj.synchro_time;
          this.comments[commentIndex].time = obj.time;
          this.comments[commentIndex].ref_type = obj.ref_type;
          this.comments[commentIndex].comment = obj.comment;
          this.comments[commentIndex].audioDuration = obj.audio_duration;
          this.comments[commentIndex].user_id = obj.user_id;
          this.comments[commentIndex].standards_acc_tags = obj.standards_acc_tags;
          this.comments[commentIndex].default_tags = [this.selectedTagTemp ? this.selectedTagTemp : ''];
          this.comments[commentIndex].default_tags_value = obj.default_tags;
          this.comments[commentIndex].assessment_value = obj.assessment_value;
          this.comments[commentIndex].account_role_id = obj.account_role_id;
          this.comments[commentIndex].current_user_email = obj.current_user_email;

          let objToBeStored = JSON.parse(JSON.stringify(obj));
          objToBeStored.tryAgain = true;
          objToBeStored.default_tags_value = obj.default_tags;
          objToBeStored.default_tags = [this.selectedTagTemp ? this.selectedTagTemp : ''];
          objToBeStored.filesArray = files;
          // lsObj.default_tags = [!_.isEmpty(this.selectedTag) && this.selectedTag !== null && this.selectedTag !== undefined ? this.selectedTag : ''];
          this.tmpEditCommentArrayForLocalStorage.push(objToBeStored);

          this.headerService.setLocalStorage(this.editCommentTAKey, this.tmpEditCommentArrayForLocalStorage);

        }
        /** Adding edited comment to try again localstorage start */

      });
      this.ActivateTab(0);
      // this.comments.unshift(this.PrepareFakeComment(obj, sessionData));

    }

  }

  private ResetForm() {

    this.newComment.commentText = "";
    this.newComment.audioDuration = null;
    this.newComment.audioUrl = '';
    this.newComment.localAudio = false;
    this.newComment.ref_type = 2;
    this.newComment.files = [];
    this.selectedRubrics = [];
  	this.localAudioData = {};
    this.mainService.ResetCustomTags();
    this.mainService.ResetSelectedRubrics();
    // this.rubrics.forEach((r)=>{r.selected=false;});
    // this.EditableComment = {};
    this.EditableComment = {};
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
      "time": comment.time || 0,
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
      "created_date_string": "a few seconds ago",
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

    if (!n || n == null || n == 0) return this.translation.myfile_all_video;//"00:00:00";
    let sec_num: any = parseInt(n, 10);
    let hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: any = sec_num - (hours * 3600) - (minutes * 60);

    if (hours == 0 && minutes == 0 && seconds == 0) {
      return this.translation.myfile_all_video;
    }

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    return hours + ':' + minutes + ':' + seconds;
  }

  public closeInfo(changeTabe = 0, changeToTab = 0, fromTab = 0) {
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
      location.href = "sibme://play_video/?huddleID=" + huddle_id + "&videoID=" + video_id + "&isWorkspace=true&account_id=" + account_id;
    }

  }

  public getSelectFrameworkPermission() {

    let flag = false;

    if (this.permissions.framework_selected_for_video != "1") {
      flag = true;
    }
    return flag;

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

        /** In case of add comment local storage selected framewors then also select framework rubric start */
        const restoredComment = this.headerService.getLocalStorage(this.addCommentLSKey);
        if (restoredComment && Array.isArray(restoredComment.selectedRubrics)) {
          restoredComment.selectedRubrics.forEach(lsRubric => {
            let rubricExisted = this.rubricPreview.account_tag_type_0.find(rubric => rubric.account_tag_id == lsRubric.account_tag_id);
            if (rubricExisted) rubricExisted.selected = true;
          });
        }
        /** In case of add comment local storage selected framewors then also select framework rubric end */

        /** In case of edit comment local storage selected framewors then also select framework rubric start */
        const restoredEditComment = this.headerService.getLocalStorage(this.editCommentLSKey);
        if (restoredEditComment && Array.isArray(restoredEditComment.selectedRubrics)) {
          restoredEditComment.selectedRubrics.forEach(lsRubric => {
            let rubricExisted = this.rubricPreview.account_tag_type_0.find(rubric => rubric.account_tag_id == lsRubric.account_tag_id);
            if (rubricExisted) rubricExisted.selected = true;
          });
        }
        /** In case of edit comment local storage selected framewors then also select framework rubric end */

        if (assign) {

          this.rubrics = this.rubricPreview;

        }

      });
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
            this.toastr.info("Framework is already selected for this video.");
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

  public onTryAgainUpdate(eventData: any) {

    // const index = this.comments.findIndex(c => c.uuid == eventData.oldCommentuuid);
    // if (index > -1) {
    //   this.comments[index] = eventData.updatedComment;
    //   this.mainService.CommentAddedNotification.emit(eventData.updatedComment);
    // }

    // remove from tmpCommentArrayForLocalStorage and add files
    const commentIndex = this.tmpCommentArrayForLocalStorage.findIndex(c => c.uuid == eventData.oldCommentuuid);
    if (commentIndex > -1) {
      let commnetObj = this.tmpCommentArrayForLocalStorage[commentIndex]
      if (commnetObj.filesArray && commnetObj.filesArray.length > 0) {
        let filesToBeAddedInStaticFiles = [];
        commnetObj.filesArray.forEach(file => {
          let fileExisted = this.staticFiles.find(staticFile => staticFile.id == file.id);
          if (!fileExisted) filesToBeAddedInStaticFiles.push(file);
        });

        // if(filesToBeAddedInStaticFiles.length > 0) this.staticFiles = this.staticFiles.concat(filesToBeAddedInStaticFiles);

        this.AddTimeStampToResources(commnetObj.filesArray, true, commnetObj.time, eventData.updatedComment.id);

      }

      this.tmpCommentArrayForLocalStorage.splice(commentIndex, 1);
      this.headerService.setLocalStorage(this.addCommentTAKey, this.tmpCommentArrayForLocalStorage);
    }
  }
  /** Socket functionality starts */
  private socketPushFunctionComment() {
    if (this.params.huddle_id) {
      this.subscriptions.add(this.socketService.pushEventWithNewLogic(`huddle-details-${this.params.huddle_id}`).subscribe(data => this.processEventSubscriptions(data)));
    }

    this.subscriptions.add(this.socketService.pushEventWithNewLogic(`video-details-${this.params.video_id}`).subscribe(data => this.processEventSubscriptions(data)));

    let workspaceChannelName = `workspace-${this.header_data.user_current_account.users_accounts.account_id}-${this.header_data.user_current_account.users_accounts.user_id}`;
    this.subscriptions.add(this.socketService.pushEventWithNewLogic(workspaceChannelName).subscribe(data => this.processEventSubscriptions(data)));
  }

  private processEventSubscriptions(res) {

    // this.subscriptions.add(this.socketService.EventData.subscribe(res => {
    console.log("websockets res ", res)
    switch (res.event) {
      case "comment_added":
        this.processCommentAdded(res.data);
        break;
      case "comment_edited":
        this.processCommentEdited(res.data);
        break;
      case "comment_deleted":
        this.processCommentDeleted(res.parent_comment_id, res.item_id);
        break;
      case "resource_added":
        this.processResourceAdded(res.data);
        break;
      case "attachment_deleted":
        this.processAttachmentDeleted(res.data);
        break;
    }

    // }));
  }

  private processCommentAdded(comment) {

    /* comment add section start */
    if (!comment.parent_comment_id) {
      this.LoadPublishSettings();
      this.totals.comment_count++;
      this.mainService.CommentAddedNotification.emit(comment);
      let commentIndex = this.comments.findIndex(c => c.fake_id == comment.fake_id);
      if (commentIndex > -1) {
        delete comment.fake_id;
        this.comments[commentIndex] = comment;
      }
      else this.comments.unshift(comment);
      /* comment add section end */
    } else {

      /* reply add section start */
      let found = false;
      let commentIndex = this.comments.findIndex(c => c.id == comment.parent_comment_id);

      if (commentIndex > -1) {
        found = true;

        this.comments[commentIndex].replyEnabled = false;
        this.comments[commentIndex].replyAdding = true;
        this.comments[commentIndex].replyAdding = false;
        this.comments[commentIndex].replyText = "";

        let replyIndex = this.comments[commentIndex].Comment.responses.findIndex(r => r.uuid == comment.uuid);
        if (replyIndex > -1) {
          this.comments[commentIndex].Comment.responses[replyIndex] = comment;
          delete this.comments[commentIndex].Comment.responses[replyIndex].fakeComment;
        } else {
          if (!this.comments[commentIndex].Comment) this.comments[commentIndex].Comment = {};
          if (!this.comments[commentIndex].Comment.responses) this.comments[commentIndex].Comment.responses = [];
          this.comments[commentIndex].Comment.responses.push(comment);
        }
        this.totals.comment_count++;
        /* reply add section end */
      }

      /* sub-reply add section start */
      if (!found) {
        this.comments.forEach((c) => {

          if (c.Comment.responses && c.Comment.responses.length > 0) {
            let replyIndex = c.Comment.responses.findIndex(response => response.id == comment.parent_comment_id);
            if (replyIndex > -1) {
              c.Comment.responses[replyIndex].replyText = "";

              let subReplyIndex = c.Comment.responses[replyIndex].responses.findIndex(sr => sr.uuid == comment.uuid);
              if (subReplyIndex > -1) {
                c.Comment.responses[replyIndex].responses[subReplyIndex] = comment;
                delete c.Comment.responses[replyIndex].responses[subReplyIndex].fakeComment;
                delete c.Comment.responses[replyIndex].responses[subReplyIndex].tryAgain;
              } else {
                if (!c.Comment.responses[replyIndex].responses) c.Comment.responses[replyIndex].responses = [];
                c.Comment.responses[replyIndex].responses.push(comment);
              }
              this.totals.comment_count++;
            }
          }

        });

      }
      /* sub-reply add section end */
    }
    if(this.commentsSortBy != 0) this.ApplySettings({sortBy: this.commentsSortBy});

  }

  public onEditTryAgainUpdate(eventData: any) {
    // this.LoadPublishSettings()

    // const index = this.comments.findIndex(c => c.id == eventData.comment_id);
    // if (index > -1) {
    //   this.comments[index] = eventData.updatedComment;
    // }

    // remove from tmpEditCommentArrayForLocalStorage
    const commentIndex = this.tmpEditCommentArrayForLocalStorage.findIndex(c => c.comment_id == eventData.comment_id);
    if (commentIndex > -1) {

      let commnetObj = this.tmpEditCommentArrayForLocalStorage[commentIndex]
      if (commnetObj.filesArray && commnetObj.filesArray.length > 0) {
        let filesToBeAddedInStaticFiles = [];
        commnetObj.filesArray.forEach(file => {
          let fileExisted = this.staticFiles.find(staticFile => staticFile.id == file.id);
          if (!fileExisted) filesToBeAddedInStaticFiles.push(file);
        });

        // if(filesToBeAddedInStaticFiles.length > 0) this.staticFiles = this.staticFiles.concat(filesToBeAddedInStaticFiles);

        this.AddTimeStampToResources(commnetObj.filesArray, true, commnetObj.time, eventData.updatedComment.id);

      }

      this.tmpEditCommentArrayForLocalStorage.splice(commentIndex, 1);
      this.headerService.setLocalStorage(this.editCommentTAKey, this.tmpEditCommentArrayForLocalStorage);
    }

  }

  private storeCommentToLocalStorage() {

    let key = this.addCommentLSKey;

      // prepare object to store in localstorage
      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj:any = {
        videoId: this.params.video_id,
        for: (this.newComment.timeEnabled) ? "synchro_time" : "",
        synchro_time: (this.newComment.timeEnabled) ? Math.floor(this.getSecondsFromTimeString(this.comment_start_time)) : '',
        time: (this.newComment.timeEnabled) ? Math.floor(this.getSecondsFromTimeString(this.comment_start_time)) : 0,
        ref_type: this.newComment.ref_type || 2,
        comment: this.newComment.commentText || "",
        audioDuration: this.newComment.audioDuration || null,
        audioUrl: this.newComment.audioUrl,
        localAudio: this.newComment.localAudio,
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
        current_user_email: sessionData.user_current_account.User.email,
        files: this.newComment.files,
        customTags: this.tags,
        selectedRubrics: this.selectedRubrics,
        selectedCustomMarker: (!_.isEmpty(this.selectedTag)) ? this.selectedTag.tag_title : "",
        timeEnabled: this.newComment.timeEnabled
      };

    if (this.EditMode) {
      key = this.editCommentLSKey;
      obj.time = (this.newComment.timeEnabled) ? Math.floor(this.FormatToSeconds(this.VideoCurrentTime.join(":"))) : 0;
      obj.comment_id = this.EditableComment.id;
    }

    this.headerService.setLocalStorage(key, obj);

  }

  private processCommentEdited(comment) {

    /* comment edit section start */
    if (!comment.Comment.parent_comment_id) {

      let commentIndex = this.comments.findIndex(c => c.id == comment.id);
      if (commentIndex > -1) {
        comment.valid = true;
        this.comments[commentIndex] = comment;
      }
      this.AttachFilesToComment(comment);
      this.mainService.ReRenderMarkers.emit(true);

      /* comment edit section end */

    } else {

      /* reply edit section start */
      let found = false;
      let commentIndex = this.comments.findIndex(c => c.id == comment.Comment.parent_comment_id);

      if (commentIndex > -1) {

        let replyIndex = this.comments[commentIndex].Comment.responses.findIndex(response => response.id == comment.id);

        if (replyIndex > -1) {
          found = true;
          this.comments[commentIndex].Comment.responses[replyIndex].comment = comment.Comment.comment;
          this.comments[commentIndex].Comment.responses[replyIndex].EditEnabled = false;
          this.mainService.ReRenderMarkers.emit(true);
        }

      }
      /* reply edit section end */

      /* sub-reply edit section start */
      if (!found) {

        this.comments.forEach((c) => {

          if (c.Comment.responses) {

            c.Comment.responses.forEach((r) => {

              if (r.responses) {
                let subReplyIndex = r.responses.findIndex(response => response.id == comment.id);
                if (subReplyIndex > -1) {
                  r.responses[subReplyIndex].comment = comment.Comment.comment;
                  r.responses[subReplyIndex].EditEnabled = false;
                }
              }

            });

          }

        });

      }
      /* sub-reply edit section end */
    }
  }

  private processCommentDeleted(parent_comment_id, item_id) {

    this.LoadPublishSettings();

    /** Comment delete section start */
    if (!parent_comment_id) {
      let commentIndex = this.comments.findIndex(c => c.id == item_id);
      if (commentIndex > -1) this.comments.splice(commentIndex, 1);
      /** Comment delete section end */

    } else {

      /** Reply delete section start */
      let found = false;
      let commentIndex = this.comments.findIndex(c => c.id == parent_comment_id);

      if (commentIndex > -1 && Array.isArray(this.comments[commentIndex].Comment.responses)) {

        let replyIndex = this.comments[commentIndex].Comment.responses.findIndex(response => response.id == item_id);
        if (replyIndex > -1) {
          found = true;
          this.comments[commentIndex].Comment.responses.splice(replyIndex, 1);
        }

      }
      /** Reply delete section end */

      /** Sub-reply delete section start */
      if (!found) {

        this.comments.forEach((c) => {

          if (Array.isArray(c.Comment.responses)) {

            c.Comment.responses.forEach((r) => {

              if (Array.isArray(r.responses)) {
                let subReplyIndex = r.responses.findIndex(response => response.id == item_id);
                if (subReplyIndex > -1) {
                  r.responses.splice(subReplyIndex, 1);
                }
              }

            });

          }

        });

      }
      /** Sub-reply delete section end */

    }

    this.updateCommentCount();
    this.mainService.ReRenderMarkers.emit(true);

  }

  private processResourceAdded(resource) {
    this.staticFiles.push(resource);
    this.AttachFilesToCommentsOnResourceAddedSocket();
  }

  // Todo:
  private processAttachmentDeleted(deletedResourceId) {
    this.staticFiles.forEach((file, i) => {
      if (file.id == deletedResourceId) {
        this.staticFiles.splice(i, 1);
      }
    });
  }

  private AttachFilesToCommentsOnResourceAddedSocket() {

    this.comments.map(comment => {

      comment.files = [];

      // if (comment.is_new_comment) {
      comment.files = _.where(this.staticFiles, { comment_id: comment.id });
      comment.files.map((file) => {
        file.time = (file.scripted_current_duration) ? this.ConvertTime(file.scripted_current_duration) : this.translation.myfile_all_videos;
        // if (file && comment.time) {
        //   file.time = comment.time;
        // }
      });
      // } 
      // else {
      //   this.staticFiles.forEach((file) => {
      //     if (file && file.time && comment.time) {
      //       file.time2 = file.time == this.translation.myfile_all_videos ? 0 : this.FormatToSeconds(file.time);

      //       comment.time2 = this.FormatToSeconds(comment.time);
      //       if (((!file.comment_id) && (comment.time2 == file.time2)) || ((file.comment_id) && (file.comment_id == comment.id))) {

      //         comment.files.push(file);

      //       }
      //     }

      //   });
      // }

    });

  }

  /** Socket functionality end */

  /** Audio functionality starts */
   public currentState(state: RecordingState){
    this.audioRecorderState = state;
  }

  public audioPath(audioPath: AudioPath){
    if(audioPath.filePath) {
      this.newComment.commentText = audioPath.filePath;
      this.newComment.audioDuration = audioPath.audioDuration;
      this.newComment.audioUrl = audioPath.audioUrl;
      this.newComment.localAudio = true;
      this.newComment.ref_type = 6;
    } else {
      if(!this.commentTextstatus)
      {
          this.newComment.commentText = '';
          this.newComment.audioDuration = null;
          this.commentTextstatus=false;
      }

      this.newComment.audioUrl = '';
      this.newComment.localAudio = false;
      if(Object.keys(this.tempEditComment).length)
      {
          this.newComment = this.tempEditComment;
          this.tempEditComment = {};
      }
      else
      {
        this.newComment.ref_type = 2;
      }
    }
    if(audioPath.autoSubmitComment == "add")
    {
      this.AddTextComment();
    }
    else if(audioPath.autoSubmitComment == "edit")
    {
      this.EditTextComment(1);
    }
    console.log('this.newComment: ', this.newComment)
  }
  /** Audio functionality end */

  public cancel() {
    // this.newComment.commentText = '';
    this.newComment.ref_type = 2;
  }

  ngOnDestroy() {

    this.storeCommentToLocalStorage();

    if (this.modalRef) this.modalRef.hide();
    this.playerService.ModifyPlayingState("stop");

    this.subscriptions.unsubscribe();
  }

}
