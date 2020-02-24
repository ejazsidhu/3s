import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Renderer2, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import * as PolyfillMediaRecorder from 'audio-recorder-polyfill';

import { HeaderService } from "@projectModules/app/services";
import { FilestackService } from "@projectModules/angular-audio-recorder/services";

declare var window: any;
declare var opr: any;
declare var InstallTrigger: any;
declare var document: any;
declare var safari: any;
declare var MediaRecorder: any;
declare var navigator: any;

type AudioRecorderState = 'prompt' | 'granted' | 'denied';
type RecordingState = 'comfortZone' | 'recording' | 'resume' | 'uploading' | 'play';
type AudioPath = { filePath: string, audioUrl: string, autoSubmitComment: string, audioDuration: number };
type BrowserType = 'opera' | 'firefox' | 'safari' | 'internetExplorer' | 'edge' | 'chrome' | 'edgeChromium';

@Component({
  selector: "audio-recorder-play",
  templateUrl: "./audio-recorder-play.component.html",
  styleUrls: ["./audio-recorder-play.component.css"]
})
export class AudioRecorderPlayComponent implements OnInit, OnChanges, OnDestroy {

  @Input() localAudioData;
  @Input() autoSaveAudio;
  @Output() currentState = new EventEmitter<RecordingState>();
  @Output() audioPath = new EventEmitter<AudioPath>();
  @ViewChild('audioPlayerContainer', { static: false }) audioPlayerContainer: ElementRef;

  public browserName: BrowserType;
  public recordingState: RecordingState = 'comfortZone';
  public audioRecorderState: AudioRecorderState;
  public seconds: number = 0;
  private stop$ = new Subject();
  private mediaRecorder: any;
  private stream: any;
  private audioChunks: any = [];
  private audioBlob: Blob;
  public audioUrl: string = '';
  private audioBaseUrl: string = 'https://s3.amazonaws.com/sibme-production/';
  public uploadingAudio: boolean = false;
  private isInitializedMediaRecorder: boolean = false;
  public browserSupportAudioRecording: boolean;
  private permissionGranted: boolean = false;
  public autoSubmitComment: string;
  public recordAudioTooltip: string;
  public resumeAudioTooltip: string;
  public translations: any;
  private subscription: Subscription;

  constructor(private headerService: HeaderService, private filestackService: FilestackService, private renderer: Renderer2) {
    this.subscription = this.headerService.languageTranslation$.subscribe(translations => {
      this.translations = translations;
      if(this.translations.hold_to_record_audio) this.recordAudioTooltip = this.translations.hold_to_record_audio;
      if(this.translations.hold_to_resume_audio) this.resumeAudioTooltip = this.translations.hold_to_resume_audio;
    });
    this.headerService.tabrecordIcon$.subscribe(data => this.hideTabRecordingicon(data));
  }

  ngOnInit() {
    this.detectBrowser();

    // if(this.browserName && this.browserName === 'chrome') this.checkAudioRecorderState();

    this.currentState.emit(this.recordingState);
  }

  ngOnChanges(change) {
    if (change.autoSaveAudio && (change.autoSaveAudio.currentValue == "add" || change.autoSaveAudio.currentValue == "edit")) {
      this.stopAndUploadAudio(change.autoSaveAudio.currentValue);
    }
    else {
      if (change.localAudioData && change.localAudioData.currentValue.localAudio) {
        this.recordingState = change.localAudioData.currentValue.recordingState;
        setTimeout(() => this.createAudioDomEl(change.localAudioData.currentValue.audioUrl), 1000)
      } else {
        this.cancel();
      }
    }
  }

  public hold(event: string) {
    console.log('event: ', event);
    if (event === 'started') {
      this.recordAudioTooltip = this.translations.audio_is_being_recording;
      this.resumeAudioTooltip = this.translations.audio_is_being_recording;

      console.log('this.recordAudioTooltip: ', this.recordAudioTooltip)
      console.log('this.this.resumeAudioTooltip: ', this.resumeAudioTooltip)

      this.permissionGranted = true;

      if (this.isInitializedMediaRecorder) this.startRecording();
      else if (this.audioRecorderState === 'denied') alert(this.translations.allow_use_of_microphone);
      else this.initializeAudioRecorder(this.audioRecorderState);

    } else if (event === 'stopped') {
      this.recordAudioTooltip = this.translations.hold_to_record_audio;
      this.resumeAudioTooltip = this.translations.hold_to_resume_audio;

      if (!this.mediaRecorder) this.permissionGranted = false;
      if (this.isInitializedMediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
        this.stop$.next();
        if (this.mediaRecorder) {
          this.mediaRecorder.pause();

        }
        if (this.recordingState === 'recording') this.recordingState = 'resume';
        this.currentState.emit(this.recordingState);
      }

    }
  }

  private startRecording() {
    if (this.isInitializedMediaRecorder && this.permissionGranted) {

      if (this.recordingState === 'resume') this.mediaRecorder.resume();
      else this.mediaRecorder.start();

      if (this.recordingState === 'comfortZone') this.recordingState = 'recording';

      this.currentState.emit(this.recordingState);

      const ms = 1000;
      interval(ms).pipe(
        takeUntil(this.stop$),
        tap(() => {
          this.seconds++;
        })).subscribe();
    }
  }

