import {Component, ElementRef, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {UserSettingsService} from '@projectModules/dashboard/settings/user-settings/services/user-settings.service';
import {HeaderService} from '@app/services';
import {HttpClient} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit, OnDestroy {


  public userSettings: any = {};
  public email_unsubscribers: any = {};
  public header_data;
  public translation;
  public account_id;
  public user_id;
  public user_current_account;
  public userObject: any;
  public userAccount;
  public password = '';
  public confirm_password = '';
  public username = '';
  public email = '';
  public url = '';
  public body = new FormData();
  public skelton_loading: boolean = true;
  public translations: any = {};
  private projectTitle: string = 'user_settings';
  private subscription: Subscription;
  private popup = false;
  @ViewChild('photo', {static: false}) photo: ElementRef;
  public isChecked: boolean;
  public firstName = '';
  public lastName = '';
  public currentAccount: any = {};


  constructor(public userSettingsService: UserSettingsService,
              private headerService: HeaderService, private http: HttpClient,
              private toastr: ToastrService) {
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation;
    this.userObject = {
      account_id: this.header_data.user_current_account.users_accounts.account_id,
      user_id: this.header_data.user_current_account.users_accounts.user_id,
      user_current_account: this.header_data.user_current_account,
      user_accounts: this.header_data.user_accounts
    };

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
    this.getUserSettings();
  }

  getUserSettings() {
    this.userSettingsService.GetUserSettings(this.userObject).subscribe((data: any) => {
        this.userSettings = data;
        this.username = this.userSettings.user.username;
        this.email = this.userSettings.user.email;
        let email_unsubscribers = this.userSettings.email_unsubscribers.filter((item) => item.account_name == this.header_data.user_permissions.accounts.company_name);
        this.email_unsubscribers = email_unsubscribers[0];
        this.userAccount = this.header_data.user_permissions.accounts.company_name;
        this.getImage();
        this.headerService.userImageSubject.next(this.url);
        this.headerService.userFirstNameSubject.next(this.userSettings.user.first_name);
        this.headerService.userLastNameSubject.next(this.userSettings.user.last_name);
        this.headerService.userEmailSubject.next(this.userSettings.user.email);
        this.skelton_loading = false;
        this.firstName = this.userSettings.user.first_name;
        this.lastName = this.userSettings.user.last_name;
        this.currentAccount = this.header_data.user_current_account.accounts.company_name;
        this.updateButtonOnLoad(this.currentAccount);
      }
    );
  }

  updateButton(accountName: any) {
    this.userSettings.email_unsubscribers.forEach((item) => {
      if (item.account_name === accountName) {
        item.unsubscribers.forEach((item2) => {
          this.isChecked = item2.status == 'checked';
        });
      }
    });
  }

  updateButtonOnLoad(accountName: any) {
    this.userSettings.email_unsubscribers.forEach((item) => {
      if (item.account_name === accountName) {
        item.unsubscribers.forEach((item2) => {
          this.isChecked = item2.status == 'checked';
        });
      }
    });
  }

  showSubscribers(account: any) {
    console.log(account.target.value);
    let email_unsubscribers = this.userSettings.email_unsubscribers.filter((item) => item.account_name == account.target.value);
    console.log(this.userSettings.email_unsubscribers.indexOf(email_unsubscribers));
    this.email_unsubscribers = email_unsubscribers[0];


  }

  getImage() {
    if (this.userSettings.user.image != null) {
      this.url = 'https://s3.amazonaws.com/sibme.com/static/users/' + this.userObject.user_id + '/' + this.userSettings.user.image;
    }
  }

   updateSubscribers(e, account_name, id) {
    this.userSettings.email_unsubscribers.forEach((item) => {
      if (item.account_name === account_name) {
        item.unsubscribers.forEach((item2) => {
          if (item2.id === id) {
            if (e.target.checked) {
              item2.status = 'checked';
              this.isChecked = true;
            } else {
              item2.status = 'unchecked';
              this.isChecked = false;
            }
          }
        });
      }
    });
  }

  subscribeAll(account_name: any) {
    const checks = document.getElementsByName('checks');
    this.userSettings.email_unsubscribers.forEach((item) => {
      if (item.account_name === account_name) {
        item.unsubscribers.forEach((item2) => {
          if (checks) {
            item2.status = 'checked';
            this.isChecked = true;
          } else {
            item2.status = 'unchecked';
            this.isChecked = false;
          }
        });
      }
    });
  }

  unsubscribeAll(account_name: any) {
    const checks = document.getElementsByName('checks');
    this.userSettings.email_unsubscribers.forEach((item) => {
      if (item.account_name === account_name) {
        item.unsubscribers.forEach((item2) => {
          if (checks) {
            item2.status = 'unchecked';
            this.isChecked = false;
          } else {
            item2.status = 'checked';
            this.isChecked = true;
          }
        });
      }
    });
  }

  update() {
    // console.log("first name:",this.userSettings.user.first_name);

    let updatedUser = {
      user_id: this.userObject.user_id,
      first_name: this.userSettings.user.first_name.trim(),
      last_name: this.userSettings.user.last_name.trim(),
      username: this.userSettings.user.username.trim(),
      title: this.userSettings.user.title ? this.userSettings.user.title.trim():this.userSettings.user.title,
      email: this.userSettings.user.email.trim(),
      lang: this.userSettings.user.lang,
      institution_id: this.userSettings.user.institution_id ? this.userSettings.user.institution_id.trim() : this.userSettings.user.institution_id,
      password: this.password,
      confirm_password: this.confirm_password,
      email_subscribers: this.userSettings.email_unsubscribers
    };
    console.log(updatedUser)

    if (updatedUser.first_name == '') {
      this.toastr.info(this.translations.first_name_cant_empty);
    }
    else if (updatedUser.last_name == '') {
      this.toastr.info(this.translations.last_name_cant_empty);
      
    }
    else if (updatedUser.username == '') {
      this.toastr.info(this.translations.user_name_cant_empty);
    }
    else 
    {
    this.userSettingsService.updateUser(updatedUser).subscribe((data: any) => {
      this.getUserSettings();
      if (data.success == false) {
        if (updatedUser.confirm_password == '' && updatedUser.password != '') 
        {
        this.toastr.info(this.translations.confirm_password_cant_empty);
        } 
       else if (updatedUser.password == '' && updatedUser.confirm_password != '') 
        {
        this.toastr.info(this.translations.new_password_cant_empty);
        } 
        
        else 
        {
        this.toastr.info(data.message);
        }
      } else {
        this.userSettingsService.updateHeaderSession().subscribe((data) => {
          console.log('success');
          this.password = '';
          this.confirm_password = '';
        });
        this.toastr.success(this.translations.user_profile_updated_us);
      }
    }, error1 => {
      console.log(error1);
    });
    }
  }

  onFileChanged(files: FileList) {
    let fileToUpload: File = files.item(0);
    this.body.append('image', fileToUpload, fileToUpload.name);
    this.body.append('user_id', this.userObject.user_id);
    // this.http.post('https://q22api.sibme.com/upload_user_settings_image', body)
    //   .subscribe(res => {
    //     console.log(res);
    //     alert('SUCCESS !!');
    //   });
  }

  onUpload() {
    this.userSettingsService.uploadImage(this.body).subscribe((data: any) => {
      this.toastr.success(this.translations.image_upload_successfully);
      this.getUserSettings();
      this.reset();
      this.popup = false;
      this.updateHeaderImage(data.image);
    }, error1 => {
      console.log(error1);
    });
  }

  updateHeaderImage(image) {
    this.userSettingsService.updateHeaderData(image).subscribe((data) => {
    }, error1 => {
      console.log(error1);
    });
  }

  showPopup() {
    this.popup = !this.popup;
  }

  reset() {
    this.photo.nativeElement.value = '';
    this.showPopup();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
