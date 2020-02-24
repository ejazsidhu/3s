import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

import { BreadCrumbInterface, CommentTypingSettingsInterface } from "@videoPage/interfaces";

@Injectable()
export class VideoPageService {

    private breadCrumbSource = new Subject<BreadCrumbInterface[]>();
    public breadCrumb$ = this.breadCrumbSource.asObservable();

    private commentTypingSettingsSource = new BehaviorSubject<CommentTypingSettingsInterface>({ PauseWhileTyping: true, EnterToPost: true });
    public commentTypingSettings$ = this.commentTypingSettingsSource.asObservable();
    public commentTypingSettingsCurrentValue = this.commentTypingSettingsSource.getValue();

    private currentTabSource = new Subject<number>();
    // private currentTabSource = new BehaviorSubject<number>(0);
    public currentTab$ = this.currentTabSource.asObservable();

    private videoCurrentTimeSource = new BehaviorSubject<number>(0);
    public videoCurrentTime$ = this.videoCurrentTimeSource.asObservable();

    constructor() { }

    updateBreadCrumb(breadCrumbs: BreadCrumbInterface[]) {
        this.breadCrumbSource.next(breadCrumbs);
    }

    updateCommentTypingSettings(commentTypingSettings: CommentTypingSettingsInterface) {
        this.commentTypingSettingsSource.next(commentTypingSettings);
    }

    updateCurrentTab(currentTab: number) {
        this.currentTabSource.next(currentTab);
    }

    updateVideoCurrentTime(currentTime: number) {
        this.videoCurrentTimeSource.next(currentTime);
    }

}
