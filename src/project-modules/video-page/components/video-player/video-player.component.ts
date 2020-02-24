import { Component, Input, Output, EventEmitter, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as _ from "underscore";

import { HeaderService, AppMainService } from "@projectModules/app/services";
import { MainService, PlayerService, VideoPageService } from '@videoPage/services';

declare var videojs: any;
type VideoCommentPlayState = 'on' | 'off';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ]
    )
  ]
})
export class VideoPlayerComponent implements OnDestroy {

  @ViewChild('vidoeTag', { static: true }) vidoeTag: ElementRef;
  @Output() ShowInfoBack = new EventEmitter<any>();
  @Output() IsPlaying: EventEmitter<any> = new EventEmitter<any>();
  @Output("VideoCurrentTime") VideoCurrentTime: EventEmitter<any> = new EventEmitter<any>();
  @Output("videoDuration") videoDuration: EventEmitter<number> = new EventEmitter<number>();
  @Input('fromLiveStream') fromLiveStream: boolean;
  @Input('lsCommentExisted') lsCommentExisted;
  @Input('src') src;
  @Input("VideoInfo") VideoInfo;
  @Input("ShowInfo") ShowInfo;
  @Input() comments;
  @Input() colors;
  @Input() customMarkers;
  @Input() params;
  @Input() isLive;

  public player;
  private fullScreenActive: boolean = false;
  public header_data: any;
  private userCurrentAccount: any;
  public translation: any = {};
  private subscription: Subscription;

  private mediaForwardEventChange$ = new Subject<string>();
  private mediaBackwardEventChange$ = new Subject<string>();
  private mediaForwardButton: any;
  private mediaBackwardButton: any;
  private mediaForwardButtonTooltip: any;
  private mediaBackwardButtonTooltip: any;
  private fastForwardStarted: boolean = false;
  private fastBackwardStarted: boolean = false;
  private playBackRateBeforeFastForward: number = 1;
  private previousVideoCurrentTime: number;

  public videoCommentPlayState: VideoCommentPlayState = 'off';
  public videoCommentPlayTimeSlots: any = [];
  public videoCommentPlayIteration: number = 0;
  public videoCommentPlayOn: boolean = false;
  public startTime: any;
  public endTime: any;
  public isPlaying: boolean = false;
  public backward_interval: any = false;

  intervalArray: any = [];

  constructor(
    private videoPageService: VideoPageService, private appMainService: AppMainService, private headerService: HeaderService,
    private mainService: MainService, private playerService: PlayerService) {

    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => this.translation = languageTranslation);

