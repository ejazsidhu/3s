import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { MainService } from "@videoDetail/services";
import { HeaderService } from "@projectModules/app/services";
import * as _ from "underscore";
import { Subscription } from 'rxjs';

@Component({
  selector: 'rubrics',
  templateUrl: './rubrics.component.html',
  styleUrls: ['./rubrics.component.css']
})
export class RubricsComponent implements OnInit, OnDestroy ,OnChanges{

	@Input('data') rubrics;
  @Input('from') from;
  @Input('previewMode') previewMode;
  @Input() term;
  @Input('isCreater') isCreater;
  @Output() RubricClicked:EventEmitter<any> = new EventEmitter<any>();
  public currentRubric: any = {};
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  constructor(private mainService:MainService , private headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }

  ngOnInit() {
    if(this.rubrics){
      if (!this.mainService.isEditComent){
        this.rubrics.account_tag_type_0.forEach((r)=>{r.selected=false;});
        this.mainService.isEditComent = false;
      }
      this.mainService.ResetRubrics.subscribe((data)=>{
        this.rubrics.account_tag_type_0.forEach((r)=>{r.selected=false;});

      });
    }

  this.header_data = this.headerService.getStaticHeaderData();
  // this.translation = this.header_data.language_translation; // changed to observable stream

    
  }

  ngOnChanges(changes){
    if(changes.isCreater)
    this.isCreater=changes.isCreater.currentValue;
    else
    this.isCreater=true;
  }

  public getClass(rubric){

  	let classes = ["level_1", "level_2", "level_3", "level_4"];

     let plus = (this.from && this.from=='tab' && this.currentRubric.account_tag_id == rubric.account_tag_id)?" ActiveRubric":"";

     let tabClass = (this.from && this.from=='tab')? " paddedRubric":"";

  	return classes[rubric.standard_level-1]+plus+tabClass;

  }

  public RubricChecked(rubric){

  	this.mainService.UpdateRubricToComment(rubric);

  }

  public BroadcastClick(rubric){

    if(this.from && this.from=='tab'){

      this.currentRubric = rubric;
      this.RubricClicked.emit(rubric);
    }

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
