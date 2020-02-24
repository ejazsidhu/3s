import { Injectable, EventEmitter } from '@angular/core';
import * as filestack from 'filestack-js';
import { environment } from "@environments/environment";

@Injectable()
export class FilestackService {

	public FilesUploaded: EventEmitter<any> = new EventEmitter<any>();

	private client;
	private options = {
		location: "s3",
		path: '/uploads',
		access: 'public',
		container: environment.container,
		region: 'us-east-1'
	}

	constructor() {
		this.client = filestack.init(environment.fileStackAPIKey);
	}

	public uploadToS3(audioBlob: Blob, audioExtension: string, accountId: number, userId: number) {
		const date = new Date();
		this.options.path = '/uploads'; // Think and find a way that why we reset it to /uploads
		this.options.path = this.makeUploadPath(accountId, userId, date);
		return this.client.upload(audioBlob, {}, { ...this.options, filename: `audio_${accountId}_${userId}_${date.getTime()}.${audioExtension}` });
	}

	private makeUploadPath(accountId: number, userId: number, date: Date) {
		return `${this.options.path}/${accountId}/audio/${date.getFullYear()}/${this.getTwoDigitNumber(date.getMonth() + 1)}/${this.getTwoDigitNumber(date.getDate())}/`;
	}

	private getTwoDigitNumber(number: number) {
		if (number < 10) return `0${number}`;
		else return number;
	}

}
