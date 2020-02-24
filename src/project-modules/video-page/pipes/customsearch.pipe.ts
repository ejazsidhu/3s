import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class CustomsearchPipe implements PipeTransform {

  transform(items,term, keys?): any {
    if(items && items.length>0){
      this.reformat(items);
    }
   if (!term || !items)
            return items;
        return this.filter(items, term, keys?keys.split(","):false);
  }


  private reformat(items){

  items.forEach((item)=>{
    for(let property in item){

          if(item[property+"_original"]){
            item[property] = item[property+"_original"];
          }

        }
  });

    

  }

  private filter(items,term, keys?){
    
        const toCompare = term.toLowerCase();
        let that = this;
        return items.filter(function (item) {
            for (let property in item) {
              if(keys && keys.indexOf(property) < 0){
                continue;
              }
                if (item[property] === null) {
                    continue;
                }
                if(!item[property+"_original"]){
                  item[property+"_original"] = item[property];
                }
                if (item[property].toString().toLowerCase().includes(toCompare)) {
                   let regex = new RegExp('('+toCompare+')', 'ig');
                   // item[property] = item[property].replace(regex, '<span class="rubric_match_found">'+toCompare+'</span>');
                   item[property] = item[property].replace(regex, '<span class="rubric_match_found">$1</span>');
                    // item[property] = item[property].replace(toCompare, "<span class='rubric_match_found'>"+toCompare+"</span>");
                    
                    // that.IntelligentReplace(item[property], toCompare);
                    return true;
                }
            }
            return false;
        });
    

  }


  private IntelligentReplace(str, what){

    let indices = this.getIndicesOf(what, str, false);

    if(indices.length==0) return;

    for(let i=0;i<indices.length;i++){

      str[indices[i]] = "<span class='rubric_match_found'>"+str[indices[i]]+"</span>";

    }

  }

  private getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

}
