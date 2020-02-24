import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  private workspaceVideosList: any = new Subject();
  private participantList: any = new Subject();
  private huddleData:any=new Subject();
  public huddleDataLocalSinglton=[];
  public workspaceVideosListSinglton=[];
  private huddleId:any=0;//new Subject();
   public deleteAlertObject=new BehaviorSubject<any>({});
   public deleteAlertObject$=this.deleteAlertObject.asObservable();

  constructor(private http: HttpClient) { }

  setHuddleId(huddleId){
    // debugger
    // this.huddleId.next(data)
    this.huddleId=huddleId;
  }
  setDeleteObject(obj){
    this.deleteAlertObject.next(obj)
  }
  getHuddleId(){
    return this.huddleId;
  }

  setHuddleData(data){
    this.huddleData.next(data);
    this.huddleDataLocalSinglton=data;
  }
  getHuddleData(){
    return this.huddleData;
  }

  setvideoList(list) {
    this.workspaceVideosList.next(list);
    this.workspaceVideosListSinglton = list;

   }
  getVideoList() {
    return this.workspaceVideosList;
  }


  setParticipantsList(list) {
    this.participantList.next(list);
   }
  getParticipantsList() {
    return this.participantList;
  }
  getHuddleDetails(obj) {
    let url = `${environment.APIbaseUrl}/view_huddle`;
    return this.http.post(url, obj);
  }

  getCommentCount(obj) {
    let url = `${environment.APIbaseUrl}/getCommentCounts`;
    return this.http.post(url, obj);
  }
 
  getWorkspaceVideos(obj) {
    let url = `${environment.APIbaseUrl}/get_workspace_artifects`;
    return this.http.post(url, obj);
  }

  publishAssessment(data: any) {
    let url = `${environment.APIbaseUrl}/publish_assessment_huddle`;
    return this.http.post(url, data);
  }

  
  submitAssignment(data: any) {
    let url = `${environment.APIbaseUrl}/submit_assessment_huddle`;
    return this.http.post(url, data);
  }

  deleteAssessee(data: any) {
    let url = `${environment.APIbaseUrl}/delete_assessee`;
    return this.http.post(url, data);
  }

  getUserArtifects(data: any){
    return this.http.post(`${environment.APIbaseUrl}/get_artifects`, data);
  }

  getUserAvatar(user_id: number, image: string) {
    return (
      (user_id &&
        image &&
        `https://s3.amazonaws.com/sibme.com/static/users/${user_id}/${
          image
        }`) ||
      `${environment.baseUrl}/img/home/photo-default.png`
    );
  }
}
