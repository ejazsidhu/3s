import { Component, OnChanges, Input, Output, EventEmitter, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild } from '@angular/core';
// import * as videojs from "video.js";
// declare let videojs;
declare var videojs: any;
type VideoCommentPlayState = 'on' | 'off'; 
import { trigger, style, animate, transition } from '@angular/animations';
import * as _ from "underscore";

import { HeaderService, AppMainService } from "@projectModules/app/services";
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MainService } from '../../services/main.service';
import { PlayerService } from '../../services/player.service';
import { environment } from '@src/environments/environment';
import { HttpClient } from "@angular/common/http";

// import { MainService, PlayerService } from '@videoDetail/services';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateY(100%)', opacity: 0}))
        ])
      ]
    )
  ]
})
export class VideoPlayerComponent implements OnDestroy, OnChanges {

  private mediaForwardEventChange$ = new Subject<string>();
  private mediaBackwardEventChange$ = new Subject<string>();
  private mediaForwardButton: any;
  private mediaBackwardButton: any;
  private mediaForwardButtonTooltip: any;
  private mediaBackwardButtonTooltip: any;
  private fastForwardStarted: boolean = false;
  private fastBackwardStarted: boolean = false;
  private playBackRateBeforeFastForward: number = 1;

@Input('fromLiveStream') fromLiveStream: boolean;
@Input('lsCommentExisted') lsCommentExisted;
@Input('src') src;
@Input("VideoInfo") VideoInfo;
@Output("VideoCurrentTime") VideoCurrentTime:EventEmitter<any> = new EventEmitter<any>();
@Output("videoDuration") videoDuration:EventEmitter<number> = new EventEmitter<number>();
public player;
public header_data;
public translation: any = {};
private subscription: Subscription;
@Input("ShowInfo") ShowInfo;
@Output() ShowInfoBack = new EventEmitter<any>();
@Output() IsPlaying: EventEmitter<any> = new EventEmitter<any>();
@Input() comments;
@Input() colors;
@Input() customMarkers;
@Input() params;

public videoCommentPlayState: VideoCommentPlayState = 'off';
public videoCommentPlayTimeSlots: any = [];
public videoCommentPlayIteration: number = 0;
public videoCommentPlayOn: boolean = false;
public startTime:any;
public endTime:any;
public isPlaying: boolean= false;
public backward_interval: any = false;

@Input() isLive;
@ViewChild('vidoeTag',{static:true}) vidoeTag:ElementRef;
intervalArray: any=[];

