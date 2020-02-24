import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from "@environments/environment";
import {Subject, BehaviorSubject, Observable} from 'rxjs';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class HeaderService {

  @Output() public LoggedIn: EventEmitter<boolean> = new EventEmitter();
  @Output() public current_lang: EventEmitter<boolean> = new EventEmitter();

  // private languageTranslationSource = new Subject<any>();
  private languageTranslationSource = new BehaviorSubject<any>({});
  public languageTranslation$ = this.languageTranslationSource.asObservable();
  private alertPrevent = new BehaviorSubject<any>({});
  public alertPrevent$ = this.alertPrevent.asObservable();
  private currentUserImage = new BehaviorSubject<any>({});
  public currentUserImage$ = this.currentUserImage.asObservable();
  public tabrecordIcon = new BehaviorSubject<Boolean>(false);
  public tabrecordIcon$ =this.tabrecordIcon.asObservable();
  public audioExtesionList:any=['aif', 'aiff','mp3', 'm4a', 'ogg', 'wav', 'wma']

  private data: any;
  private userId: number; // current logged in userId
  private colors: any = {};
  private baseUrl = environment.baseUrl;
  public userImageSubject: BehaviorSubject<any>;
  public userFirstNameSubject: BehaviorSubject<any>;
  public userLastNameSubject: BehaviorSubject<any>;
  public userEmailSubject: BehaviorSubject<any>;
  constructor(private http: HttpClient) {
    this.userImageSubject = new BehaviorSubject<any>('');
    this.userFirstNameSubject = new BehaviorSubject<any>('');
    this.userLastNameSubject = new BehaviorSubject<any>('');
    this.userEmailSubject = new BehaviorSubject<any>('');
  }

  hideTabRecordIcon(value){
  this.tabrecordIcon.next(value);
}
  setalertPrenventValue(value) {
    this.alertPrevent.next(value);
  }

  setCurrentUserImageValue(value) {
    this.currentUserImage.next(value);
  }

  public getExtension(url) {
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(url)[1];
    return ext;
  }

  public getAudioURL(){
    let str="https://s3.amazonaws.com/sibme.com/app/img/audio-thumbnail.png";
    let headerData=this.getStaticHeaderData();
    if(headerData.site_id==2)
    str="https://s3.amazonaws.com/sibme.com/app/img/audio-hmh-thumbnail.png";

    return str;
  }

  public isAValidAudio(type='mp4'){
    let result=false;
this.audioExtesionList.forEach(element => {
  if(element==type.toLowerCase())
  result=true;

});

    return result;


  }

  public getColors() {

    return this.colors;

  }
  formateDate(date, format) {
    return moment(date).format(format);
  }

  public loadData(path) {



    return this.http.get<headerData[]>(path).pipe(tap(data => {
      this.data = data;
      this.UpdateLoggedInStatus(data);
      this.userImageSubject.next(this.data.avatar_path);
      this.userFirstNameSubject.next(this.data.user_current_account.User.first_name);
      this.userLastNameSubject.next(this.data.user_current_account.User.last_name);
      this.userEmailSubject.next(this.data.user_current_account.User.email);
      this.userId = this.data.user_current_account.User.id;
    }));
  }

  private UpdateLoggedInStatus(data) {
    this.colors = {

      loading_bar_color: data.secondry_button_color,
      primery_button_color: data.primery_button_color,
      secondry_button_color: data.secondry_button_color

    };
    if (data.language_translation) {
      this.current_lang.emit(data.language_translation.current_lang);
    }

    this.LoggedIn.emit(data.status);

  }

  public getStaticHeaderData() {

    return this.data;

  }

  public checkFileSizeLimit(files, notAllowedType = 'video') {
    let mblimit = 30;
    let limit = (1048576 * mblimit);
    if (files.length) {
      let size = 0;
      let isvalid = true
      files.forEach(function (item) {
        size = size + item.size;
        let x = item.type.split('/')
        if (x[0] == notAllowedType) {
          isvalid = false
        }
      });

      if (size > limit) {
        return { "status": false, "message": `Files size should be less then ${mblimit} MBs` };
      } else if (!isvalid) {
        return { "status": false, "message": `${notAllowedType} files are not allowed` };
      }
      else {
        return { "status": true, "message": "Success" };
      }
    }
    return { "status": true, "message": "No file selected yet!" };
  }

  public getHeaderData(path) { //expected: path
    // let data: headerData;
    // this.data = (<any>window).header_data;

    // return of(this.data);

    //if(!this.data){

    //	return this.loadData();
    return this.loadData(path);//.subscribe((data) => {this.data=data;this.getHeaderData()})

    //	}else{
    //return of(this.data);
    //		console.log("presaved");
    //		return of(this.data);
    //	}

  }

  public getCurrentUserImage()
{

}
  public getEnglishSpanishDate(unix_timestamp, location = '') {
    let sessionData = this.getStaticHeaderData();
    let current_lang = sessionData.language_translation.current_lang;
    let date = new Date(unix_timestamp * 1000);
    let ano = date.getFullYear();
    let mes = date.getMonth();
    let dia = date.getDay();
    let time = this.formatAMPM(date);

    /*let diasemana = date('w',timestamp);
    let diassemanaN= ["Domingo","Lunes","Martes","Mi�rcoles",
        "Jueves","Viernes","S�bado"];
    let mesesN= {1:"Enero",2:"Febrero",3:"Marzo",4:"Abril",5:"Mayo",6:"Junio",7:"Julio",
    8:"Agosto",9:"Septiembre",10:"Octubre",11:"Noviembre",12:"Diciembre"};*/
    let mesesN = [];
    if (current_lang == "es") {
      mesesN = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    }
    else {
      mesesN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }

    if (location == 'dashboard') {
      return mesesN[mes] + ' ' + dia;
    }
    else if (location == 'trackers') {
      return dia + '-' + mesesN[mes];
    }
    else if (location == 'trackers_filter') {
      return mesesN[mes];
    }
    else if (location == 'archive_module') {
      return mesesN[mes] + ' ' + dia + ', ' + ano;
    }
    else if (location == 'discussion_time') {
      return time;
    }
    else if (location == 'discussion_date') {
      return mesesN[mes] + ' ' + dia + ', ' + ano + ' ' + time;
    }

    //return diassemanaN[diasemana].", dia de ". mesesN[mes] ." de ano";
  }

  public formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  formatDate(date, format) {
    return moment(date).format(format);
  }

  public getLanguageTranslation(projectTitle: string) {
    return this.http.get(`${environment.baseHeaderUrl}/angular_header_api/${projectTitle}`).pipe(tap((data: any) => {
      if (data.language_translation) {
        this.updateLanguageTranslationSource(data.language_translation);
      }
    }));
  }

  public updateLanguageTranslationSource(languageTranslation: any) {
    this.languageTranslationSource.next(languageTranslation);
  }
  public afterWorkspaceTrim(origionalDoc,duplictedoc,startTime,endTime,currentUser){
    let obj=
      {
        src_video_id:origionalDoc,
        dest_video_id:duplictedoc,
        is_duplicated:1,
        workspace:1,
        huddle_id:0,
        user_id:currentUser,
        start_duration:startTime,
        end_duration:endTime,
        }
        let path = environment.APIbaseUrl + "/copy_comments_trimming";

        return this.http.post(path, obj);

  }
  public afterHuddleTrim(origionalDoc,duplictedoc,startTime,endTime,currentUser,huddleId){
    let obj=
      {
        src_video_id:origionalDoc,
        dest_video_id:duplictedoc,
        is_duplicated:0,
        workspace:0,
        huddle_id:huddleId,
        user_id:currentUser,
        start_duration:startTime,
        end_duration:endTime,
        }
        let path = environment.APIbaseUrl + "/copy_comments_trimming";
        return this.http.post(path, obj);

  }

  public localStorage(data, location) {
    if (location && data) localStorage.setItem(location, data)
    if (data == null || data == '') localStorage.removeItem(location);
  }

  public configureLocalStorage(key: string, value: string) {

    if (key && value) localStorage.setItem(key, value)
    if (value == null || value == '') localStorage.removeItem(key);

  }

  public setLocalStorage(key: string, data: any): void {

    if (key && data) {
      let dataToBeStored = JSON.stringify(data);
      localStorage.setItem(key, dataToBeStored)
    }

  }

  public getLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key))
    // let temp : any = localStorage.getItem(key)
    // console.log("in the temp",temp)
    // return JSON.parse(temp);
  }

  public getLocalStoragewithoutParse(key: string) {

    let temp : any = localStorage.getItem(key)
    return temp;

  }

  public removeLocalStorage(key: string):void {
    localStorage.removeItem(key);
  }

  /**
   * Return userId of current logged in user
   */
  public getUserId() {
    return this.userId;
  }
  public getAssesseesubmissions(obj) {

		let path = environment.APIbaseUrl + "/get_assessee_data";
		return this.http.post(path, obj);
	}


}

export interface headerData extends Window {

  [x: string]: any

}
