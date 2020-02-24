import { Component, OnInit, Input } from '@angular/core';

import { HeaderService } from "@projectModules/app/services";
import { MainService } from '@addHuddle/services';
@Component({
  selector: 'coaching-huddle',
  templateUrl: './coaching-huddle.component.html',
  styleUrls: ['./coaching-huddle.component.css']
})
export class CoachingHuddleComponent implements OnInit {


	@Input("users") users ;

	constructor( private mainService: MainService, private headerService: HeaderService ) { }

  ngOnInit() {

  }

	public removeUser(user){

		this.mainService.DeleteUser(user);

	}

}
