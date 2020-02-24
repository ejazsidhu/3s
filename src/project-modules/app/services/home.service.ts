import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  public breadcrumbsSource=new BehaviorSubject<any>([]);
  public breadcrumbs$=this.breadcrumbsSource.asObservable();
  


  public updateBreadcrumb(value){
    this.breadcrumbsSource.next(value);
  }

  // public getBreadcrumbSinglton(){
  //   return this.BreadcrumbsSinglton$;
  //     }
 

  constructor(private http:HttpClient) {

  	// console.log("I Came here");

  }

  public UpdateFilter(){

  }
 

  public GetHuddles(data){

  	// page = page || 1;

  	let path = environment.APIbaseUrl + "/get_huddles";

  	return this.http.post(path, data);

  }


  public Move(obj){

    let path = environment.APIbaseUrl + "/move_huddle_folder";

    return this.http.post(path, obj);

  }

  public CreateFolder(obj){

    let path = environment.APIbaseUrl+ "/create_folder";

    return this.http.post(path, obj);

  }

  public GetFolderList(obj){

    let path = environment.APIbaseUrl + "/treeview_detail";

    return this.http.post(path, obj);

  }

  public GetBreadcrumbs(obj){

    let path = environment.APIbaseUrl + "/get_bread_crumb";

    return this.http.post(path, obj);

  }

  public EditFolder(obj){

    let path = environment.APIbaseUrl + "/edit_folder";

    return this.http.post(path, obj);

  }

  public DeleteItem(obj, isFolder){

    let path = (isFolder)? environment.APIbaseUrl + "/delete_folder" : environment.APIbaseUrl + "/delete_huddle";



    return this.http.post(path, obj);

  }

    public getAvatarPath(user){

      if(user.image){
        return environment.imageBaseUrl+"/"+user.user_id+"/"+user.image;
      }else{
         return environment.baseUrl+"/img/home/photo-default.png";
      }

    // if(details.user_current_account.User.image){

    //   return details.avatar_path;

    // } else{
     
    // }
    //

  }

}
