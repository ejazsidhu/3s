import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ToastrService } from "ngx-toastr";
import * as _ from "underscore";
import { Subscription } from 'rxjs';

import { CommentTypingSettingsInterface, RecordingState, VideoCommentPlayState, AudioPath } from "@videoPage/interfaces";
import { HeaderService, AppMainService } from "@app/services";
import { VideoPageService, MainService, PlayerService } from "@videoPage/services";
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import { MARKER_COLORS } from '@videoPage/constants';

@Component({
  selector: 'video-page-video-add-comment',
  templateUrl: './video-add-comment.component.html',
  styleUrls: ['./video-add-comment.component.css']
})
export class VideoAddCommentComponent implements OnInit, OnDestroy {

  @Input('VideoInfo') public VideoInfo: any;
  @Input('isVideoProcessing') public isVideoProcessing: boolean;
  @Input('permissions') public permissions: any;
  @Input('CustomMarkers') public CustomMarkers: any;
  @Input('userAccountLevelRoleId') public userAccountLevelRoleId: number | string = null;

  public header_data: any;
  public EditMode: boolean = false;
  public newComment: any = {
    commentText: '',
    files: [],
    timeEnabled: true
  };
  public markerColors: string[] = MARKER_COLORS;
  public staticFiles;
  public selectedRubrics: any[] = [];
  private selectedTag: any = {};
  private tags: any[] = [];
  private currentTimeInSeconds;
  public formattedVideoCurrentTime: string;
  private fakeCommentCount;

  public audioRecorderState: RecordingState = 'comfortZone';
  public localAudioData: any = {};
  public autoSaveAudio = "";

  public commentTextstatus: boolean = false;
  public tempEditComment: any = {};

  public settings: CommentTypingSettingsInterface;

  public translation: any;
  private subscriptions: Subscription = new Subscription();

  /** Local storage keys start */
  private VIDEO_PAGE_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.VIDEO_PAGE;
  private addCommentLSKey: string = '';
  /** Local storage keys end */

