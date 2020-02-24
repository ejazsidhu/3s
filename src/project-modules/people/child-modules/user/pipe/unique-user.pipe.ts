import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash'; 
@Pipe({
  name: 'uniqueUser'
})
export class UniqueUserPipe implements PipeTransform {

  transform(value: any): any{
    if(value!== undefined && value!== null){
        return _.uniqBy(value, 'id');
    }
    return value;
}

}
