import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastyModule } from 'ng2-toasty';
import { ArchwizardModule } from 'angular-archwizard';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { TrialService, DatalinkService } from "./services";

import { RootComponent, HomeComponent, SignupWizardComponent, CustomProgressBarComponent } from "./components";

import { InputValidatorDirective } from "./directives";

export const __IMPORTS = [
  CommonModule,
  ArchwizardModule,
  FormsModule,
  ToastyModule.forRoot(),
  LoadingBarHttpClientModule,
];

export const __DECLARATIONS = [RootComponent, HomeComponent, SignupWizardComponent, CustomProgressBarComponent, InputValidatorDirective];

export const __PROVIDERS = [TrialService, DatalinkService];