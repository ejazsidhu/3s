import { Component, OnInit,Input } from '@angular/core';
import { HeaderService } from "../header.service";

@Component({
  selector: 'impersonation',
  templateUrl: './impersonation.component.html',
  styleUrls: ['./impersonation.component.css']
})
export class ImpersonationComponent implements OnInit {
	public is_visible:boolean;
  public header_data;
  public translation;
  @Input() details;
  constructor(private headerService:HeaderService) { }

  ngOnInit() {
  	this.is_visible = true;
    this.header_data = this.headerService.getStaticHeaderData();
    this.translation = this.header_data.language_translaton;

  }



  public exitImpersonation():void{

  	// debugger;
  	this.is_visible = !this.is_visible;
  }

}
