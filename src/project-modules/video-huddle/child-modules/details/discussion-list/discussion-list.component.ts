import {  Component,  OnInit,  OnDestroy,  HostListener,  ViewChild,  } from "@angular/core";
import { DetailsHttpService } from "../servic/details-http.service";
import { Router, ActivatedRoute } from "@angular/router";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import { Subject, Subscription } from "rxjs";
import { DiscussionService } from "../servic/discussion.service";
import { ToastrService } from "ngx-toastr";
import { HeaderService, SocketService, HomeService, AppMainService } from '@projectModules/app/services';
import * as _ from "underscore";
import io from "socket.io-client";
import { GLOBAL_CONSTANTS } from '@src/constants/constant';


// At the top of the file
declare global {
  interface Window {
    io: any;
  }
  interface Window {
    Echo: any;
  }
}

declare var Echo: any;

window.io = io;
window.Echo = window.Echo || {};

@Component({
  selector: "app-discussion-list",
  templateUrl: "./discussion-list.component.html",
  styleUrls: ["./discussion-list.component.css"]
})
export class DiscussionListComponent implements OnInit, OnDestroy {
  public page: number = 0;
  public Loadings: any = {};
  public discussions: any = [];
  public huddle_id: number = 0;
  public params: any = {};
  public total_discussions: number = -1;
  private searchInput: Subject<string> = new Subject();
  public SearchString: string = "";
  public selectedSort: number = 1;
  public editDiscData: any;
  public ModalRefs: any = {};
  public deletableDiscussion: any = {};
  public confirmDeleteString: string = "";
  private sessionData: any = [];
  public counter=0;
  public socket_listener:any;
  public header_data;
  public translation: any = {};
  private subscriptions: Subscription = new Subscription();
  private DISCUSSION_LS_KEYS = GLOBAL_CONSTANTS.LOCAL_STORAGE.DISCUSSION;
  private addDiscussionTAKey: string = '';
  private editDiscussionTAKey: string = '';

  @ViewChild("editDiscussion", {static: false}) editDiscussion;
  @ViewChild("deleteTemplate", {static: false}) deleteTemplate;

  public filterOptions: any = {
    topic: 1,
    date_created: 2,
    last_modified: 3,
    created_by: 4,
    unread: 5
  };
  sort: any;
  isReverse: boolean;
  bysearch: boolean;

