import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  public allMembers;
  constructor() { }

  setAllMembers(members){
    this.allMembers=members;
  }
  
  getAllMembers(){
    return this.allMembers;
  }
  
}
