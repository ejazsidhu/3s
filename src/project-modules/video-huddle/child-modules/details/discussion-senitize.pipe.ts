import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discussionSenitize'
})
export class DiscussionSenitizePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
