import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import * as _ from "underscore";

import { HeaderService, AppMainService } from "@app/services";
import { MainService } from '@videoPage/services';

@Component({
  selector: 'video-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit, OnDestroy {

  @Input('comments') comments;
  @Input('EnablePublish') EnablePublish;
  @Input('permissions') permissions;
  @Input('VideoInfo') VideoInfo;
  @Input('customMarkers') customMarkers;
  @Input('params') params;
  @Input('classes') classes;
  @Input('staticFiles') staticFiles;
  @Input('settings') settings;

  public currentComment: any = {};

  private header_data: any;
  public modalRef: BsModalRef;

  constructor(private headerService: HeaderService, private appMainService: AppMainService, public mainService: MainService,
    private modalService: BsModalService) { }

  ngOnInit() {

    this.header_data = this.headerService.getStaticHeaderData();

  }


  public ApplySettings(settings) {

    // if (typeof (settings.sortBy) == "number") {
    //   this.commentsSortBy = settings.sortBy;
    //   if (settings.sortBy == 1) {

    //     this.comments = _.sortBy(this.comments, (c) => { return new Date(c.created_date) });

    //   } else if (settings.sortBy == 0) {
    //     this.comments = _.sortBy(this.comments, (c) => { return new Date(c.created_date) });
    //     this.comments = this.comments.reverse();
    //   } else if (settings.sortBy == 2) {

    //     let wholeComments = this.comments.filter((c) => { return c.time == 0 || c.time == null; });
    //     let timeComments = this.comments.filter((c) => { return c.time > 0 });


    //     this.comments = _.sortBy(timeComments, (c) => { return new Date(c.time) }).concat(wholeComments);

    //   }

    // }
    // if (typeof (settings.autoscroll) == "boolean") {

    //   this.settings.autoscroll = settings.autoscroll;

    // }

  }

  public getValidCommentCount() {

    if (!this.comments || this.comments.length <= 0) return 1;

    return _.where(this.comments, { valid: true }).length;

  }

  public ResolvePublish(flag) {
    this.modalRef.hide();
    if (flag == 1) {
      const obj = {
        huddle_id: this.params.huddle_id,
        video_id: this.params.video_id,
        user_id: this.header_data.user_current_account.User.id,
        account_id: this.header_data.user_current_account.accounts.account_id,
        account_role_id: this.header_data.user_current_account.users_accounts.role_id,
        current_user_email: this.header_data.user_current_account.User.email
      };

      this.mainService.PublishFeedback(obj).subscribe();
    }
  }

  public PublishFeedback(template) {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  ngOnDestroy() { }
}
