import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MainService } from "../../services";
import * as _ from "underscore";

@Component({
  selector: 'rubrics',
  templateUrl: './rubrics.component.html',
  styleUrls: ['./rubrics.component.css']
})
export class RubricsComponent implements OnInit {

	@Input('data') rubrics;
  @Input('from') from;
  @Input('previewMode') previewMode;
  @Input() term;
  @Output() RubricClicked:EventEmitter<any> = new EventEmitter<any>();
  public currentRubric: any = {};
  constructor(private mainService:MainService) {

  }

  ngOnInit() {
    if(this.rubrics)
    this.mainService.ResetRubrics.subscribe((data)=>{

      this.rubrics.account_tag_type_0.forEach((r)=>{r.selected=false;});

    });

    
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

}
