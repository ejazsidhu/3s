import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
// import { HeaderService } from '../../header.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../services/assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
import { DetailsHttpService } from '../../details/servic/details-http.service';
import { ToastrService } from 'ngx-toastr';
// import { HomeService } from '../../list/services/home.service';
import { environment } from "src/environments/environment";
import { HeaderService, HomeService } from '@src/project-modules/app/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  sessionData: any = [];
  huddle_id: number;
  videoslist: any=[];
  participantlist: any=[];
  page: any=1;

 

  constructor(private router:Router,private homeService: HomeService,
     private toastr: ToastrService, private detailsService: DetailsHttpService,
      private headerService: HeaderService, private activeRoute: ActivatedRoute, private assessmentService: AssessmentService) { }
  // @HostListener("window:scroll", ["$event"])
  
  ngOnInit() {

    this.detailsService.resourceToOpen.subscribe(artifact => {
      this.FileClicked("td", artifact);
    });

    this.huddle_id = 0;
    this.activeRoute.params.subscribe(p =>{this.huddle_id = p.id;
    this.assessmentService.setHuddleId(this.huddle_id);
    })
    this.sessionData = this.headerService.getStaticHeaderData();
    let userAccount =
      this.sessionData.user_current_account;
    // console.log(userAccount, 'user account object');

    let obj = {
      huddle_id: this.huddle_id,
      user_current_account: userAccount
    }

    this.assessmentService.getHuddleDetails(obj).subscribe((data:any) => {
      // console.log(data);
      if(data.success && data){
        this.assessmentService.setHuddleData(data);
      }
      if(!data.success){
        this.toastr.error(data.message)
this.router.navigate(['/list'])
      }

    }, error => {
      console.error(error)
    });

    this.getBreadCrubms();
    this.getWorkSpaceVideos();
    this.getHuddleParticipants();

    this.assessmentService.deleteAlertObject$.subscribe(obj=>{

      if(obj.userId){
        
        this.getHuddleData();

      }
      //debugger
    })

    /** Arif code for refreshing participant list to update assessed status start */
    this.detailsService.refreshGetParticipantList$.subscribe(() => {
      let userAccount = this.sessionData.user_current_account;

      let obj = {
        huddle_id: this.huddle_id,
        user_current_account: userAccount
      }

      this.assessmentService.getHuddleDetails(obj).subscribe((data:any) => {
        if(data){
          this.assessmentService.setHuddleData(data);
        }
      });
    });
    /** Arif code for refreshing participant list to update assessed status end */


  }

  getHuddleData(){
    this.sessionData = this.headerService.getStaticHeaderData();
    let userAccount =
      this.sessionData.user_current_account;
    // console.log(userAccount, 'user account object');

    let obj = {
      huddle_id: this.huddle_id,
      user_current_account: userAccount
    }
    this.assessmentService.getHuddleDetails(obj).subscribe((data:any) => {
      // console.log(data);
      if(data){
        this.assessmentService.setHuddleData(data);
      }
      if(!data.success){
        this.toastr.error(data.message)
this.router.navigate(['/video_huddles/list'])
      }

    }, error => {
      console.error(error)
    });
  }

  public FileClicked(from, file) {

    if (from == "td") {

      if (file.stack_url && file.stack_url != null) {
        let path = environment.baseUrl + "/app/view_document" + file.stack_url.substring(file.stack_url.lastIndexOf("/"), file.stack_url.length);
        window.open(path, "_blank");
      }
      else {
        this.DownloadFile(file);
      }
    }
    else {
      this.DownloadFile(file);
    }
  }

  private DownloadFile(file) {
    this.detailsService.DownloadFile(file.doc_id);
  }

  public getWorkSpaceVideos(){
    let obj={
      title:'',
      page:this.page,
      sort:'',
      doc_type:'1',
      account_id:this.sessionData.user_current_account.users_accounts.account_id,
      user_id:this.sessionData.user_current_account.users_accounts.user_id,

    };
    this.assessmentService.getWorkspaceVideos(obj).subscribe((data:any)=>{
this.videoslist=data.data;
this.assessmentService.setvideoList(this.videoslist)
// console.log(this.videoslist);

    },error=>{

    })
  }

  public getHuddleParticipants(){
    let obj={
      huddle_id:this.huddle_id,
      user_role_id:this.sessionData.user_current_account.users_accounts.role_id,
      user_id:this.sessionData.user_current_account.users_accounts.user_id,

    };
    this.detailsService.GetParticipents(obj).subscribe((data:any)=>{
      console.log('GetParticipents: ', data)
      this.participantlist=[...data];
// this.videoslist=data.data;
this.assessmentService.setParticipantsList(this.participantlist)
// console.log(this.videoslist);

    },error=>{

    })
  }

 


  getBreadCrubms() {
    let obj: any = {
      folder_id: this.huddle_id
    };
    let sessionData: any = this.headerService.getStaticHeaderData();

    ({
      User: { id: obj.user_id },
      accounts: { account_id: obj.account_id }
    } = sessionData.user_current_account);

    let ref = this.homeService.GetBreadcrumbs(obj).subscribe((data: any) => {
      //
      // this.homeService.Breadcrumbs.emit(data);
      
      this.homeService.updateBreadcrumb(data);

    });
  }

}



