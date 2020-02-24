import { Component,OnInit , ViewChild, HostListener, EventEmitter} from '@angular/core';
import { ModalDirective  } from 'ngx-bootstrap/modal';
import { environment } from "../../../../environments/environment";
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { HeaderService } from "@app/services";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';

@Component({
  selector: 'app-assessment-main',
  templateUrl: './assessment-main.component.html',
  styleUrls: ['./assessment-main.component.css']
})
export class AssessmentMainComponent implements OnInit {

  @ViewChild('assessor_list_popup',{static:true}) assessor_list_popup: ModalDirective;

  session_detail:any = '';
  account_id:any;
  user_id:any ;
  user_role:any ;
  assessments_list:any;
  assessors_list:any;
  search_field_value:any;
  skeletonLoading: boolean;
  total_huddles: any;
  page: number = 1;
  huddle_sort: number = 1;
  isGroupImage: boolean;
  search_bool:boolean = false;
  publish_date_check:boolean = false;
  due_date_check:boolean = false;
  translations:any={};
  staticImageServiceIp = "https://s3.amazonaws.com/sibme.com/static/users/";
  lang:any;
  isLoadingBread:boolean = false;
  isLoading:boolean = true;
  lazy_loading_process:boolean = false;
  assessment_list_check:boolean = true;
  tracker_permission:boolean;
  enable_assessment_tracker:any;
  enable_coaching_tracker:any;
  private searchInput: Subject<string> = new Subject();
  private subscription: Subscription;
  private projectTitle: string = 'trackers_translations';
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  @HostListener("window:scroll", ["$event"])
  onScroll(event) {
    // setTimeout(()=>{
    if (this.skeletonLoading) {
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
    } else if (!this.skeletonLoading && this.total_huddles > this.assessments_list.length) {
      setTimeout(() => {
        let doc = document.documentElement;
        let currentScroll =
          (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        var d = document.documentElement;
        var offset = d.scrollTop + window.innerHeight;
        var height = d.offsetHeight;
        if (
          window.innerHeight + window.pageYOffset >=
          document.body.offsetHeight - 2
        ) {
          this.getAssessmentHuddles(true);
          window.scroll(
            0,
            document.body.offsetHeight -
            this.getPercentage(document.body.offsetHeight, 9)
          );
        }
      }, 100);
    }
  }

  constructor(private http: HttpClient,private headerService: HeaderService,private toastr:ToastrService,private router:Router) {
    
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translations = languageTranslation;
      console.log(this.translations);
    });
    setTimeout(() => {
      this.isLoadingBread=true
      }, 0);
   }

  ngOnInit() {
  this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.opts = { 
      position: 'right', // left | right
      barBackground: '#C9C9C9', // #C9C9C9
      barOpacity: '0.8', // 0.8
      barWidth: '10', // 10
      barBorderRadius: '20', // 20
      barMargin: '0', // 0
      gridBackground: '#D9D9D9', // #D9D9D9
      gridOpacity: '1', // 1
      gridWidth: '0', // 2
      gridBorderRadius: '20', // 20
      gridMargin: '0', // 0
      alwaysVisible: true, // true
      visibleTimeout: 1000, // 1000
    }
    this.skeletonLoading = true;
    let sessionData:any = this.headerService.getStaticHeaderData();
    this.session_detail = sessionData;
    this.account_id = sessionData.user_current_account.accounts.account_id;
    this.user_id = sessionData.user_current_account.User.id;
    this.user_role = sessionData.user_current_account.roles.role_id;
    this.search_field_value = '';
    this.lang = sessionData.language_translation.current_lang;
    this.enable_assessment_tracker = sessionData.enable_assessment_tracker;
    this.enable_coaching_tracker = sessionData.enable_coaching_tracker;
    
    if(!sessionData.tracker_permission)
        {
          this.isLoading = true;
          if(this.lang == 'es')
          {
          this.toastr.info('No puedes acceder a este Seguimiento de Equipo.');
          }
          else{
            this.toastr.info('You do not have access to Huddle Tracker.');
          }
          setTimeout(() => {
            this.router.navigate(['dashboard_angular/home']);
          }, 2000);
          
          this.assessments_list = [];
          return;
        }

    if(this.enable_assessment_tracker == '0')
    {
      this.router.navigate([`trackers/coaching`]);
    }
    this.getAssessmentHuddles(false);
    this.SubscribeSearch();
    if(this.huddle_sort == 1 || this.huddle_sort == 3)
    {
      this.publish_date_check = true;
    }
    else if(this.huddle_sort == 2)
    {
      this.due_date_check = true;
    }

  }

  ngAfterViewInit()
  {
    //this.assessor_list_popup.show();
  }
  getAssessmentHuddles(increment?,search = false){
    
    
    
    
    if (increment) {this.page++;this.lazy_loading_process = true;}
    this.skeletonLoading = true;
    let obj = {

      account_id: this.account_id,
      user_id:this.user_id,
      user_current_account: this.session_detail.user_current_account,
      role_id:this.user_role,
      huddle_type: 3,
      huddle_sort: this.huddle_sort,
      page: this.page,
      title: null,
      lang:this.lang

    }
    if(this.search_field_value!=''){
      obj.title = this.search_field_value;
      if(this.page == 1)
      {
      this.assessment_list_check = false;this.lazy_loading_process=true;
      }
    }

    this.getAssessmentList(obj).subscribe((data: any) => {
      if(this.page == 1) {
        this.tracker_permission = data.tracker_permission;
        if(!this.tracker_permission)
        {
          this.isLoading = true;
          this.toastr.info('You do not have access to Huddle Tracker.');
          setTimeout(() => {
            this.router.navigate(['dashboard_angular/home']);
          }, 2000);
          
          this.assessments_list = [];
          return;
        }else
        {
          data.huddles.forEach(x => {
            x.isOpen = false;
            x.page = 1;
          });  
        this.assessments_list = data.huddles;
        this.total_huddles = data.total_huddles;
        this.assessment_list_check = true;this.lazy_loading_process=false;
        }
      }else{
        data.huddles.forEach(x => {
          x.isOpen = false;
          x.page = 1;
        }); 
        this.assessments_list = [...this.assessments_list, ...data.huddles];
        this.lazy_loading_process = false;
        //this.assessments_list.push(data.huddles);
      }
      this.isLoading = false;
      if(!search)
      {
        this.search_bool = false;
      }

      if(this.huddle_sort == 1 || this.huddle_sort == 3)
      {
      this.publish_date_check = true;
      this.due_date_check = false;
      }
      else if(this.huddle_sort == 2)
      {
      this.due_date_check = true;
      this.publish_date_check = false;
      }
      console.log(this.assessments_list);
      setTimeout(() => {
        this.skeletonLoading = false;
      }, 100);
    })
  }
  private getPercentage(n, what) {
    return (what / 100) * n;
  }
  public getAssessmentList(obj){
  	
  	let path = environment.APIbaseUrl+"/get_assessment_tracker_huddles";
  	return this.http.post(path, obj);

  }

  showFullAssessorList(obj,event)
  {
    console.log(obj);
    event.stopPropagation();
    this.assessors_list = obj.participants.assessor;
    this.assessor_list_popup.show();


  }
  ImageUrlBuilder(participent: any) {
    if (participent.image == 'groups') {
      this.isGroupImage = true
      return true
    } else {
      this.isGroupImage = false
      let image = participent.image || "assets/trackers/img/photo-default.png";
      let url = `${this.staticImageServiceIp}${participent.user_id}/${
        participent.image
        }`;
      return participent.image ? url : image;
    }

  }
  search()
  {
    let obj = {

      account_id: this.account_id,
      user_id:this.user_id,
      user_current_account: this.session_detail.user_current_account,
      role_id:this.user_role,
      huddle_type: 3,
      huddle_sort: 0,
      page: 1,
      title:this.search_field_value

    }

    this.getAssessmentList(obj).subscribe((data: any) => {

      this.assessments_list = data;
      console.log(this.assessments_list);
      
    })
    
  }


  public OnSearchChange(event) {
		this.searchInput.next(event);
	}

  private SubscribeSearch() {

		this.searchInput
			.pipe(debounceTime(1000), distinctUntilChanged())
			.subscribe(value => {
        this.page = 1;
        this.search_bool = true;
				this.getAssessmentHuddles(false,this.search_bool);
			});
	}




}
