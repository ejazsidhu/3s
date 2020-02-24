import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PeopleHttpService {
  
  public data;
  constructor(private http: HttpClient) { }
  
  httpGetCall(path:string,headers?){
    return this.http.get(path);
  }
  
  httpPutCall(path:string,body,headers?){
    return this.http.put(path,body)
  }

  httpPostCall(path:string,body,header?){
    return this.http.post(path,body)
  }

  httpDeleteCall(path:string,headers?){
    return this.http.delete(path);
  }
}
