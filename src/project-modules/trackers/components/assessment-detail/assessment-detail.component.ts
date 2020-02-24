import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { environment } from "@environments/environment";

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.css']
})
export class AssessmentDetailComponent implements OnInit {

  constructor(private http:HttpClient,private router:Router,private toastr:ToastrService) { }

  @Input() list:any;
  @Input() session_detail:any;
  @Input() translations:any;
  @Input() base_url:any;
  isLoading:boolean = true;
  
  huddle_detail:any;
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  ngOnInit() {
    if(this.list.isOpen)
    {
    this.assessmentDetails();
    }
    console.log(this.list)
  }
  assessmentDetails(){
    let url = environment.APIbaseUrl+"/get_assessment_tracker_huddle_assessees";
    let obj = {
      lang : this.translations.current_lang,
      user_current_account: this.session_detail,
      huddle_id: this.list.account_folder_id,
    }
    this.http.post(url,obj).subscribe((d:any)=>{
      this.huddle_detail = d.huddle_detail;
      console.log(this.huddle_detail)
      this.isLoading = false;
    })
  }

  isHuddleAllowed(){
    let url = environment.APIbaseUrl+"/isHuddleAllowed";
    let obj = {
      user_id: this.session_detail.User.id,
      huddle_id: this.list.account_folder_id,
    }
    this.http.post(url,obj).subscribe((d:any)=>{
      if(d.allowed)
      {
          window.location.href = this.base_url+`/home/video_huddles/huddle/details/${this.list.account_folder_id}/artifacts/grid`;
      }
      else
      {
        this.toastr.info(this.translations.do_not_have_permission_ng);
      }
    })
  }


  ImageUrlBuilder(participent: any) {
    if (participent.image == 'groups') {
      return true
    } else {
      let image = participent.image || "assets/trackers/img/photo-default.png";
      let url = `${this.staticImageServiceIp}${participent.user_id}/${
        participent.image
        }`;
      return participent.image ? url : image;
    }

  }

  public openLinkInNewTab(account_folder_id: number){
    window.open(`${environment.baseUrl}/home/video_huddles/assessment/${account_folder_id}/huddle/details`, "_blank");
  }

}
