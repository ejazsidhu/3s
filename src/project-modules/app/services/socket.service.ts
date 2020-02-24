import { Injectable, EventEmitter } from '@angular/core';
import oEcho from 'laravel-echo';
import io from 'socket.io-client';
import * as _ from "underscore";
import { environment } from "@environments/environment";
import { BehaviorSubject, Observable } from 'rxjs';


declare global {
  interface Window { io: any; }
  interface Window { Echo: any; }
}

declare var Echo: any;

window.io = io;
window.Echo = window.Echo || {};

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private eventDataSource = new BehaviorSubject<any>({});
  public EventData = this.eventDataSource.asObservable();

  private config: any = {
    broadcaster: 'socket.io',
    host: 'https://echo.sibme.com:6001'
  }

  constructor() {
    window.Echo = new oEcho(this.config);
  }

  public pushEvent(name, event = "BroadcastSibmeEvent") {

    if (!_.contains(environment.channelsArr, name)) {
      environment.channelsArr.push(name);
      window.Echo.channel(name).listen(event, (data) => {
        setTimeout(() => {
          this.eventDataSource.next(data);
          console.log('From laravel echo - channel: ', name, 'event: ', data.event);
        }, 500);
      });
    }

  }

  public pushEventWithNewLogic(name, event = "BroadcastSibmeEvent") {

    return new Observable<any>(observer => {

      if (!_.contains(environment.channelsArr, name)) {
        environment.channelsArr.push(name);
      }

      window.Echo.channel(name).listen(event, (data) => {
        observer.next(data)
        console.log('From laravel echo - channel: ', name, 'event: ', data.event);
      });
    });

  }

  public destroyEvent(name, event = "BroadcastSibmeEvent") {
    // window.Echo.channel(name).stopListening(event);
  }

}
