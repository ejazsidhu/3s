import { Component, OnInit, Input } from '@angular/core';
import {HeaderService} from "../header.service";

@Component({
  selector: 'account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.css']
})

export class AccountInformationComponent implements OnInit {

	@Input() public details;
    public translations;
    constructor(private headerService: HeaderService) { }

  ngOnInit() {
      let data = this.headerService.getStaticHeaderData();
      this.translations = data.language_translation;
  }

  public change_account():void{

  	console.log("Change triggered");

  }


}
