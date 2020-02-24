import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';
@Component({
  selector: 'folder-thumb-view',
  templateUrl: './folder-thumb-view.component.html',
  styleUrls: ['./folder-thumb-view.component.css']
})
export class FolderThumbViewComponent implements OnInit, OnDestroy {

	@Input() data;
  @Input() block_move;
	@Input() isExpanded;
	@Output() OnEdit = new EventEmitter();
  @Output() OnDelete = new EventEmitter();
  @Output() OnMove = new EventEmitter();
  public isDropdownOpen:boolean;
  public header_data;
  public translation: any = {};
  private subscription: Subscription;
  constructor(private headerService:HeaderService) { 
    this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
  }

  ngOnInit() {
    this.isDropdownOpen = false;
    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
  }

    public isOpen(flag){

    this.isDropdownOpen = flag;
    if(flag){
      this.data.mouseEntered = true;
    }

  }

 public EditFolder(id){
     
    this.OnEdit.emit(id);

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
