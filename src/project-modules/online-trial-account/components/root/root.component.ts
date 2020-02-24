import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";
import { DatalinkService, TrialService } from "@onlineTrialAccount/services";

@Component({
  selector: "online-trial-account-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class RootComponent implements OnInit {
  // private projectTitle: string = 'online_trial';

  constructor(private headerService: HeaderService, private datalayerService: DatalinkService, private trialService: TrialService) {
    // this.headerService.getLanguageTranslation(this.projectTitle).subscribe(() => {
    //   // Update the language_translation for its child project
    // });
    this.datalayerService.SetProperty({
      'event': 'reg_step_1'
    });
  }

  ngOnInit() {
    this.trialService.initSettings();
    let env = window.location.hostname.substring(0, window.location.hostname.indexOf(".")).toUpperCase();

    if (location.protocol != 'https:' && env != "") {
      location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }
  }
}
