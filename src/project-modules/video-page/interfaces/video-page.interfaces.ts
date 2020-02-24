/**
 * BreadCrumbInterface
 * @key {title} Title:  To display on screen
 * @key {link} Link:  If the provided title is of link/route type then provide its link 
 */
export interface BreadCrumbInterface {
    title: string,
    link?: string
}

export interface CommentTypingSettingsInterface {
    PauseWhileTyping: boolean,
    EnterToPost: boolean
}

export type RecordingState = 'comfortZone' | 'recording' | 'resume' | 'uploading' | 'play';
export type VideoCommentPlayState = 'on' | 'off';
export type AudioPath = { filePath: string, audioUrl: string, autoSubmitComment: string, audioDuration: number };