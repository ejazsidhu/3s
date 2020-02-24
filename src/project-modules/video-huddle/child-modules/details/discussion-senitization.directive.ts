import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDiscussionSenitization]'
})
export class DiscussionSenitizationDirective {

  constructor(Element: ElementRef) {
    console.log(Element);
    Element.nativeElement.innerHtml = "Text is changed by changeText Directive. ";
 }

}
