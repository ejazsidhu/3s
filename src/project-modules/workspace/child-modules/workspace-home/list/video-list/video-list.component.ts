import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { WorkspaceHttpService } from '../../services';
import { environment } from "@environments/environment";
import { HeaderService } from '@projectModules/app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.css']
})
export class VideoListComponent implements OnInit, OnDestroy {
  @ViewChild('share', { static: false }) shareComponent: any;
  @Input() artifact: any;
  @Output() selectedArtifict = new EventEmitter<any[]>()
  toggledDropdown: boolean = true;
  isDropdownOpen: boolean;
  basePath = environment.baseUrl;
  sessionData: any;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;

  constructor(public workspaseServise: WorkspaceHttpService, public headerService: HeaderService) {
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
  showDropdown() {
    this.toggledDropdown = !this.toggledDropdown
  }
  public isOpen(flag) {

    this.isDropdownOpen = flag;
    if (flag) {
      this.artifact.mouseEntered = true;
    }
  }
  OpenModel(artifact, modalName) {

    let obj: any = {
      artifact: artifact,
      modalName: modalName,
      libraryShare: true,
      commentsShare: true
    }

    this.selectedArtifict.emit(obj)

    // this.popUpModel.showModal(modlName)

  }
  DuplicateResource(artifact) {
    let obj: any = {
      artifact: artifact,
      modalName: "",
      duplicateArtifact: true,
      downloadArtifact: false

    }

    this.selectedArtifict.emit(obj)
    // this.popUpModel.DuplicateResource(artifact)
  }

  DownloadResource(artifact) {

    let obj: any = {
      artifact: artifact,
      modalName: "",
      downloadArtifact: true,
      duplicateArtifact: false


    }

    this.selectedArtifict.emit(obj)
    // this.popUpModel.DownloadResource(artifact)
  }

  createLink(artifact) {

    if (artifact.doc_type!=1 && (artifact.published == 0 && artifact.upload_progress <= 100 && (artifact.upload_status == 'uploading' || artifact.upload_progress == 0) && artifact.video_duration > 0)){
      return `/workspace_video/video_observation/${artifact.account_folder_id}/${artifact.doc_id}`;
    }
    
    return `/workspace_video/home/${artifact.account_folder_id}/${artifact.doc_id}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
