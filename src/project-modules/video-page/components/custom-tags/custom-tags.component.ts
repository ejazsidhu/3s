import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { MainService } from "@videoPage/services";

@Component({
  selector: 'custom-tags',
  templateUrl: './custom-tags.component.html',
  styleUrls: ['./custom-tags.component.css']
})
export class CustomTagsComponent implements OnInit {

	@Output() Tags = new EventEmitter<any>();
  @Input() predefinedTags;
  public tags;
	@ViewChild("tagInput", {static: true}) TagInput;
	public newTag;

  constructor(private mainService:MainService) { }

  ngOnInit() {
  	this.newTag = "";
  	this.tags = [];
  	this.mainService.CustomTagFocus.subscribe((d)=>{

  		this.TagInput.nativeElement.focus();

  	});

    this.mainService.ResetTags.subscribe((t)=>{

      this.tags = [];
      this.Tags.emit(this.tags);

    });

    setInterval(()=>{

      if(this.predefinedTags)
        this.tags = this.predefinedTags;

    }, 2000);

  }

  public GenerateTag(){

    if(this.newTag=="") return;
      this.tags.push({text:this.newTag, id:this.tags.length+1});
      this.newTag = ""; 
      this.Tags.emit(this.tags);

  }

  public TagChanged(ev){
  	if(ev.keyCode==13){

  		if(this.newTag=="") return;
  		this.tags.push({text:this.newTag, id:this.tags.length+1});
  		this.newTag = ""; 
      this.Tags.emit(this.tags);
  	}

  	if(ev.keyCode == 8 && ev.ctrlKey){

  		this.removeTag(this.tags[this.tags.length-1]);
      this.Tags.emit(this.tags);

  	}
  }

  public removeTag(tag){

  	this.tags = this.tags.filter((t)=>{ return t.id!=tag.id; });
    this.Tags.emit(this.tags);
  }

}
