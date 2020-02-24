import { Directive, OnInit, Output, EventEmitter, Input, HostListener, OnDestroy} from '@angular/core';
import { FilestackService } from '../services';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';
@Directive({
  selector: '[appFSUploader]',
  providers: [ FilestackService ],
})
export class FSUploaderDirective implements OnInit, OnDestroy {
    @Input() selectedConfiguration;
    @Input() source;
    @Output() onUpload: EventEmitter<any> = new EventEmitter<any>();
    private whereFrom;
    public header_color;
    public primery_button_color;
    public secondry_button_color;
  sessionData;
  public translation: any = {};
  private subscription: Subscription;
  constructor(private filestackService:FilestackService, private headerService: HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
    this.sessionData = this.headerService.getStaticHeaderData();
    // this.translation = this.sessionData.language_translation; // changed to observable stream
  }

    public StartUpload(){

        this.whereFrom = this.source;
        this.filestackService.InitFileStack();
        this.filestackService.showPicker(this.selectedConfiguration);

    }

    @HostListener('click', ['$event']) onClick($event){
        this.StartUpload();
        setTimeout(() => {
            if(this.whereFrom == 'Record'){
              alert(`${this.translation.workspace_warningofuploading}`);
            }
          }, 500);
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

    ngOnDestroy(){
      this.subscription.unsubscribe();
    }
}
