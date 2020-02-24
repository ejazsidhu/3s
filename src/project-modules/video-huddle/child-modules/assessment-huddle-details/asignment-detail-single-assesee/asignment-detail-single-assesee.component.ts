import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AssessmentService } from '../services/assessment.service';
// import { HeaderService } from 'src/app/header.service';
import { DetailsHttpService } from '../../details/servic/details-http.service';
import { environment } from '@src/environments/environment';
import { HeaderService } from '@src/project-modules/app/services';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-asignment-detail-single-assesee',
  templateUrl: './asignment-detail-single-assesee.component.html',
  styleUrls: ['./asignment-detail-single-assesee.component.css']
})
export class AsignmentDetailSingleAsseseeComponent implements OnInit, OnDestroy {
  @ViewChild('popUp', { static: false }) popUpModel;
  @ViewChild('deleteArtifectModal', { static: false }) deleteArtifectModal: ModalDirective;
  basePath = environment.baseUrl;
  public dataLoading: boolean = true;
  private userId: number;
  public sessionData: any = {};
  public userHuddleSubmitted: boolean | number = true;
  public userArtifects: any = [];
  public userVideoArtifects: any = [];
  public userResourceArtifects: any = [];
  public artifact: any = {};
  public huddleId: number;
  public huddleData: any;
  public userName: string = '';
  public userImage: string = '';
  // public artifectModalRef: BsModalRef;
  subscription: Subscription;
  translation: any;
  showDeleteBtn: boolean = true;
  userAccountLevelRoleId: any=0;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public headerService: HeaderService,
    public detailsService: DetailsHttpService,
    private assessmentService: AssessmentService,
    public toastr: ToastrService
  ) {
    this.activatedRoute.params.subscribe(param => {
      this.userId = param.id;
    });

    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.sessionData = this.headerService.getStaticHeaderData();
    this.userAccountLevelRoleId = this.sessionData.user_permissions.roles.role_id;

    this.huddleId = this.assessmentService.getHuddleId();
    this.getUserArtifects();
  }

  private getUserArtifects() {
    const data = {
      user_id: this.userId,
      account_id: this.sessionData.user_current_account.users_accounts.account_id,
      role_id: this.sessionData.user_current_account.users_accounts.role_id,
      huddle_id: this.huddleId,
      only_user_artifacts: 1,
      page: 1,
      send_remaining_artifact: 1,
      logged_in_user_id: this.sessionData.user_current_account.User.id
    };

    this.assessmentService.getUserArtifects(data).subscribe((response: any) => {
      if (!response.success) {
        alert('Something went wrong while getting data from server');
        this.router.navigate(['/assessment', this.huddleId]);
      } else {
        this.userArtifects = response.artifects.all;
        this.userArtifects.forEach(artifec => {
          if (artifec.doc_type == 1) this.userVideoArtifects.push(artifec);
          else this.userResourceArtifects.push(artifec);
        });

        // check if current user has submitted the huddle: start

        // const currentHuddleAssessee = response.huddles_data.HuddleUsers.find(user => user.user_id === this.userId);
        const currentHuddleAssessee = response.huddles_data.HuddleUsers.find(user => {
          return user.user_id == this.userId;
        });
        if (currentHuddleAssessee) this.userHuddleSubmitted = currentHuddleAssessee.is_submitted;
        // check if current user has submitted the huddle: end


        this.detailsService.setArtifactlList(this.userArtifects);
        this.huddleData = response.huddles_data;
        this.userName = `${response.user_info.first_name} ${response.user_info.last_name}`;
        this.userImage = this.assessmentService.getUserAvatar(response.user_info.id, response.user_info.image);
      }
      this.dataLoading = false;
    }, error => console.log('error :', error))
  }

  public OpenModel(artifact, modalName) {
    this.artifact = artifact;
    if (modalName === 'download')
      this.popUpModel.DownloadResource(artifact);
    else if (modalName === 'delete') {
      if (confirm(this.translation.artifacts_deleting_video_will_unsubmit_assessment)) {
        const todayDate = new Date();
        const deadlineDate = this.generateSubmissionDeadlineDate(this.huddleData.submission_deadline_date, this.huddleData.submission_deadline_time);
       // following if else code is commented because of ticket SW-1910
        // if (todayDate > deadlineDate) alert(this.translation.video_resource_cannot_be_deleted_after_submission_passed);
        // else this.popUpModel.showModal(modalName);
        // else {
          this.deleteArtifectModal.show();
        // }
      }
    }

  }

  private generateSubmissionDeadlineDate(date: string, time: string) {
    let deadlineDate = new Date(date);
    let timeParts = time.match(/(\d+)\:(\d+) (\w+)/);
    const hours = /am/i.test(timeParts[3]) ? parseInt(timeParts[1], 10) : parseInt(timeParts[1], 10) + 12;
    const minutes = parseInt(timeParts[2], 10);

    deadlineDate.setHours(hours);
    deadlineDate.setMinutes(minutes);

    return deadlineDate;

  }

  goToDetailPage(artifact) {
    if (artifact.doc_type == 2) {
      this.openResource(artifact)
    } else {
      // let url = `${this.basePath}/video_details/home/${artifact.account_folder_id}/${artifact.doc_id}?assessment=true`
      if (artifact.published == 1)
        this.router.navigate(['video_details/home', artifact.account_folder_id, artifact.doc_id], { queryParams: { assessment: 'true' } });
      // window.open(url.toString(), '_self');
    }
  }

  public openResource(artifact) {
    this.detailsService.openResource(artifact);
  }

  public artifectModalDelete() {
    this.showDeleteBtn = false;
    // this.artifact = artifact;
    let obj = {
      document_id: this.artifact.doc_id,
      huddle_id: this.artifact.account_folder_id,
      user_id: 0,
      doc_type: this.artifact.doc_type,
      account_id: this.sessionData.user_current_account.users_accounts.account_id
    };
    ({
      User: {
        id: obj.user_id
      }
    } = this.sessionData.user_current_account);
    this.detailsService.DeleteResource(obj).subscribe(data => {
      let d: any = data;
      this.artifectDeleteModalHide();

      if (d.success) {
        let obj={
          artifact:this.artifact,
          userId:this.userId,
          type:(this.artifact.doc_type==1)?"video":"resource"
        }

        let str=`A ${obj.type} in ${obj.artifact.first_name}'s ${this.translation.artifacts_assessment_was_deleted_and_unsubmitted }`;
        // `Name:${obj.artifact.first_name},Resource Name:${obj.artifact.original_file_name}${this.translation.artifacts_assessment_has_been_unsubmitted }`
        this.assessmentService.setDeleteObject(obj);
        // this.toastr.success(this.translation.artifacts_delete_item_selected_is_delete);
        this.toastr.info(str);

        this.router.navigate(['video_huddles/assessment', this.huddleId])
      }
      else {
        this.toastr.info(d.message)

      }
      this.artifact.is_dummy = 1;
      this.showDeleteBtn = true;

    }, error => {
      this.toastr.error(error.message)
    });
  }

  public artifectDeleteModalHide(): void {
    this.deleteArtifectModal.hide();
  }

  public backToAssessmentDetails(huddleId){
    this.detailsService.updateRefreshGetParticipantList(true);
    this.router.navigate(['/video_huddles/assessment', huddleId]);
  }

  ngOnDestroy() {
    // if (this.deleteArtifectModal) this.deleteArtifectModal.hide();
    this.subscription.unsubscribe();
  }

}
