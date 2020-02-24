import { Injectable, EventEmitter } from '@angular/core';
import * as filestack from 'filestack-js';
import { environment } from "@environments/environment";
import { HeaderService } from "@projectModules/app/services";

@Injectable()
export class FilestackService {

	private client;

	public FilesUploaded:EventEmitter<any> = new EventEmitter<any>();

  constructor(private headerService:HeaderService) {
  	

  }

  public InitFileStack(){

		let key = environment.fileStackAPIKey;
	 	this.client = filestack.init(key);
  }

  public showPicker(options){
	 
  	
  	options = options || {};
  	options.storeTo = {
                location: "s3",
                path: this.getUploadPath(),
                access: 'public',
                container: environment.container,
                region: 'us-east-1'
            }
    options.fromSources = ['local_file_system','dropbox','googledrive','box','onedrive']
  	options.onUploadDone =(res)=> {console.log(res);this.FilesUploaded.emit(res.filesUploaded)};
      let sessionData:any = this.headerService.getStaticHeaderData();
      let language = sessionData.language_translation.current_lang;
      options.lang =  language;
  	return this.client.picker(options).open();

  }

  private getUploadPath(){
	let temp = "/tempupload/";

  	let sessionData:any = this.headerService.getStaticHeaderData();

  	let account_id = sessionData.user_current_account.accounts.account_id;

  	temp = temp+account_id;

  	let date = new Date(); 

  	temp+="/"+date.getFullYear()+"/"+this.padNumber(date.getMonth()+1)+"/"+this.padNumber(date.getDate())+"/";

  	return temp;

  }

  private padNumber(n){

  	let number = Number(n);

  	if(number <=9){
  		return "0"+""+number;
  	}else{
  		return n;
  	}

  }


}
