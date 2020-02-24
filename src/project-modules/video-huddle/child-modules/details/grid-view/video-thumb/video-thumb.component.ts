
import { DetailsHttpService } from '../../servic/details-http.service';

import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { ToastrService } from 'ngx-toastr';
import { environment } from "@environments/environment";
import { Router } from '@angular/router';
import { PermissionService } from '../../servic/permission.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'video-thumb',
  templateUrl: './video-thumb.component.html',
  styleUrls: ['./video-thumb.component.css']
})
export class VideoThumbComponent implements OnInit, OnDestroy {
  // @ViewChild('popUp', {static: false}) popUpModel;
  currentArtifact: any = {};
  sessionData: any = {};
  toggledDropdown: boolean = true;
  isDropdownOpen: boolean;
  basePath = environment.baseUrl;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;


  constructor(public permissionService: PermissionService, private router: Router, private toastr: ToastrService, public detailsService: DetailsHttpService, public headerService: HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  @Input() artifact: any;
  @Output() selectedArtifict = new EventEmitter<any[]>()


  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.isDropdownOpen = false;
    //  console.log('vedio is called' ,this.artifact[0])
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }


  goToDetailPage(artifact) {
    // 
    // let url = `/video_details/home/${artifact.account_folder_id}/${artifact.doc_id}`
    if (artifact.published == 1)
      this.router.navigate(['/video_details/home/', artifact.account_folder_id, artifact.doc_id]);
    // window.open(url.toString(),'_self');
  }
  public popup_display(val) {
    // this.detailsService.set_popup(val);
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
  HrefLink(artifact) {
    let url = `/video_details/home/${artifact.account_folder_id}/${artifact.doc_id}`
    return url
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }


}
