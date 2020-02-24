import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import {NgControl} from '@angular/forms';
import { TrialService } from '@onlineTrialAccount/services';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[InputValidator]',
  providers: [NgModel]
})
export class InputValidatorDirective implements OnInit {

  @Input() for;
  public translations;

  constructor(private ngControl: NgControl, private el: ElementRef, private trialService: TrialService, private model: NgModel) { }

  ngOnInit() {

    this.translations = this.trialService.GetTranslation();
  }

  @HostListener('ngModelChange', ['$event']) onModelChange(e) {

      if (this.for === 'name') {
      const re = /^(\d)/;
      if (re.test(e)) {
        this.trialService.LogError(this.translations.signup_number_at_begining_not_allowed, 'error');
        setTimeout(() => {
          this.model.viewToModelUpdate('');
          this.model.valueAccessor.writeValue('');
        });

        // this.el.nativeElement.value = '';
      }
    } else if (this.for === 'phone') {

      const isValid = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(e);
      if (!isValid) {

        this.trialService.LogError(this.translations.signup_number_validation, 'error');

        this.model.valueAccessor.writeValue('');
        this.model.viewToModelUpdate('');

      }
    } else if (this.for === 'password') {

      const trimmed = e.trim();

      if (trimmed === '') {

        this.trialService.LogError(this.translations.signup_password_validation, 'error');

      }

    }
   }
   }
// implements Validator
  //  validate(c) {

  //   if (this.for ==='name'){
  //     let re = /^(\d)/;
  //     if(re.test(c.value)) {
  //       return {'pattern': false};
  //     } else {
  //       return {'pattern': true};
  //     }
  //   }
  //   return null;
  //  }