  constructor(
    private headerService: HeaderService, private videoPageService: VideoPageService, private mainService: MainService,
    private appMainService: AppMainService, private playerService: PlayerService, private toastr: ToastrService) {

    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => this.translation = languageTranslation));
    this.subscriptions.add(this.videoPageService.commentTypingSettings$.subscribe(
      (commentTypingSettings: CommentTypingSettingsInterface) => this.settings = commentTypingSettings));

    this.subscriptions.add(this.videoPageService.videoCurrentTime$.subscribe((videoCurrentTime: number) => {
      this.formattedVideoCurrentTime = this.formatTime(videoCurrentTime);
      this.currentTimeInSeconds = videoCurrentTime;
    }));

  }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();

    // prepare localstorage keys
    this.addCommentLSKey = `${this.VIDEO_PAGE_LS_KEYS.COMMENT}${this.VideoInfo.id}-${this.headerService.getUserId()}`;

    console.log('this.permissions: ', this.permissions)
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  public AppendNewFiles(obj) {
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
      // this.ResolveDeleteFile(1,file.id); // TODO:01 send request to delete file from the database
    }
  }

  public closeInfo(changeTabe = 0, changeToTab = 0, fromTab = 0) {
    // TODO: pending
    // this.ShowInfo = false;
    if (changeTabe) {
      // if (fromTab == this.currentTab) { // TODO: skipping this portion as add-comment does not have value of current tab
      // this.ActivateTab(changeToTab);
      // }

      this.videoPageService.updateCurrentTab(changeToTab); // new code
    }
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
        // this.EditTextComment(1); // TODO: Edit text comment functionality
      }
    }
  }

  public SetCustomTags(tags) {
    this.tags = tags;
  }

  public ToggleEnterPost() {
    this.settings.EnterToPost = !this.settings.EnterToPost;
  }

  public TogglePause() {
    const value = !this.settings.PauseWhileTyping;
    const EnterToPost = this.videoPageService.commentTypingSettingsCurrentValue.EnterToPost;
    this.videoPageService.updateCommentTypingSettings({ PauseWhileTyping: value, EnterToPost })

    const obj = {
      user_id: this.header_data.user_current_account.User.id,
      account_id: this.header_data.user_current_account.accounts.account_id,
      value: Number(value)
    };
    this.mainService.SavePauseSettings(obj).subscribe(() => { }, () => this.settings.PauseWhileTyping = !this.settings.PauseWhileTyping);
  }

  public updateCurrentTab(value: number) {
    this.videoPageService.updateCurrentTab(value);
  }


  // TODO:01 send request to delete file from the database
  // public ResolveDeleteFile(flag, id?){

  //   if(flag==0){
  //     this.modalRef.hide();
  //   }else{
  //     if(this.modalRef)
  //     this.modalRef.hide();
  //     let sessionData = this.headerService.getStaticHeaderData();

  //     let obj = {
  //       huddle_id: this.params.huddle_id,
  //       video_id: this.params.video_id,
  //       document_id: id? id: this.DeletableFile.id,
  //       user_id: sessionData.user_current_account.User.id,
  //     }

  //     this.mainService.DeleteResource(obj).subscribe((data:any)=>{

  //       if(!data.error){
  //         /** this code has been moved to "attachment_deleted" websocket start */
  //           // this.toastr.info(this.translation.resource_deleted);
  //           // let index = _.findIndex(this.staticFiles, {id: id? id: this.DeletableFile.id});
  //           // if(index >-1){
  //           //   this.staticFiles.splice(index, 1);
  //           //   this.totals.resources_count--;
  //           // }
  //         /** this code has been moved to "attachment_deleted" websocket end */

  //       }

  //     });

  //   }

  // }

  private GetCustomTags() {
    if (!this.tags || this.tags.length == 0) return "";
    let arr = [];
    this.tags.forEach((t) => { arr.push(t.text) });
    return arr.join();
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

  private GetFakeId() {

    return ++this.fakeCommentCount;


  }

  private PrepareRubrics() {

    if (!this.selectedRubrics || this.selectedRubrics.length == 0) return "";

    let ret = [];

    this.selectedRubrics.forEach((r) => { ret.push(r.account_tag_id); });

    return ret.join(",");
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

  public AddTextComment() {

    if (this.audioRecorderState == "resume") {
      this.autoSaveAudio = "add";//Sending save event to audio component to auto save audio comment.
      return;
    }
    this.autoSaveAudio = "";
    this.localAudioData = {};

    localStorage.removeItem(this.addCommentLSKey);

    // !this.newComment.commentText || this.newComment.commentText==""
    let allowComment = this.allowToComment()
    if (allowComment) {

      this.toastr.info(this.translation.please_enter_text_to_comment);
      return;

    } else {

      let sessionData: any = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      let obj = {
        videoId: this.VideoInfo.id,
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

        files = this.newComment.files;

      }

      if (this.settings.PauseWhileTyping) {

        this.playerService.PlayerPlayingState.emit("play");

      }

      this.videoPageService.updateCurrentTab(0);
      let preparedCommentObj: any = this.PrepareFakeComment(obj, sessionData);
      if (obj.ref_type == 6 && this.newComment.localAudio && this.newComment.audioUrl) {
        preparedCommentObj.comment = this.newComment.audioUrl;
      }
      // this.comments.unshift(preparedCommentObj); // TODO add comment to comment's array
      // if (this.commentsSortBy != 0) this.ApplySettings({ sortBy: this.commentsSortBy }); // TODO change change sort by for the comments
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

          /** TODO add files after successfull adding of comment start */
          // if (files.length > 0) {

          //   this.AddTimeStampToResources(files, true, obj.time, data[0].id);

          // }
          /** TODO add files after successfull adding of comment end */

        } else if (data.status == "failed") {

          this.toastr.error(data.message);
          // this.router.navigate(['/'])
        }
        else {
          this.toastr.info(this.translation.something_went_wrong_msg);
        }
      }, (err: any) => {

        /** Adding text comment to localstorage for try again start */
        preparedCommentObj.tryagain = true;
        preparedCommentObj.ref_type = obj.ref_type;
        preparedCommentObj.comment = obj.comment;
        preparedCommentObj.audioDuration = obj.audio_duration;
        preparedCommentObj.uuid = `${new Date().getTime()}-${this.VideoInfo.id}`;
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

        /** TODO: Local storage work start */
        // this.localArry.push(preparedCommentObj)
        // localStorage.setItem(user_id + '_fake_comment_video_' + this.params.video_id, JSON.stringify(this.localArry));
        /** TODO: Local storage work start */

      });
    }

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
    this.selectedTag = {};
    this.EditMode = false;
  }

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
      // this.EditTextComment(1); TODO: incase of edit
    }
    console.log('this.newComment: ', this.newComment)
  }
  /** Audio functionality end */


  public formatTime(time: number) {

    if (!time) return this.translation.vd_all_videos; //  Chheer khani 
    // if (!time || time == null || time == 0) return this.translation.vd_all_videos;//"00:00:00";
    let sec_num: any = parseInt(String(time), 10);
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

  public getMarkerBg(tag, index) {
    if (this.selectedTag == tag) {
      return this.markerColors[index];
    } else {
      return "transparent";
    }
  }


  public ChooseCustomTag(tag) {
    // this.EditChanges.changed_custom_markers = true; // TODO: edit case 
    if (this.selectedTag == tag) {
      this.selectedTag = {};
    } else {
      this.selectedTag = tag;
    }
  }

  private saveCommentToLS() {
    let sessionData: any = this.headerService.getStaticHeaderData();
    let user_id = sessionData.user_current_account.User.id;
    let obj: any = {
      videoId: this.VideoInfo.id,
      for: (this.newComment.timeEnabled) ? "synchro_time" : "",
      synchro_time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : '',
      time: (this.newComment.timeEnabled) ? Math.floor(this.currentTimeInSeconds) : 0,
      // TODO // save comment for time
      // end_time: (this.newComment.timeEnabled && this.commentEndTime) ? Math.floor(this.FormatToSeconds(this.commentEndTime.join(":"))) : 0,
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
      obj.editMode = true;
      // obj.time = (this.newComment.timeEnabled) ? Math.floor(this.FormatToSeconds(this.VideoCurrentTime.join(":"))) : 0;
    }

    localStorage.setItem(this.addCommentLSKey, JSON.stringify(obj));
  }

  ngOnDestroy() {
    if (!this.allowToComment()) this.saveCommentToLS();

    this.subscriptions.unsubscribe();
  }

}
