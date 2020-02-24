import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { HeaderService } from '../../dashboard/app/header.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PublicAuthGuard implements CanActivate {

  constructor(private headerService:HeaderService,private toastr:ToastrService){}
  canActivate():  boolean {
      let session=true;//this.headerService.getStaticHeaderData();
      if(session)
    return false;
    else{
      this.toastr.info('test infor for suth guard')
      return true;

    }
  }
  
}