    this.initiateFastForwardListener();
    this.initiateFastBackwardListener();
    this.initiateVideoCommentAutoplayListener();
    this.initiatePlayerListener();
  }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    this.userCurrentAccount = this.header_data.user_current_account;
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  ngAfterViewInit() {
    const obj = {
      video_id: this.params.video_id,
      huddle_id: this.params.huddle_id,
      account_id: this.userCurrentAccount.accounts.account_id,
      user_id: this.userCurrentAccount.User.id
    }

    let videoT = this.vidoeTag.nativeElement;
    this.player = videojs(videoT, {
      controls: true,
      autoplay: false,
      preload: false,
      fullscreenToggle: true,
      playbackRates: (!this.fromLiveStream) ? [0.5, 1, 1.25, 1.5, 2, 5] : []
    });
    this.player.on('loadedmetadata', () => this.videoDuration.emit(videoT.duration));
    this.player.on('fullscreenchange', () => this.toggleFullScreen());
    videojs.plugin("markers", (<any>window).vjsMarkers);

    this.addForwardAndBackwardControlInPlayer();

    this.player.src(this.src.path);
    this.player.type = this.src.type;

    this.player.markers({
    });
    if (!this.lsCommentExisted) {
      this.mainService.updateViewCount(obj).subscribe();
      this.player.play();

    }

    let cuesAdded = false;
    let time = 0;
    let end_recorded = false;

    /** TODO: Will remove this setInterval code section and use videojs event emitters */
    this.intervalArray[0] = setInterval(() => {
      if (!this.player.paused() && this.player.currentTime() > 0) {
        time++;
        if (time % 5 == 0 && this.params) {
          const obj = {
            user_id: this.userCurrentAccount.User.id, document_id: this.params.video_id, minutes_watched: time
          };

          this.appMainService.LogViewerHistory(obj).subscribe();
        }
      }

    }, 1100);

    this.intervalArray[1] = setInterval(() => {
      // that.player;
      if (this.player) {
        this.player.on("play", () => {
          this.lsCommentExisted = false;
        });

        this.player.on("ended", () => {
          if (!end_recorded && time % 5 != 0) {
            end_recorded = true;
            const obj = {
              user_id: this.userCurrentAccount.User.id, document_id: this.params.video_id, minutes_watched: time
            };

            this.appMainService.LogViewerHistory(obj).subscribe();
          }
        })

        if (this.player.currentTime() > 0 && !cuesAdded) {
          cuesAdded = true;
          this.AddCues();
        }
      }

      this.IsPlaying.emit(!this.player.paused());

    }, 100);

    let play_button: any = document.getElementsByClassName("vjs-big-play-button");
    play_button[0].onclick = () => {
      this.mainService.updateViewCount(obj).subscribe();
    }
    this.commentTimeSpanPlay();
    this.handleVideoCommentPlay();

  }

  /**
   * Adding forward and backward controls in player and initializing the listerner for these buttons events
   */
  private addForwardAndBackwardControlInPlayer() {
    let playerBkClasses = 'oi player_bk';
    let playerFwdClasses = 'oi player_fwd';

    if (this.fromLiveStream) {
      playerBkClasses = 'fake-player-btn player_bk';
      playerFwdClasses = 'fake-player-btn player_fwd';
    }

    this.mediaBackwardButton = this.player.controlBar.addChild('button', {
      'el': videojs.createEl('button', {
        className: playerBkClasses,
        'role': 'button'
      }, { "data-glyph": "media-skip-backward" })
    });

    if (!this.fromLiveStream) {
      this.mediaBackwardButton.on('mouseup', (event) => this.mediaBackwardEventChange$.next(event.type));
      this.mediaBackwardButton.on('mousedown', (event) => this.mediaBackwardEventChange$.next(event.type));
      this.mediaBackwardButton.on('mouseleave', (event) => this.mediaBackwardEventChange$.next(event.type));
      this.mediaBackwardButton.on('mouseenter', (event) => this.mediaBackwardEventChange$.next(event.type));

      this.mediaBackwardButtonTooltip = this.player.controlBar.addChild('button', {
        'el': videojs.createEl('span', {
          className: 'media-backward-button-tooltip hide-media-backward-button-tooltip',
        }, {}, this.translation.click_and_hold_fast_backward)
      });
    }

    this.mediaForwardButton = this.player.controlBar.addChild('button', {
      'el': videojs.createEl('button', {
        className: playerFwdClasses,
        'role': 'button'
      }, { "data-glyph": "media-skip-forward" })
    });

    if (!this.fromLiveStream) {
      this.mediaForwardButton.on('mouseup', (event) => this.mediaForwardEventChange$.next(event.type));
      this.mediaForwardButton.on('mousedown', (event) => this.mediaForwardEventChange$.next(event.type));
      this.mediaForwardButton.on('mouseleave', (event) => this.mediaForwardEventChange$.next(event.type));
      this.mediaForwardButton.on('mouseenter', (event) => this.mediaForwardEventChange$.next(event.type));

      this.mediaForwardButtonTooltip = this.player.controlBar.addChild('button', {
        'el': videojs.createEl('span', {
          className: 'media-forward-button-tooltip hide-media-forward-button-tooltip',
        }, {}, this.translation.click_and_hold_fast_forward)
      });
    }
  }

  public AddCue(comment?) {
    if (comment.comment.indexOf("https://") > -1) {
      this.player.markers.add([{
        backgroundColor: this.getCueBg(comment),
        time: comment.time,
        text: 'Audio Comment'
      }]);
    } else {
      this.player.markers.add([{
        backgroundColor: this.getCueBg(comment),
        time: comment.time,
        text: comment.comment
      }]);
    }
  }

  private AddCues() {
    this.comments.forEach((c) => this.AddCue(c));
  }

  public getCueBg(comment) {
    if (comment.default_tags.length > 0) {
      let ret = "rgb(118, 0, 0)";
      comment.default_tags.forEach((dt) => {
        if (dt) {
          let index = _.findIndex(this.customMarkers, { account_tag_id: dt.account_tag_id });
          if (index > -1) ret = this.colors[index];
        }
      });
      return ret;
    } else {
      return "rgb(118, 0, 0)";
    }
  }

  public PlayPause(arg) {
    if (!this.player) {
      setTimeout(() => {
        if (arg == "pause") {
          this.player.pause();
        } else if (arg == "play") {
          this.player.play();
        }
      }, 1000);

    } else {
      if (arg == "pause") {
        this.player.pause();
      } else if (arg == "play") {
        this.player.play();
      }
    }

  }

  /** Comment auto play functionality starts */
  private disableVideoCommentPlay() {
    this.videoCommentPlayState = 'off';
    this.videoCommentPlayOn = false;
    this.videoCommentPlayIteration = 0;
    this.playerService.toggleVideoCommentPlay({ state: this.videoCommentPlayState });
  }

  private handleVideoCommentPlay() {
    this.player.on('timeupdate', (playerInstance: any) => {

      this.emitVideoCurrentTime(this.player.currentTime());

      if (!this.lsCommentExisted) this.VideoCurrentTime.emit(this.player.currentTime());

      if (this.videoCommentPlayState === 'on' && this.videoCommentPlayTimeSlots.length > 0) {
        if (!playerInstance.manuallyTriggered) {
          let currentTimeSlot = this.videoCommentPlayTimeSlots[this.videoCommentPlayIteration];

          if (!this.videoCommentPlayOn) {
            this.videoCommentPlayOn = true;
            this.player.currentTime(currentTimeSlot.start);
          }

          if (Math.floor(this.player.currentTime()) >= currentTimeSlot.end) {
            if (this.videoCommentPlayTimeSlots.length > (this.videoCommentPlayIteration + 1)) {
              this.videoCommentPlayIteration++;
              this.videoCommentPlayOn = false;
            } else {
              this.player.pause();
              this.disableVideoCommentPlay();
            }
          }

        } else {
          let currentSeekTime = Math.floor(playerInstance.target.player_.cache_.currentTime);
          let foundSlot = 0;
          for (let i = (this.videoCommentPlayTimeSlots.length - 1); i >= 0; i--) {
            if (currentSeekTime >= this.videoCommentPlayTimeSlots[i].start) {
              foundSlot = i;
              break;
            }
          }
          this.videoCommentPlayIteration = foundSlot;
          this.videoCommentPlayOn = false;
        }
      }

    });

  }
  /** Comment auto play functionality end */
  private commentTimeSpanPlay() {
    this.player.on('timeupdate', () => {
      if (this.isPlaying && this.endTime != null) {
        if (Math.floor(this.player.currentTime()) >= this.endTime) {
          this.player.pause();
          this.isPlaying = false;
        }
      }
    });

  }

  /** New code to emit video current time start */
  private emitVideoCurrentTime(videoCurrentTime: number) {
    videoCurrentTime = Math.floor(videoCurrentTime);
    if (!this.previousVideoCurrentTime) {
      this.previousVideoCurrentTime = videoCurrentTime;
      this.videoPageService.updateVideoCurrentTime(videoCurrentTime);
    } else if (videoCurrentTime !== this.previousVideoCurrentTime) {
      this.previousVideoCurrentTime = videoCurrentTime;
      this.videoPageService.updateVideoCurrentTime(videoCurrentTime);
    }
  }
  /** New code to emit video current time end */


  /**
   * Fast forward functionality 
   * and hide/show tooltip for fast forward based on mouse events 
   */
  private initiateFastForwardListener() {
    this.mediaForwardEventChange$.pipe(debounceTime(200)).subscribe((eventType: string) => {
      if (!this.fastForwardStarted && eventType === 'mouseenter') {
        this.mediaForwardButtonTooltip.removeClass('hide-media-forward-button-tooltip');
      } else if (!this.fastForwardStarted && eventType === 'mouseleave') {
        this.mediaForwardButtonTooltip.addClass('hide-media-forward-button-tooltip');
      } else if (!this.fastForwardStarted && eventType === 'mousedown') {
        this.playBackRateBeforeFastForward = this.player.playbackRate();
        this.player.playbackRate(this.playBackRateBeforeFastForward * 2);
        this.mediaForwardButton.addClass('btn-large');
        this.mediaForwardButtonTooltip.addClass('hide-media-forward-button-tooltip');
        this.fastForwardStarted = true;
      } else if (this.fastForwardStarted && (eventType === 'mouseup' || this.fastForwardStarted && eventType === 'mouseleave')) {
        this.player.playbackRate(this.playBackRateBeforeFastForward);
        this.mediaForwardButton.removeClass('btn-large');
        this.fastForwardStarted = false;
      }
    });
  }

  /**
   * Fast backward functionality 
   * and hide/show tooltip for fast backward based on mouse events 
   */
  private initiateFastBackwardListener() {
    this.mediaBackwardEventChange$.pipe(debounceTime(200)).subscribe((eventType: string) => {
      if (!this.fastBackwardStarted && eventType === 'mouseenter') {
        this.mediaBackwardButtonTooltip.removeClass('hide-media-backward-button-tooltip');
      } else if (!this.fastBackwardStarted && eventType === 'mouseleave') {
        this.mediaBackwardButtonTooltip.addClass('hide-media-backward-button-tooltip');
      } else if (!this.fastBackwardStarted && eventType === 'mousedown') {
        let time_backward = 575;
        if (this.player.playbackRate() == 1) {
          time_backward = 500;
        } else if (this.player.playbackRate() == 1.25) {
          time_backward = 425;
        } else if (this.player.playbackRate() == 1.5) {
          time_backward = 350;
        } else if (this.player.playbackRate() == 2) {
          time_backward = 275;
        } else if (this.player.playbackRate() == 5) {
          time_backward = 200;
        }

        if (!this.player.paused()) this.player.pause();

        this.backward_interval = setInterval(() => {
          this.player.currentTime(this.player.currentTime() - 1);
        }, time_backward);

        this.mediaBackwardButton.addClass('btn-large');
        this.mediaBackwardButtonTooltip.addClass('hide-media-backward-button-tooltip');
        this.fastBackwardStarted = true;

      } else if (this.fastBackwardStarted && (eventType === 'mouseup' || this.fastBackwardStarted && eventType === 'mouseleave')) {
        if (this.backward_interval) {
          clearInterval(this.backward_interval);
          this.player.play();
        }
        this.mediaBackwardButton.removeClass('btn-large');
        this.fastBackwardStarted = false;
      }
    });
  }

  private initiateVideoCommentAutoplayListener() {
    this.playerService.videoCommentPlay$.subscribe(data => {
      this.videoCommentPlayState = data.state;
      this.videoCommentPlayTimeSlots = data.timeSlots;
      if (this.videoCommentPlayState === 'off') {
        this.videoCommentPlayOn = false;
        this.videoCommentPlayIteration = 0;
      }
    });
  }

  private initiatePlayerListener() {

    this.playerService.PlayerPlayingState.subscribe((s) => this.PlayPause(s));
    this.mainService.CommentAddedNotification.subscribe((comment) => this.AddCue(comment));

    this.mainService.ReRenderMarkers.subscribe(() => {
      this.player.markers.removeAll();
      this.AddCues();
    });

    this.playerService.Seek.subscribe((comment) => {
      this.isPlaying = true;
      this.startTime = comment.time;
      this.endTime = comment.end_time;
      if (this.videoCommentPlayState === 'on') this.disableVideoCommentPlay();
      this.player.currentTime(this.startTime);
      this.player.play();
    });
  }

  private toggleFullScreen() {
    this.fullScreenActive = !this.fullScreenActive;

    if (this.fullScreenActive) {
      this.mediaBackwardButton.addClass('bk_full');
      this.mediaForwardButton.addClass('fw_full');
      this.player.controlBar.playToggle.addClass('play_adjusted');
    } else {
      this.mediaBackwardButton.removeClass('bk_full');
      this.mediaForwardButton.removeClass('fw_full');
      this.player.controlBar.playToggle.removeClass('play_adjusted');
    }
  }

  ngOnDestroy() {
    this.player.pause();
    this.player.dispose();
    this.intervalArray.forEach(element => {
      clearInterval(element);

    });
    this.subscription.unsubscribe();
  }
}
