import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";
import { Subject, BehaviorSubject } from "rxjs";
import { HeaderService } from "@projectModules/app/services";
import { saveAs } from "file-saver";

@Injectable({
  providedIn: "root"
})
export class DetailsHttpService {
  public ToggleView = new Subject<string>();
  resourcesServerIp = "https://sibme-production.s3.amazonaws.com/";
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  private params;
  public popup_value = new EventEmitter<any>();
  resource;

  public refreshGetParticipantListSource = new Subject<boolean>();
  public refreshGetParticipantList$ = this.refreshGetParticipantListSource.asObservable();

  private cirqliveDataSource = new BehaviorSubject<any>({});
  cirqliveData$ = this.cirqliveDataSource.asObservable();

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };

  setResource(val) {
    this.resource = val;
  }

  getResource() {
    return this.resource;
  }
  public isLoading = new EventEmitter<boolean>();
  public resourceToOpen: EventEmitter<any> = new EventEmitter<any>();
  public flagEmitter: EventEmitter<any> = new EventEmitter<any>();
  public discussionEmitter: EventEmitter<any> = new EventEmitter<any>();
  public removeUnsavedDiscussionEmitter: EventEmitter<any> = new EventEmitter<any>();
  public atrifactList = new Subject<any[]>();
  public actList = new Subject<any[]>();
  public partiList = new Subject<any[]>();
  public lsDiscussionEditArraySource = new Subject<any>();
  public lsDiscussionEditArray$ = this.lsDiscussionEditArraySource.asObservable();
  public artifactObj
  // :EventEmitter<any> =new EventEmitter<any>();
  //new Subject<any[]>();

  public Loadings: any = {};

  actiitiesList: any = [];
  participentlist: any = [];

  list: any = [];
  public parameters;

  constructor(private http: HttpClient, private headerService: HeaderService) {
    this.Loadings.IsLoadingArtifacts = new EventEmitter<boolean>();
  }
