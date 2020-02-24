import { Component, OnInit,Input } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";

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
  constructor(private headerSevice:HeaderService) { }

  ngOnInit() {
  	this.is_visible = true;
    this.header_data = this.headerSevice.getStaticHeaderData();
    this.translation = this.header_data.language_translation;
  }



  public exitImpersonation():void{

  	;
  	this.is_visible = !this.is_visible;
  }

}
