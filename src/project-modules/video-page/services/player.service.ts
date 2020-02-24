import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PlayerService {

  // @Output('PlayerPlayingState') 
  public PlayerPlayingState: EventEmitter<any> = new EventEmitter<any>();
  public Seek: EventEmitter<any> = new EventEmitter<any>();

  private videoCommentPlaySource = new Subject<any>();
  public videoCommentPlay$ = this.videoCommentPlaySource.asObservable();

  constructor() { }

  public ModifyPlayingState(state) {
    this.PlayerPlayingState.emit(state);
  }

  public SeekTo(comment) {
    this.Seek.emit(comment);
  }

  public toggleVideoCommentPlay(data: any) {
    this.videoCommentPlaySource.next(data);
  }

}
