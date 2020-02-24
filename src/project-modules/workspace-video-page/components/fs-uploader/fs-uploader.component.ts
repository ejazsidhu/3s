import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FilestackService } from '../../services';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'fs-uploader',
  templateUrl: './fs-uploader.component.html',
  styleUrls: ['./fs-uploader.component.css'],
  providers: [FilestackService]
})

export class FsUploaderComponent implements OnInit, OnDestroy {

	@Output() onUpload: EventEmitter<any> = new EventEmitter<any>();
	@Input() label;
	@Input() configuration;
  @Input() source;
  private whereFrom;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  public header_data;
  public translation: any = {};
  private translationSubscription: Subscription;

  constructor(private filestackService:FilestackService, private headerService: HeaderService) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
    let sessionData:any = this.headerService.getStaticHeaderData();
    // Dynamic Button Colors Start
    this.header_color = sessionData.header_color;
    this.primery_button_color = sessionData.primery_button_color;
    this.secondry_button_color = sessionData.secondry_button_color;
    // Dynamic Button Colors End
  	this.RunSubscribers();
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

  private RunSubscribers(){

  	this.filestackService.FilesUploaded.subscribe((files)=>{
  		
  		this.onUpload.emit({files:files, from:this.whereFrom});

  	})
 	 	
  }

  public StartUpload(){

    this.whereFrom = this.source;
  	this.filestackService.InitFileStack();
    this.filestackService.showPicker(this.configuration);

  }

  ngOnDestroy(){
    this.translationSubscription.unsubscribe();
  }
}
