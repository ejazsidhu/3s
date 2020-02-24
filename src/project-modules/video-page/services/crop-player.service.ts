import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class CropPlayerService {

    // @Output('PlayerPlayingState')
    public PlayerPlayingState:EventEmitter<any> = new EventEmitter<any>();
    public Seek:EventEmitter<any> = new EventEmitter<any>();

    constructor() { }


    public ModifyPlayingState(state){

        this.PlayerPlayingState.emit(state);

    }

    public SeekTo(time , play=1){

        this.Seek.emit({time:time,play:play});

    }


}
