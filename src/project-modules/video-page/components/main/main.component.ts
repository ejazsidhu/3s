import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, Input, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from "ngx-toastr";
import { Subscription } from 'rxjs';
import { TabsetComponent, BsModalService, BsModalRef } from 'ngx-bootstrap';
import * as _ from "underscore";

import { HeaderService, SocketService, AppMainService } from "@app/services";
import { MainService, PlayerService, ScrollService, CropPlayerService, VideoPageService } from '@videoPage/services';
import { environment } from "@environments/environment";
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import { MARKER_COLORS } from '@videoPage/constants';

type RecordingState = 'comfortZone' | 'recording' | 'resume' | 'uploading' | 'play';
type VideoCommentPlayState = 'on' | 'off';
type AudioPath = { filePath: string, audioUrl: string, autoSubmitComment: string, audioDuration: number };

@Component({
  selector: 'video-page-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  public loaded: boolean = false;
  public src;
  public newComment;
  public settings;
  public VideoCurrentTime;
  public VideoTotalTime;
  public comments = [];
  public colorClasses: string[] = MARKER_COLORS;
  public CustomMarkers;
  private selectedTag: any = {};
  public totals;
  public rubrics;
  public currentTab;
  public selectedRubrics;
  public ShowInfo;
  public VideoInfo;
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
  public tagIds: number[] = []; // selectedPLRubricAccountTagIds
  public ratingIds: number[] = []; // rubricAccountTagRatingIds
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
  public frameworks;
  public VideoHuddleFramework;
  public rubricPreview;
  public isVideoProcessing;
  public EditChanges;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  public header_data;
  public translation: any = {};
  public account_folder_id;
  public video_id;
  public autoSaveAudio = "";
  private subscriptions: Subscription = new Subscription();
  videoOldTime: any = [];
  public thubnail_url;
  transCodingStatus = null
  public userAccountLevelRoleId: number | string = null;
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  @ViewChild('cropDialog', { static: true }) cropDialog;
  @ViewChild('commentEndTimePopup', { static: true }) commentEndTimePopup;
  @Input() huddle_permission;
  localArry: any = [];
  EditlocalArry: any = [];
  EditReplylocalArry: any = [];
  EditSubReplylocalArry: any = [];
  isAudio: boolean = false;
  artifact: any = {};
  public lsCommentExisted: boolean = false;
  socket_listener: any;
  errorStatus: any;
  public audioRecorderState: RecordingState = 'comfortZone';
  public localAudioData: any = {};
  public commentTextstatus: boolean = false;
  public tempEditComment: any = {};

  /**Edit comment variables start */
  public availableHours: number[] = [...Array(24).keys()];
  public availableMntsNScnds: number[] = [...Array(60).keys()];
  public commentEndTime: any = [];
  /**Edit comment variables end */

  /** Comment play variables start */

  /** Minimum minutes requirred to enable video comment play */
  private minMntsReqForVCP: number = 1;

  private videoDuration: number = 0;
  private videoCommentPlayTimeSlots: any[] = [];
  public videoCommentPlayAvailable: boolean = false;
  public videoIsLessAutoCommentPlayRange: boolean = true;
  public videoCommentPlayState: VideoCommentPlayState = 'off';
  @ViewChild('audioPlayer', { static: false }) audioPlayer: ElementRef;

  /** Comment play variables end */

  private previousTime: number; // a temp variable to save video previous time which update only incase of comment autoscrol change
  private commentsSortBy: number = 0;

  private apiUrl: string;

  constructor(private videoPageService: VideoPageService, private modalService: BsModalService, private scrollToService: ScrollService,
    private toastr: ToastrService, private headerService: HeaderService, public mainService: MainService, private router: Router,
    private activatedRoute: ActivatedRoute, private playerService: PlayerService, private cropPlayerService: CropPlayerService,
    private deviceService: DeviceDetectorService, private socketService: SocketService, private appMainService: AppMainService) {

    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      this.VideoCurrentTime = this.translation.all_video;
    }));

    this.mainService.commentTryAgain$.subscribe(data => this.onTryAgainUpdate(data));
    this.mainService.addFilesToEditLS$.subscribe(data => this.addFilesToEditLS(data));

    this.playerService.videoCommentPlay$.subscribe(data => {
      this.videoCommentPlayState = data.state;
    });

    /** TODO: New code: for current tab start */
    this.subscriptions.add(this.videoPageService.currentTab$.subscribe((tabValue: number) => {
      this.staticTabs.tabs[tabValue].active = true;
      this.currentTab = tabValue;
    }))
    /** TODO: New code: for current tab end */

    this.activatedRoute.parent.data.subscribe(data => {
      if (data) {
        if (data.name === 'video_page') this.apiUrl = 'view_page';
        else if (data.name === 'workspace_video_page') this.apiUrl = 'workspace_video_page';
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
    this.CopyData = {};
    this.CopyData.searchHuddleText = "";
    this.CopyData.searchAccountText = "";
    this.CopyData.LibrarySelected = false;
    this.permissions = {};
    this.isCroLoading = false;
    this.VideoHuddleFramework = "";
    this.EditChanges = {};
    this.videoOptions = {
      maxFiles: 20,
      accept: GLOBAL_CONSTANTS.RESOURCE_UPLOAD_EXTENSIONS, //['image','text'],
      fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'url', 'onedrive'],
      customText: {
        'File {displayName} is not an accepted file type. The accepted file types are {types}': 'File {displayName} is not an accepted file type. The accepted file types are image, text',
      }
    };
    this.cropRangeSliderConfig = {
      connect: [false, true, false],
      step: 1,
      range: { min: 1, max: 62 }
    };

    this.header_data = this.headerService.getStaticHeaderData();

    // Dynamic Button Colors Start
    this.header_color = this.header_data.header_color;
    this.primery_button_color = this.header_data.primery_button_color;
    this.secondry_button_color = this.header_data.secondry_button_color;
    // Dynamic Button Colors End

    this.currnetUser = this.header_data.user_current_account.User;
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;

    this.mainService.GetFrameworks().subscribe((frameworks) => {

      this.frameworks = frameworks;

      if (this.frameworks.length == 1) {

        setTimeout(() => {
          this.VideoHuddleFramework = this.frameworks[0].account_tag_id;
          this.ResolveAssignFramework(1, true);
        }, 3000);


      }

    });

    this.activatedRoute.params.subscribe((p) => {


      this.params = p;
      this.device_detector();
      this.handleParams(p);
    });

    this.RunSubscribers();
    this.newComment.commentText = '';
    // this.newComment.commentText = localStorage.getItem('video_play_comment_'+this.params.video_id);
    // if(this.EditMode)this.newComment.commentText = localStorage.getItem('video_play_edit_comment_'+this.EditableComment.id);
    window.onbeforeunload = () => this.ngOnDestroy();

    this.account_folder_id = this.params.huddle_id;
    this.video_id = this.params.video_id;
    this.socketPushFunctionComment();
    // this.processEventSubscriptions();
    //console.log("this is session data",this.params);
    //console.log("i am in the params",this.params);
    //console.log("i am in the params",this.params.video_id);
    //console.log("this is account folder id",this.account_folder_id);

  }

  private addFilesToEditLS(data) {
    if (data.filesArray && data.filesArray.length > 0) {
      let filesToBeAddedInStaticFiles = [];
      data.filesArray.forEach(file => {
        let fileExisted = this.staticFiles.find(staticFile => staticFile.id == file.id);
        if (!fileExisted) filesToBeAddedInStaticFiles.push(file);
      });

      this.AddTimeStampToResources(data.filesArray, true, data.time, data.id);

    }
  }


  private RunSubscribers() {
    this.GetVideoDuration();

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

  private GetVideoDuration() {

    this.mainService.GetVideoDuration(this.params.video_id).subscribe((data) => {

      // console.log(data);
      if (data != -1) {
        this.VideoTotalTime = Number(data);
      }


    });

  }

  public Seek(val) {

    if (val == this.translation.vd_all_videos.trim() || val == 0) return;
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
          //  // it was closing modal on clicking
          // that.hideCropModal();
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
      //console.log(this.translation);
      alert(this.translation.please_select_range);
    }
    else {
      this.mainService.TrimVideo(this.params.video_id, this.params.huddle_id, { startVideo: parseFloat(this.cropRange[0] + ".00").toFixed(2), endVideo: parseFloat(this.cropRange[1] + ".00").toFixed(2) }).subscribe((data: any) => {
        // console.log(data);
        let path: any;// = location.pathname;
        // path = path.split('/');
        // let huddle = path[path.length - 2];
        // next thre lne for new trim rule iplementting
        let sessionData: any = this.headerService.getStaticHeaderData();
        let user_id = sessionData.user_current_account.User.id;
        this.headerService.afterHuddleTrim(this.params.video_id, data["document"].doc_id, parseFloat(this.cropRange[0] + ".00").toFixed(2), parseFloat(this.cropRange[1] + ".00").toFixed(2), user_id, this.params.huddle_id).subscribe(data => {
          // console.log('after workspace trim',data)
          path = environment.baseUrl + "/Huddles/view/" + this.params.huddle_id;
          console.log(path);
          location.href = path;
        })


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

    //console.log(commentObj);
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
            // this.comments[parentIndex].Comment.responses[index].comment = commentObj.reply.EditableText //Commented cause of Socket;
            this.comments[parentIndex].Comment.responses[index].EditEnabled = false;
            if (this.comments[parentIndex].Comment.responses[index].edittryagain) {
              this.comments[parentIndex].Comment.responses[index].edittryagain = false;
              let localEditReplydata = localStorage.getItem(user_id + '_fake_edit_reply_comment_video_' + this.params.video_id)
              if (localEditReplydata != null && localEditReplydata != undefined) {
                let sdata = JSON.parse(localEditReplydata)
                sdata.forEach((x, i) => {
                  if (this.comments[parentIndex].Comment.responses[index].id == x.id) {
                    sdata.splice(i, 1)
                  }
                });
                localStorage.setItem(user_id + '_fake_edit_reply_comment_video_' + this.params.video_id, JSON.stringify(sdata))
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
                    let localEditReplydata = localStorage.getItem(user_id + '_fake_edit_sub_reply_comment_video_' + this.params.video_id)
                    if (localEditReplydata != null && localEditReplydata != undefined) {
                      let sdata = JSON.parse(localEditReplydata)
                      sdata.forEach((x, i) => {
                        if (r.responses[index].id == x.id) {
                          sdata.splice(i, 1)
                        }
                      });
                      localStorage.setItem(user_id + '_fake_edit_sub_reply_comment_video_' + this.params.video_id, JSON.stringify(sdata))
                    }
                  }
                }

              });

            }

          });

        }

      }

    }, err => {
      console.log('SUb_Reply Check')
      let parentIndex = _.findIndex(this.comments, { id: commentObj.comment.id });
      if (parentIndex) var index = _.findIndex(this.comments[parentIndex].Comment.responses, { id: commentObj.reply.id });
      if (index) var parentSubindex = _.findIndex(this.comments[parentIndex].Comment.responses, { id: commentObj.reply.parent_comment_id });
      if (parentSubindex) var subreply_index = _.findIndex(this.comments[parentIndex].Comment.responses[parentSubindex].responses, { id: commentObj.reply.id });
      console.log('Parnet Sub', parentSubindex, 'Subreply_index', subreply_index)
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
        localStorage.setItem(user_id + '_fake_edit_reply_comment_video_' + this.params.video_id, JSON.stringify(this.EditReplylocalArry));
      }
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
        localStorage.setItem(user_id + '_fake_edit_sub_reply_comment_video_' + this.params.video_id, JSON.stringify(this.EditSubReplylocalArry));
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
          /** this code has been moved to "attachment_deleted" websocket start */
          // this.toastr.info(this.translation.resource_deleted);
          // let index = _.findIndex(this.staticFiles, {id: id? id: this.DeletableFile.id});
          // if(index >-1){
          //   this.staticFiles.splice(index, 1);
          //   this.totals.resources_count--;
          // }
          /** this code has been moved to "attachment_deleted" websocket end */

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

      // this.staticFiles = this.staticFiles.concat(obj.files);

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

      file.time2 = file.time == this.translation.vd_all_videos.trim() ? 0 : this.FormatToSeconds(file.time);

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

      console.log('this.rubricPreview: ', this.rubrics)

      /** In case of add comment local storage selected framewors then also select framework rubric start */
      let datafromlS = localStorage.getItem(this.header_data.user_current_account.User.id + '_video_play_comment_' + this.params.video_id);
      let ParsedDataFromLs = JSON.parse(datafromlS);
      if (ParsedDataFromLs && Array.isArray(ParsedDataFromLs.selectedRubrics)) {
        ParsedDataFromLs.selectedRubrics.forEach(lsRubric => {
          let rubricExisted = this.rubrics.account_tag_type_0.find(rubric => rubric.account_tag_id == lsRubric.account_tag_id);
          if (rubricExisted) rubricExisted.selected = true;
          console.log('rubricExisted: ', rubricExisted)
        });
      }
      /** In case of add comment local storage selected framewors then also select framework rubric end */

    });

  }
  public SelectTab(ev) {
    this.closeInfo();
    this.currentTab = ev;

    if (ev == 4) {
      this.LoadRubricsTabData();
    }

  }

  public LoadRubricsTabData(callOnSocket?, selectedStandardId?, selectedRatingId?) {

    if (!callOnSocket) {
      this.SelectedPLRubric = {};
      this.PLcomments = [];
    }

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj = {
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      huddle_id: this.params.huddle_id,
      video_id: this.params.video_id
    }

    this.appMainService.GetPLTabData(obj).subscribe((data) => {

      this.PLTabData = data;
      if (this.SelectedPLRubric && this.SelectedPLRubric.account_tag_id && selectedStandardId && selectedRatingId) {

        if (this.SelectedPLRubric.account_tag_id == selectedStandardId) this.SelectedPLRubric.selectedRating = selectedRatingId;

      }

    });

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
    this.tagIds.push(this.SelectedPLRubric.account_tag_id);
    this.ratingIds.push(id);

    let val = _.findWhere(this.SelectedPLRubric.selectOptions, { id: this.ratingIds[this.ratingIds.length - 1] });
    // let val = _.findWhere(this.SelectedPLRubric.selectOptions, {id:id});

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
    // obj["rating_value_"+this.SelectedPLRubric.account_tag_id] = val? val.value: 0;
    // obj["rating_id_"+this.SelectedPLRubric.account_tag_id] = id;


    this.mainService.SaveRating(obj).subscribe((data: any) => {

      /** This section has been moved to "ratings_updated" sockets start */
      // // update global average rating
      // if (data.rating_score == 'N/O')
      // this.PLTabData.average_rating = '0 - No Rating';
      // else {
      //   let avgRating = this.SelectedPLRubric.selectOptions.find(option => data.rating_score == option.value);
      //   if (avgRating) this.PLTabData.average_rating = `${avgRating.value} - ${avgRating.text}`;
      // }
      /** This section has been moved to "ratings_updated" sockets end */

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

  public getSettings(key) {

    return this.PLTabData.standards.data.account_framework_settings[key];

  }

  private GetDropdownSettingsFromPL(rubric: any) {

    return rubric.account_framework_settings_performance_levels.map((r) => {

      return { id: r.id, value: r.performance_level_rating, text: r.performance_level };

    })

  }

  // TODO:delete
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

    let user_id = this.header_data.user_current_account.User.id;

    this.mainService.GetVideoResources({ video_id: args.video_id, huddle_id: args.huddle_id, user_id: user_id }).subscribe((data: any) => {

      if (data) {
        data.map((d) => {
          if (d.scripted_current_duration) d.time = this.ConvertTime(d.scripted_current_duration);
          else d.time = this.translation.vd_all_videos;
        });
        this.staticFiles = this.staticFiles.concat(data);
      }

    });

    let account_id = this.header_data.user_current_account.accounts.account_id;
    let data = {
      "user_id": user_id,
      "video_id": args.video_id,
      "account_id": account_id,
      "huddle_id": args.huddle_id,
      "role_id": this.header_data.user_current_account.roles.role_id,
      "permission_maintain_folders": this.header_data.user_permissions.UserAccount.permission_maintain_folders
    }
    this.GetRubrics(args.huddle_id, account_id);
    this.mainService.getVideoData(this.apiUrl, data).subscribe((data) => {

      this.handleVideo(data);

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
    let sessionData: any = this.headerService.getStaticHeaderData();
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

    // console.log(data);
    // console.log(data.published);

    this.isAuthenticatedUser = true;
    this.src = { "path": data.static_url, "type": "video/mp4" };
    this.comments = data.comments.Document.comments;
    this.ApplySettings({ sortBy: 0 });
    let fake_coment = JSON.parse(localStorage.getItem(sessionData.user_current_account.User.id + '_fake_comment_video_' + this.params.video_id));
    if (fake_coment != undefined && fake_coment != null) {
      fake_coment.forEach(c => {
        if (c != undefined && c != null) {
          this.localArry.push(c);
          this.comments.unshift(c);
          this.comments = [...this.comments];
        }
      });
    }

    let localCdata = localStorage.getItem(this.header_data.user_current_account.User.id + '_fake_edit_comment_video_' + this.params.video_id)
    if (localCdata != null && localCdata != undefined) {
      let sdata = JSON.parse(localCdata)
      sdata.forEach(x => {
        const index = this.comments.findIndex(c => c.id == x.id);
        if (index > -1) {
          this.comments[index] = x;
        }
      });
    }


    this.CustomMarkers = data.custom_markers;
    this.prepareComments(this.comments);
    this.totals.comment_count = data.comments_counts.total_comments;
    this.totals.resources_count = data.attached_document_numbers;
    this.VideoInfo = data.video_detail;
    this.thubnail_url = data.thubnail_url;
    this.VideoInfo.h_type = data.h_type;
    this.VideoInfo.huddle_type = data.huddle_type;
    /** TODO: new code to update settings start */
    const EnterToPost = this.videoPageService.commentTypingSettingsCurrentValue.EnterToPost;
    this.videoPageService.updateCommentTypingSettings({ PauseWhileTyping: Boolean(data.user_pause_settings), EnterToPost })
    /** TODO: new code to update settings end */
    // this.settings.PauseWhileTyping = Boolean(data.user_pause_settings); 
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
    console.log('this.permissions.AllowCustomMarkers: ', this.permissions.AllowCustomMarkers)
    this.permissions.coaching_perfomance_level = data.coaching_perfomance_level == "1";
    this.permissions.can_crop_video = !!data.can_crop_video;
    this.permissions.assessment_perfomance_level = data.assessment_perfomance_level == "1";
    this.loaded = true;

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

    if (this.EditMode) {

    } else {
      let datafromlS = localStorage.getItem(this.header_data.user_current_account.User.id + '_video_play_comment_' + this.params.video_id);
      let ParsedDataFromLs = JSON.parse(datafromlS);
      if (ParsedDataFromLs) {
        this.lsCommentExisted = true;
        this.newComment.commentText = ParsedDataFromLs.comment;
        this.newComment.ref_type = ParsedDataFromLs.ref_type;

        if (ParsedDataFromLs.localAudio) {
          this.newComment.audioUrl = ParsedDataFromLs.audioUrl;
          this.newComment.localAudio = ParsedDataFromLs.localAudio;
          this.newComment.audioDuration = ParsedDataFromLs.audioDuration;
          this.audioRecorderState = 'play';
          this.localAudioData.localAudio = ParsedDataFromLs.localAudio;
          this.localAudioData.audioUrl = ParsedDataFromLs.audioUrl;
          this.localAudioData.audioRecorderState = this.audioRecorderState;
        }

        this.CustomMarkers.forEach(marker => {
          if (marker.tag_title == ParsedDataFromLs.assessment_value.split(' ')[1]) {
            this.ChooseCustomTag(marker);
          }
        });
        this.SetCustomTags(ParsedDataFromLs.customTags);
        this.newComment.files = ParsedDataFromLs.files;
        this.selectedRubrics = ParsedDataFromLs.selectedRubrics;
        // this.GetTime(this.ConvertTime(ParsedDataFromLs.time))
        if (ParsedDataFromLs.time) {
          this.GetTime(ParsedDataFromLs.time)
        } else {
          this.VideoCurrentTime = this.translation.vd_all_videos.trim();
        }
      }
    }
    this.transCodingStatus = data.video_detail.transcoding_status;
    this.errorStatus = data.video_detail.encoder_status == 'Error'

    // data.video_detail.file_type=='mp3'
    if (this.headerService.isAValidAudio(data.video_detail.file_type)) {
      // this.isVideoProcessing=true;

      this.isAudio = true;

    }
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

  // public OnCommentAdded(e){

  //   this.totals.comment_count++;

  // }
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
          // this logic has been moved to socket "comment_deleted"
          // this.LoadPublishSettings();

          // this.FindAndKill(comment.id);

          // this.updateCommentCount();

          // this.mainService.ReRenderMarkers.emit(true);

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

  /**
   * As we are getting current time from videojs which omit time randomly after 250 - 1000 ms based on video current playback rate So I have 
   * implemented to save a previous time in a global variable and if current video time is not equal to previous video time then scrolling and 
   * other variable updated occurs
   * @param currentTime Video current playing time
   */
  public GetTime(currentTime: number) {
    if (this.EditMode) return;

    let time = Math.floor(currentTime);

    if (!this.previousTime) {
      this.previousTime = time;
      this.VideoCurrentTime = this.ConvertTime(currentTime);
      this.currentTimeInSeconds = currentTime;
    }

    if (time !== this.previousTime) {

      this.VideoCurrentTime = this.ConvertTime(currentTime);
      this.currentTimeInSeconds = currentTime;

      let index = _.findIndex(this.comments, { time: Math.floor(currentTime) });

      if (index >= 0 && currentTime != 0) {
        if (this.isPlaying && this.settings.autoscroll) {

          this.previousTime = time;

          this.currentComment = this.comments[index];
          this.scrollToService.scrollTo("#slimscroll", "#comment_" + index);

        } else {
          this.currentComment = {};
        }

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
    console.log('testing tags', tags)
    this.tags = tags;

  }

  public onCommentEdit(c) {
    if (this.rubrics) {
      this.rubrics.account_tag_type_0.forEach((r) => { r.selected = false; });
    }
    this.mainService.isEditComent = true;
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

          /** This section has been moved to "framework_selected" websocket start */
          // this.rubrics = this.rubricPreview;
          // this.permissions.framework_selected_for_video = "1";
          /** This section has been moved to "framework_selected" websocket end */
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
    this.newComment.timeEnabled = comment.time > 0;
    this.newComment.commentText = comment.comment;
    this.newComment.audioUrl = comment.comment;
    this.newComment.ref_type = comment.ref_type;
    this.newComment.audioDuration = comment.audioDuration;
    this.tempEditComment = this.newComment;
    this.localAudioData = {};
    if (this.newComment.ref_type == 6) {
      this.commentTextstatus = false;
    }
    else {
      this.commentTextstatus = true;
    }
    this.audioRecorderState = "comfortZone";
    // if(this.EditMode)this.newComment.commentText = localStorage.getItem('video_play_edit_comment_'+comment.id)!=null&&localStorage.getItem('video_play_edit_comment_'+comment.id)!=''?localStorage.getItem('video_play_edit_comment_'+comment.id):comment.comment;
    this.videoOldTime = this.ConvertTime(comment.time).split(":");

    this.VideoCurrentTime = this.ConvertTime(comment.time);

    this.commentEndTime = (comment.end_time) ? this.ConvertTime(comment.end_time) : this.ConvertTime(comment.time);
    if (this.VideoCurrentTime == this.translation.vd_all_videos.trim()) {
      this.newComment.timeEnabled = false;
      this.commentEndTime = 0;
    }
    this.VideoCurrentTime = this.VideoCurrentTime == this.translation.vd_all_videos.trim() ? this.VideoCurrentTime : this.VideoCurrentTime.split(":");//Object.assign({},this.VideoCurrentTime.split(":"));
    this.commentEndTime = (this.commentEndTime) ? this.commentEndTime.split(":") : null;
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
    if (this.EditMode) {
      let sessionData: any = this.headerService.getStaticHeaderData();
      let datafromlS = localStorage.getItem(sessionData.user_current_account.User.id + '_video_play_edit_comment_' + this.EditableComment.id);
      let ParsedDataFromLs = JSON.parse(datafromlS);
      if (ParsedDataFromLs) {
        this.newComment.commentText = ParsedDataFromLs.comment;
        this.newComment.audioDuration = ParsedDataFromLs.audioDuration;
        this.CustomMarkers.forEach(marker => {
          if (marker.tag_title == ParsedDataFromLs.assessment_value.split(' ')[1]) {
            this.ChooseCustomTag(marker);
          }
        });
        this.SetCustomTags(ParsedDataFromLs.customTags);
        this.newComment.files = ParsedDataFromLs.files;
        this.selectedRubrics = ParsedDataFromLs.selectedRubrics;
        // this.GetTime(this.ConvertTime(ParsedDataFromLs.time))
        if (ParsedDataFromLs.time == 0) {
          this.newComment.timeEnabled = false;
        }
        this.videoOldTime = this.ConvertTime(ParsedDataFromLs.time).split(":");
        this.VideoCurrentTime = this.ConvertTime(ParsedDataFromLs.time);
        this.commentEndTime = (ParsedDataFromLs.end_time) ? this.ConvertTime(ParsedDataFromLs.end_time) : this.ConvertTime(ParsedDataFromLs.time);

        if (this.VideoCurrentTime == this.translation.vd_all_videos.trim()) {
          this.newComment.timeEnabled = false;
          this.commentEndTime = null;
        }
        this.VideoCurrentTime = this.VideoCurrentTime == this.translation.vd_all_videos.trim() ? this.VideoCurrentTime : this.VideoCurrentTime.split(":");
        this.commentEndTime = (this.commentEndTime) ? this.commentEndTime.split(":") : null;
      }
    }
    if (comment.ref_type == 6 && this.audioPlayer) {
      this.audioPlayer.nativeElement.load();
    }
  }
  public cancel() {
    this.newComment.ref_type = 2;
    this.newComment.commentText = '';
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
  public allowToComment() {

    let tags = this.GetCustomTags();
    // console.log('tags',!_.isEmpty(tags),'markers', !!_.isEmpty(this.selectedTag), 'upload files', !!(this.newComment.files && this.newComment.files.length > 0), 'frameworks', !!(this.selectedRubrics.length > 0))
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

    if (this.audioRecorderState == "resume") {
      this.autoSaveAudio = "add";//Sending save event to audio component to auto save audio comment.
      return;
    }
    this.autoSaveAudio = "";
    this.localAudioData = {};
    localStorage.removeItem(this.header_data.user_current_account.User.id + '_video_play_comment_' + this.params.video_id);

    // !this.newComment.commentText || this.newComment.commentText==""
    let allowComment = this.allowToComment()
    if (allowComment) {

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
        current_user_email: sessionData.user_current_account.User.email,
        tryagain: false
      };

      let files = [];

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
      if (obj.ref_type == 6 && this.newComment.localAudio && this.newComment.audioUrl) {
        preparedCommentObj.comment = this.newComment.audioUrl;
      }
      this.comments.unshift(preparedCommentObj);
      if (this.commentsSortBy != 0) this.ApplySettings({ sortBy: this.commentsSortBy });
      // this.comments.unshift(this.PrepareFakeComment(obj, sessionData)); Cause Two Offline Comments
      this.ResetForm();

      this.appMainService.AddComment(obj).subscribe((data: any) => {
        //console.log("API object",data);
        if (data.status == "success") {
          //this.toastr.info("holla amigo");

          /** this logic has been moved to socket "comment_added" start */
          // this.LoadPublishSettings();

          // this.totals.comment_count++;
          // let comment = data["0"];
          // let fake_id = data["0"].fake_id;
          // comment.valid=true;

          // let index = _.findIndex(this.comments, {fake_id:fake_id});
          // if(index>-1){

          //   this.comments[index] = comment;
          //   setTimeout(()=>{this.AttachFilesToComment(this.comments[index]);}, 1000);
          //   this.mainService.CommentAddedNotification.emit(comment);

          // }
          /** this logic has been moved to socket "comment_added" end */

          if (files.length > 0) {

            this.AddTimeStampToResources(files, true, obj.time, data[0].id);

          }

        } else if (data.status == "failed") {

          this.toastr.error(data.message);
          this.router.navigate(['/'])
        }
        else {
          this.toastr.info(this.translation.something_went_wrong_msg);
        }
        // this.comments.unshift(data["0"]);
        // this.ActivateTab(0);
        //  this.ResetForm();
      }, (err: any) => {

        /** Adding text comment to localstorage for try again start */
        preparedCommentObj.tryagain = true;
        preparedCommentObj.ref_type = obj.ref_type;
        preparedCommentObj.comment = obj.comment;
        preparedCommentObj.audioDuration = obj.audio_duration;
        preparedCommentObj.uuid = `${new Date().getTime()}-${this.params.video_id}`;
        preparedCommentObj.videoId = obj.videoId;
        preparedCommentObj.for = obj.for;
        preparedCommentObj.synchro_time = obj.synchro_time;
        preparedCommentObj.standards_acc_tags = obj.standards_acc_tags;
        preparedCommentObj.default_tags_value = obj.default_tags;
        preparedCommentObj.assessment_value = obj.assessment_value;
        preparedCommentObj.company_name = obj.company_name;
        preparedCommentObj.account_role_id = obj.account_role_id;
        preparedCommentObj.current_user_email = obj.current_user_email;
        preparedCommentObj.filesArray = files;


        // let index = _.findIndex(this.comments, {fake_id:obj.fake_id});
        // let comment:any = this.comments[index];
        // this.comments[index] = comment;
        //   const hardCopyObj = JSON.parse(JSON.stringify(preparedCommentObj));
        //   let localdata = preparedCommentObj;
        //   preparedCommentObj.tryagain=true;
        //   localdata.tryagain=true;

        // localdata.default_tags = localdata.default_tags[0] && localdata.default_tags[0]!==null && localdata.default_tags[0]!==undefined ? localdata.default_tags : '';

        // let itemToAddInLS = this.PrepareFakeComment(localdata, sessionData);
        // itemToAddInLS.default_tags_value = hardCopyObj.default_tags;
        // itemToAddInLS.filesArray = files;
        // itemToAddInLS.uuid = `${new Date().getTime()}-${this.params.video_id}`;

        // console.log('itemToAddInLS: ', itemToAddInLS)

        this.localArry.push(preparedCommentObj)
        localStorage.setItem(user_id + '_fake_comment_video_' + this.params.video_id, JSON.stringify(this.localArry));
        // this.comments.unshift(itemToAddInLS);
        // this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
        // this.ActivateTab(0);
        //  this.ResetForm();
      });
    }

  }



  findNegativeNumber(timeArray) {
    if (timeArray == this.translation.vd_all_videos.trim()) return false;

    // let a = timeArray.split(":");
    let a = timeArray;
    let result = false;
    //console.log(a)
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
    if (timeArray == this.translation.vd_all_videos.trim()) return true;

    // let a = timeArray.split(":")
    // console.log(a)
    let a = timeArray;

    let newTime = parseInt(a[0]) * 3600;
    newTime += parseInt(a[1]) * 60;
    newTime += parseInt(a[2]);

    return newTime;
  }
  public async EditTextComment(flag) {

    if (flag == 0) {
      this.mainService.isEditComent = false;
      this.ResetForm();
      return;
    }

    if (this.audioRecorderState == "resume") {
      this.autoSaveAudio = "edit";//Sending save event to audio component to auto save audio comment.
      return;
    }

    // If the audio is previously saved then get the actual path of comment and send to api
    if (this.newComment.commentText.indexOf('?Expires') > 0) {
      const toIndex = this.newComment.commentText.indexOf('?Expires');
      const fromIndex = this.newComment.commentText.indexOf('uploads/');
      this.newComment.commentText = this.newComment.commentText.slice(fromIndex, toIndex);
    }

    this.autoSaveAudio = "";
    this.localAudioData = {};
    localStorage.removeItem(this.header_data.user_current_account.User.id + '_video_play_edit_comment_' + this.EditableComment.id);

    // !this.newComment.commentText || this.newComment.commentText==""
    let allowComment = this.allowToComment();
    if (allowComment) {

      this.toastr.info(this.translation.please_enter_text_to_comment);
      return;

    } else {
      if (this.VideoTotalTime == 0) {
        let promise = new Promise((resolve, reject) => {
          this.mainService.GetNewVideoDuration(this.params.video_id).subscribe((duration: any) => {
            if (duration.data > 0) {
              this.VideoTotalTime = duration.data;
            }
            resolve();
          });
        });
        await promise;
      }
      if (this.newComment.timeEnabled && (this.VideoTotalTime != 0 && this.VideoTotalTime < this.FormatToSeconds(this.VideoCurrentTime.join(":")) || this.VideoTotalTime < this.FormatToSeconds(this.commentEndTime.join(":")))) {

        this.toastr.info(this.translation.comment_time_ahead);
        return;

      }
      if (this.VideoCurrentTime != this.translation.vd_all_videos.trim() && this.FormatToSeconds(this.commentEndTime.join(":")) < this.FormatToSeconds(this.VideoCurrentTime.join(":"))) {
        this.modalRef = this.modalService.show(this.commentEndTimePopup, { class: 'modal-md comment-end-time-popup' });
        this.commentTextstatus = true;
        return;
      }
      let files = [];
      if (this.newComment.files && this.newComment.files.length > 0) {

        this.newComment.files = this.newComment.files.filter((f) => {
          return !f.id;
        });
        files = this.newComment.files;

        // this.staticFiles = this.staticFiles.concat(this.newComment.files);
        this.AddTimeStampToResources(this.newComment.files, true, this.EditableComment.time, this.EditableComment.id);

      }

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let account_id = sessionData.user_current_account.accounts.account_id;


      var newTime = this.calculateSeconds(this.VideoCurrentTime);
      var oldTime = this.calculateSeconds(this.videoOldTime);
      var isNagative = this.findNegativeNumber(this.VideoCurrentTime)
      let huddle_id = this.params.huddle_id;
      var totatlTime = this.VideoTotalTime;
      var endTime = (this.VideoCurrentTime != this.translation.vd_all_videos.trim()) ? this.FormatToSeconds(this.commentEndTime.join(":")) : 0;
      console.log("end time", this.commentEndTime)

      if (!isNagative) {

        if (totatlTime < endTime) {
          this.toastr.info(this.translation.new_note_time_ahead);
          return;
        }
        // if (oldTime < newTime || !newTime) {
        else if (!newTime) {
          // if (!newTime)
          this.toastr.info(this.translation.vd_please_enter_valid_number)
          // else
          // this.toastr.info(this.translation.comment_time_ahead);
          // this.toastr.info()
        } else {

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
            end_time: (this.newComment.timeEnabled && this.commentEndTime) ? Math.floor(this.FormatToSeconds(this.commentEndTime.join(":"))) : 0,

            ref_type: this.newComment.ref_type || '2',
            comment: this.newComment.commentText,
            audio_duration: this.newComment.audioDuration,
            user_id: user_id,
            standards_acc_tags: this.PrepareRubrics(),
            default_tags: this.GetCustomTags(),
            assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
            account_role_id: sessionData.user_current_account.users_accounts.role_id,
            current_user_email: sessionData.user_current_account.User.email,
            changed_standards: this.EditChanges.changed_standards,
            changed_custom_markers: this.EditChanges.changed_custom_markers
          };
          this.ActivateTab(0);
          this.ResetForm();
          this.appMainService.EditComment(obj).subscribe((data: any) => {

            if (data.status == "success") {
              /** this logic has been moved to comment_edited socket start */
              // let index = _.findIndex(this.comments, {id:this.EditableComment.id});
              // if(index>-1){

              //   this.comments[index] = data.updated_comment;
              //   this.comments[index].valid = true;
              //   this.EditableComment = {};
              //   this.mainService.ReRenderMarkers.emit(true);

              // }
              /** this logic has been moved to comment_edited socket end */

            } else if (data.status == "failed") {

              this.toastr.error(data.message);
              this.router.navigate(['/'])
            } else {
              this.toastr.info(this.translation.something_went_wrong_msg);
            }

          }, err => {
            let index = _.findIndex(this.comments, { id: this.EditableComment.id });
            if (index > -1) {
              this.comments[index].comment = obj.comment;
              this.comments[index].audioDuration = obj.audio_duration;
              this.comments[index].huddle_id = obj.huddle_id;
              this.comments[index].account_id = obj.account_id;
              this.comments[index].edittryagain = true;
              this.comments[index].videoId = obj.videoId;
              this.comments[index].for = obj.for;
              this.comments[index].synchro_time = obj.synchro_time;
              this.comments[index].time = obj.time;
              this.comments[index].end_time = obj.end_time,
                this.comments[index].ref_type = obj.ref_type;
              this.comments[index].user_id = obj.user_id;
              this.comments[index].standards_acc_tags = obj.standards_acc_tags;
              this.comments[index].default_tags = obj.default_tags;
              this.comments[index].assessment_value = obj.assessment_value;
              this.comments[index].account_role_id = obj.account_role_id;
              this.comments[index].current_user_email = obj.current_user_email;
              this.comments[index].changed_standards = obj.changed_standards;
              this.comments[index].changed_custom_markers = obj.changed_custom_markers;
              this.comments[index].filesArray = files;
              this.EditlocalArry.push(this.comments[index]);
              localStorage.setItem(user_id + '_fake_edit_comment_video_' + this.params.video_id, JSON.stringify(this.EditlocalArry));
            }
          });
          // this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
        }
      }
    }
    this.rubrics.account_tag_type_0.forEach((r) => {
      r.selected = false;
    });

  }

  private ResetForm() {

    this.newComment.commentText = "";
    this.newComment.audioUrl = '';
    this.newComment.localAudio = false;
    this.newComment.ref_type = 2;
    this.newComment.audioDuration = null;
    this.newComment.files = [];
    this.selectedRubrics = [];
    this.localAudioData = {};
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
  private PrepareFakeComment(comment, sessionData, obj?) {
    this.selectedTag = !_.isEmpty(this.selectedTag) && this.selectedTag !== null && this.selectedTag !== undefined ? this.selectedTag : '';
    let fake_comment: any = {
      "valid": true,
      "tryagain": false,
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
      "created_date_string": "Just Now",
      "synchro_time": comment.synchro_time || 0,
      "standard": this.selectedRubrics,
      "default_tags": [
        this.selectedTag
      ]
    };
    if (comment.tryagain == true) {
      fake_comment.tryagain = true;
      fake_comment.assessment_value_text = comment.assessment_value;
    }
    return fake_comment;

  }

  private PrepareSocketComment(comment) {

    let fake_comment = {
      "valid": true,
      "fake_id": comment.fake_id,
      "id": comment.id,
      "parent_comment_id": comment.parent_comment_id ? comment.parent_comment_id : null,
      "title": null,
      "comment": comment.comment,
      "ref_type": comment.ref_type,
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
      "first_name": comment.first_name,
      "last_name": comment.last_name,
      "image": comment.image,
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

  private PrepareEditSocketComment(comment) {
    console.log(comment)
    let fake_comment = {
      "valid": true,
      "id": comment.id,
      "parent_comment_id": comment.parent_comment_id ? comment.parent_comment_id : null,
      "title": null,
      "comment": comment.comment,
      "ref_type": comment.ref_type,
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
      "first_name": comment.first_name,
      "last_name": comment.last_name,
      "image": comment.image,
      "Comment": {
        "last_edit_date": "2017-02-21T20:42:13+00:00",
        "created_date": "2017-01-23T06:52:14+00:00"
      },
      "created_date_string": "Just Now",
      "standard": this.selectedRubrics,
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
    //console.log("changeTabe = "+changeTabe ,"changeToTab = "+changeToTab ,"fromTab = "+fromTab);
    //console.log("Current tab = "+this.currentTab);
    this.ShowInfo = false;
    if (changeTabe) {
      if (fromTab == this.currentTab) {
        this.ActivateTab(changeToTab);
      }
    }
  }

  public onTryAgainUpdate(eventData: any) {

    // const index = this.comments.findIndex(c => c.uuid == eventData.oldCommentuuid);
    // if (index > -1) {
    //   this.comments[index] = eventData.updatedComment;
    //   this.mainService.CommentAddedNotification.emit(eventData.updatedComment);
    // }

    localStorage.removeItem(this.header_data.user_current_account.User.id + '_video_play_comment_' + this.params.video_id);

    // let fake_coment = JSON.parse(localStorage.getItem(this.header_data.user_current_account.User.id+'_fake_comment_video_' + this.params.video_id));
    // if(fake_coment!=undefined && fake_coment!=null){
    //   fake_coment.forEach((x,i) => {
    //     if(x.fake_id==obj.fake_id){
    //       fake_coment.splice(i,1);
    //       localStorage.setItem(this.header_data.user_current_account.User.id+'_fake_comment_video_' + this.params.video_id,JSON.stringify(fake_coment));
    //     }
    //   });
    // }

    // remove from tmpCommentArrayForLocalStorage and add files
    const commentIndex = this.localArry.findIndex(c => c.uuid == eventData.oldCommentuuid);
    if (commentIndex > -1) {
      let commnetObj = this.localArry[commentIndex]
      if (commnetObj.filesArray && commnetObj.filesArray.length > 0) {
        let filesToBeAddedInStaticFiles = [];
        commnetObj.filesArray.forEach(file => {
          let fileExisted = this.staticFiles.find(staticFile => staticFile.id == file.id);
          if (!fileExisted) filesToBeAddedInStaticFiles.push(file);
        });

        // if(filesToBeAddedInStaticFiles.length > 0) this.staticFiles = this.staticFiles.concat(filesToBeAddedInStaticFiles);

        this.AddTimeStampToResources(commnetObj.filesArray, true, commnetObj.time, eventData.updatedComment.id);

      }

      this.localArry.splice(commentIndex, 1);
      localStorage.setItem(this.header_data.user_current_account.User.id + '_fake_comment_video_' + this.params.video_id, JSON.stringify(this.localArry));
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

  /** Socket functionality starts */
  private socketPushFunctionComment() {
    if (this.params.huddle_id) {
      this.subscriptions.add(this.socketService.pushEventWithNewLogic(`huddle-details-${this.params.huddle_id}`).subscribe(data => {
        this.processEventSubscriptions(data);
      })
      );
      // this.socketService.pushEvent(`huddle-details-${this.params.huddle_id}`);
    }

    this.subscriptions.add(this.socketService.pushEventWithNewLogic(`video-details-${this.params.video_id}`).subscribe(data => {
      this.processEventSubscriptions(data);
    })
    );
    // this.socketService.pushEvent(`video-details-${this.params.video_id}`);

    let workspaceChannelName = `workspace-${this.header_data.user_current_account.users_accounts.account_id}-${this.header_data.user_current_account.users_accounts.user_id}`;
    this.subscriptions.add(this.socketService.pushEventWithNewLogic(workspaceChannelName).subscribe(data => {
      this.processEventSubscriptions(data);
    })
    );
    // this.socketService.pushEvent(workspaceChannelName);
  }

  private processEventSubscriptions(res) {

    // this.subscriptions.add(this.socketService.EventData.subscribe(res =>{
    console.log("websocket res ", res)
    switch (res.event) {
      case "comment_added":
        this.processCommentAdded(res.data, res.from_cake, res.reference_id);
        break;
      case "comment_edited":
        this.processCommentEdited(res.data, res.from_cake, res.reference_id);
        break;
      case "comment_deleted":
        this.processCommentDeleted(res.parent_comment_id, res.item_id, res.reference_id);
        break;
      case "resource_added":
        this.processResourceAdded(res.data, res.reference_id);
        break;
      case "attachment_deleted":
        this.processAttachmentDeleted(res.data, res.huddle_id);
        break;
      case "framework_selected":
        this.processFrameworkSelected(res.data);
        break;
      case "feedback_published":
        this.processFeedbackPublished(res.data);
        break;
      case "ratings_updated":
        this.processRatingsUpdated(res.data, res.document_id, res.huddle_id);
        break;
      case "resource_renamed":
        this.processResourceRenamed(res.data, res.is_dummy);
        break;
    }

    // }));
  }

  private processCommentAdded(comment, from_cake, reference_id) {
    if (reference_id == this.params.video_id) {
      let commentObj;
      if (from_cake) commentObj = JSON.parse(comment);
      else commentObj = comment;

      if (commentObj.created_by == this.header_data.user_current_account.User.id || commentObj.active == 1) {

        /* comment add section start */
        if (!commentObj.parent_comment_id) {
          commentObj.valid = true;
          this.LoadPublishSettings();
          this.totals.comment_count++;
          this.mainService.CommentAddedNotification.emit(commentObj);
          let commentIndex = this.comments.findIndex(c => c.fake_id == commentObj.fake_id);
          delete commentObj.fake_id;
          if (commentIndex > -1 && !from_cake) {
            this.comments[commentIndex] = commentObj;
          }
          else this.comments.unshift(commentObj);
          this.LoadRubricsTabData(true); // update performance level data

          /* comment add section end */
        } else {

          /* reply add section start */
          let found = false;
          let commentIndex = this.comments.findIndex(c => c.id == commentObj.parent_comment_id);

          if (commentIndex > -1) {
            found = true;

            this.comments[commentIndex].replyEnabled = false;
            this.comments[commentIndex].replyAdding = true;
            this.comments[commentIndex].replyAdding = false;
            this.comments[commentIndex].replyText = "";

            let replyIndex = this.comments[commentIndex].Comment.responses.findIndex(r => r.uuid == commentObj.uuid);
            if (replyIndex > -1 && !from_cake) {
              this.comments[commentIndex].Comment.responses[replyIndex] = commentObj;
              delete this.comments[commentIndex].Comment.responses[replyIndex].fakeComment;
            } else {
              if (!this.comments[commentIndex].Comment) this.comments[commentIndex].Comment = {};
              if (!this.comments[commentIndex].Comment.responses) this.comments[commentIndex].Comment.responses = [];
              this.comments[commentIndex].Comment.responses.push(commentObj);
            }
            this.totals.comment_count++;
            /* reply add section end */
          }

          /* sub-reply add section start */
          if (!found) {
            this.comments.forEach((c) => {

              if (c.Comment && c.Comment.responses && c.Comment.responses.length > 0) {
                let replyIndex = c.Comment.responses.findIndex(response => response.id == commentObj.parent_comment_id);
                if (replyIndex > -1) {
                  c.Comment.responses[replyIndex].replyText = "";

                  let subReplyIndex = c.Comment.responses[replyIndex].responses.findIndex(sr => sr.uuid == commentObj.uuid);
                  if (subReplyIndex > -1 && !from_cake) {
                    c.Comment.responses[replyIndex].responses[subReplyIndex] = commentObj;
                    delete c.Comment.responses[replyIndex].responses[subReplyIndex].fakeComment;
                    delete c.Comment.responses[replyIndex].responses[subReplyIndex].tryAgain;
                  } else {
                    if (!c.Comment.responses[replyIndex].responses) c.Comment.responses[replyIndex].responses = [];
                    c.Comment.responses[replyIndex].responses.push(commentObj);
                  }
                  this.totals.comment_count++;
                }
              }

            });

          }
          /* sub-reply add section end */
        }
        // this.toastr.success(this.translation.comment_added); // Don't show toastr as per new guideline from Dave
        if (this.commentsSortBy != 0) this.ApplySettings({ sortBy: this.commentsSortBy });
        this.checkForVideoCommentPlay();

      }
    }
  }

  private processCommentEdited(comment, from_cake, reference_id) {
    if (reference_id == this.params.video_id) {
      let commentObj;
      if (from_cake) commentObj = JSON.parse(comment);
      else commentObj = comment;
      /* comment edit section start */
      if (!commentObj.Comment.parent_comment_id) {

        let commentIndex = this.comments.findIndex(c => c.id == commentObj.id);
        if (commentIndex > -1) {
          // commentObj.edittryagain = false;
          commentObj.valid = true;

          this.comments[commentIndex] = commentObj;
          console.log('after: ', this.comments)

          // this.comments = [...this.comments];
        }
        this.AttachFilesToComment(commentObj);
        this.mainService.ReRenderMarkers.emit(true);
        this.LoadRubricsTabData(true); // update performance level data

        /* comment edit section end */

      } else {

        /* reply edit section start */
        let found = false;
        let commentIndex = this.comments.findIndex(c => c.id == commentObj.Comment.parent_comment_id);

        if (commentIndex > -1) {

          let replyIndex = this.comments[commentIndex].Comment.responses.findIndex(response => response.id == commentObj.id);

          if (replyIndex > -1) {
            found = true;
            this.comments[commentIndex].Comment.responses[replyIndex].comment = commentObj.Comment.comment;
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
                  let subReplyIndex = r.responses.findIndex(response => response.id == commentObj.id);
                  if (subReplyIndex > -1) {
                    r.responses[subReplyIndex].comment = commentObj.Comment.comment;
                    r.responses[subReplyIndex].EditEnabled = false;
                  }
                }

              });

            }

          });

        }
        /* sub-reply edit section end */
      }
      // this.toastr.success(this.translation.comment_updated); // Don't show toastr as per new guideline from Dave
      this.checkForVideoCommentPlay();
    }

  }

  private processCommentDeleted(parent_comment_id, item_id, reference_id) {

    if (reference_id == this.params.video_id) {
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
      // this.toastr.info(this.translation.comment_deleted); // Don't show toastr as per new guideline from Dave
      this.checkForVideoCommentPlay();
      if (this.comments.length < 1) {
        //All comments are deleted
        this.toggleVideoCommentPlayState('off');
      }

    }


  }

  private processResourceAdded(resource, reference_id) {
    if (reference_id == this.params.video_id) {
      resource.id = Number(resource.doc_id);
      resource.time = (resource.scripted_current_duration) ? this.ConvertTime(resource.scripted_current_duration) : this.translation.vd_all_videos;

      // incase of global attachments
      if (!resource.comment_id) {
        this.staticFiles.push(resource);
        this.toastr.info(this.translation.resource_uploaded);
      } else {
        let commentExisted = this.comments.find(comment => comment.id == resource.comment_id);
        if (commentExisted) {
          this.staticFiles.push(resource);
          this.AttachFilesToCommentsOnResourceAddedSocket();
        }
      }
    }

  }

  // Todo:
  private processAttachmentDeleted(deletedResourceId, huddle_id) {
    if (huddle_id == this.params.huddle_id) {
      let index = this.staticFiles.findIndex(file => file.id == deletedResourceId);
      if (index >= 0) {
        this.toastr.info(this.translation.resource_deleted);
        this.staticFiles.splice(index, 1);
        this.totals.resources_count--;
        this.AttachFilesToCommentsOnResourceAddedSocket();
      }
    }
  }

  private AttachFilesToCommentsOnResourceAddedSocket() {

    this.comments.map(comment => {

      comment.files = [];

      // if (comment.is_new_comment) {
      comment.files = this.staticFiles.filter(file => file.comment_id == comment.id);
      comment.files.map((file) => {
        file.time = (file.scripted_current_duration) ? this.ConvertTime(file.scripted_current_duration) : this.translation.vd_all_videos;
        // if (file && comment.time) {
        //   file.time = comment.time;
        // }
      });
      // } 
      // else {
      //   this.staticFiles.forEach((file) => {
      //     if (file && file.time && comment.time) {
      //       file.time2 = file.time == this.translation.vd_all_videos.trim() ? 0 : this.FormatToSeconds(file.time);

      //       comment.time2 = this.FormatToSeconds(comment.time);
      //       if (((!file.comment_id) && (comment.time2 == file.time2)) || ((file.comment_id) && (file.comment_id == comment.id))) {

      //         comment.files.push(file);

      //       }
      //     }

      //   });
      // }

    });

  }

  private processFrameworkSelected(frameworkId) {

    this.GetRubricById(frameworkId, true)
    this.permissions.framework_selected_for_video = "1";
    this.toastr.info(this.translation.framework_selected);
  }

  private processFeedbackPublished(videoId) {

    if (this.params.video_id == videoId) {
      this.EnablePublish = false;
      this.toastr.info(this.translation.feedback_published);
      let account_id = this.header_data.user_current_account.accounts.account_id;
      let user_id = this.header_data.user_current_account.User.id;

      // refresh static files
      const paramsObj = { video_id: this.params.video_id, huddle_id: this.params.huddle_id, user_id: user_id };
      this.mainService.GetVideoResources(paramsObj).subscribe((data: any) => {

        if (data) {
          data.map((d) => {
            if (d.scripted_current_duration) d.time = this.ConvertTime(d.scripted_current_duration);
            else d.time = this.translation.vd_all_videos;
          });
          this.staticFiles = data;
          // this.staticFiles = this.staticFiles.concat(data);
        }

        // refresh comments
        const commentParamsObj = {
          "user_id": user_id,
          "video_id": this.params.video_id,
          "account_id": account_id,
          "huddle_id": this.params.huddle_id,
          "role_id": this.header_data.user_current_account.roles.role_id,
          "permission_maintain_folders": this.header_data.user_permissions.UserAccount.permission_maintain_folders
        }
        this.mainService.GetVideo(commentParamsObj).subscribe((data: any) => {

          this.comments = [...data.comments.Document.comments];
          this.comments.map(comment => {
            comment.valid = true;
          });
          this.ApplySettings({ sortBy: 0 });
          this.prepareComments(this.comments);
          this.totals.comment_count = data.comments_counts.total_comments;
          this.totals.resources_count = data.attached_document_numbers;
        });

      });
    }
  }

  private processRatingsUpdated(data, document_id, huddle_id) {
    if (document_id == this.params.video_id && huddle_id == this.params.huddle_id) {
      let selectedStandardId = data.input_data.standard_ids[0];
      let selectedRatingId = data.input_data[`rating_id_${selectedStandardId}`];
      this.LoadRubricsTabData(true, selectedStandardId, selectedRatingId);
    }
  }

  private processResourceRenamed(data, is_dummy) {
    if (!is_dummy && (data.id == this.params.video_id || data.doc_id == this.params.video_id)) {
      this.VideoInfo.title = data.title;
      this.mainService.updateVideoTitle(data.title);
      this.toastr.info(this.translation.title_changed);
    }
  }

  /** Socket functionality end */

  /** Audio functionality starts */
  public currentState(state: RecordingState) {
    this.audioRecorderState = state;
    if (this.audioRecorderState == "recording")
      this.playerService.ModifyPlayingState("pause");
  }

  public audioPath(audioPath: AudioPath) {
    if (audioPath.filePath) {
      this.newComment.commentText = audioPath.filePath;
      this.newComment.audioDuration = audioPath.audioDuration;
      this.newComment.audioUrl = audioPath.audioUrl;
      this.newComment.localAudio = true;
      this.newComment.ref_type = 6;
    } else {
      if (!this.commentTextstatus) {
        this.newComment.commentText = '';
        this.newComment.audioDuration = null;
        this.commentTextstatus = false;
      }
      this.newComment.audioUrl = '';
      this.newComment.localAudio = false;
      if (Object.keys(this.tempEditComment).length) {
        this.newComment = this.tempEditComment;
        this.tempEditComment = {};
      }
      else {
        this.newComment.ref_type = 2;
      }
    }
    if (audioPath.autoSubmitComment == "add") {
      this.AddTextComment();
    }
    else if (audioPath.autoSubmitComment == "edit") {
      this.EditTextComment(1);
    }
    console.log('this.newComment: ', this.newComment)
  }
  /** Audio functionality end */

  /** Edit comment time range functionality start */

  public updateVideoCurrentTime(index: number, value: number) {
    this.VideoCurrentTime[index] = value;
  }

  public updateCommentEndTime(index: number, value: number) {
    this.commentEndTime[index] = value;
  }

  /** Edit comment time range functionality end */

  /** Comment play functionality start */

  public checkForVideoCommentPlay(videoDuration?: number) {
    if (videoDuration) this.videoDuration = videoDuration;

    if ((Math.floor(this.videoDuration) / 60) > this.minMntsReqForVCP) {

      let timeCommentsExists = this.comments.find(comment => comment.time);
      if (timeCommentsExists) {
        this.calculateVideoCommentPlayTimeSlots();
        this.videoCommentPlayAvailable = true;
      } else {
        this.videoCommentPlayAvailable = false;
      }

      this.videoIsLessAutoCommentPlayRange = false;
    } else {
      this.videoIsLessAutoCommentPlayRange = true;
    }

  }

  /** Calculates video comment play time slots
   *  Description: Steps => 
   *  1. Calculate time range by looping over comments by handling the overlap behavior of comment's time and end time
   *  2. If bydefault ordering of commets some time slots have been missed and overlapped their time with one another then do a force filtering 
   *     to remove overlap time ranges.
   *  3. Sort the time range slots so that video will always play from leas start time
   */
  private calculateVideoCommentPlayTimeSlots() {
    // Step-1
    this.videoCommentPlayTimeSlots = [];
    this.comments.forEach(comment => {
      if (comment.time && comment.time != 0) {

        const commentTime = Math.max(0, (comment.time - 10));
        const commentEndTime = (comment.end_time && comment.end_time != 0) ? (comment.end_time + 10) : (comment.time + 10);

        let timeRangeExists = this.videoCommentPlayTimeSlots.find(item => commentTime >= item.start && commentTime <= item.end);
        if (timeRangeExists) {
          if (timeRangeExists.end < commentEndTime) timeRangeExists.end = commentEndTime;
        } else {
          this.videoCommentPlayTimeSlots.push({ start: commentTime, end: commentEndTime });
        }
      }
    });

    // Step-2
    this.videoCommentPlayTimeSlots = this.videoCommentPlayTimeSlots.filter(timeRange => {
      let timeRangeExists = this.videoCommentPlayTimeSlots.find(item => timeRange.end >= item.start && timeRange.end < item.end);
      if (timeRangeExists) {
        if (timeRange.start < timeRangeExists.start) timeRangeExists.start = timeRange.start;
      } else {
        return timeRange;
      }
    });

    // Step-3
    this.videoCommentPlayTimeSlots.sort((firstIndex, secondIndex) => {
      return firstIndex.start - secondIndex.start;
    });
    //alternative of Step 2
    let temp = this.videoCommentPlayTimeSlots;
    let that = this;
    for (let index = 0; index < this.videoCommentPlayTimeSlots.length; index++) {
      let slot = this.videoCommentPlayTimeSlots[index];
      for (let inner_index = 0; inner_index < temp.length; inner_index++) {
        let current = temp[inner_index];
        if (index !== inner_index) {
          if (slot.start >= current.start && slot.end <= current.end) {
            that.videoCommentPlayTimeSlots.splice(index, 1);
            break;
          }
        }
      }
    }

    console.log('this.videoCommentPlayTimeSlots: ', this.videoCommentPlayTimeSlots)

    // const arr = [];
    // this.videoCommentPlayTimeSlots.forEach(timeRange => {
    //   let timeRangeExists = arr.find(item => timeRange.end >= item.start && timeRange.end <= item.end);
    //   if(timeRangeExists) {
    //     if(timeRange.start < timeRangeExists.start) timeRangeExists.start = timeRange.start;
    //   } else {
    //     arr.push({start: timeRange.start, end: timeRange.end});
    //   }
    // });

    // console.log('afte ', arr)

  }

  public toggleVideoCommentPlayState(state: VideoCommentPlayState, videoCommentPlayAvailable: boolean = true) {
    if (videoCommentPlayAvailable) {
      this.videoCommentPlayState = state;
      this.playerService.toggleVideoCommentPlay({ state: this.videoCommentPlayState, timeSlots: this.videoCommentPlayTimeSlots });
    }
  }

  /** Comment play functionality end */

  ngOnDestroy() {
    if (!this.allowToComment()) {
      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj: any = {
        videoId: this.params.video_id,
        for: (this.newComment.timeEnabled) ? "synchro_time" : "",
        synchro_time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : '',
        time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : 0,
        end_time: (this.newComment.timeEnabled && this.commentEndTime) ? Math.floor(this.FormatToSeconds(this.commentEndTime.join(":"))) : 0,
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
        tryagain: true
      };
      obj.files = this.newComment.files;
      obj.customTags = this.tags;
      obj.selectedRubrics = this.selectedRubrics;
      if (this.EditMode) {
        obj.time = (this.newComment.timeEnabled) ? Math.floor(this.FormatToSeconds(this.VideoCurrentTime.join(":"))) : 0;
        this.headerService.localStorage(JSON.stringify(obj), user_id + '_video_play_edit_comment_' + this.EditableComment.id)
      } else {
        this.headerService.localStorage(JSON.stringify(obj), user_id + '_video_play_comment_' + this.params.video_id);;
      }
    }
    console.log('Destroyer Called', this.newComment)
    // this.subscription.unsubscribe();
    // this.socket_listener.unsubscribe();
    this.subscriptions.unsubscribe();
    if (this.modalRef) this.modalRef.hide();
    localStorage.setItem('searchDataText', '');
    localStorage.setItem('LsTagId', '');
  }

}
