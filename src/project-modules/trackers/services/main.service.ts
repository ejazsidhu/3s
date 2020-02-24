import { Injectable, EventEmitter, Output } from '@angular/core';
import  { HttpClient } from "@angular/common/http";

import { HeaderService } from "@projectModules/app/services";

import { environment } from "@environments/environment";

@Injectable()
export class MainService {

	private options: options = {};

	@Output() users:EventEmitter<any> = new EventEmitter<any>();
	@Output() DeletedUser: EventEmitter<any> = new EventEmitter<any>();
	@Output() MoreSettings: EventEmitter<any> = new EventEmitter<any>();
	@Output() EditMode: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(private http: HttpClient, private headerService: HeaderService) { }

  public EmitUsers(users){

	  this.users.emit(users);

  }

  public UpdateFilter(key, value){

	  this.options[key] = value;

  }

	public DeleteFilter(key):void{

		if (this.options[key]){
			delete this.options[key];
		}

	}

	public GetFilter(key){

		return this.options[key];
	}

	public getFilters(){

		return this.options;
	
	}

	public getUsers(obj){

		let path = environment.APIbaseUrl + "/get_all_users";
		return this.http.post(path, obj);
	}

	public DeleteUser(user_id){

		this.DeletedUser.emit(user_id);

	}

	public PublishMoreSettings(settings:any){

		this.MoreSettings.emit(settings);

	}

	public validate_form(curent_array, validate_params) {

	if (typeof (curent_array) == 'undefined')
		return false;

	if (typeof (validate_params) == 'undefined')
		return true;

	var response = [];

	for (var i = 0; i < validate_params.length; i++) {

		if (typeof (curent_array[validate_params[i]]) == 'undefined' || curent_array[validate_params[i]] == '' || curent_array[validate_params[i]] == null)
			return false;

	}

	return true;

}

	public GetFrameworks(){

		let sessionData;

		sessionData = this.headerService.getStaticHeaderData();

		let account_id = sessionData.user_current_account.accounts.account_id;

		let path = environment.APIbaseUrl + "/get_frameworks_list/" + account_id;

		return this.http.get(path);

	}

	public AddHuddle(obj) {

		let path = environment.APIbaseUrl + '/create_huddle';

		return this.http.post(path, obj);
	}

	public EditHuddle(obj) {

		let path = environment.APIbaseUrl + '/edit_huddle';

		return this.http.post(path, obj);
	}

	public GetGroupDetails(group_id){

		let sessionData;

		let path = environment.APIbaseUrl+"/get_group_details";

		sessionData = this.headerService.getStaticHeaderData();

		let obj = {
			account_id: sessionData.user_current_account.accounts.account_id,
			group_id : group_id
		};

		return this.http.post(path, obj);

	}

	public GetEditableHuddle(id) {

	let path = environment.APIbaseUrl + "/edit_huddle_start";

	let sessionData;

	sessionData = this.headerService.getStaticHeaderData();
	
	let data = { huddle_id: id, user_current_account: sessionData.user_current_account };
 
	return this.http.post(path, data);

}
	
	public EmitEditMode(flag){

		this.EditMode.emit(flag);

	}

	public GetUserGlobalPermissions(){

		let that = this;

		let sessionData:any = that.headerService.getStaticHeaderData();

		if(sessionData){

			let path = environment.APIbaseUrl+"/check_huddle_create_persmission";
			return that.http.post(path, sessionData);
				
		}
			

	} 


	public GetCoachingHuddleName(obj){

		let path = environment.APIbaseUrl+"/get_coaching_huddle_name";

		return this.http.post(path, obj);

	}

}

interface options{
	[key:string]: any
}