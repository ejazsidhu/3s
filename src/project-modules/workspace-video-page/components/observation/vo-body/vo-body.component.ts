import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';
// import { MainService } from "../../services/main.service";
import { HeaderService, AppMainService } from "@app/services";
import { ActivatedRoute } from "@angular/router";
import { ObservationService, MainService } from "../../../services";
import { environment } from "@environments/environment";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import * as _ from "underscore";
import { Subscription } from 'rxjs';

@Component({
  selector: 'vo-body',
  templateUrl: './vo-body.component.html',
  styleUrls: ['./vo-body.component.css']
})
export class VoBodyComponent implements OnInit, OnDestroy {

  @ViewChild('MainTabs', { static: true }) MainTabs: TabsetComponent;
  public CurrentTab;
  public settings;
  public permissions;
  public params;
  public rubrics;
  public selectedRubrics;
  public enabledLoad;
  public options;
  private player;
  private interval_id;
  public colorClasses;
  public comments;
  public isAuthenticatedUser;
  public src;
  public CustomMarkers;
  public selectedTag;
  private VideoCurrentTime;
  public newComment;
  public tags;
  private fakeCommentCount;
  public EditMode;
  public EditableComment;
  public conf;
  public scriptMode;
  public SelectedPLRubric;
  public PLTabData;
  public PLcomments;
  public TempTime;
  public SearchFormOptions;
  public FilteredCommentsCounts;
  public showPublish;
  public staticFiles;
  public totals;
  public currnetUser;
  private currentTimeInSeconds;
  public modalRef: BsModalRef;
  public DeletableFile;
  public header_data;
  public translation;
  frameworks: any = [];
  rubricPreview: any = [];
  VideoInfo: any = {};
  VideoHuddleFramework: any;
  isframeworkselected = 0;
  constructor(private modalService: BsModalService, private FullRouter: Router, private toastr: ToastrService, private observationService: ObservationService, public mainService: MainService, private headerService: HeaderService, private router: ActivatedRoute, private appMainService: AppMainService) { }

  ngOnInit() {

    this.initVars();
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream

  }

  private initVars() {
    if (this.MainTabs && this.MainTabs[0])
      this.MainTabs.tabs[0].active = true;
    this.CurrentTab = 0;
    this.settings = {};
    this.permissions = {};
    this.selectedRubrics = [];
    this.enabledLoad = true;
    this.options = {};
    this.fakeCommentCount = 0;
    this.showPublish = false;
    this.newComment = {};
    this.colorClasses = ["#5db85b", "#38a0ff", "#ff5800", "#df0a00"]; //["q_circle", "i_circle", "b_circle", "r_circle"];
    this.comments = [];
    this.VideoCurrentTime = 0;
    this.EditMode = false;
    this.EditableComment = {};
    this.settings.EnterToPost = true;
    this.scriptMode = false;
    this.SearchFormOptions = { sorting: true, others: false, export: false };
    this.FilteredCommentsCounts = 1;
    this.staticFiles = [];
    this.totals = {};
    this.totals.resources_count = 0;
    // temporary workaround
    // this.permissions.rubric_check = true;
    this.RunSubscribers();
    let sessionData: any = this.headerService.getStaticHeaderData();

    this.currnetUser = sessionData.user_current_account.User;
  }

  private RunSubscribers() {


    this.router.url.subscribe((url) => {

      // console.log(url[0].path);

      if (url && url[0] && url[0].path == "scripted_observations") {

        this.InitScriptMode();

      }

    });



    this.router.params.subscribe((param) => {


      this.handleParams(param);
      // console.log(param);

    });

    this.mainService.SearchData.subscribe((data) => {

      this.filterComments(data);

    });

    this.mainService.GetFrameworks().subscribe((frameworks) => {
      this.frameworks = frameworks;
      if (this.frameworks.length == 1) {
        // this.VideoHuddleFramework = this.frameworks[0].account_tag_id;
        this.GetRubricById(this.frameworks[0].account_tag_id)
      }

    });

    this.mainService.PushableRubric.subscribe((r) => {

      if (r.selected) {

        this.selectedRubrics.push(JSON.parse(JSON.stringify(r)));

      } else {

        this.selectedRubrics = this.selectedRubrics.filter((rub) => {

          r.account_tag_id != rub.account_tag_id;

        });

      }

    });


  }
  // framework related function starts
  public GetRubricById(framework_id) {

    if (framework_id) {
      let obj = {
        framework_id: framework_id
      };

      this.mainService.GetRubricById(obj).subscribe((rubrics: any) => {

        this.rubricPreview = rubrics.data;


      });
    }



  }