  @HostListener("window:scroll", ["$event"])
  onScroll(event) {
    // setTimeout(()=>{
    if (this.Loadings.isNextPageLoading) {
      let doc = document.documentElement;
      let currentScroll =
        (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

      var d = document.documentElement;
      var offset = window.innerHeight + window.pageYOffset; //d.scrollTop + window.innerHeight;
      var height = d.offsetHeight;
      if (
        window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight - 2
      ) {
        window.scroll(0, currentScroll - 100);
      }
    } else if (
      !this.Loadings.isNextPageLoading &&
      this.total_discussions > this.discussions.length
    ) {
      setTimeout(() => {
        let doc = document.documentElement;
        let currentScroll =
          (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        var d = document.documentElement;
        var offset = d.scrollTop + window.innerHeight;
        var height = d.offsetHeight;

        // if (offset === height)
        if (
          window.innerHeight + window.pageYOffset >=
          document.body.offsetHeight - 2
        ) {
          // this.LoadNextPage(true);
          this.getDiscussions(this.params.id, true);
          // window.scroll(0, document.body.offsetHeight - this.getPercentage(document.body.offsetHeight, 8));
        }
      }, 100);
    } else {
      //window.scroll(0,document.body.offsetHeight-this.getPercentage(document.body.offsetHeight, 8));
    }
    // }, 100);
  }
  constructor(
    public appMainService:AppMainService,
    private detailService: DetailsHttpService,
    private fullRouter: Router,
    private ARouter: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private homeService: HomeService,
    private discussionService: DiscussionService,
    private headerService: HeaderService,
    private socketService: SocketService  ) {
      this.subscriptions.add(this.headerService.languageTranslation$.subscribe(languageTranslation => {
        this.translation = languageTranslation;
      })
      );
    }

  ngOnInit() {
      this.sessionData = this.headerService.getStaticHeaderData();
    // this.router.events.subscribe(val => {
    //   if (val instanceof RoutesRecognized) {
    //     console.log(val.state.root.firstChild.params);
    //     this.huddle_id = +val.state.root.firstChild.params["id"];
    //     console.log(this.huddle_id);
    //     this.getDiscussions(this.huddle_id);
    //   }
    // });
    this.ARouter.queryParams.subscribe(params => {
      params.search
      this.SearchString = params.search
      if(this.SearchString!=undefined){
        this.bysearch = true
      }else{
        this.bysearch = false
      }
      params.sort
      ? (this.sort = params.sort)
      : (this.sort = "");
      if(this.sort=="topic"){
        this.sort = "title"
        this.isReverse = false
      }else if(this.sort=="date_created"){
        this.sort = "created_date"
        this.isReverse = true
      }else if(this.sort=="created_by"){
        this.sort = "first_name"
        this.isReverse = false
      }else if(this.sort=="last_modified"){
        this.sort = "last_edit_date"
        this.isReverse = true
      }else if(this.sort=="unread"){
        this.sort= "unread"
        this.isReverse = false
      }else{
        this.sort = "date_createde"
        this.isReverse = true
      }
    });
    let breadcrumbs = this.discussionService.GetBreadcrumbs();
    if (
      breadcrumbs &&
      breadcrumbs[breadcrumbs.length - 1] &&
      breadcrumbs[breadcrumbs.length - 1].folder_id == -1
    ) {
      breadcrumbs.splice(breadcrumbs.length - 1, 1);
      // this.homeService.Breadcrumbs.emit(breadcrumbs);
					this.homeService.updateBreadcrumb(breadcrumbs)

    }

    this.SubscribeSearch();

    this.ARouter.queryParams.subscribe(params => {
      this.page = 0;
      this.SearchString = params.search ? params.search : "";
      this.selectedSort = params.sort ? this.filterOptions[params.sort] : "";
      this.params = this.detailService.GetParams();
      if (!this.selectedSort) {
        this.setQueryparams("topic", 1);
      } else {
        this.getDiscussions(this.params.id, true, true);
      }

      this.addDiscussionTAKey = `${this.DISCUSSION_LS_KEYS.ADD_TA}${this.params.id}_${this.headerService.getUserId()}`;
      this.editDiscussionTAKey = `${this.DISCUSSION_LS_KEYS.EDIT_TA}${this.params.id}_${this.headerService.getUserId()}`;

      // this.LoadNextPage(true);
    });

    setTimeout(() => {
      // this.params = homeParams;
      //this.getDiscussions(this.params.id, true);
    });

    // this.ARouter.params.subscribe(p => {
    //   this.huddle_id = +p["id"];
    //   console.log(this.huddle_id);
    //   this.getDiscussions(this.huddle_id);
    // });

    this.socketPushFunctionDiscussion();
    // this.processDiscussionEventSubscriptions();
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
    this.detailService.flagEmitter.subscribe((data:any)=>{
      // var abc = localStorage.getItem('new_discussion_object');
      // var new_obj = JSON.parse(abc);
      // //console.log('retrievedObject: ', new_obj);
      // this.discussions.unshift(new_obj);
      // debugger;
      // var abc = localStorage.getItem('unsaved_discussions_array');
      // var new_obj = JSON.parse(abc);
      // console.log('discussions in subscribe: ', this.discussions);
      // console.log("new object",new_obj);

    //   new_obj.forEach(o => {
      let dummyDiscussion=this.discussions.find(d=>d.fake_id==data.fake_id);
      let index=this.discussions.indexOf(d=>d.fake_id==data.fake_id)
      if(dummyDiscussion){
        this.discussions[index]=dummyDiscussion;
      }
      else  
        this.discussions.unshift(data);
      
    // });
      //this.discussions = [...this.discussions, ...new_obj]
      console.log("after merged array",this.discussions);
      
});
    this.detailService.removeUnsavedDiscussionEmitter.subscribe((d:any)=>{
     // debugger;
      var indexofcomment =  this.discussions.findIndex(x => x.uuid == d.uuid);
      this.discussions.splice(indexofcomment,1);
      this.discussions = [...this.discussions];

      // let tmpDiscussions = localStorage.getItem(`unsaved_discussions_array${this.params.id}`);
      let tmpDiscussionsArray = this.headerService.getLocalStorage(this.addDiscussionTAKey);
      if(Array.isArray(tmpDiscussionsArray)){
        tmpDiscussionsArray = tmpDiscussionsArray.filter(x => x.uuid != d.uuid);
        this.headerService.setLocalStorage(this.addDiscussionTAKey, tmpDiscussionsArray);
        // localStorage.setItem(`unsaved_discussions_array${this.params.id}`, JSON.stringify(tmpDiscussionsArray));
      }

      //console.log("in the removal of discussion", d);
     // console.log("index of",indexofcomment);
      //console.log("after spliced array",this.discussions);
    });

    /** Replace actual discussion if edit is not working section start */
    this.detailService.lsDiscussionEditArray$.subscribe((discussion:any) => {
      let disActIndex = this.discussions.findIndex(dis => dis.id == discussion.discussion_id);
      if(disActIndex > -1){
        this.discussions[disActIndex] = discussion;
        this.discussions = [...this.discussions];
      }
    });

    /** Replace actual discussion if edit is not working section end */


  }

  ngOnDestroy() {
    // this.socketService.destroyEvent(`discussions-list-${this.params.id}`);
    // this.socketService.destroyEvent(`discussion-comment-changes-${this.params.id}`);
    // this.socket_listener.unsubscribe();
    this.subscriptions.unsubscribe();
    if(this.ModalRefs.deletableDiscussion) this.ModalRefs.deletableDiscussion.hide();

  }

  private SubscribeSearch() {
    this.searchInput
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(value => {
        //console.log(value);
        let url = this.fullRouter.url;

        if (this.SearchString) {
          this.fullRouter.navigate([], {
            queryParams: { search: this.SearchString },
            queryParamsHandling: "merge"
          });
        } else {
          this.fullRouter.navigate([], {
            queryParams: { search: null },
            queryParamsHandling: "merge"
          });
        }
        // this.search();
      });
  }

  private socketPushFunctionDiscussion() {
    this.subscriptions.add(this.socketService.pushEventWithNewLogic(`discussions-list-${this.params.id}`).subscribe(data => this.processDiscussionEventSubscriptions(data)));
    this.subscriptions.add(this.socketService.pushEventWithNewLogic(`discussion-comment-changes-${this.params.id}`).subscribe(data => this.processDiscussionEventSubscriptions(data)));
  }

  public OnSearchChange(event) {
    this.searchInput.next(event);
  }

  setQueryparams(param, id) {
    this.fullRouter.navigate([], {
      queryParams: { sort: param },
      queryParamsHandling: "merge"
    });
    this.selectedSort = id;
    // this.getDiscussions(this.params.id, false);
  }

  async getDiscussions(id: number, next?, callFromNgOnInit?: boolean) {
    
    next && this.page++;
    !next && (this.page = 1);
    if(this.total_discussions<this.discussions.length){
      this.Loadings.isNextPageLoading = true;
    }
    let sessioData: any = this.headerService.getStaticHeaderData();

    let obj = {
      huddle_id: id,
      page: this.page,
      search: this.SearchString,
      sort: Object.keys(this.filterOptions)[this.selectedSort - 1],
      user_id: sessioData.user_current_account.User.id
    };

    let data: any = await this.detailService.GetDiscussions(obj).toPromise();
    //debugger;
    //  console.log(test);
    //  this.detailService.GetDiscussions(obj).subscribe(
    //(data: any) =>
    //{
    this.page == 1 && (this.total_discussions = data.total_discussions);
    // let total_pages=Math.ceil(this.total_discussions/12);
    //       if(this.page>total_pages){
    //         this.page=total_pages;
    //       }
    // if (data.discussions.length == 0) {
    //   this.total_discussions = data.discussions.length;
    // }

    if (this.page == 1) {
      // debugger;
      this.discussions = data.discussions;

      /** Restore add discussion try again array start */
      let addDiscussionTAArray = this.headerService.getLocalStorage(this.addDiscussionTAKey);
      if(Array.isArray(addDiscussionTAArray)){
        addDiscussionTAArray.forEach(discussion => {
          this.discussions.unshift(discussion);
        });
        this.total_discussions += addDiscussionTAArray.length;
      }
      /** Restore add discussion try again array end */

      /** Restore edit discussion try again array start */
      let tmpDiscussionEditArray = this.headerService.getLocalStorage(this.editDiscussionTAKey);
      if(Array.isArray(tmpDiscussionEditArray)){
        tmpDiscussionEditArray.forEach(tmpDis => {
          let disActIndex = this.discussions.findIndex(dis => dis.id == tmpDis.discussion_id);
          if(disActIndex > -1){
            this.discussions[disActIndex] = tmpDis;
            // this.discussions = [...this.discussions];
          }
          
        });
      }
      /** Restore edit discussion try again array end */
      
     } else {
       this.discussions = [...this.discussions, ...data.discussions];
      
    }

    setTimeout(() => {
      if(!(this.total_discussions<this.discussions.length)){
         this.Loadings.isNextPageLoading = false;
      }
    }, 300);
    //  },
    //  error => {}
    //  );
  }

  // public LoadNextPage(increment?) {
  //   if (increment) this.page++;

  //   let obj: any = {
  //     huddle_id: this.huddle_id
  //   };

  //   this.detailService.Loadings.IsLoadingArtifacts.emit(true);
  //   this.Loadings.isNextPageLoading = true;
  //   this.detailService.GetDiscussions(obj).subscribe((data: any) => {
  //     data.discussions.forEach(x => {
  //       this.discussions.push(x);
  //     });
  //     setTimeout(() => {
  //       this.Loadings.isNextPageLoading = false;
  //       this.detailService.Loadings.IsLoadingArtifacts.emit(false);
  //     }, 100);
  //   });
  // }

  public onDiscussionDelete(item) {
    // console.log(item);
    this.deletableDiscussion = JSON.parse(JSON.stringify(item));
    this.confirmDeleteString = "";
    this.ModalRefs.deletableDiscussion = this.modalService.show(
      this.deleteTemplate
    );
  }

  private processDiscussionEventSubscriptions(data) {
    console.log('data at web socket distributer',data)    // this.socket_listener = this.socketService.EventData.subscribe(data => {
      switch (data.event) {
        case "discussion_deleted":
          this.isAllowed();
          this.processDiscussionDeleted(data.data[0]);
          break;

        case "discussion_added":
          this.isAllowed();
          this.processDiscussionAdded(data.data[0]);
          break;

        case "discussion_edited":
          this.isAllowed();
          this.processDiscussionEdited(data.data[0]);
          break;
        case "comment_added":
                  this.isAllowed();
                  this.processCommentAdded(data,"added");
                  break;
        case "comment_deleted":
                  this.isAllowed();
                  this.processCommentAdded(data,"deleted");
                  break;

        default:
          // code...
          break;
      }
    // });
  }

  private isAllowed() {}

  private processDiscussionDeleted(discussion) {
    this.discussions = _.without(
      this.discussions,
      _.findWhere(this.discussions, {
        id: discussion.id
      })
    );

    this.total_discussions--;

    if(discussion.created_by != this.sessionData.user_current_account.User.id)
    {
      this.toastr.info(this.translation.discussion_discussion_deleted);
    }
  }

  private processDiscussionAdded(discussion) {
    if(discussion.parent_comment_id == 0)
    {
      console.log(discussion)
      let dummyDiscussion=this.discussions.find(d=>d.fake_id==discussion.fake_id);
      let index=this.discussions.findIndex(d=>d.fake_id==discussion.fake_id);
      console.log('d index',index,'d1',dummyDiscussion)
      if(index > -1){
        debugger
        this.discussions.splice(index,1);
      }


      this.discussions.push(discussion);

    }

    this.total_discussions++;

    if(discussion.created_by != this.sessionData.user_current_account.User.id)
    {
         // console.log('New Discussion Added.');
        this.toastr.info(this.translation.discussion_new_discussion_added);
    }
  }

  private processCommentAdded(data,event) {
      let index = -1;
      this.discussions.forEach((item, i)=>{
          item.id == data.discussion_id && (index = i);
      });

      let temp_item = this.discussions[index];
      let user_id = this.sessionData.user_current_account.User.id;
      if(temp_item)
      {
          if(event == "added")
          {
              temp_item.reply_count++;
              if(user_id != data.data[0].created_by)
              {
                  temp_item.unread_comments++;
              }
          }
          else if(event == "deleted")
          {
              temp_item.reply_count--;
              if(user_id != data.data[0].created_by)
              {
                  temp_item.unread_comments--;
              }
          }
          this.discussions[index] = temp_item;
      }
  }

  private processDiscussionEdited(discussion) {
    
    let index = -1;
    this.discussions.forEach((item, i)=>{
        item.id == discussion.id && (index = i);
    });

    this.discussions[index] = discussion;
      if(discussion.created_by != this.sessionData.user_current_account.User.id)
      {
          this.toastr.info(this.translation.discussion_discussion_updated);
         // console.log('Discussion Updated.');
      }
  }

  public ConfirmDelete() {
    this.confirmDeleteString='DELETE';
    if (this.confirmDeleteString == "DELETE") {
      this.counter=1;
      let obj:any = {
        discussion_id: this.deletableDiscussion.id,
        original_discussion_id: this.deletableDiscussion.id,
      };

      const params = this.detailService.GetParams();
      obj.huddle_id = params.id;
      
        this.appMainService.DeleteDiscussion(obj).subscribe(
          data => {
          let d: any = data;
          if (d.success) {
            // this.toastr.success(
            //   this.translation.discussion_discussion_deleted_successfully
            // );

            // this.discussions = this.discussions.filter(
            //   d => d.id != this.deletableDiscussion.id
            // );
          } else {
            //this.toastr.info(d.message, "Delete confirmation");
          }
          // this.ModalRefs.deletableDiscussion.hide();
          this.deSelectDelete();
          this.deletableDiscussion = {};
          // this.getDiscussions(this.huddle_id);
        },
        error => {
          this.toastr.error(error.message);
        }
      );
    } else {
      this.toastr.info(this.translation.discussion_type_delete);
    }
  }
  deSelectDelete(){
    this.ModalRefs.deletableDiscussion.hide();
    let that = this;
    setTimeout(function(){
      that.counter=0;
    },500);
  }

  TriggerTextChange(ev){
    if(this.counter==0){
      if(ev.keyCode==13) {
        this.ConfirmDelete()
      }
    }
    
  }

  // private getPercentage(n, what) {
  //   return (what / 100) * n;
  // }
}
