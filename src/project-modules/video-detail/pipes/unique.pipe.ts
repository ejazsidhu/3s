import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash'; 
@Pipe({
  name: 'unique'
})
export class UniquePipe implements PipeTransform {

  transform(value: any): any{
    if(value!== undefined && value!== null){
        return _.uniqBy(value, 'id');
    }
    return value;
}

}
