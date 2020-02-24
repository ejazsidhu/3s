import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environments/environment';
import {BehaviorSubject, Observable} from 'rxjs';
import {debug} from 'util';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  constructor(private http: HttpClient) {

  }

  

  public GetUserSettings(userObj) {
    let path = environment.APIbaseUrl + '/get_user_settings';
    return this.http.post(path, userObj);
  }
  public updateUser(userObj) {
    let path = environment.APIbaseUrl + '/update_user_settings';
    return this.http.post(path, userObj);
  }

  public uploadImage(image) {
    let path = environment.APIbaseUrl + '/upload_user_settings_image';
    return this.http.post(path, image);
  }
  public updateHeaderData(image) {
    let obj = {image_name: image};
    let path = environment.appPath + '/api/update_user_image_in_session';
    return this.http.post(path, obj);
  }
  public updateHeaderSession() {
    let obj = {};
    let path = environment.appPath + '/api/update_session_from_lumen';
    return this.http.post(path,obj);
  }

}
