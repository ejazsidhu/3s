import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
	private Session;

  	constructor() {

  		this.Session = (window as any).sessionStorage;

  	}


  	public SetItem(key, value){

  		return this.Session.setItem(key, value);

  	}

  	public GetSession(){

  		return this.Session;//.getItem(keys);

  	}

  	public GetItem(key){

  		return this.Session.getItem(key);

  	}

  	// public Destroy(){

  	// 	return this.Session.clear();

  	// }
  



}
