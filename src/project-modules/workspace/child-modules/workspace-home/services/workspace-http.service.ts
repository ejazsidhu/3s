import { Injectable, EventEmitter } from '@angular/core';
import { environment } from "@environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { HeaderService } from "@projectModules/app/services";
import { Subject } from "rxjs";
import { saveAs } from "file-saver";
@Injectable()
export class WorkspaceHttpService {
  public artifacts = new Subject<any[]>();
  public isLoading = new EventEmitter<boolean>();
  public resourceToOpen: EventEmitter<any> = new EventEmitter<any>();
  Loadings: any = {}
  list: any = [];
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };
  public count_emmiter = new EventEmitter<any>();
  public total_count; 
  
  constructor(private http: HttpClient,private headerService: HeaderService) {
    this.Loadings.IsLoadingArtifacts = new EventEmitter<boolean>();
  }

  public getWorkspaceArtifects(obj) {
    let path = environment.APIbaseUrl + "/get_workspace_artifects";
    return this.http.post(path, obj);
  }
  public setArtifact(arr) {
    this.list = arr
    this.artifacts.next(arr)
  }
  public AppendToArtifacts(val) {
    this.list.unshift(val);
    this.artifacts.next(this.list);
  }
  public getArtifact() {
    return this.artifacts
  }
  public uploadVideo(obj) {
    let path = environment.APIbaseUrl + "/uploadVideos";
    return this.http.post(path, obj, this.httpOptions);
  }

  public uploadResource(obj) {
    let path = environment.APIbaseUrl + "/upload_document";
    return this.http.post(path, obj, this.httpOptions);
  }

  public TrimVideo(video_id, huddle_id, obj) {
    let path = `${
      environment.baseUrl
    }/Huddles/submit_trim_request/${video_id}/${huddle_id}`;
    //environment.baseUrl+ "/Huddles/submit_trim_request/"+video_id+"/"+huddle_id;

    return this.http.post(path, obj);
  }

  public DownloadFileFromUrl(obj) {
    saveAs(obj.url, obj.title);
  }
  DuplicateResource(obj) {
    let path = environment.APIbaseUrl + "/copy";
    return this.http.post(path, obj, this.httpOptions);
  }
  startScriptedNotes(obj) {
    let path = environment.baseUrl + "/Huddles/add_call_notes";
    return this.http.post(path, obj, this.httpOptions);
  }
  getSingleVideo(obj){
    let path = environment.APIbaseUrl + "/get_single_video";
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

  public DownloadResource(obj) {
    let path;

    path = environment.APIbaseUrl + "/download_document";
    //(to=="pdf")? environment.APIbaseUrl+"/print_pdf_comments": environment.APIbaseUrl+"/print_excel_comments";

    let form = document.createElement("form");

    form.setAttribute("action", path);

    form.setAttribute("method", "post");

    document.body.appendChild(form);

    this.appendInputToForm(form, obj);
    this.appendInputToForm(form, {"relative_url":""});

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

  
  public deleteArtifact(obj){
    let path = environment.APIbaseUrl+"/delete_huddle_video";

    return this.http.post(path, obj);
  }
  public RenameResourceTitle(obj){
    let path = environment.APIbaseUrl + "/edit_title";
    return this.http.post(path, obj, this.httpOptions);
  }

  public GetAcivities(obj){
    let path = environment.APIbaseUrl + "/get_user_activities";
    return this.http.post(path, obj, this.httpOptions);
  }

  public copyVideoToAccounts(obj) {
    let path = environment.APIbaseUrl + "/copytoaccounts";
    return this.http.post(path, obj);
  }

  public copyVideoToHuddlesAndLib(obj) {
    let path = environment.APIbaseUrl + "/copy";
    return this.http.post(path, obj);
  }

  public getHuddlesForCopy(obj) {
    let path = environment.APIbaseUrl + "/get_copy_huddle";
    return this.http.post(path, obj);
  }

  setTotalAritifactCount(count){
    this.total_count=count;
    this.count_emmiter.emit(this.total_count)
  }
  getTotalAritifactCount(){
    //this.count_emmiter.emit(this.total_count)
    return this.total_count;
  }

  public FormatSeconds(time) {
    // if(time==0 || time==null) return "All Video";
      if(isNaN(time) || time == null || time=='')
      {
          time = 0;
      }
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

  public openResource(artifact) {
    this.resourceToOpen.emit(artifact);
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
 
  
}
