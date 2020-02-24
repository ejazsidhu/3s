import { Component, OnInit, ViewChild,Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { environment } from "@environments/environment";
import { HeaderService } from '@projectModules/app/services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scripted-notes-list',
  templateUrl: './scripted-notes-list.component.html',
  styleUrls: ['./scripted-notes-list.component.css']
})
export class ScriptedNotesListComponent implements OnInit, OnDestroy {
  @ViewChild('share', {static: false}) shareComponent: any;
  @Input() artifact: any;
  @Output() selectedArtifict=new EventEmitter<any[]>()
  toggledDropdown: boolean=true;
  isDropdownOpen: boolean;
  basePath = environment.baseUrl;
  sessionData: any;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;
  
  constructor(private router:Router,public headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    // this.translation = this.sessionData.language_translation; // changed to observable stream
    this.isDropdownOpen = false;
    this.userAccountLevelRoleId = this.sessionData.user_permissions.roles.role_id;
  }
  showDropdown(){
    this.toggledDropdown=!this.toggledDropdown
  }
  public isOpen(flag) {

    this.isDropdownOpen = flag;
    if (flag) {
      this.artifact.mouseEntered = true;
    }
  } 
  OpenModel(artifact, modalName) {
   
    let obj:any={
      artifact:artifact,
      modalName: modalName,
      libraryShare: false,
      commentsShare: false
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
  goToDetailPage(artifact){

    let path ='/video_details/scripted_observations/'+artifact.account_folder_id +'/'+artifact.doc_id;
    this.router.navigate([path],{ queryParams: { workspace: true } });
    // let url=`${this.basePath}/video_details/scripted_observations/${artifact.account_folder_id}/${artifact.doc_id}?workspace=true`
    // window.open(url.toString(), '_self')
  }
  goToDetailPageHref(artifact){
    let url=`${this.basePath}/video_details/scripted_observations/${artifact.account_folder_id}/${artifact.doc_id}?workspace=true`
    return url;
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