  constructor(private appMainService:AppMainService,private headerService:HeaderService, private mainService:MainService,
     private cd: ChangeDetectorRef, private playerService:PlayerService,private http: HttpClient) { 
      this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
    });

    this.mediaForwardEventChange$.pipe(debounceTime(200)).subscribe((eventType: string) => {
      if (!this.fastForwardStarted && eventType === 'mouseenter') {
        this.mediaForwardButtonTooltip.removeClass('hide-media-forward-button-tooltip');
      } else if(!this.fastForwardStarted && eventType === 'mouseleave') {
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

    this.mediaBackwardEventChange$.pipe(debounceTime(200)).subscribe((eventType: string) => {
      if (!this.fastBackwardStarted && eventType === 'mouseenter') {
        this.mediaBackwardButtonTooltip.removeClass('hide-media-backward-button-tooltip');
      } else if(!this.fastBackwardStarted && eventType === 'mouseleave'){
        this.mediaBackwardButtonTooltip.addClass('hide-media-backward-button-tooltip');
      } else if (!this.fastBackwardStarted && eventType === 'mousedown') {
        let time_backward = 575;
        if(this.player.playbackRate() == 1) {
            time_backward = 500;
        }else if(this.player.playbackRate() == 1.25) {
            time_backward = 425;
        }else if(this.player.playbackRate() == 1.5) {
            time_backward = 350;
        }else if(this.player.playbackRate() == 2) {
            time_backward = 275;
        }else if(this.player.playbackRate() == 5) {
            time_backward = 200;
        }

        if(!this.player.paused()) this.player.pause();

        this.backward_interval = setInterval(() => {
          this.player.currentTime(this.player.currentTime() - 1);
        },time_backward);

        this.mediaBackwardButton.addClass('btn-large');
        this.mediaBackwardButtonTooltip.addClass('hide-media-backward-button-tooltip');
        this.fastBackwardStarted = true;
        
      } else if (this.fastBackwardStarted && (eventType === 'mouseup' || this.fastBackwardStarted && eventType === 'mouseleave')) {
        if(this.backward_interval) {
          clearInterval(this.backward_interval);
          this.player.play();
        }
        this.mediaBackwardButton.removeClass('btn-large');
        this.fastBackwardStarted = false;
      }
    });

    this.playerService.videoCommentPlay$.subscribe(data => {
      this.videoCommentPlayState = data.state;
      this.videoCommentPlayTimeSlots = data.timeSlots;
      if(this.videoCommentPlayState === 'off') {
        this.videoCommentPlayOn = false;
        this.videoCommentPlayIteration = 0;
      }
    });
  }

  ngOnInit() {

    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  	this.RunSubscribers();
    // this.ShowInfo = false;
  }

  private RunSubscribers(){

    let that = this;

    this.mainService.CommentAddedNotification.subscribe((comment)=>{

      this.AddCue(comment);

    });

    this.mainService.ReRenderMarkers.subscribe((flag)=>{
      
      this.player.markers.removeAll();
      this.AddCues();

    });

  	this.playerService.PlayerPlayingState.subscribe((s)=>{

  		this.PlayPause(s);

  	});

    this.playerService.Seek.subscribe((comment)=>{
      this.isPlaying =true;
      this.startTime=comment.time;
      this.endTime=comment.end_time;
      if(this.videoCommentPlayState === 'on') this.disableVideoCommentPlay();
      this.player.currentTime(this.startTime);
      this.player.play();
      
    });

  }

  ngOnChanges(change){
    videojs.plugin("markers", (<any>window).vjsMarkers);

  	if(change.src && change.src.firstChange){
  		if(document.getElementById("mainVideo").children.length>2) return;
  		let that = this;
  		setTimeout(()=>{

        if(document.getElementById("mainVideo").children.length>2) return;
        
	  		that.player = videojs("mainVideo", {
			  controls: true,
			  autoplay: false,
			  preload: false,
        fullscreenToggle: true,
        
			});


       videojs.plugin("markers", (<any>window).vjsMarkers);

        let player = videojs('mainVideo');
       
      player.controlBar.addChild('button', {
        'el':videojs.createEl('button', { className:  'oi player_bk',
              'role': 'button'}, {"data-glyph":"media-skip-backward"})
        }).on('click', function(e) {
          player.currentTime(player.currentTime()-10);
        });

      player.controlBar.addChild('button', {
        'el':videojs.createEl('button', { className:  'oi player_fwd',
              'role': 'button'}, {"data-glyph":"media-skip-forward"})
        }).on('click', () => {
          player.currentTime(player.currentTime()+10);
        });


      // setInterval(()=>{ // this logic has been moved to ngAfterViewInit

      //   let player = videojs('mainVideo');

      //   if(player.isFullscreen()){

      //     document.getElementsByClassName("player_bk")[0].classList.add("bk_full");
      //     document.getElementsByClassName("player_fwd")[0].classList.add("fw_full");
      //     document.getElementsByClassName("vjs-play-control")[0].classList.add("play_adjusted");

      //   }else{
      //     document.getElementsByClassName("player_bk")[0].classList.remove("bk_full");
      //     document.getElementsByClassName("player_fwd")[0].classList.remove("fw_full");
      //     document.getElementsByClassName("vjs-play-control")[0].classList.remove("play_adjusted");
      //   }

      // }, 1000);

      // <span class="oi" data-glyph="media-skip-forward"></span>

       if(change.src && change.src.currentValue && that.player){
      that.player.src(change.src.currentValue.path);
      that.player.type = change.src.currentValue.type;
      that.player.markers({
      });
      that.player.play();
    };


  		},300);
  		
  	}

    if(change.src && change.src.currentValue && this.player){
      this.player.src(change.src.currentValue.path);
      this.player.type = change.src.currentValue.type ;
      this.player.markers({
      });
      this.player.play();
    };
    

    // if(change.comments && !change.firstChange && change.comments.currentValue){

    //   // this.player.ready(()=>{

    //   //   // this.AddCues();

    //   // });

      
    //   }

  }

  public AddCue(comment?){
    if(comment.comment.indexOf("https://")>-1){
    this.player.markers.add([

      {
      backgroundColor:this.getCueBg(comment),
      time: comment.time,
      text: 'Audio Comment'
      }

      ]);
    }
    else{
      this.player.markers.add([

        {
          backgroundColor: this.getCueBg(comment),
          time: comment.time,
          text: comment.comment
        }
  
      ]);
    }
   

  }

  private AddCues(){

    let that = this;

    that.comments.forEach((c)=>{

         that.AddCue(c);

       });

     // setTimeout(()=>{

     //   that.comments.forEach((c)=>{

     //     that.AddCue(c);

     //   });

     // }, 5000);

  }

  public getCueBg(comment){

    if(comment.default_tags.length>0){

       let ret = "rgb(118, 0, 0)";

       comment.default_tags.forEach((dt)=>{

        if(dt){
          let index = _.findIndex(this.customMarkers, {account_tag_id:dt.account_tag_id});

         if(index>-1) {
           ret = this.colors[index];
         }
        }
         

       });

       return ret;

    }else{
      return "rgb(118, 0, 0)";
    }

  }

  ngAfterViewInit(){
   // new way to play video

   let sessionData: any = this.headerService.getStaticHeaderData();
   let user_id = sessionData.user_current_account.User.id;
   let document_id = this.params.video_id;
   let huddle_id = this.params.huddle_id;
   let account_id = sessionData.user_current_account.accounts.account_id;
   let obj = {

     video_id: document_id,
     huddle_id: huddle_id,
     account_id: account_id,
     user_id: user_id

   }

   var videoT = this.vidoeTag.nativeElement;
   videoT.addEventListener('loadedmetadata',  () => this.videoDuration.emit(videoT.duration));
   this.player = videojs(videoT, {
     controls: true,
     autoplay: false,
     preload: false,
     fullscreenToggle: true,
     playbackRates: (!this.fromLiveStream) ? [0.5, 1, 1.25, 1.5, 2, 5] : []
   });
   videojs.plugin("markers", (<any>window).vjsMarkers);
   //  this.player = videojs(videoT);
    let that = this;
    
  let playerBkClasses = 'oi player_bk';
  let playerFwdClasses = 'oi player_fwd';

  if(this.fromLiveStream) {
    playerBkClasses = 'fake-player-btn player_bk';
    playerFwdClasses = 'fake-player-btn player_fwd';
  }
    
  this.mediaBackwardButton = this.player.controlBar.addChild('button', {
    'el': videojs.createEl('button', {
      className: playerBkClasses,
      'role': 'button'
    }, { "data-glyph": "media-skip-backward" })
  });

  if(!this.fromLiveStream) {
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
  
  if(!this.fromLiveStream) {
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

   this.player.src(this.src.path);
   this.player.type=this.src.type;
   
   this.player.markers({
   });
   if(!this.lsCommentExisted) {
    this.update_view_count(obj).subscribe((data: any) => {
  
        
    }); 
    this.player.play();
  
  }
   // new way to play video end


    let cuesAdded = false;
    let time = 0;
    let end_recorded = false;

    this.intervalArray[0]=setInterval(()=>{

      if(!this.player.paused() && this.player.currentTime() > 0){

         time++;
        //  console.log('that.player: ',that.player);
         
        // console.log('this.player: ',this.player); 

         if(time % 5 == 0 && this.params){
          // this.playerService.ModifyPlayingState("pause");
           let sessionData:any = this.headerService.getStaticHeaderData();
           let user_id = sessionData.user_current_account.User.id;
           let document_id = this.params.video_id;

           this.appMainService.LogViewerHistory({user_id: user_id, document_id: document_id, minutes_watched: time}).subscribe();


         }

       }

    }, 1100);

  	this.intervalArray[1]=setInterval(()=>{

  		// that.player;
      if(that.player){

        this.player.on("play", () => {
          this.lsCommentExisted = false;
        });

        
        this.player.on("ended", ()=>{
          if(!end_recorded && time % 5 != 0){

            end_recorded = true;
            

          // this.playerService.ModifyPlayingState("pause");
           let sessionData:any = this.headerService.getStaticHeaderData();
           let user_id = sessionData.user_current_account.User.id;
           let document_id = this.params.video_id;

           this.appMainService.LogViewerHistory({user_id: user_id, document_id: document_id, minutes_watched: time}).subscribe();


         
        }
        })

        // if(!this.lsCommentExisted) that.VideoCurrentTime.emit(that.player.currentTime());
       if(that.player.currentTime() > 0 && !cuesAdded){
         cuesAdded = true;
         that.AddCues();
       }

      }

      else {
        // if(!this.lsCommentExisted) that.VideoCurrentTime.emit(0);
      }

      that.IsPlaying.emit(!that.player.paused());

    }, 100);
    this.intervalArray[2]=setInterval(()=>{ // Todo: high check and fix that why we need to run this in interval

        let player = videojs('mainVideo');

        if(player.isFullscreen()){

          if(document.getElementsByClassName("player_bk")[0]) document.getElementsByClassName("player_bk")[0].classList.add("bk_full");
          if(document.getElementsByClassName("player_fwd")[0]) document.getElementsByClassName("player_fwd")[0].classList.add("fw_full");
          if(document.getElementsByClassName("vjs-play-control")[0]) document.getElementsByClassName("vjs-play-control")[0].classList.add("play_adjusted");

        }else{
          if(document.getElementsByClassName("player_bk")[0]) document.getElementsByClassName("player_bk")[0].classList.remove("bk_full");
          if(document.getElementsByClassName("player_fwd")[0]) document.getElementsByClassName("player_fwd")[0].classList.remove("fw_full");
          if(document.getElementsByClassName("vjs-play-control")[0]) document.getElementsByClassName("vjs-play-control")[0].classList.remove("play_adjusted");
        }

      }, 1000);

    let play_button:any =  document.getElementsByClassName("vjs-big-play-button");
      play_button[0].onclick = ()=>{
        this.update_view_count(obj).subscribe((data: any) => {

      
        });
    }
    this.commentTimeSpanPlay();
    this.handleVideoCommentPlay();

  }

  public update_view_count(obj){
  	
  	let path = environment.APIbaseUrl+"/update_view_count";

  	return this.http.post(path, obj);

  }

  public seek(where, elementRef:ElementRef){


  }

public PlayPause(arg){

    if(!this.player)
      setTimeout(()=>{
      if(arg=="pause"){
            this.player.pause();
          }else if(arg=="play"){
            this.player.play();
      }
      }, 1000);

    else{
      if(arg=="pause"){
            this.player.pause();
          }else if(arg=="play"){
            this.player.play();
      }
    }

  }

  /** Comment auto play functionality starts */
  private disableVideoCommentPlay() {
    this.videoCommentPlayState = 'off';
    this.videoCommentPlayOn = false;
    this.videoCommentPlayIteration = 0;
    this.playerService.toggleVideoCommentPlay({state: this.videoCommentPlayState});
  }
  
  private handleVideoCommentPlay() {
    this.player.on('timeupdate', (playerInstance: any) => {

      if(!this.lsCommentExisted) this.VideoCurrentTime.emit(this.player.currentTime());
      
      if(this.videoCommentPlayState === 'on' && this.videoCommentPlayTimeSlots.length > 0) { 
        if(!playerInstance.manuallyTriggered) {
          let currentTimeSlot = this.videoCommentPlayTimeSlots[this.videoCommentPlayIteration];
  
          if(!this.videoCommentPlayOn) {
            this.videoCommentPlayOn = true;
            this.player.currentTime(currentTimeSlot.start); 
          }
  
          if(Math.floor(this.player.currentTime()) >= currentTimeSlot.end) {
            if(this.videoCommentPlayTimeSlots.length > (this.videoCommentPlayIteration + 1)) {
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
        for(let i = (this.videoCommentPlayTimeSlots.length - 1); i >= 0; i--) {
            if(currentSeekTime >= this.videoCommentPlayTimeSlots[i].start) {
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
      if(this.isPlaying && this.endTime!=null){
        if(Math.floor(this.player.currentTime()) >= this.endTime) {
            this.player.pause();
            this.isPlaying=false;
          }
      }
    });
    
  }

  ngOnDestroy(){
    this.player.pause();
    this.player.dispose();
    this.intervalArray.forEach(element => {
      clearInterval(element);
      
    });
    // console.clear()
    this.subscription.unsubscribe();
  }

}
