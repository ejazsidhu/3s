import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { WorkspaceHttpService } from '../services';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '@projectModules/app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  @ViewChild('share', {static: false}) popUpModel: any;
  artifacts: any = [];
  artifact: any = {};
  public Loadings: any = {};
  resource: any;
  sort: any;
  isReverse: boolean;
  sessionData: any;
  public translation: any = {};
  private subscription: Subscription;
  constructor(private workService: WorkspaceHttpService, private route: ActivatedRoute,private headerService:HeaderService) { 
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }
  private RunSubscribers() {

    this.workService.Loadings.IsLoadingArtifacts.subscribe((flag) => {

      this.Loadings.IsLoadingArtifacts = flag;

    });

  }
  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    // this.translation = this.sessionData.language_translation; // changed to observable stream
    this.route.queryParams.subscribe(params => {
      params.resource
        ? (this.resource = params.resource)
        : (this.resource = 0);

      params.sort
        ? (this.sort = params.sort)
        : (this.sort = "");
      if (this.sort == "video_title") {
        this.sort = "title"
        this.isReverse = false
      } else if (this.sort == "uploaded_date") {
        this.sort = "created_date"
        this.isReverse = true
      } else if (this.sort == "uploaded_by") {
        this.sort = "first_name"
        this.isReverse = false
      } else if (this.sort == "last_modified") {
        this.sort = "last_edit_date"
        this.isReverse = true
      } else {
        this.sort = "created_date"
        this.isReverse = true
      }
    });
    this.Loadings.IsLoadingArtifacts = false;
    this.RunSubscribers()
    this.workService.getArtifact().subscribe(d => {
      this.Loadings.IsLoadingArtifacts =  true;
      this.artifacts = d
      this.Loadings.IsLoadingArtifacts =  false;
    })
    // this.Loadings.IsLoadingArtifacts =  true;
    this.artifacts = this.workService.list
    // setTimeout(() => {
    //   this.Loadings.IsLoadingArtifacts =  false;
    // }, 3000);
    // this.Loadings.IsLoadingArtifacts =  false;
  }
  public getSelectedArtifact(data: any) {

    //console.log('emiter called', data);
    this.artifact = data.artifact;
    if (data.modalName)
      this.popUpModel.showModal(data.modalName, data.libraryShare, data.commentsShare);
      else if (data.duplicateArtifact){
        if((data.artifact.doc_type==1 || data.artifact.doc_type==3) && (data.artifact.total_attachment>0 || data.artifact.total_comments>0))
        this.popUpModel.showAssetsShare(data.artifact)
        else
        this.popUpModel.DuplicateResource(data.artifact);
  
      }

    else if (data.downloadArtifact)
      this.popUpModel.DownloadResource(data.artifact);


  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
