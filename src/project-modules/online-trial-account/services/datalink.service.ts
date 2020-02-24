import { Injectable } from "@angular/core";

@Injectable()
export class DatalinkService {
  private dataLayer: any = (window as any).dataLayer;

  constructor() {}

  public SetProperty(obj) {
    if (obj.event === void 0) return;

    let index = this.ArrayhasOwnProperty(this.dataLayer, obj.event);

    if (obj.event === "reg_confirm") {
      this.dataLayer.splice(index, 1);
      index = -1;
    }

    if (index == -1) {
      this.dataLayer.push(obj);
    } else {
      this.dataLayer[index] = obj;
    }

    // if(!this.ArrayhasOwnProperty(this.dataLayer, obj.event)){

    // 	this.dataLayer.push(obj);

    // }
  }

  private ArrayhasOwnProperty(arr, toCompare) {
    if (!Array.isArray(arr)) return -1;

    let index: number = -1;

    for (let i of arr) {
      if (
        i &&
        typeof i.hasOwnProperty == "function" &&
        i.hasOwnProperty("event")
      ) {
        if (i.event === toCompare) {
          index = arr.indexOf(i);
          break;
        }
      }
    }

    return index;
  }
}
