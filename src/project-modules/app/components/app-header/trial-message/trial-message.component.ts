import { Component, OnInit,Input } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: 'trial-message',
  templateUrl: './trial-message.component.html',
  styleUrls: ['./trial-message.component.css']
})
export class TrialMessageComponent implements OnInit {
public header_data;
public translation;
@Input() details;
  constructor(private headerService:HeaderService) { }

  ngOnInit() {
  	this.headerService.LoggedIn.subscribe((f)=>{

      	if(f){
      		this.header_data = this.headerService.getStaticHeaderData();
      		this.translation = this.header_data.language_translation;
      	}

      })
  }

}
