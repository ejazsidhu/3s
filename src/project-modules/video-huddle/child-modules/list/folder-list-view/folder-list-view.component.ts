import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';
@Component({
  selector: 'folder-list-view',
  templateUrl: './folder-list-view.component.html',
  styleUrls: ['./folder-list-view.component.css']
})
export class FolderListViewComponent implements OnInit, OnDestroy {

	@Input() data;
  @Input() block_move;
  @Output() OnEdit = new EventEmitter();
  @Output() OnMove = new EventEmitter();
  @Output() OnDelete = new EventEmitter();
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
	public getHuddlesCount(stats){

		return Number(stats.collaboration) + Number(stats.coaching) + Number(stats.assessment);

	}

  constructor(private headerService:HeaderService) {
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
   }

  ngOnInit() {
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

  public EditFolder(id){

    this.OnEdit.emit(id);

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }


}
