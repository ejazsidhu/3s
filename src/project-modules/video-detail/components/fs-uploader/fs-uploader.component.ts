import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FilestackService } from "@videoDetail/services";
import { HeaderService } from "@projectModules/app/services";

@Component({
  selector: 'fs-uploader',
  templateUrl: './fs-uploader.component.html',
  styleUrls: ['./fs-uploader.component.css'], 
  providers: [FilestackService]
})
export class FsUploaderComponent implements OnInit {

	@Output() onUpload: EventEmitter<any> = new EventEmitter<any>();
	@Input() label;
	@Input() configuration;
  @Input() source;
  private whereFrom;
  public header_color;
  public primery_button_color;
  public secondry_button_color;
  videoOptions:any={}
  constructor(private filestackService:FilestackService, private headerService: HeaderService) { }

  ngOnInit() {
    let sessionData:any = this.headerService.getStaticHeaderData();
    // Dynamic Button Colors Start
    this.header_color = sessionData.header_color;
    this.primery_button_color = sessionData.primery_button_color;
    this.secondry_button_color = sessionData.secondry_button_color;
    // Dynamic Button Colors End
    this.RunSubscribers();
    this.videoOptions =  {
      maxFiles: 20,
       accept: ['image/*','text/*','.pdf'], //GLOBAL_CONSTANTS.RESOURCE_UPLOAD_EXTENSIONS, 
      fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'url', 'onedrive'],
      customText: {
        'File {displayName} is not an accepted file type. The accepted file types are {types}': 'File {displayName} is not an accepted file type. The accepted file types are image, text',
        }
  };
  }

  private RunSubscribers(){

  	this.filestackService.FilesUploaded.subscribe((files)=>{
  		
  		this.onUpload.emit({files:files, from:this.whereFrom});

  	})
 	 	
  }

  public StartUpload(){

    this.whereFrom = this.source;
  	this.filestackService.InitFileStack();
    this.filestackService.showPicker(this.configuration || this.videoOptions);

  }

}