  private initializeAudioRecorder(audioRecorderState: string) {

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.isInitializedMediaRecorder = true;

      /**
       *  Because mediaDevices does not return any promise if permission is not granted. 
       *  So I manually set to granted and will change this code when all browsers will fully implement permission API of navigator
       */
      if (!audioRecorderState) this.audioRecorderState === 'granted';

      this.mediaRecorder.addEventListener("dataavailable", event => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener("stop", () => {

        console.log('in stop audioChunks: ', this.audioChunks);
        console.log('this.mediaRecorder.mimeType: ', this.mediaRecorder.mimeType);

        this.audioBlob = new Blob(this.audioChunks);
        const audioExtension: string = this.getExtensionOfMediaRecorder(this.audioChunks[0]['type']);
        console.log(' this.audioBlob: ', this.audioBlob);
        console.log('audioExtension: ', audioExtension);

        const sessionData: any = this.headerService.getStaticHeaderData();
        const accountId = sessionData.user_current_account.accounts.account_id;
        const userId = sessionData.user_current_account.User.id;
        this.filestackService.uploadToS3(this.audioBlob, audioExtension, accountId, userId).then(res => {
          this.audioUrl = `${this.audioBaseUrl}${res.key}`;
          console.log('this.audioUrl: ', this.audioUrl)
          // this.audioUrl = res.url;

          this.createAudioDomEl(this.audioUrl);

          this.recordingState = 'play';
          this.uploadingAudio = false;

          this.currentState.emit(this.recordingState);
          this.audioPath.emit({ filePath: res.key, audioUrl: this.audioUrl, autoSubmitComment: this.autoSubmitComment, audioDuration: this.seconds });
          this.cancel(true);

        }).catch(err => console.log('erro in upload to s3: ', err));

        // Clear stream tracks
        stream.getTracks().forEach(track => track.stop());
        this.isInitializedMediaRecorder = false;

      });

      // if (audioRecorderState === 'granted') {
      this.startRecording();
      // }

    }).catch(err => alert(err));

  }

  /** Check if the permission of microphone is already granted so that we does not ask permission every time when user wants to record audio
   *  This feature of Permission API is only available in Chrome.
   */
  private checkAudioRecorderState() {
    navigator.permissions.query({ name: 'microphone' }).then(result => {
      console.log('checkAudioRecorderState: ', result)
      this.audioRecorderState = result.state;
      result.onchange = () => {
        this.audioRecorderState = result.state;
      }
    });
  }

  public stopAndUploadAudio(autoSubmitComment?: string) {
    this.autoSubmitComment = autoSubmitComment;
    this.mediaRecorder.stop();
    this.uploadingAudio = true;
    this.recordingState = 'uploading';
    this.currentState.emit(this.recordingState);
  }

  public cancel(callProgramatically?: boolean) {
    console.log('cancel')
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = '';
    this.seconds = 0;
    this.mediaRecorder = null;
    if (!callProgramatically) {
      this.recordingState = 'comfortZone';
      this.currentState.emit(this.recordingState);
      this.audioPath.emit({ filePath: '', audioUrl: '', autoSubmitComment: '', audioDuration: null });

      // Clear stream tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.isInitializedMediaRecorder = false;
      }
    }
  }

  private createAudioDomEl(audioSrc: string) {
    const audio = this.renderer.createElement('audio');
    this.renderer.setAttribute(audio, 'controls', '');

    const source = this.renderer.createElement('source');
    this.renderer.setAttribute(source, 'type', 'audio/mpeg');
    this.renderer.setAttribute(source, 'src', audioSrc);

    this.renderer.appendChild(audio, source);

    this.renderer.appendChild(this.audioPlayerContainer.nativeElement, audio);
  }

  private detectBrowser() {
    // Opera 8.0+
    const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    if (isOpera) {
      this.browserName = 'opera';
      return;
    }

    // Firefox 1.0+
    const isFirefox = typeof InstallTrigger !== 'undefined';
    if (isFirefox) {
      this.browserName = 'firefox';
      if (MediaRecorder) this.browserSupportAudioRecording = true;
      return;
    }

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    if (isSafari) {
      this.browserName = 'safari';
      if (!window.MediaRecorder) window.MediaRecorder = PolyfillMediaRecorder;
      if (MediaRecorder) this.browserSupportAudioRecording = true;
      return;
    }

    // Internet Explorer 6-11
    const isIE = /*@cc_on!@*/false || !!document.documentMode;
    if (isIE) {
      this.browserName = 'internetExplorer';
      return;
    }

    // Edge 20+
    const isEdge = !isIE && !!window.StyleMedia;
    if (isEdge) {
      this.browserName = 'edge';
      return;
    }

    // Chrome 1 - 71
    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    if (isChrome) {
      this.browserName = 'chrome';
      if (MediaRecorder) this.browserSupportAudioRecording = true;
      return;
    }

    const isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
    if (isEdgeChromium) {
      this.browserName = 'edgeChromium';
      return;
    }
  }

  hideTabRecordingicon(data) {
    if (data && this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.isInitializedMediaRecorder = false;
      this.headerService.hideTabRecordIcon(false)
    }
  }

  private getExtensionOfMediaRecorder(mimeType: string) {
    let extension: string;
    const codecMimeType = mimeType.indexOf(';');
    if (codecMimeType >= 0) {
      console.log('codecMimeType: ', codecMimeType)
      extension = mimeType.substring(6, codecMimeType);
    } else {
      extension = mimeType.substring(6, mimeType.length);
    }
    return extension;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}