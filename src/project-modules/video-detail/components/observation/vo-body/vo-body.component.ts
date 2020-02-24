import { Component, OnInit, ViewChild, OnDestroy, HostListener, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { TabsetComponent, BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ToastrService } from "ngx-toastr";
import * as _ from "underscore";
import { Subscription } from 'rxjs';

import { HeaderService, AppMainService, SocketService } from "@app/services";
import { MainService, ObservationService } from "@videoDetail/services";
import { environment } from "@environments/environment";
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import {debug} from 'util';

@Component({
  selector: 'vo-body',
  templateUrl: './vo-body.component.html',
  styleUrls: ['./vo-body.component.css']
})
export class VoBodyComponent implements OnInit, OnDestroy {
  staticFiles: any = [];
  totals: any = {};
  currentTimeInSeconds: any;
  DeletableFile: any;
  selectedFiles: any = [];
  huddleCradentials: { video_id: any; huddle_id: any; user_id: any; };
  isCreaterOfThisScriptedNote: any = false;
  user_id: any;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.options.timerStarted && !this.options.script_published) {
      $event.returnValue = false;
    }
  }

  @ViewChild('MainTabs', { static: false }) MainTabs: TabsetComponent;
  public pageState: string = '';
  public CurrentTab;
  public settings;
  public permissions: any = {};
  public params;
  public rubrics;
  public selectedRubrics;
  public enabledLoad;
  public options: any = {};
  private player;
  private interval_id;
  public colorClasses;
  public comments;
  public isAuthenticatedUser;
  public src;
  public CustomMarkers;
  public selectedTag;
  private VideoCurrentTime;
  public newComment: any = {};
  public tags;
  private fakeCommentCount;
  public EditMode;
  public EditableComment;
  public conf;
  public scriptMode;
  public SelectedPLRubric;
  public tagIds: number[] = []; // selectedPLRubricAccountTagIds
  public ratingIds: number[] = []; // rubricAccountTagRatingIds
  public PLTabData;
  public PLcomments;
  public TempTime;
  public SearchFormOptions;
  public FilteredCommentsCounts;
  public showPublish;
  public VideoInfo;
  public frameworks;
  public rubricPreview;
  public VideoHuddleFramework = 0;
  public VideoHuddleDefaultFramework = 0;
  public modalRef: BsModalRef;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  public header_data;
  public translation: any = {};
  public translationLoaded: boolean = false;
  private subscription: Subscription;
  workspace: any;
  searchTerm = '';
  public loaded: boolean = false;
  public oldSyncNote: boolean = false;
  videoOldTime: any = [];
  isCreater = true;
  public currnetUser;
  public videoOptions: any;
  private subscriptions: Subscription = new Subscription();
  public isREcordingOn=false;

 public showCrudOptions=false;



  public userAccountLevelRoleId: number | string = null;

  constructor(private socketService: SocketService, private modalService: BsModalService, private aRouter: ActivatedRoute, private FullRouter: Router, private toastr: ToastrService, private observationService: ObservationService, public mainService: MainService, private headerService: HeaderService, private router: ActivatedRoute, private appMainService: AppMainService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      if (this.translation.vd_notes) {
        this.translationLoaded = true;
      }
    });

  }

  ngOnInit() {
    this.aRouter.queryParams.subscribe(params => {
      params.workspace ? this.workspace = params.workspace : this.workspace = null;
    });
    this.totals = {};
    this.totals.resources_count = 0;
    this.header_data = this.headerService.getStaticHeaderData();
    this.user_id=this.header_data.user_current_account.User.id,
    this.currnetUser = this.header_data.user_current_account.User;
    this.newComment = {};
    this.newComment.files = [];
    // Dynamic Button Colors Start
    this.header_color = this.header_data.header_color;
    this.primery_button_color = this.header_data.primery_button_color;
    this.secondry_button_color = this.header_data.secondry_button_color;
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream

    // Dynamic Button Colors End

    this.initVars();

  }

  private initVars() {
    // if (this.MainTabs && this.MainTabs[0])
    //   this.MainTabs.tabs[0].active = true;
    this.CurrentTab = 0;
    this.settings = {};
    this.selectedRubrics = [];
    this.enabledLoad = true;
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
    this.VideoInfo = {};
    // this.VideoInfo.h_type = "2";
    this.permissions.isEditingAllowed = 0;
    this.VideoHuddleFramework = 0;
    // temporary workaround
    // this.permissions.rubric_check = true;

    this.showCrudOptions=true;
    this.RunSubscribers();
    this.videoOptions = {
      maxFiles: 20,
      accept: ['image/*', 'text/*', '.pdf'], //GLOBAL_CONSTANTS.RESOURCE_UPLOAD_EXTENSIONS,
      fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'url', 'onedrive']
    };
  }

  private RunSubscribers() {


    this.router.url.subscribe((url) => {


      if (url && url[0] && url[0].path == "scripted_observations") {

        this.InitScriptMode();

      }

    });

    this.router.params.subscribe((param) => {


      this.handleParams(param);

    });

    this.mainService.SearchData.subscribe((data) => {

      this.filterComments(data);

    });

    this.mainService.GetFrameworks().subscribe((frameworks) => {

      this.frameworks = frameworks;
      // if (this.frameworks.length == 1) {
      //   // this.VideoHuddleFramework = this.frameworks[0].account_tag_id;
      //   // this.GetRubricById(this.frameworks[0].account_tag_id)
        
      // }
      if(this.frameworks.length == 1){
        
        setTimeout(()=>{
            this.VideoHuddleFramework = this.frameworks[0].account_tag_id;
              //  this.rubricPreview = this.frameworks[0];
            this.ResolveAssignFramework(1, true);
        }, 3000);
        // this.permissions.framework_selected_for_video = "0";
        

      }

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

    this.socketPushFunctionComment();


  }

  private InitScriptMode() {

    this.scriptMode = true;
    this.options.current_time = "00:00:00";
    this.options.current_seconds = 0;
    this.options.timerStarted = false;
    this.options.interval_id = -1;

  }
  AddPermissions() {
    let obj = {

      video_id: this.params.video_id,
      huddle_id: this.params.huddle_id,
      user_id: this.header_data.user_current_account.User.id,
      account_id: this.header_data.user_current_account.accounts.account_id
    }
    this.observationService.StartScript(obj).subscribe((data: any) => {
      if (data.success)
        this.permissions.isEditingAllowed = 1;
    })
  }
  public StartTimer() {

    this.options.timerStarted = true;

    // this.options.timerStarted = true;


    this.options.interval_id = setInterval(() => {
      this.options.timerStatus = 'playing';

      this.options.current_seconds++;
      this.options.current_time = this.ConvertTime(this.options.current_seconds);
      this.isREcordingOn=true;
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

      // this.observationService.StopScript(obj).subscribe((data)=>{


      // });

      // this.options.timerStatus='stopped';
      this.PublishScript(true);
      this.isREcordingOn=false;
      clearInterval(this.options.interval_id);

    }

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
  // public GetRubricById(framework_id) {

  //   if (framework_id) {
  //     let obj = {
  //       framework_id: framework_id
  //     };


  //     this.mainService.GetRubricById(obj).subscribe((rubrics: any) => {

  //       this.rubricPreview = rubrics.data;


  //     });
  //   }



  // }

  public GetRubricById(framework_id, assign?){

    if(!framework_id){
      this.rubricPreview = {};
      return;
    }

    if(framework_id){
     let obj = {
      framework_id: framework_id
    };

    this.mainService.GetRubricById(obj).subscribe((rubrics:any)=>{

      this.rubricPreview = rubrics.data;
     
      if(assign){

        this.rubrics = this.rubricPreview;

      }

    });
    }



  }
  public ResolveAssignFramework(flag, is_internal?){

    if(flag==0){

      this.modalRef.hide();

    }else{

      if(!is_internal){
        this.modalRef.hide();
      }
      
      let obj = {
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        framework_id: this.VideoHuddleFramework,
        user_id: this.headerService.getUserId()
      }
      this.mainService.SetFrameworkForVideo(obj).subscribe((data:any)=>{

        if(!data.status){

          if(!is_internal){
            this.toastr.info(this.translation.vd_framework_selected_for_video);
          }
          
          let video_framework_id = data.video_framework_id;
          this.GetRubricById(video_framework_id, true);
        //  this.rubrics = _.findWhere(this.frameworks, {account_tag_id: video_framework_id});
          // this.rubrics = this.rubricPreview;
          this.permissions.framework_selected_for_video="1";

        }else{

          /** This section has been moved to "framework_selected" websocket start */
            // this.rubrics = this.rubricPreview;
            // this.permissions.framework_selected_for_video = "1";
          /** This section has been moved to "framework_selected" websocket end */
        }

      });
      //CHOOSE FRAMEWORK HERE

    }

  }

  private processFrameworkSelected(frameworkId) {

    this.GetRubricById(frameworkId, true)
    this.permissions.framework_selected_for_video = "1";
    this.toastr.info(this.translation.framework_selected_scriptedNotes);
  }
  // public ResolveAssignFramework(flag) {

  //   if (flag == 0) {

  //     this.modalRef.hide();

  //   } else {

  //     this.modalRef.hide();
  //     this.rubrics = this.rubricPreview;
  //     this.permissions.framework_selected_for_video = "1";

  //     let obj = {
  //       huddle_id: this.params.huddle_id,
  //       video_id: this.params.video_id,
  //       framework_id: this.VideoHuddleFramework,
  //       user_id: this.headerService.getUserId()
  //     }
  //     this.mainService.SetFrameworkForVideo(obj).subscribe(() => { });
  //     //CHOOSE FRAMEWORK HERE

  //   }

  // }

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
              that.FullRouter.navigate(["/"]);
            } else {
              this.totals.comment_count = data.comments_counts.total_comments;
              data.user_huddle_level_permissions = 200;
              this.permissions.coaching_perfomance_level = data.coaching_perfomance_level;
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
              if (data.video_object_detail.created_by == +user_id)
                this.isCreaterOfThisScriptedNote = true;
                
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
    this.updateCommentCount();

    // this.totals.comment_count = data.comments_counts.total_comments;
    // this.totals.resources_count = data.attached_document_numbers;
    console.log('data in handleVideoData: ', data)
    // this.VideoInfo = data.video_detail;
    this.currnetUser.huddle_role_id = data.user_huddle_level_permissions;
    this.VideoInfo.h_type = data.h_type;
    this.VideoInfo.huddle_type = data.huddle_type;
    this.VideoInfo.coachee_name = data.coachee_name;
    this.VideoInfo.coaches_name = data.coaches_name;
    this.VideoInfo.coaching_link = data.coaching_link;
    this.VideoInfo.assessment_link = data.assessment_link;
    this.settings.PauseWhileTyping = Boolean(data.user_pause_settings);
    this.permissions.coaching_perfomance_level = data.coaching_perfomance_level == "1";
    this.permissions.can_view_summary = data.can_view_summary;
    this.permissions.rubric_check = data.rubric_check;
    this.permissions.performance_level_check = data.performance_level_check;
    this.permissions.coaching_summary_check = data.coaching_summary_check;
    this.permissions.assessment_summary_check = data.assessment_summary_check;
    this.permissions.can_comment = data.can_comment;
    this.permissions.can_reply = data.can_reply;
    this.permissions.can_rate = data.can_rate;
    this.permissions.showCopy = data.can_dl_edit_delete_copy_video;
    this.permissions.AllowCustomMarkers = data.video_markers_check == "1";
    this.permissions.huddle_permission = data.user_huddle_level_permissions;
    // this.permissions.huddle_permission = 200; //data.user_huddle_level_permissions;
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
 
    // data.default_framework &&
    if ( data.default_framework != "0" && data.default_framework != "-1") {

      this.VideoHuddleFramework = data.default_framework;
      this.GetRubricById(data.default_framework);

    }

    this.loaded = true;

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

  public RatingChanged(id) {

    let sessionData: any = this.headerService.getStaticHeaderData();

    id = Number(id);
    this.tagIds.push(this.SelectedPLRubric.account_tag_id);
    this.ratingIds.push(id);

    let val = _.findWhere(this.SelectedPLRubric.selectOptions, { id: this.ratingIds[this.ratingIds.length - 1] });
    // let val = _.findWhere(this.SelectedPLRubric.selectOptions, { id: id });

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
    // obj["rating_id_" + this.SelectedPLRubric.account_tag_id] = this.ratingIds[0];


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

    this.showPublish = false;

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

  private handleVideo(data) {

    console.log('data in handleVideo: ', data)

    if (data && data.original_file_name) {
      this.options.video_title = data.original_file_name;
      // this.options.video_title = data.video_object_detail.title || data.video_object_detail.original_file_name.replace('.mp4', '');

      this.permissions.rubric_check = data.rubric_check;
      this.permissions.allow_per_video = data.allow_per_video;
      this.permissions.framework_selected_for_video = data.framework_selected_for_video;
      this.permissions.huddle_permission = data.huddle_permission;
      this.permissions.AllowCustomMarkers = data.video_markers_check == 1;

      this.currnetUser.huddle_role_id = data.user_huddle_level_permissions;

      if (!this.CustomMarkers)
        this.CustomMarkers = data.custom_markers;

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

  private GetCommentTime() {

    // return this.TempTime.seconds;

    // if(this.options.status=="uploaded" || this.options.status=="published" || this.VideoCurrentTime>0){

    //   return Math.floor(this.VideoCurrentTime) || 0;

    // }else
    if (!this.TempTime) {
      return Math.floor(this.options.current_seconds) || 0;
    } else {
      return this.TempTime.seconds;
    }

  }
  public allowToComment() {

    let tags = this.GetCustomTags();
    // console.log('tags',!_.isEmpty(tags),'markers', !!_.isEmpty(this.selectedTag), 'upload files', !!(this.newComment.files && this.newComment.files.length > 0), 'frameworks', !!(this.selectedRubrics.length > 0))
    let result = true;
    if ((!this.newComment.commentText.trim() || this.newComment.commentText.trim() == ""))
      result = true;

    if (this.newComment.commentText.trim() || (this.newComment.commentText.trim() != "" && this.newComment.commentText.trim() != undefined))
      result = false;

    if (!!!_.isEmpty(this.selectedTag) || (!_.isEmpty(tags)) || !!(this.newComment.files && this.newComment.files.length > 0) || !!(this.selectedRubrics.length > 0))
      result = false;

    return result;


  }


  public AddTextComment(inputObj) {
    this.showCrudOptions=false;

    let text = inputObj.text || "";
    let files = [];
    if (inputObj.files && inputObj.files.length > 0) files = inputObj.files;

    this.newComment.commentText = text;

    // if (!this.newComment.commentText || this.newComment.commentText == "") {
    let allowComment = this.allowToComment()
    if (allowComment) {

      this.toastr.info(this.translation.vd_please_enter_comment);
      return;

    } else {

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj = {
        videoId: this.params.video_id,
        for: "synchro_time",
        synchro_time: this.GetCommentTime(),
        time: this.GetCommentTime(),
        ref_type:this.newComment.ref_type || '2',
        comment: this.newComment.commentText,
        user_id: user_id,
        standards_acc_tags: this.PrepareRubrics(),
        default_tags: this.GetCustomTags(),
        assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
        fake_id: this.GetFakeId(),
        observation_check: true,
        account_role_id: sessionData.user_current_account.users_accounts.role_id,
        current_user_email: sessionData.user_current_account.User.email,
        is_scripted_note : '1'
      };
      //recrearting add comment tabs
      this.OnTabSelect(2);

      this.OnTabSelect(0);

      // let files = [];
      this.selectedRubrics = [];
      this.ResetForm();

      this.appMainService.AddComment(obj).subscribe((data: any) => {

        if (data.status == "success") {
          // this.ResetForm();
          this.showCrudOptions=true;
          // this.mainService.ResetForm.emit(1);
         

          // this.totals.comment_count++;
          // delete this.TempTime;

          // let comment = data["0"];
          // let fake_id = data["0"].fake_id;
          // comment.valid = true;

          // let index = _.findIndex(this.comments, { fake_id: fake_id });
          // if (index > -1) {

          //   this.selectedRubrics = [];
          //   this.tags = [];
          //   this.comments[index] = comment;
          //   this.EditableComment = {};
          //   this.EditableComment.comment = "";
          //   this.OnTabSelect(0);
          //   this.mainService.CommentAddedNotification.emit(comment);
          // }

          // this will be added by websocekts
          if (inputObj.files && inputObj.files.length > 0) {
            this.AddTimeStampToResources(files, true, obj.time, data[0].id);
            // this.staticFiles = this.staticFiles.concat(files);
          }
        }

      });
      // this.ActivateTab(0);
      this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
      // this.ResetForm();
    }

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
      this.toastr.info(this.translation.vd_please_select_comment_to_delete);
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

    // this.NormalizeTime();
  }

  private NormalizeTime() {
    if (this.FormatToSeconds(this.VideoCurrentTime.join(":")) > this.options.current_seconds) {

      this.toastr.info(this.translation.comment_time_ahead);

      this.VideoCurrentTime = this.options.current_time.split(":");
      return;

    }
    // this.options.current_seconds
  }


  private FormatToSeconds(time) {

    if (time == 0) return 0;
    if (typeof (time) == "number") return time;
    let stamp = time.split(":");

    return Number(stamp[0] * 3600) + Number(stamp[1] * 60) + Number(stamp[2]);

  }

  public onCommentEdit(c) {
    if(this.rubrics){
      this.rubrics.account_tag_type_0.forEach((r)=>{r.selected=false;});
    }
    if (!c) {
      this.EditMode = false;
      return;
    }
    this.mainService.isEditComent = true;
    // this.options.script_published = false;
    this.EditMode = true;
    this.AttachFilesToComment(c, true);
    this.prepareEditComment(c);
    // this.options.timerStatus = 'stopped';

  }
  private prepareEditComment(comment) {

    // this.AttachFilesToComment(comment);
    this.EditableComment = comment;
    // this.newComment.timeEnabled = comment.time>=0;
    // this.newComment.commentText = comment.comment;
    // this.TempTime = 
    this.videoOldTime = this.ConvertTime(comment.time).split(":");
    this.VideoCurrentTime = this.ConvertTime(comment.time).split(":");
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
      "created_date_string": `${sessionData.language_translation.vd_afewsecondsago}`,
      "standard": this.selectedRubrics,
      "default_tags": [
        this.selectedTag
      ]
    };

    return fake_comment;

  }
  findNegativeNumber(timeArray) {
    if (timeArray == "All Video") return false;

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
    if (timeArray == "All Video") return true;

    // let a = timeArray.split(":")
    // console.log(a)
    let a = timeArray;

    let newTime = parseInt(a[0]) * 3600;
    newTime += parseInt(a[1]) * 60;
    newTime += parseInt(a[2]);

    return newTime;
  }

  public EditTextComment(arg: any) {
    this.showCrudOptions=false;

    // this.OnTabSelect(7);
    // setTimeout(() => {
    //   this.OnTabSelect(0);
    // }, 50);
    if (!arg) {


      this.EditMode = false;
      // this.ResetForm();
      this.selectedTag = {};
      this.selectedRubrics = [];
      this.tags = [];
      this.showCrudOptions=true;

      return;

    }

    if (arg.flag == 0) {
      this.selectedTag = {}
      this.selectedRubrics = [];
      this.tags = [];
      this.showCrudOptions=true;

      this.EditMode = false;
      // this.ResetForm();
      return;

    }

    this.newComment.commentText = arg.text;
    this.EditableComment.comment = arg.text

    if (!this.newComment.commentText || this.newComment.commentText == "") {

      this.toastr.info(this.translation.vd_please_enter_comment);
      // this.toastr.info(this.translation.vd_pleaseentersometexttocomment);
      return;

    } else {

      // this.NormalizeTime();
      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let account_id = sessionData.user_current_account.accounts.account_id;
      let huddle_id = this.params.huddle_id;

      // var newTime = this.calculateSeconds(this.VideoCurrentTime.join(":"));
      // var oldTime = this.calculateSeconds(this.videoOldTime.join(":"));
      // var isNagative = this.findNegativeNumber(this.VideoCurrentTime.join(":"))
      var newTime = this.calculateSeconds(this.VideoCurrentTime);
      var oldTime = this.calculateSeconds(this.videoOldTime);
      var isNagative = this.findNegativeNumber(this.VideoCurrentTime)
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
            for: "synchro_time",
            synchro_time: this.FormatToSeconds(this.VideoCurrentTime.join(":")), //this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:'',
            time: this.FormatToSeconds(this.VideoCurrentTime.join(":")),//this.EditableComment.time, //(this.newComment.timeEnabled)? this.currentTimeInSeconds:0,
            ref_type: this.newComment.ref_type ||'2',
            comment: arg.text,//this.newComment.commentText,
            user_id: user_id,
            standards_acc_tags: this.PrepareRubrics(),
            default_tags: this.GetCustomTags(),
            observation_check: true,
            assessment_value: (!_.isEmpty(this.selectedTag)) ? "# " + this.selectedTag.tag_title : "",
            account_role_id: sessionData.user_current_account.users_accounts.role_id,
            current_user_email: sessionData.user_current_account.User.email

          };
          
          this.EditMode = false;

          this.appMainService.EditComment(obj).subscribe((data: any) => {
            this.EditMode = false;
            this.ResetForm();
            this.selectedRubrics = [];
          this.tags = [];
            if (data.status == "success") {
              this.showCrudOptions=true;

              // now websocket wil filre this toatr
              // this.toastr.success(this.translation.vd_updated_comments);
              this.selectedRubrics = [];
              this.tags = [];
              let index = _.findIndex(this.comments, { id: this.EditableComment.id });
              if (index > -1) {

                this.comments[index] = data.updated_comment;
                this.comments[index].valid = true;
                this.EditableComment = {};
                this.mainService.ReRenderMarkers.emit(true);
                // this.mainService.ResetForm.emit(1);
                this.EditMode = false;
              }

              if (arg.files && arg.files.length > 0) {

                this.AddTimeStampToResources(arg.files, true, obj.time, data.updated_comment.id);

                // this.staticFiles = this.staticFiles.concat(data);

              }
              // this.staticFiles=[];
              this.AttachFilesToComment(obj, true);
              // this.refreshResourceList();

            } else {

              this.toastr.info(this.translation.vd_went_wrong_text);
            }

          });
          // this.ActivateTab(0);
          // this.comments.unshift(this.PrepareFakeComment(obj, sessionData));
          // this.ResetForm();
        }
      }
    }

  }

  refreshResourceList() {
    let sessionData: any = this.headerService.getStaticHeaderData();
    let user_id = sessionData.user_current_account.User.id;
    this.router.params.subscribe((param) => {

      this.mainService.GetVideoResources({ video_id: param.video_id, huddle_id: param.huddle_id, user_id: user_id }).subscribe((data: any) => {

        if (data) {
          data.map((d) => {
            if (d.scripted_current_duration) d.time = this.ConvertTime(d.scripted_current_duration);
            else d.time = this.translation.vd_all_videos;
          });
          this.staticFiles = [];
          this.staticFiles = this.staticFiles.concat(data);
        }

      });
    });
  }

  public GetTime(t) {
    this.currentTimeInSeconds = t;
    this.VideoCurrentTime = t;

  }

  public OnTypingStart() {

    //if(this.scriptMode){
    this.TempTime = {
      formatted: this.options.current_time,
      seconds: this.options.current_seconds
    }

    //}
    // this.options.current_time seconds
  }

  private handleParams(params) {

    this.params = params;

    // code added to get document related to current scripted note
    let sessionData: any = this.headerService.getStaticHeaderData();

    let user_id = sessionData.user_current_account.User.id;
    this.huddleCradentials = { video_id: params.video_id, huddle_id: params.huddle_id, user_id: user_id }

    this.mainService.GetVideoResources({ video_id: params.video_id, huddle_id: params.huddle_id, user_id: user_id }).subscribe((data: any) => {

      if (data) {
        data.map((d) => {
          if (d.scripted_current_duration) d.time = this.ConvertTime(d.scripted_current_duration);
          else d.time = this.translation.vd_all_videos;
        });
        this.staticFiles = this.staticFiles.concat(data);
      }

    });
    // code added to get document related to current scripted note ends here

    // if(this.scriptMode){
    //   return;
    // }
    // if (!this.scriptMode)
    //   this.GetVideoStatus(params.video_id);

    if (this.scriptMode) {
      this.GetVideo();
    }

    let that = this;

    let interval_id = setInterval(() => {

      let sessionData: any = that.headerService.getStaticHeaderData();

      if (sessionData && sessionData.user_current_account) {

        that.GetRubrics(params.huddle_id, sessionData.user_current_account.accounts.account_id);

        clearInterval(interval_id);

      }

    }, 50);

  }

  private GetRubrics(huddle_id, account_id) {

    this.mainService.GetRubrics({ huddle_id: huddle_id, account_id: account_id, video_id: this.params.video_id }).subscribe((data: any) => {

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
    if (tab_id == 0)
      this.MainTabs.tabs[tab_id].active = true;
    if (tab_id == 1)
      this.MainTabs.tabs[2].active = true;
    this.CurrentTab = tab_id;


    if (tab_id == 3) {
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

  public getCoachingSummaryCheck() {
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

  }

  public getPLTabPermission() {
    if (this.VideoInfo.h_type == 2 || this.VideoInfo.h_type == 1) {
      return this.permissions.coaching_perfomance_level;

    } else if (this.VideoInfo.h_type == 3) {

      return this.permissions.assessment_perfomance_level;

    }

  }

  public PointToLink() {

    // let link = this.VideoInfo.h_type=="2"? environment.baseUrl+"/Dashboard/coach_tracker" : this.VideoInfo.h_type=="3"? environment.baseUrl+"/Dashboard/assessment_tracker":"";
    let link = this.VideoInfo.h_type == "2" ? `${environment.baseUrl}/home/trackers/coaching?date=1month` : this.VideoInfo.h_type == "3" ? `${environment.baseUrl}/home/trackers/assessment` : "";

    if (link) {
      window.open(link, "_blank");
    }

    setTimeout(() => {
      this.MainTabs.tabs[0].active = true;
    });

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
      // time: (this.newComment.timeEnabled)? this.currentTimeInSeconds:0,
      // time: (this.newComment.timeEnabled)? this.currentTimeInSeconds:0,
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

            if (c.Comment && c.Comment.responses) {

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

  public getPerformanceLevelCheck() {
    if (this.workspace) {
      return this.permissions.coaching_perfomance_level;
    } else {
      return this.permissions.performance_level_check;
    }
  }

  // for file upload
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
      // to increase statci file count
      // this.staticFiles = this.staticFiles.concat(data.data);
      // this.staticFiles = this.staticFiles.concat(file);


    });

  }
  public GetNewFiles(obj) {
    if (obj.from == 'resources') {
      // WebSocket wil add this
      this.AddTimeStampToResources(obj.files);


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
    }

    this.DownloadFile(file);


  }

  private DownloadFile(file) {

    this.mainService.DownloadFile(file.id);

  }
  public InitiateDeleteResource(template: TemplateRef<any>, file) {

    this.DeletableFile = file;
    this.modalRef = this.modalService.show(template, { class: "modal-md" });


  }
  public AttachFilesToComment(comment, is_internal?) {

    if (!comment.isExpnded && !is_internal) return;

    if (((typeof (comment.time) == "number" && comment.time == 0) || comment.time == "0") && !comment.is_new_comment) {

      comment.files = [];
      return;

    }

    comment.files = [];

    if (comment.is_new_comment) {
      comment.files = this.staticFiles.filter(file => file.comment_id == comment.id);
      this.selectedFiles = comment.files

      return;
    }

    if (this.staticFiles && this.staticFiles.length > 0)
      this.staticFiles.forEach((file) => {

        if (!file) return;

        file.time2 = file.time == "All Video" ? 0 : this.FormatToSeconds(file.time);

        comment.time2 = this.FormatToSeconds(comment.time);
        if (comment.time2 == file.time2) {

          comment.files.push(file);

        }
        this.selectedFiles = comment.files

      })



    // if(this.WhetherScrollOrNot("#comment_"+this.index) && (comment.default_tags.length>0 || comment.files.length>0 || comment.standard.length >0)){

    //   this.scrollService.scrollTo("#slimscroll","#comment_"+this.index);

    // }

  }

  public ResolveDeleteFile(flag, id?) {
    let sessionData = this.headerService.getStaticHeaderData();

    if (flag == 0) {
      this.modalRef.hide();
    } else {
      if (this.modalRef)
        this.modalRef.hide();

      let obj = {
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        document_id: this.DeletableFile.id ? this.DeletableFile.id : id,
        user_id: this.header_data.user_current_account.User.id,
      }

      this.mainService.DeleteResource(obj).subscribe((data: any) => {
        // commentting this condition check to remove this form local array wheter we  get positive or nagative respose for nw
        // if(!data.error){

        // this.toastr.info(this.translation.resource_deleted);
        let index = _.findIndex(this.staticFiles, { id: id ? id : this.DeletableFile.id });
        if (index > -1) {
          this.staticFiles.splice(index, 1);
          this.totals.resources_count--;
        }


        // }

      });

    }

  }

  updateFilesCountFN(files) {
    this.selectedFiles = files;
    this.refreshResourceList()
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
    // intentioal commentd below web sockets
    let workspaceChannelName = `workspace-${this.header_data.user_current_account.users_accounts.account_id}-${this.header_data.user_current_account.users_accounts.user_id}`;
    this.subscriptions.add(this.socketService.pushEventWithNewLogic(workspaceChannelName).subscribe(data => {
      this.processEventSubscriptions(data);
    })
    );
    // this.socketService.pushEvent(workspaceChannelName);
  }

  private processEventSubscriptions(res) {

    // this.subscriptions.add(this.socketService.EventData.subscribe(ress =>{
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
      // case "feedback_published":
      //   this.processFeedbackPublished(res.data);
      //   break;
      // case "ratings_updated":
      //   this.processRatingsUpdated(res.data, res.document_id, res.huddle_id);
      //   break;
      case "resource_renamed":
        this.processResourceRenamed(res.data, res.is_dummy);
        break;
    }

    // }));
  }

 
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
  private processResourceRenamed(data, is_dummy) {
    if (!is_dummy && (data.id == this.params.video_id || data.doc_id == this.params.video_id)) {
      this.VideoInfo.title = data.title;
      this.mainService.updateVideoTitle(data.title);
      // debugger
      // if(data.created_by!=this.user_id)
      this.toastr.info(this.translation.title_changed);
    }
  }

  private processResourceAdded(resource, reference_id) {
    if (reference_id == this.params.video_id) {
      resource.id = Number(resource.doc_id);
      resource.time = (resource.scripted_current_duration) ? this.ConvertTime(resource.scripted_current_duration) : this.translation.vd_all_videos;

      // incase of global attachments
      if (!resource.comment_id) {
        this.staticFiles.push(resource);
        // this.user_id
        // debugger
        // if(resource.created_by != this.user_id)
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
      //       file.time2 = file.time == "All Video" ? 0 : this.FormatToSeconds(file.time);

      //       comment.time2 = this.FormatToSeconds(comment.time);
      //       if (((!file.comment_id) && (comment.time2 == file.time2)) || ((file.comment_id) && (file.comment_id == comment.id))) {

      //         comment.files.push(file);

      //       }
      //     }

      //   });
      // }

    });

  }
  private processCommentAdded(comment, from_cake, reference_id) {
    console.log('this.comments: ', this.comments);
    if (reference_id == this.params.video_id) {
      let commentObj;
      if (from_cake) commentObj = JSON.parse(comment);
      else commentObj = comment;

      if (commentObj.created_by == this.header_data.user_current_account.User.id || commentObj.active == 1) {

        /* comment add section start */
        if (!commentObj.parent_comment_id) {
          commentObj.valid = true;
          // this.LoadPublishSettings();
          this.totals.comment_count++;
          this.mainService.CommentAddedNotification.emit(commentObj);
          let commentIndex = this.comments.findIndex(c => c.fake_id == commentObj.fake_id);
          delete commentObj.fake_id;
          if (commentIndex > -1 && !from_cake) {
            this.comments[commentIndex] = commentObj;
          }
          else this.comments.unshift(commentObj);
          // this.LoadRubricsTabData(true); // update performance level data

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

            // if (!this.comments[commentIndex].Comment) this.comments[commentIndex].Comment = {};
            // if (!this.comments[commentIndex].Comment.responses) this.comments[commentIndex].Comment.responses = [];
            // this.comments[commentIndex].Comment.responses.push(commentObj);
            // this.totals.comment_count++;
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

                  // if (!c.Comment.responses[replyIndex].responses) c.Comment.responses[replyIndex].responses = [];
                  // c.Comment.responses[replyIndex].responses.push(commentObj);
                  // this.totals.comment_count++;
                }
              }

            });

          }
          /* sub-reply add section end */
        }
        debugger
      if(comment.user_id!= this.user_id)
        this.toastr.success(this.translation.comment_added);
      }
    }
    console.log('this.comments: ', this.comments);
  }

  private processCommentEdited(comment, from_cake, reference_id) {
    console.log('before: ', this.comments)
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
        // this.LoadRubricsTabData(true); // update performance level data

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

            if (c.Comment && c.Comment.responses) {

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
      this.toastr.success(this.translation.comment_updated);
    }

  }

  private processCommentDeleted(parent_comment_id, item_id, reference_id) {

    if (reference_id == this.params.video_id) {
      // this.LoadPublishSettings();

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
      this.toastr.info(this.translation.comment_deleted);
    }


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

  // eb socekt code ends here
  ngOnDestroy() {
    console.log('uns: in vo body')
    this.subscription.unsubscribe();
    this.subscriptions.unsubscribe();
    localStorage.setItem('searchDataText','');
    localStorage.setItem('LsTagId','');
    if (this.modalRef) this.modalRef.hide();
  }

}
