import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild } from '@angular/core';
import { WizardComponent } from 'angular-archwizard';
import * as _ from 'underscore';

import { TrialService, DatalinkService } from '@onlineTrialAccount/services';
import { environment } from '@environments/environment';

@Component({
  selector: 'signup-wizard',
  templateUrl: './signup-wizard.component.html',
  styleUrls: ['./signup-wizard.component.css']
})

export class SignupWizardComponent implements OnInit, OnChanges {

  public translations;
  public progress: number;
  public userDetails;
  public Roles;
  public currentReasons;
  public reasons: any[] = [];
  public intentions: any[] = [];
  public bar_progress;
  public intentions_array = [];
  public resend_link;
  public links;
  public reasonToJoin;
  public intentionToJoin;
  public allow_trial: boolean;
  private readonlies: any = {};

  @ViewChild('wizard', { static: false }) wizard: WizardComponent;

  @Input() userInfo;

  constructor(private trialService: TrialService, private datalayerService: DatalinkService) { }

  ngOnChanges(c: SimpleChanges) {
    // 	console.log(c);
  }

  ngOnInit() {

    this.translations = this.trialService.GetTranslation();
    this.progress = 1;
    this.userInfo.current_role = '';
    this.GetOptions();
    this.userInfo.about = {};
    this.userInfo.password = {};
    this.bar_progress = 0;
    this.allow_trial = true;
    this.intentions_array = [
      this.translations.signup_select_enhance,
      this.translations.signup_select_develop,
      this.translations.signup_select_enhance_profession,
      this.translations.signup_select_virtually_coach,
      this.translations.signup_select_professional_collaboration,
      this.translations.signup_select_assess_performance,
      this.translations.signup_select_create_best,
      this.translations.signup_select_other
    ];
    this.reasonToJoin = "";
    this.resend_link = environment.baseUrl;
    this.links = {};
    this.links.terms = environment.appUrl + "/terms-of-service/";
    this.links.privacy_policy = environment.appUrl + "/privacy-policy/";
    this.intentionToJoin = "";
  }

  private GetOptions() {

    this.trialService.GetRoles().subscribe((data: any) => {

      this.Roles = data;

    });

  }

  public getProgress(ev) {

    if (ev >= 0) {
      //      console.log(ev);
      this.bar_progress = ev;
    }

  }

  public GoBackHome() {

    this.progress = 1;
    this.wizard.navigation.goToPreviousStep();

  }

  public onIntentionChange(flag, index) {

    const len = this.intentions.filter((i) => i).length;

    if (len === 1) {
      return;

    } else if (len > 0) {

      this.intentions.forEach((i, _index) => { if (index !== _index) { this.intentions[_index] = false; } });

    }
  }

  public check_all_intentions(flag) {

    for (let i = 0; i < 7; i++) {
      this.intentions[i] = flag === 1;
    }

  }

  public get_selected_intentions_count() {

    return this.intentions.filter((i) => i).length;
  }

