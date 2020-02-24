import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

/**
 * Definitaion: coming soon!
 */

@Injectable()
export class BaseService {

  constructor(private httpClient: HttpClient) { }

  /**
   * 
   * @param path The API endpoint
   * @param ignoreLoadingBar Check for not showing default bar on top of the page
   */
  __get(path: string, ignoreLoadingBar: boolean = false) {

    let requestParams: any = {};
    if (ignoreLoadingBar) requestParams.headers = { 'ignoreLoadingBar': 'true' };

    return this.httpClient.get(path, requestParams);
  }

  /**
   * 
   * @param path The API endpoint
   * @param data Post request data
   * @param ignoreLoadingBar Check for not showing default bar on top of the page
   */
  __post(path: string, data: {}, ignoreLoadingBar: boolean = false) {

    let requestParams: any = {};
    if (ignoreLoadingBar) requestParams.headers = { 'ignoreLoadingBar': 'true' };

    return this.httpClient.post(path, data, requestParams);
  }
}
