import { Directive, OnInit, Output, EventEmitter, Input, HostListener} from '@angular/core';
import { FilestackService } from '../services';
import { HeaderService } from "@projectModules/app/services";
import { DetailsHttpService } from "@videoHuddle/child-modules/details/servic/details-http.service";
@Directive({
  selector: '[appFSUploader]',
  providers: [ FilestackService ],
})
export class FSUploaderDirective implements OnInit {
    @Input() selectedConfiguration;
    @Input() source;
    @Output() onUpload: EventEmitter<any> = new EventEmitter<any>();
    @Input('resourceAllowed') resource_submission_allowed: any;
    private whereFrom;
    public header_color;
    public primery_button_color;
    public secondry_button_color;
    can_upload:any;
    can_message:any;
  constructor(private filestackService:FilestackService, private headerService: HeaderService, private detailsService: DetailsHttpService) {
    // console.log("FS Directive loaded")
  }

    public StartUpload(){
      this.whereFrom = this.source;
      if(this.whereFrom == 'Upload')
      {
      let that = this;
      let sessionData: any = that.headerService.getStaticHeaderData();
      let obj: any = {};
        obj.huddle_id = this.detailsService.parameters;
        obj.user_id = sessionData.user_current_account.User.id;
        this.detailsService.GetAssesseeVideoCount(obj).subscribe((data: any) => {
          console.log(this.whereFrom);
           this.can_upload = data.can_upload;
           this.can_message = data.message;
        if(data.can_upload == 'no')
        {
            alert(data.message);
        }

        

        else{

              this.whereFrom = this.source;
              this.filestackService.InitFileStack();
              this.filestackService.showPicker(this.selectedConfiguration,this.resource_submission_allowed);
              setTimeout(() => {
                if(this.whereFrom == 'Record'){
                  alert('Warning! If your internet connection is unstable you run the risk of video file corruption. We do not recommend recording videos online longer than 10 minutes. Use at your own risk.');
                }
              }, 500);
  
          }


        });

      }
      
      else if(this.can_upload == 'no')
      {
        alert(this.can_message);
        

      }else{
        this.whereFrom = this.source;
              this.filestackService.InitFileStack();
              this.filestackService.showPicker(this.selectedConfiguration,this.resource_submission_allowed);
              setTimeout(() => {
                if(this.whereFrom == 'Record'){
                  alert('Warning! If your internet connection is unstable you run the risk of video file corruption. We do not recommend recording videos online longer than 10 minutes. Use at your own risk.');
                }
              }, 500);
      }

       
    }

    @HostListener('click', ['$event']) onClick($event){
        this.StartUpload();
    }

    ngOnInit() {
        /*let sessionData:any = this.headerService.getStaticHeaderData();
        // Dynamic Button Colors Start
        this.header_color = sessionData.header_color;
        this.primery_button_color = sessionData.primery_button_color;
        this.secondry_button_color = sessionData.secondry_button_color;*/
        // Dynamic Button Colors End
        this.RunSubscribers();
    }

    private RunSubscribers(){

        this.filestackService.FilesUploaded.subscribe((files)=>{

            this.onUpload.emit({files:files, from:this.whereFrom});

        })

    }
}
