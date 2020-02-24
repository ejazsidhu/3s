import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "@environments/environment";
import { PermissionService } from '../../servic/permission.service';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'scripted-notes',
  templateUrl: './scripted-notes.component.html',
  styleUrls: ['./scripted-notes.component.css']
})
export class ScriptedNotesComponent implements OnInit, OnDestroy {
  @ViewChild('popUp', {static: false}) popUpModel;
  @Input() artifact:any
  @Output() selectedArtifict=new EventEmitter<any[]>()
  currentArtifact: any=[];
  toggledDropdown: boolean=true;
  isDropdownOpen: boolean;
  basePath = environment.baseUrl;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
    public userAccountLevelRoleId: number | string = null;
    
  constructor(public permissionService:PermissionService, private router: Router, public headerService: HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
    this.isDropdownOpen = false;
    // console.log('scripted page',this.artifact);
    this.header_data = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
  // this.translation = this.header_data.language_translation; // changed to observable stream  
  }
  showDropdown(){
    this.toggledDropdown=!this.toggledDropdown
  }

  goToDetailPage(artifact){
    // let url=`${this.basePath}/video_details/scripted_observations/${artifact.account_folder_id}/${artifact.doc_id}`
    // window.open(url.toString(), '_self')
    this.router.navigate(['/video_details/scripted_observations/', artifact.account_folder_id, artifact.doc_id]);
  }
  public isOpen(flag){

    this.isDropdownOpen = flag;
    if(flag){
      this.artifact.mouseEntered = true;
    }

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
  HrefLink(artifact){
    let url=`${this.basePath}/video_details/scripted_observations/${artifact.account_folder_id}/${artifact.doc_id}`
  return url;
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
