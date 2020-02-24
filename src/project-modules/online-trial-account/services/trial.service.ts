import { HttpClient } from '@angular/common/http';
import { Injectable , EventEmitter , Output} from '@angular/core';
import { ToastData, ToastOptions, ToastyConfig, ToastyService } from 'ng2-toasty';
import { environment } from '@environments/environment';


@Injectable()
export class TrialService {

  private UserData;
  private translation;
  public current_lang = "en";
  @Output() public languageLoaded: EventEmitter<boolean> = new EventEmitter();
  constructor(private http: HttpClient, private toastyService: ToastyService, private toastyConfig: ToastyConfig) {
    this.UserData = {};
    this.toastyConfig.theme = 'bootstrap';
  }

  public SetTranslation(translation){

    this.translation = translation;

  }

    public GetTranslation(){
    return this.translation;
  }

  public Set(key, value) {
    this.UserData[key] = value;
  }

  public Get(key?) {

    return key ? this.UserData[key] : this.UserData;

  }

  public Unset(key) {

    delete this.UserData[key];

  }

  public validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public RequestSignup() {

    const path = environment.APIbaseUrl + '/trial_signup';
    this.UserData.current_lang = this.current_lang;
    return this.http.post(path, this.UserData,{headers:{'current-lang':this.current_lang}});

  }

  public LogError(message, type?) {
    const toastOptions: ToastOptions = {
      title: 'Alert',
      msg: message,
      showClose: true,
      timeout: 5000,
      theme: 'bootstrap',
      onAdd: (toast: ToastData) => {
        // console.log('Toast ' + toast.id + ' has been added!');
      },
      onRemove: function (toast: ToastData) {
        // console.log('Toast ' + toast.id + ' has been removed!');
      }
    };

    switch (type) {
      case 'error':
        this.toastyService.error(toastOptions);
        break;
      case 'success':
        this.toastyService.success(toastOptions);
        break;

      default:
        this.toastyService.default(toastOptions);
        break;
    }
  }

  public VerifyEmailUnique(email) {

    const path = environment.APIbaseUrl + '/email_existance';

    return this.http.post(path, { email: email });

  }

  public GetRoles() {

    const path = environment.APIbaseUrl + '/checkbox_options';
    return this.http.post(path, {current_lang:this.current_lang});

  }

  public setLang(lang)
  {
    this.current_lang = lang;
  }

  public RequstResendEmail(link) {

    // const path = environment.APIbaseUrl + '/resend_link';

    return this.http.get(link, {});

  }

  public Notify(){
    let module_title = 'online_trial';
    let path = environment.baseHeaderUrl + `/get_translation_settings/${module_title}`

    return this.http.get(path);
  }
    public initSettings(){
        let path = environment.APIbaseUrl + "/get_language_from_lumen";
        this.http.get(path, {}).subscribe(data =>{
            console.log(data);
          let path2 = environment.baseUrl + "/app/session_update_lumen_side";
            this.http.post(path2, data).subscribe(result=>{
              this.languageLoaded.emit(true);
              console.log(result);
            });
        });

    }
}
