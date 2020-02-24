import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-performance-level',
  templateUrl: './performance-level.component.html',
  styleUrls: ['./performance-level.component.css']
})
export class PerformanceLevelComponent implements OnInit {

  @Input('data') data:any;
  @Input('params') params:any;
  public permissions:any={};

  constructor() { }

  ngOnInit() {
    this.permissions.framework_selected_for_video = this.data.framework_selected_for_video;
  }

}
