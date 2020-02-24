import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  constructor(private http:HttpClient) { }


  public resetPassword(data){

  	// page = page || 1;

  	let path = environment.APIbaseUrl + "/change_password";

  	return this.http.post(path, data);

  }
}
