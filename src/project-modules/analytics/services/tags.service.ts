import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { environment } from "@environments/environment";

@Injectable()
export class TagsService {

	constructor(private http: HttpClient) { }

	@Output() PlaycardUpdateClicked: EventEmitter<boolean> = new EventEmitter();

	public GetCharts(filters){

		let path = environment.APIbaseUrl + "/frequency_of_tagged_standard_2";

		return this.http.post(path, filters);

	}

	public UpdatePlaycard(){

		this.PlaycardUpdateClicked.emit(true);
	}



}