  public MoveProgress(from) {

    if (from === '1.0') {

      if (!this.userInfo.current_role) {
        this.trialService.LogError(this.translations.signup_select_role, 'success');
      } else {

        const selectedRole = _.findWhere(this.Roles, { role_id: Number(this.userInfo.current_role) });

        this.trialService.Set('role_id', this.userInfo.current_role);

        this.trialService.Set('current_role', this.userInfo.current_role);

        // if(void 0 === this.readonlies.role_name){

        this.readonlies.role_name = selectedRole.role_name;

        // }

        let email = this.trialService.Get("email");

        this.datalayerService.SetProperty({
          'eadd': email,
          'role': selectedRole.role_name,
          'event': 'reg_step_3'
        })

        if (Array.isArray(selectedRole.why_signup_options) && selectedRole.why_signup_options.length > 0) {

          this.progress = 1.1;
          this.currentReasons = selectedRole.why_signup_options;

        } else {

          // this.progress = 1.2;
          this.trialService.Set('why_signup', '');
          this.wizard.navigation.goToNextStep();

        }

      }

    } else if (from === '1.1') {

      // const reasons = this.currentReasons.filter((r, i) => {

      //   return this.reasons[i];

      // });

      // if (this.userInfo.other_reason) {
      //   // EARLIER: && this.userInfo.other_reason_text
      //   // reasons.push(this.userInfo.other_reason_text);
      //   reasons.push('Other');
      // }



      if (!this.reasonToJoin) {

        this.trialService.LogError(this.translations.signup_choose_reason, 'error');
        return;
      }
      this.trialService.Set('why_signup', this.reasonToJoin);

      if (this.reasonToJoin == this.currentReasons[1] || this.reasonToJoin == this.currentReasons[2]) {
        this.progress = 1.2;
      } else {
        this.wizard.navigation.goToNextStep();
      }



    } else if (from === 2) {

      if (this.userInfo.about.phone) {

        const isValid = /^[0-9\-\+]*$/im.test(this.userInfo.about.phone);

        if (!isValid) {
          ;
          this.trialService.LogError(this.translations.signup_correct_phone, 'error');

          return;
        }


      }

      if (!(this.userInfo.about.company) || !(this.userInfo.about.full_name)) {

        this.trialService.LogError(this.translations.signup_company_name, 'error');

        return;
      }

      for (const k in this.userInfo.about) {

        if (this.userInfo.about[k]) {
          this.trialService.Set(k, this.userInfo.about[k]);
        }

      }

      let [eadd, role, event] = [this.trialService.Get("email"), this.readonlies.role_name, "reg_step_4"];
      let obj: any = {
        eadd,
        role,
        event
      };

      ({
        company: obj["company"],
        full_name: obj.wname,
        jobtitle: obj.title,
        phone: obj.number
      } = this.userInfo.about);

      this.datalayerService.SetProperty(obj);

      // if(void 0 === this.readonlies.step_4){

      this.readonlies.step_4 = obj;

      // }

      this.wizard.navigation.goToNextStep();

    } else if (from === 3) {

      const trimmed = this.userInfo.password.password.trim();

      if (trimmed === '' || !trimmed) {

        this.trialService.LogError(this.translations.signup_valid_password, 'error');
        return;
      }

      if (this.userInfo.password.password === this.userInfo.password.password_confirmation && this.userInfo.password.password.length >= 8) {

        this.trialService.Set('password', this.userInfo.password.password);
        this.trialService.Set('password_confirmation', this.userInfo.password.password_confirmation);

        let obj = JSON.parse(JSON.stringify(this.readonlies.step_4));

        obj.event = "reg_step_5";

        this.datalayerService.SetProperty(obj);

        this.wizard.navigation.goToNextStep();

      }
      if (this.userInfo.password.password.length < 8) {

        this.AlertError(this.translations.signup_pwd_min_char_limit);

      } else if (this.userInfo.password.password !== this.userInfo.password.password_confirmation) {

        this.AlertError(this.translations.signup_cnf_match_pwd);

      }

    } else if (from === 4) {
      // const arr = this.intentions_array.filter((i, ind) => this.intentions[ind]);

      if (!this.intentionToJoin) {

        this.trialService.LogError(this.translations.signup_select_at_least_one_choice, 'error');
        return;

      }

      // if(this.userInfo.other_intention){
      //   // arr.push(this.intentions[7]);
      //   arr.push("Other");
      // }
      this.trialService.Set('how_do_you_intend_to_use_', this.intentionToJoin);

      let obj = JSON.parse(JSON.stringify(this.readonlies.step_4));

      ({ e: obj.event, primary_use: obj["primary-use"] } = { e: "reg_step_6", primary_use: this.intentionToJoin });

      // if(void 0 === this.readonlies.step_6){

      this.readonlies.step_6 = obj;

      //}

      this.datalayerService.SetProperty(obj);

      this.wizard.navigation.goToNextStep();

    }

  }

  public StartTrial() {

    this.allow_trial = false;

    let obj: any = this.readonlies.step_6;

    let [email_var, name_var] = ["ceadd", "cname"];

    [obj.event, obj[name_var], obj[email_var]] = ["reg_confirm", "", ""];

    if (this.userInfo.colleague_email) {

      let user_email = this.trialService.Get("email");

      if (this.userInfo.colleague_email == user_email) {

        this.AlertError(this.translations.signup_colg_same_email);
        this.allow_trial = true;
        return;
      }

      if (this.trialService.validateEmail(this.userInfo.colleague_email)) {

        this.trialService.Set('colleague_email', this.userInfo.colleague_email);

        obj[email_var] = this.userInfo.colleague_email;

      } else {
        this.AlertError(this.translations.signup_colg_valid_email);
        this.allow_trial = true;
        return;
      }

    }

    if (this.userInfo.colleague_name) {
      this.trialService.Set('colleague_name', this.userInfo.colleague_name);
      obj[name_var] = this.userInfo.colleague_name;
    }

    this.datalayerService.SetProperty(obj);

    this.trialService.RequestSignup().subscribe((data: any) => {

      this.allow_trial = true;
      if (data.success) {
        this.progress = 2;
        this.resend_link = environment.APIbaseUrl + '/' + data.resend_link;
      } else {
        if (data.response != undefined && data.response.status == "error") {
          for (let vResult of data.response.validationResults) {
            if (vResult.isValid === false) {
              this.trialService.LogError(vResult.message, 'error');
            }
          }
        }
        return;
      }

    });

  }

  public ResendActivationLink() {

    // location.href = this.resend_link;
    this.trialService.RequstResendEmail(this.resend_link).subscribe((data: any) => {

      if (data.status) {

        this.trialService.LogError(this.translations.signup_activation_link_resent, 'success');

      } else {

        this.trialService.LogError(this.translations.something_went_wrong_msg, 'error');

      }

    },
      (err) => {

        this.trialService.LogError(this.translations.something_went_wrong_msg, 'error');

      });

  }

  public AlertError(msg) {

    if (!msg) {
      this.trialService.LogError(this.translations.signup_name_account_name, 'error');
    } else {
      this.trialService.LogError(msg, 'error');
    }
  }

  public MoveToLogin() {

    const path = environment.baseUrl + '/users/login';
    // window.open(path);
    location.href = path;

  }

}
