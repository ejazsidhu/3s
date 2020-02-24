import { Component, Renderer2, OnInit, ViewChild } from '@angular/core';
import { Event as RouterEvent, Router, NavigationStart } from "@angular/router";
import { filter, debounceTime } from 'rxjs/operators';
//import { LoadingBarService } from '@ngx-loading-bar/core';
import { HeaderService, SocketService, AppMainService } from "@app/services";

import { environment } from '@src/environments/environment';
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

declare var window: any;
declare var opr: any;
declare var InstallTrigger: any;
declare var document: any;
declare var safari: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  @ViewChild('wowzaNotification', { static: false }) wowzaNotification: ModalDirective;
  public isLoggedIn;
  public title = "huddles";
  public changed_account_name = "";
  public account_switch_title = "Account Change";
  public ok_text = "ok";
  public total_toasters = [];
  public account_switch_message = "It appears you’ve clicked on a link pointing to a different account. Your account has been switch to";
  public colors;
  public channels = environment.channelsArr;
  public onlineTrialAccountLayout: boolean = false;
  private subscriptions: Subscription = new Subscription();
  @ViewChild('accountChange', { static: false }) accountChange: ModalDirective;
  baseUrl = environment.baseUrl;

  constructor(private headerService: HeaderService,
    private renderer: Renderer2,
    private router: Router,
    private socketService: SocketService,
    private toastr: ToastrService, // private loadingBar: LoadingBarService
    private appMainService: AppMainService
  ) {
    if (document.location.href.indexOf('online_trial_account') > 0) this.onlineTrialAccountLayout = true;

    router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationStart),
      debounceTime(200)).subscribe(
        (): void => {
          let sessionData: any = this.headerService.getStaticHeaderData();
          console.log('in app NavigationStart event: sessionData: ', sessionData);
          if (sessionData && !sessionData.account_expired_status.status) {
            this.toastr.info(sessionData.account_expired_status.message);
            window.location = sessionData.account_expired_status.url;
          }
        }
      );

    // console.log(this.channels);
    /*
    (window as any).console["log"] = (...arg) => {
      if (environment.enableLogging) {
        console.info(...arg);
      }
    };
    */
    let env = window.location.hostname
      .substring(0, window.location.hostname.indexOf("."))
      .toUpperCase();

    if (location.protocol != "https:" && env != "") {
      location.href =
        "https:" +
        window.location.href.substring(window.location.protocol.length);
    }
    this.headerService.current_lang.subscribe(data => {
      if (data == "es") {
        this.renderer.addClass(document.body, 'language_sp');
      }
    });

    this.headerService.LoggedIn.subscribe(data => {
      this.isLoggedIn = data;
      if (data) {
        this.writeToHead();
        // let sessionData = this.headerService.getStaticHeaderData();
        this.colors = this.headerService.getColors();

        let sessionData: any = this.headerService.getStaticHeaderData();
        console.log("sessionData in app.component constructor", sessionData);

        if (!sessionData.account_expired_status.status) {
          this.toastr.info(sessionData.account_expired_status.message);
          window.location = sessionData.account_expired_status.url;
        }

        let cookies = document.cookie;
        let value = 'is_account_switched';
        let is_account_switched = this.parseCookieValue(cookies, value);
        if (sessionData.is_account_switched || is_account_switched) {
          this.changed_account_name = sessionData.user_current_account.accounts.company_name;
          this.account_switch_message = sessionData.language_translation.account_switch_message;
          this.account_switch_title = sessionData.language_translation.account_switch_title;
          this.ok_text = sessionData.language_translation.myfile_ok;
          this.accountChange.show();
        }
      }
      else{
          window.location.href=this.baseUrl;
      }
    });
  }

  ngOnInit() {
    this.sysRefreash();
    this.liveStreamStarted();
    this.detectBrowserAndStorePlayableAudioExtensions();
    this.appMainService.LiveStreamPage.subscribe(data => {
      if (this.total_toasters[data.item_id]) {
        console.log("on page this.total_toasters[data.item_id]", this.total_toasters[data.item_id]);
        this.toastr.remove(this.total_toasters[data.item_id]);
        delete this.total_toasters[data.item_id];
      }
    })
  }

  private liveStreamStarted() {

    this.subscriptions.add(this.socketService.pushEventWithNewLogic('global-channel').subscribe(data => {
      console.log('data of global: ', data);
      var item_id = data.item_id;
      var huddle_id = data.huddle_id;
      var streamer_name = data.streamer_name ? data.streamer_name : 'SomeOne';
      var huddle_name = data.huddle_name ? data.huddle_name : 'Huddle';
      let sessionData = this.headerService.getStaticHeaderData();
      let user_id = sessionData.user_current_account.User.id;
      this.appMainService.check_if_huddle_participant(huddle_id, user_id).subscribe((Pdata: any) => {
        if (Pdata.result && data.data && data.event == "live_stream_started") {
          var htmlForToast = `<div id="flashMessage" class="live_re_msg live_recording_${item_id}" style="cursor: pointer;">
          <a href = "/video_details/live-streaming/${huddle_id}/${item_id}" style="color:#fff;"> 
          <div class="icon_box_notification"><img src="${environment.baseUrl}/img/recording_live_video.png" /></div>    
              <div class="noteificationRight">    
                  <p>${streamer_name} is now Live in the ${huddle_name}</p>
              </div>    
          <div class="clear"></div>
          </a>
          </div>`;
          var current_toaster = this.toastr.show(htmlForToast,
            null, {
            enableHtml: true,
            closeButton: true,
            disableTimeOut: true
          });
          console.log("current_toaster", current_toaster);
          this.total_toasters[item_id] = current_toaster.toastId;
          console.log("this.total_toasters", this.total_toasters);
        }
        else if (data.event == "live_stream_stopped") {
          if (this.total_toasters[data.item_id]) {
            console.log("this.total_toasters[data.item_id]", this.total_toasters[data.item_id]);
            this.toastr.remove(this.total_toasters[data.item_id]);
            delete this.total_toasters[data.item_id];
          }
        }
      });
    })
    );
  }

  private writeToHead() {
    let sessionData: any = this.headerService.getStaticHeaderData();
    let user_role = sessionData.user_role;
    let is_in_trial = sessionData.is_in_trial;
    let site_id = sessionData.site_id;
    let full_name =
      sessionData.user_current_account.User.first_name +
      " " +
      sessionData.user_current_account.User.last_name;
    let intercom_app_id = '';

    if (site_id == '2') {
      intercom_app_id = 'ymjv4ih3';
    }
    else {
      intercom_app_id = 'uin0il18';
    }

    let intercomSettings = {
      app_id: intercom_app_id,
      name: full_name, // Full name
      email: sessionData.user_current_account.User.email,
      created_at: sessionData.user_created_date_timestamp, //new Date().getTime(),
      user_role: user_role,
      is_in_trial: is_in_trial,
      AccountID: sessionData.user_current_account.accounts.account_id
    };
    if (!!(<any>window).Intercom) (<any>window).Intercom("update", intercomSettings);
    //    if(site_id == "1"){
    //   (window as any).HS.beacon.ready(function() {
    //   (window as any).HS.beacon.identify({
    //        name: full_name,
    //        email: sessionData.user_current_account.User.email,
    //      });
    //   });
    // }
  }

  private sysRefreash() {
    setInterval(() => {
      this.appMainService.sysRefreash().subscribe((respoonse: any) => {
        if (!respoonse.ok)
          window.open(this.baseUrl + '/users/logout', '_self');

      })
    }, 1000 * 20);
  }

  public hideAccountChange() {
    this.accountChange.hide();
  }

  parseCookieValue(cookieStr, name) {
    name = encodeURIComponent(name);
    for (const cookie of cookieStr.split(';')) {
      /** @type {?} */
      const eqIndex = cookie.indexOf('=');
      const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
      if (cookieName.trim() === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  private detectBrowserAndStorePlayableAudioExtensions() {
    // Opera 8.0+
    const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    if (isOpera) {
      this.appMainService.playableAudioExtensions = ['mp3', 'm4a', 'wav', 'webm', 'ogg'];
      return;
    }

    // Firefox 1.0+
    const isFirefox = typeof InstallTrigger !== 'undefined';
    if (isFirefox) {
      this.appMainService.playableAudioExtensions = ['mp3', 'm4a', 'wav', 'webm', 'ogg'];
      return;
    }

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    if (isSafari) {
      this.appMainService.playableAudioExtensions = ['mp3', 'm4a', 'wav'];
      return;
    }

    // Internet Explorer 6-11
    const isIE = /*@cc_on!@*/false || !!document.documentMode;
    if (isIE) {
      this.appMainService.playableAudioExtensions = ['mp3', 'm4a'];
      return;
    }

    // Edge 20+
    const isEdge = !isIE && !!window.StyleMedia;
    if (isEdge) {
      this.appMainService.playableAudioExtensions = ['mp3', 'm4a', 'wav', 'ogg'];
      return;
    }

    // Chrome 1 - 71
    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    if (isChrome) {
      this.appMainService.playableAudioExtensions = ['mp3', 'm4a', 'wav', 'webm', 'ogg'];
      return;
    }

    const isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
    if (isEdgeChromium) {
      this.appMainService.playableAudioExtensions = ['mp3', 'm4a', 'wav', 'webm', 'ogg'];
      return;
    }
  }
}
