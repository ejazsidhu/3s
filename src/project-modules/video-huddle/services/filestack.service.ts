import { Injectable, EventEmitter } from '@angular/core';
import * as filestack from 'filestack-js';
import { environment } from "@environments/environment";
import { HeaderService } from "@projectModules/app/services";
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
@Injectable({
    providedIn: 'root'
})
export class FilestackService {

    private client;

    public GlobalOptions: any = [];

    public FilesUploaded: EventEmitter<any> = new EventEmitter<any>();

    constructor(private headerService: HeaderService) {

        this.GlobalOptions["videoOptions"] = {
            maxFiles: 100,
            accept: ['.3gp', '.mkv', 'video/*', 'audio/*'],
            fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'onedrive']
        };
        this.GlobalOptions["audioOptions"] = {
            maxFiles: 1,
            accept: ['audio/*'],
            fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'onedrive']
        };
        this.GlobalOptions["resourceOptions"] = {
            maxFiles: 100,
            accept: GLOBAL_CONSTANTS.RESOURCE_UPLOAD_EXTENSIONS,
            fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'onedrive'],
          customText: {
            'File {displayName} is not an accepted file type. The accepted file types are {types}': 'File {displayName} is not an accepted file type. The accepted file types are image, text',
          }
        };
        this.GlobalOptions["cameraOptions"] = {
            maxFiles: 1,
            fromSources: ["video"]
        };

    }

    public InitFileStack() {

        let key = environment.fileStackAPIKey;
        this.client = filestack.init(key);

    }

    public showPicker(optionsFor, resorceAllowed?) {
        let options = this.GlobalOptions[optionsFor] || {};
        if (optionsFor == "resourceOptions" && resorceAllowed)
            this.GlobalOptions["resourceOptions"].maxFiles = +resorceAllowed;
        options.storeTo = {
            location: "s3",
            path: this.getUploadPath(),
            access: 'public',
            container: environment.container,
            region: 'us-east-1'
        }
        //options.fromSources = ['local_file_system','dropbox','googledrive','box','onedrive']
        options.onUploadDone = (res) => {
            // console.log(res);
            this.FilesUploaded.emit(res.filesUploaded)
        }
        let sessionData: any = this.headerService.getStaticHeaderData();
        let language = sessionData.language_translation.current_lang;
        options.lang = language;
        return this.client.picker(options).open();

    }

    private getUploadPath() {

        let temp = "/tempupload/";

        let sessionData: any = this.headerService.getStaticHeaderData();

        let account_id = sessionData.user_current_account.accounts.account_id;

        temp = temp + account_id;

        let date = new Date();

        temp += "/" + date.getFullYear() + "/" + this.padNumber(date.getMonth() + 1) + "/" + this.padNumber(date.getDate()) + "/";

        return temp;

    }

    private padNumber(n) {

        let number = Number(n);

        if (number <= 9) {
            return "0" + "" + number;
        } else {
            return n;
        }

    }
}
