import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@videoPage/services';
import { HeaderService } from '@src/project-modules/app/services';
import { Subscription } from 'rxjs'; 

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  
  //#region variables
  path:any=''
  header_data: any;
  lsCommentExisted: boolean;
  params: any;
  data: Object;
  isDataAvaiable: boolean=false;
  private subscriptions: Subscription = new Subscription();
  translation: any=[];
  //#endregion

  constructor(private activatedRoute:ActivatedRoute,public mainService:MainService,private headerService:HeaderService) {
    this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
      // this.VideoCurrentTime=this.translation.all_video;
    }));
   }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    this.activatedRoute.parent.data.subscribe(data=>{
      // console.log("activated route data",data);
      if(data){
            if(data.name=='video_page')
            this.path='/view_page';
            else if(data.name=='workspace_video_page')
            this.path='/workspace_video_page';
    
          }
      });

      this.activatedRoute.params.subscribe((p)=>{
      this.params=p
        this.getData(p);
      });
      this.lsCommentExisted = true;
  }

  getData(args){
  
    let headerData:any = this.headerService.getStaticHeaderData();

    if(headerData){

      let account_id = headerData.user_current_account.accounts.account_id;
      let user_id = headerData.user_current_account.User.id;
      let data = {
        "user_id":user_id,
         "video_id":args.video_id,
        "account_id": account_id,
         "huddle_id":args.huddle_id,
         "role_id": headerData.user_current_account.roles.role_id,
         "permission_maintain_folders": headerData.user_permissions.UserAccount.permission_maintain_folders
       }

      this.mainService.GetVideo(data,false,this.path).subscribe((data)=>{

console.log('video data',data);
this.isDataAvaiable=true;
this.data=data
        // this.handleVideo(data);

      });

    }


}



}
