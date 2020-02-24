import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from 'rxjs';
import * as _ from "lodash";

import { isEmpty } from "@app/helpers";
import { DetailsService } from "@analytics/services";
import { HeaderService } from "@projectModules/app/services";


@Component({
  selector: 'app-userdetails',
  templateUrl: './userdetails.component.html',
  styleUrls: ['./userdetails.component.css']
})
export class UserdetailsComponent implements OnInit, OnDestroy {

  private params;
  public userDetails;
  private filterDropdowns;
  public header_data;
  public translation: any = {};
  private translationSubscription: Subscription;
  private queryParams: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private detailsService: DetailsService, private headerService: HeaderService) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      this.detailsService.FilterDropdowns.subscribe((d) => { this.formatFilterLabels(d); this.filterDropdowns = d; });
    });

    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
    });
  }


  ngOnInit() {

    this.activatedRoute.params.subscribe(params => { this.assignParams(params) });

    this.detailsService.Filters.subscribe(d => { this.loadDetails(d) });

    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream

  }

  private formatFilterLabels(f) {

    let index = _.findIndex(f, { name: "total_video_hours_viewed" });
    if (index > -1)
      f[index].label = this.translation.analytics_total_video_hours;

  }

  private getFormattedDate(date) {

    return (this.getPadding(date.getMonth() + 1)) + "/" + this.getPadding(date.getDate()) + "/" + date.getFullYear();
    //toLocaleDateString().replace(/\//g, "-");

  }

  private getPadding(n) {

    return n < 10 ? "0" + n : n + "";

  }

  private loadDetails(data) {

    let additional_data: additional_data = {};

    let urlQueryParams: any = {};

    if (data.date_range) {

      additional_data.startDate = this.getFormattedDate(data.date_range[0]);
      additional_data.endDate = this.getFormattedDate(data.date_range[1]);

      urlQueryParams.startDate = additional_data.startDate;
      urlQueryParams.endDate = additional_data.endDate;

    }

    if (data.standards.length > 0) {
      urlQueryParams.standards = [];

      this.filterDropdowns;
      data.standards.forEach(s => {
        let index = _.findIndex(this.filterDropdowns, { name: s.name });
        let temp = this.filterDropdowns[index];
        additional_data[temp.name] = temp.value;
        // urlQueryParams.standards[temp.name] = temp.value;

        let test = { [temp.name]: temp.value };
        urlQueryParams.standards.push(test);

      });

      urlQueryParams.standards = JSON.stringify(urlQueryParams.standards);

    } else urlQueryParams.standards = null;

    if (!data.date_range && data.standards.length == 0) {

      console.log("Need to select some filters.");
      return;
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: urlQueryParams,
      queryParamsHandling: 'merge',
    });

    this.detailsService.LoadDetails(this.params, false, additional_data).subscribe(d => {
      //console.log(d);
      this.userDetails = d;
    });

  }

  private assignParams(params) {

    this.params = params;
    let secondParameter = false;

    if (isEmpty(this.queryParams)) secondParameter = true;

    let queryParamsData: any = {};

    if (this.queryParams.startDate) queryParamsData.startDate = this.queryParams.startDate;
    if (this.queryParams.endDate) queryParamsData.endDate = this.queryParams.endDate;
    if (this.queryParams.standards) {
      let standards: any = JSON.parse(this.queryParams.standards);
      standards.forEach(element => {
        for (let key in element) {
          queryParamsData[key] = element[key];
        }
      });

    }


    this.detailsService.LoadDetails(this.params, secondParameter, queryParamsData).subscribe(data => {

      this.userDetails = data;

      Object.keys(data).forEach(k => {

        if (data[k] && data[k] == true) {

          this.detailsService.UpdateSelectedFilterValue(k);

        }

      });

    });

  }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
  }


}

interface additional_data {
  [key: string]: any
}
