import { Component, OnInit, HostListener  } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { HeaderService } from "@app/services";
import { BsDatepickerConfig, BsLocaleService, esLocale, defineLocale } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import 'rxjs/add/operator/filter';
import { environment } from '@src/environments/environment.prod';
import { url } from 'inspector';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-coaching-main',
  templateUrl: './coaching-main.component.html',
  styleUrls: ['./coaching-main.component.css']
})
export class CoachingMainComponent implements OnInit {
  items:any ;
  isClicked=[true,false,false,false];
  date:string;
  enable_assessment_tracker:any;
  enable_coaching_tracker:any;
  bsConfig: Partial<BsDatepickerConfig>;
  isLoadingBread: boolean = true;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  sessionData: any;
  isLoading:boolean=true;
  searchCoache:any;
  translation:any;
  private subscription: Subscription;
  page: number = 1;
  total_coach: any;
  tracker_request_ref: any = null;
  paginationSkeleton: boolean=true;
  searchInput: Subject<string> = new Subject();
  @HostListener("window:scroll", ["$event"])
  onScroll(event) {
    // setTimeout(()=>{
    if (this.paginationSkeleton) {
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
    } else if (!this.paginationSkeleton && this.total_coach > this.items.length) {
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
          this.coachingTracker(true);
          window.scroll(
            0,
            document.body.offsetHeight -
            this.getPercentage(document.body.offsetHeight, 9)
          );
        }
      }, 100);
    }
  }
  constructor(private route: ActivatedRoute,private router:Router, private headerService: HeaderService,private toastr:ToastrService, private http:HttpClient,private bsLocale:BsLocaleService) { 
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
    setTimeout(() => {
    this.isLoadingBread = false
    }, 1500);
    this.maxDate.setDate(this.maxDate.getDate() - 30);
    this.bsRangeValue = [this.maxDate, this.bsValue];
  }

  ngOnInit() {
    this.bsConfig = Object.assign({}, { containerClass: 'theme-default' });
    let sessionData:any = this.headerService.getStaticHeaderData();
    console.log(sessionData.language_translation.current_lang)
    if (sessionData.language_translation.current_lang == 'es') defineLocale(sessionData.language_translation.current_lang, esLocale);
    this.bsLocale.use(sessionData.language_translation.current_lang);
    this.route.queryParams.subscribe((param:any)=>{
      if(param.date=='1month'){
        this.setParams(param.date)
      }else if(param.date=='3months'){
        this.setParams(param.date)
      }else if(param.date=='6months'){
        this.setParams(param.date)
      }else if(param.date=='12months'){
        this.setParams(param.date)
      }
    })
    this.sessionData = sessionData;
    this.enable_assessment_tracker = sessionData.enable_assessment_tracker;
    this.enable_coaching_tracker = sessionData.enable_coaching_tracker;
    if(!sessionData.tracker_permission)
        {
          
          this.toastr.info(this.translation.coaching_tracker_you_do_not_have_access_to_huddle_tracker);
          setTimeout(() => {
            this.router.navigate(['dashboard_angular/home']);
          }, 2000);
          return;
        }
    if(this.enable_coaching_tracker == '0')
    {
      this.router.navigate([`trackers/assessment`]);
      return;
    }
    this.setParams('1month')
    this.SubscribeSearch();
  }
  setParams(param:string){
    this.page=1;
    this.date=param;
    this.maxDate = new Date();
    if(this.date=="1month"){
      this.maxDate.setDate(this.maxDate.getDate() - 30);
      this.bsRangeValue = [this.maxDate, this.bsValue];
    }else if(this.date=="3months"){
      this.maxDate.setDate(this.maxDate.getDate() - 90);
      this.bsRangeValue = [this.maxDate, this.bsValue];
    }else if(this.date=="6months"){
      this.maxDate.setDate(this.maxDate.getDate() - 180);
      this.bsRangeValue = [this.maxDate, this.bsValue];
    }else if(this.date=="12months"){
      this.maxDate.setDate(this.maxDate.getDate() - 365);
      this.bsRangeValue = [this.maxDate, this.bsValue];
    }
    this.router.navigate(['/trackers/coaching'], { queryParams: { date: param  } });
    this.isLoading = true;
    this.paginationSkeleton=true;
    this.coachingTracker();
  }
    //if(param=="1month"){

  //constructor(private headerService: HeaderService,private router:Router,private toastr:ToastrService) { }
 
  
  //}
  coachingTracker(increment?){
    if (increment) {this.page++;this.paginationSkeleton=true;}
    let sessionData:any = this.headerService.getStaticHeaderData();
    let url = environment.APIbaseUrl +"/coaching_tracker";
    let body = {
      start_date:this.bsRangeValue[0].toISOString().split('T')[0],
      end_date:this.bsRangeValue[1].toISOString().split('T')[0],
      user_current_account:sessionData.user_current_account,
      search:'',
      page:this.page,
    }
    if(this.searchCoache!=''){
      body.search=this.searchCoache;
    }
      if (this.tracker_request_ref) {
          this.tracker_request_ref.unsubscribe();
      }
    this.tracker_request_ref = this.http.post(url,body).subscribe((d:any)=>{
      if(d.status){
        d.data.account_coaches.forEach((x,i) => {
          if(this.sessionData.user_current_account.users_accounts.role_id=='115' && i==0){
            x.isOpen=true;
          }else{
            x.isOpen = false;
          }
          x.full_name = x.first_name + ' ' + x.last_name;
          x.Coachees.page_id=x.id;
          x.Coachees.page=1;
          x.Coachees.forEach(d => {
            let coacheeUrl = environment.baseUrl + '/analytics_angular/playcard/' + this.sessionData.user_current_account.accounts.account_id + '/' + d.id + '/' + this.bsRangeValue[0].toISOString().split('T')[0] + '/' + this.bsRangeValue[1].toISOString().split('T')[0] + '/2';
            d.full_name = d.first_name + ' ' + d.last_name;
            d.analytic_url = coacheeUrl;
            d.coach_id=x.id;
            d.bsRangeValue = this.bsRangeValue;
          });
        });
        if(this.page==1){
          this.isLoading=false;
          this.items = d.data.account_coaches;
          this.total_coach = d.data.account_coaches_count;
        }else{
          this.items = [...this.items,...d.data.account_coaches];
        }
      }
      setTimeout(() => {
        this.paginationSkeleton = false;
      }, 100);
      this.tracker_request_ref.unsubscribe();
    })
  }
  private getPercentage(n, what) {
    return (what / 100) * n;
  }
  public OnSearchChange(event) {
		this.searchInput.next(event);
	}

  private SubscribeSearch() {

		this.searchInput
			.pipe(debounceTime(1000), distinctUntilChanged())
			.subscribe(value => {
        this.page = 1;
        this.isLoading=true;
        this.paginationSkeleton=true;
				this.coachingTracker(false);
			});
	}
  dropdownToggle(item){
    this.items.forEach((x,i) => {
      if(x.id == item.id){
        if(this.items[i].isOpen==true){
          console.log('Sort Working')
          this.items.sort((a, b)=>{
            var nameA = a.full_name.toUpperCase(); // ignore upper and lowercase
            var nameB = b.full_name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }         
          });
          this.items[i].isOpen=false;
        }else{
        console.log('Array Arrange Working')
        this.items.splice(i,1);
        this.items.sort((a, b) => {
          var nameA = a.full_name.toUpperCase(); // ignore upper and lowercase
          var nameB = b.full_name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
        });
        this.items.unshift(item);
        this.items = [...this.items];
        window.scrollTo(0,0);
        x.isOpen=!x.isOpen;
        }
      }else{
        x.isOpen=false;
      }
    });

  }
  coachUrl(item){
    if (item) {
      let url = environment.baseUrl + '/analytics_angular/playcard/' + this.sessionData.user_current_account.accounts.account_id + '/' + item.id + '/' + this.bsRangeValue[0].toISOString().split('T')[0] + '/' + this.bsRangeValue[1].toISOString().split('T')[0] + '/2';
      return url;
    }
  }
  exportApi(type,item){
    let url = environment.APIbaseUrl + '/export_coaching_tracker';
    let body = {
      export_type:type,
      user_current_account:this.sessionData.user_current_account,
      start_date:this.bsRangeValue[0].toISOString().split('T')[0],
      end_date:this.bsRangeValue[1].toISOString().split('T')[0],
      single_coach_id:item.id,
    }
    this.http.post(url,body,{responseType:'blob'}).subscribe((d:any)=>{
      const datapdf = new Blob([d],{type:'application/pdf'})
      const dataxlsx = new Blob([d],{type:'application/pdfapplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
      if(type=="pdf"){
        FileSaver.saveAs(datapdf,`Coaching Tracker ${item.full_name} PDF Export.pdf`);
      }else{
        FileSaver.saveAs(dataxlsx,`Coaching Tracker ${item.full_name} EXCEL Export.xlsx`)
      }
    },err=>{
      this.toastr.error(this.translation.something_went_wrong_coaching_tracking_new)
    })
  }

  datePicker(event){
    if (event[0] == null) {
			this.toastr.info(this.translation.analytics_invalid_start_date_coaching_tracker);
			return;
		}

		if (event[1] == null) {
			this.toastr.info(this.translation.analytics_invalid_end_date_coaching_tracker);
			return;
		}

		if (!event[0] || !event[1]) {
			this.toastr.info(this.translation.analytics_start_and_end_dates_coaching_tracker);
			return;
    }
    if(event[0] && event[1]){
      this.page=1;
      this.isLoading=true;
      this.paginationSkeleton=true;
      this.date='';
      this.router.navigate(['/trackers/coaching']);
      this.coachingTracker(false);
    }
  }

}
