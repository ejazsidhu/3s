import { Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ObservationService {

  constructor(private http: HttpClient) { }

  public LoadObservationVideo(obj){

  	let path = environment.APIbaseUrl+"/mobile_video";

  	return this.http.post(path, obj,  {
  headers: { ignoreLoadingBar: '' }
});

  }

  public StopScript(obj){
  	
  	let path = environment.APIbaseUrl+"/update_scripted_observation_duration";

  	return this.http.post(path, obj);

  }

  public PublishScript(obj){

  	let path = environment.APIbaseUrl+"/publish_scripted_observation";

  	return this.http.post(path, obj);

  }

}
