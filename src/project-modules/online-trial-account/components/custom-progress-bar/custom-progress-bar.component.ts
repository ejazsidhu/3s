import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'custom-progress-bar',
  templateUrl: './custom-progress-bar.component.html',
  styleUrls: ['./custom-progress-bar.component.css']
})
export class CustomProgressBarComponent implements OnInit {

	@Input() successClass;
	@Input() currentProgress;
	@Input() defaultClass;
	@Input() total;

  constructor() { }

  ngOnInit() {
  }

  public getItems(){

  	if(!this.total){
  		return new Array(0);
  	}
  	return new Array(this.total);
  }

  public getClass(index, to){

  //	if(!this.total || !this.currentProgress) return "default";
  	let str = to=="c" ? "circle ": "line ";

  	if(to=="c"){
  		if(index <= this.currentProgress) return str+this.successClass;
  	}else{
  		if(index < this.currentProgress) return str+this.successClass;
  	}
  	

  	return str+this.defaultClass;

  }

}