setObj(val){
  this.artifactObj=val
}
getObj(){
  return this.artifactObj;
}




  setActivities(val) {
    this.actList.next(val);
    this.actiitiesList = val;
  }



  getActivitiesList() {
    return this.actList;
  }
  setParticients(val) {
    this.partiList.next(val);
    this.participentlist = val;
  }
  getParticientslist() {
    return this.partiList;
  }

  setArtifactlList(val) {
    this.atrifactList.next(val);
    this.list = val;
  }
  
  getAcitives(huddle_id) {
    // {"folder_id":"150013","user_id":"18737","account_id":"2936", "role_id": "100"}

    let sessionData: any = this.headerService.getStaticHeaderData();

    let obj: any = {
      folder_id: huddle_id,
      account_id: sessionData.user_current_account.accounts.account_id,
      user_id: sessionData.user_current_account.User.id,
      role_id: sessionData.user_current_account.roles.role_id
    };

    this.getActivities(obj).subscribe(
      data => {
        this.setActivities(data);
      },
      error => {}
    );

    return this.actiitiesList;
  }

  public GetParticipentsList(huddle_id) {
    let obj: any = {
      huddle_id: huddle_id
      // folder_type: huddle_type || 0
    };

    this.GetParticipents(obj).subscribe(
      data => {
        this.setParticients(data);
      },
      error => {}
    );
  }

  public AppendToArtifacts(val) {
    this.list.unshift(val);
    this.atrifactList.next(this.list);
  }

  getArtifactList() {
    return this.atrifactList;
  }

  public SetParams(p) {
    this.params = p;
  }

  public GetParams() {
    return this.params;
  }

  public TrimVideo(video_id, huddle_id, obj) {
    let path = `${
      environment.baseUrl
    }/Huddles/submit_trim_request/${video_id}/${huddle_id}`;
    //environment.baseUrl+ "/Huddles/submit_trim_request/"+video_id+"/"+huddle_id;

    return this.http.post(path, obj);
  }

  public GetArtifacts(obj) {
    let path = environment.APIbaseUrl + "/get_artifects";
    // let b={"huddle_id":"150013","account_id":"181", "role_id":"210", "user_id": "18737", "title": "a"}
    return this.http.post(path, obj, {
      headers: new HttpHeaders({
        // ignoreLoadingBar: ""
      })
    });
  }
  public GetParticipents(obj) {
    let path = environment.APIbaseUrl + "/get_participants";
    return this.http.post(path, obj);
  }

  setToggleView(value: string) {
    this.ToggleView.next(value);
  }

  getToggleView() {
    return this.ToggleView;
  }

  public set_popup(val) {
    this.popup_value.emit(val);
    //return this.popup_value;
  }

  public get_popup() {
    this.popup_value.emit();
    //EventEmitter(this.popup_value);
  }

  // ImageUrlBuilder(resource:any){
  //   let image=resource.image || 'assets/video-huddle/img/c1.png';
  //   let url=`${this.resourcesServerIp}/${resource.stack_url || resource.url }`;
  //   return (resource.image)? url:image ;
  // }

  RenameResourceTitle(obj) {
    let path = environment.APIbaseUrl + "/edit_title";
    return this.http.post(path, obj, this.httpOptions);
  }

  GetAssesseeVideoCount(obj) {
    let path = environment.APIbaseUrl + "/check_videos_count";
    return this.http.post(path, obj, this.httpOptions);
  }

  ImageUrlBuilder(participent: any, forDummy?: boolean) {
    
    if(forDummy) return 'assets/img/photo-default.png';
    if(participent.image=='groups'){
      return true
    }else{
    let image = participent.image || "assets/video-huddle/img/c1.png";
    let url = `${this.staticImageServiceIp}${participent.user_id}/${
      participent.image
    }`;
    return participent.image ? url : image;
  }
  }

  GetDiscussions(obj) {
    let path = environment.APIbaseUrl + "/get_all_discussions";
    return this.http.post(path, obj, this.httpOptions);
  }

  DeleteResource(obj) {
    let path = environment.APIbaseUrl + "/delete_huddle_video";
    return this.http.post(path, obj, this.httpOptions);
  }
  DeleteDiscussion(obj) {
    obj.huddle_id = this.params.id;
    let path = environment.APIbaseUrl + "/delete_discussion";
    return this.http.post(path, obj);
  }

  DuplicateResource(obj) {
    let path = environment.APIbaseUrl + "/copy";
    return this.http.post(path, obj, this.httpOptions);
  }
  SendEmail(obj) {
    let fd = new FormData();

    for (let key in obj) {
      fd.append(key, obj[key]);
    }
    let path = environment.APIbaseUrl + "/sent_feedback_email";
    return this.http.post(path, fd);
  }

  getActivities(obj) {
    let path = environment.APIbaseUrl + "/get_huddles_actvities";
    return this.http.post(path, obj, this.httpOptions);
  }

  public DownloadResource(obj) {
    let path;

    path = environment.APIbaseUrl + "/download_document";
    //(to=="pdf")? environment.APIbaseUrl+"/print_pdf_comments": environment.APIbaseUrl+"/print_excel_comments";

    let form = document.createElement("form");

    form.setAttribute("action", path);

    form.setAttribute("method", "post");

    document.body.appendChild(form);

    this.appendInputToForm(form, obj);

    form.submit();

    document.body.removeChild(form);
  }

  public DownloadFileFromUrl(obj) {
    saveAs(obj.url, obj.title);
  }
  public FormatSeconds(time) {
    // console.log("time formate",time)
    if(time==0 || time==null) return "00:00:00";
    let sec_num: any = parseInt(time, 10);
    let hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - hours * 3600) / 60);
    let seconds: any = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds;
  }
  public uploadVideo(obj) {
    let path = environment.APIbaseUrl + "/uploadVideos";
    return this.http.post(path, obj, this.httpOptions);
  }

  public uploadResource(obj) {
    let path = environment.APIbaseUrl + "/upload_document";
    return this.http.post(path, obj, this.httpOptions);
  }

  public DownloadDiscussionFile(id){

    //https://staging.sibme.com/Huddles/download/309727
    let path = `${environment.baseUrl}/Huddles/download/${id}`;
    let link = document.createElement("a");
    link.setAttribute("href", path);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  public DownloadFile(id) {
    let path = environment.APIbaseUrl + "/download_document";

    var form = document.createElement("form");

    form.setAttribute("target", "_blank");

    var input = document.createElement("input");

    input.setAttribute("value", id);

    input.setAttribute("name", "document_id");

    form.appendChild(input);

    let sessionData: any = this.headerService.getStaticHeaderData();

    let user_id = sessionData.user_current_account.User.id;
    let account_id = sessionData.user_current_account.accounts.account_id;

    var input2 = document.createElement("input");

    input2.setAttribute("value", user_id);

    input2.setAttribute("name", "user_id");

    form.appendChild(input2);

    var input3 = document.createElement("input");

    input3.setAttribute("value", account_id);

    input3.setAttribute("name", "account_id");

    form.appendChild(input3);

    form.setAttribute("action", path);

    form.setAttribute("method", "post");

    document.body.appendChild(form);

    form.submit();

    document.body.removeChild(form);
  }
  private appendInputToForm(form, obj) {
    Object.keys(obj).forEach(key => {
      let input = document.createElement("input");

      input.setAttribute("value", obj[key]);

      input.setAttribute("name", key);

      form.appendChild(input);
    });
  }

  public openResource(artifact) {
    console.log('in service')
    this.resourceToOpen.emit(artifact);
  }

  public getHuddlesForCopy(obj) {
    let path = environment.APIbaseUrl + "/get_copy_huddle";
    return this.http.post(path, obj);
  }

  public copyVideoToHuddlesAndLib(obj) {
    let path = environment.APIbaseUrl + "/copy";
    return this.http.post(path, obj);
  }

  public copyVideoToAccounts(obj) {
    let path = environment.APIbaseUrl + "/copytoaccounts";
    return this.http.post(path, obj);
  }

  public copyVideoToLibrary(obj) {
    let path = environment.APIbaseUrl + "/copy";
    return this.http.post(path, obj);
  }

  public setParams(params) {
    this.parameters = this.params;
  }

  public getParams() {
    // console.log("this is huddle id");
    // console.log(this.parameters);
    return this.parameters;
  }

  public shareResourceToVideos(obj) {
    let path = environment.APIbaseUrl + "/associateVideoDocuments";
    return this.http.post(path, obj);
  }

  public getVideos(obj) {
    let path = environment.APIbaseUrl + "/get_huddle_videos";
    return this.http.post(path, obj);
  }

  public getFlag(data){
    
    return this.flagEmitter.emit(data);
  }
  public saveDiscussionEmitter(discussion){
    this.discussionEmitter.emit(discussion)
  }
  public removeUnsavedDiscussion(discussion){
    this.removeUnsavedDiscussionEmitter.emit(discussion);
  }

  public updateLSDiscussionEditArraySource(discussion: any){
    this.lsDiscussionEditArraySource.next(discussion);
  }


  public updateRefreshGetParticipantList(param: boolean){
    this.refreshGetParticipantListSource.next(param);
  }
    public GetFolderList(obj){

    let path = environment.APIbaseUrl + "/treeview_detail";

    return this.http.post(path, obj);

  }
  /**Get CIRQLIVE data and check the permission */
  public GetCirqLiveData() {

		let sessionData;

		sessionData = this.headerService.getStaticHeaderData();

		let account_id = sessionData.user_current_account.accounts.account_id;

		let path = environment.APIbaseUrl + "/get_cirqlive_data/"+account_id;

		return this.http.get(path);

  }
  /**save data into service for passing other components */
  updateCirqliveData(data: any) {
    this.cirqliveDataSource.next(data);
  }

  /**GET UPCOMING EVENTS/CONFERENCES */
  public getUpcomingEvents(data){
    let path = environment.APIbaseUrl + "/get_upcoming_conferences";
    return this.http.post(path, data);
  }
}
