export const GLOBAL_CONSTANTS = {
    NAV_ITEMS: { WORKSPACE: 'workspace', HUDDLE: 'huddle', ANALYTICS: 'analytics', PEOPLE: 'people' },
    // ANALYTICS_TABS: {
    //     OVERVIEW: { label: 'overview', value: 0 },
    //     TAGS_N_PL: { label: 'tags-and-performance-level', value: 1 },
    //     USER_SUMMARY: { label: 'user-summary', value: 2 },
    // }
    ANALYTICS_TABS: [
        { label: 'overview', value: 0 },
        { label: 'tags-and-performance-level', value: 1 },
        { label: 'user-summary', value: 2 },
    ],
    ANALYTICS_PC_TABS: [
        { label: 'overview', value: 0 },
        { label: 'tags-and-performance-level', value: 1 }
    ],
    PAGE_MODE: { ADD: 'add', EDIT: 'edit' },

    QUILL_CONFIGURATION: {
        MODULES: {
            toolbar: {
                container: [
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    ["bold", "italic", "underline"],
                    [{ header: 1 }, { header: 2 }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    [{ color: [] }]
                ]
            }
        },
        CSS_STYLE: { height: '100px' }
    },
    ASSSESSMENT_HUDDLE_FORM_FIELDS: {
        VIDEO: {
            OPTIONS: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            DEFAULT: 1
        },
        RESOURCE: {
            OPTIONS: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            DEFAULT: 0
        }
    },
    RESOURCE_UPLOAD_EXTENSIONS: [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'pdf', 'doc', 'docx', 'odt',
        'ppt', 'pptx', 'potx', 'xls', 'xlsx', 'xlsm', 'rtf', 'csv', 'txt', 'tex'
    ],
    LOCAL_STORAGE: {
        WORKSPACE: {
            VIDEO_COMMENT: 'workspace_video_comment_',
            SYNC_NOTE_COMMENT: 'workspace_sync_comment_',
            VIDEO_COMMENT_TA: 'workspace_video_comment_ta_', // TA sf Try Again
            VIDEO_EDIT_COMMENT: 'workspace_video_edit_comment_',
            SYNC_NOTE_EDIT_COMMENT: 'workspace_sync_edit_comment_',
            VIDEO_EDIT_COMMENT_TA: 'workspace_video_edit_comment_ta_',
            VIDEO_REPLY_TA: 'workspace_play_reply_ta_',
            REPLY: 'workspace_video_reply_',
            SUB_REPLY: 'workspace_video_sub_reply_'
        }, 
        VIDEO_PAGE: { // TODO: must be change to 'VIDEO' 
            COMMENT: 'comment-', // will be formed as 'comment-userId-videoId'
            SYNC_NOTE_COMMENT: 'workspace_sync_comment_',
            VIDEO_COMMENT_TA: 'workspace_video_comment_ta_', // TA sf Try Again
            VIDEO_EDIT_COMMENT: 'workspace_video_edit_comment_',
            SYNC_NOTE_EDIT_COMMENT: 'workspace_sync_edit_comment_',
            VIDEO_EDIT_COMMENT_TA: 'workspace_video_edit_comment_ta_',
            VIDEO_REPLY_TA: 'workspace_play_reply_ta_',
            REPLY: 'workspace_video_reply_',
            SUB_REPLY: 'workspace_video_sub_reply_'
        }, 
        VIDEO: {
            REPLY: 'video_reply_',
            SUB_REPLY: 'video_sub_reply_'
        }, 
        DISCUSSION: {
            ADD: 'add_discussion_',
            EDIT: 'edit_discussion_',
            EDIT_D_TITLE: 'edit_discussion_title_',
            EDIT_D_COMMENT: 'edit_discussion_comment_',
            ADD_TA: 'add_discussion_ta_',
            EDIT_TA: 'edit_discussion_ta_',
            ADD_COMMENT: 'discussion_add_comment_',
            ADD_COMMENT_TA: 'discussion_add_comment_ta_',
            EDIT_COMMENT: 'discussion_edit_comment_',
            EDIT_COMMENT_TA: 'discussion_edit_comment_ta_',
        }
    }
}