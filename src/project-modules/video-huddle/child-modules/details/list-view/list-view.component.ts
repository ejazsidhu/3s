import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DetailsHttpService } from '../servic/details-http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})
export class ListViewComponent implements OnInit, OnDestroy {
  @ViewChild('popUp', {static: false}) popUpModel;
  public ToggleView = ''
  artifacts: any=[];
  artifact: any = {}
  public Loadings:any={};
  noRecorFound: boolean=false;
  sort: any;
  isReverse: boolean;
  resource: any;
  header_data: any;
  public translation: any = {};
  private subscription: Subscription;

  constructor(private headerService: HeaderService,private detailsService: DetailsHttpService, private router: Router,private route:ActivatedRoute) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
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

    this.Loadings.IsLoadingArtifacts =  false;//this.router.url.toString().indexOf("list")>-1; //true;

    this.detailsService.getArtifactList().subscribe(val=>{
      
      this.artifacts=val
    })
    this.artifacts=this.detailsService.list;
    
    
    this.RunSubscribers();
    
  }

private RunSubscribers(){
  
    this.detailsService.Loadings.IsLoadingArtifacts.subscribe((flag)=>{

        this.Loadings.IsLoadingArtifacts = flag;

      });

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

ngOnDestroy(){
  this.subscription.unsubscribe();
}

}
