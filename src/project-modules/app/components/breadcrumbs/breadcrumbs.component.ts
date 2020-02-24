import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { environment } from "@environments/environment";
import { HomeService } from "@videoHuddle/child-modules/list/services/home.service";
import { DiscussionService } from '@videoHuddle/child-modules/details/servic/discussion.service';
import { HeaderService } from "@projectModules/app/services";

@Component({
	selector: 'app-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.css']
})

export class BreadcrumbsComponent implements OnInit {
	public header_data;
	public translation;
	constructor(private router: ActivatedRoute, private homeService: HomeService, public discussionService: DiscussionService, private headerService: HeaderService) { }

	public breadcrubms;
	ngOnInit() {

		this.headerService.LoggedIn.subscribe((f) => {

			if (f) {
				this.header_data = this.headerService.getStaticHeaderData();
				this.translation = this.header_data.language_translation;

			}

		})
		// this.router.params.subscribe((p)=>{

		// if(p.folder_id){

		this.homeService.Breadcrumbs.subscribe((data) => {

			this.breadcrubms = data;
			console.log("bread crumbssss", this.breadcrubms);

		});

		// }

		// });

	}

}
