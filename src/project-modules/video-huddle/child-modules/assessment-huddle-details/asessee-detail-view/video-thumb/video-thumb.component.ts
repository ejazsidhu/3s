import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// import { HeaderService } from 'src/app/header.service';
import { DetailsHttpService } from '../../../details/servic/details-http.service';
import { environment } from 'src/environments/environment';
import { HeaderService } from '@src/project-modules/app/services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'assesse-video-thumb',
  templateUrl: './video-thumb.component.html',
  styleUrls: ['./video-thumb.component.css']
})
export class VideoThumbComponent implements OnInit {

  @Input() artifact: any;
  @Output() selectedArtifict = new EventEmitter<any[]>()

  currentArtifact: any = {};
  sessionData: any = {};
  toggledDropdown: boolean = true;
  isDropdownOpen: boolean;
  basePath = environment.baseUrl;
  public translation: any = {};
  private subscription: Subscription;
  
  constructor(
    public detailsService: DetailsHttpService,
    public headerService: HeaderService,
    public router:Router) { 
      this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
        this.translation = languageTranslation;
      });
    }

  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.isDropdownOpen = false;
  }
  
  goToDetailPage(artifact) {
    // let url = `${this.basePath}/video_details/home/${artifact.account_folder_id}/${artifact.doc_id}`
    if (artifact.published == 1)
    this.router.navigate(["/video_details/home", artifact.account_folder_id, artifact.doc_id], { queryParams: { assessment: true } })

      // window.open(url.toString(), '_self');
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
