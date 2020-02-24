import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';

// import { HeaderService } from 'src/app/header.service';
import { DetailsHttpService } from '../../../details/servic/details-http.service';
import { HeaderService } from '@src/project-modules/app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'assesse-resources-thumb',
  templateUrl: './resources-thumb.component.html',
  styleUrls: ['./resources-thumb.component.css']
})
export class ResourcesThumbComponent implements OnInit {

  @ViewChild('popUp', { static: false }) popUpModel;
  @Input() artifact: any = []
  @Output() selectedArtifict = new EventEmitter<any[]>()

  currentArtifact: any = {};
  sessionData: any = {};
  toggledDropdown: boolean = true;
  isDropdownOpen: boolean;
  public translation: any = {};
  private subscription: Subscription;

  constructor(
    private detailsService: DetailsHttpService,
    public headerService: HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.isDropdownOpen = false;
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

  public popup_display(val) {
    this.detailsService.set_popup(val);
  }

  public openResource(artifact) {
    this.detailsService.openResource(artifact);
  }

  OpenModel(artifact, modalName) {
    this.currentArtifact = artifact;
    let obj: any = {
      artifact: artifact,
      modalName: modalName
    }

    this.selectedArtifict.emit(obj)
  }

  DuplicateResource(artifact) {
    let obj: any = {
      artifact: artifact,
      modalName: "",
      duplicateArtifact: true,
      downloadArtifact: false

    }

    this.selectedArtifict.emit(obj)

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
