import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class TabsService {

  constructor() { }

	private currentTab;
	private FiltersHitCount=0;
	
	@Output() Tabs: EventEmitter<any> = new EventEmitter();

	@Output() FiltersSubmitted: EventEmitter<any> = new EventEmitter();

	public setTab(tab){

		this.currentTab = tab;
		this.Tabs.emit(tab);
	}

	public Submit(){
		this.FiltersSubmitted.emit(++this.FiltersHitCount);
	}

	public GetTab(){

		return this.currentTab;

	}

}
