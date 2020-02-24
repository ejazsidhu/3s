import { Component, OnInit , ViewChild } from '@angular/core';
import { ModalDirective  } from 'ngx-bootstrap/modal';
// import { HeaderService } from "../header.service";
// import { environment } from "../../environments/environment";
import { HttpClient,HttpHeaders } from "@angular/common/http";


/* Socket Imports */
import oEcho from "laravel-echo";
import io from "socket.io-client";
import { SocketService, AppMainService } from "@app/services";
import { environment } from '@src/environments/environment';
import { HeaderService } from '@src/project-modules/app/services';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  getting_started_box:any = '0';
  user_id:any = '0';
  account_id:any = '0';
  options:any ;
  dont_show_box:boolean = false;
  recent_activities:any ;
  first_name:any ;
  last_name:any ;
  user_email:any ;
  session_detail:any;
  translations:any={};
  user_role:any;
  public socket_listener:any;
  lang:any;
  site_id:any;
  analytics_permissions:any;
  enable_edtpa:any;
  permission_access_my_workspace:any;
  library_permission:any;
  permission_administrator_user_new_role:any;
  enable_lti_permission:any;
  enable_coaching_tracker:any;
  enable_assessment_tracker:any;
  enable_tracking:any;
  assessment_huddle_active:any;
  private subscription: Subscription;
  // public translation: any = {};
  private projectTitle: string = 'dashboard_angular';

  public showPassword = 'password';
  public showConfirmPassword = 'password';
  public showPasswordFlag = false;
  public showConfirmPasswordFlag = false;

  public model = {
    password: '',
    confirm_password: ''
  }

  @ViewChild('gettingStartedModal',{static:true}) gettingStartedModal: ModalDirective;
  @ViewChild('createNewLearningCenterUser', { static: false }) childModal: ModalDirective;
  isLoading: boolean=true;
  show_question: boolean=true;
  onGettingStartedModal: boolean=true;

  
  constructor(private headerService: HeaderService,private http: HttpClient,private socketService: SocketService, private toastr: ToastrService,private appMainService: AppMainService) { 
    this.headerService.getLanguageTranslation(this.projectTitle).subscribe(() => {
      // Update the language_translation for its child project
    });
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translations = languageTranslation;
    
			// this.huddle_data.title = this.translation.huddle_title;
			// this.LoadHuddleTypes();
		});
  }

  ngOnInit() {
    let sessionData:any = this.headerService.getStaticHeaderData();
    this.session_detail = sessionData;
    this.getting_started_box = sessionData.user_permissions.users.getting_started_show;
    this.account_id = sessionData.user_current_account.accounts.account_id;
    this.user_id = sessionData.user_current_account.User.id;
    this.first_name = sessionData.user_current_account.User.first_name;
    this.last_name = sessionData.user_current_account.User.last_name;
    this.user_email = sessionData.user_current_account.User.email;
    this.translations = sessionData.language_translation;
    this.user_role = sessionData.user_current_account.roles.role_id;
    this.lang = this.translations.current_lang;
    this.site_id = sessionData.site_id;
    this.analytics_permissions = sessionData.analytics_permissions;
    this.enable_edtpa = sessionData.user_permissions.accounts.enable_edtpa;
    this.permission_access_my_workspace = sessionData.user_permissions.UserAccount.parmission_access_my_workspace;
    this.library_permission = sessionData.library_permission;
    this.permission_administrator_user_new_role = sessionData.user_permissions.UserAccount.permission_administrator_user_new_role;
    this.enable_lti_permission = sessionData.enable_lti_permission;
    this.enable_coaching_tracker = sessionData.enable_coaching_tracker;
    this.enable_assessment_tracker = sessionData.enable_assessment_tracker;
    this.enable_tracking = sessionData.enable_tracking;
    this.assessment_huddle_active = sessionData.assessment_huddle_active;

    let headers = new HttpHeaders({
      'current-lang': this.translations.current_lang});
    this.options = { headers: headers };

    let obj = {

      account_id: this.account_id,
      user_id:this.user_id,
      user_current_account: sessionData.user_current_account

    }

    this.GetRecentActivity(obj).subscribe((data: any) => {
       this.recent_activities = data;
       //console.log(this.recent_activities);
       this.isLoading=false;
    })

    let obj1 = {

      account_id: this.account_id,
      user_id:this.user_id

    }

    this.GetChurnZeroData(obj1).subscribe((data: any) => {

          let obj2 = {

            account_id: this.account_id,
            comment_tags_count:data,
            user_current_account: sessionData.user_current_account
      
          }
        
        
            this.ChurnzeroAttributeListCreation(obj2).subscribe((data: any) => {
                  

            })

    })


    this.ChurnZeroConfig();
    this.socketPushStartSyncNote();
    this.socketGlobalChanel();
    // this.processStartSyncNote();

  
  }

  ngAfterViewInit()
  {

    if(this.getting_started_box == '1')
    {
      setTimeout(() => {
        this.gettingStartedModal.show();
      }, 200);
    
    }
    
  }

  ngOnDestroy() {
    
    this.socket_listener.unsubscribe();
    // if(this.gettingStartedModal) this.gettingStartedModal.hide();
  }

  hideGettingStartedModalDone()
  {
    this.gettingStartedModal.hide();
  
    let obj = {

      account_id: this.account_id,
      user_id: this.user_id

    }
    if(this.dont_show_box)
    {
      this.getting_started_box = '0';
      this.UpdateGettingStarted(obj).subscribe((data: any) => {
      
      })
    }
  }

  public UpdateGettingStarted(obj){
  	
  	let path = environment.APIbaseUrl+"/update_getting_started_model_show";

  	return this.http.post(path, obj,this.options);

  }
  
  showChildModal(): void {
    this.childModal.show();
  }
  
  hideChildModal(): void {
    this.childModal.hide();
  }

  public RedirectToLearningCenter(){
    let path = "";
  	if(this.onGettingStartedModal){
      path = environment.baseUrl+"/app/sibme_learning_center/1";      
    }else{
      path = environment.baseUrl+"/app/sibme_learning_center/";
    }
  	return this.http.get(path ,this.options);
  }

  public RedirectToLearningCenterOrCreateUser(){
    if(this.site_id==1){
      this.RedirectToLearningCenter().subscribe((data:any)=>{
        if(data.show_popup==true){
          this.showChildModal();
        } else {
            // $("#sibme_learning_center_modal").modal("hide");
            if(data.learning_center_login_url){
                window.open(data.learning_center_login_url,"_blank");
                this.hideChildModal();
            }
        }
  
        // console.log(data);
      });
    } else {
      window.open("https://learn.sibme.com","_blank");
    }
  }

  public CreateUserInLearningCenter(obj){
    let path = environment.baseUrl+"/app/create_new_thinkific_account";
  	return this.http.post(path , obj ,this.options);
  }

  toggleNewPassword(){
    this.showPasswordFlag=!this.showPasswordFlag;
    if(this.showPassword=='password')
    this.showPassword='text';
    else
    this.showPassword='password'

  }

  toggleConfirmPassword(){
    this.showConfirmPasswordFlag=!this.showConfirmPasswordFlag;
    if(this.showConfirmPassword=='password')
    this.showConfirmPassword='text';
    else
    this.showConfirmPassword='password'

  }

  OpenModalcreateNewLearningCenterUser() {
    // console.log('model', this.model)
    if (this.model.password == '') {
      this.toastr.info(this.translations.new_password_field_required_cp)
    }
    else if (this.model.confirm_password == '') {
      this.toastr.info(this.translations.confirm_password_field_required_cp)
    }
    else if ((this.model.password.length > 0 && this.model.confirm_password.length > 0) && (this.model.password.length < 8 || this.model.confirm_password.length < 8)) {
      this.toastr.info(this.translations.password_limit_cp)
    }

    else if (this.model.password != this.model.confirm_password) {
      this.toastr.info(this.translations.password_dont_match_cp)
    }

    if ((this.model.password.length >= 8 && this.model.confirm_password.length >= 8) && (this.model.password == this.model.confirm_password)) {
      let sessionData:any = this.headerService.getStaticHeaderData();
      let obj = {
                  password: this.model.password,
                  user_current_account: sessionData.user_current_account,
                  returnToBundles: this.onGettingStartedModal
                };

      this.CreateUserInLearningCenter(obj).subscribe((data: any) => {
        // console.log('reset password data', data)
        if (data.success==false){
          this.toastr.info(data.message);
        } else {
          if(data.learning_center_login_url){
            window.open(data.learning_center_login_url,"_blank");
            this.hideChildModal();
          }
        }
      }, error => {

      })
      
    }
  }

  createUser(flag){
    if(flag==0){
      this.show_question=true;
      this.hideChildModal();
    }else{
      this.show_question=false;
    }
  }


  hideGettingStartedModal()
  {
    this.onGettingStartedModal=false;
    this.gettingStartedModal.hide();
  }

  showGettingStartedModal()
  {
    this.onGettingStartedModal=true;
    this.gettingStartedModal.show();
  }

  public GetRecentActivity(obj){
  	
  	let path = environment.APIbaseUrl+"/get_dashboard_user_activities";

  	return this.http.post(path, obj,this.options);

  }

  public GetChurnZeroData(obj){
  	
  	let path = environment.APIbaseUrl+"/get_counts_of_comment_tags";

  	return this.http.post(path, obj,this.options);

  }

  public ChurnzeroAttributeListCreation(obj){
  	
  	let path = environment.APIbaseUrl+"/churnzero_attribute_list";

  	return this.http.post(path, obj,this.options);

  }

  public ChurnZeroConfig()
  {
    var ChurnZero = ChurnZero || [];
    (function() {
    var cz = document.createElement('script'); cz.type = 'text/javascript';
    cz.async = true;
    cz.src = 'https://analytics.churnzero.net/churnzero.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cz, s);
    })();
    
    
    ChurnZero.push(['setAppKey', 'invw-q7Ivjwby8NI1F6qQcH1Gix0811ja7-Li4_1xWg']); // AppKey from ChurnZero
    ChurnZero.push(['setContact', this.account_id , this.user_email]);

  }

  private socketPushStartSyncNote() {
    this.socket_listener = this.socketService.pushEventWithNewLogic(`homepage-${this.account_id}-${this.user_id}`).subscribe(data => this.processStartSyncNote(data));
  }

  private socketGlobalChanel(){
    this.socketService.pushEventWithNewLogic('global-channel').subscribe(data => {
      if(data.live_video_event == "1"){
      this.updateActivity(data);
      }else if(data.recent_activity_data){
        this.syncStreamStarted(data.recent_activity_data);
      }
    });
  }
/**FOr Recent activities */
  private processStartSyncNote(data) {
    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      switch (data.event) {
        case "sync_note_started":
          this.syncNoteStarted(data.data);
          break;
          default:
          // code...
          break;
      }
    // });
  }
  // 'TÃº'
  private syncNoteStarted(activity_data) {
    activity_data.activityLogs_users = this.translations.you_dashboard;
    activity_data.resource_name = this.translations.started_synced_video_notes_activity;
    this.recent_activities.unshift(activity_data);
  }

  private syncStreamStarted(activity_data){
    
    this.appMainService.check_if_huddle_participant(activity_data.huddle_id,this.user_id).subscribe((data: any) => {
      if(data.result){
        if(activity_data.activityLogs_user_id==this.user_id){
        activity_data.activityLogs_users = this.translations.you_dashboard;
        }
      // activity_data.resource_name = this.translations.live_streaming_started;
      this.recent_activities.unshift(activity_data);
      }
     });
   
  }
/**update live streaming recent activity after saved video */
  private updateActivity(data){
   
  var activity =  this.recent_activities.find(item=>item.item_id =data.item_id);
  if(activity){
    activity.resource_url= `/video_details/home/${data.huddle_id}/${data.item_id}`;
  
    }
 }

}
