import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import { PlayerService, MainService } from '@videoPage/services';
import { environment } from '@src/environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'video-page-attachments',
  templateUrl: './video-page-attachments.component.html',
  styleUrls: ['./video-page-attachments.component.css']
})
export class VideoPageAttachmentsComponent implements OnInit {


  @Input('translation') translation:any;
  @Input('staticFiles') staticFiles:any;
  @Input('userAccountLevelRoleId') userAccountLevelRoleId:any;
  @Input('currnetUser') currnetUser:any;

  

  
  videoOptions:any
  DeletableFile: any;
  public modalRef:BsModalRef;
  
  constructor(private modalService :BsModalService,private playerService:PlayerService,public mainService:MainService) { }

  ngOnInit() {
    this.videoOptions =  {
      maxFiles: 20,
       accept: GLOBAL_CONSTANTS.RESOURCE_UPLOAD_EXTENSIONS, //['image','text'],
      fromSources: ['local_file_system', 'dropbox', 'googledrive', 'box', 'url', 'onedrive'],
      customText: {
        'File {displayName} is not an accepted file type. The accepted file types are {types}': 'File {displayName} is not an accepted file type. The accepted file types are image, text',
        }
  };
  }


  public Seek(val){
    
    if(val==this.translation.vd_all_videos.trim() || val==0) return ;
    this.playerService.Seek.emit(this.FormatToSeconds(val));

  }

  private FormatToSeconds(time){

    if(time==0) return 0;
    if(typeof(time)=="number") return time;
    let stamp = time.split(":");

    return Number(stamp[0]*3600) + Number(stamp[1]*60) + Number(stamp[2]);

  }

  public FileClicked(from, file){

    if(from == "td"){

      if(file.stack_url && file.stack_url != null){

        let path = environment.baseUrl+"/app/view_document"+ file.stack_url.substring(file.stack_url.lastIndexOf("/"), file.stack_url.length);
        window.open(path, "_blank");

      }else{

        this.DownloadFile(file);

      }
    }else{
      this.DownloadFile(file);
    }

  }

  private DownloadFile(file){

    this.mainService.DownloadFile(file.id);

  }

  public InitiateDeleteResource(template: TemplateRef<any>, file){

    this.DeletableFile = file;
    this.modalRef = this.modalService.show(template, {class:"modal-md"});


  }

  public GetNewFiles(obj){
    if(obj.from=='resources'){

      // this.AddTimeStampToResources(obj.files); TODO- this will not update any file yet, but filestack is working fine

      // this.staticFiles = this.staticFiles.concat(obj.files);

    }

  }
}
