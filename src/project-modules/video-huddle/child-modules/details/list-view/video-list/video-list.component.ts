import { Component, OnInit, ViewChild,Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DetailsHttpService } from '../../servic/details-http.service';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from "@projectModules/app/services";
import { environment } from "@environments/environment";
import { PermissionService } from '../../servic/permission.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.css']
})
export class VideoListComponent implements OnInit, OnDestroy {
  @ViewChild('popUp', {static: false}) popUpModel;
  currentArtifact: any = {};
  sessionData: any = {};
  toggledDropdown: boolean=true;
  isDropdownOpen: any;
  basePath = environment.baseUrl;
  constructor(public permissionService:PermissionService,private toastr: ToastrService, public detailsService: DetailsHttpService, public headerService: HeaderService) { 
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }
  @Input() artifact: any=[];
  @Output() selectedArtifict=new EventEmitter<any[]>()
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.isDropdownOpen = false
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }
  goToDetailPage(artifact){
    let url=`${this.basePath}/video_details/home/${artifact.account_folder_id}/${artifact.doc_id}`;
    if(artifact.published==1)
    window.open(url.toString(),'_self');
      
  }
  showDropdown(){
    this.toggledDropdown=!this.toggledDropdown
  }
  public isOpen(flag){

    this.isDropdownOpen = flag;
    if(flag){
      this.artifact.mouseEntered = true;
    }

  }
  public popup_display(val){
	//	this.detailsService.set_popup(val);
  }
  
  // OpenModel(artifact, modelName) {
  //   this.currentArtifact = artifact;
    
  //   this.popUpModel.showModal(modelName)
  // }  

  OpenModel(artifact, modalName) {
    this.currentArtifact = artifact;
    let obj:any={
      artifact:artifact,
      modalName: modalName
    }

    this.selectedArtifict.emit(obj)

    // this.popUpModel.showModal(modlName)

  }
  DuplicateResource(artifact){
    let obj:any={
      artifact:artifact,
      modalName: "",
      duplicateArtifact:true,
      downloadArtifact:false

    }

    this.selectedArtifict.emit(obj)
    // this.popUpModel.DuplicateResource(artifact)
  }

  DownloadResource(artifact){
    
    let obj:any={
      artifact:artifact,
      modalName: "",
      downloadArtifact:true,
      duplicateArtifact:false


    }

    this.selectedArtifict.emit(obj)
    // this.popUpModel.DownloadResource(artifact)
  }
  HrefLink(artifact){
    let url=`${this.basePath}/video_details/home/${artifact.account_folder_id}/${artifact.doc_id}`;
    return url;
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
