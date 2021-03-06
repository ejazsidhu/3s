import { Injectable, Output, EventEmitter } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';

@Injectable()
export class MainService {

  constructor(private http:HttpClient, private headerService:HeaderService) { }

  @Output() SearchData:EventEmitter<any> = new EventEmitter<any>();
  public CustomTagFocus:EventEmitter<any> = new EventEmitter<any>();
  public PushableRubric:EventEmitter<any> = new EventEmitter<any>();
  public ResetTags:EventEmitter<any> = new EventEmitter<any>();
  public ResetRubrics:EventEmitter<any> = new EventEmitter<any>();
  public CommentAddedNotification: EventEmitter<any> = new EventEmitter<any>();
  public ReRenderMarkers: EventEmitter<any> = new EventEmitter<any>();
  public CropDisposePlayer: EventEmitter<any> = new EventEmitter<any>();
  public CropReRenderMarkers: EventEmitter<any> = new EventEmitter<any>();
  public CropCommentAddedNotification: EventEmitter<any> = new EventEmitter<any>();
  public breadcrumbs: EventEmitter<any> = new EventEmitter<any>();
  public huddleInfo: EventEmitter<any> = new EventEmitter<any>();
  public ResetForm: EventEmitter<any> = new EventEmitter<any>();

  private videoTitleSource = new Subject<string>(); // used in breadcrumbs
  public videoTitle$ = this.videoTitleSource.asObservable();

  private commentTryAgainSource = new Subject<any>(); 
  public commentTryAgain$ = this.commentTryAgainSource.asObservable();

  public updateVideoTitle(title: string){
    this.videoTitleSource.next(title);
  }

  public updateCommentTryAgain(data: any){
    this.commentTryAgainSource.next(data);
  }

  public GetObservationVideo(args){
    // let path = environment.APIbaseUrl + "/view_page_observation";
    let path = environment.APIbaseUrl + "/workspace_video_page";
    return this.http.post(path,args);
  }

  public GetVideo(args, stealthMode?){

  	let path = environment.APIbaseUrl + "/workspace_video_page";

    if(stealthMode)
  	return this.http.post(path,args, {headers: { ignoreLoadingBar: '' }});
    
    return this.http.post(path,args);

  }

  public TriggerSearchChange(obj){


  	this.SearchData.emit(obj);

  }

  public FocusCustomTag(){
  	this.CustomTagFocus.emit(Math.random());
  }

  public GetRubrics(obj){

  	let path = environment.APIbaseUrl+"/get_framework_settings";
  	return this.http.post(path, obj);

  }

  public UpdateRubricToComment(rubric){

  	this.PushableRubric.emit(rubric);

  }

  public ResetCustomTags(){

  	this.ResetTags.emit(Math.random());

  }

  public ResetSelectedRubrics(){
  	this.ResetRubrics.emit(Math.random());
  }

  public TrimVideo(video_id,huddle_id,obj){

    let path = environment.baseUrl+ "/Huddles/submit_trim_request/"+video_id+"/"+huddle_id;

    return this.http.post(path, obj);

  }

  public GetVideoResources(obj){

    let path = environment.APIbaseUrl+"/get_video_documents";

    return this.http.post(path,obj);

  } 

  public DownloadVideo(obj){

    let path = environment.APIbaseUrl+"/download_document";

    var form = document.createElement("form");

    form.setAttribute("action", path);
    
    form.setAttribute("method","post");
    
    document.body.appendChild(form);

    this.appendInputToForm(form, obj);
      let sessionData:any = this.headerService.getStaticHeaderData();
      this.appendInputToForm(form, {"current_lang":sessionData.language_translation.current_lang});
    form.submit();

    document.body.removeChild(form);


  }

  public DeleteVideo(obj){

    let path = environment.APIbaseUrl+"/delete_huddle_video";

    return this.http.post(path, obj);

  }

  public DownloadFile(id){

        let path = environment.APIbaseUrl+"/download_document";

    var form = document.createElement("form");
    
    var input = document.createElement("input");
    
    input.setAttribute("value", id);
    
    input.setAttribute("name", "document_id");
    
    form.appendChild(input);

    let sessionData:any = this.headerService.getStaticHeaderData();

    let user_id = sessionData.user_current_account.User.id;
    let account_id = sessionData.user_current_account.accounts.account_id;

      this.appendInputToForm(form, {"current_lang":sessionData.language_translation.current_lang});
    var input2 = document.createElement("input");
    
    input2.setAttribute("value", user_id);
    
    input2.setAttribute("name", "user_id");
    
    form.appendChild(input2);


    var input3 = document.createElement("input");
    
    input3.setAttribute("value", account_id);
    
    input3.setAttribute("name", "account_id");
    
    form.appendChild(input3);


    form.setAttribute("action", path);
    
    form.setAttribute("method","post");
    
    document.body.appendChild(form);

    form.submit();

    document.body.removeChild(form);
    
  }

