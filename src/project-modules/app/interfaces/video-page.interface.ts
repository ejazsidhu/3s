/**
 * Declare all interfaces for video page i.e workspace video, huddle video page, sync-video page and live stream video page
 */

export interface ViewerHistory {
    user_id: number;
    document_id: number;
    minutes_watched: number;
}

export interface PublishSetting {
    huddle_id: number
    video_id: number
    user_id: number
}

export interface PLTabData {
    account_id: number;
    user_id: number;
    huddle_id: number;
    video_id: number;
}