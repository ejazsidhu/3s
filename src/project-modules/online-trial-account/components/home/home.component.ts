import { Component, OnInit } from '@angular/core';
import { TrialService, DatalinkService } from "@onlineTrialAccount/services";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	public isProcessStarted:boolean;
	public userInfo: UserDetails;
  public translations;

  constructor(private trialService:TrialService, private datalayerService: DatalinkService) { }

  ngOnInit() {
    this.trialService.languageLoaded.subscribe(data => {
        this.notify();
    });
  	this.isProcessStarted = false;
    this.userInfo = {} as UserDetails;
  }

  public notify(){

    this.trialService.Notify().subscribe((data:any)=>{
      this.trialService.SetTranslation(data);
      this.translations = data;
      this.trialService.setLang(data.current_lang);
    });

  }

  public async GetStarted(){

    if(this.trialService.validateEmail(this.userInfo.email)){

      this.trialService.Set("email", this.userInfo.email);

      let exists:any = await this.trialService.VerifyEmailUnique(this.userInfo.email).subscribe((exists:any)=>{

        if(exists.status){
        this.isProcessStarted = true;
        this.datalayerService.SetProperty({
            "eadd" : this.userInfo.email,
            'event' : 'reg_step_2'
          });
      }else{
        this.trialService.LogError(this.translations.signup_already_exist_msg, "error");
      }

      }, (err)=>{
        this.trialService.LogError(this.translations.signup_error_in_request, "error");
      });



    } else {

      this.trialService.LogError(this.translations.signup_valid_email, 'error');

    }

  }

}


interface UserDetails{

   email: string,
   current_role: string

}
