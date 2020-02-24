import { Injectable } from '@angular/core';
import { HeaderService } from '@projectModules/app/services';
import { WorkspaceHttpService } from './workspace-http.service';
@Injectable()
export class PermissionsService {

  
 
  constructor(private headerService: HeaderService, private workService: WorkspaceHttpService) { }
  
}
