import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { environment } from "@environments/environment";
import { HeaderService } from '@projectModules/app/services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-scripted-notes-grid',
  templateUrl: './scripted-notes-grid.component.html',
  styleUrls: ['./scripted-notes-grid.component.css']
})
export class ScriptedNotesGridComponent implements OnInit, OnDestroy {
  // @ViewChild('share', {static: false}) shareComponent: any;
  @Input() artifact: any;
  @Output() selectedArtifict = new EventEmitter<any[]>()
  toggledDropdown: boolean = true;
  isDropdownOpen: boolean;
  basePath = environment.baseUrl;
  sessionData: any;
  public translation: any = {};
  private subscription: Subscription;
  public userAccountLevelRoleId: number | string = null;

  constructor(public headerService: HeaderService, private router: Router) {
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
      downloadArtifact: false,
      is_scripted_note: 1
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
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
