
import { DetailsHttpService } from '../../servic/details-http.service';

import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../servic/permission.service';
import { environment } from "@environments/environment";
import { Subscription } from 'rxjs';


@Component({
  selector: 'resources-thumb',
  templateUrl: './resources-thumb.component.html',
  styleUrls: ['./resources-thumb.component.css']
})
export class ResourcesThumbComponent implements OnInit, OnDestroy {

  @ViewChild('popUp', {static: false}) popUpModel;
  @Input() artifact: any=[]
  @Output() selectedArtifict=new EventEmitter<any[]>()
  currentArtifact: any = {};
  sessionData: any = {};
  toggledDropdown: boolean=true;
  isDropdownOpen: boolean;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
    public userAccountLevelRoleId: number | string = null;

  constructor(public permissionService:PermissionService,private toastr: ToastrService, private detailsService: DetailsHttpService, public headerService: HeaderService) { 
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }


  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.isDropdownOpen = false;
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
    // this.translation = this.header_data.language_translation; // changed to observable stream
    // console.log('respources is called' ,this.artifact)
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
  public popup_display(val) {
    this.detailsService.set_popup(val);
  }


  // OpenModel(artifact,modelName) {
  //   this.currentArtifact = artifact;
  //   this.popUpModel.showModal(modelName)
  // }

  public openResource(artifact)
  {
      this.detailsService.openResource(artifact);
  }

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
    
  }

  DownloadResource(artifact){
    
    let obj:any={
      artifact:artifact,
      modalName: "",
      downloadArtifact:true,
      duplicateArtifact:false


    }

    this.selectedArtifict.emit(obj)
   
  }
  public openResourceHref(artifact){
    if(artifact.stack_url){
      let path = environment.baseUrl + "/app/view_document" + artifact.stack_url.substring(artifact.stack_url.lastIndexOf("/"), artifact.stack_url.length);
      return path;
    }
    
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