  public AssignFramework(template, flag) {

    if (flag == 0) {

      this.rubricPreview = "";
      this.VideoHuddleFramework = this.VideoInfo.defaultFramework;
      console.log('in 7: ', this.VideoInfo.defaultFramework)
      this.GetRubricById(this.VideoInfo.defaultFramework);
      return;

    } else if (flag == 1) {

      this.modalRef = this.modalService.show(template, { class: 'modal-md' });

    }

  }

  public ResolveAssignFramework(flag) {

    if (flag == 0) {

      this.modalRef.hide();

    } else {
      this.isframeworkselected = 1;
      this.modalRef.hide();
      this.rubrics = this.rubricPreview;
      this.permissions.framework_selected_for_video = "1";

      let obj = {
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        framework_id: this.VideoHuddleFramework,
        user_id: this.headerService.getUserId()
      }
      this.mainService.SetFrameworkForVideo(obj).subscribe(() => { });
      //CHOOSE FRAMEWORK HERE

    }

  }

  // framework related function end

  private InitScriptMode() {

    this.scriptMode = true;
    if (!this.options) this.options = {};
    this.options.current_time = "00:00:00";
    this.options.current_seconds = 0;
    this.options.timerStarted = false;
    this.options.interval_id = -1;

  }

  public StartTimer() {

    this.options.timerStarted = true;

    this.options.interval_id = setInterval(() => {
      this.options.timerStatus = 'playing';

      this.options.current_seconds++;
      this.options.current_time = this.ConvertTime(this.options.current_seconds);

    }, 1000);

  }

  public pauseInterval(flag) {

    if (flag == 0) {
      this.options.timerStatus = 'paused';
      clearInterval(this.options.interval_id);
    } else if (flag == 1) {

      // StopScript
      let sessionData: any = this.headerService.getStaticHeaderData();
      let obj = {

        video_id: this.params.video_id,
        duration: this.options.current_seconds,
        account_role_id: sessionData.user_current_account.users_accounts.role_id,
        current_user_email: sessionData.user_current_account.User.email,
        account_id: sessionData.user_current_account.accounts.account_id

      }

      this.observationService.StopScript(obj).subscribe((data) => {

        console.log(data);

      });

      this.options.timerStatus = 'stopped';

      clearInterval(this.options.interval_id);

    }

  }

