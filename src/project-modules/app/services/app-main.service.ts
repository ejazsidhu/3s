import {EventEmitter, Injectable} from '@angular/core';

import { environment } from "@environments/environment";
import { BaseService } from "./base.service";
import { ViewerHistory, PublishSetting, PLTabData } from "@app/interfaces";

/**
 * Definition: coming soon!
 */

@Injectable({
  providedIn: 'root'
})
export class AppMainService {

  private APIbaseUrl: string = environment.APIbaseUrl;
  private baseUrl = environment.baseUrl;
  public LiveStreamPage: EventEmitter<any> = new EventEmitter<any>();

  /** Store audio extensions which are playable by current browser. It would be a singleton array which will be detected on app load 
   *  and will be used to play audio or show transcoding message based on this array 
   */
  public playableAudioExtensions: string[];

  constructor(private baseService: BaseService) { }

  public sysRefreash() {
    return this.baseService.__get(`${this.baseUrl}/Huddles/sysRefreash?json_response=true`, true);
  }

  /** Section for video page API's start */

  public AddComment(data: object) {
    return this.baseService.__post(`${this.APIbaseUrl}/add_comment`, data, true);
  }
  public AddDiscussion(data: object) {
    return this.baseService.__post(`${this.APIbaseUrl}/add_discussion`, data, true);
  }
  public DeleteDiscussion(data: any) {
    return this.baseService.__post(`${this.APIbaseUrl}/delete_discussion`, data, true);
  }

  public EditComment(data: object) {
    return this.baseService.__post(`${this.APIbaseUrl}/edit_comment`, data, true);
  }

  public DeleteComment(data: object) {
    return this.baseService.__post(`${this.APIbaseUrl}/delete_comment`, data, true);
  }

  public AddReply(data: object) {
    return this.baseService.__post(`${this.APIbaseUrl}/add_reply`, data, true);
  }

  public LogViewerHistory(data: ViewerHistory) {
    return this.baseService.__post(`${this.baseUrl}/app/add_viewer_history`, data, true);
  }

  public GetPublishSettings(data: PublishSetting) {
    return this.baseService.__post(`${this.APIbaseUrl}/show_publish_button_or_not`, data, true);
  }

  public GetPLTabData(data: PLTabData) {
    return this.baseService.__post(`${this.APIbaseUrl}/performace_level_update`, data, true);
  }

  public UploadResource(data: object) {
    return this.baseService.__post(`${this.APIbaseUrl}/upload_document`, data, true);
  }

  public check_if_huddle_participant(huddle_id,user_id) {
    return this.baseService.__post(`${environment.baseHeaderUrl}/check_if_huddle_participant/${huddle_id}/${user_id}`, {}, true);
  }

  /** Section for video page API's end */

}
