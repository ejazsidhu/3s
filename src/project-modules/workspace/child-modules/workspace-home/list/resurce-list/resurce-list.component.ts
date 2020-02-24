import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { WorkspaceHttpService } from '../../services';
import { environment } from "@environments/environment";
import { HeaderService } from '@projectModules/app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resurce-list',
  templateUrl: './resurce-list.component.html',
  styleUrls: ['./resurce-list.component.css']
})
export class ResurceListComponent implements OnInit, OnDestroy {
  @ViewChild('share', { static: false }) shareComponent: any;
  @Input() artifact: any;
  @Output() selectedArtifict = new EventEmitter<any[]>()
  toggledDropdown: boolean = true;
  isDropdownOpen: boolean;
  sessionData: any;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;

  constructor(private workService: WorkspaceHttpService, public headerService: HeaderService) {
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
  public isOpen(flag) {

    this.isDropdownOpen = flag;
    if (flag) {
      this.artifact.mouseEntered = true;
    }
  }
  showDropdown() {
    this.toggledDropdown = !this.toggledDropdown
  }
  OpenModel(artifact, modalName) {

    let obj: any = {
      artifact: artifact,
      modalName: modalName,
      libraryShare: false,
      commentsShare: false
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
  public openResource(artifact) {
    if (artifact.stack_url) {
      let url = environment.baseUrl + "/app/view_document" + artifact.stack_url.substring(artifact.stack_url.lastIndexOf("/"), artifact.stack_url.length);
      window.open(url,'_blank');
    }
    else {
      this.workService.openResource(artifact);
    }
  }
  // public openResourceHref(artifact) {
  //   if (artifact.stack_url) {
  //     let path = environment.baseUrl + "/app/view_document" + artifact.stack_url.substring(artifact.stack_url.lastIndexOf("/"), artifact.stack_url.length);
  //     return path;
  //   }

  // }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
