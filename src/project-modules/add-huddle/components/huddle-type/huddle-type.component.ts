import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'huddle-type',
  templateUrl: './huddle-type.component.html',
  styleUrls: ['./huddle-type.component.css']
})
export class HuddleTypeComponent implements OnInit {

	@Input('data') data;
	@Input('isActive') isActive;
  constructor(private router:Router) { }


  public getToPage(type){

    let str=`/add_huddle_angular/${type.value}`;
    this.router.navigate([str]);
  
  }
  ngOnInit() {
	  
  }

}