  public SavePauseSettings(obj){
    
    let path = environment.APIbaseUrl+"/pause_setting_save";
    return this.http.post(path, obj);

  }

  public SaveAutoscrollSettings(obj){

    let path = environment.APIbaseUrl+"/autoscroll_switch";
    return this.http.post(path, obj);

  }

  public DeleteResource(obj){

    let path = environment.APIbaseUrl+"/delete_video_document";

    return this.http.post(path, obj);

  }

  public ExportComments(obj, to){

    let path;

    path = (to=="pdf")? environment.APIbaseUrl+"/print_pdf_comments": environment.APIbaseUrl+"/print_excel_comments";

    let form = document.createElement("form");

    form.setAttribute("action", path);
    
    form.setAttribute("method","post");
    
    document.body.appendChild(form);

    this.appendInputToForm(form, obj);
      let sessionData:any = this.headerService.getStaticHeaderData();
      this.appendInputToForm(form, {"current_lang":sessionData.language_translation.current_lang});
    form.submit();

    document.body.removeChild(form);

  }

  private appendInputToForm(form, obj){

    
    
     Object.keys(obj).forEach((key)=>{

        let input = document.createElement("input");

        input.setAttribute("value", obj[key]);
        
        input.setAttribute("name", key);
        
        form.appendChild(input);

     });

  }

  public PublishFeedback(obj){

    let path = environment.APIbaseUrl+"/feedback_publish";

    return this.http.post(path, obj);

  }

  public GetCopyData(obj){

    let path = environment.APIbaseUrl+"/get_copy_huddle";

    return this.http.post(path, obj);

  }


  public CopyToAccounts(obj){

    let path = environment.APIbaseUrl+"/copytoaccounts";
    
    return this.http.post(path, obj);
  }

  public CopyToHuddlesAndLib (obj){

    let path = environment.APIbaseUrl+"/copy";
    
    return this.http.post(path, obj);
  }


 public SendEmail(obj){

   let path = environment.APIbaseUrl+"/sent_feedback_email";

   let fd = new FormData();

   for(let key in obj){

     fd.append(key, obj[key]);

   }

   return this.http.post(path, fd);

 }

 public GetPLComments(obj){

   let path = environment.APIbaseUrl+"/load_perfomance_level_comments";

   return this.http.post(path, obj);

 }

 public SaveRating(obj){

   let path = environment.APIbaseUrl+"/add_multiple_standard_ratings";

   return this.http.post(path, obj);

 }

 public GetCoachingSummary(obj, bool?){

   let path;
   
   if(!bool)
   path = environment.APIbaseUrl+"/video_detail";

   else path = environment.APIbaseUrl+"/assessment_detail";

   return this.http.post(path, obj);

 }


 public SubmitFeedback(obj, bool?){
   
   let path;
   if(!bool)
    path = environment.APIbaseUrl+"/coaching_tracker_note";
   else path = environment.APIbaseUrl+"/assessment_note";

   return this.http.post(path,obj);

 }

 public PublishObservation(obj){

   let path = environment.APIbaseUrl+"/publish_observation";

   return this.http.post(path, obj);

 }

 public GetVideoDuration(video_id){
   //https://staging.sibme.com/Huddles/getVideoDuration/

   let path = environment.baseUrl+"/Huddles/getVideoDuration/"+video_id;

   return this.http.get(path, {});


 }

  public GetFrameworks(){

    let sessionData:any = this.headerService.getStaticHeaderData();

    let account_id = sessionData.user_current_account.accounts.account_id;

    let path = environment.APIbaseUrl+"/get_frameworks_list/"+account_id;

    return this.http.get(path, {});

  }

  public SetFrameworkForVideo(obj){

    let path = environment.APIbaseUrl+"/select_video_framework";

   // return of({status:true});
    return this.http.post(path, obj);

  }

  public GetRubricById(obj){

    let path = environment.APIbaseUrl+"/get_framework_settings_by_id";

    return this.http.post(path, obj);

  }

}
