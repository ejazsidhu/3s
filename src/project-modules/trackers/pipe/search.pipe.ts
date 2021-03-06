import { Pipe, PipeTransform } from '@angular/core';
import * as _ from "underscore";

@Pipe({
  name: 'search',
  pure: true, //turning it false will reduce the performance but give you more strength
})
export class SearchPipe implements PipeTransform {

  transform(items, term = '', keys?, huddleType?, sortBy?, dirty?): any {

    if (!items)
      return items;
    return this.filter(items, term, keys ? keys.split(",") : false, huddleType, sortBy, dirty);
  }


  private filter(items, term, keys?, huddleType?, sortBy?, dirty?) {

    const toCompare = term.toLowerCase();

    let filtered_items = items.filter(function (item) {

      let types = ["all", "collaboration", "coaching", "assessment"];

      for (let property in item) {
        if (keys && keys.indexOf(property) < 0) {
          continue;
        }
        if (item[property] === null) {
          continue;
        }

        if (item[property].toString().toLowerCase().includes(toCompare)) {

          if (huddleType > 0) {
            return true && item.type && item.type == types[huddleType];
          } else {
            return true;
          }
        }
      }
      return false;
    });


    if (sortBy >= 0) {

      let enums = {
        "0": "title",
        "1": "created_by_name",
        "2": "created_date",
        "3": "last_edit_date"
      };

      // let items =  _.sortBy(filtered_items, (item)=>{

      //   if(Number(sortBy) == 0 || Number(sortBy) == 1){

      //     if(!item.created_by_name) item.created_by_name = item.created_by;

      //     return item[enums[sortBy]].toLowerCase();

      //   }else{
      //     return new Date(item[enums[sortBy]]);
      //   }

      // });

      // let items = filtered_items;

      if (Number(sortBy) == 0 || Number(sortBy) == 1) {

        filtered_items.sort(function (a, b) {

          if (!a.created_by_name) a.created_by_name = a.created_by;
          if (!b.created_by_name) b.created_by_name = b.created_by;

          return a[enums[sortBy]].trim().localeCompare(b[enums[sortBy]].trim());
        })

        return filtered_items;

      }

      if (sortBy == 2 || sortBy == 3) {
        return filtered_items.sort((a, b) => {

          return new Date(a[enums[sortBy]]).getTime() - new Date(b[enums[sortBy]]).getTime();

        }).reverse();
      } else {
        return filtered_items;
      }

    } else {

      return filtered_items;

    }


  }

}
