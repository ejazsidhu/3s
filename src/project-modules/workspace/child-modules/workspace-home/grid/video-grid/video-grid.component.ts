import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { environment } from "@environments/environment";
import { WorkspaceHttpService, PermissionsService } from '../../services';
import { HeaderService } from '@projectModules/app/services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-grid',
  templateUrl: './video-grid.component.html',
  styleUrls: ['./video-grid.component.css']
})
export class VideoGridComponent implements OnInit, OnDestroy {
  basePath = environment.baseUrl;
  public arr = [1, 1, 1, 1];

  @Input() artifact: any;
  @Output() selectedArtifict = new EventEmitter<any[]>()
  toggledDropdown: boolean = true;
  isDropdownOpen: boolean;
  sessionData: any;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;

  constructor(public workspaseServise: WorkspaceHttpService, public permissionService: PermissionsService, public headerService: HeaderService, private router: Router) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.isDropdownOpen = false;
    this.sessionData = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.sessionData.user_permissions.roles.role_id;
    // this.translation = this.sessionData.language_translation; // changed to observable stream
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

    if (artifact.doc_type != 1 && (artifact.published == 0 && artifact.upload_progress <= 100 && (artifact.upload_status == 'uploading' || artifact.upload_progress == 0) && artifact.video_duration > 0)) {
      return `/workspace_video/video_observation/${artifact.account_folder_id}/${artifact.doc_id}`;
    }

    return `/workspace_video/home/${artifact.account_folder_id}/${artifact.doc_id}`;
  }

  updateUrl(value) {
    alert(value)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }






}
