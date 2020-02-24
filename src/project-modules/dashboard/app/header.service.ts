import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable } from "rxjs";
import { NgModule } from "@angular/core";
import { environment } from '@src/environments/environment';
// import { environment } from "../environments/environment";


@NgModule({
 
  providers: [
  HttpClient
  ]
})

@Injectable()
export class HeaderService {

  @Output() public LoggedIn: EventEmitter<boolean> = new EventEmitter();
  @Output() public current_lang: EventEmitter<boolean> = new EventEmitter();

  private data: any;

  constructor(private http: HttpClient) {

   }



  public loadData(path){



  	return this.http.get<headerData[]>(path, {headers: { ignoreLoadingBar: '' }})
  	.pipe(
      tap (
      data => { this.data = data; this.UpdateLoggedInStatus(data);}
      	)
    );
  }

  private UpdateLoggedInStatus(data){

    this.LoggedIn.emit(data.status);
    if(data.language_translation){
      this.current_lang.emit(data.language_translation.current_lang);

    }
    
  }

  public getStaticHeaderData(){

    return this.data;

  }

  public getHeaderData(path){ //expected: path
   // let data: headerData;
    // this.data = (<any>window).header_data;

   // return of(this.data);

  	//if(!this.data){

  	//	return this.loadData();
  		 return this.loadData(path);//.subscribe((data) => {this.data=data;this.getHeaderData()})

  //	}else{
  		//return of(this.data);
  //		console.log("presaved");
  //		return of(this.data);
  //	}

  }

}

export interface headerData extends Window{

	[x:string]:any

}
