import { Component, OnChanges, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import * as videojs from "video.js";
declare let videojs: any;
// import { CropPlayerService } from "../crop-player.service";
import { trigger, style, animate, transition } from '@angular/animations';
import * as _ from "underscore";
import { MainService, CropPlayerService } from "../../services";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crop-video-player',
  templateUrl: './crop-video-player.component.html',
  styleUrls: ['./crop-video-player.component.css'],
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
export class CropVideoPlayerComponent implements OnChanges, OnDestroy {


    @Input('src') src;
    @Input("VideoInfo") VideoInfo;
    @Output() PlayerReady = new EventEmitter<any>();
    @Output("CropVideoCurrentTime") CropVideoCurrentTime:EventEmitter<any> = new EventEmitter<any>();
    @Output("CropVideoTotalTime") CropVideoTotalTime:EventEmitter<any> = new EventEmitter<any>();
    public player;
    @Input("ShowInfo") ShowInfo;
    @Output() CropShowInfoBack = new EventEmitter<any>();
    @Output() CropIsPlaying: EventEmitter<any> = new EventEmitter<any>();
    @Input() comments;
    @Input() colors;
    @Input() customMarkers;
    public interval1;
    public interval2;
    public header_data;
    public translation: any = {};
    private translationSubscription: Subscription;
    constructor(private mainService:MainService, private cd: ChangeDetectorRef, private playerService:CropPlayerService,private headerService:HeaderService) { 
        this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
    }

    ngOnInit() {

        this.header_data = this.headerService.getStaticHeaderData();
        // this.translation = this.header_data.language_translation; // changed to observable stream

        this.RunSubscribers();
        // this.ShowInfo = false;
        this.PlayerReady.emit(false);
    }

    private RunSubscribers(){

        let that = this;

        this.mainService.CropCommentAddedNotification.subscribe((comment)=>{

            this.AddCue(comment);

        });

        this.mainService.CropReRenderMarkers.subscribe((flag)=>{

            //this.player.markers.removeAll();
            this.AddCues();

        });

        this.mainService.CropDisposePlayer.subscribe((id)=>{


            if(this.player.id_ == id)
            {
                /*console.log("matched");
                this.player.dispose();
                clearInterval(this.interval2);
                clearInterval(this.interval1);*/
            }

        });

        this.playerService.PlayerPlayingState.subscribe((s)=>{
            this.PlayPause(s);
        });

        this.playerService.Seek.subscribe((t)=>{

            this.player.currentTime(t.time);
            if(t.play)
            {
                this.player.play();
            }

        });

        // this.interval1 = setInterval(()=>{ Todo: high check and fix that why we need to run detectChanges in interval

        //     that.cd.detectChanges();

        // }, 100);
    }

    ngOnChanges(change){
        let that = this;
        setTimeout(function()
        {
            if(change.src && change.src.firstChange)
            {
                let videoId = "cropVideo";

                console.log(document.getElementById(videoId).children);

                //setTimeout(()=>{

                if(document.getElementById(videoId).children.length>2) return;

                that.player = videojs(videoId, {
                    controls: true,
                    autoplay: false,
                    preload: false,

                });


                //videojs.plugin("markers", (<any>window).vjsMarkers);

                if(change.src && that.player){
                    that.player.src(change.src.currentValue.path);
                    /*that.player.markers({
                    });*/
                    //that.player.play();
                    that.player.ready(()=>{
                       that.PlayerReady.emit(true);
                    });
                };


                //},100);

            }
        },100);



        // if(change.comments && !change.firstChange && change.comments.currentValue){

        //   // this.player.ready(()=>{

        //   //   // this.AddCues();

        //   // });


        //   }

    }

    public AddCue(comment?){

        // this.player.markers.add([
        //
        //     {
        //         backgroundColor:this.getCueBg(comment),
        //         time: comment.time,
        //         text: comment.comment
        //     }
        //
        // ]);

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
        let that = this;
        let cuesAdded = false;
        let buttons_added = false;
        this.interval2 = setInterval(()=>{
            // that.player;
            if(that.player){

                that.CropVideoCurrentTime.emit(that.player.currentTime());
                that.CropVideoTotalTime.emit(that.player.duration());
                if(that.player.currentTime() > 0 && !cuesAdded){
                    cuesAdded = true;
                    that.AddCues();
                }
                if(!buttons_added)
                {
                    this.player.controlBar.addChild('button', {
                        'el': videojs.createEl('button', {
                            className: 'oi player_bk',
                            'role': 'button'
                        }, { "data-glyph": "media-skip-backward" })
                    }).on('click', function (e) {
                        that.player.currentTime(that.player.currentTime() - 10);
                    });

                    this.player.controlBar.addChild('button', {
                        'el': videojs.createEl('button', {
                            className: 'oi player_fwd',
                            'role': 'button'
                        }, { "data-glyph": "media-skip-forward" })
                    }).on('click', function (e) {
                        that.player.currentTime(that.player.currentTime() + 10);
                    });
                    buttons_added = true;
                }

            }

            else
            {
                that.CropVideoCurrentTime.emit(0);
                that.CropVideoTotalTime.emit(1);
            }
            if(that.player)
            {
                that.CropIsPlaying.emit(!that.player.paused());
            }

        }, 1000);

    }

    public PlayPause(arg){

        let that = this;
        console.log(arg);

        if(arg instanceof Array)
        {
            let stopTime = (((arg[2]+1)-arg[1])*1000);
            console.log(stopTime);
            if(arg[0]=="pause"){
                that.player.pause();
            }else if(arg[0]=="play"){
                that.player.currentTime(arg[1]);
                that.player.play();
                setTimeout(function(){
                    if(!that.player.paused())
                    {
                        console.log("here ");
                        that.player.pause();
                    }
                },stopTime);
            }
        }
        else
        {
            if(arg=="pause"){
                this.player.pause();
            }else if(arg=="play"){
                this.player.play();
            }
        }
        
    }

    ngOnDestroy(){
        this.translationSubscription.unsubscribe();
      }
}