  public PublishScript() {

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
        this.toastr.info(this.translation.myfile_scripted_observation);

      }

    });



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

    this.FilteredCommentsCounts = _.where(this.comments, { valid: true });


  }
  public getMarkerBg(tag, index) {

    if (this.selectedTag == tag) {

      return this.colorClasses[index];

    } else {
      return "transparent";
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

        that.mainService.GetObservationVideo(data).subscribe((data) => {

          that.handleVideoData(data);

        });

      }

    });
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
    this.CustomMarkers = data.custom_markers;
    this.prepareComments(this.comments);
    // this.totals.comment_count = data.comments_counts.total_comments;
    // this.totals.resources_count = data.attached_document_numbers;
    // this.VideoInfo = data.video_detail;
    // this.VideoInfo.h_type = data.h_type;
    // this.VideoInfo.huddle_type = data.huddle_type;
    this.settings.PauseWhileTyping = Boolean(data.user_pause_settings);
    this.permissions.rubric_check = data.rubric_check;
    this.permissions.performance_level_check = data.performance_level_check;
    this.permissions.coaching_summary_check = data.coaching_summary_check;
    this.permissions.assessment_summary_check = data.assessment_summary_check;
    this.permissions.can_comment = data.can_comment;
    this.permissions.can_reply = data.can_reply;
    this.permissions.can_rate = data.can_rate;
    this.permissions.showCopy = data.can_dl_edit_delete_copy_video;
    this.VideoInfo.defaultFramework = data.default_framework;


    if (this.scriptMode) {
      this.options.script_published = data.video_object_detail.published == 1;
      this.options.video_title = data.video_object_detail.original_file_name;
      data.huddle_info.huddle_title = this.options.video_title;
      this.mainService.breadcrumbs.emit(data.bread_crumb_output);
      this.mainService.huddleInfo.emit(data.huddle_info);
    }

  }

  public RatingChanged(id) {

    let sessionData: any = this.headerService.getStaticHeaderData();

    id = Number(id);

    let val = _.findWhere(this.SelectedPLRubric.selectOptions, { id: id });

    let obj = {

      standard_ids: [this.SelectedPLRubric.account_tag_id],
      huddle_id: this.params.huddle_id,
      video_id: this.params.video_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id
    };

    obj["rating_value_" + this.SelectedPLRubric.account_tag_id] = val ? val.value : 0;
    obj["rating_id_" + this.SelectedPLRubric.account_tag_id] = id;


    this.mainService.SaveRating(obj).subscribe((data) => {

      console.log(data);

    });

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

  public Publish() {

    let that = this;

    let interval_id = setInterval(() => {

      let sessionData: any = that.headerService.getStaticHeaderData();

      if (sessionData.user_current_account) {

        clearInterval(interval_id);

        let obj = {

          video_id: that.params.video_id,
          account_id: sessionData.user_current_account.accounts.account_id,
          huddle_id: that.params.huddle_id,
          user_current_account: sessionData.user_current_account

        };

        that.mainService.PublishObservation(obj).subscribe((data: any) => {

          if (data.status) {

            let video_id = data.document_id;

            that.FullRouter.navigate(["/home", that.params.huddle_id, video_id]);
            location.reload();
          }

        });

      }


    });

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

  private GetVideoStatus(video_id) {

    let that = this;

    this.interval_id = setInterval(() => {

      if (that.enabledLoad) {

        that.observationService.LoadObservationVideo({ video_id: video_id, huddle_id: that.params.huddle_id }).subscribe((data: any) => {
          if (Number(data.upload_progress) >= 100) {
            that.FullRouter.navigate(["/home/", that.params.huddle_id, video_id]);
            //location.reload();
          } else {
            that.handleVideo(data);
          }
        });

      }

    }, 1000);

  }

  private handleVideo(data) {

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

      this.options.status = "uploading";
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

  public GetUrl() {


    return environment.baseUrl + "/MyFiles";

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

  private GetCommentTime() {

    // if(this.options.status=="uploaded" || this.options.status=="published" || this.VideoCurrentTime>0){

    //   return Math.floor(this.VideoCurrentTime) || 0;

    // }else 
    if (!this.TempTime) {
      return Math.floor(this.options.current_seconds) || 0;
    } else {
      return this.TempTime.seconds;
    }

  }


  public AddTextComment(comment) {

    this.newComment.commentText = comment.text;
    this.newComment.files = comment.files;

    if (!this.newComment.commentText || this.newComment.commentText == "") {

      this.toastr.info(this.translation.myfile_please_enter_comment);
      return;

    } else {

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj = {
        videoId: this.params.video_id,
        for: "synchro_time",
        synchro_time: this.GetCommentTime(),
        time: this.GetCommentTime(),
        ref_type: '2',
        comment: this.newComment.commentText,
        user_id: user_id,
        standards_acc_tags: this.PrepareRubrics(),
        default_tags: this.GetCustomTags(),
        assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
        fake_id: this.GetFakeId(),
        observation_check: true,
        account_role_id: sessionData.user_current_account.users_accounts.role_id,
        current_user_email: sessionData.user_current_account.User.email
      };

      let files = [];

      this.appMainService.AddComment(obj).subscribe((data: any) => {

        if (data.status == "success") {

          // this.totals.comment_count++;
          delete this.TempTime;

          let comment = data["0"];
          let fake_id = data["0"].fake_id;
          comment.valid = true;

          let index = _.findIndex(this.comments, { fake_id: fake_id });
          if (index > -1) {

            if (this.newComment.files && this.newComment.files.length > 0) {
              this.staticFiles = this.staticFiles.concat(this.newComment.files);
              files = this.newComment.files;
              this.AddTimeStampToResources(this.newComment.files, true, obj.time, comment.id);
            }

            this.selectedRubrics = [];
            this.tags = [];
            this.comments[index] = comment;
            this.EditableComment = {};
            this.EditableComment.comment = "";
            this.OnTabSelect(0);
            this.mainService.CommentAddedNotification.emit(comment);

          }

        }

      });
      // this.ActivateTab(0);
      this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
      this.ResetForm();
    }

  }

  private AddTimeStampToResources(files, isFromComment?, fixTime?, commentId?) {

    this.totals.resources_count += files.length;
    if (true) {

      let currnetUser;
      let sessionData: any = this.headerService.getStaticHeaderData();

      currnetUser = sessionData.user_current_account.User;

      files.forEach((f) => {

        f.created_by = currnetUser.id;

        f.time = fixTime ? fixTime : this.ConvertTime(this.currentTimeInSeconds);

        f.stack_url = f.url;

        f.title = f.filename || f.title;

        if (!isFromComment)
          this.UploadResource(f, true);
        else
          this.UploadResource(f, false, commentId);

      });
    }
    // else{

    //   files.forEach((f)=>{
    //     f.time = 0;
    //     f.stack_url = f.url;
    //     f.title = f.filename;

    //     if(!isFromComment)
    //       this.UploadResource(f, true);
    //     else
    //       this.UploadResource(f, false, commentId);

    //   });
    // }

  }

  public getFileTime(file) {

    if (isNaN(file.time)) return file.time;

    return this.ConvertTime(file.time);

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
      obj.comment_id = commentId;
    }

    //else file.time =
    if (!obj.time) obj.time = this.FormatToSeconds(file.time)
    this.appMainService.UploadResource(obj).subscribe((data: any) => {

      file.id = data.document_id;
      if (commentId) {
        file.comment_id = commentId;
      }

    });

  }

  private FormatToSeconds(time) {
    if (time == 0) return 0;
    if (typeof (time) == "number") return time;
    let stamp = time.split(":");

    return Number(stamp[0] * 3600) + Number(stamp[1] * 60) + Number(stamp[2]);
  }

  private ResetForm() {

    this.selectedTag = {};
    this.mainService.ResetForm.emit(1);

  }
  public ChooseCustomTag(tag) {

    if (this.selectedTag == tag) {
      this.selectedTag = {};
    } else {
      this.selectedTag = tag;
    }

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

          this.FindAndKill(comment.id);

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

        let _index = _.findIndex(c.Comment.responses, { id: id });

        if (_index > -1) {
          index = _index;
          parent = c;
        }

      });

      if (index > -1) {

        parent.Comment.responses.splice(index, 1);

      } else {

        this.comments.forEach((c) => {

          c.Comment.responses.forEach((r, i) => {

            let _index = _.findIndex(r.responses, { id: id });

            if (_index > -1) {
              r.responses.splice(_index, 1);
            }

          });

        });

      }

    }

  }

  public onCommentEdit(c) {

    if (!c) {
      this.EditMode = false;
      return;
    }
    // this.options.script_published = false;
    this.EditMode = true;
    this.prepareEditComment(c);

  }
  private prepareEditComment(comment) {

    this.AttachFilesToComment(comment);
    this.EditableComment = comment;
    // this.newComment.timeEnabled = comment.time>=0;
    // this.newComment.commentText = comment.comment;
    this.VideoCurrentTime = this.ConvertTime(comment.time);
    this.newComment.files = comment.files;
    if (!this.scriptMode) {
      window.scrollTo(0, document.body.scrollHeight - 30);
    } else {

      scrollTo(0, 30);

    }

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

  public AttachFilesToComment(comment) {

    if ((typeof (comment.time) == "number" && comment.time == 0) || comment.time == "0") {

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
      if (((!file.comment_id) && (comment.time2 == file.time2)) || ((file.comment_id) && (file.comment_id == comment.id))) {

        comment.files.push(file);

      }

    })

  }


  private perpareEditableTag(tag) {
    this.tags.push({ text: tag.tag_title, id: this.tags.length + 1 });

  }

  private GetCustomTags() {
    if (!this.tags || this.tags.length == 0) return "";
    let arr = [];
    this.tags.forEach((t) => { arr.push(t.text) });
    return arr.join();
  }
  private PrepareRubrics() {

    if (!this.selectedRubrics || this.selectedRubrics.length == 0) return "";

    let ret = [];

    this.selectedRubrics.forEach((r) => { ret.push(r.account_tag_id); });

    return ret.join(",");
  }
  private GetFakeId() {

    return ++this.fakeCommentCount;


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
      "created_date_string": this.translation.myfile_few_second,
      "standard": this.selectedRubrics,
      "default_tags": [
        this.selectedTag
      ]
    };

    return fake_comment;

  }

  public EditTextComment(arg: any) {

    if (!arg) {

      this.EditMode = false;
      this.EditableComment = {};
      this.ResetForm();
      return;

    }

    if (arg.flag == 0) {

      this.EditMode = false;
      this.EditableComment = {};
      this.ResetForm();
      return;

    }

    this.newComment.commentText = arg.text;

    if (!this.newComment.commentText || this.newComment.commentText == "") {

      this.toastr.info(this.translation.myfile_please_enter_comment);
      return;

    } else {

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let account_id = sessionData.user_current_account.accounts.account_id;
      let huddle_id = this.params.huddle_id;
      let obj = {
        huddle_id: huddle_id,
        account_id: account_id,
        comment_id: this.EditableComment.id,
        videoId: this.params.video_id,
        for: "synchro_time",
        synchro_time: this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:'',
        time: this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:0,
        ref_type: '2',
        comment: arg.text,//this.newComment.commentText,
        user_id: user_id,
        standards_acc_tags: this.PrepareRubrics(),
        default_tags: this.GetCustomTags(),
        observation_check: true,
        assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
        account_role_id: sessionData.user_current_account.users_accounts.role_id,
        current_user_email: sessionData.user_current_account.User.email


      };


      this.appMainService.EditComment(obj).subscribe((data: any) => {
        this.EditMode = false;
        this.ResetForm();
        if (data.status == "success") {
          this.selectedRubrics = [];
          this.tags = [];
          let index = _.findIndex(this.comments, { id: this.EditableComment.id });
          if (index > -1) {

            this.comments[index] = data.updated_comment;
            this.comments[index].valid = true;
            this.EditableComment = {};
            this.mainService.ReRenderMarkers.emit(true);
            this.mainService.ResetForm.emit(1);
            this.EditMode = false;
          }

        } else {
          this.toastr.info(this.translation.something_went_wrong_msg);
        }

      });
      // this.ActivateTab(0);
      // this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
      this.ResetForm();
    }

  }

  public GetTime(t) {

    this.VideoCurrentTime = t;

  }

  public OnTypingStart() {

    // console.log(this.options.current_time);
    // if(this.scriptMode){

    this.TempTime = {
      formatted: this.options.current_time,
      seconds: this.options.current_seconds
    }

    // }
    // this.options.current_time seconds
  }

  private handleParams(params) {

    this.params = params;
    let that = this;

    let interval_id = setInterval(() => {

      let sessionData: any = that.headerService.getStaticHeaderData();

      if (sessionData && sessionData.user_current_account) {
        this.GetVideoStatus(params.video_id);
        this.GetVideo();
        this.GetAttachments();
        clearInterval(interval_id);
      }

    }, 50);

  }
  private GetAttachments() {
    let sessionData: any = this.headerService.getStaticHeaderData();

    let user_id = sessionData.user_current_account.User.id;
    let args = this.params;
    this.mainService.GetVideoResources({ video_id: args.video_id, huddle_id: args.huddle_id, user_id: user_id }).subscribe((data: any) => {

      if (data)
        data.forEach((d) => {

          d.time = (d.scripted_current_duration) ? this.ConvertTime(d.scripted_current_duration) : "All Video";

        })

      if (data)
        this.staticFiles = this.staticFiles.concat(data);

    })
  }
  private GetRubrics(huddle_id, account_id) {

    this.mainService.GetRubrics({ huddle_id: huddle_id, account_id: account_id }).subscribe((data: any) => {

      this.rubrics = data.data;

    });

  }

  public ConvertTime(n) {

    if (!n || n == null || n == 0) return "00:00:00";
    let sec_num: any = parseInt(n, 10);
    let hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: any = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
  }

  public OnTabSelect(tab_id) {

    this.MainTabs.tabs[tab_id].active = true;
    this.CurrentTab = tab_id;

    if (tab_id == 2) {
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

  private GetDropdownSettingsFromPL(rubric: any) {

    return rubric.account_framework_settings_performance_levels.map((r) => {

      return { id: r.id, value: r.performance_level_rating, text: r.performance_level };

    })

  }

  public InitiateDeleteResource(template: TemplateRef<any>, file) {

    this.DeletableFile = file;
    this.modalRef = this.modalService.show(template, { class: "modal-md" });


  }

  public closeInfo(changeTabe = 0, changeToTab = 0, fromTab = 0) {

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
        document_id: id? id: this.DeletableFile.id,
        user_id: sessionData.user_current_account.User.id,
      }

      this.mainService.DeleteResource(obj).subscribe((data: any) => {

        if (!data.error) {
          this.toastr.info(this.translation.myfile_resources_deleted);
          let index = _.findIndex(this.staticFiles, { id: id ? id : this.DeletableFile.id });
          if (index > -1) {
            this.staticFiles.splice(index, 1);
            this.totals.resources_count--;
          }

        }

      });

    }

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

  public GetNewFiles(obj) {
    if (obj.from == 'resources') {

      this.AddTimeStampToResources(obj.files);

      this.staticFiles = this.staticFiles.concat(obj.files);

    }

  }

  public RemoveSelectedRubric(r) {

    if (r) {

      let rubric = r.rubric;
      let i = r.index;

      let index = _.findIndex(this.rubrics.account_tag_type_0, { account_tag_id: rubric.account_tag_id });

      if (index > -1) {

        this.rubrics.account_tag_type_0[index].selected = false;

        this.selectedRubrics.splice(i, 1);

      }

    }

  }

  ngOnDestroy() {
    // this.translationSubscription.unsubscribe();
    if (this.modalRef) this.modalRef.hide();
  }

}
