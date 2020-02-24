import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SafeHtmlPipe } from './pipes/safe-html.pipe';

@NgModule({
  declarations: [SafeHtmlPipe],
  exports:[SafeHtmlPipe],
  imports: [
    CommonModule,
  ],
  providers: []
})
export class SharedModule { }
