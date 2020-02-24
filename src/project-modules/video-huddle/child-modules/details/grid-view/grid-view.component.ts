
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailsHttpService } from '../servic/details-http.service';
import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: 'video-huddle-details-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css']
})
export class VideoHuddleDetailsGridViewComponent implements OnInit{

  @ViewChild('popUp', {static: false}) popUpModel;
  public ToggleView = ''
  artifacts: any = [];
  artifact: any = {}
  public Loadings: any = {};
 
    list=[1,1,1,1,1,1,1,1,1,1,1,1,1,111,1,1,1,1,1,1,1]
  noRecorFound: boolean=false;
  sort: any;
  isReverse: boolean;
  resource: any;

  constructor(private headerService: HeaderService,
    private detailsService: DetailsHttpService, private router: Router,private route:ActivatedRoute) {


  }

  public getSelectedArtifact(data:any) {

    // console.log('emiter called', data);
    this.artifact=data.artifact;
    if(data.modalName)
    this.popUpModel.showModal(data.modalName);
    else if (data.duplicateArtifact){  
      if((data.artifact.doc_type==1 || data.artifact.doc_type==3) && (data.artifact.total_attachment>0 || data.artifact.total_comments>0))
      this.popUpModel.showAssetsShare(data.artifact)
      else
      this.popUpModel.DuplicateResource(data.artifact);

    }

    else if(data.downloadArtifact)
    this.popUpModel.DownloadResource(data.artifact);


  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      params.resource
      ? (this.resource = params.resource)
      : (this.resource = 0);
      
      params.sort
      ? (this.sort = params.sort)
      : (this.sort = "");
      if(this.sort=="video_title"){
        this.sort = "title"
        this.isReverse = false
      }else if(this.sort=="uploaded_date"){
        this.sort = "created_date"
        this.isReverse = true
      }else if(this.sort=="uploaded_by"){
        this.sort = "first_name"
        this.isReverse = false
      }else if(this.sort=="last_modified"){
        this.sort = "last_edit_date"
        this.isReverse = true
      }else{
        this.sort = "created_date"
        this.isReverse = true
      }
    });
    setTimeout(() => {
      this.noRecorFound=true
      
    }, 20);
    //console.log('grid view',this.detailsService.list);
    // console.log("GridView Init called");
    this.Loadings.IsLoadingArtifacts = false;//this.router.url.toString().indexOf("grid")>-1;//true;
    this.RunSubscribers();

    this.detailsService.getArtifactList().subscribe(val => {
      //console.log('value from event emiter',val)
      this.artifacts = val
      
    });

    this.artifacts = this.detailsService.list
    


    // this.getArtifacts()

  }

  getArtifacts() {

    let url = this.router.url.split('/');
    // console.log(url)
    let [, , , id, ,] = url


    let obj: any = {
      huddle_id: id,
      title: ''
    };
    let sessionData: any = this.headerService.getStaticHeaderData();

    ({
      User: {
        id: obj.user_id
      },
      accounts: {
        account_id: obj.account_id
      },
      roles: {
        role_id: obj.role_id
      }
    } = sessionData.user_current_account);

    // console.log('grid age',obj)

    this.detailsService.GetArtifacts(obj).subscribe((data) => {
      // console.log('grid data', data);
      let res: any = data;
      this.artifacts = res.artifects.all
    }, (error) => {
      // console.log('grid error', error)
    });
  }

  private RunSubscribers() {

    this.detailsService.Loadings.IsLoadingArtifacts.subscribe((flag) => {

      this.Loadings.IsLoadingArtifacts = flag;

    });

  }

}


